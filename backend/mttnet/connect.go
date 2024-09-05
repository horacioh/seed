package mttnet

import (
	"context"
	"errors"
	"fmt"
	"math"
	p2p "seed/backend/genproto/p2p/v1alpha"
	"seed/backend/util/dqb"
	"strings"

	"time"

	"seed/backend/util/sqlite"
	"seed/backend/util/sqlite/sqlitex"

	"github.com/libp2p/go-libp2p/core/event"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/peerstore"
	"github.com/libp2p/go-libp2p/core/protocol"
	"github.com/libp2p/go-libp2p/p2p/net/swarm"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/sethvargo/go-retry"
	"go.uber.org/zap"
)

const ConnectTimeout = time.Second * 15

var (
	mConnectsInFlight = promauto.NewGauge(prometheus.GaugeOpts{
		Name: "seed_connects_in_flight",
		Help: "Number of connection attempts in progress.",
	})
)

// Increasing the default temporary TTL for peerstore, to ensure that we
// don't forget the addresses between sync intervals.
func init() {
	peerstore.TempAddrTTL = 5 * time.Minute
}

// Connect to a peer using provided addr info.
func (n *Node) Connect(ctx context.Context, info peer.AddrInfo) error {
	return n.connect(ctx, info, false)
}

// ForceConnect is like Connext, but it ignores any backoffs that the network might have.
func (n *Node) ForceConnect(ctx context.Context, info peer.AddrInfo) error {
	return n.connect(ctx, info, true)
}

var qGetPeer = dqb.Str(`
	SELECT 
		pid
	FROM peers WHERE pid =:pid LIMIT 1;
`)

func (n *Node) connect(ctx context.Context, info peer.AddrInfo, force bool) (err error) {
	mConnectsInFlight.Inc()
	defer mConnectsInFlight.Dec()

	if info.ID == "" {
		return fmt.Errorf("must specify peer ID to connect")
	}

	isConnected := n.p2p.Host.Network().Connectedness(info.ID) == network.Connected
	conn, release, err := n.db.Conn(ctx)
	if err != nil {
		return err
	}
	didHandshake := false
	if err = sqlitex.Exec(conn, qGetPeer(), func(stmt *sqlite.Stmt) error {
		pidStr := stmt.ColumnText(0)
		pid, err := peer.Decode(pidStr)
		if err != nil {
			return err
		}
		if pid.String() != info.ID.String() {
			return fmt.Errorf("found PID does not equal provided PID")
		}
		didHandshake = true
		return nil
	}, info.ID); err != nil {
		release()
		return err
	}
	release()
	if isConnected && didHandshake {
		return nil
	}

	log := n.log.With(zap.String("peer", info.ID.String()))
	ctx, cancel := context.WithTimeout(ctx, ConnectTimeout)
	defer cancel()

	log.Debug("ConnectStarted")
	defer func() {
		log.Debug("ConnectFinished", zap.Error(err), zap.String("Info", info.String()))
	}()

	// Since we're explicitly connecting to a peer, we want to clear any backoffs
	// that the network might have at the moment.
	if force {
		sw, ok := n.p2p.Host.Network().(*swarm.Swarm)
		if ok {
			sw.Backoff().Clear(info.ID)
		}
	}
	if err := n.p2p.Host.Connect(ctx, info); err != nil {
		return fmt.Errorf("failed to connect to peer %s: %w", info.ID, err)
	}
	if err := n.CheckHyperMediaProtocolVersion(ctx, info.ID, n.protocol.version); err != nil {
		return err
	}
	// TODO(juligasa): If transient then return
	// if transient {
	// 	return nil
	// }
	addrsStr := AddrInfoToStrings(info)
	if len(addrsStr) == 0 {
		return fmt.Errorf("Peer with no addresses")
	}
	c, err := n.client.Dial(ctx, info.ID)
	if err != nil {
		return fmt.Errorf("Could not get p2p client: %w", err)
	}
	res, err := c.ListPeers(ctx, &p2p.ListPeersRequest{PageSize: math.MaxInt32})
	if err != nil {
		return fmt.Errorf("Could not get list of peers: %w", err)
	}
	conn, release, err = n.db.Conn(ctx)
	if err != nil {
		return err
	}
	defer release()
	initialAddrs := strings.ReplaceAll(strings.Join(addrsStr, ","), " ", "")
	if len(res.Peers) > 0 {
		vals := []interface{}{}
		sqlStr := "INSERT OR REPLACE INTO peers (pid, addresses) VALUES "
		if initialAddrs != "" {
			sqlStr += "(?, ?),"
			vals = append(vals, info.ID.String(), initialAddrs)
		}

		for _, peer := range res.Peers {
			if len(peer.Addrs) > 0 {
				sqlStr += "(?, ?),"
				vals = append(vals, peer.Id, strings.Join(peer.Addrs, ","))
			}
		}
		if len(vals) != 0 {
			sqlStr = sqlStr[0 : len(sqlStr)-1]
			return sqlitex.Exec(conn, sqlStr, nil, vals...)
		}
		return fmt.Errorf("Peer with blank addresses")
	}
	if initialAddrs != "" {
		return sqlitex.Exec(conn, "INSERT OR REPLACE INTO peers (pid, addresses) VALUES (?, ?);", nil, info.ID.String(), initialAddrs)
	}
	return nil
}

func (n *Node) defaultConnectionCallback(_ context.Context, event event.EvtPeerConnectednessChanged) {
	n.log.Debug(event.Peer.String(), zap.String("Connectedness", event.Connectedness.String()))
}

func (n *Node) defaultIdentificationCallback(ctx context.Context, event event.EvtPeerIdentificationCompleted) {
	connectedness := n.Libp2p().Network().Connectedness(event.Peer)
	n.log.Debug(event.Peer.String(), zap.String("Connectedness", connectedness.String()))

	if err := n.CheckHyperMediaProtocolVersion(ctx, event.Peer, n.protocol.version); err != nil {
		n.log.Debug("Peer connected to use and we failed to check the protocol", zap.Error(err))
	}

	conn, release, err := n.db.Conn(ctx)
	if err != nil {
		n.log.Warn("Could not get a connection", zap.Error(err))
	}
	defer release()

	var addrsString []string
	for _, addrs := range event.ListenAddrs {
		addrsString = append(addrsString, strings.ReplaceAll(addrs.String(), "/p2p/"+event.Peer.String(), "")+"/p2p/"+event.Peer.String())
	}
	if err = sqlitex.Exec(conn, "INSERT OR REPLACE INTO peers (pid, addresses) VALUES (?, ?);", nil, event.Peer.String(), strings.ReplaceAll(strings.Join(addrsString, ","), " ", "")); err != nil {
		n.log.Warn("Could not store new connected peer addresses ", zap.Error(err))
	} else {
		n.log.Debug("New peer connected to us and we saved their addresses")
	}
}

func (n *Node) CheckHyperMediaProtocolVersion(ctx context.Context, pid peer.ID, desiredVersion string) (err error) {
	ctx, cancel := context.WithTimeout(ctx, time.Minute)
	defer cancel()

	var protos []protocol.ID
	if err := retry.Exponential(ctx, 50*time.Millisecond, func(ctx context.Context) error {
		protos, err = n.p2p.Peerstore().GetProtocols(pid)
		if err != nil {
			return fmt.Errorf("failed to check Hyper Media protocol version: %w", err)
		}

		if len(protos) > 0 {
			return nil
		}

		return fmt.Errorf("peer %s doesn't support any protocols", pid.String())
	}); err != nil {
		return err
	}

	// Eventually we'd need to implement some compatibility checks between different protocol versions.
	var isSeed bool
	for _, p := range protos {
		version := strings.TrimPrefix(string(p), n.protocol.prefix)
		if version == string(p) {
			continue
		}
		isSeed = true
		if version == desiredVersion {
			return nil
		}
	}

	if isSeed {
		return fmt.Errorf("peer with incompatible Seed protocol version")
	}

	return fmt.Errorf("not a Seed peer")
}

var errDialSelf = errors.New("can't dial self")

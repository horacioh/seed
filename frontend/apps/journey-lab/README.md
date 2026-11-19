# Seed Journey Lab

A separate, deterministic XState v5 exploration app. The catalogue is extensible; **only vault account creation is
executable** in this pilot. Production workflows are unchanged.

From the repository root:

```sh
direnv exec . pnpm --filter @shm/journey-lab dev
direnv exec . pnpm --filter @shm/journey-lab test
direnv exec . pnpm --filter @shm/journey-lab build
```

The simulator has no live vault/network adapters. It uses outcome events, logical time and a seed for repeatable
schedules, not real passwords, codes or keys. Expand **Inspect executable transitions** for the actual machine's
event/target/guard/action definitions. Phase links pin the audited production source; the other nine catalogue entries
are not yet executable. Web and desktop comparison deliberately marks unmodeled behavior rather than implying parity.

## Disposable API/storage verification

Prerequisites: the repository toolchain, pnpm workspace dependencies, and the vault's separate Bun workspace
dependencies. Node 22's built-in SQLite API is used (it currently prints an experimental warning).

```sh
direnv exec . plz build //backend:seed-daemon
direnv exec . pnpm --filter @shm/journey-lab verify:local
# Optional destination (parent must already exist):
direnv exec . pnpm --filter @shm/journey-lab verify:local --output /tmp/vault-api.trace.json
```

The runner refuses changed production vault/backend/SDK source relative to the audited revision. It creates its own
database, home, file keystore and daemon data, allocates unused ports without terminating listeners, disables P2P
connections and payments, and does not inherit production environment, SMTP, relay, notification or analytics settings.
Loopback API requests are bounded; only owned children and directories are removed on completion/interruption. Ports are
released before processes bind: a competing process may win a bind, in which case verification fails safely rather than
killing it.

It exercises the real vault HTTP API, SDK crypto and daemon with disposable identities. Checks include empty storage,
email binding, wrong code, cooldown, expiry, attempt exhaustion, encrypted vault persistence, wrapped credentials,
optimistic conflicts, profile signature and indexed query, fresh password unlock, recovery-secret unlock,
foreign-account denial, and a rejected corrupt blob after encrypted persistence. Expiry fixtures change only the
disposable database's challenge time. No production clocks are changed. Recovery-secret API checks do **not** prove
mnemonic entry or a browser flow.

The exported local trace projects observed protocol events onto the executable model; actor/state snapshots are **model
interpretations**, not production runtime instrumentation. Projection stops at the unverified Contact phase instead of
fabricating Contact failure or notification delivery to advance the browser model. Fresh password/recovery unlock
results remain separate API observations, not invented browser transitions. Development-console code capture does not
produce a mail-delivered event. Independent assertion results name their observing layer. API success is not browser
evidence. The pilot does not prove passkey PRF, desktop creation, remote-peer availability, default-site Contact
creation, or notification delivery. These remain unsupported/unobserved, not green checks.

Raw process output and secrets stay private and are never written to traces or printed. The strict allowlisted export
contains only events, resource aliases and check outcomes. Output defaults to ignored `vault-api.trace.json`, created
with owner-only permissions. Failure traces retain completed observations and a nonzero exit code; a partial file is not
proof of completion.

## Evidence and trust

Import a trace in the Evidence tab. Unknown fields, values, source revisions, invalid ordering and files over 1 MB are
rejected. Imports are always **untrusted claims**, even if they say `local-verification` or claim passed assertions.
Temporal checks do not authenticate the producer. A claimed indexed/remote milestone in a local trace additionally
requires the corresponding independent daemon observation; inserting a success event alone is insufficient. A signed
blob, accepted storage request, indexed query and remote peer read are distinct milestones.

Simulation and real verification are deliberately separate. Host only the static build; never expose the local verifier,
its temporary data or a live vault/daemon alongside a hosted simulation. The `verification` directory is not imported
into the browser bundle.

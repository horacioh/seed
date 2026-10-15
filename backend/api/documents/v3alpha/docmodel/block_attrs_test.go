package docmodel

import (
	"os"
	"path/filepath"
	"reflect"
	"testing"
	"time"

	"seed/backend/blob"
	"seed/backend/core/coretest"
	documents "seed/backend/genproto/documents/v3alpha"
	"seed/backend/util/cclock"
	"seed/backend/util/must"

	"github.com/stretchr/testify/require"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/types/known/structpb"
)

var blockAttrsTestTime = time.Date(2024, 2, 1, 0, 0, 0, 0, time.UTC)

func TestBlockAttributesBackwardCompatibility(t *testing.T) {
	alice := coretest.NewTester("alice").Account
	doc := must.Do2(New("hm://alice.example/doc", cclock.New()))

	attrs1, err := structpb.NewStruct(map[string]any{
		"style":  map[string]any{"color": "blue", "weight": int64(700)},
		"custom": true,
	})
	require.NoError(t, err)
	attrs2, err := structpb.NewStruct(map[string]any{
		"caption": "Second",
		"nested":  map[string]any{"enabled": true},
	})
	require.NoError(t, err)

	must.Do(doc.MoveBlock("p1", "", ""))
	must.Do(doc.ReplaceBlock(&documents.Block{
		Id:         "p1",
		Type:       "Paragraph",
		Text:       "original",
		Attributes: attrs1,
		Annotations: []*documents.Annotation{{
			Type:   "Link",
			Link:   "hm://alice.example/target",
			Starts: []int32{0},
			Ends:   []int32{4},
		}},
	}))
	must.Do(doc.MoveBlock("p2", "", "p1"))
	must.Do(doc.ReplaceBlock(&documents.Block{
		Id:         "p2",
		Type:       "Paragraph",
		Text:       "second",
		Attributes: attrs2,
	}))
	must.Do(doc.MoveBlock("deleted", "", "p2"))
	must.Do(doc.ReplaceBlock(&documents.Block{Id: "deleted", Type: "Paragraph", Text: "gone"}))
	must.Do(doc.SetAttribute("", []string{"theme", "accent"}, "violet"))
	must.Do(doc.SetAttribute("", []string{"enabled"}, true))
	first := must.Do2(doc.SignChangeAt(alice, time.Date(2024, 1, 1, 0, 0, 0, 0, time.UTC)))

	doc = must.Do2(New("hm://alice.example/doc", cclock.New()))
	must.Do(doc.ApplyChange(first.CID, first.Decoded))
	must.Do(doc.MoveBlock("p2", "", ""))
	must.Do(doc.DeleteBlock("deleted"))
	must.Do(doc.SetAttribute("", []string{"theme", "accent"}, "green"))
	second := must.Do2(doc.SignChangeAt(alice, time.Date(2024, 1, 1, 0, 1, 0, 0, time.UTC)))

	doc = must.Do2(New("hm://alice.example/doc", cclock.New()))
	must.Do(doc.ApplyChange(first.CID, first.Decoded))
	must.Do(doc.ApplyChange(second.CID, second.Decoded))
	hydrated, err := doc.Hydrate(t.Context())
	require.NoError(t, err)
	got, err := (protojson.MarshalOptions{Indent: "  "}).Marshal(hydrated)
	require.NoError(t, err)
	got = append(got, '\n')

	goldenPath := filepath.Join("testdata", "block-attrs-backward-compat.json")
	if os.Getenv("UPDATE_GOLDEN") == "1" {
		require.NoError(t, os.WriteFile(goldenPath, got, 0o600))
	}

	want, err := os.ReadFile(goldenPath)
	require.NoError(t, err)
	require.JSONEq(t, string(want), string(got))
}

func TestConcurrentBlockStyleAndTextEdits(t *testing.T) {
	base := blockAttrsBase(t, map[string]any{
		"style": map[string]any{"color": "black"},
		"keep":  "yes",
	})
	styleChange := blockAttrsBranch(t, base, "styler", blockAttrsTestTime.Add(3*time.Minute), func(doc *Document) {
		must.Do(doc.SetAttribute("block", []string{"style", "color"}, "violet"))
	})
	textChange := blockAttrsBranch(t, base, "writer", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
		must.Do(doc.ReplaceBlock(testBlock(t, "block", "edited", map[string]any{
			"style": map[string]any{"color": "black"},
			"keep":  "yes",
		})))
	})

	assertSameHydratedBlocks(t, base, styleChange, textChange)
	doc := blockAttrsLoad(t, base, styleChange, textChange)
	blk := testHydratedBlock(t, doc, "block")
	require.Equal(t, "edited", blk.Text)
	require.Equal(t, map[string]any{"color": "violet"}, blk.Attributes.AsMap()["style"])
	require.Equal(t, "yes", blk.Attributes.AsMap()["keep"])
}

func TestConcurrentBlockAttributeKeys(t *testing.T) {
	base := blockAttrsBase(t, map[string]any{"style": map[string]any{"color": "black"}})
	color := blockAttrsBranch(t, base, "color", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
		must.Do(doc.SetAttribute("block", []string{"style", "color"}, "blue"))
	})
	weight := blockAttrsBranch(t, base, "weight", blockAttrsTestTime.Add(3*time.Minute), func(doc *Document) {
		must.Do(doc.SetAttribute("block", []string{"style", "weight"}, int64(700)))
	})

	assertSameHydratedBlocks(t, base, color, weight)
	attrs := testHydratedBlock(t, blockAttrsLoad(t, base, color, weight), "block").Attributes.AsMap()
	require.Equal(t, map[string]any{"color": "blue", "weight": float64(700)}, attrs["style"])
}

func TestConcurrentSameBlockAttributeUsesNewestOpID(t *testing.T) {
	base := blockAttrsBase(t, nil)
	older := blockAttrsBranch(t, base, "older", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
		must.Do(doc.SetAttribute("block", []string{"style", "color"}, "blue"))
	})
	newer := blockAttrsBranch(t, base, "newer", blockAttrsTestTime.Add(3*time.Minute), func(doc *Document) {
		must.Do(doc.SetAttribute("block", []string{"style", "color"}, "red"))
	})

	assertSameHydratedBlocks(t, base, older, newer)
	attrs := testHydratedBlock(t, blockAttrsLoad(t, base, older, newer), "block").Attributes.AsMap()
	require.Equal(t, "red", attrs["style"].(map[string]any)["color"])
}

func TestReplaceBlockAndBlockAttributesResolveByOpID(t *testing.T) {
	t.Run("causal replacement deletes omitted attributes", func(t *testing.T) {
		base := blockAttrsBase(t, map[string]any{"tone": "base"})
		attribute := blockAttrsBranch(t, base, "writer", blockAttrsTestTime.Add(time.Minute), func(doc *Document) {
			must.Do(doc.SetAttribute("block", []string{"tone"}, "updated"))
		})
		replacement := blockAttrsBranchFrom(t, "writer", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
			must.Do(doc.ReplaceBlock(testBlock(t, "block", "replaced", map[string]any{"other": true})))
		}, base, attribute)
		blk := testHydratedBlock(t, blockAttrsLoad(t, base, attribute, replacement), "block")
		_, exists := blk.Attributes.AsMap()["tone"]
		require.False(t, exists)
	})

	t.Run("newer block attribute wins over concurrent replacement", func(t *testing.T) {
		base := blockAttrsBase(t, map[string]any{"tone": "base"})
		attribute := blockAttrsBranch(t, base, "attribute", blockAttrsTestTime.Add(3*time.Minute), func(doc *Document) {
			must.Do(doc.SetAttribute("block", []string{"tone"}, "attribute"))
		})
		replacement := blockAttrsBranch(t, base, "replacement", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
			must.Do(doc.ReplaceBlock(testBlock(t, "block", "replaced", map[string]any{"tone": "replacement"})))
		})
		assertSameHydratedBlocks(t, base, attribute, replacement)
		blk := testHydratedBlock(t, blockAttrsLoad(t, base, replacement, attribute), "block")
		require.Equal(t, "attribute", blk.Attributes.AsMap()["tone"])
	})

	t.Run("newer replacement value wins over concurrent attribute", func(t *testing.T) {
		base := blockAttrsBase(t, map[string]any{"tone": "base"})
		attribute := blockAttrsBranch(t, base, "attribute", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
			must.Do(doc.SetAttribute("block", []string{"tone"}, "attribute"))
		})
		replacement := blockAttrsBranch(t, base, "replacement", blockAttrsTestTime.Add(3*time.Minute), func(doc *Document) {
			must.Do(doc.ReplaceBlock(testBlock(t, "block", "replaced", map[string]any{"tone": "replacement"})))
		})
		assertSameHydratedBlocks(t, base, attribute, replacement)
		blk := testHydratedBlock(t, blockAttrsLoad(t, base, attribute, replacement), "block")
		require.Equal(t, "replacement", blk.Attributes.AsMap()["tone"])
	})

	t.Run("newer replacement deletion wins over concurrent attribute", func(t *testing.T) {
		base := blockAttrsBase(t, map[string]any{"tone": "base"})
		attribute := blockAttrsBranch(t, base, "attribute", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
			must.Do(doc.SetAttribute("block", []string{"tone"}, "attribute"))
		})
		replacement := blockAttrsBranch(t, base, "replacement", blockAttrsTestTime.Add(3*time.Minute), func(doc *Document) {
			must.Do(doc.ReplaceBlock(testBlock(t, "block", "replaced", nil)))
		})
		assertSameHydratedBlocks(t, base, attribute, replacement)
		blk := testHydratedBlock(t, blockAttrsLoad(t, base, replacement, attribute), "block")
		_, exists := blk.Attributes.AsMap()["tone"]
		require.False(t, exists)
	})
}

func TestBlockAttributeStructuralReplacementConverges(t *testing.T) {
	for _, tc := range []struct {
		name       string
		parentTime time.Duration
		childTime  time.Duration
		want       any
	}{
		{name: "newer parent", parentTime: 3 * time.Minute, childTime: 2 * time.Minute, want: "flat"},
		{name: "newer child", parentTime: 2 * time.Minute, childTime: 3 * time.Minute, want: map[string]any{"color": "red"}},
	} {
		t.Run(tc.name, func(t *testing.T) {
			base := blockAttrsBase(t, nil)
			parent := blockAttrsBranch(t, base, "parent", blockAttrsTestTime.Add(tc.parentTime), func(doc *Document) {
				must.Do(doc.SetAttribute("block", []string{"style"}, "flat"))
			})
			child := blockAttrsBranch(t, base, "child", blockAttrsTestTime.Add(tc.childTime), func(doc *Document) {
				must.Do(doc.SetAttribute("block", []string{"style", "color"}, "red"))
			})
			assertSameHydratedBlocks(t, base, parent, child)
			attrs := testHydratedBlock(t, blockAttrsLoad(t, base, child, parent), "block").Attributes.AsMap()
			require.Equal(t, tc.want, attrs["style"])
		})
	}
}

func TestBlockAttributeWithConcurrentDeleteAndMove(t *testing.T) {
	t.Run("deleted block remains deleted", func(t *testing.T) {
		base := blockAttrsBase(t, nil)
		attribute := blockAttrsBranch(t, base, "attribute", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
			must.Do(doc.SetAttribute("block", []string{"style"}, "red"))
		})
		deletion := blockAttrsBranch(t, base, "delete", blockAttrsTestTime.Add(3*time.Minute), func(doc *Document) {
			must.Do(doc.DeleteBlock("block"))
		})
		assertSameHydratedBlocks(t, base, attribute, deletion)
		doc := blockAttrsLoad(t, base, deletion, attribute)
		hydrated, err := doc.Hydrate(t.Context())
		require.NoError(t, err)
		require.Nil(t, findHydratedBlock(hydrated, "block"))
	})

	t.Run("moved block retains its attribute", func(t *testing.T) {
		base := blockAttrsMultiBlockBase(t)
		attribute := blockAttrsBranch(t, base, "attribute", blockAttrsTestTime.Add(3*time.Minute), func(doc *Document) {
			must.Do(doc.SetAttribute("block", []string{"style"}, "red"))
		})
		movement := blockAttrsBranch(t, base, "move", blockAttrsTestTime.Add(2*time.Minute), func(doc *Document) {
			must.Do(doc.MoveBlock("block", "parent", ""))
		})
		assertSameHydratedBlocks(t, base, attribute, movement)
		blk := testHydratedBlock(t, blockAttrsLoad(t, base, movement, attribute), "block")
		require.Equal(t, "red", blk.Attributes.AsMap()["style"])
	})
}

func TestBlockAttributeWriterCleanup(t *testing.T) {
	base := blockAttrsBase(t, map[string]any{"style": map[string]any{"color": "black"}})

	t.Run("attribute edits are visible in the working block", func(t *testing.T) {
		doc := blockAttrsLoad(t, base)
		must.Do(doc.SetAttribute("block", []string{"style", "color"}, "red"))

		_, blk, ok := doc.effectiveBlock("block")
		require.True(t, ok)
		require.Equal(t, "red", blk.Attributes()["style"].(map[string]any)["color"])
	})

	t.Run("attribute-only edit emits one block-scoped SetAttributes", func(t *testing.T) {
		doc := blockAttrsLoad(t, base)
		must.Do(doc.SetAttribute("block", []string{"style", "color"}, "red"))
		body, err := doc.cleanupPatch()
		require.NoError(t, err)
		ops := blockAttrsDecodeOps(t, body)
		require.Len(t, ops, 1)
		set, ok := ops[0].(blob.OpSetAttributes)
		require.True(t, ok)
		require.Equal(t, "block", set.Block)
		require.Equal(t, []blob.KeyValue{{Key: []string{"style", "color"}, Value: "red"}}, set.Attrs)
	})

	t.Run("content change emits ReplaceBlock carrying current attributes", func(t *testing.T) {
		doc := blockAttrsLoad(t, base)
		must.Do(doc.ReplaceBlock(testBlock(t, "block", "edited", map[string]any{"style": map[string]any{"color": "black"}})))
		body, err := doc.cleanupPatch()
		require.NoError(t, err)
		ops := blockAttrsDecodeOps(t, body)
		require.Len(t, ops, 1)
		replace, ok := ops[0].(blob.OpReplaceBlock)
		require.True(t, ok)
		require.Equal(t, map[string]any{"color": "black"}, replace.Block.Attributes()["style"])
	})

	t.Run("non-scalar attribute changes fall back to ReplaceBlock", func(t *testing.T) {
		arrayBase := blockAttrsBase(t, map[string]any{"items": []any{"before"}})
		doc := blockAttrsLoad(t, arrayBase)
		must.Do(doc.ReplaceBlock(testBlock(t, "block", "", map[string]any{"items": []any{"after"}})))
		body, err := doc.cleanupPatch()
		require.NoError(t, err)
		ops := blockAttrsDecodeOps(t, body)
		require.Len(t, ops, 1)
		_, ok := ops[0].(blob.OpReplaceBlock)
		require.True(t, ok)
	})

	t.Run("attribute edit folds into a dirty ReplaceBlock", func(t *testing.T) {
		doc := blockAttrsLoad(t, base)
		must.Do(doc.ReplaceBlock(testBlock(t, "block", "edited", map[string]any{"style": map[string]any{"color": "black"}})))
		must.Do(doc.SetAttribute("block", []string{"style", "color"}, "red"))
		body, err := doc.cleanupPatch()
		require.NoError(t, err)
		ops := blockAttrsDecodeOps(t, body)
		require.Len(t, ops, 1)
		replace, ok := ops[0].(blob.OpReplaceBlock)
		require.True(t, ok)
		require.Equal(t, "red", replace.Block.Attributes()["style"].(map[string]any)["color"])
	})

	t.Run("later attribute-only ReplaceBlock replaces earlier attribute edits", func(t *testing.T) {
		doc := blockAttrsLoad(t, blockAttrsBase(t, map[string]any{"color": "black"}))
		must.Do(doc.SetAttribute("block", []string{"color"}, "red"))
		must.Do(doc.ReplaceBlock(testBlock(t, "block", "", map[string]any{"color": "blue"})))
		body, err := doc.cleanupPatch()
		require.NoError(t, err)
		ops := blockAttrsDecodeOps(t, body)
		require.Len(t, ops, 1)
		set, ok := ops[0].(blob.OpSetAttributes)
		require.True(t, ok)
		require.Equal(t, "block", set.Block)
		require.Equal(t, []blob.KeyValue{{Key: []string{"color"}, Value: "blue"}}, set.Attrs)
	})

	t.Run("later content ReplaceBlock replaces earlier attribute edits", func(t *testing.T) {
		doc := blockAttrsLoad(t, blockAttrsBase(t, map[string]any{"color": "black"}))
		must.Do(doc.SetAttribute("block", []string{"color"}, "red"))
		must.Do(doc.ReplaceBlock(testBlock(t, "block", "edited", map[string]any{"color": "blue"})))
		body, err := doc.cleanupPatch()
		require.NoError(t, err)
		ops := blockAttrsDecodeOps(t, body)
		require.Len(t, ops, 1)
		replace, ok := ops[0].(blob.OpReplaceBlock)
		require.True(t, ok)
		require.Equal(t, "blue", replace.Block.Attributes()["color"])
	})
}

func TestBlockAttributeWriterRejectsReservedFieldsAndUnknownBlocks(t *testing.T) {
	doc := blockAttrsLoad(t, blockAttrsBase(t, nil))
	require.ErrorContains(t, doc.SetAttribute("block", []string{"text"}, "not text"), "reserved")
	require.ErrorContains(t, doc.SetAttribute("missing", []string{"style"}, "red"), "does not exist")
}

func TestBlockAttributeDeletionKeepsEmptyParents(t *testing.T) {
	base := blockAttrsBase(t, map[string]any{"style": map[string]any{"color": "black"}})
	attribute := blockAttrsBranch(t, base, "attribute", blockAttrsTestTime.Add(time.Minute), func(doc *Document) {
		must.Do(doc.SetAttribute("block", []string{"style", "color"}, nil))
	})
	attrs := testHydratedBlock(t, blockAttrsLoad(t, base, attribute), "block").Attributes.AsMap()
	require.Equal(t, map[string]any{}, attrs["style"])
}

func blockAttrsBase(t *testing.T, attrs map[string]any) blob.Encoded[*blob.Change] {
	t.Helper()
	alice := coretest.NewTester("alice").Account
	doc := must.Do2(New("hm://alice.example/doc", cclock.New()))
	must.Do(doc.MoveBlock("block", "", ""))
	must.Do(doc.ReplaceBlock(testBlock(t, "block", "", attrs)))
	return must.Do2(doc.SignChangeAt(alice, blockAttrsTestTime))
}

func blockAttrsMultiBlockBase(t *testing.T) blob.Encoded[*blob.Change] {
	t.Helper()
	alice := coretest.NewTester("alice").Account
	doc := must.Do2(New("hm://alice.example/doc", cclock.New()))
	must.Do(doc.MoveBlock("parent", "", ""))
	must.Do(doc.ReplaceBlock(testBlock(t, "parent", "parent", nil)))
	must.Do(doc.MoveBlock("block", "", "parent"))
	must.Do(doc.ReplaceBlock(testBlock(t, "block", "child", map[string]any{"style": "base"})))
	return must.Do2(doc.SignChangeAt(alice, blockAttrsTestTime))
}

func blockAttrsBranch(t *testing.T, base blob.Encoded[*blob.Change], actor string, at time.Time, mutate func(*Document)) blob.Encoded[*blob.Change] {
	return blockAttrsBranchFrom(t, actor, at, mutate, base)
}

func blockAttrsBranchFrom(t *testing.T, actor string, at time.Time, mutate func(*Document), changes ...blob.Encoded[*blob.Change]) blob.Encoded[*blob.Change] {
	t.Helper()
	doc := blockAttrsLoad(t, changes...)
	mutate(doc)
	actorName, ok := map[string]string{
		"styler":      "bob",
		"writer":      "carol",
		"color":       "bob",
		"weight":      "carol",
		"older":       "bob",
		"newer":       "carol",
		"attribute":   "bob",
		"replacement": "carol",
		"parent":      "bob",
		"child":       "carol",
		"delete":      "carol",
		"move":        "carol",
	}[actor]
	require.True(t, ok, "unknown test actor %q", actor)
	return must.Do2(doc.SignChangeAt(coretest.NewTester(actorName).Account, at))
}

func blockAttrsLoad(t *testing.T, changes ...blob.Encoded[*blob.Change]) *Document {
	t.Helper()
	doc := must.Do2(New("hm://alice.example/doc", cclock.New()))
	for _, change := range changes {
		must.Do(doc.ApplyChange(change.CID, change.Decoded))
	}

	return doc
}

func testBlock(t *testing.T, id, text string, attrs map[string]any) *documents.Block {
	t.Helper()
	pbAttrs, err := structpb.NewStruct(attrs)
	require.NoError(t, err)
	return &documents.Block{Id: id, Type: "Paragraph", Text: text, Attributes: pbAttrs}
}

func testHydratedBlock(t *testing.T, doc *Document, id string) *documents.Block {
	t.Helper()
	hydrated, err := doc.Hydrate(t.Context())
	require.NoError(t, err)
	block := findHydratedBlock(hydrated, id)
	require.NotNil(t, block)
	return block
}

func findHydratedBlock(doc *documents.Document, id string) *documents.Block {
	var find func([]*documents.BlockNode) *documents.Block

	find = func(nodes []*documents.BlockNode) *documents.Block {
		for _, node := range nodes {
			if node.Block.Id == id {
				return node.Block
			}

			if block := find(node.Children); block != nil {
				return block
			}
		}

		return nil
	}
	return find(doc.Content)
}

func assertSameHydratedBlocks(t *testing.T, base, a, b blob.Encoded[*blob.Change]) {
	t.Helper()
	hydrate := func(changes ...blob.Encoded[*blob.Change]) [][]byte {
		doc := blockAttrsLoad(t, changes...)
		hydrated, err := doc.Hydrate(t.Context())
		require.NoError(t, err)

		var blocks [][]byte

		for _, node := range hydrated.Content {
			data, err := protojson.Marshal(node)
			require.NoError(t, err)
			blocks = append(blocks, data)
		}

		return blocks
	}
	require.Equal(t, hydrate(base, a, b), hydrate(base, b, a))
}

func blockAttrsDecodeOps(t *testing.T, body blob.ChangeBody) []blob.Op {
	t.Helper()
	var ops []blob.Op

	for op, err := range (&blob.Change{Body: body}).Ops() {
		require.NoError(t, err)
		ops = append(ops, op)
	}

	return ops
}

func TestBlockAttributeDiffUsesOnlyAttributeChanges(t *testing.T) {
	old := map[string]any{
		"style": map[string]any{"color": "black", "weight": int64(700)},
		"keep":  "same",
	}
	newAttrs := map[string]any{
		"style": map[string]any{"color": "red"},
		"keep":  "same",
	}
	edits, ok := diffBlockAttributes(old, newAttrs)
	require.True(t, ok)
	require.Equal(t, []metadataValue{
		{Key: []string{"style", "color"}, Value: "red"},
		{Key: []string{"style", "weight"}, Value: nil},
	}, edits)

	_, ok = diffBlockAttributes(old, map[string]any{"style": map[string]any{"color": "red"}, "keep": "same", "new": []any{"not scalar"}})
	require.False(t, ok)
	require.False(t, reflect.DeepEqual(old, newAttrs))
}

---
name: SetAttributes Op
summary: The operation that sets document metadata or block attributes by key path, where each path is a last-writer-wins register and a nested write prunes older values above and below it.
---
**SetAttributes** is how a [Change](../../change.md) edits a document's [metadata](../../metadata.md) or a block's attributes. It lists key paths and values, and the daemon stores each one as a register where the newest write wins. <!-- id:cjx45B9D -->

This page defines the **change/op/set-attributes** operation inside a [Change body](../body.md). Its formal schema is attached as the `schemaDefinition` in this document's metadata, so the app can show it. <!-- id:pyCYTEeq -->

`attrs` is a list of [key-value](../../key-value.md) pairs. The `key` is a path (`["name"]`, `["theme", "accent"]`) and the `value` is a string, boolean, integer up to 2^53−1, or null to delete. Writes resolve last-writer-wins by op id, and structurally. Setting `["a","b"]` removes an older value at `["a"]` or at `["a","b","c"]`, while an existing newer ancestor or descendant makes the incoming write a no-op, so a map value and a nested key never coexist. **Proposed (spike, not released):** an empty `block` writes document metadata; a non-empty `block` writes that block's attribute registers. A per-block key resolves against the newest `ReplaceBlock` or `SetAttributes` write for that key. `ReplaceBlock` implicitly sets every present attribute and deletes every absent attribute at its own op id. A null value deletes its path; empty parent maps are retained. Daemons predating this proposal reject block-scoped SetAttributes during replay. The daemon's `PrepareChange` emits one block-scoped SetAttributes per block with dirty attribute edits, after ReplaceBlocks; see [Documents](../../protocol/documents.md). <!-- id:AWTro7zn -->

# See also <!-- id:2msgeUhu -->

- [metadata](../../metadata.md): the document-level keys this op writes. <!-- id:AMNd63W1 -->
- [key-value](../../key-value.md): one key path and value. <!-- id:VePy3P20 -->
- [SetKey](./set-key.md): the deprecated flat form. <!-- id:-U407d6U -->
- [Typed documents](../../schema/typed-documents.md): custom attributes from a schema. <!-- id:5RhWlQtH -->
- [change/op](../op.md): all operations. <!-- id:vvoWGmkv -->

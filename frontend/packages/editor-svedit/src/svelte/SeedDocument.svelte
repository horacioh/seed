<script lang="ts">
  import {Node, NodeArrayProperty, type DocumentPath} from 'svedit'

  let {path}: {path: DocumentPath} = $props()
</script>

<Node {path}>
  <div class="hm-document">
    <NodeArrayProperty class="hm-children hm-children-root" path={[...path, 'body']} />
  </div>
</Node>

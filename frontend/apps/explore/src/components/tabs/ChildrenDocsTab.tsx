import * as stylex from "@stylexjs/stylex";
import { UnpackedHypermediaId } from '@seed-hypermedia/client/hm-types';
import { FileText } from 'lucide-react';
import { useApiHost } from '../../apiHostStore';
import EmptyState from '../EmptyState';
import { DocumentListItem } from './DocumentListItem';
const styles = stylex.create({
  sc7133e97: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "calc(var(--spacing) * 2)"
  }
});
export function ChildrenDocsTab({
  list
}: {
  list: any[] | undefined;
  id: UnpackedHypermediaId;
}) {
  const apiHost = useApiHost();
  if (!Array.isArray(list)) {
    console.warn('List is not an array:', list);
    return <EmptyState message="No children documents available" icon={FileText} />;
  }
  if (list.length === 0) {
    return <EmptyState message="No children documents available" icon={FileText} />;
  }
  return <div className={stylex.props(styles.sc7133e97).className || ""}>
      {list.map(doc => <DocumentListItem key={doc.id.id} doc={doc} apiHost={apiHost} />)}
    </div>;
}
import * as stylex from '@stylexjs/stylex';
import { commentIdToHmId, entityQueryPathToHmIdPath, hmId, packHmId } from '@shm/shared';
import { MessageCircle } from 'lucide-react';
import React, { useMemo } from 'react';
import { useHmNavigate } from '../../utils/useHmNavigate';
import DataViewer from '../DataViewer';
import EmptyState from '../EmptyState';
const styles = stylex.create({
  sfbc6e290: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'calc(0.25rem * 4)'
  }
});
const AuthoredCommentsTab: React.FC<{
  comments: any[] | undefined;
}> = ({
  comments
}) => {
  const navigate = useHmNavigate();
  const preparedComments = useMemo(() => {
    if (!Array.isArray(comments)) {
      console.warn('Comments is not an array:', comments);
      return [];
    }
    return comments.map(comment => {
      const {
        id,
        author,
        targetPath,
        targetAccount,
        targetVersion,
        ...rest
      } = comment;
      const out: Record<string, any> = {
        ...rest
      };
      if (id) {
        out.id = packHmId(commentIdToHmId(id, typeof rest.version === 'string' ? rest.version : undefined));
      }
      if (author) {
        out.author = `hm://${author}`;
      }
      if (targetAccount) {
        out.target = packHmId(hmId(targetAccount, {
          path: entityQueryPathToHmIdPath(targetPath || ''),
          version: targetVersion
        }));
      }
      return out;
    });
  }, [comments]);
  if (!Array.isArray(comments) || comments.length === 0) {
    return <EmptyState message="No comments available" icon={MessageCircle} />;
  }
  return <div className={stylex.props(styles.sfbc6e290).className || ''}>
      {preparedComments.map(comment => <div key={comment.id}>
          <DataViewer data={comment} onNavigate={navigate} />
        </div>)}
    </div>;
};
export default AuthoredCommentsTab;
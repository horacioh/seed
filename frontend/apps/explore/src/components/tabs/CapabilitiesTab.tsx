import * as stylex from '@stylexjs/stylex';
import { Shield } from 'lucide-react';
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
interface CapabilitiesTabProps {
  capabilities?: any[];
}
const CapabilitiesTab: React.FC<CapabilitiesTabProps> = ({
  capabilities
}) => {
  const navigate = useHmNavigate();
  const preparedCapabilities = useMemo(() => {
    if (!Array.isArray(capabilities)) {
      console.warn('Capabilities is not an array:', capabilities);
      return [];
    }
    return capabilities.map(capability => {
      const {
        id,
        accountUid,
        grantId,
        ...rest
      } = capability;
      const out = {
        ...rest
      };
      if (id) {
        out.id = id === '_owner' ? id : `ipfs://${id}`;
      }
      if (accountUid) {
        out.accountUid = `hm://${accountUid}`;
      }
      if (grantId) {
        out.grantId = grantId.id;
      }
      return out;
    });
  }, [capabilities]);

  // Handle case where there are no capabilities
  if (!Array.isArray(capabilities) || capabilities.length === 0) {
    return <EmptyState message="No capabilities available" icon={Shield} />;
  }
  return <div className={stylex.props(styles.sfbc6e290).className || ''}>
      {preparedCapabilities.map(capability => <div key={capability.id}>
          <DataViewer data={capability} onNavigate={navigate} />
        </div>)}
    </div>;
};
export default CapabilitiesTab;
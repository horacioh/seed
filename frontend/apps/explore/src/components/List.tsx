import * as stylex from '@stylexjs/stylex';
import { useRootDocuments } from '@shm/shared';
import { useApiHost } from '../apiHostStore';
import { DocumentListItem } from './tabs/DocumentListItem';
const styles_3 = stylex.create({
  sc7133e97: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "calc(var(--spacing) * 2)"
  }
});
const styles_2 = stylex.create({
  se7814c81: {
    "width": "100%",
    "@media ((min-width: 640px))": {
      "maxWidth": "40rem"
    },
    "@media ((min-width: 768px))": {
      "maxWidth": "48rem"
    },
    "@media ((min-width: 1024px))": {
      "maxWidth": "64rem"
    },
    "@media ((min-width: 1280px))": {
      "maxWidth": "80rem"
    },
    "@media ((min-width: 1536px))": {
      "maxWidth": "96rem"
    }
  },
  s5574c491: {
    "marginInline": "auto"
  },
  s9ccd5229: {
    "maxWidth": "56rem"
  },
  s1aa17: {
    "padding": "calc(0.25rem * 4)"
  }
});
const styles = stylex.create({
  s452fb49b: {
    marginBottom: 'calc(0.25rem * 6)',
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)'
  }
});
export default function List() {
  const {
    data,
    isLoading
  } = useRootDocuments();
  const apiHost = useApiHost();
  return <div className={stylex.props(styles_2.se7814c81, styles_2.s5574c491, styles_2.s9ccd5229, styles_2.s1aa17).className || ""}>
      <h1 className={stylex.props(styles.s452fb49b).className || ''}>All Hypermedia Spaces</h1>
      {isLoading && <p>Loading…</p>}
      {data && <div className={stylex.props(styles_3.sc7133e97).className || ""}>
          {data.accounts.map(doc => {
        return <DocumentListItem key={doc.id.id} doc={doc} apiHost={apiHost} />;
      })}
        </div>}
    </div>;
}
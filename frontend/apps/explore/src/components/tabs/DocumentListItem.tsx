import * as stylex from '@stylexjs/stylex';
import { hmIdPathToEntityQueryPath, hmIdToURL } from '@shm/shared';
import { Copy, ExternalLink } from 'lucide-react';
import { copyToClipboardWithToast } from '../../utils/clipboard';
const styles_2 = stylex.create({
  s2ffff9: {
    "display": "flex"
  },
  sc7847ec6: {
    "cursor": "pointer"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sc1a629cb: {
    "justifyContent": "space-between"
  },
  s5d936fc: {
    "gap": "calc(0.25rem * 3)"
  },
  sf799889b: {
    "borderRadius": "var(--radius)"
  },
  sad8c742c: {
    "borderStyle": "solid",
    "borderWidth": "1px"
  },
  s605ce4a1: {
    "backgroundColor": "#fff"
  },
  s1aa16: {
    "padding": "calc(0.25rem * 3)"
  },
  s773199bb: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(98.5% 0.002 247.839)"
      }
    }
  },
  s3f58665f: {
    "minWidth": "calc(0.25rem * 0)"
  },
  sb42feb5d: {
    "flex": "1"
  },
  s6e724d66: {
    "overflow": "hidden",
    "textOverflow": "ellipsis",
    "whiteSpace": "nowrap"
  },
  s129e46b3: {
    "fontWeight": "500"
  },
  saf5bb22f: {
    "color": "oklch(21% 0.034 264.665)"
  },
  s880858c0: {
    "flexShrink": "0"
  },
  sf46870a5: {
    "columnGap": "calc(0.25rem * 1)"
  },
  s765a26ee: {
    "opacity": "0%"
  },
  s83442393: {
    "transitionProperty": "opacity",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  sdef3facc: {
    "position": "relative"
  },
  s775755af: {
    "borderRadius": "calc(infinity * 1px)"
  },
  s63f7adb: {
    "padding": "calc(0.25rem * 1.5)"
  },
  s6f018ed1: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(96.7% 0.003 264.542)"
      }
    }
  },
  s67010d77: {
    "position": "absolute"
  },
  sd8ed4cf1: {
    "bottom": "100%"
  },
  s665a770e: {
    "left": "50%"
  },
  s3301fa: {
    "marginBottom": "calc(0.25rem * 2)"
  },
  s529492ad: {
    "borderRadius": "0.25rem"
  },
  s5f846617: {
    "backgroundColor": "oklch(21% 0.034 264.665)"
  },
  s34b1ad: {
    "paddingInline": "calc(0.25rem * 2)"
  },
  s34b56d: {
    "paddingBlock": "calc(0.25rem * 1)"
  },
  sab7cc79b: {
    "fontSize": "0.75rem",
    "lineHeight": "var(--text-xs--line-height)"
  },
  sf8e652db: {
    "whiteSpace": "nowrap"
  },
  s2daecf89: {
    "color": "#fff"
  }
});
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)'
  },
  s66e38c43: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(72.3% 0.219 149.579)'
  }
});
export function DocumentListItem({
  doc,
  apiHost
}: {
  doc: any;
  apiHost: string;
}) {
  const url = hmIdToURL(doc.id);
  let webUrl = `${apiHost}/hm/${doc.id.type}/${doc.id.uid}${hmIdPathToEntityQueryPath(doc.id.path)}`;
  if (doc.id.version) {
    webUrl += `?v=${doc.id.version}`;
  }
  return <a key={doc.id.id} href={`/hm/${doc.id.uid}/${doc.id.path?.join('/') || ''}`} className={stylex.props(styles_2.s2ffff9, styles_2.sc7847ec6, styles_2.sc6ed1702, styles_2.sc1a629cb, styles_2.s5d936fc, styles_2.sf799889b, styles_2.sad8c742c, styles_2.s605ce4a1, styles_2.s1aa16, styles_2.s773199bb).className || ""}>
      <span className={stylex.props(styles_2.s3f58665f, styles_2.sb42feb5d, styles_2.s6e724d66, styles_2.s129e46b3, styles_2.saf5bb22f).className || ""}>
        {doc.metadata?.name || doc.id.path?.at(-1) || 'Untitled'}
      </span>
      <div className={stylex.props(styles_2.s2ffff9, styles_2.s880858c0, styles_2.sc6ed1702, styles_2.sf46870a5, styles_2.s765a26ee, styles_2.s83442393).className || ""}>
        <button className={stylex.props(styles_2.sdef3facc, styles_2.s775755af, styles_2.s63f7adb, styles_2.s6f018ed1).className || ""} onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        copyToClipboardWithToast(url);
      }}>
          <Copy className={stylex.props(styles.sca3de968).className || ''} />
          <span className={stylex.props(styles_2.s67010d77, styles_2.sd8ed4cf1, styles_2.s665a770e, styles_2.s3301fa, styles_2.s529492ad, styles_2.s5f846617, styles_2.s34b1ad, styles_2.s34b56d, styles_2.sab7cc79b, styles_2.sf8e652db, styles_2.s2daecf89, styles_2.s765a26ee, styles_2.s83442393).className || ""}>
            Copy URL
          </span>
        </button>
        <button className={stylex.props(styles_2.sdef3facc, styles_2.s775755af, styles_2.s63f7adb, styles_2.s6f018ed1).className || ""} onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        window.open(webUrl, '_blank');
      }}>
          <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
          <span className={stylex.props(styles_2.s67010d77, styles_2.sd8ed4cf1, styles_2.s665a770e, styles_2.s3301fa, styles_2.s529492ad, styles_2.s5f846617, styles_2.s34b1ad, styles_2.s34b56d, styles_2.sab7cc79b, styles_2.sf8e652db, styles_2.s2daecf89, styles_2.s765a26ee, styles_2.s83442393).className || ""}>
            Open in new tab
          </span>
        </button>
        <button className={stylex.props(styles_2.sdef3facc, styles_2.s775755af, styles_2.s63f7adb, styles_2.s6f018ed1).className || ""} onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        window.open(url, '_blank');
      }}>
          <ExternalLink className={stylex.props(styles.s66e38c43).className || ''} />
          <span className={stylex.props(styles_2.s67010d77, styles_2.sd8ed4cf1, styles_2.s665a770e, styles_2.s3301fa, styles_2.s529492ad, styles_2.s5f846617, styles_2.s34b1ad, styles_2.s34b56d, styles_2.sab7cc79b, styles_2.sf8e652db, styles_2.s2daecf89, styles_2.s765a26ee, styles_2.s83442393).className || ""}>
            Open in Seed App
          </span>
        </button>
      </div>
    </a>;
}
import * as stylex from '@stylexjs/stylex';
import { search } from '@shm/shared';
import { Loader } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  s9ccd4aa7: {
    "maxWidth": "42rem"
  },
  sf799889b: {
    "borderRadius": "var(--radius)"
  },
  s605ce4a1: {
    "backgroundColor": "#fff"
  },
  s1aa17: {
    "padding": "calc(0.25rem * 4)"
  },
  sca247920: {
    "boxShadow": "var(--shadow)"
  },
  s2ffff9: {
    "display": "flex"
  },
  s67e351ac: {
    "flexDirection": "column"
  },
  s5d936fc: {
    "gap": "calc(0.25rem * 3)"
  },
  se5662726: {
    "@media ((min-width: 640px))": {
      "flexDirection": "row"
    }
  },
  sc8050d55: {
    ":focus": {}
  },
  sf91e6159: {
    ":focus": {
      "borderColor": "var(--link)"
    }
  },
  sb42feb5d: {
    "flex": "1"
  },
  sad8c742c: {
    "borderStyle": "solid",
    "borderWidth": "1px"
  },
  s2a40db8a: {
    "borderColor": "oklch(87.2% 0.01 258.338)"
  },
  sbf5f1771: {
    "fontSize": "1rem",
    "lineHeight": "var(--text-base--line-height)"
  },
  s4a7318b7: {
    ":focus": {
      "boxShadow": "\n 0 0 0 2px var(--ring-color, currentcolor)"
    }
  },
  sbecb6545: {
    ":focus": {
      "outlineStyle": "none"
    }
  },
  sa080ebc: {
    "@media ((min-width: 640px))": {
      "borderTopLeftRadius": "var(--radius)",
      "borderBottomLeftRadius": "var(--radius)"
    }
  },
  sb27d77f3: {
    "@media ((min-width: 640px))": {
      "borderTopRightRadius": "0",
      "borderBottomRightRadius": "0"
    }
  },
  s7e479bb9: {
    "minHeight": "56px"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sce22ca32: {
    "justifyContent": "center"
  },
  s5d936fb: {
    "gap": "calc(0.25rem * 2)"
  },
  s3bc02d4b: {
    "backgroundColor": "oklch(54.6% 0.245 262.881)"
  },
  s34b1b1: {
    "paddingInline": "calc(0.25rem * 6)"
  },
  s34b570: {
    "paddingBlock": "calc(0.25rem * 4)"
  },
  s62c182b1: {
    "fontWeight": "600"
  },
  s2daecf89: {
    "color": "#fff"
  },
  sf7fb00e8: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  s4b3d77ce: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(48.8% 0.243 264.376)"
      }
    }
  },
  s8b5b6275: {
    ":disabled": {
      "cursor": "not-allowed"
    }
  },
  s3815fa0a: {
    ":disabled": {
      "backgroundColor": "oklch(80.9% 0.105 251.813)"
    }
  },
  sa8406439: {
    "@media ((min-width: 640px))": {
      "borderTopLeftRadius": "0",
      "borderBottomLeftRadius": "0"
    }
  },
  sa0ac8f6: {
    "@media ((min-width: 640px))": {
      "borderTopRightRadius": "var(--radius)",
      "borderBottomRightRadius": "var(--radius)"
    }
  }
});
const styles = stylex.create({
  scaf02c5d: {
    marginBottom: 'calc(0.25rem * 4)',
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)'
  },
  s1925884a: {
    marginBottom: 'calc(0.25rem * 6)',
    color: 'oklch(44.6% 0.03 256.802)'
  },
  s3301fe: {
    marginBottom: 'calc(0.25rem * 6)'
  },
  sd42c505: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    animation: 'spin 1s linear infinite'
  },
  s2659d5ee: {
    marginTop: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(88.5% 0.062 18.334)',
    backgroundColor: 'oklch(97.1% 0.013 17.38)',
    padding: 'calc(0.25rem * 4)',
    color: 'oklch(57.7% 0.245 27.325)'
  },
  s21be97f: {
    marginBottom: 'calc(0.25rem * 2)',
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '600'
  }
});
export default function Home() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!url) return;
    setErrorMessage(null);
    setIsLoading(true);
    search(url).then(result => {
      if (result.destination) {
        setErrorMessage(null);
        navigate(result.destination);
      } else {
        setErrorMessage(result.errorMessage || 'Unknown error');
      }
    }).finally(() => {
      setIsLoading(false);
    });
  };
  return <div className={stylex.props(styles_2.se7814c81, styles_2.s5574c491, styles_2.s9ccd4aa7, styles_2.sf799889b, styles_2.s605ce4a1, styles_2.s1aa17, styles_2.sca247920).className || ""}>
      <h1 className={stylex.props(styles.scaf02c5d).className || ''}>Explore Hypermedia</h1>
      <p className={stylex.props(styles.s1925884a).className || ''}>
        Enter a URL to explore the Hypermedia network. Supports hm://, ipfs://, and http(s):// URLS of hypermedia
        documents.
      </p>

      <form onSubmit={handleSearch} className={stylex.props(styles.s3301fe).className || ''}>
        <div className={stylex.props(styles_2.s2ffff9, styles_2.s67e351ac, styles_2.s5d936fc, styles_2.se5662726).className || ""}>
          <input type="text" value={url} onChange={e => setUrl(e.target.value)} placeholder="Enter URL to explore…" className={stylex.props(styles_2.sc8050d55, styles_2.sf91e6159, styles_2.sb42feb5d, styles_2.sf799889b, styles_2.sad8c742c, styles_2.s2a40db8a, styles_2.s1aa17, styles_2.sbf5f1771, styles_2.s4a7318b7, styles_2.sbecb6545, styles_2.sa080ebc, styles_2.sb27d77f3).className || ""} />
          <button type="submit" disabled={isLoading || !url} className={stylex.props(styles_2.s2ffff9, styles_2.s7e479bb9, styles_2.sc6ed1702, styles_2.sce22ca32, styles_2.s5d936fb, styles_2.sf799889b, styles_2.s3bc02d4b, styles_2.s34b1b1, styles_2.s34b570, styles_2.sbf5f1771, styles_2.s62c182b1, styles_2.s2daecf89, styles_2.sf7fb00e8, styles_2.s4b3d77ce, styles_2.s8b5b6275, styles_2.s3815fa0a, styles_2.sa8406439, styles_2.sa0ac8f6).className || ""}>
            {isLoading ? <Loader className={stylex.props(styles.sd42c505).className || ''} /> : 'Search'}
          </button>
        </div>
      </form>

      {errorMessage && <div className={stylex.props(styles.s2659d5ee).className || ''}>
          <h2 className={stylex.props(styles.s21be97f).className || ''}>Error</h2>
          <p>{errorMessage}</p>
        </div>}
    </div>;
}
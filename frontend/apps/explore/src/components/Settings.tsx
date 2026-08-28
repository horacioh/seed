import * as stylex from '@stylexjs/stylex';
import { Settings as SettingsIcon } from 'lucide-react';
import { useEffect, useState, useSyncExternalStore } from 'react';
import { getSnapshot, subscribe, updateApiHost } from '../apiHostStore';
const styles_2 = stylex.create({
  s775755af: {
    "borderRadius": "calc(infinity * 1px)"
  },
  s5f844bd0: {
    "backgroundColor": "oklch(92.8% 0.006 264.531)"
  },
  s1aa15: {
    "padding": "calc(0.25rem * 2)"
  },
  sf7fb00e8: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  s6f019653: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(87.2% 0.01 258.338)"
      }
    }
  },
  scdbaf625: {
    "width": "100%"
  },
  sf79988b7: {
    "borderRadius": "calc(var(--radius) - 2px)"
  },
  sad8c742c: {
    "borderStyle": "solid",
    "borderWidth": "1px"
  },
  s2a40db8a: {
    "borderColor": "oklch(87.2% 0.01 258.338)"
  },
  s34b1ae: {
    "paddingInline": "calc(0.25rem * 3)"
  },
  s34b56e: {
    "paddingBlock": "calc(0.25rem * 2)"
  },
  s8a6c2a27: {
    "boxShadow": "var(--shadow-sm)"
  },
  s10f27599: {
    ":focus": {
      "borderColor": "oklch(58.5% 0.233 277.117)"
    }
  },
  s778f3495: {
    ":focus": {}
  },
  sbecb6545: {
    ":focus": {
      "outlineStyle": "none"
    }
  },
  s5f84480f: {
    "backgroundColor": "oklch(96.7% 0.003 264.542)"
  },
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  s129e46b3: {
    "fontWeight": "500"
  },
  saf5baaad: {
    "color": "oklch(37.3% 0.034 259.733)"
  },
  s6f019292: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(92.8% 0.006 264.531)"
      }
    }
  },
  s4a7318b7: {
    ":focus": {
      "boxShadow": "\n 0 0 0 2px var(--ring-color, currentcolor)"
    }
  },
  sb8c21a66: {
    ":focus": {}
  },
  s854ec953: {
    ":focus": {}
  },
  s76b4fdc3: {
    "backgroundColor": "oklch(51.1% 0.262 276.966)"
  },
  s2daecf89: {
    "color": "#fff"
  },
  s9bfb9fc6: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(45.7% 0.24 277.023)"
      }
    }
  }
});
const styles = stylex.create({
  sf230241a: {
    position: 'fixed',
    zIndex: '10',
    bottom: 'calc(0.25rem * 4)',
    left: 'calc(0.25rem * 4)'
  },
  s12fa7adc: {
    display: 'flex',
    alignItems: 'center',
    padding: 'calc(0.25rem * 2)',
    backgroundColor: '#fff',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-md)'
  },
  s15459875: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(44.6% 0.03 256.802)'
  },
  s20e83d91: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'calc(0.25rem * 2)'
  },
  se06d7839: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
    color: 'oklch(55.1% 0.027 264.364)'
  },
  s4204e085: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.1% 0.027 264.364)'
  },
  s78cd724d: {
    position: 'absolute',
    left: 'calc(0.25rem * 0)',
    padding: 'calc(0.25rem * 4)',
    backgroundColor: '#fff',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
    borderRadius: 'var(--radius)',
    boxShadow: 'var(--shadow-xl)',
    bottom: 'calc(0.25rem * 12)',
    width: 'calc(0.25rem * 80)'
  },
  sd45c6c99: {
    marginBottom: 'calc(0.25rem * 4)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '500',
    color: 'oklch(21% 0.034 264.665)'
  },
  s3301fc: {
    marginBottom: 'calc(0.25rem * 4)'
  },
  s4000ce6: {
    display: 'block',
    marginBottom: 'calc(0.25rem * 1)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
    color: 'oklch(37.3% 0.034 259.733)'
  },
  s9673c3fd: {
    display: 'flex',
    justifyContent: 'flex-end',
    columnGap: 'calc(0.25rem * 2)'
  }
});
export default function Settings() {
  const [isOpen, setIsOpen] = useState(false);
  const apiHost = useSyncExternalStore(subscribe, getSnapshot);
  const [inputValue, setInputValue] = useState(apiHost);
  useEffect(() => {
    setInputValue(apiHost);
  }, [apiHost]);
  const handleSave = () => {
    updateApiHost(inputValue);
    setIsOpen(false);
  };
  return <div className={stylex.props(styles.sf230241a).className || ''}>
      <div className={stylex.props(styles.s12fa7adc).className || ''}>
        <button onClick={() => setIsOpen(!isOpen)} className={stylex.props(styles_2.s775755af, styles_2.s5f844bd0, styles_2.s1aa15, styles_2.sf7fb00e8, styles_2.s6f019653).className || ""} aria-label="Settings">
          <SettingsIcon className={stylex.props(styles.s15459875).className || ''} />
        </button>
        <div className={stylex.props(styles.s20e83d91).className || ''}>
          <span className={stylex.props(styles.se06d7839).className || ''}>Hypermedia API</span>
          <span className={stylex.props(styles.s4204e085).className || ''}>{apiHost}</span>
        </div>
      </div>

      {isOpen && <div className={stylex.props(styles.s78cd724d).className || ''}>
          <h3 className={stylex.props(styles.sd45c6c99).className || ''}>Settings</h3>
          <div className={stylex.props(styles.s3301fc).className || ''}>
            <label htmlFor="apiHost" className={stylex.props(styles.s4000ce6).className || ''}>
              Explore API Host
            </label>
            <input type="text" id="apiHost" value={inputValue} onChange={e => setInputValue(e.target.value)} className={stylex.props(styles_2.scdbaf625, styles_2.sf79988b7, styles_2.sad8c742c, styles_2.s2a40db8a, styles_2.s34b1ae, styles_2.s34b56e, styles_2.s8a6c2a27, styles_2.s10f27599, styles_2.s778f3495, styles_2.sbecb6545).className || ""} placeholder="Enter API host URL" />
          </div>
          <div className={stylex.props(styles.s9673c3fd).className || ''}>
            <button onClick={() => setIsOpen(false)} className={stylex.props(styles_2.sf79988b7, styles_2.s5f84480f, styles_2.s34b1af, styles_2.s34b56e, styles_2.sab7cc6fa, styles_2.s129e46b3, styles_2.saf5baaad, styles_2.s6f019292, styles_2.s4a7318b7, styles_2.sb8c21a66, styles_2.s854ec953, styles_2.sbecb6545).className || ""}>
              Cancel
            </button>
            <button onClick={handleSave} className={stylex.props(styles_2.sf79988b7, styles_2.s76b4fdc3, styles_2.s34b1af, styles_2.s34b56e, styles_2.sab7cc6fa, styles_2.s129e46b3, styles_2.s2daecf89, styles_2.s9bfb9fc6, styles_2.s4a7318b7, styles_2.s778f3495, styles_2.s854ec953, styles_2.sbecb6545).className || ""}>
              Save
            </button>
          </div>
        </div>}
    </div>;
}
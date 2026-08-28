import * as stylex from '@stylexjs/stylex';
import React from 'react';
import { Copy } from 'lucide-react';
const styles_2 = stylex.create({
  s332784: {
    "marginLeft": "calc(0.25rem * 2)"
  },
  s1aa15: {
    "padding": "calc(0.25rem * 2)"
  },
  saf5ba32b: {
    "color": "oklch(55.1% 0.027 264.364)"
  },
  sf7fb00e8: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  sd4a248ef: {
    ":hover": {
      "@media (hover: hover)": {
        "color": "oklch(37.3% 0.034 259.733)"
      }
    }
  }
});
const styles = stylex.create({
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)'
  }
});
interface CopyTextButtonProps {
  text: string;
}
export const CopyTextButton: React.FC<CopyTextButtonProps> = ({
  text
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(text);
  };
  return <button onClick={handleCopy} className={stylex.props(styles_2.s332784, styles_2.s1aa15, styles_2.saf5ba32b, styles_2.sf7fb00e8, styles_2.sd4a248ef).className || ""} title="Copy to clipboard">
      <Copy className={stylex.props(styles.sca3de968).className || ''} />
    </button>;
};
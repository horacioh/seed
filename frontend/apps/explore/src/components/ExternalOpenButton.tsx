import * as stylex from '@stylexjs/stylex';
import React from 'react';
import { ExternalLink } from 'lucide-react';
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
  },
  sf1212a8b: {
    "color": "oklch(72.3% 0.219 149.579)"
  },
  s74ae5c0b: {
    ":hover": {
      "@media (hover: hover)": {
        "color": "oklch(52.7% 0.154 150.069)"
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
interface ExternalOpenButtonProps {
  url: string;
}
export const ExternalOpenButton: React.FC<ExternalOpenButtonProps> = ({
  url
}) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  return <button onClick={handleClick} className={stylex.props(styles_2.s332784, styles_2.s1aa15, styles_2.saf5ba32b, styles_2.sf7fb00e8, styles_2.sd4a248ef).className || ""} title="Open in new tab">
      <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
    </button>;
};
export const OpenInAppButton: React.FC<ExternalOpenButtonProps> = ({
  url
}) => {
  const handleClick = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  return <button onClick={handleClick} className={stylex.props(styles_2.s332784, styles_2.s1aa15, styles_2.sf1212a8b, styles_2.sf7fb00e8, styles_2.s74ae5c0b).className || ""} title="Open in Seed App">
      <ExternalLink className={stylex.props(styles.sca3de968).className || ''} />
    </button>;
};
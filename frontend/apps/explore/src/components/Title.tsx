import * as stylex from '@stylexjs/stylex';
import React from 'react';
const styles_3 = stylex.create({
  s2ffff9: {
    "display": "flex"
  },
  scdbaf625: {
    "width": "100%"
  },
  s9490059e: {
    "flexWrap": "wrap"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  s5d936fb: {
    "gap": "calc(0.25rem * 2)"
  }
});
const styles_2 = stylex.create({
  s3f58665f: {
    "minWidth": "calc(0.25rem * 0)"
  },
  s9488c167: {
    "flexGrow": "1"
  },
  s92852dd5: {
    "overflow": "hidden"
  },
  sc41b2606: {
    "fontSize": "1.5rem",
    "lineHeight": "var(--text-2xl--line-height)"
  },
  sa16ea943: {
    "fontWeight": "700"
  },
  s13588c5b: {
    "overflowWrap": "break-word"
  }
});
const styles = stylex.create({
  s3af1a4d9: {
    display: 'flex',
    flexShrink: '0'
  }
});
interface TitleProps {
  title: string;
  className?: string;
  buttons?: React.ReactNode;
}
export const Title: React.FC<TitleProps> = ({
  title,
  className = '',
  buttons
}) => {
  // strip off trailing slash
  const displayTitle = title.replace(/\/$/, '');
  return <div className={stylex.props(styles_3.s2ffff9, styles_3.scdbaf625, styles_3.s9490059e, styles_3.sc6ed1702, styles_3.s5d936fb).className || ""}>
      <h1 className={stylex.props(styles_2.s3f58665f, styles_2.s9488c167, styles_2.s92852dd5, styles_2.sc41b2606, styles_2.sa16ea943, styles_2.s13588c5b).className || ""}>{displayTitle}</h1>
      {buttons && <div className={stylex.props(styles.s3af1a4d9).className || ''}>{buttons}</div>}
    </div>;
};
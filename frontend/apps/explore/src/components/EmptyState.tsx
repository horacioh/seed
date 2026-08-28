import * as stylex from '@stylexjs/stylex';
import { LucideIcon } from 'lucide-react';
const styles_2 = stylex.create({
  s2ffff9: {
    "display": "flex"
  },
  s67e351ac: {
    "flexDirection": "column"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sce22ca32: {
    "justifyContent": "center"
  },
  s1aa1b: {
    "padding": "calc(0.25rem * 8)"
  },
  saf5ba32b: {
    "color": "oklch(55.1% 0.027 264.364)"
  }
});
const styles = stylex.create({
  s78039d98: {
    width: 'calc(0.25rem * 12)',
    height: 'calc(0.25rem * 12)',
    marginBottom: 'calc(0.25rem * 3)',
    color: 'oklch(70.7% 0.022 261.325)'
  },
  s65e234f5: {
    textAlign: 'center'
  }
});
interface EmptyStateProps {
  message: string;
  icon?: LucideIcon;
  className?: string;
}
export function EmptyState({
  message,
  icon: Icon,
  className = ''
}: EmptyStateProps) {
  return <div className={stylex.props(styles_2.s2ffff9, styles_2.s67e351ac, styles_2.sc6ed1702, styles_2.sce22ca32, styles_2.s1aa1b, styles_2.saf5ba32b).className || ""}>
      {Icon && <Icon className={stylex.props(styles.s78039d98).className || ''} />}
      <p className={stylex.props(styles.s65e234f5).className || ''}>{message}</p>
    </div>;
}
export default EmptyState;
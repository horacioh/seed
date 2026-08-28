import * as stylex from '@stylexjs/stylex'

/** Fade-in and zoom-in entrance animation used by menus, popovers and dialogs. */
export const fadeZoomIn = stylex.keyframes({
  from: {opacity: 0, transform: 'scale(0.95)'},
  to: {opacity: 1, transform: 'scale(1)'},
})

/** Plain fade-in for overlays. */
export const overlayFade = stylex.keyframes({
  from: {opacity: 0},
  to: {opacity: 1},
})

/** Slide in from the top used by bottom-aligned floating content. */
export const slideInFromTop = stylex.keyframes({
  from: {opacity: 0, transform: 'scale(0.95) translateY(-0.5rem)'},
  to: {opacity: 1, transform: 'scale(1) translateY(0)'},
})

/** Slide in from the bottom used by top-aligned floating content. */
export const slideInFromBottom = stylex.keyframes({
  from: {opacity: 0, transform: 'scale(0.95) translateY(0.5rem)'},
  to: {opacity: 1, transform: 'scale(1) translateY(0)'},
})

/** Slide in from the left used by right-aligned floating content. */
export const slideInFromLeft = stylex.keyframes({
  from: {opacity: 0, transform: 'scale(0.95) translateX(-0.5rem)'},
  to: {opacity: 1, transform: 'scale(1) translateX(0)'},
})

/** Slide in from the right used by left-aligned floating content. */
export const slideInFromRight = stylex.keyframes({
  from: {opacity: 0, transform: 'scale(0.95) translateX(0.5rem)'},
  to: {opacity: 1, transform: 'scale(1) translateX(0)'},
})

/** Slide in from the right for full-height side drawers. */
export const slideInFromRightDrawer = stylex.keyframes({
  from: {opacity: 0, transform: 'translateX(100%)'},
  to: {opacity: 1, transform: 'translateX(0)'},
})

/** Floating content entrance with per-side transforms. */
export const floatingContent = stylex.create({
  base: {
    animationName: fadeZoomIn,
    animationDuration: '0.15s',
    animationFillMode: 'forwards',
  },
  bottom: {
    ':is([data-side="bottom"])': {
      animationName: slideInFromTop,
    },
  },
  left: {
    ':is([data-side="left"])': {
      animationName: slideInFromRight,
    },
  },
  right: {
    ':is([data-side="right"])': {
      animationName: slideInFromLeft,
    },
  },
  top: {
    ':is([data-side="top"])': {
      animationName: slideInFromBottom,
    },
  },
})

/** Centered modal content entrance. */
export const modalContent = stylex.create({
  base: {
    animationName: fadeZoomIn,
    animationDuration: '0.15s',
    animationFillMode: 'forwards',
  },
})

/** Side drawer content entrance. */
export const sideContent = stylex.create({
  base: {
    animationName: slideInFromRightDrawer,
    animationDuration: '0.15s',
    animationFillMode: 'forwards',
  },
})

/** Overlay fade-in. */
export const overlay = stylex.create({
  base: {
    animationName: overlayFade,
    animationDuration: '0.15s',
    animationFillMode: 'forwards',
  },
})

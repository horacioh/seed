import * as stylex from '@stylexjs/stylex';
import { AlertCircle, ArrowRight, Binary, Braces, ChevronRight, Copy, RefreshCw, Search, Sparkles, TerminalSquare, Unplug } from 'lucide-react';
import { useDeferredValue, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { buildApiRequestPreview, createStarterPayload, executeApiRequest, resolveSchemaNode, type ApiExecutionResult, type ApiSchemaDefinition, type ApiSchemaIndex, type ApiSchemaRouteSummary, type JSONSchemaNode } from '../api-lab';
import { useApiHost } from '../apiHostStore';
import DataViewer from './DataViewer';

/** Developer playground for the desktop TypeScript HTTP API. */
const styles_5 = stylex.create({
  sc7133e99: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "calc(var(--spacing) * 4)"
  },
  sc7133e9b: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "calc(var(--spacing) * 6)"
  },
  sc7133e9a: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "calc(var(--spacing) * 5)"
  },
  sc7133e97: {
    "display": "flex",
    "flexDirection": "column",
    "gap": "calc(var(--spacing) * 2)"
  }
});
const styles_4 = stylex.create({
  sb3691128: {
    "borderColor": "oklch(87.9% 0.169 91.605)"
  },
  se878644d: {
    "backgroundColor": "oklch(98.7% 0.022 95.277)"
  },
  sd1a65c6b: {
    "color": "oklch(76.9% 0.188 70.08)"
  },
  sba903a9f: {
    "color": "oklch(86.9% 0.022 252.894)"
  },
  s7fefd7: {
    "backgroundColor": "oklch(98.4% 0.003 247.858)"
  }
});
const styles_3 = stylex.create({
  s2ffff9: {
    "display": "flex"
  },
  scdbaf625: {
    "width": "100%"
  },
  s93b5f015: {
    "alignItems": "flex-start"
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
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  s34b56f: {
    "paddingBlock": "calc(0.25rem * 3)"
  },
  sbf63b0a7: {
    "textAlign": "left"
  },
  s993b6d55: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  s9c52f31d: {
    "borderColor": "oklch(92.9% 0.013 255.508)"
  },
  s605ce4a1: {
    "backgroundColor": "#fff"
  },
  s713d995c: {
    ":hover": {
      "@media (hover: hover)": {
        "borderColor": "oklch(86.9% 0.022 252.894)"
      }
    }
  },
  sffd3699: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(98.4% 0.003 247.858)"
      }
    }
  },
  s33458b: {
    "marginTop": "calc(0.25rem * 1)"
  },
  s18c0f: {
    "height": "calc(0.25rem * 4)"
  },
  s1c45e: {
    "width": "calc(0.25rem * 4)"
  },
  sf032ed6c: {
    "flexShrink": "0"
  },
  s1aa17: {
    "padding": "calc(0.25rem * 4)"
  },
  s775755af: {
    "borderRadius": "calc(infinity * 1px)"
  },
  s34b56e: {
    "paddingBlock": "calc(0.25rem * 2)"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  s62c182b1: {
    "fontWeight": "600"
  },
  sba9051c0: {
    "color": "oklch(12.9% 0.042 264.695)"
  },
  sba904221: {
    "color": "oklch(55.4% 0.046 257.417)"
  },
  s9b8736ad: {
    "display": "inline-flex"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  sbad092cd: {
    "letterSpacing": "0.16em"
  },
  sd52b2d2: {
    "textTransform": "uppercase"
  },
  sc5cf0034: {
    "paddingInline": "calc(0.25rem * 2.5)"
  },
  s34b56d: {
    "paddingBlock": "calc(0.25rem * 1)"
  },
  s55426dfb: {
    "fontSize": "10px"
  },
  s34b1ae: {
    "paddingInline": "calc(0.25rem * 3)"
  },
  sc5dd13f4: {
    "paddingBlock": "calc(0.25rem * 1.5)"
  },
  s5542e25a: {
    "fontSize": "11px"
  },
  sbacfaa0f: {
    "letterSpacing": "0.14em"
  }
});
const styles_2 = stylex.create({
  s5574c491: {
    "marginInline": "auto"
  },
  s2ffff9: {
    "display": "flex"
  },
  s9ccd5d6c: {
    "maxWidth": "80rem"
  },
  s67e351ac: {
    "flexDirection": "column"
  },
  s5d936ff: {
    "gap": "calc(0.25rem * 6)"
  },
  s34b1ad: {
    "paddingInline": "calc(0.25rem * 2)"
  },
  s65783da: {
    "paddingBottom": "calc(0.25rem * 10)"
  },
  s308b46: {
    "display": "grid"
  },
  s925d9d66: {
    "@media ((min-width: 1280px))": {
      "gridTemplateColumns": "22rem minmax(0, 1fr)"
    }
  },
  sd5b893dc: {
    "pointerEvents": "none"
  },
  s67010d77: {
    "position": "absolute"
  },
  sbbfc415c: {
    "top": "50%"
  },
  sbe0abfee: {
    "left": "calc(0.25rem * 4)"
  },
  sca3de968: {
    "width": "calc(0.25rem * 4)",
    "height": "calc(0.25rem * 4)"
  },
  sba903e60: {
    "color": "oklch(70.4% 0.04 256.788)"
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
  s9c52f31d: {
    "borderColor": "oklch(92.9% 0.013 255.508)"
  },
  s605ce4a1: {
    "backgroundColor": "#fff"
  },
  s6618405: {
    "paddingInline": "calc(0.25rem * 11)"
  },
  s34b56f: {
    "paddingBlock": "calc(0.25rem * 3)"
  },
  sab7cc6fa: {
    "fontSize": "0.875rem",
    "lineHeight": "var(--text-sm--line-height)"
  },
  sba905125: {
    "color": "oklch(20.8% 0.042 265.755)"
  },
  s993b6d55: {
    "transitionProperty": "color, background-color, border-color, outline-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, translate, scale, rotate, filter, -webkit-backdrop-filter, backdrop-filter, display, content-visibility, overlay, pointer-events",
    "transitionTimingFunction": "var(--default-transition-timing-function)",
    "transitionDuration": "var(--default-transition-duration)"
  },
  sa602a1e3: {
    "outlineStyle": "none"
  },
  se97d538a: {
    ":focus": {
      "borderColor": "oklch(87.9% 0.169 91.605)"
    }
  },
  s4a7318b9: {
    ":focus": {
      "boxShadow": "\n 0 0 0 4px var(--ring-color, currentcolor)"
    }
  },
  sf50ebd8c: {
    ":focus": {}
  },
  s5d936fc: {
    "gap": "calc(0.25rem * 3)"
  },
  s255362dd: {
    "@media ((min-width: 768px))": {
      "gridTemplateColumns": "repeat(3, minmax(0, 1fr))"
    }
  },
  s198c6240: {
    "@media ((min-width: 1536px))": {
      "gridTemplateColumns": "minmax(0, 1.15fr) minmax(20rem, 0.85fr)"
    }
  },
  s457fddc1: {
    "minHeight": "25rem"
  },
  sa4e3feaa: {
    "borderColor": "color-mix(in oklab, oklch(20.8% 0.042 265.755) 10%, transparent)"
  },
  sf7e1ad8: {
    "backgroundColor": "oklch(12.9% 0.042 264.695)"
  },
  s34b1af: {
    "paddingInline": "calc(0.25rem * 4)"
  },
  s34b570: {
    "paddingBlock": "calc(0.25rem * 4)"
  },
  sa173a9a1: {
    "fontFamily": "var(--font-mono)"
  },
  s4491c72f: {
    "lineHeight": "calc(0.25rem * 6)"
  },
  sba90331d: {
    "color": "oklch(96.8% 0.007 247.896)"
  },
  s9b8736ad: {
    "display": "inline-flex"
  },
  sc6ed1702: {
    "alignItems": "center"
  },
  s5d936fb: {
    "gap": "calc(0.25rem * 2)"
  },
  s775755af: {
    "borderRadius": "calc(infinity * 1px)"
  },
  s269421c2: {
    "backgroundColor": "oklch(82.8% 0.189 84.429)"
  },
  s34b1b0: {
    "paddingInline": "calc(0.25rem * 5)"
  },
  s62c182b1: {
    "fontWeight": "600"
  },
  sba9051c0: {
    "color": "oklch(12.9% 0.042 264.695)"
  },
  s6bfaf7f: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(87.9% 0.169 91.605)"
      }
    }
  },
  s8b5b6275: {
    ":disabled": {
      "cursor": "not-allowed"
    }
  },
  s9de32834: {
    ":disabled": {
      "backgroundColor": "oklch(92.9% 0.013 255.508)"
    }
  },
  s444c52df: {
    ":disabled": {
      "color": "oklch(55.4% 0.046 257.417)"
    }
  },
  s5d936fd: {
    "gap": "calc(0.25rem * 4)"
  },
  s4df340b9: {
    "@media ((min-width: 1280px))": {
      "gridTemplateColumns": "repeat(2, minmax(0, 1fr))"
    }
  },
  sab7cc79b: {
    "fontSize": "0.75rem",
    "lineHeight": "var(--text-xs--line-height)"
  },
  sbaddc190: {
    "letterSpacing": "0.24em"
  },
  sba904221: {
    "color": "oklch(55.4% 0.046 257.417)"
  },
  sd52b2d2: {
    "textTransform": "uppercase"
  },
  s3f58665f: {
    "minWidth": "calc(0.25rem * 0)"
  },
  s551be8fb: {
    "backgroundColor": "oklch(94.1% 0.03 12.58)"
  },
  sc5cf0034: {
    "paddingInline": "calc(0.25rem * 2.5)"
  },
  s34b56d: {
    "paddingBlock": "calc(0.25rem * 1)"
  },
  s5542e25a: {
    "fontSize": "11px"
  },
  sbad092cd: {
    "letterSpacing": "0.16em"
  },
  sa4f34b99: {
    "color": "oklch(51.4% 0.222 16.935)"
  },
  s33458d: {
    "marginTop": "calc(0.25rem * 3)"
  },
  sbad17b8b: {
    "letterSpacing": "0.18em"
  },
  s33458e: {
    "marginTop": "calc(0.25rem * 4)"
  },
  s3301fb: {
    "marginBottom": "calc(0.25rem * 3)"
  },
  s589c8546: {
    "letterSpacing": "0.2em"
  },
  s92852dd5: {
    "overflow": "hidden"
  },
  sf799889b: {
    "borderRadius": "var(--radius)"
  },
  sda12834a: {
    "backgroundColor": "color-mix(in oklab, #fff 95%, transparent)"
  },
  s1aa15: {
    "padding": "calc(0.25rem * 2)"
  },
  sca5958f9: {
    "@media ((min-width: 640px))": {
      "padding": "calc(0.25rem * 6)"
    }
  },
  s3301fd: {
    "marginBottom": "calc(0.25rem * 5)"
  },
  s7c401f01: {
    "borderBottomStyle": "solid",
    "borderBottomWidth": "1px"
  },
  s9c52ef5c: {
    "borderColor": "oklch(96.8% 0.007 247.896)"
  },
  s345f1a: {
    "paddingBottom": "calc(0.25rem * 5)"
  },
  se5662726: {
    "@media ((min-width: 640px))": {
      "flexDirection": "row"
    }
  },
  s5660bef5: {
    "@media ((min-width: 640px))": {
      "alignItems": "flex-start"
    }
  },
  s828e88ab: {
    "@media ((min-width: 640px))": {
      "justifyContent": "space-between"
    }
  },
  sbadf930c: {
    "letterSpacing": "0.28em"
  },
  s34b56e: {
    "paddingBlock": "calc(0.25rem * 2)"
  },
  s129e46b3: {
    "fontWeight": "500"
  },
  sba9049a3: {
    "color": "oklch(37.2% 0.044 257.287)"
  },
  s713d995c: {
    ":hover": {
      "@media (hover: hover)": {
        "borderColor": "oklch(86.9% 0.022 252.894)"
      }
    }
  },
  sffd3699: {
    ":hover": {
      "@media (hover: hover)": {
        "backgroundColor": "oklch(98.4% 0.003 247.858)"
      }
    }
  },
  sa74dc89a: {
    ":disabled": {
      "borderColor": "oklch(96.8% 0.007 247.896)"
    }
  },
  s444c4f1e: {
    ":disabled": {
      "color": "oklch(70.4% 0.04 256.788)"
    }
  }
});
const styles = stylex.create({
  sd63a8a39: {
    position: 'relative',
    display: 'block'
  },
  s1fa2d8e6: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)'
  },
  se80bcbd2: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)'
  },
  sca3de968: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)'
  },
  se80bcbd3: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 3)'
  },
  s2b64fb66: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    animation: 'spin 1s linear infinite'
  },
  s99f3c3c3: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.4% 0.046 257.417)'
  },
  sc7c6263a: {
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.9% 0.013 255.508)',
    backgroundColor: 'oklch(98.4% 0.003 247.858)',
    padding: 'calc(0.25rem * 4)'
  },
  s155ffa56: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(27.9% 0.041 260.031)'
  },
  sc5293c96: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(20.8% 0.042 265.755)'
  },
  s4768be23: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(76.9% 0.188 70.08)'
  },
  s720ca7bb: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(44.6% 0.043 257.281)'
  },
  se228e976: {
    display: 'inline-flex',
    borderRadius: 'calc(infinity * 1px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.9% 0.013 255.508)',
    backgroundColor: 'oklch(96.8% 0.007 247.896)',
    padding: 'calc(0.25rem * 1)'
  },
  sff93336e: {
    overflow: 'hidden',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.9% 0.013 255.508)',
    backgroundColor: 'oklch(98.4% 0.003 247.858)'
  },
  s576f334c: {
    cursor: 'pointer',
    listStyleType: 'none',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(27.9% 0.041 260.031)'
  },
  s5e351f5f: {
    overflowX: 'auto',
    borderTopStyle: 'solid',
    borderTopWidth: '1px',
    borderColor: 'oklch(92.9% 0.013 255.508)',
    paddingInline: 'calc(0.25rem * 4)',
    paddingBlock: 'calc(0.25rem * 4)',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(37.2% 0.044 257.287)'
  },
  s7d0eb007: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.4% 0.046 257.417)'
  },
  s9f5ea161: {
    width: 'calc(0.25rem * 4)',
    height: 'calc(0.25rem * 4)',
    color: 'oklch(68.5% 0.169 237.323)'
  },
  sebadccac: {
    marginTop: 'calc(0.25rem * 4)',
    overflow: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)'
  },
  s78289774: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  s59cb3585: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    color: 'oklch(70.4% 0.04 256.788)'
  },
  s86ff3e4: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)'
  },
  s56ff61da: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600',
    color: 'oklch(20.8% 0.042 265.755)'
  },
  s36d848a6: {
    marginTop: 'calc(0.25rem * 2)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    wordBreak: 'break-all',
    color: 'oklch(55.4% 0.046 257.417)'
  },
  sb2d2baf0: {
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(20.8% 0.042 265.755)',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '600',
    color: '#fff'
  },
  s149f498c: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(44.6% 0.043 257.281)'
  },
  scbcc2085: {
    marginTop: 'calc(0.25rem * 3)',
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'calc(0.25rem * 2)'
  },
  s2aec4671: {
    marginLeft: 'calc(0.25rem * 2)',
    borderRadius: 'calc(infinity * 1px)',
    backgroundColor: 'oklch(92.9% 0.013 255.508)',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0em',
    color: 'oklch(27.9% 0.041 260.031)',
    textTransform: 'none'
  },
  se2631900: {
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(86.9% 0.022 252.894)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)'
  },
  s8b64edee: {
    marginTop: 'calc(0.25rem * 4)',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(86.9% 0.022 252.894)',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)'
  },
  s7b2650b8: {
    marginTop: 'calc(0.25rem * 4)',
    overflowX: 'auto',
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    padding: 'calc(0.25rem * 3)',
    fontSize: '0.75rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(37.2% 0.044 257.287)'
  },
  sdf14d023: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '1.5rem',
    lineHeight: 'calc(2 / 1.5)',
    fontWeight: '600',
    letterSpacing: '-0.025em',
    color: 'oklch(12.9% 0.042 264.695)'
  },
  sd77f856d: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(44.6% 0.043 257.281)'
  },
  sf032ed6c: {
    flexShrink: '0'
  },
  sd0177a8a: {
    marginTop: 'calc(0.25rem * 3)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(20.8% 0.042 265.755)'
  },
  sb3c7b34e: {
    borderRadius: 'calc(var(--radius) - 2px)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: '#fff',
    backgroundColor: '#fff',
    paddingInline: 'calc(0.25rem * 3)',
    paddingBlock: 'calc(0.25rem * 2)'
  },
  s4a3ea40b: {
    marginTop: 'calc(0.25rem * 1)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    wordBreak: 'break-all',
    color: 'oklch(27.9% 0.041 260.031)'
  },
  s5f49acfc: {
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(89.2% 0.058 10.001)',
    backgroundColor: 'oklch(96.9% 0.015 12.422)',
    padding: 'calc(0.25rem * 4)',
    color: 'oklch(45.5% 0.188 13.697)'
  },
  s69f644cf: {
    display: 'flex',
    alignItems: 'center',
    gap: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '600'
  },
  s9097ff5: {
    marginTop: 'calc(0.25rem * 2)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)'
  },
  s1300853f: {
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(89.2% 0.058 10.001)',
    backgroundColor: 'oklch(96.9% 0.015 12.422)',
    padding: 'calc(0.25rem * 6)',
    color: 'oklch(41% 0.159 10.272)'
  },
  sd6b3e1b6: {
    marginTop: 'calc(0.25rem * 3)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)'
  },
  s2a13436d: {
    borderRadius: 'var(--radius)',
    borderStyle: 'dashed',
    borderWidth: '1px',
    borderColor: 'oklch(86.9% 0.022 252.894)',
    backgroundColor: 'oklch(98.4% 0.003 247.858)',
    padding: 'calc(0.25rem * 6)',
    fontSize: '0.875rem',
    lineHeight: 'calc(0.25rem * 6)',
    color: 'oklch(55.4% 0.046 257.417)'
  }
});
export default function ApiLab() {
  const apiHost = useApiHost();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedKey = searchParams.get('key');
  const [routeFilter, setRouteFilter] = useState('');
  const deferredRouteFilter = useDeferredValue(routeFilter);
  const [schemaIndex, setSchemaIndex] = useState<ApiSchemaIndex | null>(null);
  const [isIndexLoading, setIsIndexLoading] = useState(true);
  const [indexError, setIndexError] = useState<string | null>(null);
  const [schemaDefinitions, setSchemaDefinitions] = useState<Record<string, ApiSchemaDefinition>>({});
  const [loadingDefinitionKey, setLoadingDefinitionKey] = useState<string | null>(null);
  const [definitionError, setDefinitionError] = useState<string | null>(null);
  const [draftInputs, setDraftInputs] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Record<string, ApiExecutionResult>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);
  const [schemaTab, setSchemaTab] = useState<'input' | 'output'>('input');
  useEffect(() => {
    setResults({});
    setRunError(null);
  }, [apiHost]);
  useEffect(() => {
    const abortController = new AbortController();
    setIsIndexLoading(true);
    setIndexError(null);
    setDefinitionError(null);
    setSchemaDefinitions({});
    fetch(buildAbsoluteUrl(apiHost, '/api/schema'), {
      signal: abortController.signal,
      headers: {
        Accept: 'application/json'
      }
    }).then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} loading /api/schema`);
      }
      return (await response.json()) as ApiSchemaIndex;
    }).then(nextIndex => {
      setSchemaIndex(nextIndex);
    }).catch((error: unknown) => {
      if (abortController.signal.aborted) {
        return;
      }
      setSchemaIndex(null);
      setIndexError(getErrorMessage(error));
    }).finally(() => {
      if (!abortController.signal.aborted) {
        setIsIndexLoading(false);
      }
    });
    return () => abortController.abort();
  }, [apiHost]);
  useEffect(() => {
    const routes = schemaIndex?.routes ?? [];
    if (!routes.length) {
      return;
    }
    const firstRoute = routes[0];
    if (!firstRoute) {
      return;
    }
    if (selectedKey && routes.some(route => route.key === selectedKey)) {
      return;
    }
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('key', firstRoute.key);
    setSearchParams(nextParams, {
      replace: true
    });
  }, [schemaIndex, searchParams, selectedKey, setSearchParams]);
  useEffect(() => {
    if (!selectedKey || schemaDefinitions[selectedKey]) {
      return;
    }
    const abortController = new AbortController();
    setLoadingDefinitionKey(selectedKey);
    setDefinitionError(null);
    setSchemaTab('input');
    fetch(buildAbsoluteUrl(apiHost, `/api/schema?key=${encodeURIComponent(selectedKey)}`), {
      signal: abortController.signal,
      headers: {
        Accept: 'application/json'
      }
    }).then(async response => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status} loading schema for ${selectedKey}`);
      }
      return (await response.json()) as ApiSchemaDefinition;
    }).then(definition => {
      setSchemaDefinitions(currentDefinitions => ({
        ...currentDefinitions,
        [definition.key]: definition
      }));
    }).catch((error: unknown) => {
      if (abortController.signal.aborted) {
        return;
      }
      setDefinitionError(getErrorMessage(error));
    }).finally(() => {
      if (!abortController.signal.aborted) {
        setLoadingDefinitionKey(null);
      }
    });
    return () => abortController.abort();
  }, [apiHost, schemaDefinitions, selectedKey]);
  const selectedDefinition = selectedKey ? schemaDefinitions[selectedKey] : undefined;
  useEffect(() => {
    if (!selectedDefinition) {
      return;
    }
    setDraftInputs(currentDrafts => {
      if (currentDrafts[selectedDefinition.key] !== undefined) {
        return currentDrafts;
      }
      return {
        ...currentDrafts,
        [selectedDefinition.key]: formatJsonValue(createStarterPayload(selectedDefinition.inputSchema, selectedDefinition.inputSchema))
      };
    });
  }, [selectedDefinition]);
  const filteredRoutes = (schemaIndex?.routes ?? []).filter(route => {
    const query = deferredRouteFilter.trim().toLowerCase();
    if (!query) {
      return true;
    }
    return route.key.toLowerCase().includes(query) || route.path.toLowerCase().includes(query) || route.kind.toLowerCase().includes(query);
  });
  const selectedInput = selectedKey ? draftInputs[selectedKey] ?? '' : '';
  const selectedResult = selectedKey ? results[selectedKey] : undefined;
  let previewError: string | null = null;
  let preview: ReturnType<typeof buildApiRequestPreview> | undefined;
  if (selectedDefinition && selectedInput) {
    try {
      preview = buildApiRequestPreview(apiHost, selectedDefinition, selectedInput);
    } catch (error) {
      previewError = getErrorMessage(error);
    }
  }
  const activeSchema = selectedDefinition && schemaTab === 'input' ? selectedDefinition.inputSchema : selectedDefinition?.outputSchema;
  async function handleRunRequest() {
    if (!selectedDefinition || !selectedKey) {
      return;
    }
    setIsRunning(true);
    setRunError(null);
    try {
      const result = await executeApiRequest(apiHost, selectedDefinition, draftInputs[selectedKey] ?? '');
      setResults(currentResults => ({
        ...currentResults,
        [selectedKey]: result
      }));
    } catch (error) {
      setRunError(getErrorMessage(error));
    } finally {
      setIsRunning(false);
    }
  }
  function handleRouteSelection(route: ApiSchemaRouteSummary) {
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('key', route.key);
    setSearchParams(nextParams);
  }
  function handleInputReset() {
    if (!selectedDefinition) {
      return;
    }
    setDraftInputs(currentDrafts => ({
      ...currentDrafts,
      [selectedDefinition.key]: formatJsonValue(createStarterPayload(selectedDefinition.inputSchema, selectedDefinition.inputSchema))
    }));
    setRunError(null);
  }
  function handleFormatJson() {
    if (!selectedKey) {
      return;
    }
    try {
      setDraftInputs(currentDrafts => ({
        ...currentDrafts,
        [selectedKey]: formatJsonValue(JSON.parse(currentDrafts[selectedKey] ?? ''))
      }));
      setRunError(null);
    } catch (error) {
      setRunError(getErrorMessage(error));
    }
  }
  function handleCopyPreviewUrl() {
    if (!preview) {
      return;
    }
    navigator.clipboard.writeText(preview.url);
  }
  return <div>
      <div className={stylex.props(styles_2.s5574c491, styles_2.s2ffff9, styles_2.s9ccd5d6c, styles_2.s67e351ac, styles_2.s5d936ff, styles_2.s34b1ad, styles_2.s65783da).className || ""}>
        <div className={stylex.props(styles_2.s308b46, styles_2.s5d936ff, styles_2.s925d9d66).className || ""}>
          <aside className={stylex.props(styles_5.sc7133e99).className || ""}>
            <Panel>
              <label className={stylex.props(styles.sd63a8a39).className || ''}>
                <Search className={stylex.props(styles_2.sd5b893dc, styles_2.s67010d77, styles_2.sbbfc415c, styles_2.sbe0abfee, styles_2.sca3de968, styles_2.sba903e60).className || ""} />
                <input type="search" value={routeFilter} onChange={event => setRouteFilter(event.target.value)} placeholder="Filter by key or path" className={stylex.props(styles_2.scdbaf625, styles_2.sf79988b7, styles_2.sad8c742c, styles_2.s9c52f31d, styles_2.s605ce4a1, styles_2.s6618405, styles_2.s34b56f, styles_2.sab7cc6fa, styles_2.sba905125, styles_2.s993b6d55, styles_2.sa602a1e3, styles_2.se97d538a, styles_2.s4a7318b9, styles_2.sf50ebd8c).className || ""} />
              </label>

              {isIndexLoading ? <MutedState message="Loading /api/schema…" /> : indexError ? <ErrorState message={indexError} /> : filteredRoutes.length ? <div className={stylex.props(styles_5.sc7133e99).className || ""}>
                  <RouteGroup title="Queries" routes={filteredRoutes.filter(route => route.kind === 'query')} selectedKey={selectedKey} onSelect={handleRouteSelection} />
                  <RouteGroup title="Actions" routes={filteredRoutes.filter(route => route.kind === 'action')} selectedKey={selectedKey} onSelect={handleRouteSelection} />
                </div> : <MutedState message="No endpoints match the current filter." />}
            </Panel>
          </aside>

          <main className={stylex.props(styles_5.sc7133e9b).className || ""}>
            {selectedDefinition ? <>
                <Panel eyebrow={selectedDefinition.kind} title={selectedDefinition.key} subtitle={`${selectedDefinition.method} ${selectedDefinition.path}`} actions={<div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                      <StatusPill label={selectedDefinition.inputEncoding} tone="amber" />
                      <StatusPill label={selectedDefinition.outputSerialization} tone="sky" />
                      {selectedDefinition.usesParamMapping ? <StatusPill label="Mapped query params" tone="slate" /> : null}
                    </div>}>
                  <div className={stylex.props(styles_2.s308b46, styles_2.s5d936fc, styles_2.s255362dd).className || ""}>
                    <MetaBlock label="Method" value={selectedDefinition.method} />
                    <MetaBlock label="Request Body" value={selectedDefinition.inputEncoding} />
                    <MetaBlock label="Response" value={`${selectedDefinition.outputEncoding} + ${selectedDefinition.outputSerialization}`} />
                  </div>
                </Panel>

                <div className={stylex.props(styles_2.s308b46, styles_2.s5d936ff, styles_2.s198c6240).className || ""}>
                  <Panel eyebrow="Request Composer" title="Input JSON" subtitle="Edit the logical input payload. The lab will derive the real wire shape from the schema." actions={<div className={stylex.props(styles.se80bcbd2).className || ''}>
                        <ActionButton onClick={handleInputReset} disabled={!selectedDefinition}>
                          <RefreshCw className={stylex.props(styles.sca3de968).className || ''} />
                          Reset
                        </ActionButton>
                        <ActionButton onClick={handleFormatJson} disabled={!selectedDefinition || !!previewError}>
                          <Sparkles className={stylex.props(styles.sca3de968).className || ''} />
                          Format JSON
                        </ActionButton>
                      </div>}>
                    <textarea value={selectedInput} onChange={event => {
                  if (!selectedKey) {
                    return;
                  }
                  setDraftInputs(currentDrafts => ({
                    ...currentDrafts,
                    [selectedKey]: event.target.value
                  }));
                  setRunError(null);
                }} spellCheck={false} className={stylex.props(styles_2.s457fddc1, styles_2.scdbaf625, styles_2.sf79988b7, styles_2.sad8c742c, styles_2.sa4e3feaa, styles_2.sf7e1ad8, styles_2.s34b1af, styles_2.s34b570, styles_2.sa173a9a1, styles_2.sab7cc6fa, styles_2.s4491c72f, styles_2.sba90331d, styles_2.s993b6d55, styles_2.sa602a1e3, styles_2.se97d538a, styles_2.s4a7318b9, styles_2.sf50ebd8c).className || ""} />

                    {previewError ? <InlineAlert title="Preview unavailable" message={previewError} /> : null}
                    {runError ? <InlineAlert title="Request failed" message={runError} /> : null}

                    <div className={stylex.props(styles.se80bcbd3).className || ''}>
                      <button type="button" onClick={handleRunRequest} disabled={!preview || isRunning} className={stylex.props(styles_2.s9b8736ad, styles_2.sc6ed1702, styles_2.s5d936fb, styles_2.s775755af, styles_2.s269421c2, styles_2.s34b1b0, styles_2.s34b56f, styles_2.sab7cc6fa, styles_2.s62c182b1, styles_2.sba9051c0, styles_2.s993b6d55, styles_2.s6bfaf7f, styles_2.s8b5b6275, styles_2.s9de32834, styles_2.s444c52df).className || ""}>
                        {isRunning ? <RefreshCw className={stylex.props(styles.s2b64fb66).className || ''} /> : <TerminalSquare className={stylex.props(styles.sca3de968).className || ''} />}
                        {isRunning ? 'Running…' : 'Run request'}
                      </button>
                      <div className={stylex.props(styles.s99f3c3c3).className || ''}>
                        <ArrowRight className={stylex.props(styles.sca3de968).className || ''} />
                        Exact transport: {selectedDefinition.method}{' '}
                        {selectedDefinition.method === 'GET' ? 'query string' : 'CBOR body'}
                      </div>
                    </div>
                  </Panel>

                  <Panel eyebrow="Wire Preview" title="HTTP Request" subtitle="The resolved request that will be sent to the desktop API." actions={<ActionButton onClick={handleCopyPreviewUrl} disabled={!preview}>
                        <Copy className={stylex.props(styles.sca3de968).className || ''} />
                        Copy URL
                      </ActionButton>}>
                    {preview ? <div className={stylex.props(styles_5.sc7133e9a).className || ""}>
                        <div className={stylex.props(styles.sc7c6263a).className || ''}>
                          <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                            <StatusPill label={preview.method} tone="slate" />
                            <p className={stylex.props(styles.s155ffa56).className || ''}>{preview.url}</p>
                          </div>
                        </div>

                        <KeyValueList title="Headers" rows={Object.entries(preview.headers).map(([key, value]) => ({
                    key,
                    value
                  }))} />

                        {preview.method === 'GET' ? <KeyValueList title="Query Params" rows={preview.queryParams ?? []} emptyMessage="No query params are required for this request." /> : <div className={stylex.props(styles.sc7c6263a).className || ''}>
                            <div className={stylex.props(styles.sc5293c96).className || ''}>
                              <Binary className={stylex.props(styles.s4768be23).className || ''} />
                              CBOR body
                            </div>
                            <p className={stylex.props(styles.s720ca7bb).className || ''}>
                              {preview.cborByteLength ?? 0} bytes generated from the current JSON payload.
                            </p>
                          </div>}
                      </div> : <MutedState message="Select an endpoint and enter valid JSON to generate a request preview." />}
                  </Panel>
                </div>

                <Panel eyebrow="Schema Guide" title={schemaTab === 'input' ? 'Input Schema' : 'Output Schema'} subtitle="Follow the schema tree while composing requests or inspecting response structure." actions={<div className={stylex.props(styles.se228e976).className || ''}>
                      <SchemaTabButton label="Input" isActive={schemaTab === 'input'} onClick={() => setSchemaTab('input')} />
                      <SchemaTabButton label="Output" isActive={schemaTab === 'output'} onClick={() => setSchemaTab('output')} />
                    </div>}>
                  {loadingDefinitionKey === selectedDefinition.key ? <MutedState message="Loading schema detail…" /> : definitionError ? <ErrorState message={definitionError} /> : activeSchema ? <div className={stylex.props(styles_5.sc7133e99).className || ""}>
                      <SchemaNodeView rootSchema={activeSchema} schema={activeSchema} name={schemaTab === 'input' ? 'input' : 'output'} isRoot />

                      <details className={stylex.props(styles.sff93336e).className || ''}>
                        <summary className={stylex.props(styles.s576f334c).className || ''}>Raw JSON Schema</summary>
                        <pre className={stylex.props(styles.s5e351f5f).className || ''}>
                          {formatJsonValue(activeSchema)}
                        </pre>
                      </details>
                    </div> : <MutedState message="Schema details are not available yet." />}
                </Panel>

                <Panel eyebrow="Response" title="Result" subtitle="Status, raw payload, and decoded output from the last request for this endpoint.">
                  {selectedResult ? <div className={stylex.props(styles_5.sc7133e9a).className || ""}>
                      <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
                        <StatusPill label={`${selectedResult.status} ${selectedResult.statusText}`.trim()} tone={selectedResult.ok ? 'emerald' : 'rose'} />
                        <p className={stylex.props(styles.s7d0eb007).className || ''}>
                          {selectedResult.ok ? 'Decoded with superjson.' : 'Non-2xx responses are shown raw.'}
                        </p>
                      </div>

                      <KeyValueList title="Headers" rows={Object.entries(selectedResult.headers).map(([key, value]) => ({
                  key,
                  value
                }))} />

                      <div className={stylex.props(styles_2.s308b46, styles_2.s5d936fd, styles_2.s4df340b9).className || ""}>
                        <ResponseBlock title="Raw Body" content={selectedResult.rawBody ? prettyRawBody(selectedResult.rawBody) : '(empty response body)'} />
                        <div className={stylex.props(styles.sc7c6263a).className || ''}>
                          <div className={stylex.props(styles.sc5293c96).className || ''}>
                            <Braces className={stylex.props(styles.s9f5ea161).className || ''} />
                            Decoded Output
                          </div>
                          <div className={stylex.props(styles.sebadccac).className || ''}>
                            {selectedResult.decodedBody !== undefined ? <DataViewer data={selectedResult.decodedBody} /> : <MutedState message="No decoded payload for this response." />}
                          </div>
                        </div>
                      </div>
                    </div> : <MutedState message="Run a request to populate the response panel." />}
                </Panel>
              </> : definitionError ? <ErrorState message={definitionError} /> : loadingDefinitionKey ? <MutedState message={`Loading schema for ${loadingDefinitionKey}…`} /> : <MutedState message="Choose an endpoint from the schema index to start exploring." />}
          </main>
        </div>
      </div>
    </div>;
}
function RouteGroup({
  title,
  routes,
  selectedKey,
  onSelect
}: {
  title: string;
  routes: ApiSchemaRouteSummary[];
  selectedKey: string | null;
  onSelect: (route: ApiSchemaRouteSummary) => void;
}) {
  if (!routes.length) {
    return null;
  }
  return <section className={stylex.props(styles_5.sc7133e97).className || ""}>
      <div className={stylex.props(styles.s78289774).className || ''}>
        <h2 className={stylex.props(styles_2.sab7cc79b, styles_2.s62c182b1, styles_2.sbaddc190, styles_2.sba904221, styles_2.sd52b2d2).className || ""}>{title}</h2>
        <span className={stylex.props(styles.s59cb3585).className || ''}>{routes.length}</span>
      </div>

      <div className={stylex.props(styles_5.sc7133e97).className || ""}>
        {routes.map(route => {
        const isSelected = route.key === selectedKey;
        return <button key={route.key} type="button" onClick={() => onSelect(route)} className={(stylex.props(styles_3.s2ffff9, styles_3.scdbaf625, styles_3.s93b5f015, styles_3.sc1a629cb, styles_3.s5d936fc, styles_3.sf799889b, styles_3.sad8c742c, styles_3.s34b1af, styles_3.s34b56f, styles_3.sbf63b0a7, styles_3.s993b6d55).className || "") + " " + (isSelected ? stylex.props(styles_4.sb3691128, styles_4.se878644d).className || "" : stylex.props(styles_3.s9c52f31d, styles_3.s605ce4a1, styles_3.s713d995c, styles_3.sffd3699).className || "")}>
              <div className={stylex.props(styles_2.s3f58665f).className || ""}>
                <div className={stylex.props(styles.s86ff3e4).className || ''}>
                  <span className={stylex.props(styles.s56ff61da).className || ''}>{route.key}</span>
                  <StatusPill label={route.method} tone={route.kind === 'query' ? 'sky' : 'amber'} compact />
                </div>
                <p className={stylex.props(styles.s36d848a6).className || ''}>{route.path}</p>
              </div>
              <ChevronRight className={(stylex.props(styles_3.s33458b, styles_3.s18c0f, styles_3.s1c45e, styles_3.sf032ed6c, styles_3.s993b6d55).className || "") + " " + (isSelected ? stylex.props(styles_4.sd1a65c6b).className || "" : stylex.props(styles_4.sba903a9f).className || "")} />
            </button>;
      })}
      </div>
    </section>;
}
function SchemaNodeView({
  rootSchema,
  schema,
  name,
  required = false,
  isRoot = false
}: {
  rootSchema: JSONSchemaNode;
  schema: JSONSchemaNode;
  name?: string;
  required?: boolean;
  isRoot?: boolean;
}) {
  const resolvedSchema = resolveSchemaNode(rootSchema, schema);
  const schemaType = getSchemaType(resolvedSchema);
  const variants = resolvedSchema.oneOf ?? resolvedSchema.anyOf;
  return <div className={(stylex.props(styles_3.sf799889b, styles_3.sad8c742c, styles_3.s9c52f31d).className || "") + " " + (isRoot ? stylex.props(styles_3.s605ce4a1).className || "" : stylex.props(styles_4.s7fefd7).className || "") + " " + (stylex.props(styles_3.s1aa17).className || "")}>
      <div className={stylex.props(styles.s1fa2d8e6).className || ''}>
        {name ? <code className={stylex.props(styles.sb2d2baf0).className || ''}>{name}</code> : null}
        {required ? <span className={stylex.props(styles_2.s775755af, styles_2.s551be8fb, styles_2.sc5cf0034, styles_2.s34b56d, styles_2.s5542e25a, styles_2.s62c182b1, styles_2.sbad092cd, styles_2.sa4f34b99, styles_2.sd52b2d2).className || ""}>
            required
          </span> : null}
        {schemaType ? <SchemaBadge label={schemaType} tone="slate" /> : null}
        {resolvedSchema['x-js-type'] ? <SchemaBadge label={resolvedSchema['x-js-type']} tone="amber" /> : null}
        {resolvedSchema.contentEncoding ? <SchemaBadge label={`encoding: ${resolvedSchema.contentEncoding}`} tone="sky" /> : null}
      </div>

      {resolvedSchema.description ? <p className={stylex.props(styles.s149f498c).className || ''}>{resolvedSchema.description}</p> : null}

      {resolvedSchema.enum?.length ? <div className={stylex.props(styles.scbcc2085).className || ''}>
          {resolvedSchema.enum.map((option, optionIndex) => <SchemaBadge key={`${String(option)}-${optionIndex}`} label={formatInlineValue(option)} tone="emerald" />)}
        </div> : null}

      {resolvedSchema.default !== undefined ? <p className={stylex.props(styles_2.s33458d, styles_2.sab7cc79b, styles_2.sbad17b8b, styles_2.sba904221, styles_2.sd52b2d2).className || ""}>
          Default{' '}
          <span className={stylex.props(styles.s2aec4671).className || ''}>
            {formatInlineValue(resolvedSchema.default)}
          </span>
        </p> : null}

      {variants?.length ? <div className={stylex.props(styles_2.s33458e).className || ""}>
          {variants.map((variant, index) => <div key={`variant-${index}`} className={stylex.props(styles.se2631900).className || ''}>
              <p className={stylex.props(styles_2.s3301fb, styles_2.sab7cc79b, styles_2.s62c182b1, styles_2.s589c8546, styles_2.sba904221, styles_2.sd52b2d2).className || ""}>Option {index + 1}</p>
              <SchemaNodeView rootSchema={rootSchema} schema={variant} name={undefined} />
            </div>)}
        </div> : null}

      {(schemaType === 'object' || !schemaType && resolvedSchema.properties) && resolvedSchema.properties ? <div className={stylex.props(styles_2.s33458e).className || ""}>
          {Object.entries(resolvedSchema.properties).map(([propertyName, propertySchema]) => <SchemaNodeView key={propertyName} rootSchema={rootSchema} schema={propertySchema} name={propertyName} required={resolvedSchema.required?.includes(propertyName)} />)}
        </div> : null}

      {schemaType === 'array' ? <div className={stylex.props(styles.s8b64edee).className || ''}>
          <p className={stylex.props(styles_2.s3301fb, styles_2.sab7cc79b, styles_2.s62c182b1, styles_2.s589c8546, styles_2.sba904221, styles_2.sd52b2d2).className || ""}>Array Items</p>
          {Array.isArray(resolvedSchema.items) ? resolvedSchema.items.map((itemSchema, index) => <SchemaNodeView key={`array-item-${index}`} rootSchema={rootSchema} schema={itemSchema} name={`item ${index + 1}`} />) : resolvedSchema.items ? <SchemaNodeView rootSchema={rootSchema} schema={resolvedSchema.items} name="item" /> : <MutedState message="Array item schema is not specified." />}
        </div> : null}

      {resolvedSchema.additionalProperties && typeof resolvedSchema.additionalProperties === 'object' ? <div className={stylex.props(styles.s8b64edee).className || ''}>
          <p className={stylex.props(styles_2.s3301fb, styles_2.sab7cc79b, styles_2.s62c182b1, styles_2.s589c8546, styles_2.sba904221, styles_2.sd52b2d2).className || ""}>Additional Properties</p>
          <SchemaNodeView rootSchema={rootSchema} schema={resolvedSchema.additionalProperties} name="*" />
        </div> : null}
    </div>;
}
function ResponseBlock({
  title,
  content
}: {
  title: string;
  content: string;
}) {
  return <div className={stylex.props(styles.sc7c6263a).className || ''}>
      <div className={stylex.props(styles.sc5293c96).className || ''}>
        <Braces className={stylex.props(styles.s4768be23).className || ''} />
        {title}
      </div>
      <pre className={stylex.props(styles.s7b2650b8).className || ''}>{content}</pre>
    </div>;
}
function Panel({
  eyebrow,
  title,
  subtitle,
  actions,
  children
}: {
  eyebrow?: string;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return <section className={stylex.props(styles_2.s92852dd5, styles_2.sf799889b, styles_2.sad8c742c, styles_2.s9c52f31d, styles_2.sda12834a, styles_2.s1aa15, styles_2.sca5958f9).className || ""}>
      {eyebrow || title || subtitle ? <div className={stylex.props(styles_2.s3301fd, styles_2.s2ffff9, styles_2.s67e351ac, styles_2.s5d936fd, styles_2.s7c401f01, styles_2.s9c52ef5c, styles_2.s345f1a, styles_2.se5662726, styles_2.s5660bef5, styles_2.s828e88ab).className || ""}>
          <div>
            {eyebrow ? <p className={stylex.props(styles_2.sab7cc79b, styles_2.s62c182b1, styles_2.sbadf930c, styles_2.sba904221, styles_2.sd52b2d2).className || ""}>{eyebrow}</p> : null}
            {title ? <h2 className={stylex.props(styles.sdf14d023).className || ''}>{title}</h2> : null}
            {subtitle ? <p className={stylex.props(styles.sd77f856d).className || ''}>{subtitle}</p> : null}
          </div>
          {actions ? <div className={stylex.props(styles.sf032ed6c).className || ''}>{actions}</div> : null}
        </div> : null}
      <div className={stylex.props(styles_5.sc7133e99).className || ""}>{children}</div>
    </section>;
}
function ActionButton({
  children,
  onClick,
  disabled = false
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return <button type="button" onClick={onClick} disabled={disabled} className={stylex.props(styles_2.s9b8736ad, styles_2.sc6ed1702, styles_2.s5d936fb, styles_2.s775755af, styles_2.sad8c742c, styles_2.s9c52f31d, styles_2.s605ce4a1, styles_2.s34b1af, styles_2.s34b56e, styles_2.sab7cc6fa, styles_2.s129e46b3, styles_2.sba9049a3, styles_2.s993b6d55, styles_2.s713d995c, styles_2.sffd3699, styles_2.s8b5b6275, styles_2.sa74dc89a, styles_2.s444c4f1e).className || ""}>
      {children}
    </button>;
}
function SchemaTabButton({
  label,
  isActive,
  onClick
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
}) {
  return <button type="button" onClick={onClick} className={(stylex.props(styles_3.s775755af, styles_3.s34b1af, styles_3.s34b56e, styles_3.sab7cc6fa, styles_3.s62c182b1, styles_3.s993b6d55).className || "") + " " + (isActive ? stylex.props(styles_3.s605ce4a1, styles_3.sba9051c0).className || "" : stylex.props(styles_3.sba904221).className || "")}>
      {label}
    </button>;
}
function StatusPill({
  label,
  tone,
  compact = false
}: {
  label: string;
  tone: 'amber' | 'sky' | 'slate' | 'emerald' | 'rose';
  compact?: boolean;
}) {
  return <span className={(stylex.props(styles_3.s9b8736ad, styles_3.sc6ed1702, styles_3.s775755af, styles_3.s62c182b1, styles_3.sbad092cd, styles_3.sd52b2d2).className || "") + " " + (compact ? stylex.props(styles_3.sc5cf0034, styles_3.s34b56d, styles_3.s55426dfb).className || "" : stylex.props(styles_3.s34b1ae, styles_3.sc5dd13f4, styles_3.s5542e25a).className || "")}>
      {label}
    </span>;
}
function SchemaBadge({
  label,
  tone
}: {
  label: string;
  tone: 'amber' | 'sky' | 'slate' | 'emerald';
}) {
  return <span className={stylex.props(styles_3.s775755af, styles_3.sc5cf0034, styles_3.s34b56d, styles_3.s5542e25a, styles_3.s62c182b1, styles_3.sbacfaa0f, styles_3.sd52b2d2).className || ""}>
      {label}
    </span>;
}
function MetaBlock({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return <div className={stylex.props(styles.sc7c6263a).className || ''}>
      <p className={stylex.props(styles_2.sab7cc79b, styles_2.s62c182b1, styles_2.s589c8546, styles_2.sba904221, styles_2.sd52b2d2).className || ""}>{label}</p>
      <p className={stylex.props(styles.sd0177a8a).className || ''}>{value}</p>
    </div>;
}
function KeyValueList({
  title,
  rows,
  emptyMessage = 'Nothing to show.'
}: {
  title: string;
  rows: Array<{
    key: string;
    value: string;
  }>;
  emptyMessage?: string;
}) {
  return <div className={stylex.props(styles.sc7c6263a).className || ''}>
      <div className={stylex.props(styles.sc5293c96).className || ''}>
        <ArrowRight className={stylex.props(styles.s9f5ea161).className || ''} />
        {title}
      </div>
      {rows.length ? <div className={stylex.props(styles_2.s33458e).className || ""}>
          {rows.map(row => <div key={`${row.key}-${row.value}`} className={stylex.props(styles.sb3c7b34e).className || ''}>
              <p className={stylex.props(styles_2.s5542e25a, styles_2.s62c182b1, styles_2.sbad17b8b, styles_2.sba904221, styles_2.sd52b2d2).className || ""}>{row.key}</p>
              <p className={stylex.props(styles.s4a3ea40b).className || ''}>{row.value}</p>
            </div>)}
        </div> : <MutedState message={emptyMessage} />}
    </div>;
}
function InlineAlert({
  title,
  message
}: {
  title: string;
  message: string;
}) {
  return <div className={stylex.props(styles.s5f49acfc).className || ''}>
      <div className={stylex.props(styles.s69f644cf).className || ''}>
        <AlertCircle className={stylex.props(styles.sca3de968).className || ''} />
        {title}
      </div>
      <p className={stylex.props(styles.s9097ff5).className || ''}>{message}</p>
    </div>;
}
function ErrorState({
  message
}: {
  message: string;
}) {
  return <div className={stylex.props(styles.s1300853f).className || ''}>
      <div className={stylex.props(styles_2.s2ffff9, styles_2.sc6ed1702, styles_2.s5d936fb, styles_2.sab7cc6fa, styles_2.s62c182b1, styles_2.sbad17b8b, styles_2.sd52b2d2).className || ""}>
        <Unplug className={stylex.props(styles.sca3de968).className || ''} />
        Error
      </div>
      <p className={stylex.props(styles.sd6b3e1b6).className || ''}>{message}</p>
    </div>;
}
function MutedState({
  message
}: {
  message: string;
}) {
  return <div className={stylex.props(styles.s2a13436d).className || ''}>{message}</div>;
}
function buildAbsoluteUrl(apiHost: string, path: string): string {
  return `${apiHost.replace(/\/+$/, '')}${path}`;
}
function formatJsonValue(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
function formatInlineValue(value: unknown): string {
  if (typeof value === 'string') {
    return JSON.stringify(value);
  }
  return String(value);
}
function prettyRawBody(rawBody: string): string {
  try {
    return JSON.stringify(JSON.parse(rawBody), null, 2);
  } catch {
    return rawBody;
  }
}
function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
const pillStyles = stylex.create({
  amber: {
    backgroundColor: 'var(--color-amber-100)',
    color: 'var(--color-amber-800)'
  },
  sky: {
    backgroundColor: 'var(--color-sky-100)',
    color: 'var(--color-sky-800)'
  },
  emerald: {
    backgroundColor: 'var(--color-emerald-100)',
    color: 'var(--color-emerald-800)'
  },
  rose: {
    backgroundColor: 'var(--color-rose-100)',
    color: 'var(--color-rose-800)'
  },
  slate: {
    backgroundColor: 'var(--color-slate-200)',
    color: 'var(--color-slate-800)'
  },
});
function getPillClasses(tone: 'amber' | 'sky' | 'slate' | 'emerald' | 'rose'): string {
  return stylex.props(pillStyles[tone]).className || '';
}
function getSchemaType(schema: JSONSchemaNode): string | undefined {
  if (Array.isArray(schema.type)) {
    return schema.type.find(type => type !== 'null') ?? schema.type[0];
  }
  return schema.type;
}
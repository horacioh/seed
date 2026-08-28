import * as stylex from '@stylexjs/stylex'
import {resolveHypermediaRoute, useOpenUrl} from './navigation'
import {getAgentsPlatform} from './platform'
import {DEFAULT_GATEWAY_URL} from '@shm/shared/constants'
import {useResource} from '@shm/shared/models/entity'
import {hmId, routeToUrl} from '@shm/shared/utils/entity-id-url'
import React from 'react'
import ReactMarkdown, {defaultUrlTransform, type Components, type ExtraProps} from 'react-markdown'
// The bare `remark-gfm` specifier is ambiguous in the renderer bundle: the
// vite alias pulls @shm/editor in by source, so the dep optimizer resolves
// `remark-gfm` against the editor's node_modules (v3, mdast-util v1 era) and
// serves that single prebundle to every importer. react-markdown@10 needs the
// v4 mdast context — feeding it v3 throws `this.getData is not a function`
// on inline code inside tables. The npm-aliased name pins v4 unambiguously.
import remarkGfm from 'remark-gfm-v4'
const styles_3 = stylex.create({
  s2110670f: {
    color: 'var(--color-blue-400)',
    textDecorationLine: 'underline',
    ':hover': {
      '@media (hover: hover)': {
        color: 'var(--color-blue-300)',
      },
    },
  },
  sc24b3a33: {
    marginTop: 'calc(var(--spacing) * 3)',
    marginBottom: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-base)',
    lineHeight: 'var(--text-base--line-height)',
    fontWeight: 'var(--font-weight-bold)',
    ':firstChild': {
      marginTop: 'calc(var(--spacing) * 0)',
    },
  },
  s3af3230a: {
    marginTop: 'calc(var(--spacing) * 3)',
    marginBottom: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    fontWeight: 'var(--font-weight-bold)',
    ':firstChild': {
      marginTop: 'calc(var(--spacing) * 0)',
    },
  },
  s823458fc: {
    marginTop: 'calc(var(--spacing) * 2)',
    marginBottom: 'calc(var(--spacing) * 1)',
    fontSize: 'var(--text-sm)',
    lineHeight: 'var(--text-sm--line-height)',
    fontWeight: 'var(--font-weight-semibold)',
    ':firstChild': {
      marginTop: 'calc(var(--spacing) * 0)',
    },
  },
  se79e65b6: {
    marginBottom: 'calc(var(--spacing) * 2)',
    ':lastChild': {
      marginBottom: 'calc(var(--spacing) * 0)',
    },
  },
  s841f6c1: {
    marginBottom: 'calc(var(--spacing) * 2)',
    listStyleType: 'disc',
    paddingLeft: 'calc(var(--spacing) * 4)',
    ':lastChild': {
      marginBottom: 'calc(var(--spacing) * 0)',
    },
  },
  sf7d172b7: {
    marginBottom: 'calc(var(--spacing) * 2)',
    listStyleType: 'decimal',
    paddingLeft: 'calc(var(--spacing) * 4)',
    ':lastChild': {
      marginBottom: 'calc(var(--spacing) * 0)',
    },
  },
  sf8817373: {
    borderColor: 'color-mix(in oklab, var(--muted-foreground) 30%, transparent)',
    marginBlock: 'calc(var(--spacing) * 2)',
    borderLeftStyle: 'solid',
    borderLeftWidth: '2px',
    paddingLeft: 'calc(var(--spacing) * 3)',
    fontStyle: 'italic',
  },
  s63698ec9: {
    backgroundColor: 'color-mix(in oklab, var(--background) 50%, transparent)',
    marginBlock: 'calc(var(--spacing) * 2)',
    overflowX: 'auto',
    borderRadius: '0.25rem',
    padding: 'calc(var(--spacing) * 2)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  s70e23123: {
    backgroundColor: 'color-mix(in oklab, var(--background) 50%, transparent)',
    borderRadius: '0.25rem',
    paddingInline: 'calc(var(--spacing) * 1)',
    paddingBlock: 'calc(var(--spacing) * 0.5)',
    fontSize: 'var(--text-xs)',
    lineHeight: 'var(--text-xs--line-height)',
  },
  sc43c4b56: {
    backgroundColor: 'color-mix(in oklab, var(--background) 30%, transparent)',
  },
})
const styles_2 = stylex.create({
  s2f83379c: {
    borderColor: 'var(--border)',
    minWidth: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
})
const styles = stylex.create({
  sbf7a69bf: {
    marginBottom: 'calc(0.25rem * 0.5)',
  },
  s62c182b1: {
    fontWeight: '600',
  },
  s9c6533a5: {
    borderColor: 'var(--border)',
    marginBlock: 'calc(0.25rem * 3)',
  },
  sab7cc79b: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
  },
  s1026c40: {
    marginBlock: 'calc(0.25rem * 2)',
    overflowX: 'auto',
  },
  sf88965b7: {
    borderColor: 'var(--border)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
    textAlign: 'left',
    fontWeight: '600',
  },
  s6904bfdf: {
    borderColor: 'var(--border)',
    borderStyle: 'solid',
    borderWidth: '1px',
    paddingInline: 'calc(0.25rem * 2)',
    paddingBlock: 'calc(0.25rem * 1)',
  },
})
type MdastNode = {
  type?: string
  value?: string
  children?: MdastNode[]
}

/**
 * Removes HTML comment nodes so HM identity markers (`<!-- id:… -->`,
 * `<!-- col:… -->`) and any other comments never render as literal text in
 * chat. Operates on the mdast tree, so comments inside code blocks and code
 * spans are untouched — their content lives in code nodes, not html nodes.
 */
function remarkStripHtmlComments() {
  const strip = (node: MdastNode) => {
    if (!node.children) return
    node.children = node.children.filter(
      (child) =>
        !(child.type === 'html' && typeof child.value === 'string' && child.value.trimStart().startsWith('<!--')),
    )
    node.children.forEach(strip)
  }
  return (tree: MdastNode) => strip(tree)
}

// The platform is registered once before render and never swapped, so resolving the optional
// gateway hook through a wrapper keeps hook order stable across renders.
const useGatewayUrlHook: () => string | undefined = () => {
  return (getAgentsPlatform().useGatewayUrl ?? (() => undefined))()
}
function MarkdownLink({href, children}: React.ComponentProps<'a'> & ExtraProps) {
  const openUrl = useOpenUrl()
  const gatewayUrl = useGatewayUrlHook() || DEFAULT_GATEWAY_URL
  const isHypermediaLink = href?.startsWith('hm://') ?? false
  const resolvedLink = React.useMemo(
    () => (href && isHypermediaLink ? resolveHypermediaRoute(href) : null),
    [href, isHypermediaLink],
  )
  const siteHome = useResource(resolvedLink ? hmId(resolvedLink.id.uid) : null)
  const siteUrl = siteHome.data?.type === 'document' ? siteHome.data.document.metadata?.siteUrl : null
  const renderedHref = React.useMemo(() => {
    if (!href || !resolvedLink) return href
    return (
      routeToUrl(resolvedLink.route, {
        hostname: siteUrl || gatewayUrl,
        originHomeId: siteUrl ? hmId(resolvedLink.id.uid) : undefined,
      }) || href
    )
  }, [gatewayUrl, href, resolvedLink, siteUrl])
  return (
    <a
      href={renderedHref}
      className={stylex.props(styles_3.s2110670f).className || ''}
      target={isHypermediaLink ? undefined : '_blank'}
      rel={isHypermediaLink ? undefined : 'noopener noreferrer'}
      onClick={(event) => {
        if (!href || !isHypermediaLink) return
        event.preventDefault()
        openUrl(href, event.metaKey || event.shiftKey)
      }}
    >
      {children}
    </a>
  )
}

/** Renders assistant markdown with in-app handling for Hypermedia links.
 *
 * GFM (tables, strikethrough, autolinks) is on by default; callers pass
 * `enableGfm={false}` while streaming so half-written tables don't flicker
 * between table and paragraph rendering mid-stream. */
export function Markdown({children, enableGfm = true}: {children: string; enableGfm?: boolean}) {
  const components: Components = {
    h1: ({children}) => <h1 className={stylex.props(styles_3.sc24b3a33).className || ''}>{children}</h1>,
    h2: ({children}) => <h2 className={stylex.props(styles_3.s3af3230a).className || ''}>{children}</h2>,
    h3: ({children}) => <h3 className={stylex.props(styles_3.s823458fc).className || ''}>{children}</h3>,
    p: ({children}) => <p className={stylex.props(styles_3.se79e65b6).className || ''}>{children}</p>,
    ul: ({children}) => <ul className={stylex.props(styles_3.s841f6c1).className || ''}>{children}</ul>,
    ol: ({children}) => <ol className={stylex.props(styles_3.sf7d172b7).className || ''}>{children}</ol>,
    li: ({children}) => <li className={stylex.props(styles.sbf7a69bf).className || ''}>{children}</li>,
    a: MarkdownLink,
    blockquote: ({children}) => (
      <blockquote className={stylex.props(styles_3.sf8817373).className || ''}>{children}</blockquote>
    ),
    strong: ({children}) => <strong className={stylex.props(styles.s62c182b1).className || ''}>{children}</strong>,
    em: ({children}) => <em>{children}</em>,
    hr: () => <hr className={stylex.props(styles.s9c6533a5).className || ''} />,
    pre: ({children}) => <pre className={stylex.props(styles_3.s63698ec9).className || ''}>{children}</pre>,
    code: ({className, children}) => {
      const isBlock = !!className
      if (isBlock) {
        return (
          <code className={[stylex.props(styles.sab7cc79b).className || '', className].filter(Boolean).join(' ')}>
            {children}
          </code>
        )
      }
      return (
        <code className={[stylex.props(styles_3.s70e23123).className || '', className].filter(Boolean).join(' ')}>
          {children}
        </code>
      )
    },
    table: ({children}) => (
      <div className={stylex.props(styles.s1026c40).className || ''}>
        <table className={stylex.props(styles_2.s2f83379c).className || ''}>{children}</table>
      </div>
    ),
    thead: ({children}) => <thead className={stylex.props(styles_3.sc43c4b56).className || ''}>{children}</thead>,
    th: ({children}) => <th className={stylex.props(styles.sf88965b7).className || ''}>{children}</th>,
    td: ({children}) => <td className={stylex.props(styles.s6904bfdf).className || ''}>{children}</td>,
  }
  return (
    <ReactMarkdown
      remarkPlugins={enableGfm ? [remarkGfm, remarkStripHtmlComments] : [remarkStripHtmlComments]}
      components={components}
      urlTransform={(value) => (value.startsWith('hm://') ? value : defaultUrlTransform(value))}
    >
      {children}
    </ReactMarkdown>
  )
}

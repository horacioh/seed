import {createRequire} from 'module'
import fs from 'fs'
import path from 'path'
import fastGlob from 'fast-glob'
import postcss from 'postcss'
import selectorParser from 'postcss-selector-parser'

const require = createRequire(import.meta.url)
const parser = require('@babel/parser')
const t = require('@babel/types')
const traverse = require('@babel/traverse').default
const generate = require('@babel/generator').default

const root = process.cwd()
const allTokensPath = '/tmp/all-tokens-full.css'

const css = fs.readFileSync(allTokensPath, 'utf8')
const cssRoot = postcss.parse(css)

const initialVars = new Map()
const themeVars = new Map()
const tokenDecls = new Map()

function isUnsupportedToken(token) {
  if (/[:!\[\]\/]/.test(token)) return true
  if (token.startsWith('group') || token.startsWith('peer')) return true
  const variantPrefixes = [
    'data-',
    'aria-',
    'supports-',
    'motion-',
    'has-',
    'not-',
    'is-',
    'where-',
    'min-',
    'max-',
    'only-',
    'first-',
    'last-',
    'odd-',
    'even-',
    'open-',
    'disabled-',
    'enabled-',
    'checked-',
    'indeterminate-',
    'required-',
    'valid-',
    'invalid-',
    'read-only-',
    'read-write-',
    'placeholder-shown-',
    'autofill-',
    'focus-within-',
    'focus-visible-',
    'hover-',
    'focus-',
    'active-',
    'visited-',
    'target-',
    'default-',
    'in-range-',
    'out-of-range-',
    'empty-',
    'ltr-',
    'rtl-',
    'before-',
    'after-',
    'before:',
    'after:',
  ]
  for (const prefix of variantPrefixes) {
    if (token.startsWith(prefix)) return true
  }
  return false
}

function capitalize(str) {
  if (!str) return str
  return str[0].toUpperCase() + str.slice(1)
}

function toCamelCase(prop) {
  if (prop.startsWith('--')) return null
  if (prop.startsWith('-webkit-')) {
    return 'Webkit' + capitalize(toCamelCaseNoPrefix(prop.slice(8)))
  }
  if (prop.startsWith('-moz-')) {
    return 'Moz' + capitalize(toCamelCaseNoPrefix(prop.slice(5)))
  }
  if (prop.startsWith('-ms-')) {
    return 'Ms' + capitalize(toCamelCaseNoPrefix(prop.slice(4)))
  }
  if (prop.startsWith('-')) return null
  return toCamelCaseNoPrefix(prop)
}

function toCamelCaseNoPrefix(prop) {
  return prop.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase())
}

function resolveValue(value, vars, visiting = new Set()) {
  if (typeof value !== 'string') return value
  let result = value
  let prev
  do {
    prev = result
    result = replaceVars(result, vars, visiting)
  } while (result !== prev)
  return result
}

function replaceVars(value, vars, visiting) {
  let out = ''
  let i = 0
  while (i < value.length) {
    const idx = value.indexOf('var(', i)
    if (idx === -1) {
      out += value.slice(i)
      break
    }
    out += value.slice(i, idx)
    let depth = 1
    let j = idx + 4
    while (j < value.length && depth > 0) {
      if (value[j] === '(') depth++
      else if (value[j] === ')') depth--
      j++
    }
    const content = value.slice(idx + 4, j - 1)
    const nameMatch = content.match(/^\s*(--[\w-]+)\s*(?:,\s*(.*))?$/s)
    if (nameMatch) {
      const varName = nameMatch[1]
      const fallback = nameMatch[2]
      if (vars.has(varName) && !visiting.has(varName)) {
        const nextVisiting = new Set(visiting)
        nextVisiting.add(varName)
        out += resolveValue(vars.get(varName), vars, nextVisiting)
      } else if (fallback !== undefined) {
        out += resolveValue(fallback, vars, visiting)
      } else {
        out += `var(${content})`
      }
    } else {
      out += `var(${content})`
    }
    i = j
  }
  return out
}

function mergeStyle(tokens) {
  const vars = new Map([...initialVars, ...themeVars])
  const final = new Map()
  for (const token of tokens) {
    const decls = tokenDecls.get(token)
    if (!decls) return null
    for (const {prop, value} of decls) {
      const resolved = resolveValue(value, vars)
      if (prop.startsWith('--')) {
        vars.set(prop, resolved)
      } else {
        final.set(prop, resolved)
      }
    }
  }
  const style = {}
  for (const [prop, value] of final) {
    const resolved = resolveValue(value, vars)
    if (typeof resolved !== 'string' || resolved.trim() === '') return null
    const key = toCamelCase(prop)
    if (!key) continue
    style[key] = resolved
  }
  if (Object.keys(style).length === 0) return null
  return style
}

function resolveClassString(str) {
  const tokens = str.split(/\s+/).filter(Boolean)
  if (tokens.length === 0) return null
  for (const token of tokens) {
    if (isUnsupportedToken(token)) return null
  }
  return mergeStyle(tokens)
}

function parseSelector(selector) {
  let result = null
  const processor = selectorParser((selectors) => {
    if (selectors.length !== 1) return
    const sel = selectors.first
    if (sel.nodes.length !== 1) return
    const node = sel.nodes[0]
    if (node.type === 'class') {
      result = node.value
    }
  })
  try {
    processor.processSync(selector)
  } catch {
    // ignore
  }
  return result
}

function hasNestedRules(node) {
  for (const child of node.nodes || []) {
    if (child.type === 'rule') return true
    if (child.type === 'atrule' && child.name !== 'supports') return true
  }
  return false
}

cssRoot.walk((node) => {
  if (node.type === 'atrule' && node.name === 'property') {
    const varName = node.params.trim()
    for (const child of node.nodes || []) {
      if (child.type === 'decl' && child.prop === 'initial-value') {
        initialVars.set(varName, child.value)
      }
    }
    return
  }
  if (node.type === 'atrule' && node.name === 'layer' && node.params === 'theme') {
    node.walkDecls((decl) => {
      if (decl.prop.startsWith('--')) {
        themeVars.set(decl.prop, decl.value)
      }
    })
    return
  }
  if (node.type === 'rule' && !hasNestedRules(node)) {
    const token = parseSelector(node.selector)
    if (token && !isUnsupportedToken(token)) {
      const decls = []
      node.walkDecls((decl) => {
        decls.push({prop: decl.prop, value: decl.value})
      })
      if (decls.length > 0) {
        tokenDecls.set(token, decls)
      }
    }
  }
})

console.log(
  `Loaded token map: ${tokenDecls.size} tokens, ${initialVars.size} @property defaults, ${themeVars.size} theme variables`,
)

const targetDirs = process.env.TARGET_DIRS
  ? process.env.TARGET_DIRS.split(',').map((d) => d.trim())
  : ['packages/ui/src', 'apps/web/app', 'apps/desktop/src']

const onlyFile = process.argv[2]

const files = []
if (onlyFile) {
  files.push(onlyFile)
} else {
  for (const d of targetDirs) {
    files.push(
      ...fastGlob.sync([`${d}/**/*.{tsx,jsx}`], {
        cwd: root,
        ignore: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**', '**/dist/**', '**/build/**'],
      }),
    )
  }
}

console.log(`Processing ${files.length} files...`)

const styleImportSource = '@stylexjs/stylex'

function styleObjectToNode(style) {
  const props = Object.entries(style).map(([key, value]) => {
    return t.objectProperty(t.identifier(key), t.stringLiteral(value))
  })
  return t.objectExpression(props)
}

function processStringLiteral(node, fileState) {
  const str = node.value.trim()
  if (!str) return false
  const style = resolveClassString(str)
  if (!style) return false
  const key = fileState.addStyle(str, style)
  const memberExpr = t.logicalExpression(
    '||',
    t.memberExpression(
      t.callExpression(t.memberExpression(t.identifier(fileState.stylexName), t.identifier('props')), [
        fileState.memberExpressionForKey(key),
      ]),
      t.identifier('className'),
    ),
    t.stringLiteral(''),
  )
  return memberExpr
}

class FileState {
  constructor(ast) {
    this.ast = ast
    this.styles = new Map()
    this.stylexName = 'stylex'
    this.stylesName = this.findUnusedName('styles')
  }

  findUnusedName(base) {
    let name = base
    let n = 2
    while (this.isNameUsedAtTopLevel(name)) {
      name = `${base}_${n}`
      n++
    }
    return name
  }

  isNameUsedAtTopLevel(name) {
    for (const node of this.ast.program.body) {
      if (t.isImportDeclaration(node)) {
        for (const s of node.specifiers) {
          if (s.local && s.local.name === name) return true
        }
      }
      if (t.isVariableDeclaration(node)) {
        for (const d of node.declarations) {
          if (t.isIdentifier(d.id) && d.id.name === name) return true
        }
      }
      if (t.isFunctionDeclaration(node) && node.id && node.id.name === name) return true
      if (t.isClassDeclaration(node) && node.id && node.id.name === name) return true
    }
    return false
  }

  addStyle(str, style) {
    if (this.styles.has(str)) return this.styles.get(str)
    const hash = hashString(str).toString(16).slice(0, 10)
    const key = `s${hash}`
    this.styles.set(str, key)
    return key
  }

  ensureImport() {
    for (const node of this.ast.program.body) {
      if (t.isImportDeclaration(node) && node.source.value === styleImportSource) {
        const defaultSpecifier = node.specifiers.find((s) => t.isImportDefaultSpecifier(s))
        if (defaultSpecifier) {
          this.stylexName = defaultSpecifier.local.name
        } else {
          const namespaceSpecifier = node.specifiers.find((s) => t.isImportNamespaceSpecifier(s))
          if (namespaceSpecifier) {
            this.stylexName = namespaceSpecifier.local.name
          } else {
            const namedSpecifier = node.specifiers.find((s) => t.isImportSpecifier(s) && s.imported.name === 'stylex')
            if (namedSpecifier) this.stylexName = namedSpecifier.local.name
          }
        }
        if (!this.stylexName) {
          const namespace = t.importNamespaceSpecifier(t.identifier('stylex'))
          node.specifiers.push(namespace)
          this.stylexName = 'stylex'
        }
        return true
      }
    }
    const importDecl = t.importDeclaration(
      [t.importNamespaceSpecifier(t.identifier('stylex'))],
      t.stringLiteral(styleImportSource),
    )
    this.ast.program.body.unshift(importDecl)
    return true
  }

  injectStyles() {
    if (this.styles.size === 0) return
    const styleObject = t.objectExpression(
      Array.from(this.styles.entries()).map(([str, key]) => {
        return t.objectProperty(t.identifier(key), styleObjectToNode(this.getStyle(str)), false)
      }),
    )
    const decl = t.variableDeclaration('const', [
      t.variableDeclarator(
        t.identifier(this.stylesName),
        t.callExpression(t.memberExpression(t.identifier(this.stylexName), t.identifier('create')), [styleObject]),
      ),
    ])
    const lastImportIndex = this.ast.program.body.findLastIndex((n) => t.isImportDeclaration(n))
    const insertIndex = lastImportIndex === -1 ? 0 : lastImportIndex + 1
    this.ast.program.body.splice(insertIndex, 0, decl)
  }

  getStyle(str) {
    return resolveClassString(str)
  }

  memberExpressionForKey(key) {
    return t.memberExpression(t.identifier(this.stylesName), t.identifier(key))
  }
}

function hashString(str) {
  let h = 0
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0
  }
  return h
}

function isRootElement(jsxAttrPath) {
  const jsxOpening = jsxAttrPath.parentPath
  if (!jsxOpening || !jsxOpening.isJSXOpeningElement()) return false
  const jsxElement = jsxOpening.parentPath
  if (!jsxElement || !jsxElement.isJSXElement()) return false
  const parent = jsxElement.parentPath
  if (parent.isReturnStatement()) return true
  if (parent.isArrowFunctionExpression()) return true
  if (parent.isConditionalExpression()) {
    const grand = parent.parentPath
    if (grand && grand.isReturnStatement()) return true
  }
  if (parent.isLogicalExpression()) {
    const grand = parent.parentPath
    if (grand && grand.isReturnStatement()) return true
  }
  return false
}

function processFile(filePath) {
  const fullPath = path.join(root, filePath)
  const src = fs.readFileSync(fullPath, 'utf8')
  let ast
  try {
    ast = parser.parse(src, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
      allowImportExportEverywhere: true,
    })
  } catch (e) {
    console.warn(`Parse failed: ${filePath}: ${e.message}`)
    return {changed: false, error: true}
  }

  const fileState = new FileState(ast)
  let changed = false

  traverse(ast, {
    JSXAttribute(path) {
      if (!t.isJSXIdentifier(path.node.name, {name: 'className'})) return
      const valuePath = path.get('value')
      if (!valuePath.node) return

      const maybeString = (node) => {
        if (t.isStringLiteral(node)) return node.value
        if (t.isJSXExpressionContainer(node) && t.isStringLiteral(node.expression)) {
          return node.expression.value
        }
        return null
      }

      const original = maybeString(valuePath.node)
      if (original != null) {
        const expr = processStringLiteral({value: original}, fileState)
        if (expr) {
          const classNameBinding = path.scope.getBinding('className')
          const shouldAppend = classNameBinding && classNameBinding.kind === 'param' && isRootElement(path)
          let replacement = expr
          if (shouldAppend) {
            replacement = t.callExpression(
              t.memberExpression(
                t.callExpression(
                  t.memberExpression(t.arrayExpression([expr, t.identifier('className')]), t.identifier('filter')),
                  [t.identifier('Boolean')],
                ),
                t.identifier('join'),
              ),
              [t.stringLiteral(' ')],
            )
          }
          valuePath.replaceWith(t.jsxExpressionContainer(replacement))
          changed = true
        }
        return
      }

      if (t.isJSXExpressionContainer(valuePath.node)) {
        const exprPath = valuePath.get('expression')
        if (exprPath.isTemplateLiteral() && exprPath.node.expressions.length === 0) {
          const str = exprPath.node.quasis[0].value.raw
          const generated = processStringLiteral({value: str}, fileState)
          if (generated) {
            const classNameBinding = path.scope.getBinding('className')
            const shouldAppend = classNameBinding && classNameBinding.kind === 'param' && isRootElement(path)
            let replacement = generated
            if (shouldAppend) {
              replacement = t.callExpression(
                t.memberExpression(
                  t.callExpression(
                    t.memberExpression(
                      t.arrayExpression([generated, t.identifier('className')]),
                      t.identifier('filter'),
                    ),
                    [t.identifier('Boolean')],
                  ),
                  t.identifier('join'),
                ),
                [t.stringLiteral(' ')],
              )
            }
            valuePath.replaceWith(t.jsxExpressionContainer(replacement))
            changed = true
          }
          return
        }

        if (exprPath.isCallExpression()) {
          const callee = exprPath.node.callee
          if (t.isIdentifier(callee) && (callee.name === 'cn' || callee.name === 'twMerge')) {
            let callChanged = false
            for (const argPath of exprPath.get('arguments')) {
              if (argPath.isStringLiteral()) {
                const generated = processStringLiteral(argPath.node, fileState)
                if (generated) {
                  argPath.replaceWith(generated)
                  callChanged = true
                }
              }
            }
            if (callChanged) changed = true
          }
        }
      }
    },
  })

  if (!changed) return {changed: false}

  if (!fileState.ensureImport()) {
    console.warn(`Could not add stylex import: ${filePath}`)
    return {changed: false, error: true}
  }

  fileState.injectStyles()

  const output = generate(ast, {retainLines: false, concise: false}, src).code
  fs.writeFileSync(fullPath, output)
  return {changed: true, stylesCount: fileState.styles.size}
}

let converted = 0
let failed = 0
let totalStyles = 0
for (const f of files) {
  const result = processFile(f)
  if (result.error) failed++
  else if (result.changed) {
    converted++
    totalStyles += result.stylesCount
  }
}

console.log(`Converted ${converted} files with ${totalStyles} stylex.create entries. Failed: ${failed}`)

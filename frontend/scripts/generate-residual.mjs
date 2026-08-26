import {createRequire} from 'module'
import fs from 'fs'
import path from 'path'
import fastGlob from 'fast-glob'
import babel from '@babel/core'
import parser from '@babel/parser'
import postcss from 'postcss'

const require = createRequire(import.meta.url)
const __dirname = path.dirname(new URL(import.meta.url).pathname)

const root = path.resolve(__dirname, '..')
const tailwindIndex = require.resolve('tailwindcss/index.css')
const animateCss = path.resolve(tailwindIndex, '../../tw-animate-css/dist/tw-animate.css')
const themePath = path.join(root, 'packages/ui/src/theme.css')
const basePath = path.join(root, 'packages/ui/src/base.css')
const residualPath = path.join(root, 'packages/ui/src/residual.css')
const allTokensPath = '/tmp/all-tokens-full.css'

const srcDirs = [
  'apps/*/app',
  'apps/*/src',
  'packages/*/src',
]

const files = []
for (const d of srcDirs) {
  files.push(
    ...fastGlob.sync([`${d}/**/*.{tsx,jsx}`], {
      cwd: root,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**', '**/dist/**', '**/build/**'],
    }),
  )
}

const uniqueStrings = new Set()
const tokens = new Set()

function addString(str) {
  if (!str || typeof str !== 'string') return
  uniqueStrings.add(str)
  for (const token of str.split(/\s+/).filter(Boolean)) {
    tokens.add(token)
  }
}

function collectClassStringsFromNode(node, ignoreKeys = new Set()) {
  if (!node || typeof node !== 'object') return
  if (node.type === 'StringLiteral') {
    addString(node.value)
    return
  }
  if (node.type === 'ObjectProperty' || node.type === 'ObjectMethod') {
    const key =
      node.key && (node.key.type === 'Identifier' ? node.key.name : node.key.type === 'StringLiteral' ? node.key.value : null)
    if (key && ignoreKeys.has(key)) return
  }
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key === 'start' || key === 'end' || key === 'range' || key === 'leadingComments' || key === 'trailingComments') continue
    const child = node[key]
    if (Array.isArray(child)) {
      for (const c of child) collectClassStringsFromNode(c, ignoreKeys)
    } else if (child && typeof child === 'object') {
      collectClassStringsFromNode(child, ignoreKeys)
    }
  }
}

for (const f of files) {
  const src = fs.readFileSync(path.join(root, f), 'utf8')
  let ast
  try {
    ast = parser.parse(src, {sourceType: 'module', plugins: ['typescript', 'jsx']})
  } catch {
    continue
  }
  babel.traverse(ast, {
    CallExpression(p) {
      if (p.node.callee?.name === 'cva') {
        // The first argument is the base class string; everything inside
        // `variants` and `compoundVariants` is also class strings.
        // `defaultVariants` holds variant option names, not CSS, so skip it.
        collectClassStringsFromNode(p.node, new Set(['defaultVariants']))
      }
    },
    JSXAttribute(p) {
      if (p.node.name.name !== 'className') return
      const value = p.get('value')
      if (!value.node) return
      if (value.isStringLiteral()) {
        addString(value.node.value)
      } else if (value.isJSXExpressionContainer()) {
        const expr = value.get('expression')
        if (expr.isStringLiteral()) {
          addString(expr.node.value)
        } else if (
          expr.isCallExpression() &&
          (expr.node.callee.name === 'cn' || expr.node.callee.name === 'twMerge')
        ) {
          for (const arg of expr.get('arguments')) {
            if (arg.isStringLiteral()) addString(arg.node.value)
            else if (arg.isLogicalExpression() && arg.node.operator === '&&' && arg.node.right.type === 'StringLiteral')
              addString(arg.node.right.value)
            else if (arg.isConditionalExpression()) {
              if (arg.node.consequent.type === 'StringLiteral') addString(arg.node.consequent.value)
              if (arg.node.alternate.type === 'StringLiteral') addString(arg.node.alternate.value)
            } else if (arg.isCallExpression()) {
              // Some call expressions (e.g. buttonVariants(...)) may contain
              // variant option names, but their cva base/variant strings are
              // already collected at the cva definition site.
              collectClassStringsFromNode(arg.node)
            }
          }
        } else if (expr.isConditionalExpression()) {
          if (expr.node.consequent.type === 'StringLiteral') addString(expr.node.consequent.value)
          if (expr.node.alternate.type === 'StringLiteral') addString(expr.node.alternate.value)
        } else if (expr.isTemplateLiteral()) {
          for (const q of expr.node.quasis) addString(q.value.raw)
        }
      }
    },
  })
}

const tokenArr = Array.from(tokens)
  .filter((t) => {
    if (t.includes('{') || t.includes('}')) return false
    return true
  })
  .sort()

console.log(`Collected ${tokenArr.length} unique tokens from ${files.length} files`)

const {compile} = require('tailwindcss')
const defaultCss = fs.readFileSync(tailwindIndex, 'utf8')
const animate = fs.readFileSync(animateCss, 'utf8')
const theme = fs.readFileSync(themePath, 'utf8')
const base = fs.readFileSync(basePath, 'utf8')
const input = `${defaultCss}\n${animate}\n${theme}\n${base}\n@tailwind utilities;`

const {build} = await compile(input, {base: root})

const fullCss = build(tokenArr)
fs.writeFileSync(allTokensPath, fullCss)
console.log(`Wrote full tokens to ${allTokensPath}`)

const cssRoot = postcss.parse(fullCss)

for (const node of cssRoot.nodes.slice()) {
  if (node.type === 'rule' && (node.selector === ':root' || node.selector === '.dark')) {
    node.remove()
    continue
  }
}

const residualCss = cssRoot.toString()
fs.writeFileSync(residualPath, residualCss)
console.log(`Wrote residual.css (${(residualCss.length / 1024).toFixed(1)} KB) to ${residualPath}`)

import fs from 'fs'
import path from 'path'
import fastGlob from 'fast-glob'
import parser from '@babel/parser'
import generate from '@babel/generator'
import traverse from '@babel/traverse'
import t from '@babel/types'

const root = path.resolve(process.argv[2] || '.')
const targetDirs = ['packages/ui/src', 'apps/web/app', 'apps/desktop/src']
const files = []
for (const d of targetDirs) {
  files.push(
    ...fastGlob.sync([`${d}/**/*.{tsx,jsx}`], {
      cwd: root,
      ignore: ['**/*.test.*', '**/*.spec.*', '**/node_modules/**', '**/dist/**', '**/build/**'],
    }),
  )
}

let fixed = 0
for (const file of files) {
  const fullPath = path.join(root, file)
  const src = fs.readFileSync(fullPath, 'utf8')
  let ast
  try {
    ast = parser.parse(src, {
      sourceType: 'module',
      plugins: ['jsx', 'typescript', 'decorators-legacy'],
      allowImportExportEverywhere: true,
    })
  } catch {
    continue
  }
  let changed = false
  traverse.default(ast, {
    MemberExpression(p) {
      const node = p.node
      if (
        t.isCallExpression(node.object) &&
        t.isMemberExpression(node.object.callee) &&
        t.isIdentifier(node.object.callee.object, {name: 'stylex'}) &&
        t.isIdentifier(node.object.callee.property, {name: 'props'}) &&
        t.isIdentifier(node.property, {name: 'className'}) &&
        !node.computed
      ) {
        const parent = p.parentPath.node
        if (
          t.isLogicalExpression(parent) &&
          parent.operator === '||' &&
          parent.left === node &&
          t.isStringLiteral(parent.right) &&
          parent.right.value === ''
        ) {
          return
        }
        p.replaceWith(t.logicalExpression('||', node, t.stringLiteral('')))
        changed = true
      }
    },
  })
  if (changed) {
    const output = generate.default(ast, {retainLines: false, concise: false}, src).code
    fs.writeFileSync(fullPath, output)
    fixed++
  }
}
console.log(`Fixed ${fixed} files`)

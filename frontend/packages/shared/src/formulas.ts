import type {HMMetadata} from '@seed-hypermedia/client/hm-types'
import {unpackHmId} from './utils/entity-id-url'

/**
 * Document variables and formulas.
 *
 * Attributes live in document metadata. A number attribute is a plain number; a formula attribute is a string
 * starting with `=` (e.g. `"=sum(price, tax)"`). Inline references reuse the `Embed` annotation, with the target
 * document's `hm://` URL plus `?attr=<key>` (show one attribute) or `?formula=<expr>` (evaluate an expression in that
 * document's scope). Apps that don't know these query params render a normal mention of that document.
 *
 * Expression grammar: numbers, attribute names, `[[hm://uid/path]].key` cross-document references, `+ - * /`, unary
 * `-`, parentheses and the functions in {@link FORMULA_FUNCTIONS}.
 */

/** An inline variable reference decoded from an `Embed` annotation link. */
export type VariableLink = {docId: string; kind: 'attr'; key: string} | {docId: string; kind: 'formula'; expr: string}

/** Decodes a `?attr=` or `?formula=` inline embed link; returns null for ordinary mentions. */
export function parseVariableLink(link: string): VariableLink | null {
  const queryStart = link.indexOf('?')
  if (queryStart === -1) return null
  const id = unpackHmId(link)
  if (!id) return null
  const query = new URLSearchParams(link.slice(queryStart + 1).split('#')[0])
  const docId = id.id
  const formula = query.get('formula')
  if (formula !== null) return {docId, kind: 'formula', expr: formula}
  const attr = query.get('attr')
  if (attr) return {docId, kind: 'attr', key: attr}
  return null
}

/** Builds the inline embed link for a variable reference. */
export function buildVariableLink(variable: VariableLink): string {
  const param =
    variable.kind === 'attr'
      ? `attr=${encodeURIComponent(variable.key)}`
      : `formula=${encodeURIComponent(variable.expr)}`
  return `${variable.docId}?${param}`
}

/** A parsed formula expression. */
export type FormulaNode =
  | {type: 'number'; value: number}
  | {type: 'ref'; docId: string | null; key: string}
  | {type: 'unary'; op: '-'; arg: FormulaNode}
  | {type: 'binary'; op: '+' | '-' | '*' | '/'; left: FormulaNode; right: FormulaNode}
  | {type: 'call'; name: string; args: FormulaNode[]}

/** Built-in formula functions. Each receives already-evaluated, flattened numeric arguments. */
export const FORMULA_FUNCTIONS: Record<string, (args: number[]) => number> = {
  sum: (args) => args.reduce((a, b) => a + b, 0),
  avg: (args) => (args.length ? args.reduce((a, b) => a + b, 0) / args.length : 0),
  min: (args) => Math.min(...args),
  max: (args) => Math.max(...args),
  count: (args) => args.length,
  abs: ([x = 0]) => Math.abs(x),
  round: ([x = 0, digits = 0]) => {
    const f = 10 ** digits
    return Math.round(x * f) / f
  },
}

/** Thrown for syntax and evaluation errors; `message` is user-facing. */
export class FormulaError extends Error {}

type Token =
  | {t: 'num'; v: number}
  | {t: 'ident'; v: string}
  | {t: 'docref'; v: string; key: string}
  | {t: 'op'; v: string}

const IDENT = /[A-Za-z_]/

function tokenize(src: string): Token[] {
  const tokens: Token[] = []
  let i = 0
  while (i < src.length) {
    const c = src[i]!
    if (/\s/.test(c)) {
      i++
    } else if (/[0-9.]/.test(c)) {
      const m = /^(\d+\.?\d*|\.\d+)(e[+-]?\d+)?/i.exec(src.slice(i))
      if (!m) throw new FormulaError(`Unexpected "${c}"`)
      tokens.push({t: 'num', v: Number(m[0])})
      i += m[0].length
    } else if (src.startsWith('[[', i)) {
      const m = /^\[\[([^\]]+)\]\]\.([A-Za-z_][\w.]*)/.exec(src.slice(i))
      if (!m) throw new FormulaError('Expected [[hm://…]].attribute')
      tokens.push({t: 'docref', v: m[1]!.trim(), key: m[2]!})
      i += m[0].length
    } else if (IDENT.test(c)) {
      const m = /^[A-Za-z_][\w.]*/.exec(src.slice(i))!
      tokens.push({t: 'ident', v: m[0]})
      i += m[0].length
    } else if ('+-*/(),'.includes(c)) {
      tokens.push({t: 'op', v: c})
      i++
    } else {
      throw new FormulaError(`Unexpected "${c}"`)
    }
  }
  return tokens
}

/** Parses a formula expression (without the leading `=`). */
export function parseFormula(src: string): FormulaNode {
  const tokens = tokenize(src)
  let pos = 0
  const peek = () => tokens[pos]
  const isOp = (v: string) => {
    const tok = tokens[pos]
    return tok?.t === 'op' && tok.v === v
  }
  const expect = (v: string) => {
    if (!isOp(v)) throw new FormulaError(`Expected "${v}"`)
    pos++
  }
  const parseExpr = (): FormulaNode => {
    let left = parseTerm()
    while (isOp('+') || isOp('-')) {
      const op = (tokens[pos++] as {v: '+' | '-'}).v
      left = {type: 'binary', op, left, right: parseTerm()}
    }
    return left
  }
  const parseTerm = (): FormulaNode => {
    let left = parseUnary()
    while (isOp('*') || isOp('/')) {
      const op = (tokens[pos++] as {v: '*' | '/'}).v
      left = {type: 'binary', op, left, right: parseUnary()}
    }
    return left
  }
  const parseUnary = (): FormulaNode => {
    if (isOp('-')) {
      pos++
      return {type: 'unary', op: '-', arg: parseUnary()}
    }
    if (isOp('+')) {
      pos++
      return parseUnary()
    }
    return parsePrimary()
  }
  const parsePrimary = (): FormulaNode => {
    const tok = peek()
    if (!tok) throw new FormulaError('Unexpected end of formula')
    pos++
    if (tok.t === 'num') return {type: 'number', value: tok.v}
    if (tok.t === 'docref') {
      const id = unpackHmId(tok.v)
      if (!id) throw new FormulaError(`Invalid document reference "${tok.v}"`)
      return {type: 'ref', docId: id.id, key: tok.key}
    }
    if (tok.t === 'ident') {
      if (isOp('(')) {
        pos++
        const name = tok.v.toLowerCase()
        if (!FORMULA_FUNCTIONS[name]) throw new FormulaError(`Unknown function "${tok.v}"`)
        const args: FormulaNode[] = []
        if (!isOp(')')) {
          args.push(parseExpr())
          while (isOp(',')) {
            pos++
            args.push(parseExpr())
          }
        }
        expect(')')
        return {type: 'call', name, args}
      }
      return {type: 'ref', docId: null, key: tok.v}
    }
    if (tok.v === '(') {
      const inner = parseExpr()
      expect(')')
      return inner
    }
    throw new FormulaError(`Unexpected "${tok.v}"`)
  }
  if (!tokens.length) throw new FormulaError('Empty formula')
  const node = parseExpr()
  if (pos < tokens.length) throw new FormulaError(`Unexpected "${(tokens[pos] as Token).v}"`)
  return node
}

/** Looks up a document's metadata; `undefined` means not loaded yet, `null` means not found. */
export type MetadataLookup = (docId: string) => HMMetadata | null | undefined

/** The outcome of evaluating a variable or formula. */
export type FormulaResult =
  | {status: 'ok'; value: number}
  | {status: 'error'; message: string}
  | {status: 'pending'; missing: string[]}

class PendingError extends Error {
  constructor(public docId: string) {
    super('pending')
  }
}

function attrValue(docId: string, key: string, lookup: MetadataLookup, stack: string[]): number {
  const frame = `${docId}#${key}`
  if (stack.includes(frame)) throw new FormulaError(`Circular reference to "${key}"`)
  const metadata = lookup(docId)
  if (metadata === undefined) throw new PendingError(docId)
  const value = metadata ? (metadata as Record<string, unknown>)[key] : undefined
  if (value === undefined || value === null) throw new FormulaError(`Unknown attribute "${key}"`)
  if (typeof value === 'number') return value
  if (typeof value === 'boolean') return value ? 1 : 0
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (trimmed.startsWith('=')) return evalNode(parseFormula(trimmed.slice(1)), docId, lookup, [...stack, frame])
    if (trimmed !== '' && !Number.isNaN(Number(trimmed))) return Number(trimmed)
  }
  throw new FormulaError(`"${key}" is not a number`)
}

function evalNode(node: FormulaNode, docId: string, lookup: MetadataLookup, stack: string[]): number {
  switch (node.type) {
    case 'number':
      return node.value
    case 'ref':
      return attrValue(node.docId ?? docId, node.key, lookup, stack)
    case 'unary':
      return -evalNode(node.arg, docId, lookup, stack)
    case 'binary': {
      const l = evalNode(node.left, docId, lookup, stack)
      const r = evalNode(node.right, docId, lookup, stack)
      if (node.op === '+') return l + r
      if (node.op === '-') return l - r
      if (node.op === '*') return l * r
      if (r === 0) throw new FormulaError('Division by zero')
      return l / r
    }
    case 'call':
      return FORMULA_FUNCTIONS[node.name]!(node.args.map((arg) => evalNode(arg, docId, lookup, stack)))
  }
}

/**
 * Evaluates a variable against document metadata. Returns `pending` with the ids still to load when a referenced
 * document's metadata isn't available yet, so callers can fetch them and evaluate again.
 */
export function evaluateVariable(variable: VariableLink, lookup: MetadataLookup): FormulaResult {
  try {
    const value =
      variable.kind === 'attr'
        ? attrValue(variable.docId, variable.key, lookup, [])
        : evalNode(parseFormula(variable.expr.trim().replace(/^=/, '')), variable.docId, lookup, [])
    if (!Number.isFinite(value)) return {status: 'error', message: 'Result is not a finite number'}
    return {status: 'ok', value}
  } catch (e) {
    if (e instanceof PendingError) return {status: 'pending', missing: [e.docId]}
    if (e instanceof FormulaError) return {status: 'error', message: e.message}
    throw e
  }
}

/** Formats a formula result for inline display. */
export function formatFormulaValue(value: number): string {
  return value.toLocaleString(undefined, {maximumFractionDigits: 6})
}

import {describe, expect, it} from 'vitest'
import {buildVariableLink, evaluateVariable, parseFormula, parseVariableLink, type MetadataLookup} from '../formulas'

const A = 'hm://z6MkA/budget'
const B = 'hm://z6MkB/other'

function lookupFrom(docs: Record<string, Record<string, unknown> | null>): MetadataLookup {
  return (id) => docs[id] as any
}

describe('variable links', () => {
  it('round-trips attr and formula links', () => {
    const attr = {docId: A, kind: 'attr' as const, key: 'price'}
    const formula = {docId: A, kind: 'formula' as const, expr: `sum(price, [[${B}]].tax) / 2`}
    expect(parseVariableLink(buildVariableLink(attr))).toEqual(attr)
    expect(parseVariableLink(buildVariableLink(formula))).toEqual(formula)
  })

  it('keeps the pinned version of the referenced document', () => {
    const pinned = {docId: `${A}?v=bafy123`, kind: 'attr' as const, key: 'price'}
    expect(parseVariableLink(`${A}?v=bafy123&attr=price`)).toEqual(pinned)
    expect(parseVariableLink(buildVariableLink(pinned))).toEqual(pinned)
    expect(parseFormula(`[[${A}?v=bafy123]].price`)).toEqual({type: 'ref', docId: `${A}?v=bafy123`, key: 'price'})
  })

  it('ignores ordinary mentions', () => {
    expect(parseVariableLink(A)).toBeNull()
    expect(parseVariableLink(`${A}?v=bafy123`)).toBeNull()
  })
})

describe('evaluateVariable', () => {
  const docs = lookupFrom({
    [A]: {name: 'Budget', price: 100, tax: '21', total: '=price + tax', shipping: 4.5, label: 'hello'},
    [B]: {tax: 10, grand: `=[[${A}]].total + tax`},
  })
  const run = (expr: string, docId = A) => evaluateVariable({docId, kind: 'formula', expr}, docs)

  it('sums local number attributes', () => {
    expect(run('sum(price, tax, shipping)')).toEqual({status: 'ok', value: 125.5})
  })

  it('follows precedence and parentheses', () => {
    expect(run('price + tax * 2')).toEqual({status: 'ok', value: 142})
    expect(run('(price + tax) * 2')).toEqual({status: 'ok', value: 242})
    expect(run('-price + round(10 / 3, 2)')).toEqual({status: 'ok', value: -96.67})
  })

  it('evaluates formula attributes and cross-document references', () => {
    expect(evaluateVariable({docId: A, kind: 'attr', key: 'total'}, docs)).toEqual({status: 'ok', value: 121})
    expect(evaluateVariable({docId: B, kind: 'attr', key: 'grand'}, docs)).toEqual({status: 'ok', value: 131})
    expect(run(`price + [[${B}]].tax`)).toEqual({status: 'ok', value: 110})
  })

  it('reports documents that still need loading', () => {
    expect(run('price + [[hm://z6MkC/x]].n')).toEqual({status: 'pending', missing: ['hm://z6MkC/x']})
  })

  it('reports errors', () => {
    expect(run('price +')).toMatchObject({status: 'error'})
    expect(run('nope')).toEqual({status: 'error', message: 'Unknown attribute "nope"'})
    expect(run('label')).toEqual({status: 'error', message: '"label" is not a number'})
    expect(run('price / 0')).toEqual({status: 'error', message: 'Division by zero'})
    expect(run('foo(1)')).toEqual({status: 'error', message: 'Unknown function "foo"'})
  })

  it('detects cycles', () => {
    const cyclic = lookupFrom({[A]: {a: '=b + 1', b: '=a'}})
    expect(evaluateVariable({docId: A, kind: 'attr', key: 'a'}, cyclic)).toEqual({
      status: 'error',
      message: 'Circular reference to "a"',
    })
  })

  it('parses dotted keys', () => {
    expect(parseFormula('theme.size * 2')).toEqual({
      type: 'binary',
      op: '*',
      left: {type: 'ref', docId: null, key: 'theme.size'},
      right: {type: 'number', value: 2},
    })
  })
})

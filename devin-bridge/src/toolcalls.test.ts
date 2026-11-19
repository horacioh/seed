import {describe, expect, test} from 'bun:test'
import {ToolCallSplitter, TOOL_CALL_OPEN, TOOL_CALL_CLOSE} from './toolcalls.js'

describe('ToolCallSplitter', () => {
  test('inactive when no tools: passes text straight through', () => {
    const s = new ToolCallSplitter(null)
    expect(s.active).toBe(false)
    const {text, toolCalls} = s.feed('hello ``` {"name":"x"}``` world')
    expect(text).toBe('hello ``` {"name":"x"}``` world')
    expect(toolCalls).toEqual([])
  })

  test('plain ```js code fence in tools-enabled reply streams through as text unchanged', () => {
    const s = new ToolCallSplitter(['foo'])
    const r = s.feed('here is code:\n```js\nconst x = 1\n```\ndone')
    expect(r.toolCalls).toEqual([])
    expect(r.text).toBe('here is code:\n```js\nconst x = 1\n```\ndone')
  })

  test('emits plain text and parses a complete tool call', () => {
    const s = new ToolCallSplitter(['foo'])
    const a = s.feed('before ')
    expect(a.text).toBe('before ')
    expect(a.toolCalls).toEqual([])
    const b = s.feed(`${TOOL_CALL_OPEN}\n{"name":"foo","arguments":{"a":1}}\n${TOOL_CALL_CLOSE}`)
    expect(b.text).toBe('')
    expect(b.toolCalls.length).toBe(1)
    expect(b.toolCalls[0]!!.function.name).toBe('foo')
    expect(JSON.parse(b.toolCalls[0]!!.function.arguments)).toEqual({a: 1})
    expect(b.toolCalls[0]!!.id).toMatch(/^call_/)
  })

  test('holds back a trailing partial open tag prefix', () => {
    const s = new ToolCallSplitter(['foo'])
    const a = s.feed('hello<tool_')
    expect(a.text).toBe('hello')
    const b = s.feed(`call>\n{"name":"foo","arguments":{}}\n${TOOL_CALL_CLOSE}`)
    expect(b.toolCalls.length).toBe(1)
    expect(b.toolCalls[0]!!.function.name).toBe('foo')
  })

  test('tool call split across many deltas', () => {
    const s = new ToolCallSplitter(['foo'])
    const pieces = [TOOL_CALL_OPEN, '\n{"name":"fo', 'o","arguments":{"x":2}}\n', TOOL_CALL_CLOSE]
    let text = ''
    const calls = []
    for (const p of pieces) {
      const r = s.feed(p)
      text += r.text
      calls.push(...r.toolCalls)
    }
    expect(calls.length).toBe(1)
    expect(calls[0]!.function.name).toBe('foo')
    expect(JSON.parse(calls[0]!.function.arguments)).toEqual({x: 2})
  })

  test('```json-fenced body inside tags still parses', () => {
    const s = new ToolCallSplitter(['foo'])
    const r = s.feed(`${TOOL_CALL_OPEN}\n\`\`\`json\n{"name":"foo","arguments":{"a":1}}\n\`\`\`\n${TOOL_CALL_CLOSE}`)
    expect(r.toolCalls.length).toBe(1)
    expect(r.toolCalls[0]!.function.name).toBe('foo')
    expect(JSON.parse(r.toolCalls[0]!.function.arguments)).toEqual({a: 1})
  })

  test('unknown tool name flushes block back as text', () => {
    const s = new ToolCallSplitter(['foo'])
    const r = s.feed(`${TOOL_CALL_OPEN}\n{"name":"bar","arguments":{}}\n${TOOL_CALL_CLOSE}`)
    expect(r.toolCalls).toEqual([])
    expect(r.text).toContain('bar')
    expect(r.text).toContain(TOOL_CALL_OPEN)
    expect(r.text).toContain(TOOL_CALL_CLOSE)
  })

  test('unparseable block flushes back as text', () => {
    const s = new ToolCallSplitter(['foo'])
    const r = s.feed(`${TOOL_CALL_OPEN}\nnot json\n${TOOL_CALL_CLOSE}`)
    expect(r.toolCalls).toEqual([])
    expect(r.text).toContain('not json')
  })

  test('flush emits remaining text and unterminated block as text', () => {
    const s = new ToolCallSplitter(['foo'])
    s.feed('hi <tool_')
    const f = s.flush()
    expect(f.text).toBe('<tool_')
    expect(f.toolCalls).toEqual([])
  })

  test('flush of unterminated block emits open tag + body as text', () => {
    const s = new ToolCallSplitter(['foo'])
    s.feed(`${TOOL_CALL_OPEN}\n{"name":"foo"`)
    const f = s.flush()
    expect(f.text).toContain(TOOL_CALL_OPEN)
    expect(f.text).toContain('"name":"foo"')
    expect(f.toolCalls).toEqual([])
  })

  test('text after last valid tool call is dropped', () => {
    const s = new ToolCallSplitter(['foo'])
    s.feed(`${TOOL_CALL_OPEN}\n{"name":"foo","arguments":{}}\n${TOOL_CALL_CLOSE}`)
    const r = s.feed('this should be dropped')
    expect(r.text).toBe('')
    expect(r.toolCalls).toEqual([])
  })

  test('text after last valid tool call is dropped on flush too', () => {
    const s = new ToolCallSplitter(['foo'])
    s.feed(`${TOOL_CALL_OPEN}\n{"name":"foo","arguments":{}}\n${TOOL_CALL_CLOSE}`)
    s.feed('dropped text')
    const f = s.flush()
    expect(f.text).toBe('')
    expect(f.toolCalls).toEqual([])
  })

  test('arguments as string are preserved as a JSON string', () => {
    const s = new ToolCallSplitter(['foo'])
    const r = s.feed(`${TOOL_CALL_OPEN}\n{"name":"foo","arguments":"{\\"q\\":1}"}\n${TOOL_CALL_CLOSE}`)
    expect(r.toolCalls.length).toBe(1)
    expect(JSON.parse(r.toolCalls[0]!.function.arguments)).toEqual({q: 1})
  })
})

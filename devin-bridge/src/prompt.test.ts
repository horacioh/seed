import {describe, expect, test} from 'bun:test'
import {extractContent, renderPrompt} from './prompt.js'
import {TOOL_CALL_OPEN, TOOL_CALL_CLOSE} from './toolcalls.js'

describe('extractContent', () => {
  test('string content returns text', () => {
    const {text, images} = extractContent('hello', {n: 0})
    expect(text).toBe('hello')
    expect(images).toEqual([])
  })

  test('text parts are concatenated', () => {
    const {text, images} = extractContent(
      [
        {type: 'text', text: 'a'},
        {type: 'text', text: 'b'},
      ],
      {n: 0},
    )
    expect(text).toBe('ab')
    expect(images).toEqual([])
  })

  test('data-URL image yields image block and [image N] text', () => {
    const {text, images} = extractContent(
      [
        {type: 'text', text: 'see this:'},
        {type: 'image_url', image_url: {url: 'data:image/png;base64,abc123'}},
      ],
      {n: 0},
    )
    expect(text).toBe('see this:[image 1]')
    expect(images).toEqual([{mimeType: 'image/png', data: 'abc123'}])
  })

  test('non-data image URL yields [image: url] text and no image block', () => {
    const {text, images} = extractContent(
      [
        {type: 'text', text: 'look'},
        {type: 'image_url', image_url: {url: 'https://example.com/cat.png'}},
      ],
      {n: 0},
    )
    expect(text).toBe('look[image: https://example.com/cat.png]')
    expect(images).toEqual([])
  })
})

describe('renderPrompt', () => {
  test('merges system and developer messages into <system>', () => {
    const blocks = renderPrompt({
      messages: [
        {role: 'system', content: 'be helpful'},
        {role: 'developer', content: 'be concise'},
        {role: 'user', content: 'hi'},
      ],
    })
    expect(blocks[0]!.type).toBe('text')
    const text = (blocks[0]! as {text: string}).text
    expect(text).toContain('<system>')
    expect(text).toContain('be helpful')
    expect(text).toContain('be concise')
    expect(text).toContain('<user>')
    expect(text).toContain('hi')
  })

  test('tool result resolves name from matching earlier tool_call id', () => {
    const blocks = renderPrompt({
      messages: [
        {role: 'user', content: 'weather?'},
        {
          role: 'assistant',
          content: '',
          tool_calls: [{id: 'tc1', type: 'function', function: {name: 'get_weather', arguments: '{"city":"SF"}'}}],
        },
        {role: 'tool', tool_call_id: 'tc1', content: 'sunny'},
      ],
    })
    const text = (blocks[0]! as {text: string}).text
    expect(text).toContain('<tool_result id="tc1" name="get_weather">')
    expect(text).toContain('sunny')
  })

  test('assistant tool_calls re-rendered as tool_call tags including id', () => {
    const blocks = renderPrompt({
      messages: [
        {role: 'user', content: 'go'},
        {
          role: 'assistant',
          content: 'calling',
          tool_calls: [{id: 'tc9', type: 'function', function: {name: 'do_thing', arguments: '{"x":1}'}}],
        },
      ],
    })
    const text = (blocks[0]! as {text: string}).text
    expect(text).toContain('"name":"do_thing"')
    expect(text).toContain('"id":"tc9"')
    expect(text).toContain('"x":1')
    expect(text).toContain(TOOL_CALL_OPEN)
    expect(text).toContain(TOOL_CALL_CLOSE)
  })

  test('functions section lists tools as JSON when tools present', () => {
    const blocks = renderPrompt({
      messages: [{role: 'user', content: 'go'}],
      tools: [{type: 'function', function: {name: 'foo', description: 'do foo', parameters: {type: 'object'}}}],
    })
    const text = (blocks[0]! as {text: string}).text
    expect(text).toContain('<functions>')
    expect(text).toContain('"name": "foo"')
    expect(text).toContain('do foo')
  })

  test('no functions section when tool_choice is none', () => {
    const blocks = renderPrompt({
      messages: [{role: 'user', content: 'go'}],
      tools: [{type: 'function', function: {name: 'foo', description: 'd', parameters: {type: 'object'}}}],
      toolChoice: 'none',
    })
    const text = (blocks[0]! as {text: string}).text
    expect(text).not.toContain('<functions>')
  })

  test('tool_choice required instructs must call at least one', () => {
    const blocks = renderPrompt({
      messages: [{role: 'user', content: 'go'}],
      tools: [{type: 'function', function: {name: 'foo', description: 'd', parameters: {type: 'object'}}}],
      toolChoice: 'required',
    })
    const text = (blocks[0]! as {text: string}).text
    expect(text).toContain('must call at least one function')
  })

  test('specific tool_choice instructs must call exactly that one', () => {
    const blocks = renderPrompt({
      messages: [{role: 'user', content: 'go'}],
      tools: [{type: 'function', function: {name: 'foo', description: 'd', parameters: {type: 'object'}}}],
      toolChoice: {type: 'function', function: {name: 'foo'}},
    })
    const text = (blocks[0]! as {text: string}).text
    expect(text).toContain('must call exactly the function "foo"')
  })

  test('data-URL image on final user message becomes an ACP image block', () => {
    const blocks = renderPrompt({
      messages: [
        {role: 'user', content: 'first'},
        {role: 'assistant', content: 'ok'},
        {
          role: 'user',
          content: [
            {type: 'text', text: 'see:'},
            {type: 'image_url', image_url: {url: 'data:image/jpeg;base64,ZZZ'}},
          ],
        },
      ],
    })
    expect(blocks.length).toBe(2)
    expect(blocks[0]!.type).toBe('text')
    expect(blocks[1]).toEqual({type: 'image', mimeType: 'image/jpeg', data: 'ZZZ'})
  })

  test('images are numbered globally across the whole transcript and all attached', () => {
    const blocks = renderPrompt({
      messages: [
        {
          role: 'user',
          content: [
            {type: 'text', text: 'first image:'},
            {type: 'image_url', image_url: {url: 'data:image/png;base64,AAA'}},
          ],
        },
        {role: 'assistant', content: 'ok'},
        {
          role: 'user',
          content: [
            {type: 'text', text: 'second image:'},
            {type: 'image_url', image_url: {url: 'data:image/png;base64,BBB'}},
          ],
        },
      ],
    })
    const text = (blocks[0]! as {text: string}).text
    expect(text).toContain('[image 1]')
    expect(text).toContain('[image 2]')
    expect(blocks.length).toBe(3)
    expect(blocks[1]).toEqual({type: 'image', mimeType: 'image/png', data: 'AAA'})
    expect(blocks[2]).toEqual({type: 'image', mimeType: 'image/png', data: 'BBB'})
  })
})

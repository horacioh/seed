import type * as OpenAI from './openai.js'
import type {AcpContentBlock} from './acp.js'
import {TOOL_CALL_OPEN, TOOL_CALL_CLOSE} from './toolcalls.js'

/** The OpenAI chat message shape we accept, loosely typed. */
export type ChatMessage = {
  role: string
  content: string | ChatContentPart[]
  tool_calls?: Array<{id: string; type: 'function'; function: {name: string; arguments: string}}>
  tool_call_id?: string
  name?: string
}

/** One part of a multimodal message content array. */
export type ChatContentPart = {type: 'text'; text: string} | {type: 'image_url'; image_url: {url: string}}

/**
 * Extracts text and any data-URL images from a message's content. Images are
 * numbered by the provided counter (mutated in place) so they can be numbered
 * globally across the whole transcript.
 */
export function extractContent(
  content: string | ChatContentPart[],
  imageCounter: {n: number},
): {
  text: string
  images: Array<{mimeType: string; data: string}>
} {
  if (typeof content === 'string') return {text: content, images: []}
  const textParts: string[] = []
  const images: Array<{mimeType: string; data: string}> = []
  for (const part of content) {
    if (part.type === 'text') {
      textParts.push(part.text)
    } else if (part.type === 'image_url') {
      const url = part.image_url?.url ?? ''
      const match = /^data:([^;]+);base64,(.*)$/s.exec(url)
      if (match && match[1] !== undefined && match[2] !== undefined) {
        imageCounter.n += 1
        textParts.push(`[image ${imageCounter.n}]`)
        images.push({mimeType: match[1], data: match[2]})
      } else {
        textParts.push(`[image: ${url}]`)
      }
    }
  }
  return {text: textParts.join(''), images}
}

/** Renders the full transcript into ACP content blocks (text first, then images). */
export function renderPrompt(opts: {
  messages: ChatMessage[]
  tools?: OpenAI.ChatTool[]
  toolChoice?: string | {type: 'function'; function: {name: string}}
}): AcpContentBlock[] {
  const {messages, tools, toolChoice} = opts
  const sections: string[] = []
  const imageCounter = {n: 0}
  const allImages: Array<{mimeType: string; data: string}> = []

  // 1. Preamble
  sections.push(
    [
      'You are serving as a plain language model behind an OpenAI-compatible API for another application.',
      'Your own tools (shell, files, search, web) are disabled — never call them.',
      'Answer only from the conversation.',
      'Reply as the assistant to the final message.',
    ].join(' '),
  )

  // 2. Function-calling section
  if (tools && tools.length > 0 && toolChoice !== 'none') {
    const fns = tools.map((t) => ({
      name: t.function.name,
      description: t.function.description,
      parameters: t.function.parameters,
    }))
    let block = `<functions>\n${JSON.stringify(fns, null, 2)}\n</functions>\n`
    block +=
      'To call a function, reply with one or more blocks exactly like ' +
      TOOL_CALL_OPEN +
      '\n{"name":"<function-name>","arguments":{...}}\n' +
      TOOL_CALL_CLOSE +
      ' and nothing after the last block. Function results arrive as <tool_result> messages. '
    if (toolChoice === 'required') {
      block += 'You must call at least one function.'
    } else if (toolChoice && typeof toolChoice === 'object' && toolChoice.function?.name) {
      block += `You must call exactly the function "${toolChoice.function.name}".`
    } else {
      block += 'Otherwise, answer normally.'
    }
    sections.push(block)
  }

  // 3. System + developer messages
  const systemText = messages
    .filter((m) => m.role === 'system' || m.role === 'developer')
    .map((m) => extractContent(m.content, imageCounter).text)
    .filter((t) => t.length > 0)
    .join('\n\n')
  if (systemText) sections.push(`<system>\n${systemText}\n</system>`)

  // 4. Conversation
  const convo = messages.filter((m) => m.role !== 'system' && m.role !== 'developer')
  const rendered: string[] = []
  // Map tool_call_id -> function name for tool messages.
  const idToName = new Map<string, string>()
  for (const m of convo) {
    if (m.role === 'assistant') {
      const {text, images} = extractContent(m.content, imageCounter)
      allImages.push(...images)
      let block = `<assistant>`
      if (text) block += `\n${text}`
      if (m.tool_calls) {
        for (const tc of m.tool_calls) {
          idToName.set(tc.id, tc.function.name)
          let args = tc.function.arguments
          try {
            // Re-stringify to normalize; if it fails, keep raw.
            const parsed = JSON.parse(args)
            args = JSON.stringify(parsed)
          } catch {
            // keep raw
          }
          block += `\n${TOOL_CALL_OPEN}\n{"name":${JSON.stringify(tc.function.name)},"id":${JSON.stringify(
            tc.id,
          )},"arguments":${args}}\n${TOOL_CALL_CLOSE}`
        }
      }
      block += `\n</assistant>`
      rendered.push(block)
    } else if (m.role === 'tool') {
      const {text} = extractContent(m.content, imageCounter)
      const name = m.name ?? idToName.get(m.tool_call_id ?? '') ?? 'unknown'
      rendered.push(`<tool_result id="${m.tool_call_id ?? ''}" name="${name}">\n${text}\n</tool_result>`)
    } else if (m.role === 'user') {
      const {text, images} = extractContent(m.content, imageCounter)
      allImages.push(...images)
      rendered.push(`<user>\n${text}\n</user>`)
    } else {
      const {text, images} = extractContent(m.content, imageCounter)
      allImages.push(...images)
      rendered.push(`<${m.role}>\n${text}\n</${m.role}>`)
    }
  }
  if (rendered.length > 0) sections.push(`<conversation>\n${rendered.join('\n')}\n</conversation>`)

  const textBlock = sections.join('\n\n')
  const blocks: AcpContentBlock[] = [{type: 'text', text: textBlock}]
  for (const img of allImages) blocks.push({type: 'image', mimeType: img.mimeType, data: img.data})
  return blocks
}

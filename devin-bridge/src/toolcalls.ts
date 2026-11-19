/** Opening tag of an emulated tool call in model output. */
export const TOOL_CALL_OPEN = ['<', 'tool_call', '>'].join('')
/** Closing tag of an emulated tool call in model output. */
export const TOOL_CALL_CLOSE = ['</', 'tool_call', '>'].join('')

/**
 * A streaming splitter that emits plain-text deltas immediately while holding
 * back any trailing suffix that could be the start of a tool-call opening tag.
 * Once a block opens, it buffers until the closing tag. Only active when the
 * request had tools; otherwise pass text straight through.
 *
 * After a valid tool call has been emitted, further text deltas are suppressed
 * (text after the last valid tool call is dropped, per spec).
 */
export class ToolCallSplitter {
  private buffer = ''
  private inBlock = false
  private hadToolCall = false
  private readonly knownNames: Set<string>

  constructor(knownNames: string[] | null) {
    this.knownNames = knownNames ? new Set(knownNames) : new Set()
  }

  /** Returns true if this splitter is active (i.e. the request declared tools). */
  get active(): boolean {
    return this.knownNames.size > 0
  }

  /**
   * Feed a text delta. Returns text to emit immediately and any completed tool
   * calls. Tool calls are only emitted once a block is fully closed.
   */
  feed(delta: string): {text: string; toolCalls: ParsedToolCall[]} {
    if (!this.active) return {text: delta, toolCalls: []}
    // After a valid tool call, suppress all further text.
    if (this.hadToolCall) return {text: '', toolCalls: []}
    let text = ''
    const toolCalls: ParsedToolCall[] = []
    this.buffer += delta
    while (this.buffer.length > 0) {
      if (!this.inBlock) {
        const idx = this.buffer.indexOf(TOOL_CALL_OPEN)
        if (idx >= 0) {
          // Emit text before the opening tag, then enter the block.
          text += this.buffer.slice(0, idx)
          this.buffer = this.buffer.slice(idx + TOOL_CALL_OPEN.length)
          this.inBlock = true
          continue
        }
        // No opening tag found: emit all but a trailing suffix that could be the
        // start of the tag (the next delta may complete it).
        const hold = this.trailingPrefix(this.buffer, TOOL_CALL_OPEN)
        text += this.buffer.slice(0, this.buffer.length - hold.length)
        this.buffer = this.buffer.slice(this.buffer.length - hold.length)
        break
      } else {
        const closeIdx = this.buffer.indexOf(TOOL_CALL_CLOSE)
        if (closeIdx >= 0) {
          const body = this.buffer.slice(0, closeIdx)
          this.buffer = this.buffer.slice(closeIdx + TOOL_CALL_CLOSE.length)
          this.inBlock = false
          const parsed = this.parseBlock(body)
          if (parsed) {
            toolCalls.push(parsed)
            this.hadToolCall = true
          } else {
            // Unparseable or unknown name: flush back as text.
            text += TOOL_CALL_OPEN + body + TOOL_CALL_CLOSE
          }
          continue
        }
        // Not closed yet: keep buffering.
        break
      }
    }
    return {text, toolCalls}
  }

  /** Flushes any remaining buffer at end of stream. */
  flush(): {text: string; toolCalls: ParsedToolCall[]} {
    if (!this.active) {
      const text = this.buffer
      this.buffer = ''
      return {text, toolCalls: []}
    }
    let text = ''
    const toolCalls: ParsedToolCall[] = []
    if (this.inBlock) {
      // Unterminated block: flush as text.
      text += TOOL_CALL_OPEN + this.buffer
      this.buffer = ''
      this.inBlock = false
    } else if (this.buffer.length > 0 && !this.hadToolCall) {
      // Trailing partial tag or text: emit as text (unless after a tool call).
      text += this.buffer
      this.buffer = ''
    } else {
      this.buffer = ''
    }
    return {text, toolCalls}
  }

  /** Returns the longest suffix of `s` that is a prefix of `tag`. */
  private trailingPrefix(s: string, tag: string): string {
    for (let len = Math.min(s.length, tag.length); len > 0; len -= 1) {
      if (tag.startsWith(s.slice(s.length - len))) {
        return s.slice(s.length - len)
      }
    }
    return ''
  }

  private parseBlock(body: string): ParsedToolCall | null {
    // Trim and strip an optional surrounding Markdown fence (``` or ```json … ```).
    let trimmed = body.trim()
    const fenceMatch = /^```(?:json)?\s*([\s\S]*?)\s*```$/.exec(trimmed)
    if (fenceMatch && fenceMatch[1] !== undefined) trimmed = fenceMatch[1]
    try {
      const obj = JSON.parse(trimmed) as {name?: unknown; arguments?: unknown; id?: unknown}
      if (typeof obj.name !== 'string' || !this.knownNames.has(obj.name)) return null
      let args: object | string
      if (obj.arguments === undefined) {
        args = {}
      } else if (typeof obj.arguments === 'string') {
        // Validate it parses, keep as string.
        JSON.parse(obj.arguments)
        args = obj.arguments
      } else if (typeof obj.arguments === 'object' && obj.arguments !== null) {
        args = obj.arguments as object
      } else {
        return null
      }
      return {
        id: 'call_' + Math.random().toString(36).slice(2, 12),
        type: 'function' as const,
        function: {name: obj.name, arguments: typeof args === 'string' ? args : JSON.stringify(args)},
      }
    } catch {
      return null
    }
  }
}

/** A parsed tool call emitted by the splitter. */
export type ParsedToolCall = {
  id: string
  type: 'function'
  function: {name: string; arguments: string}
}

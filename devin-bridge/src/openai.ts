/** A function tool declared in a chat completion request. */
export type ChatTool = {
  type: 'function'
  function: {name: string; description?: string; parameters: unknown}
}

/** A chat completion request body (only the fields we consume). */
export type ChatCompletionRequest = {
  model: string
  messages: unknown[]
  stream?: boolean
  stream_options?: {include_usage?: boolean}
  tools?: ChatTool[]
  tool_choice?: string | {type: 'function'; function: {name: string}}
}

/** A model entry in a `/v1/models` response. */
export type ModelEntry = {id: string; object: 'model'; owned_by: string}

/** Builds an OpenAI-shaped error body. */
export function errorBody(
  message: string,
  type = 'invalid_request_error',
  code?: string,
): {error: {message: string; type: string; code?: string}} {
  return {error: {message, type, code}}
}

/** Estimates token usage as ceil(chars/4) for both prompt and completion. */
export function estimateUsage(
  promptChars: number,
  completionChars: number,
): {
  prompt_tokens: number
  completion_tokens: number
  total_tokens: number
} {
  const prompt_tokens = Math.ceil(promptChars / 4)
  const completion_tokens = Math.ceil(completionChars / 4)
  return {prompt_tokens, completion_tokens, total_tokens: prompt_tokens + completion_tokens}
}

/** Maps an ACP stopReason to an OpenAI finish_reason. */
export function finishReason(stopReason: string | undefined): 'stop' | 'length' | 'tool_calls' {
  if (stopReason === 'max_tokens') return 'length'
  return 'stop'
}

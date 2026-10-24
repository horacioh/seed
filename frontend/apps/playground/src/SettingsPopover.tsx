import {useState} from 'react'
import {getGatewayHost, setGatewayHost} from './gateway'
import {queryClient} from './queryClient'

export function SettingsPopover() {
  const [host, setHost] = useState(getGatewayHost)
  const [saved, setSaved] = useState(host)

  function applyHost() {
    const normalizedHost = host.trim().replace(/\/+$/, '')
    if (!normalizedHost) return
    setGatewayHost(normalizedHost)
    setHost(normalizedHost)
    setSaved(normalizedHost)
    void queryClient.invalidateQueries()
  }

  return (
    <details className="relative">
      <summary className="text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer list-none rounded-md px-3 py-2 text-sm">
        Gateway
      </summary>
      <form
        className="bg-popover text-popover-foreground absolute right-0 z-50 mt-2 grid w-80 gap-3 rounded-lg border p-4 shadow-lg"
        onSubmit={(event) => {
          event.preventDefault()
          applyHost()
        }}
      >
        <label className="grid gap-1.5 text-sm font-medium">
          Read-only gateway
          <input
            className="bg-background h-9 rounded-md border px-3 text-sm font-normal"
            value={host}
            onChange={(event) => setHost(event.target.value)}
            placeholder="https://hyper.media"
            aria-label="Gateway host"
          />
        </label>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-xs">{saved === host ? 'Saved' : 'Unsaved changes'}</span>
          <button
            className="bg-primary text-primary-foreground rounded-md px-3 py-1.5 text-sm hover:opacity-90"
            type="submit"
          >
            Apply
          </button>
        </div>
      </form>
    </details>
  )
}

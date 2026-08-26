import * as stylex from '@stylexjs/stylex'
import {search} from '@shm/shared'
import {Loader} from 'lucide-react'
import {FormEvent, useState} from 'react'
import {useNavigate} from 'react-router-dom'
const styles = stylex.create({
  scaf02c5d: {
    marginBottom: 'calc(0.25rem * 4)',
    fontSize: '1.875rem',
    lineHeight: 'calc(2.25 / 1.875)',
    fontWeight: '700',
    color: 'oklch(21% 0.034 264.665)',
  },
  s1925884a: {
    marginBottom: 'calc(0.25rem * 6)',
    color: 'oklch(44.6% 0.03 256.802)',
  },
  s3301fe: {
    marginBottom: 'calc(0.25rem * 6)',
  },
  sd42c505: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    animation: 'spin 1s linear infinite',
  },
  s2659d5ee: {
    marginTop: 'calc(0.25rem * 4)',
    borderRadius: 'var(--radius)',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(88.5% 0.062 18.334)',
    backgroundColor: 'oklch(97.1% 0.013 17.38)',
    padding: 'calc(0.25rem * 4)',
    color: 'oklch(57.7% 0.245 27.325)',
  },
  s21be97f: {
    marginBottom: 'calc(0.25rem * 2)',
    fontSize: '1.25rem',
    lineHeight: 'calc(1.75 / 1.25)',
    fontWeight: '600',
  },
})
export default function Home() {
  const [url, setUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const navigate = useNavigate()
  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!url) return
    setErrorMessage(null)
    setIsLoading(true)
    search(url)
      .then((result) => {
        if (result.destination) {
          setErrorMessage(null)
          navigate(result.destination)
        } else {
          setErrorMessage(result.errorMessage || 'Unknown error')
        }
      })
      .finally(() => {
        setIsLoading(false)
      })
  }
  return (
    <div className="container mx-auto max-w-2xl rounded-lg bg-white p-4 shadow">
      <h1 className={stylex.props(styles.scaf02c5d).className || ''}>Explore Hypermedia</h1>
      <p className={stylex.props(styles.s1925884a).className || ''}>
        Enter a URL to explore the Hypermedia network. Supports hm://, ipfs://, and http(s):// URLS of hypermedia
        documents.
      </p>

      <form onSubmit={handleSearch} className={stylex.props(styles.s3301fe).className || ''}>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter URL to explore…"
            className="focus:ring-link focus:border-link flex-1 rounded-lg border border-gray-300 p-4 text-base focus:ring-2 focus:outline-none sm:rounded-l-lg sm:rounded-r-none"
          />
          <button
            type="submit"
            disabled={isLoading || !url}
            className="flex min-h-[56px] items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-4 text-base font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300 sm:rounded-l-none sm:rounded-r-lg"
          >
            {isLoading ? <Loader className={stylex.props(styles.sd42c505).className || ''} /> : 'Search'}
          </button>
        </div>
      </form>

      {errorMessage && (
        <div className={stylex.props(styles.s2659d5ee).className || ''}>
          <h2 className={stylex.props(styles.s21be97f).className || ''}>Error</h2>
          <p>{errorMessage}</p>
        </div>
      )}
    </div>
  )
}

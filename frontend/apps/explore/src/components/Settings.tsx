import * as stylex from '@stylexjs/stylex'
import {Settings as SettingsIcon} from 'lucide-react'
import {useEffect, useState, useSyncExternalStore} from 'react'
import {getSnapshot, subscribe, updateApiHost} from '../apiHostStore'
const styles = stylex.create({
  sf230241a: {
    position: 'fixed',
    zIndex: '10',
    bottom: 'calc(0.25rem * 4)',
    left: 'calc(0.25rem * 4)',
  },
  s12fa7adc: {
    display: 'flex',
    alignItems: 'center',
    padding: 'calc(0.25rem * 2)',
    backgroundColor: '#fff',
    borderRadius: 'var(--radius)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-md)',
  },
  s15459875: {
    width: 'calc(0.25rem * 5)',
    height: 'calc(0.25rem * 5)',
    color: 'oklch(44.6% 0.03 256.802)',
  },
  s20e83d91: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: 'calc(0.25rem * 2)',
  },
  se06d7839: {
    fontSize: '0.75rem',
    lineHeight: 'calc(1 / 0.75)',
    fontWeight: '500',
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s4204e085: {
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    color: 'oklch(55.1% 0.027 264.364)',
  },
  s78cd724d: {
    position: 'absolute',
    left: 'calc(0.25rem * 0)',
    padding: 'calc(0.25rem * 4)',
    backgroundColor: '#fff',
    borderStyle: 'solid',
    borderWidth: '1px',
    borderColor: 'oklch(92.8% 0.006 264.531)',
    borderRadius: 'var(--radius)',
    boxShadow: '0 0 #0000, 0 0 #0000, 0 0 #0000, 0 0 #0000, var(--shadow-xl)',
    bottom: 'calc(0.25rem * 12)',
    width: 'calc(0.25rem * 80)',
  },
  sd45c6c99: {
    marginBottom: 'calc(0.25rem * 4)',
    fontSize: '1.125rem',
    lineHeight: 'calc(1.75 / 1.125)',
    fontWeight: '500',
    color: 'oklch(21% 0.034 264.665)',
  },
  s3301fc: {
    marginBottom: 'calc(0.25rem * 4)',
  },
  s4000ce6: {
    display: 'block',
    marginBottom: 'calc(0.25rem * 1)',
    fontSize: '0.875rem',
    lineHeight: 'calc(1.25 / 0.875)',
    fontWeight: '500',
    color: 'oklch(37.3% 0.034 259.733)',
  },
  s9673c3fd: {
    display: 'flex',
    justifyContent: 'flex-end',
    columnGap: 'calc(0.25rem * 2)',
  },
})
export default function Settings() {
  const [isOpen, setIsOpen] = useState(false)
  const apiHost = useSyncExternalStore(subscribe, getSnapshot)
  const [inputValue, setInputValue] = useState(apiHost)
  useEffect(() => {
    setInputValue(apiHost)
  }, [apiHost])
  const handleSave = () => {
    updateApiHost(inputValue)
    setIsOpen(false)
  }
  return (
    <div className={stylex.props(styles.sf230241a).className || ''}>
      <div className={stylex.props(styles.s12fa7adc).className || ''}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="rounded-full bg-gray-200 p-2 transition-colors hover:bg-gray-300"
          aria-label="Settings"
        >
          <SettingsIcon className={stylex.props(styles.s15459875).className || ''} />
        </button>
        <div className={stylex.props(styles.s20e83d91).className || ''}>
          <span className={stylex.props(styles.se06d7839).className || ''}>Hypermedia API</span>
          <span className={stylex.props(styles.s4204e085).className || ''}>{apiHost}</span>
        </div>
      </div>

      {isOpen && (
        <div className={stylex.props(styles.s78cd724d).className || ''}>
          <h3 className={stylex.props(styles.sd45c6c99).className || ''}>Settings</h3>
          <div className={stylex.props(styles.s3301fc).className || ''}>
            <label htmlFor="apiHost" className={stylex.props(styles.s4000ce6).className || ''}>
              Explore API Host
            </label>
            <input
              type="text"
              id="apiHost"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 focus:outline-none"
              placeholder="Enter API host URL"
            />
          </div>
          <div className={stylex.props(styles.s9673c3fd).className || ''}>
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-none"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none"
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

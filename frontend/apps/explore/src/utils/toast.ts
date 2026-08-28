import * as stylex from '@stylexjs/stylex'

const styles = stylex.create({
  toast: {
    position: 'fixed',
    bottom: 16,
    right: 16,
    zIndex: 50,
    maxWidth: {default: 320, '@media (width >= 40rem)': 384},
    paddingInline: 16,
    paddingBlock: 12,
    color: '#fff',
    backgroundColor: {
      default: 'color-mix(in oklab, oklch(21% 0.034 264.665) 90%, transparent)',
      ':hover': 'color-mix(in oklab, oklch(27.8% 0.033 256.848) 90%, transparent)',
    },
    backdropFilter: 'blur(4px)',
    borderRadius: 12,
    boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    cursor: 'pointer',
    transitionProperty: 'all',
    transitionDuration: '500ms',
    transitionTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  hidden: {
    opacity: 0,
    transform: 'translateY(100%) scale(0.95)',
  },
  visible: {
    opacity: 1,
    transform: {default: 'translateY(0) scale(1)', ':hover': 'translateY(0) scale(1.05)'},
  },
})

export function showToast(message: string, duration = 3000) {
  // Create toast element
  const toast = document.createElement('div')
  const hiddenClass = stylex.props(styles.toast, styles.hidden).className ?? ''
  const visibleClass = stylex.props(styles.toast, styles.visible).className ?? ''
  toast.className = hiddenClass
  toast.textContent = message

  // Add subtle border and better typography with text wrapping
  toast.style.border = '1px solid rgba(255, 255, 255, 0.1)'
  toast.style.fontSize = '14px'
  toast.style.fontWeight = '500'
  toast.style.wordWrap = 'break-word'
  toast.style.overflowWrap = 'break-word'
  toast.style.whiteSpace = 'pre-wrap'
  toast.style.lineHeight = '1.4'

  document.body.appendChild(toast)

  let timeoutId: NodeJS.Timeout
  let isHovered = false

  // Hover pause functionality
  toast.addEventListener('mouseenter', () => {
    isHovered = true
    clearTimeout(timeoutId)
    toast.style.animationPlayState = 'paused'
  })

  toast.addEventListener('mouseleave', () => {
    isHovered = false
    startDismissTimer()
  })

  // Click to dismiss
  toast.addEventListener('click', () => {
    dismissToast()
  })

  function startDismissTimer() {
    timeoutId = setTimeout(() => {
      if (!isHovered) {
        dismissToast()
      }
    }, duration)
  }

  function dismissToast() {
    toast.style.transform = ''
    toast.className = hiddenClass
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast)
      }
    }, 500)
  }

  // Entrance animation with slight delay for better effect
  requestAnimationFrame(() => {
    setTimeout(() => {
      toast.className = visibleClass

      // Add a subtle bounce effect
      setTimeout(() => {
        toast.style.transform = 'translateY(0) scale(1.02)'
        setTimeout(() => {
          toast.style.transform = 'translateY(0) scale(1)'
        }, 150)
      }, 200)
    }, 50)
  })

  // Start dismiss timer
  startDismissTimer()
}

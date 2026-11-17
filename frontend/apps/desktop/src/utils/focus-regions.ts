const REGION_SELECTOR =
  '[data-a11y-region="titlebar"], [data-a11y-region="sidebar"], [data-a11y-region="main"], [data-a11y-region="panel"]'

function isVisible(element: HTMLElement) {
  return (
    element.getAttribute('aria-hidden') !== 'true' &&
    !element.hidden &&
    getComputedStyle(element).display !== 'none' &&
    getComputedStyle(element).visibility !== 'hidden' &&
    element.getClientRects().length > 0
  )
}

/** Moves focus to the next visible shell region in titlebar/sidebar/main/panel order. */
export function focusNextShellRegion(reverse = false): HTMLElement | null {
  const regions = Array.from(document.querySelectorAll<HTMLElement>(REGION_SELECTOR)).filter(isVisible)
  if (!regions.length) return null

  const currentIndex = regions.findIndex((region) => region.contains(document.activeElement))
  const startIndex = currentIndex < 0 ? (reverse ? 0 : -1) : currentIndex
  const nextIndex = (startIndex + (reverse ? -1 : 1) + regions.length) % regions.length
  const region = regions[nextIndex]
  const focusable = Array.from(
    region.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  ).find(isVisible)
  ;(focusable || region).focus()
  return focusable || region
}

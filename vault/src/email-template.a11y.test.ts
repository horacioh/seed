import axe from 'axe-core'
import {describe, expect, test} from 'bun:test'
import {createInvitationEmail, createVerificationEmail} from '@/email-template'

async function expectAccessibleEmail(html: string, text: string, primaryContent: string) {
  const originalDocument = document.documentElement.outerHTML

  try {
    document.open()
    document.write(html)
    document.close()

    expect(document.documentElement.lang).toBe('en')
    expect(document.documentElement.dir).toBe('ltr')
    expect(document.querySelectorAll('h1')).toHaveLength(1)
    expect(document.querySelector('meta[name="color-scheme"]')?.getAttribute('content')).toBe('light only')
    expect(document.querySelector('meta[name="supported-color-schemes"]')?.getAttribute('content')).toBe('light only')
    expect(text.trim()).not.toBe('')
    expect(text).toContain(primaryContent)

    for (const image of document.querySelectorAll('img')) {
      expect(image.hasAttribute('alt')).toBe(true)
      expect(image.getAttribute('alt')).not.toMatch(/\.(?:png|jpe?g|gif|webp|svg)(?:$|[?#])/i)
    }

    for (const table of document.querySelectorAll('table')) {
      expect(table.getAttribute('role')).toMatch(/^(?:presentation|none)$/)
    }

    for (const link of document.querySelectorAll('a')) {
      const accessibleName = link.getAttribute('aria-label') || link.textContent?.trim() || ''
      expect(accessibleName).not.toBe('')
      expect(accessibleName).not.toMatch(/\b(?:click here|here)\b/i)
    }

    const {violations} = await axe.run(document, {rules: {'color-contrast': {enabled: false}}})
    expect(violations).toEqual([])
  } finally {
    document.open()
    document.write(originalDocument)
    document.close()
  }
}

describe('vault email template accessibility', () => {
  test('verification email has accessible structure and code in plain text', async () => {
    const result = createVerificationEmail('482913', 'https://seed.example/email-logo.png')
    await expectAccessibleEmail(result.html, result.text, '482913')
  })

  test('invitation email has accessible structure and link in plain text', async () => {
    const link = 'https://seed.example/vault?invite=abc123'
    const result = createInvitationEmail(
      link,
      {siteName: 'Acme', role: 'writer'},
      'https://seed.example/email-logo.png',
    )
    await expectAccessibleEmail(result.html, result.text, link)
  })
})

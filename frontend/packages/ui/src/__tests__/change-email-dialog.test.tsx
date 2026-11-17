// @vitest-environment jsdom
import React from 'react'
import {createRoot, type Root} from 'react-dom/client'
import {act} from 'react-dom/test-utils'
import {afterEach, beforeEach, describe, expect, it} from 'vitest'
import {ChangeEmailDialog} from '../components/change-email-dialog'
;(globalThis as typeof globalThis & {React?: typeof React}).React = React

let container: HTMLDivElement
let root: Root

beforeEach(() => {
  container = document.createElement('div')
  document.body.appendChild(container)
  root = createRoot(container)
})

afterEach(() => {
  act(() => root.unmount())
  container.remove()
})

function getByLabelText(labelText: string) {
  const label = Array.from(document.querySelectorAll('label')).find(
    (candidate) => candidate.textContent?.trim() === labelText,
  )
  if (!label) throw new Error(`Unable to find a label with text ${labelText}`)
  return label.control
}

describe('ChangeEmailDialog', () => {
  it('focuses and labels the first field when opened', () => {
    act(() =>
      root.render(
        <ChangeEmailDialog open onOpenChange={() => {}} onStart={async () => {}} onVerify={async () => {}} />,
      ),
    )
    const input = document.querySelector<HTMLInputElement>('#change-email-new')

    expect(document.activeElement).toBe(input)
    expect(getByLabelText('New Email Address')).toBe(input)
  })
})

---
name: Accessibility statement
summary: How accessible the Seed desktop app, Seed web sites, the vault and Seed emails are today, what is known not to work yet, and how to report a problem.
---
Seed should work for everyone. That includes people who use a screen reader, only a keyboard, screen magnification, voice control, high contrast or reduced motion. This page says what we aim for, how close Seed is today, what we know is still broken, and how to tell us about a problem.

# What this statement covers

- The [Seed desktop app](./apps/desktop.md) on macOS, Windows and Linux.
- The [web app](./apps/web.md): `hyper.media` and every site published with Seed, including reading, editing and comments.
- The [vault](./apps/vault.md): sign up, sign in, account recovery and settings.
- The emails Seed sends: sign-in codes, invites and notifications.

The Seed landing page, Explore and the mobile app are not covered yet.

Documents on a Seed site are written by their authors. Seed gives authors tools to make them accessible: alt text for images, captions for videos, and a check before publishing that points out images without alt text, empty headings and vague link text. Each author is responsible for what they publish.

# Standard and status

Seed aims to meet [WCAG 2.2](https://www.w3.org/TR/WCAG22/) level AA and [EN 301 549](https://www.etsi.org/deliver/etsi_en/301500_301599/301549/03.02.01_60/en_301549v030201p.pdf), the European standard behind the European Accessibility Act.

Seed **partially conforms** to WCAG 2.2 AA. Most of Seed meets the standard. The parts listed under "Known problems" do not yet.

# Known problems

- **Moving blocks in the editor with a screen reader.** You can move a block with Ctrl+Shift+Up or Down (Cmd on a Mac), and Seed announces the move. VoiceOver does not read that announcement yet. NVDA does not always read the editor's name when you enter it.
- **Vault email errors with VoiceOver.** VoiceOver sometimes does not read the "That doesn't look like a valid email" message. The message is on screen and linked to the field.
- **Page language on the web.** A page's language comes from its document, but it is only set after the page loads. Until then, a screen reader may read the page as English.
- **Older content.** Images published before alt text prompts existed may have no alt text. Videos may have no captions unless their author added them.
- **File previews.** Raw audio and video files shown in agent memory have no captions, because there is no caption file to show.

We fix these in order of how much they get in people's way. This page changes when they are fixed.

# How we test

- Every change to Seed runs automated [axe](https://github.com/dequelabs/axe-core) checks on the desktop app, web pages, editor, vault and emails. The checks cover light and dark themes, forced colors, reduced motion, a 320 pixel wide window and 200% zoom. A change that adds a violation cannot merge.
- A lint check for accessibility problems in the code also blocks every change.
- Keyboard tests check the skip link, moving between regions with F6, and moving blocks without dragging.
- Automated tests with real screen readers, VoiceOver on macOS and NVDA on Windows, run every night and before every desktop release.
- Automated tools find only part of the problems people meet. Testing with JAWS, TalkBack, VoiceOver on iOS and Orca is still done by hand, and not yet on every release.

[Accessibility testing](./build/accessibility.md) explains the tests in detail.

# Tell us about a problem

If something in Seed is hard or impossible for you to use, we want to know.

[Open an accessibility issue on GitHub](https://github.com/seed-hypermedia/seed/issues/new?template=accessibility.yml). The form asks what you were trying to do and what assistive technology you use.

We aim to reply within 5 business days. Tell us if you need the information on a page in another format, and we will send it to you.

If you are in the European Union and our answer does not solve the problem, you can contact the authority that enforces the European Accessibility Act in your country.

# About this statement

This statement was written in October 2026 from our own testing: the automated checks and screen-reader tests above. It has not yet been reviewed by an outside auditor. We review it with every major release.

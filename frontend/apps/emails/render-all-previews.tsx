/**
 * Render all email template previews to HTML files.
 *
 * Run: npx tsx --conditions=import render-all-previews.tsx
 *
 * Then open email-previews/index.html in your browser.
 */
import {HMBlockNode} from '@seed-hypermedia/client/hm-types'
import {createLoginConfirmationEmail} from './email-confirmation'
import {
  createCommentEmail,
  createDesktopNotificationsEmail,
  createDiscussionEmail,
  createDocUpdateEmail,
  createMentionEmail,
  createNotificationVerificationEmail,
  createNotificationsEmail,
  createReplyEmail,
  createWelcomeEmail,
  type FullNotification,
} from './notifier'

const mockBlocks: HMBlockNode[] = [
  {
    block: {
      id: 'block1',
      type: 'Paragraph',
      attributes: {},
      text: 'Hey, I think we should revisit the color palette for the navigation bar. The current teal feels too muted on mobile screens.',
      annotations: [
        {type: 'Bold', starts: [4], ends: [7]},
        {type: 'Italic', starts: [51], ends: [65]},
      ],
    },
    children: [],
  },
  {
    block: {
      id: 'block2',
      type: 'Paragraph',
      attributes: {},
      text: 'What do you think?',
      annotations: [],
    },
    children: [],
  },
]

const mentionBlocks: HMBlockNode[] = [
  {
    block: {
      id: 'block1',
      type: 'Paragraph',
      attributes: {},
      text: '@Bea — I think this approach solves the accessibility issue.',
      annotations: [{type: 'Embed', starts: [0], ends: [4], link: 'hm://bea-account-id'}],
    },
    children: [],
  },
]

const notifications = [
  {
    accountId: 'bea-account',
    accountMeta: {name: 'Bea'},
    notif: {
      reason: 'mention',
      authorAccountId: 'gabo-account',
      authorMeta: {name: 'Gabo'},
      targetMeta: {name: 'Design Guidelines'},
      targetId: {id: 'design-guidelines'},
      subjectAccountId: 'bea-account',
      subjectAccountMeta: {name: 'Bea'},
      url: 'https://seedteamtalks.hyper.media/d/abc123',
      actionUrl: 'https://seedteamtalks.hyper.media/d/abc123',
      eventId: 'event-1',
      eventAtMs: 1740000000000,
      source: 'document',
    },
  },
] as unknown as FullNotification[]

/** Render all frontend email templates for previews and accessibility tests. */
export async function createPreviews() {
  return [
    {
      name: 'verification',
      result: await createNotificationVerificationEmail({
        verificationUrl: 'https://hyper.media/hm/api/notify/verify-email?token=verify123',
        recipientName: 'First Name',
      }),
    },
    {
      name: 'login',
      result: await createLoginConfirmationEmail({
        loginUrl: 'https://hyper.media/login?token=login123',
        recipientName: 'First Name',
      }),
    },
    {
      name: 'welcome',
      result: await createWelcomeEmail({
        recipientName: 'First Name',
        siteName: '<sitename>',
        siteUrl: 'https://seedteamtalks.hyper.media',
      }),
    },
    {
      name: 'discussion',
      result: await createDiscussionEmail({
        authorName: 'Gabo',
        documentName: 'Inspiration',
        commentBlocks: mockBlocks,
        actionUrl: 'https://seedteamtalks.hyper.media/d/abc123',
        unsubscribeUrl: 'https://hyper.media/hm/email-notifications?token=test123',
        siteUrl: 'https://seedteamtalks.hyper.media',
      }),
    },
    {
      name: 'comment',
      result: await createCommentEmail({
        authorName: 'Horacio',
        documentName: 'User Onboarding',
        sectionName: 'Design',
        commentBlocks: mockBlocks,
        actionUrl: 'https://seedteamtalks.hyper.media/d/abc123',
        unsubscribeUrl: 'https://hyper.media/hm/email-notifications?token=test123',
        siteUrl: 'https://seedteamtalks.hyper.media',
      }),
    },
    {
      name: 'mention',
      result: await createMentionEmail({
        authorName: 'Eric Alex',
        subjectName: 'you',
        documentName: 'Design Guidelines',
        commentBlocks: mentionBlocks,
        actionUrl: 'https://seedteamtalks.hyper.media/d/abc123',
        unsubscribeUrl: 'https://hyper.media/hm/email-notifications?token=test123',
        siteUrl: 'https://seedteamtalks.hyper.media',
        resolvedNames: {'hm://bea-account-id': 'Bea'},
      }),
    },
    {
      name: 'reply',
      result: await createReplyEmail({
        authorName: 'Gabo',
        documentName: 'User test Round III',
        sectionName: 'Design',
        commentBlocks: mockBlocks,
        actionUrl: 'https://seedteamtalks.hyper.media/d/abc123',
        unsubscribeUrl: 'https://hyper.media/hm/email-notifications?token=test123',
        siteUrl: 'https://seedteamtalks.hyper.media',
      }),
    },
    {
      name: 'doc-update',
      result: await createDocUpdateEmail({
        authorName: 'Gabo',
        documentName: 'Inspiration',
        sectionName: 'Design',
        changes: ['Updated the hero section layout', 'Added new color tokens', 'Removed deprecated spacing variables'],
        actionUrl: 'https://seedteamtalks.hyper.media/d/abc123',
        unsubscribeUrl: 'https://hyper.media/hm/email-notifications?token=test123',
        siteUrl: 'https://seedteamtalks.hyper.media',
      }),
    },
    {
      name: 'notifications',
      result: (await createNotificationsEmail('bea@example.com', {adminToken: 'test-token'}, notifications))!,
    },
    {
      name: 'desktop-notifications',
      result: (await createDesktopNotificationsEmail('bea@example.com', {adminToken: 'test-token'}, notifications))!,
    },
  ]
}

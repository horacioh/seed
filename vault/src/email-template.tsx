import {
  Mjml,
  MjmlBody,
  MjmlColumn,
  MjmlHead,
  MjmlImage,
  MjmlPreview,
  MjmlRaw,
  MjmlSection,
  MjmlText,
  MjmlTitle,
} from '@faire/mjml-react'
import {renderToMjml} from '@faire/mjml-react/utils/renderToMjml'
import mjml2html from 'mjml'

/** Rendered verification email with subject, plain text, and HTML. */
export type VerificationEmail = {
  subject: string
  text: string
  html: string
}

// Keep these values aligned with frontend/apps/emails/email-palette.ts.
const EMAIL_PALETTE = {
  brand: '#007c68',
  muted: '#71717a',
  text: '#1a1a1a',
  bodyBackground: '#f4f4f5',
  surface: '#ffffff',
} as const
const MJML_ROOT_ATTRIBUTES = {dir: 'ltr'}

/** Render a verification email for the given code. */
export function createVerificationEmail(code: string, logoUrl?: string): VerificationEmail {
  const subject = 'Your verification code for Seed Hypermedia'
  const text = `Your verification code for Seed Hypermedia

Enter this code in the browser where you requested it:
${code}

This code will expire in 15 minutes. If you didn't request this, you can safely ignore this email.

Seed Hypermedia`

  const mjmlMarkup = renderToMjml(
    <Mjml lang="en" {...MJML_ROOT_ATTRIBUTES}>
      <MjmlHead>
        <MjmlRaw>
          <meta name="color-scheme" content="light only" />
          <meta name="supported-color-schemes" content="light only" />
        </MjmlRaw>
        <MjmlTitle>{subject}</MjmlTitle>
        <MjmlPreview>Enter this code to continue in Seed Hypermedia</MjmlPreview>
      </MjmlHead>
      <MjmlBody width={500} backgroundColor={EMAIL_PALETTE.bodyBackground}>
        <MjmlSection padding="40px 0 20px">
          <MjmlColumn>
            {logoUrl ? (
              <MjmlImage src={logoUrl} alt="Seed Hypermedia" width="40px" height="40px" padding="0" align="center" />
            ) : null}
            <MjmlText fontSize="18px" fontWeight="bold" color={EMAIL_PALETTE.brand} padding="10px 0 0" align="center">
              Seed Hypermedia
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>

        <MjmlSection backgroundColor={EMAIL_PALETTE.surface} borderRadius="8px" padding="32px 24px">
          <MjmlColumn>
            <MjmlText fontSize="24px" fontWeight="bold" color={EMAIL_PALETTE.text} padding="0 0 24px">
              <h1 style={{margin: 0, fontSize: '24px'}}>Your verification code</h1>
            </MjmlText>

            <MjmlText
              fontSize="32px"
              fontWeight="700"
              color={EMAIL_PALETTE.text}
              letterSpacing="8px"
              padding="0 0 24px"
              align="center"
            >
              {code}
            </MjmlText>

            <MjmlText fontSize="14px" color={EMAIL_PALETTE.muted} lineHeight="1.5" padding="0">
              This code will expire in 15 minutes. Enter it in the browser where you requested it. If you didn't request
              this, you can safely ignore this email.
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>

        <MjmlSection padding="24px 0">
          <MjmlColumn>
            <MjmlText fontSize="12px" color={EMAIL_PALETTE.muted} align="center">
              Seed Hypermedia
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>,
  )

  const {html} = mjml2html(mjmlMarkup)

  return {subject, text, html: html.replace('role="article"', 'role="main"')}
}

/** Render the invitation email: who invited, what role, and the one-time link. */
export function createInvitationEmail(
  link: string,
  opts: {siteName: string; role: 'reader' | 'writer'},
  logoUrl?: string,
): VerificationEmail {
  const siteName = opts.siteName || 'Seed Hypermedia'
  const subject = `You're invited to ${siteName}`
  const roleLine =
    opts.role === 'writer'
      ? 'You will be able to read and edit its documents.'
      : 'You will be able to read its documents.'
  const text = `${subject}

You have been invited to join ${siteName} on Seed Hypermedia. ${roleLine}

Open this link to create your account:
${link}

The link is for this email address and works once. If you weren't expecting it, you can ignore this email.

Seed Hypermedia`

  const mjmlMarkup = renderToMjml(
    <Mjml lang="en" {...MJML_ROOT_ATTRIBUTES}>
      <MjmlHead>
        <MjmlRaw>
          <meta name="color-scheme" content="light only" />
          <meta name="supported-color-schemes" content="light only" />
        </MjmlRaw>
        <MjmlTitle>{subject}</MjmlTitle>
        <MjmlPreview>Create your account on {siteName}</MjmlPreview>
      </MjmlHead>
      <MjmlBody width={500} backgroundColor={EMAIL_PALETTE.bodyBackground}>
        <MjmlSection padding="40px 0 20px">
          <MjmlColumn>
            {logoUrl ? (
              <MjmlImage src={logoUrl} alt="Seed Hypermedia" width="40px" height="40px" padding="0" align="center" />
            ) : null}
            <MjmlText fontSize="18px" fontWeight="bold" color={EMAIL_PALETTE.brand} padding="10px 0 0" align="center">
              Seed Hypermedia
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>

        <MjmlSection backgroundColor={EMAIL_PALETTE.surface} borderRadius="8px" padding="32px 24px">
          <MjmlColumn>
            <MjmlText fontSize="24px" fontWeight="bold" color={EMAIL_PALETTE.text} padding="0 0 16px">
              <h1 style={{margin: 0, fontSize: '24px'}}>You're invited to {siteName}</h1>
            </MjmlText>
            <MjmlText fontSize="14px" color={EMAIL_PALETTE.text} lineHeight="1.5" padding="0 0 24px">
              You have been invited to join {siteName} on Seed Hypermedia. {roleLine}
            </MjmlText>
            <MjmlText fontSize="14px" padding="0 0 24px" align="center">
              <a
                href={link}
                style={{
                  display: 'inline-block',
                  backgroundColor: EMAIL_PALETTE.brand,
                  color: EMAIL_PALETTE.surface,
                  padding: '12px 20px',
                  borderRadius: '6px',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Create your account
              </a>
            </MjmlText>
            <MjmlText fontSize="14px" color={EMAIL_PALETTE.muted} lineHeight="1.5" padding="0 0 16px">
              Open your invitation instead:{' '}
              <a href={link} style={{color: EMAIL_PALETTE.brand, textDecoration: 'underline'}}>
                Open your invitation
              </a>
            </MjmlText>
            <MjmlText fontSize="14px" color={EMAIL_PALETTE.muted} lineHeight="1.5" padding="0">
              The link is for this email address and works once. If you weren't expecting it, you can ignore this email.
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>

        <MjmlSection padding="24px 0">
          <MjmlColumn>
            <MjmlText fontSize="12px" color={EMAIL_PALETTE.muted} align="center">
              Seed Hypermedia
            </MjmlText>
          </MjmlColumn>
        </MjmlSection>
      </MjmlBody>
    </Mjml>,
  )

  const {html} = mjml2html(mjmlMarkup)
  return {subject, text, html: html.replace('role="article"', 'role="main"')}
}

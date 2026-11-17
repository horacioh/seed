import {MjmlColumn, MjmlSection, MjmlText} from '@faire/mjml-react'
import {EMAIL_PALETTE} from '../email-palette'

interface NotifSettingsProps {
  url: string
}

export function NotifSettings({url}: NotifSettingsProps) {
  return (
    <MjmlSection>
      <MjmlColumn>
        <MjmlText align="center" fontSize="14px" color={EMAIL_PALETTE.text}>
          Subscribed by mistake?{' '}
          <a href={url} style={{color: EMAIL_PALETTE.brand, textDecoration: 'underline'}}>
            Unsubscribe and manage notifications
          </a>
        </MjmlText>
      </MjmlColumn>
    </MjmlSection>
  )
}

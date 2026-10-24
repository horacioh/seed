import {Badge as SeedBadge} from '@shm/ui/components/badge'
import {Button as SeedButton} from '@shm/ui/button'
import {SeedHeading} from '@shm/ui/heading'
import {Separator as SeedSeparator} from '@shm/ui/separator'
import {Text as SeedText} from '@shm/ui/text'

const choices = (values: string[]) => values.map((value) => ({label: value, value}))

/** Puck definitions for Seed UI primitives. */
export const primitiveComponents = {
  Button: {
    label: 'Button',
    fields: {
      label: {type: 'text', label: 'Label'},
      variant: {type: 'select', label: 'Variant', options: choices(['default', 'outline', 'secondary', 'ghost'])},
      size: {type: 'select', label: 'Size', options: choices(['sm', 'default', 'lg'])},
    },
    defaultProps: {label: 'Button', variant: 'default', size: 'default'},
    render: ({label, ...props}: any) => <SeedButton {...props}>{label}</SeedButton>,
  },
  Badge: {
    label: 'Badge',
    fields: {label: {type: 'text', label: 'Label'}},
    defaultProps: {label: 'Badge'},
    render: ({label}: any) => <SeedBadge>{label}</SeedBadge>,
  },
  Text: {
    label: 'Text',
    fields: {text: {type: 'textarea', label: 'Text'}},
    defaultProps: {text: 'Text'},
    render: ({text}: any) => <SeedText>{text}</SeedText>,
  },
  Heading: {
    label: 'Heading',
    fields: {
      text: {type: 'text', label: 'Text'},
      level: {type: 'select', label: 'Level', options: choices(['1', '2', '3'])},
    },
    defaultProps: {text: 'Heading', level: 2},
    render: ({text, level}: any) => <SeedHeading level={Number(level) as 1 | 2 | 3}>{text}</SeedHeading>,
  },
  Separator: {
    label: 'Separator',
    fields: {
      vertical: {
        type: 'radio',
        label: 'Vertical',
        options: [
          {label: 'Yes', value: true},
          {label: 'No', value: false},
        ],
      },
    },
    defaultProps: {vertical: false},
    render: ({vertical}: any) => <SeedSeparator vertical={vertical} />,
  },
}

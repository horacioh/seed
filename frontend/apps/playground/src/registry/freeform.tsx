/** Puck definitions for lightweight freeform canvas components. */
export const freeformComponents = {
  StickyNote: {
    label: 'Sticky note',
    fields: {
      text: {type: 'textarea', label: 'Note'},
      color: {
        type: 'select',
        label: 'Color',
        options: [
          {label: 'Butter', value: 'butter'},
          {label: 'Mint', value: 'mint'},
          {label: 'Sky', value: 'sky'},
          {label: 'Lilac', value: 'lilac'},
        ],
      },
    },
    defaultProps: {text: 'Your note', color: 'butter'},
    render: ({text = 'Your note', color = 'butter'}: {text?: string; color?: string}) => {
      const colors: Record<string, string> = {
        butter: 'bg-amber-100 text-amber-950',
        mint: 'bg-emerald-100 text-emerald-950',
        sky: 'bg-sky-100 text-sky-950',
        lilac: 'bg-violet-100 text-violet-950',
      }
      return (
        <div className={`m-4 min-h-32 rounded-md p-4 whitespace-pre-wrap shadow-sm ${colors[color] ?? colors.butter}`}>
          {text}
        </div>
      )
    },
  },
  PlaceholderBox: {
    label: 'Placeholder box',
    fields: {
      label: {type: 'text', label: 'Label'},
      height: {type: 'number', label: 'Height', min: 64, max: 1200},
    },
    defaultProps: {label: 'Placeholder', height: 240},
    render: ({label = 'Placeholder', height = 240}: {label?: string; height?: number}) => (
      <div
        className="bg-muted/30 text-muted-foreground m-4 flex items-center justify-center rounded-md border border-dashed text-sm"
        style={{height}}
      >
        {label}
      </div>
    ),
  },
}

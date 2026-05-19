'use client'

import dynamic from 'next/dynamic'
import { useTheme } from 'next-themes'
import '@uiw/react-md-editor/markdown-editor.css'

const MDEditor = dynamic(() => import('@uiw/react-md-editor'), {
  ssr: false,
  loading: () => (
    <div className="h-[280px] rounded-md border border-input bg-muted/40 animate-pulse" />
  ),
})

export function MarkdownEditor({
  value,
  onChange,
  height = 320,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  height?: number
  placeholder?: string
}) {
  const { resolvedTheme } = useTheme()
  return (
    <div data-color-mode={resolvedTheme === 'dark' ? 'dark' : 'light'}>
      <MDEditor
        value={value}
        onChange={(v) => onChange(v ?? '')}
        height={height}
        preview="edit"
        textareaProps={{ placeholder }}
      />
    </div>
  )
}

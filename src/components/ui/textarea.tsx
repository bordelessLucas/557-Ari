import { type TextareaHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean
}

function Textarea({ className, error, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        'flex min-h-24 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition-colors',
        'placeholder:text-muted-foreground',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
        'disabled:cursor-not-allowed disabled:opacity-50',
        error ? 'border-red-500 focus-visible:ring-red-500' : 'border-input',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }

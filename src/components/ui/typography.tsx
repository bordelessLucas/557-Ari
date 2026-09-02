import { createElement, type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

const headingStyles = {
  1: 'text-3xl font-semibold tracking-tight text-foreground sm:text-4xl sm:leading-tight',
  2: 'text-2xl font-semibold tracking-tight text-foreground',
  3: 'text-lg font-semibold tracking-tight text-foreground',
  4: 'text-base font-medium text-foreground',
} as const

function Heading({
  className,
  level = 1,
  ...props
}: HTMLAttributes<HTMLHeadingElement> & { level?: 1 | 2 | 3 | 4 }) {
  return createElement(
    `h${level}`,
    { className: cn(headingStyles[level], className), ...props },
  )
}

function Text({
  className,
  variant = 'body',
  ...props
}: HTMLAttributes<HTMLParagraphElement> & {
  variant?: 'body' | 'muted' | 'small' | 'lead'
}) {
  const styles = {
    body: 'text-[15px] leading-relaxed text-foreground',
    muted: 'text-sm leading-relaxed text-muted-foreground',
    small: 'text-xs leading-normal text-muted-foreground',
    lead: 'text-base leading-relaxed text-muted-foreground sm:text-[17px]',
  } as const

  return <p className={cn(styles[variant], className)} {...props} />
}

export { Heading, Text }

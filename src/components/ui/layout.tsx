import { type HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

function Container({
  className,
  size = 'default',
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  size?: 'sm' | 'default' | 'lg' | 'full'
}) {
  const sizes = {
    sm: 'max-w-3xl',
    default: 'max-w-6xl',
    lg: 'max-w-7xl',
    full: 'max-w-full',
  } as const

  return (
    <div
      className={cn(
        'mx-auto w-full px-4 sm:px-6 lg:px-8',
        'pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]',
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

function PageHeader({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('border-b border-border bg-background py-4 sm:py-6', className)}
      {...props}
    />
  )
}

function PageContent({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return <main className={cn('py-6', className)} {...props} />
}

/** Shell centralizado para telas de autenticação */
function AuthShell({
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'flex min-h-screen items-center justify-center bg-muted px-4 py-10',
        'pt-[max(2.5rem,env(safe-area-inset-top))] pb-[max(2.5rem,env(safe-area-inset-bottom))]',
        className,
      )}
      {...props}
    />
  )
}

export { Container, PageHeader, PageContent, AuthShell }

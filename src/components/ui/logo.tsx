import { cn } from '@/lib/utils'

export interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
}

const sizeClasses = {
  sm: 'h-8',
  md: 'h-12',
  lg: 'h-16',
  xl: 'h-24 sm:h-28',
} as const

function Logo({ className, size = 'md', alt = 'Agência da Notícia' }: LogoProps) {
  return (
    <img
      src="/logo.png"
      alt={alt}
      className={cn('w-auto object-contain', sizeClasses[size], className)}
    />
  )
}

export { Logo }

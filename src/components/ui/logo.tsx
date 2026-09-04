import { cn } from '@/lib/utils'

export interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  alt?: string
}

const sizeClasses = {
  sm: 'h-11 w-11',
  md: 'h-14 w-14',
  lg: 'h-20 w-20',
  xl: 'h-36 w-36 sm:h-40 sm:w-40',
} as const

/** Cache-bust para forçar reload após troca do arquivo em /public */
const LOGO_SRC = '/logo.png?v=portal-an-5'

function Logo({ className, size = 'md', alt = 'Agência da Notícia' }: LogoProps) {
  return (
    <img
      src={LOGO_SRC}
      alt={alt}
      className={cn(
        'shrink-0 object-contain',
        sizeClasses[size],
        className,
      )}
    />
  )
}

export { Logo }

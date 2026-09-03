import { Eye, EyeOff } from 'lucide-react'
import {
  forwardRef,
  useId,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string
  error?: boolean
  errorMessage?: string
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  hint?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = 'text',
      label,
      error,
      errorMessage,
      leftIcon,
      rightIcon,
      hint,
      id,
      disabled,
      ...props
    },
    ref,
  ) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const messageId = `${inputId}-message`
    const [showPassword, setShowPassword] = useState(false)

    const isPassword = type === 'password'
    const resolvedType = isPassword && showPassword ? 'text' : type
    const hasError = Boolean(error || errorMessage)

    return (
      <div className="w-full space-y-2">
        {label && (
          <Label htmlFor={inputId} className={disabled ? 'opacity-70' : undefined}>
            {label}
          </Label>
        )}

        <div className="relative">
          {leftIcon && (
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={resolvedType}
            disabled={disabled}
            aria-invalid={hasError || undefined}
            aria-describedby={errorMessage || hint ? messageId : undefined}
            className={cn(
              'flex h-10 w-full rounded-lg border bg-background px-3 py-2 text-sm text-foreground transition-colors',
              'placeholder:text-muted-foreground',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
              'disabled:cursor-not-allowed disabled:opacity-50',
              hasError ? 'border-red-500 focus-visible:ring-red-500' : 'border-input',
              leftIcon && 'pl-10',
              (isPassword || rightIcon) && 'pr-10',
              className,
            )}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              tabIndex={-1}
              disabled={disabled}
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
              onClick={() => setShowPassword((current) => !current)}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
            >
              {showPassword ? (
                <EyeOff className="size-4" strokeWidth={1.75} />
              ) : (
                <Eye className="size-4" strokeWidth={1.75} />
              )}
            </button>
          ) : (
            rightIcon && (
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
                {rightIcon}
              </span>
            )
          )}
        </div>

        {errorMessage ? (
          <p id={messageId} className="text-xs text-red-600" role="alert">
            {errorMessage}
          </p>
        ) : hint ? (
          <p id={messageId} className="text-xs text-muted-foreground">
            {hint}
          </p>
        ) : null}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }

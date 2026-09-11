import { Check, Link2, Share2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { cn } from '@/lib/utils'

interface ShareActionsProps {
  title: string
  className?: string
}

export default function ShareActions({ title, className }: ShareActionsProps) {
  const [copied, setCopied] = useState(false)
  const [pageUrl, setPageUrl] = useState('')

  useEffect(() => {
    setPageUrl(window.location.href)
  }, [])

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // ignore
    }
  }

  function shareNative() {
    if (navigator.share) {
      void navigator.share({
        title,
        url: window.location.href,
      })
      return
    }
    void copyLink()
  }

  const encoded = encodeURIComponent(pageUrl || '')
  const encodedTitle = encodeURIComponent(title)

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Compartilhar
      </span>
      <Button type="button" variant="outline" size="sm" onClick={shareNative}>
        <Share2 className="size-3.5" />
        Enviar
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => void copyLink()}
      >
        {copied ? (
          <Check className="size-3.5" />
        ) : (
          <Link2 className="size-3.5" />
        )}
        {copied ? 'Copiado' : 'Copiar link'}
      </Button>
      <a
        href={`https://wa.me/?text=${encodedTitle}%20${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-9 items-center rounded-lg border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted"
      >
        WhatsApp
      </a>
      <Link
        to={`/busca?q=${encodedTitle}`}
        className="hidden text-xs text-muted-foreground hover:underline sm:inline"
      >
        Buscar relacionadas
      </Link>
    </div>
  )
}

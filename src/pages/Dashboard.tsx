import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import { Container } from '@/components/ui'

interface DashboardProps {
  user: User
}

export default function Dashboard({ user }: DashboardProps) {
  return (
    <AppLayout user={user}>
      <Container size="lg">
        <div className="rounded-xl border border-dashed border-border bg-background/60 px-6 py-16 text-center">
          <p className="text-sm text-muted-foreground">
            Conteúdo do portal em breve. Use o menu acima para navegar.
          </p>
        </div>
      </Container>
    </AppLayout>
  )
}

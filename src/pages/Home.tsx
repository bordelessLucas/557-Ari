import { useEffect, useState } from 'react'
import { type User } from 'firebase/auth'
import AppLayout from '@/components/layout/AppLayout'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Container,
  Heading,
  Text,
} from '@/components/ui'
import { getFirstName, getUserProfile } from '@/services/userService'

interface HomeProps {
  user: User
}

const featuredSkeleton = [
  { id: 1, category: 'Política', title: 'Destaque principal da edição' },
  { id: 2, category: 'Economia', title: 'Segunda manchete em destaque' },
  { id: 3, category: 'Esporte', title: 'Terceira matéria do feed' },
]

export default function Home({ user }: HomeProps) {
  const [userName, setUserName] = useState(
    getFirstName(user.displayName || user.email || 'Leitor'),
  )

  useEffect(() => {
    getUserProfile(user.uid).then((profile) => {
      if (profile?.name) {
        setUserName(getFirstName(profile.name))
      }
    })
  }, [user.uid])

  return (
    <AppLayout user={user}>
      <Container size="lg" className="space-y-6">
        <div>
          <Heading level={2}>Olá, {userName}</Heading>
          <Text variant="muted" className="mt-1">
            Acompanhe as principais notícias. O feed será alimentado nas
            próximas etapas.
          </Text>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <Card className="overflow-hidden lg:col-span-7">
            <div className="aspect-16/10 bg-linear-to-br from-navy-700 to-red-800" />
            <CardHeader>
              <Badge variant="default">Destaque</Badge>
              <CardTitle className="mt-2 text-xl">
                Espaço reservado para a manchete principal
              </CardTitle>
              <CardDescription>
                Estrutura visual do destaque editorial. Conteúdo real chegará
                após a publicação das matérias.
              </CardDescription>
            </CardHeader>
          </Card>

          <div className="flex flex-col gap-4 lg:col-span-5">
            {featuredSkeleton.map((item) => (
              <Card key={item.id} className="flex gap-4 p-4">
                <div className="size-20 shrink-0 rounded-lg bg-muted" />
                <div className="min-w-0 flex-1">
                  <Badge variant="default" className="mb-2">
                    {item.category}
                  </Badge>
                  <p className="text-sm font-semibold leading-snug text-foreground">
                    {item.title}
                  </p>
                  <Text variant="small" className="mt-1">
                    Resumo visual — placeholder
                  </Text>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Últimas notícias</CardTitle>
            <CardDescription>
              Lista estrutural do feed. Sem dados reais nesta etapa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="flex items-center gap-4 border-b border-border pb-4 last:border-0 last:pb-0"
              >
                <div className="h-16 w-24 shrink-0 rounded-md bg-muted" />
                <div className="min-w-0 flex-1 space-y-2">
                  <div className="h-3 w-20 rounded bg-muted" />
                  <div className="h-4 w-3/4 rounded bg-muted" />
                  <div className="h-3 w-1/2 rounded bg-muted" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </Container>
    </AppLayout>
  )
}

export type AdminPageId =
  | 'dashboard'
  | 'sources'
  | 'news'
  | 'review'
  | 'publications'
  | 'admins'
  | 'settings'

export interface AdminNavItem {
  id: AdminPageId
  label: string
  description: string
}

export const adminNavItems: AdminNavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    description: 'Visão geral da operação',
  },
  {
    id: 'sources',
    label: 'Fontes ativas',
    description: 'Sites e feeds monitorados',
  },
  {
    id: 'news',
    label: 'Notícias coletadas',
    description: 'Conteúdo capturado das fontes',
  },
  {
    id: 'review',
    label: 'Aguardando revisão',
    description: 'Central editorial',
  },
  {
    id: 'publications',
    label: 'Publicações',
    description: 'Matérias enviadas ao portal',
  },
  {
    id: 'admins',
    label: 'Administradores',
    description: 'Permissões e cadastros',
  },
  {
    id: 'settings',
    label: 'Configurações',
    description: 'Preferências do sistema',
  },
]

export function getAdminPageTitle(page: AdminPageId): string {
  return adminNavItems.find((item) => item.id === page)?.label ?? 'Admin'
}

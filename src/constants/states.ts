export type PortalState = 'mato-grosso' | 'palmas' | 'sao-paulo'

export interface PortalStateOption {
  id: PortalState
  label: string
}

export const portalStates: PortalStateOption[] = [
  { id: 'mato-grosso', label: 'Mato Grosso' },
  { id: 'palmas', label: 'Palmas' },
  { id: 'sao-paulo', label: 'São Paulo' },
]

export const defaultPortalState: PortalState = 'mato-grosso'

export function getPortalStateLabel(id: PortalState): string {
  return portalStates.find((state) => state.id === id)?.label ?? id
}

type Listener = () => void

const listeners = new Set<Listener>()

/** apiClient'ın axios interceptor'ı (React ağacı dışında, hook kullanamaz)
 * ile UpgradeModalProvider (React ağacı içinde) arasındaki köprü. */
export function openUpgradeModal() {
  listeners.forEach((listener) => listener())
}

export function subscribeUpgradeModal(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

type UnauthorizedListener = () => void

let listener: UnauthorizedListener | null = null

/** AuthProvider подписывается, чтобы редиректить на /login при 401. */
export function onUnauthorized(fn: UnauthorizedListener): void {
  listener = fn
}

export function fireUnauthorized(): void {
  listener?.()
}

import type {
  AnalyticsSummary,
  Client,
  ClientDetailed,
  DashboardToday,
  LeadSource,
  LoginResponse,
  Master,
  MasterDetailed,
  PagedResult,
  Payment,
  PaymentMethod,
  RequestStatus,
  ServiceRequest,
  SourceAnalytics,
  UpdateRequestDto,
} from './types'
import { fireUnauthorized } from './authEvents'

export const API_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL ?? '')

const TOKEN_KEY = 'crm.auth'

export interface StoredAuth {
  token: string
  expiresAt: string
  username: string
}

export function loadAuth(): StoredAuth | null {
  try {
    const raw = localStorage.getItem(TOKEN_KEY)
    if (!raw) return null
    const auth = JSON.parse(raw) as StoredAuth
    if (!auth.token || !auth.expiresAt) return null
    if (new Date(auth.expiresAt).getTime() <= Date.now()) return null
    return auth
  } catch {
    return null
  }
}

export function saveAuth(res: LoginResponse): void {
  localStorage.setItem(
    TOKEN_KEY,
    JSON.stringify({ token: res.token, expiresAt: res.expiresAt, username: res.username }),
  )
}

export function clearAuth(): void {
  localStorage.removeItem(TOKEN_KEY)
}

export class ApiError extends Error {
  status: number
  fieldErrors: Record<string, string>

  constructor(status: number, message: string, fieldErrors: Record<string, string> = {}) {
    super(message)
    this.status = status
    this.fieldErrors = fieldErrors
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
}

async function request<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const auth = loadAuth()
  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: opts.method ?? 'GET',
      headers: {
        ...(opts.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
      },
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
    })
  } catch {
    throw new ApiError(0, 'Нет соединения с сервером. Проверьте, что бэкенд запущен.')
  }

  if (response.status === 204) return undefined as T

  if (!response.ok) {
    let payload: unknown = null
    try {
      payload = await response.json()
    } catch {
      /* тело не JSON */
    }
    const p = payload as Record<string, unknown> | null

    // Формат Б — ошибки валидации FluentValidation
    if (p && typeof p.errors === 'object' && p.errors !== null) {
      const fieldErrors: Record<string, string> = {}
      for (const [field, messages] of Object.entries(p.errors as Record<string, unknown>)) {
        if (Array.isArray(messages) && messages.length > 0) {
          fieldErrors[field] = String(messages[0])
        }
      }
      const first = Object.values(fieldErrors)[0]
      throw new ApiError(response.status, first ?? 'Проверьте правильность заполнения полей.', fieldErrors)
    }

    // Сообщение из ответа бэкенда { statusCode, message }
    const backendMessage = p && typeof p.message === 'string' ? p.message : null

    if (response.status === 401) {
      // Если это не сам логин — сбрасываем авторизацию
      if (!path.includes('/api/auth/login')) {
        clearAuth()
        fireUnauthorized()
      }
      throw new ApiError(
        401,
        backendMessage ?? (path.includes('/api/auth/login') ? 'Неверный логин или пароль' : 'Сессия истекла, войдите заново.'),
      )
    }

    // Формат А — бизнес-ошибки { statusCode, message }
    const message = backendMessage ?? `Ошибка запроса (${response.status})`
    throw new ApiError(response.status, message)
  }

  return (await response.json()) as T
}

/* ---------- auth ---------- */

export function login(username: string, password: string): Promise<LoginResponse> {
  return request<LoginResponse>('/api/auth/login', { method: 'POST', body: { username, password } })
}

/* ---------- requests ---------- */

export interface RequestFilters {
  status?: RequestStatus
  masterId?: number
  dateTime?: string
  page: number
  pageSize: number
}

export async function getRequests(filters: RequestFilters): Promise<PagedResult<ServiceRequest>> {
  const q = new URLSearchParams()
  if (filters.status) q.set('status', filters.status)
  if (filters.masterId) q.set('masterId', String(filters.masterId))
  if (filters.dateTime) q.set('dateTime', filters.dateTime)
  q.set('page', String(filters.page))
  q.set('pageSize', String(filters.pageSize))
  return request<PagedResult<ServiceRequest>>(`/api/requests?${q}`)
}

export function getRequest(id: number): Promise<ServiceRequest> {
  return request<ServiceRequest>(`/api/requests/${id}`)
}

/** Создание заявки → статус New. */
export function createRequest(dto: {
  clientId: number
  city: string
  address: string
  leadSourceId: number
  problemDescription: string
  equipmentType: string
  scheduledAt?: string
}): Promise<ServiceRequest> {
  return request<ServiceRequest>('/api/requests', { method: 'POST', body: dto })
}

export function updateRequestStatus(id: number, status: RequestStatus): Promise<ServiceRequest> {
  return request<ServiceRequest>(`/api/requests/${id}/status`, { method: 'PATCH', body: { status } })
}

export function completeRequest(
  id: number,
  dto: { totalPrice: number; directExpenses: number; masterPayout?: number | null },
): Promise<ServiceRequest> {
  return request<ServiceRequest>(`/api/requests/${id}/complete`, { method: 'PUT', body: dto })
}

/** Полное обновление заявки (используется для назначения мастера). */
export function updateRequest(id: number, dto: UpdateRequestDto): Promise<ServiceRequest> {
  return request<ServiceRequest>(`/api/requests/${id}`, { method: 'PUT', body: dto })
}

export function deleteRequest(id: number): Promise<void> {
  return request<void>(`/api/requests/${id}`, { method: 'DELETE' })
}

/* ---------- payments ---------- */

export function getPayment(requestId: number): Promise<Payment> {
  return request<Payment>(`/api/requests/${requestId}/payments`)
}

export function createPayment(
  requestId: number,
  dto: { amount: number; paymentMethod: PaymentMethod },
): Promise<Payment> {
  return request<Payment>(`/api/requests/${requestId}/payments`, { method: 'POST', body: dto })
}

/* ---------- masters ---------- */

export async function getActiveMasters(): Promise<Master[]> {
  // берём с запасом pageSize=100 и фильтруем активных
  const page = await request<PagedResult<Master>>(
    `/api/masters?isActive=true&page=1&pageSize=100`,
  )
  return page.items
}

/* ---------- masters (CRUD) ---------- */

export interface MasterFilters {
  isActive?: boolean
  search?: string
  page: number
  pageSize: number
}

export async function getMasters(filters: MasterFilters): Promise<PagedResult<Master>> {
  const q = new URLSearchParams()
  if (filters.isActive !== undefined) q.set('isActive', String(filters.isActive))
  if (filters.search) q.set('search', filters.search)
  q.set('page', String(filters.page))
  q.set('pageSize', String(filters.pageSize))
  return request<PagedResult<Master>>(`/api/masters?${q}`)
}

export function getMaster(id: number): Promise<MasterDetailed> {
  return request<MasterDetailed>(`/api/masters/${id}`)
}

export function createMaster(dto: {
  fullname: string
  phoneNumber: string
  telegram: string
  city: string
  specialization: string[]
  commissionPercent: number
  isActive: boolean
}): Promise<Master> {
  return request<Master>('/api/masters', { method: 'POST', body: dto })
}

export function updateMaster(
  id: number,
  dto: {
    fullname: string
    phoneNumber: string
    telegram: string
    city: string
    specialization: string[]
    commissionPercent: number
    isActive: boolean
  },
): Promise<Master> {
  return request<Master>(`/api/masters/${id}`, { method: 'PUT', body: dto })
}

export function deleteMaster(id: number): Promise<void> {
  return request<void>(`/api/masters/${id}`, { method: 'DELETE' })
}

/* ---------- clients ---------- */

export interface ClientFilters {
  search?: string
  page: number
  pageSize: number
}

export async function getClients(filters: ClientFilters): Promise<PagedResult<Client>> {
  const q = new URLSearchParams()
  if (filters.search) q.set('search', filters.search)
  q.set('page', String(filters.page))
  q.set('pageSize', String(filters.pageSize))
  return request<PagedResult<Client>>(`/api/clients?${q}`)
}

export function getClient(id: number): Promise<ClientDetailed> {
  return request<ClientDetailed>(`/api/clients/${id}`)
}

/** Все клиенты одной страницей — для выпадающих списков в формах. */
export async function getAllClients(): Promise<Client[]> {
  const page = await request<PagedResult<Client>>(`/api/clients?page=1&pageSize=100`)
  return page.items
}

export function createClient(dto: { fullName: string; phoneNumber: string; city: string }): Promise<Client> {
  return request<Client>('/api/clients', { method: 'POST', body: dto })
}

export function updateClient(
  id: number,
  dto: { fullName: string; phoneNumber: string; city: string },
): Promise<Client> {
  return request<Client>(`/api/clients/${id}`, { method: 'PUT', body: dto })
}

export function deleteClient(id: number): Promise<void> {
  return request<void>(`/api/clients/${id}`, { method: 'DELETE' })
}

/* ---------- lead sources ---------- */

export async function getLeadSources(page = 1, pageSize = 50): Promise<PagedResult<LeadSource>> {
  return request<PagedResult<LeadSource>>(`/api/lead-sources?page=${page}&pageSize=${pageSize}`)
}

/** Все источники одной страницей — для выпадающих списков. */
export async function getAllLeadSources(): Promise<LeadSource[]> {
  return (await getLeadSources(1, 100)).items
}

export function getLeadSource(id: number): Promise<LeadSource> {
  return request<LeadSource>(`/api/lead-sources/${id}`)
}

export function createLeadSource(dto: {
  name: string
  websiteUrl: string
  targetWeeklyBudget: number
}): Promise<LeadSource> {
  return request<LeadSource>('/api/lead-sources', { method: 'POST', body: dto })
}

export function updateLeadSource(
  id: number,
  dto: { name: string; websiteUrl: string; targetWeeklyBudget: number; isActive: boolean },
): Promise<LeadSource> {
  return request<LeadSource>(`/api/lead-sources/${id}`, { method: 'PUT', body: dto })
}

export function deleteLeadSource(id: number): Promise<void> {
  return request<void>(`/api/lead-sources/${id}`, { method: 'DELETE' })
}

export function createAdExpense(
  leadSourceId: number,
  dto: { amount: number; expenseStartDate: string },
): Promise<unknown> {
  return request(`/api/lead-sources/${leadSourceId}/expenses`, { method: 'POST', body: dto })
}

export function deleteAdExpense(expenseId: number): Promise<void> {
  return request<void>(`/api/lead-sources/expenses/${expenseId}`, { method: 'DELETE' })
}

/* ---------- analytics ---------- */

export function getDashboardToday(): Promise<DashboardToday> {
  return request<DashboardToday>('/api/analytics/dashboard/today')
}

export function getAnalyticsSummary(fromDate?: string, toDate?: string): Promise<AnalyticsSummary> {
  const q = new URLSearchParams()
  if (fromDate) q.set('fromDate', fromDate)
  if (toDate) q.set('toDate', toDate)
  return request<AnalyticsSummary>(`/api/analytics/summary?${q}`)
}

export function getSourceAnalytics(fromDate?: string, toDate?: string): Promise<SourceAnalytics[]> {
  const q = new URLSearchParams()
  if (fromDate) q.set('fromDate', fromDate)
  if (toDate) q.set('toDate', toDate)
  return request<SourceAnalytics[]>(`/api/analytics/sources?${q}`)
}

export type RequestStatus = 'New' | 'Assigned' | 'InProgress' | 'Completed' | 'Cancelled'

export type PaymentMethod = 'Cash' | 'Online' | 'Terminal'

export interface LoginResponse {
  token: string
  expiresAt: string
  role: string
  username: string
}

export interface PagedResult<T> {
  items: T[]
  page: number
  pageSize: number
  totalCount: number
}

export interface ServiceRequest {
  id: number
  city: string
  address: string
  equipmentType: string
  problemDescription: string
  scheduledAt?: string
  status: RequestStatus
  totalPrice?: number
  directExpenses?: number
  masterPayout?: number
  clientId: number
  clientFullName: string
  clientPhoneNumber: string
  masterId?: number
  masterFullName?: string
  leadSourceId: number
  leadSourceName?: string
  createdAt: string
}

export interface Master {
  id: number
  fullname: string
  phoneNumber: string
  telegram?: string
  city?: string
  specialization: string[]
  commissionPercent: number
  isActive: boolean
}

export interface MasterDetailed extends Master {
  requests: ServiceRequest[]
}

export interface Client {
  id: number
  fullName: string
  phoneNumber: string
  city?: string
  createdAt: string
}

export interface ClientDetailed extends Client {
  requests: ServiceRequest[]
}

export interface AdExpense {
  id: number
  amount: number
  expenseStartDate: string
  leadSourceId: number
  leadSourceName?: string
}

export interface LeadSource {
  id: number
  name: string
  websiteUrl?: string
  targetWeeklyBudget: number
  isActive: boolean
  createdAt: string
  adExpenses?: AdExpense[]
}

export interface DashboardToday {
  unassignedTodayCount: number
  scheduledTodayCount: number
  inProgressNow: number
  completedTodayCount: number
  revenueToday: number
  expensesToday: number
  masterPayoutsToday: number
  ownerProfitToday: number
}

export interface AnalyticsSummary {
  totalRequests: number
  completedCount: number
  conversionRate: number
  averageCheck: number
  revenue: number
  directExpenses: number
  masterPayouts: number
  adExpenses: number
  ownerProfit: number
}

/** ROI приходит с сервера уже в процентах. */
export interface SourceAnalytics {
  sourceName: string
  requestsCount: number
  totalRevenue: number
  totalAdSpent: number
  roi: number
}

export interface Payment {
  id: number
  serviceRequestId: number
  amount: number
  paymentDate: string
  paymentMethod: PaymentMethod
}

export interface UpdateRequestDto {
  clientId: number
  masterId?: number
  city: string
  address: string
  leadSourceId: number
  problemDescription: string
  equipmentType: string
  scheduledAt?: string
  status: RequestStatus
}

/**
 * Допустимые переходы машины состояний.
 * Диспетчер работает без статуса «В работе»: назначил мастера → завершил с финансами.
 */
export const ALLOWED_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  New: ['Assigned', 'Cancelled'],
  Assigned: ['InProgress', 'Completed', 'Cancelled'],
  InProgress: ['Completed', 'Cancelled'],
  Completed: [],
  Cancelled: [],
}

export const STATUS_LABELS: Record<RequestStatus, string> = {
  New: 'Новая',
  Assigned: 'Назначена',
  InProgress: 'В работе',
  Completed: 'Завершена',
  Cancelled: 'Отменена',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  Cash: 'Наличные',
  Online: 'Онлайн',
  Terminal: 'Терминал',
}

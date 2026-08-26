import { Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider, useAuth } from './lib/AuthContext'
import { ToastProvider } from './components/Toasts'
import { AppLayout } from './components/AppLayout'
import { LoginPage } from './pages/LoginPage'
import { DashboardPage } from './pages/DashboardPage'
import { RequestsPage } from './pages/RequestsPage'
import { RequestPage } from './pages/RequestPage'
import { MastersPage } from './pages/MastersPage'
import { ClientsPage } from './pages/ClientsPage'
import { LeadSourcesPage } from './pages/LeadSourcesPage'
import { AnalyticsPage } from './pages/AnalyticsPage'

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { auth } = useAuth()
  if (!auth) return <Navigate to="/login" replace />
  return <>{children}</>
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/requests" element={<RequestsPage />} />
            <Route path="/requests/:id" element={<RequestPage />} />
            <Route path="/masters" element={<MastersPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/lead-sources" element={<LeadSourcesPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/requests" replace />} />
        </Routes>
      </ToastProvider>
    </AuthProvider>
  )
}

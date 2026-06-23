import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '@/contexts/AuthContext'
import { ProtectedRoute } from '@/components/layout/ProtectedRoute'
import { Layout } from '@/components/layout/Layout'
import { LoginPage } from '@/pages/auth/LoginPage'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ElevesPage } from '@/pages/eleves/ElevesPage'
import { ElevePage } from '@/pages/eleves/ElevePage'
import { PlanningPage } from '@/pages/planning/PlanningPage'
import { MoniteursPage } from '@/pages/moniteurs/MoniteursPage'
import { VehiculesPage } from '@/pages/vehicules/VehiculesPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'
import { FacturationPage } from '@/pages/facturation/FacturationPage'
import { ExamensPage } from '@/pages/examens/ExamensPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 1000 * 60 * 5 },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            {/* Routes protégées — redirige vers /login si non connecté */}
            <Route element={<ProtectedRoute />}>
              <Route element={<Layout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/eleves" element={<ElevesPage />} />
                <Route path="/eleves/:id" element={<ElevePage />} />
                <Route path="/planning" element={<PlanningPage />} />
                <Route path="/moniteurs" element={<MoniteursPage />} />
                <Route path="/vehicules" element={<VehiculesPage />} />
                <Route path="/facturation" element={<FacturationPage />} />
                <Route path="/examens" element={<ExamensPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App

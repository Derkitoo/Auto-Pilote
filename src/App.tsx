import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
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
import { EleveLayout } from '@/components/layout/EleveLayout'
import { EleveAccueilPage } from '@/pages/eleve-space/EleveAccueilPage'
import { ElevePlanningPage } from '@/pages/eleve-space/ElevePlanningPage'
import { EleveExamensPage } from '@/pages/eleve-space/EleveExamensPage'
import { EleveFacturesPage } from '@/pages/eleve-space/EleveFacturesPage'

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
            <Route path="/" element={<RootRedirect />} />

            {/* Espace gérant / moniteur */}
            <Route element={<ProtectedRoute allowedRoles={['gerant', 'moniteur', 'secretaire']} />}>
              <Route element={<Layout />}>
                <Route path="/dashboard"   element={<DashboardPage />} />
                <Route path="/eleves"      element={<ElevesPage />} />
                <Route path="/eleves/:id"  element={<ElevePage />} />
                <Route path="/planning"    element={<PlanningPage />} />
                <Route path="/moniteurs"   element={<MoniteursPage />} />
                <Route path="/vehicules"   element={<VehiculesPage />} />
                <Route path="/facturation" element={<FacturationPage />} />
                <Route path="/examens"     element={<ExamensPage />} />
                <Route path="/settings"    element={<SettingsPage />} />
              </Route>
            </Route>

            {/* Espace élève */}
            <Route element={<ProtectedRoute allowedRoles={['eleve']} />}>
              <Route element={<EleveLayout />}>
                <Route path="/eleve/accueil"  element={<EleveAccueilPage />} />
                <Route path="/eleve/planning" element={<ElevePlanningPage />} />
                <Route path="/eleve/examens"  element={<EleveExamensPage />} />
                <Route path="/eleve/factures" element={<EleveFacturesPage />} />
              </Route>
            </Route>
          </Routes>
          <Toaster position="top-right" />
        </HashRouter>
      </AuthProvider>
    </QueryClientProvider>
  )
}

function RootRedirect() {
  const { user } = useAuth()
  if (!user) return <Navigate to="/login" replace />
  return <Navigate to={user.role === 'eleve' ? '/eleve/accueil' : '/dashboard'} replace />
}

export default App

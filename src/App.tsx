import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { Layout } from '@/components/layout/Layout'
import { DashboardPage } from '@/pages/dashboard/DashboardPage'
import { ElevesPage } from '@/pages/eleves/ElevesPage'
import { ElevePage } from '@/pages/eleves/ElevePage'
import { PlanningPage } from '@/pages/planning/PlanningPage'
import { MoniteursPage } from '@/pages/moniteurs/MoniteursPage'
import { VehiculesPage } from '@/pages/vehicules/VehiculesPage'
import { SettingsPage } from '@/pages/settings/SettingsPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/eleves" element={<ElevesPage />} />
            <Route path="/eleves/:id" element={<ElevePage />} />
            <Route path="/planning" element={<PlanningPage />} />
            <Route path="/moniteurs" element={<MoniteursPage />} />
            <Route path="/vehicules" element={<VehiculesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Routes>
        <Toaster position="top-right" />
      </HashRouter>
    </QueryClientProvider>
  )
}

export default App

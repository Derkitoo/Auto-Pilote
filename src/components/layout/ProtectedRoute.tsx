import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

type Role = 'gerant' | 'moniteur' | 'secretaire' | 'eleve'

interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles?: Role[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#2563EB] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" replace />

  // Si un rôle requis est spécifié et que l'utilisateur ne l'a pas, rediriger vers son espace
  if (allowedRoles && !allowedRoles.includes(user.role as Role)) {
    return <Navigate to={user.role === 'eleve' ? '/eleve/accueil' : '/dashboard'} replace />
  }

  return children ? <>{children}</> : <Outlet />
}

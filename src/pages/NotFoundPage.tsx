import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

export function NotFoundPage() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const home = user?.role === 'eleve' ? '/eleve/accueil' : user ? '/dashboard' : '/login'

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-[#2563EB]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <span className="text-3xl font-bold text-[#2563EB]">?</span>
        </div>
        <h1 className="text-2xl font-bold text-[#0F172A] mb-2">Page introuvable</h1>
        <p className="text-sm text-[#64748B] mb-6">
          Cette page n'existe pas ou vous n'avez pas les droits pour y accéder.
        </p>
        <button
          onClick={() => navigate(home)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#2563EB] text-white text-sm font-medium rounded-xl hover:bg-[#1D4ED8] transition-colors"
        >
          Retour à l'accueil
        </button>
      </div>
    </div>
  )
}

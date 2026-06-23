import { createContext, useContext, useState, useEffect } from 'react'

interface AuthUser {
  id: string
  email: string
  prenom: string
  nom: string
  role: 'gerant' | 'moniteur' | 'secretaire' | 'eleve'
  moniteur_id?: string
  eleve_id?: string
}

interface AuthContextType {
  user: AuthUser | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<AuthUser>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// Comptes mock — remplacés par Supabase Auth en phase 2
const MOCK_USERS: (AuthUser & { password: string })[] = [
  { id: 'user-001', email: 'gerant@ae-liberte.fr',       password: 'demo1234', prenom: 'Jean',   nom: 'Dupont',  role: 'gerant' },
  { id: 'user-002', email: 'thomas@ae-liberte.fr',       password: 'demo1234', prenom: 'Thomas', nom: 'Mercier', role: 'moniteur', moniteur_id: 'mon-001' },
  { id: 'user-003', email: 'lucas.martin@gmail.com',     password: 'demo1234', prenom: 'Lucas',  nom: 'Martin',  role: 'eleve',    eleve_id: 'elv-001' },
  { id: 'user-004', email: 'emma.leroy@outlook.fr',      password: 'demo1234', prenom: 'Emma',   nom: 'Leroy',   role: 'eleve',    eleve_id: 'elv-002' },
]

const STORAGE_KEY = 'permisflow_user'

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try { setUser(JSON.parse(stored)) } catch { localStorage.removeItem(STORAGE_KEY) }
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string): Promise<AuthUser> => {
    await new Promise(r => setTimeout(r, 500))
    const found = MOCK_USERS.find(u => u.email === email && u.password === password)
    if (!found) throw new Error('Email ou mot de passe incorrect')
    const { password: _, ...authUser } = found
    setUser(authUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser))
    return authUser
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem(STORAGE_KEY)
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider')
  return ctx
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { LogIn, Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
})
type LoginValues = z.infer<typeof loginSchema>

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async ({ email, password }: LoginValues) => {
    setError('')
    setLoading(true)
    try {
      const user = await login(email, password)
      navigate(user.role === 'eleve' ? '/eleve/accueil' : '/dashboard', { replace: true })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-[#2563EB] rounded-xl flex items-center justify-center mb-3 shadow-lg shadow-blue-200">
            <span className="text-white font-bold text-xl">P</span>
          </div>
          <h1 className="text-xl font-semibold text-[#0F172A]">PermisFlow</h1>
          <p className="text-sm text-[#64748B] mt-1">Gestion d'auto-école</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-[#E2E8F0] p-6 shadow-sm">
          <h2 className="text-base font-semibold text-[#0F172A] mb-5">Connexion</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="gerant@ae-liberte.fr"
              error={errors.email?.message}
              {...register('email')}
            />

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-sm font-medium text-[#0F172A]">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="w-full h-9 pl-3 pr-9 text-sm border border-[#E2E8F0] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-2.5 top-2 text-[#94A3B8] hover:text-[#64748B]"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-[#DC2626]">{errors.password.message}</p>}
            </div>

            {error && (
              <div className="px-3 py-2 bg-[#FEF2F2] border border-[#DC2626]/20 rounded-lg text-sm text-[#DC2626]">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              <LogIn className="w-4 h-4" />
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Comptes demo */}
          <div className="mt-5 pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#64748B] mb-2 font-medium">Comptes de démonstration :</p>
            <div className="space-y-1.5">
              {[
                { email: 'gerant@ae-liberte.fr',   role: 'Gérant',   color: '#2563EB' },
                { email: 'thomas@ae-liberte.fr',   role: 'Moniteur', color: '#16A34A' },
                { email: 'lucas.martin@gmail.com', role: 'Élève',    color: '#D97706' },
              ].map(c => (
                <div key={c.email} className="flex items-center justify-between text-xs bg-[#F8FAFC] rounded-lg px-2 py-1.5">
                  <span className="text-[#64748B]">{c.email}</span>
                  <span className="font-medium px-1.5 py-0.5 rounded-full text-white text-[10px]" style={{ backgroundColor: c.color }}>{c.role}</span>
                </div>
              ))}
              <p className="text-center text-[10px] text-[#94A3B8] pt-1">Mot de passe : <strong>demo1234</strong></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

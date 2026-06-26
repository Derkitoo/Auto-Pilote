import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Building2, MapPin, Phone, User, Palette, Smartphone,
  Bell, Shield, ChevronRight, Check, Download, Wifi, WifiOff,
  AlertTriangle, RefreshCw, Info, Lock,
} from 'lucide-react'
import { useAutoEcole, useUpdateAutoEcole } from '@/hooks/useAutoEcole'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import toast from 'react-hot-toast'

// ─── Types ───────────────────────────────────────────────────────────────────

type Section = 'etablissement' | 'compte' | 'apparence' | 'notifications' | 'application' | 'danger'

const NAV_ITEMS: { id: Section; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'etablissement', label: 'Établissement',  icon: <Building2 className="w-4 h-4" />,  desc: 'Infos légales et coordonnées' },
  { id: 'compte',        label: 'Mon compte',     icon: <User className="w-4 h-4" />,        desc: 'Profil et sécurité' },
  { id: 'apparence',     label: 'Apparence',      icon: <Palette className="w-4 h-4" />,     desc: 'Couleurs et thème' },
  { id: 'notifications', label: 'Notifications',  icon: <Bell className="w-4 h-4" />,        desc: 'Préférences d\'alertes' },
  { id: 'application',   label: 'Application',    icon: <Smartphone className="w-4 h-4" />,  desc: 'PWA, version, hors-ligne' },
  { id: 'danger',        label: 'Zone danger',    icon: <Shield className="w-4 h-4" />,      desc: 'Données et réinitialisation' },
]

const COULEURS_PRESET = [
  { value: '#2563EB', label: 'Bleu' },
  { value: '#7C3AED', label: 'Violet' },
  { value: '#16A34A', label: 'Vert' },
  { value: '#D97706', label: 'Ambre' },
  { value: '#DC2626', label: 'Rouge' },
  { value: '#0891B2', label: 'Cyan' },
  { value: '#DB2777', label: 'Rose' },
  { value: '#0F172A', label: 'Ardoise' },
  { value: '#059669', label: 'Émeraude' },
  { value: '#EA580C', label: 'Orange' },
]

// ─── Schéma Établissement ────────────────────────────────────────────────────

const etablissementSchema = z.object({
  nom: z.string().min(2, 'Nom requis'),
  siret: z.string().length(14, 'SIRET = 14 chiffres'),
  adresse: z.string().min(3),
  code_postal: z.string().length(5),
  ville: z.string().min(2),
  telephone: z.string().min(10),
  email: z.string().email(),
  couleur_principale: z.string().min(4),
})
type EtablissementValues = z.infer<typeof etablissementSchema>

// ─── Composant principal ─────────────────────────────────────────────────────

export function SettingsPage() {
  const [section, setSection] = useState<Section>('etablissement')

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[#0F172A]">Paramètres</h1>
        <p className="text-sm text-[#64748B] mt-1">Gérez votre établissement, votre compte et les préférences de l'application.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-5">

        {/* ── Navigation latérale ── */}
        <nav className="md:w-56 shrink-0">
          {/* Mobile : scroll horizontal */}
          <div className="flex md:flex-col gap-1 overflow-x-auto pb-1 md:pb-0">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => setSection(item.id)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors shrink-0 md:w-full ${
                  section === item.id
                    ? 'bg-primary text-white'
                    : 'text-[#64748B] dark:text-slate-400 hover:bg-[#F1F5F9] dark:hover:bg-slate-800 hover:text-[#0F172A] dark:hover:text-slate-100'
                }`}
              >
                <span className={section === item.id ? 'text-white' : 'text-[#94A3B8]'}>{item.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{item.label}</span>
                {section !== item.id && <ChevronRight className="w-3.5 h-3.5 ml-auto hidden md:block opacity-40" />}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Contenu ── */}
        <div className="flex-1 min-w-0">
          {section === 'etablissement' && <SectionEtablissement />}
          {section === 'compte'        && <SectionCompte />}
          {section === 'apparence'     && <SectionApparence />}
          {section === 'notifications' && <SectionNotifications />}
          {section === 'application'   && <SectionApplication />}
          {section === 'danger'        && <SectionDanger />}
        </div>
      </div>
    </div>
  )
}

// ─── Section : Établissement ─────────────────────────────────────────────────

function SectionEtablissement() {
  const { data: autoEcole, isLoading } = useAutoEcole()
  const updateAutoEcole = useUpdateAutoEcole()

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EtablissementValues>({
    resolver: zodResolver(etablissementSchema),
    defaultValues: { nom: '', siret: '', adresse: '', code_postal: '', ville: '', telephone: '', email: '', couleur_principale: '#2563EB' },
  })

  useEffect(() => {
    if (autoEcole) reset({ ...autoEcole })
  }, [autoEcole, reset])

  if (isLoading) return <SectionSkeleton />

  return (
    <form onSubmit={handleSubmit(async (data) => { await updateAutoEcole.mutateAsync(data); reset(data) })} className="space-y-4">
      <SectionHeader icon={<Building2 className="w-4 h-4" />} title="Établissement" desc="Informations légales affichées sur les factures." />

      <Card>
        <CardSection title="Identité">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <Input id="nom" label="Nom de l'établissement" error={errors.nom?.message} {...register('nom')} />
            </div>
            <Input id="siret" label="SIRET" placeholder="14 chiffres" error={errors.siret?.message} {...register('siret')} />
          </div>
        </CardSection>

        <Divider />

        <CardSection title="Adresse" icon={<MapPin className="w-3.5 h-3.5" />}>
          <Input id="adresse" label="Rue" error={errors.adresse?.message} {...register('adresse')} />
          <div className="grid grid-cols-3 gap-3 mt-3">
            <Input id="code_postal" label="Code postal" error={errors.code_postal?.message} {...register('code_postal')} />
            <div className="col-span-2">
              <Input id="ville" label="Ville" error={errors.ville?.message} {...register('ville')} />
            </div>
          </div>
        </CardSection>

        <Divider />

        <CardSection title="Contact" icon={<Phone className="w-3.5 h-3.5" />}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input id="telephone" label="Téléphone" error={errors.telephone?.message} {...register('telephone')} />
            <Input id="email" label="Email" type="email" error={errors.email?.message} {...register('email')} />
          </div>
        </CardSection>
      </Card>

      {isDirty && (
        <div className="flex items-center justify-between p-4 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl">
          <p className="text-sm text-[#2563EB] font-medium">Modifications non sauvegardées</p>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => reset()}>Annuler</Button>
            <Button type="submit" size="sm" disabled={updateAutoEcole.isPending}>
              {updateAutoEcole.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </div>
      )}
    </form>
  )
}

// ─── Section : Compte ────────────────────────────────────────────────────────

function SectionCompte() {
  const { user } = useAuth()

  return (
    <div className="space-y-4">
      <SectionHeader icon={<User className="w-4 h-4" />} title="Mon compte" desc="Informations personnelles et sécurité." />

      <Card>
        <CardSection title="Profil">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-xl">
                {user?.prenom?.[0]}{user?.nom?.[0]}
              </span>
            </div>
            <div>
              <p className="text-base font-semibold text-[#0F172A]">{user?.prenom} {user?.nom}</p>
              <p className="text-sm text-[#64748B]">{user?.email}</p>
              <RoleBadge role={user?.role ?? ''} />
            </div>
          </div>
          <InfoBanner icon={<Info className="w-4 h-4 shrink-0 mt-0.5" />} text="La modification du profil sera disponible après connexion à Supabase." />
        </CardSection>

        <Divider />

        <CardSection title="Sécurité" icon={<Lock className="w-3.5 h-3.5" />}>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Mot de passe</p>
              <p className="text-xs text-[#64748B]">Dernière modification : —</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              Modifier
            </Button>
          </div>
          <div className="flex items-center justify-between py-2 border-t border-[#F1F5F9]">
            <div>
              <p className="text-sm font-medium text-[#0F172A]">Double authentification</p>
              <p className="text-xs text-[#64748B]">Disponible avec Supabase Auth</p>
            </div>
            <Toggle checked={false} disabled onChange={() => {}} />
          </div>
        </CardSection>
      </Card>
    </div>
  )
}

// ─── Section : Apparence ─────────────────────────────────────────────────────

function SectionApparence() {
  const { primaryColor, isDark, applyColor, toggleDark } = useTheme()
  const updateAutoEcole = useUpdateAutoEcole()

  const [couleur, setCouleur] = useState(primaryColor)
  const [saved, setSaved] = useState(false)

  // Live preview: apply immediately when color changes
  const handlePick = (hex: string) => {
    setCouleur(hex)
    applyColor(hex)
  }

  const handleSave = async () => {
    await updateAutoEcole.mutateAsync({ couleur_principale: couleur })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={<Palette className="w-4 h-4" />} title="Apparence" desc="Personnalisez les couleurs de votre interface." />

      <Card>
        <CardSection title="Couleur principale">
          <p className="text-xs text-[#64748B] mb-4">La sidebar, les boutons et les badges changent immédiatement.</p>

          {/* Palettes preset */}
          <div className="grid grid-cols-5 gap-2 mb-4">
            {COULEURS_PRESET.map(c => (
              <button
                key={c.value}
                type="button"
                title={c.label}
                onClick={() => handlePick(c.value)}
                className="relative aspect-square rounded-xl transition-all hover:scale-105"
                style={{ backgroundColor: c.value }}
              >
                {couleur === c.value && (
                  <Check className="absolute inset-0 m-auto w-4 h-4 text-white drop-shadow" />
                )}
              </button>
            ))}
          </div>

          {/* Couleur custom */}
          <div className="flex items-center gap-3 mb-5">
            <label className="text-xs text-[#64748B]">Personnalisée</label>
            <div className="flex items-center gap-2 border border-[#E2E8F0] rounded-lg px-3 py-1.5">
              <input
                type="color"
                value={couleur}
                onChange={e => handlePick(e.target.value)}
                className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent"
              />
              <span className="text-xs font-mono text-[#64748B] uppercase">{couleur}</span>
            </div>
          </div>

          {/* Aperçu */}
          <div className="rounded-xl border border-[#E2E8F0] overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-[#E2E8F0]">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: couleur }}>
                <span className="text-white font-bold text-xs">P</span>
              </div>
              <span className="text-sm font-semibold text-[#0F172A]">PermisFlow</span>
            </div>
            <div className="px-4 py-3 bg-[#F8FAFC] flex items-center gap-3">
              <div className="w-20 h-2 rounded-full" style={{ backgroundColor: couleur }} />
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: couleur }} />
                <div className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: couleur }} />
                <div className="w-2 h-2 rounded-full opacity-40" style={{ backgroundColor: couleur }} />
              </div>
              <span className="ml-auto text-xs font-medium text-white px-2 py-0.5 rounded-full" style={{ backgroundColor: couleur }}>
                Aperçu
              </span>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <Button onClick={handleSave} disabled={updateAutoEcole.isPending} size="sm">
              {saved ? <><Check className="w-3.5 h-3.5" /> Enregistré</> : updateAutoEcole.isPending ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </CardSection>

        <Divider />

        <CardSection title="Mode sombre">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-[#0F172A] dark:text-slate-100">Thème sombre</p>
              <p className="text-xs text-[#64748B] dark:text-slate-400">
                {isDark ? 'Actif — cliquez pour revenir au thème clair' : 'Réduit la fatigue oculaire en faible luminosité'}
              </p>
            </div>
            <Toggle checked={isDark} onChange={toggleDark} />
          </div>
        </CardSection>
      </Card>
    </div>
  )
}

// ─── Section : Notifications ─────────────────────────────────────────────────

const NOTIF_KEY = 'permisflow_notifs'

function SectionNotifications() {
  const [prefs, setPrefs] = useState(() => {
    try { return JSON.parse(localStorage.getItem(NOTIF_KEY) ?? '{}') } catch { return {} }
  })

  const toggle = (key: string) => {
    const next = { ...prefs, [key]: !prefs[key] }
    setPrefs(next)
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next))
    toast.success('Préférence enregistrée')
  }

  const items = [
    { key: 'lecon_rappel',    title: 'Rappel de leçon',          desc: 'Notification 1h avant chaque leçon',         available: true },
    { key: 'examen_rappel',   title: 'Rappel d\'examen',         desc: 'Notification la veille d\'un examen',        available: true },
    { key: 'facture_retard',  title: 'Facture en retard',        desc: 'Alerte quand une facture dépasse l\'échéance',available: true },
    { key: 'solde_faible',    title: 'Solde d\'heures faible',   desc: 'Alerte quand un élève a ≤ 2h restantes',     available: true },
    { key: 'email_recap',     title: 'Récap hebdomadaire',       desc: 'Email chaque lundi avec le planning',        available: false },
    { key: 'sms_eleve',       title: 'SMS élèves',               desc: 'Rappels automatiques par SMS (bientôt)',     available: false },
  ]

  return (
    <div className="space-y-4">
      <SectionHeader icon={<Bell className="w-4 h-4" />} title="Notifications" desc="Choisissez quand et comment vous souhaitez être alerté." />

      <Card>
        <div className="divide-y divide-[#F1F5F9]">
          {items.map(item => (
            <div key={item.key} className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className={`text-sm font-medium ${item.available ? 'text-[#0F172A]' : 'text-[#94A3B8]'}`}>{item.title}</p>
                <p className="text-xs text-[#94A3B8]">{item.desc}</p>
              </div>
              <Toggle
                checked={!!prefs[item.key]}
                disabled={!item.available}
                onChange={() => item.available && toggle(item.key)}
              />
            </div>
          ))}
        </div>
      </Card>

      <InfoBanner icon={<Info className="w-4 h-4 shrink-0 mt-0.5" />} text="Les notifications push seront actives après installation en tant qu'application (PWA) et connexion à Supabase." />
    </div>
  )
}

// ─── Section : Application ───────────────────────────────────────────────────

function SectionApplication() {
  const isInstalled = window.matchMedia('(display-mode: standalone)').matches
  const isOnline = navigator.onLine

  const handleInstall = () => {
    toast('Utilisez la bannière d\'installation ou le menu de votre navigateur.', { icon: '📲' })
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={<Smartphone className="w-4 h-4" />} title="Application" desc="Statut de l'installation, version et connectivité." />

      <Card>
        {/* Statut installation */}
        <CardSection title="Installation PWA">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isInstalled ? 'bg-[#DCFCE7]' : 'bg-[#F1F5F9]'}`}>
                <Download className={`w-4 h-4 ${isInstalled ? 'text-[#16A34A]' : 'text-[#64748B]'}`} />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">
                  {isInstalled ? 'Application installée' : 'Installer l\'application'}
                </p>
                <p className="text-xs text-[#64748B]">
                  {isInstalled ? 'Fonctionne en mode hors-ligne' : 'Accès rapide depuis l\'écran d\'accueil'}
                </p>
              </div>
            </div>
            {isInstalled
              ? <StatusDot color="green" label="Installée" />
              : <Button size="sm" variant="outline" onClick={handleInstall}><Download className="w-3.5 h-3.5" />Installer</Button>
            }
          </div>
        </CardSection>

        <Divider />

        {/* Connectivité */}
        <CardSection title="Connectivité">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isOnline ? 'bg-[#DCFCE7]' : 'bg-[#FEF3C7]'}`}>
                {isOnline
                  ? <Wifi className="w-4 h-4 text-[#16A34A]" />
                  : <WifiOff className="w-4 h-4 text-[#D97706]" />
                }
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">{isOnline ? 'En ligne' : 'Hors ligne'}</p>
                <p className="text-xs text-[#64748B]">
                  {isOnline ? 'Données synchronisées en temps réel' : 'Mode hors-ligne — données en cache'}
                </p>
              </div>
            </div>
            <StatusDot color={isOnline ? 'green' : 'orange'} label={isOnline ? 'Connecté' : 'Hors ligne'} />
          </div>

          <Divider />

          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#FEF3C7] flex items-center justify-center">
                <Info className="w-4 h-4 text-[#D97706]" />
              </div>
              <div>
                <p className="text-sm font-medium text-[#0F172A]">Base de données</p>
                <p className="text-xs text-[#64748B]">Mock locale — connexion Supabase à venir</p>
              </div>
            </div>
            <StatusDot color="orange" label="Mock" />
          </div>
        </CardSection>

        <Divider />

        {/* Versions */}
        <CardSection title="Informations">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Version',    value: '1.0.0-beta' },
              { label: 'Stack',      value: 'React 19 · Vite 8' },
              { label: 'Auth',       value: 'Mock (local)' },
              { label: 'Déploiement',value: 'GitHub Pages' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-[#F8FAFC] rounded-xl p-3">
                <p className="text-[10px] text-[#94A3B8] uppercase tracking-wide mb-0.5">{label}</p>
                <p className="text-sm font-mono font-medium text-[#0F172A]">{value}</p>
              </div>
            ))}
          </div>
        </CardSection>
      </Card>
    </div>
  )
}

// ─── Section : Danger ────────────────────────────────────────────────────────

function SectionDanger() {
  const [confirming, setConfirming] = useState<string | null>(null)

  const handleReset = () => {
    localStorage.clear()
    toast.success('Données réinitialisées — rechargement...')
    setTimeout(() => window.location.reload(), 1200)
  }

  return (
    <div className="space-y-4">
      <SectionHeader icon={<Shield className="w-4 h-4" />} title="Zone danger" desc="Actions irréversibles. Procédez avec précaution." />

      <div className="rounded-xl border-2 border-[#FEE2E2] overflow-hidden">
        <div className="bg-[#FEF2F2] px-5 py-3 border-b border-[#FEE2E2] flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-[#DC2626]" />
          <p className="text-sm font-semibold text-[#DC2626]">Actions irréversibles</p>
        </div>

        <div className="bg-white divide-y divide-[#FEE2E2]">
          {/* Reset données démo */}
          <DangerRow
            title="Réinitialiser les données démo"
            desc="Efface toutes les données mock et recharge la session. Utile pour repartir d'un état propre."
            icon={<RefreshCw className="w-4 h-4" />}
            confirmKey="reset"
            confirming={confirming}
            onAsk={() => setConfirming('reset')}
            onCancel={() => setConfirming(null)}
            onConfirm={handleReset}
            confirmLabel="Réinitialiser"
          />

          {/* Export données */}
          <DangerRow
            title="Exporter les données"
            desc="Télécharge un export JSON de toutes les données (disponible avec Supabase)."
            icon={<Download className="w-4 h-4" />}
            confirmKey="export"
            confirming={confirming}
            onAsk={() => toast('Export disponible après connexion à Supabase.', { icon: '📦' })}
            onCancel={() => setConfirming(null)}
            onConfirm={() => {}}
            confirmLabel="Exporter"
            disabled
          />
        </div>
      </div>
    </div>
  )
}

// ─── Sous-composants UI ──────────────────────────────────────────────────────

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-1">
      <div className="w-9 h-9 bg-[#EFF6FF] rounded-xl flex items-center justify-center text-[#2563EB] shrink-0">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-[#0F172A]">{title}</h2>
        <p className="text-xs text-[#64748B]">{desc}</p>
      </div>
    </div>
  )
}

function Card({ children }: { children: React.ReactNode }) {
  return <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">{children}</div>
}

function CardSection({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-1.5 mb-3">
        {icon && <span className="text-[#94A3B8]">{icon}</span>}
        <p className="text-xs font-semibold text-[#94A3B8] uppercase tracking-wider">{title}</p>
      </div>
      {children}
    </div>
  )
}

function Divider() {
  return <div className="h-px bg-[#F1F5F9] mx-5" />
}

function Toggle({ checked, onChange, disabled }: { checked: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      disabled={disabled}
      className={`relative w-10 h-6 rounded-full transition-colors shrink-0 focus:outline-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${checked ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`}
    >
      <span
        className="absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform"
        style={{ transform: checked ? 'translateX(16px)' : 'translateX(0)' }}
      />
    </button>
  )
}

function StatusDot({ color, label }: { color: 'green' | 'orange' | 'red'; label: string }) {
  const colors = { green: 'bg-[#16A34A]', orange: 'bg-[#D97706]', red: 'bg-[#DC2626]' }
  const textColors = { green: 'text-[#16A34A]', orange: 'text-[#D97706]', red: 'text-[#DC2626]' }
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <div className={`w-2 h-2 rounded-full ${colors[color]}`} />
      <span className={`text-xs font-medium ${textColors[color]}`}>{label}</span>
    </div>
  )
}

function RoleBadge({ role }: { role: string }) {
  const config: Record<string, { label: string; color: string }> = {
    gerant:    { label: 'Gérant',    color: '#2563EB' },
    moniteur:  { label: 'Moniteur',  color: '#16A34A' },
    secretaire:{ label: 'Secrétaire',color: '#7C3AED' },
    eleve:     { label: 'Élève',     color: '#D97706' },
  }
  const c = config[role] ?? { label: role, color: '#64748B' }
  return (
    <span className="inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: c.color }}>
      {c.label}
    </span>
  )
}

function InfoBanner({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-start gap-2 px-3 py-2.5 bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl text-xs text-[#2563EB]">
      {icon}
      <span>{text}</span>
    </div>
  )
}

function DangerRow({ title, desc, icon, confirmKey, confirming, onAsk, onCancel, onConfirm, confirmLabel, disabled }: {
  title: string; desc: string; icon: React.ReactNode
  confirmKey: string; confirming: string | null
  onAsk: () => void; onCancel: () => void; onConfirm: () => void
  confirmLabel: string; disabled?: boolean
}) {
  const isConfirming = confirming === confirmKey
  return (
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 bg-[#FEF2F2] rounded-lg flex items-center justify-center text-[#DC2626] shrink-0 mt-0.5">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-[#0F172A]">{title}</p>
            <p className="text-xs text-[#64748B] mt-0.5">{desc}</p>
          </div>
        </div>
        {!isConfirming && (
          <Button variant="outline" size="sm" onClick={onAsk} disabled={disabled}
            className="shrink-0 border-[#FCA5A5] text-[#DC2626] hover:bg-[#FEF2F2]">
            {confirmLabel}
          </Button>
        )}
      </div>
      {isConfirming && (
        <div className="mt-3 flex items-center gap-2 p-3 bg-[#FEF2F2] rounded-lg border border-[#FCA5A5]">
          <AlertTriangle className="w-4 h-4 text-[#DC2626] shrink-0" />
          <p className="text-xs text-[#DC2626] flex-1">Cette action est irréversible. Confirmer ?</p>
          <Button size="sm" variant="outline" onClick={onCancel}>Annuler</Button>
          <Button size="sm" onClick={onConfirm} className="bg-[#DC2626] text-white hover:bg-[#B91C1C]">
            Confirmer
          </Button>
        </div>
      )}
    </div>
  )
}

function SectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-12 rounded-xl" />
      <Skeleton className="h-64 rounded-xl" />
    </div>
  )
}

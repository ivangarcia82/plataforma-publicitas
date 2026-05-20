'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { usePathname } from 'next/navigation'
import toast from 'react-hot-toast'
import {
  HiOutlineCalendar, HiOutlineUsers, HiOutlineGift,
  HiOutlineClipboardDocumentList, HiOutlineHome, HiOutlineXMark,
  HiOutlineCalendarDays, HiOutlineChartBar,
  HiOutlineDocumentText, HiOutlineCube, HiOutlineStar,
  HiOutlineUserGroup, HiOutlineBuildingOffice2, HiOutlineIdentification,
  HiOutlineArrowRightOnRectangle,
  HiOutlineSparkles, HiOutlineQrCode,
  HiOutlineBanknotes, HiOutlineUserCircle, HiOutlineCurrencyDollar,
} from 'react-icons/hi2'
import { useCurrentUser } from '@/components/UserContext'

type IconType = typeof HiOutlineCalendar

interface NavLink { href: string; label: string; icon: IconType; newTab?: boolean }
interface Section { label: string; links: NavLink[] }

const adminSections: Section[] = [
  {
    label: 'Gestión',
    links: [
      { href: '/', label: 'Dashboard', icon: HiOutlineHome },
      { href: '/citas-comerciales', label: 'Visitas Comerciales', icon: HiOutlineCalendar },
      { href: '/staff', label: 'Staff Operativo', icon: HiOutlineUsers },
      { href: '/staff/gastos', label: 'Gastos Staff', icon: HiOutlineBanknotes },
      { href: '/obsequios', label: 'Control de Obsequios', icon: HiOutlineGift },
      { href: '/citas-generadas', label: 'Citas Generadas', icon: HiOutlineClipboardDocumentList },
    ],
  },
  {
    label: 'Catálogos',
    links: [
      { href: '/catalogos/ejecutivos', label: 'Ejecutivos', icon: HiOutlineUserGroup },
      { href: '/catalogos/empresas', label: 'Empresas', icon: HiOutlineBuildingOffice2 },
      { href: '/catalogos/clientes', label: 'Clientes', icon: HiOutlineIdentification },
    ],
  },
  {
    label: 'Rifa',
    links: [
      { href: '/admin/qr', label: 'QR Satisfacción', icon: HiOutlineQrCode },
      { href: '/admin/participantes', label: 'Participantes', icon: HiOutlineClipboardDocumentList },
      { href: '/admin/resenas', label: 'Reseñas', icon: HiOutlineStar },
      { href: '/rifaPremium',  label: 'Rifa Premium',  icon: HiOutlineSparkles, newTab: true },
      { href: '/rifaSencilla', label: 'Rifa Sencilla', icon: HiOutlineGift,     newTab: true },
    ],
  },
  {
    label: 'Herramientas',
    links: [
      { href: '/calendario', label: 'Calendario', icon: HiOutlineCalendarDays },
      { href: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
      { href: '/materiales', label: 'Materiales', icon: HiOutlineDocumentText },
      { href: '/inventario', label: 'Inventario', icon: HiOutlineCube },
      { href: '/reviews', label: 'Muro de Reseñas', icon: HiOutlineStar },
    ],
  },
]

const staffSections: Section[] = [
  {
    label: 'Mi Staff',
    links: [
      { href: '/mi-staff', label: 'Mi Información', icon: HiOutlineUserCircle },
      { href: '/mis-gastos', label: 'Mis Gastos', icon: HiOutlineCurrencyDollar },
    ],
  },
  {
    label: 'Recursos',
    links: [
      { href: '/materiales', label: 'Materiales', icon: HiOutlineDocumentText },
    ],
  },
]

const ejecutivoSections: Section[] = [
  {
    label: 'Mi gestión',
    links: [
      { href: '/citas-comerciales', label: 'Visitas Comerciales', icon: HiOutlineCalendar },
      { href: '/obsequios', label: 'Control de Obsequios', icon: HiOutlineGift },
      { href: '/citas-generadas', label: 'Citas Generadas', icon: HiOutlineClipboardDocumentList },
    ],
  },
  {
    label: 'Mis catálogos',
    links: [
      { href: '/catalogos/empresas', label: 'Empresas', icon: HiOutlineBuildingOffice2 },
      { href: '/catalogos/clientes', label: 'Clientes', icon: HiOutlineIdentification },
    ],
  },
  {
    label: 'Herramientas',
    links: [
      { href: '/calendario', label: 'Calendario', icon: HiOutlineCalendarDays },
      { href: '/materiales', label: 'Materiales', icon: HiOutlineDocumentText },
    ],
  },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user } = useCurrentUser()

  const sections =
    user?.rol === 'ejecutivo' ? ejecutivoSections
    : user?.rol === 'staff' ? staffSections
    : adminSections

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Sesión cerrada')
    router.push('/login')
    router.refresh()
  }

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h1>Expo Publicitas</h1>
              <p>Plataforma de Gestión 2026</p>
            </div>
            <button
              className="action-btn md:hidden"
              onClick={onClose}
              style={{ display: open ? 'flex' : 'none' }}
            >
              <HiOutlineXMark />
            </button>
          </div>
        </div>
        <nav className="sidebar-nav">
          {sections.map((section) => (
            <div key={section.label}>
              <div
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-muted)',
                  padding: '14px 14px 6px',
                }}
              >
                {section.label}
              </div>
              {section.links.map((link) => {
                const isActive = pathname === link.href
                if (link.newTab) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="nav-link"
                      onClick={onClose}
                    >
                      <span className="icon"><link.icon /></span>
                      {link.label}
                      <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--color-text-muted)' }}>↗</span>
                    </a>
                  )
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`nav-link ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <span className="icon"><link.icon /></span>
                    {link.label}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>
        <div style={{ padding: '14px 16px', borderTop: '1px solid var(--color-border)' }}>
          {user && (
            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-primary)' }}>{user.nombre}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{user.email}</div>
              <div style={{ fontSize: '10px', color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: '2px' }}>{user.rol}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '12px', padding: '6px 10px' }}
          >
            <HiOutlineArrowRightOnRectangle /> Cerrar sesión
          </button>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: '10px 0 0', textAlign: 'center' }}>
            © 2026 Publicitas
          </p>
        </div>
      </aside>
    </>
  )
}

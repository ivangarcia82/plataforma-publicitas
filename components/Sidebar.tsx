'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  HiOutlineCalendar, HiOutlineUsers, HiOutlineGift,
  HiOutlineClipboardDocumentList, HiOutlineHome, HiOutlineXMark,
  HiOutlineCalendarDays, HiOutlineChartBar,
  HiOutlineDocumentText, HiOutlineCube, HiOutlineStar,
  HiOutlineUserGroup, HiOutlineBuildingOffice2, HiOutlineIdentification,
} from 'react-icons/hi2'

const sections = [
  {
    label: 'Gestión',
    links: [
      { href: '/', label: 'Dashboard', icon: HiOutlineHome },
      { href: '/citas-comerciales', label: 'Visitas Comerciales', icon: HiOutlineCalendar },
      { href: '/staff', label: 'Staff Operativo', icon: HiOutlineUsers },
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
    label: 'Herramientas',
    links: [
      { href: '/calendario', label: 'Calendario', icon: HiOutlineCalendarDays },
      { href: '/analytics', label: 'Analytics', icon: HiOutlineChartBar },
      { href: '/materiales', label: 'Materiales', icon: HiOutlineDocumentText },
      { href: '/inventario', label: 'Inventario', icon: HiOutlineCube },
      { href: '/reviews', label: 'Reseñas', icon: HiOutlineStar },
    ],
  },
]

export default function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = usePathname()

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
        <div style={{ padding: '14px 20px', borderTop: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: '11px', color: 'var(--color-text-muted)', margin: 0 }}>
            © 2026 Publicitas
          </p>
        </div>
      </aside>
    </>
  )
}

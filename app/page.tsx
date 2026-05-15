'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { HiOutlineCalendar, HiOutlineUsers, HiOutlineGift, HiOutlineClipboardDocumentList } from 'react-icons/hi2'
import Link from 'next/link'
import { useCurrentUser } from '@/components/UserContext'

interface Stats {
  citasComerciales: number
  citasConfirmadas: number
  staffTotal: number
  staffPendienteViaticos: number
  obsequiosTotal: number
  citasGeneradas: number
}

export default function Dashboard() {
  const router = useRouter()
  const { user, loading: userLoading } = useCurrentUser()
  const [stats, setStats] = useState<Stats>({
    citasComerciales: 0,
    citasConfirmadas: 0,
    staffTotal: 0,
    staffPendienteViaticos: 0,
    obsequiosTotal: 0,
    citasGeneradas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userLoading && user?.rol === 'staff') {
      router.replace('/mi-staff')
    }
  }, [user, userLoading, router])

  useEffect(() => {
    if (userLoading || user?.rol === 'staff') return
    async function fetchStats() {
      try {
        const [citas, staff, obsequios, generadas] = await Promise.all([
          fetch('/api/citas-comerciales').then(r => r.json()),
          fetch('/api/staff').then(r => r.json()),
          fetch('/api/obsequios').then(r => r.json()),
          fetch('/api/citas-generadas').then(r => r.json()),
        ])
        setStats({
          citasComerciales: citas.length,
          citasConfirmadas: citas.filter((c: { status: string }) => c.status === 'Confirmada').length,
          staffTotal: staff.length,
          staffPendienteViaticos: staff.filter((s: { viaticoStatus: string }) => s.viaticoStatus === 'Pendiente').length,
          obsequiosTotal: obsequios.length,
          citasGeneradas: generadas.length,
        })
      } catch (e) {
        console.error('Error fetching stats', e)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [userLoading, user])

  const cards = [
    {
      title: 'Visitas Comerciales',
      value: stats.citasComerciales,
      subtitle: `${stats.citasConfirmadas} confirmadas`,
      icon: HiOutlineCalendar,
      color: '#F5821F',
      href: '/citas-comerciales',
    },
    {
      title: 'Staff Operativo',
      value: stats.staffTotal,
      subtitle: `${stats.staffPendienteViaticos} viáticos pendientes`,
      icon: HiOutlineUsers,
      color: '#2BA9A0',
      href: '/staff',
    },
    {
      title: 'Obsequios Entregados',
      value: stats.obsequiosTotal,
      subtitle: 'Total registrados',
      icon: HiOutlineGift,
      color: '#e0740f',
      href: '/obsequios',
    },
    {
      title: 'Citas Generadas',
      value: stats.citasGeneradas,
      subtitle: 'Post-expo registradas',
      icon: HiOutlineClipboardDocumentList,
      color: '#3498db',
      href: '/citas-generadas',
    },
  ]

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Resumen general de Expo Publicitas 2026</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} style={{ textDecoration: 'none' }}>
            <div className="stat-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div
                  style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: `${card.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: card.color,
                    fontSize: '22px',
                  }}
                >
                  <card.icon />
                </div>
              </div>
              <div
                style={{
                  fontSize: loading ? '20px' : '32px',
                  fontWeight: 800,
                  color: 'var(--color-text-primary)',
                  marginBottom: '4px',
                  lineHeight: 1,
                }}
              >
                {loading ? '...' : card.value}
              </div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
                {card.title}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {card.subtitle}
              </div>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '24px' }}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '14px', margin: '0 0 14px', color: 'var(--color-text-secondary)' }}>
          🎯 Acceso rápido a módulos
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              className="btn btn-secondary"
              style={{ justifyContent: 'center' }}
            >
              <card.icon />
              {card.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}

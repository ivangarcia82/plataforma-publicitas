'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HiOutlineCalendarDays, HiOutlineClock, HiOutlineBanknotes, HiOutlineCurrencyDollar } from 'react-icons/hi2'

interface Gasto {
  id: string
  fecha: string
  categoria: string
  concepto: string
  monto: number
  status: string
}

interface StaffMember {
  id: string
  nombre: string
  rol: string
  diaAsignado: string
  horarioEntrada: string
  horarioSalida: string
  horaComida: string
  seccion: string
  viaticoCantidad: number
  viaticoStatus: string
  email: string
  telefono: string
  activo: boolean
  gastos: Gasto[]
}

interface Payload {
  staff: StaffMember
  totals: Record<string, number>
}

const statusBadge = (s: string) => ({
  Pendiente: 'badge-warning',
  Aprobado: 'badge-success',
  Rechazado: 'badge-danger',
  Reembolsado: 'badge-info',
}[s] || 'badge-neutral')

interface StatCardProps {
  label: string
  value: string
  sub: string
  color: string
  Icon: React.ComponentType
}

function StatCard({ label, value, sub, color, Icon }: StatCardProps) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div
          style={{
            width: '42px', height: '42px', borderRadius: '10px',
            background: `${color}20`, display: 'flex',
            alignItems: 'center', justifyContent: 'center',
            color, fontSize: '22px',
          }}
        >
          <Icon />
        </div>
      </div>
      <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--color-text-primary)', marginBottom: '4px', lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
        {label}
      </div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{sub}</div>
    </div>
  )
}

export default function MiStaffPage() {
  const [data, setData] = useState<Payload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/mi-staff')
      .then(async r => {
        if (!r.ok) {
          const { error } = await r.json().catch(() => ({ error: 'Error' }))
          setError(error || 'Error')
          return null
        }
        return r.json()
      })
      .then(d => { if (d) setData(d) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="empty-state"><p>Cargando...</p></div>
  if (error || !data) return <div className="empty-state"><p>{error || 'Sin datos'}</p></div>

  const { staff, totals } = data
  const aprobado = totals.Aprobado || 0
  const reembolsado = totals.Reembolsado || 0
  const pendiente = totals.Pendiente || 0
  const totalGastado = totals.total || 0
  const restanteVsViatico = (staff.viaticoCantidad || 0) - totalGastado

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Hola, {staff.nombre}</h1>
          <p className="page-subtitle">Tu información del evento y resumen de gastos</p>
        </div>
        <Link href="/mis-gastos" className="btn btn-primary">
          <HiOutlineCurrencyDollar /> Registrar gasto
        </Link>
      </div>

      <div className="stats-grid">
        <StatCard
          label="Día asignado"
          value={staff.diaAsignado}
          sub={`Sección: ${staff.seccion || '—'}`}
          color="#F5821F"
          Icon={HiOutlineCalendarDays}
        />
        <StatCard
          label="Horario"
          value={`${staff.horarioEntrada} – ${staff.horarioSalida}`}
          sub={`Comida: ${staff.horaComida || '—'}`}
          color="#2BA9A0"
          Icon={HiOutlineClock}
        />
        <StatCard
          label="Viático asignado"
          value={`$${staff.viaticoCantidad.toFixed(2)}`}
          sub={staff.viaticoStatus}
          color="#3498db"
          Icon={HiOutlineBanknotes}
        />
        <StatCard
          label="Total gastado"
          value={`$${totalGastado.toFixed(2)}`}
          sub={restanteVsViatico >= 0 ? `Disponible: $${restanteVsViatico.toFixed(2)}` : `Excedido: $${Math.abs(restanteVsViatico).toFixed(2)}`}
          color="#a855f7"
          Icon={HiOutlineCurrencyDollar}
        />
      </div>

      <div className="glass-card" style={{ padding: '20px', marginBottom: '20px' }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, margin: '0 0 12px' }}>Resumen de gastos por status</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <span className="badge badge-warning">Pendiente: ${pendiente.toFixed(2)}</span>
          <span className="badge badge-success">Aprobado: ${aprobado.toFixed(2)}</span>
          <span className="badge badge-info">Reembolsado: ${reembolsado.toFixed(2)}</span>
        </div>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>Últimos gastos</h2>
          <Link href="/mis-gastos" style={{ fontSize: '13px', color: '#F5821F', textDecoration: 'none' }}>Ver todos →</Link>
        </div>
        {staff.gastos.length === 0 ? (
          <div className="empty-state"><p>Sin gastos registrados</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.gastos.slice(0, 8).map(g => (
                <tr key={g.id}>
                  <td>{g.fecha}</td>
                  <td>{g.categoria}</td>
                  <td>{g.concepto}</td>
                  <td>${g.monto.toFixed(2)}</td>
                  <td><span className={`badge ${statusBadge(g.status)}`}>{g.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

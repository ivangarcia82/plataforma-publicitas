'use client'

import { useEffect, useState } from 'react'

interface Analytics {
  totales: { citas: number; staff: number; obsequios: number; generadas: number }
  citasPorDia: Record<string, number>
  citasPorStatus: Record<string, number>
  citasPorEjecutivo: Record<string, number>
  staffPorRol: Record<string, number>
  viaticos: { total: number; pendiente: number; entregado: number }
  obsequiosPorTipo: Record<string, number>
  generadasPorAccion: Record<string, number>
}

const COLORS = ['#F5821F', '#2BA9A0', '#3498db', '#e74c3c', '#9b59b6', '#e0740f', '#1abc9c']

function BarChart({ data, title }: { data: Record<string, number>; title: string }) {
  const entries = Object.entries(data)
  const max = Math.max(...entries.map(([, v]) => v), 1)

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 16px', color: 'var(--color-text-secondary)' }}>{title}</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {entries.length === 0 ? (
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Sin datos</p>
        ) : (
          entries.map(([label, value], i) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: 500 }}>{label}</span>
                <span style={{ fontSize: '12px', fontWeight: 700, color: COLORS[i % COLORS.length] }}>{value}</span>
              </div>
              <div style={{ height: '8px', background: '#f0f0f4', borderRadius: '4px', overflow: 'hidden' }}>
                <div
                  style={{
                    width: `${(value / max) * 100}%`,
                    height: '100%',
                    background: COLORS[i % COLORS.length],
                    borderRadius: '4px',
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function DonutChart({ data, title }: { data: Record<string, number>; title: string }) {
  const entries = Object.entries(data)
  const total = entries.reduce((s, [, v]) => s + v, 0)
  if (total === 0) {
    return (
      <div className="glass-card" style={{ padding: '20px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 16px', color: 'var(--color-text-secondary)' }}>{title}</h3>
        <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>Sin datos</p>
      </div>
    )
  }

  // Build conic gradient
  let cumulative = 0
  const stops = entries.map(([, value], i) => {
    const start = cumulative
    cumulative += (value / total) * 100
    return `${COLORS[i % COLORS.length]} ${start}% ${cumulative}%`
  })

  return (
    <div className="glass-card" style={{ padding: '20px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, margin: '0 0 16px', color: 'var(--color-text-secondary)' }}>{title}</h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <div
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: `conic-gradient(${stops.join(', ')})`,
            flexShrink: 0,
            position: 'relative',
          }}
        >
          <div style={{ position: 'absolute', inset: '22px', background: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>{total}</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {entries.map(([label, value], i) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
              <span style={{ width: 10, height: 10, borderRadius: '3px', background: COLORS[i % COLORS.length], flexShrink: 0 }} />
              <span style={{ color: 'var(--color-text-primary)' }}>{label}</span>
              <span style={{ color: 'var(--color-text-muted)', marginLeft: 'auto' }}>{value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="glass-card" style={{ padding: '18px', textAlign: 'center' }}>
      <div style={{ fontSize: '28px', fontWeight: 800, color, marginBottom: '4px' }}>{value}</div>
      <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{label}</div>
    </div>
  )
}

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/analytics')
      .then(r => r.json())
      .then(data => { setAnalytics(data); setLoading(false) })
  }, [])

  if (loading || !analytics) {
    return <div className="empty-state"><p>Cargando analytics...</p></div>
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Resumen visual de toda la actividad de Expo Publicitas</p>
        </div>
      </div>

      {/* Summary row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '12px', marginBottom: '20px' }}>
        <StatBox label="Visitas Comerciales" value={String(analytics.totales.citas)} color="#F5821F" />
        <StatBox label="Staff" value={String(analytics.totales.staff)} color="#2BA9A0" />
        <StatBox label="Obsequios" value={String(analytics.totales.obsequios)} color="#e0740f" />
        <StatBox label="Citas Generadas" value={String(analytics.totales.generadas)} color="#3498db" />
        <StatBox label="Viáticos Pendientes" value={`$${analytics.viaticos.pendiente.toLocaleString()}`} color="#e74c3c" />
        <StatBox label="Viáticos Entregados" value={`$${analytics.viaticos.entregado.toLocaleString()}`} color="#2BA9A0" />
      </div>

      {/* Charts grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '14px' }}>
        <BarChart data={analytics.citasPorEjecutivo} title="Citas por Ejecutivo" />
        <DonutChart data={analytics.citasPorStatus} title="Citas por Status" />
        <BarChart data={analytics.citasPorDia} title="Citas por Día" />
        <DonutChart data={analytics.staffPorRol} title="Staff por Rol" />
        <DonutChart data={analytics.obsequiosPorTipo} title="Obsequios por Tipo de Cliente" />
        <DonutChart data={analytics.generadasPorAccion} title="Citas Generadas por Acción" />
      </div>
    </div>
  )
}

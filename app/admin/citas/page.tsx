'use client'

import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineArrowDownTray, HiOutlineCalendarDays, HiOutlineUserGroup, HiOutlineDocumentArrowDown } from 'react-icons/hi2'

interface Ejecutivo { id: string; nombre: string; activo: boolean }

export default function AdminExportCitasPage() {
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [ejecutivoId, setEjecutivoId] = useState<string>('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    fetch('/api/catalogos/ejecutivos')
      .then(r => r.ok ? r.json() : [])
      .then(setEjecutivos)
      .catch(() => setEjecutivos([]))
  }, [])

  const download = async () => {
    if (from && to && from > to) {
      toast.error('La fecha "desde" no puede ser posterior a "hasta".')
      return
    }
    setBusy(true)
    const params = new URLSearchParams()
    if (from) params.set('from', from)
    if (to) params.set('to', to)
    if (ejecutivoId) params.set('ejecutivoId', ejecutivoId)
    const url = `/api/admin/citas/export${params.toString() ? `?${params.toString()}` : ''}`
    try {
      const res = await fetch(url)
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Error' }))
        toast.error(err.error === 'FORBIDDEN' ? 'No tienes permisos de administrador.' : 'No se pudo generar el archivo.')
        return
      }
      const blob = await res.blob()
      const disposition = res.headers.get('Content-Disposition') || ''
      const match = disposition.match(/filename="?([^"]+)"?/)
      const filename = match?.[1] || `citas-${new Date().toISOString().slice(0, 10)}.xlsx`
      const objectUrl = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = objectUrl
      a.download = filename
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(objectUrl)
      toast.success('Archivo descargado')
    } catch {
      toast.error('Error de red al generar el archivo.')
    } finally {
      setBusy(false)
    }
  }

  const clearFilters = () => {
    setFrom('')
    setTo('')
    setEjecutivoId('')
  }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
          <HiOutlineDocumentArrowDown style={{ color: '#F5821F' }} /> Exportar Citas
        </h1>
        <p style={{ fontSize: '13px', color: '#6b6b7b', margin: '6px 0 0' }}>
          Descarga un archivo Excel con todas las citas registradas por el equipo comercial. El archivo incluye dos hojas: <b>Citas Comerciales</b> y <b>Citas Generadas</b>.
        </p>
      </div>

      <div style={{ background: 'white', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 16px rgba(0,0,0,0.04)', border: '1px solid #f0f0f4' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>
              <HiOutlineCalendarDays /> Desde (fecha de registro)
            </label>
            <input
              type="date"
              className="input"
              value={from}
              onChange={e => setFrom(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <HiOutlineCalendarDays /> Hasta (fecha de registro)
            </label>
            <input
              type="date"
              className="input"
              value={to}
              onChange={e => setTo(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={labelStyle}>
              <HiOutlineUserGroup /> Ejecutivo
            </label>
            <select
              className="input"
              value={ejecutivoId}
              onChange={e => setEjecutivoId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">Todos los ejecutivos</option>
              {ejecutivos.map(ej => (
                <option key={ej.id} value={ej.id}>
                  {ej.nombre}{!ej.activo ? ' (inactivo)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ fontSize: '12px', color: '#9b9bab', margin: '0 0 20px' }}>
          Si dejas los filtros vacíos se exportarán <b>todas</b> las citas registradas hasta hoy.
        </p>

        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={download}
            disabled={busy}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: '#F5821F',
              color: 'white',
              border: 'none',
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '14px',
              cursor: busy ? 'not-allowed' : 'pointer',
              opacity: busy ? 0.6 : 1,
            }}
          >
            <HiOutlineArrowDownTray />
            {busy ? 'Generando…' : 'Descargar Excel'}
          </button>
          <button
            onClick={clearFilters}
            disabled={busy}
            style={{
              background: 'transparent',
              color: '#6b6b7b',
              border: '1px solid #e5e5ec',
              padding: '12px 20px',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '14px',
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            Limpiar filtros
          </button>
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '16px', background: '#fff7ed', borderRadius: '10px', border: '1px solid #fed7aa', fontSize: '13px', color: '#7c2d12' }}>
        <b>¿Qué incluye el archivo?</b>
        <ul style={{ margin: '8px 0 0', paddingLeft: '20px' }}>
          <li><b>Citas Comerciales</b>: visitas registradas con día, horario, status, transporte, ejecutivo, cliente y empresa.</li>
          <li><b>Citas Generadas</b>: citas con fecha, acción, ejecutivo, cliente, empresa y notas.</li>
        </ul>
      </div>
    </div>
  )
}

const labelStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: '6px',
  fontSize: '12px',
  fontWeight: 700,
  color: '#6b6b7b',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '6px',
}

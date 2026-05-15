'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlineBanknotes, HiOutlineCheck, HiOutlineXMark, HiOutlineArrowPath, HiOutlineArrowTopRightOnSquare, HiOutlinePencil } from 'react-icons/hi2'

interface StaffMini { id: string; nombre: string; diasAsignados: string[] }
interface Gasto {
  id: string
  fecha: string
  categoria: string
  concepto: string
  monto: number
  comprobanteUrl: string
  status: string
  notasStaff: string
  notasAdmin: string
  staffMember: StaffMini
}

const STATUS_OPTIONS = ['Pendiente', 'Aprobado', 'Rechazado', 'Reembolsado']

const statusBadge = (s: string) => ({
  Pendiente: 'badge-warning',
  Aprobado: 'badge-success',
  Rechazado: 'badge-danger',
  Reembolsado: 'badge-info',
}[s] || 'badge-neutral')

export default function AdminGastosStaffPage() {
  const [data, setData] = useState<Gasto[]>([])
  const [staffList, setStaffList] = useState<StaffMini[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('')
  const [filterStaff, setFilterStaff] = useState('')
  const [editing, setEditing] = useState<Gasto | null>(null)

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    if (filterStaff) params.set('staffMemberId', filterStaff)
    const [gastosRes, staffRes] = await Promise.all([
      fetch(`/api/gastos?${params}`),
      fetch('/api/staff'),
    ])
    setData(await gastosRes.json())
    const staff = await staffRes.json()
    setStaffList(staff.map((s: StaffMini) => ({ id: s.id, nombre: s.nombre, diasAsignados: s.diasAsignados || [] })))
    setLoading(false)
  }, [filterStatus, filterStaff])

  useEffect(() => { fetchData() }, [fetchData])

  const updateStatus = async (gasto: Gasto, status: string) => {
    const res = await fetch('/api/gastos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: gasto.id, status }),
    })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Error' }))
      toast.error(error || 'Error')
      return
    }
    toast.success(`Marcado como ${status}`)
    fetchData()
  }

  const saveNote = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editing) return
    const res = await fetch('/api/gastos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: editing.id,
        status: editing.status,
        notasAdmin: editing.notasAdmin,
      }),
    })
    if (!res.ok) {
      toast.error('Error al guardar')
      return
    }
    toast.success('Guardado')
    setEditing(null)
    fetchData()
  }

  const totales = data.reduce((acc, g) => {
    acc.total += g.monto
    acc[g.status] = (acc[g.status] || 0) + g.monto
    return acc
  }, { total: 0 } as Record<string, number>)

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gastos del Staff</h1>
          <p className="page-subtitle">Aprueba, rechaza o marca como reembolsado los gastos reportados</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '14px', fontSize: '13px' }}>
          <div><strong>Total filtrado:</strong> ${totales.total.toFixed(2)}</div>
          <span className="badge badge-warning">Pendiente: ${(totales.Pendiente || 0).toFixed(2)}</span>
          <span className="badge badge-success">Aprobado: ${(totales.Aprobado || 0).toFixed(2)}</span>
          <span className="badge badge-danger">Rechazado: ${(totales.Rechazado || 0).toFixed(2)}</span>
          <span className="badge badge-info">Reembolsado: ${(totales.Reembolsado || 0).toFixed(2)}</span>
        </div>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input" value={filterStaff} onChange={e => setFilterStaff(e.target.value)}>
          <option value="">Todo el staff</option>
          {staffList.map(s => <option key={s.id} value={s.id}>{s.nombre} — {(s.diasAsignados || []).join(', ') || 'Sin días'}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineBanknotes /></div>
            <p>No hay gastos para mostrar</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Staff</th>
                <th>Categoría</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Comprobante</th>
                <th>Status</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.fecha}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{item.staffMember.nombre}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{(item.staffMember.diasAsignados || []).join(', ') || '—'}</div>
                  </td>
                  <td>{item.categoria}</td>
                  <td>
                    <div>{item.concepto}</div>
                    {item.notasStaff && <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notasStaff}</div>}
                  </td>
                  <td>${item.monto.toFixed(2)}</td>
                  <td>
                    {item.comprobanteUrl ? (
                      <a href={item.comprobanteUrl} target="_blank" rel="noreferrer" style={{ color: '#F5821F', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Ver <HiOutlineArrowTopRightOnSquare />
                      </a>
                    ) : '—'}
                  </td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>
                    <div className="actions-cell">
                      {item.status !== 'Aprobado' && (
                        <button className="action-btn" title="Aprobar" onClick={() => updateStatus(item, 'Aprobado')}>
                          <HiOutlineCheck />
                        </button>
                      )}
                      {item.status !== 'Rechazado' && (
                        <button className="action-btn delete" title="Rechazar" onClick={() => updateStatus(item, 'Rechazado')}>
                          <HiOutlineXMark />
                        </button>
                      )}
                      {item.status === 'Aprobado' && (
                        <button className="action-btn" title="Marcar reembolsado" onClick={() => updateStatus(item, 'Reembolsado')}>
                          <HiOutlineArrowPath />
                        </button>
                      )}
                      <button className="action-btn" title="Nota admin" onClick={() => setEditing(item)}>
                        <HiOutlinePencil />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <div className="modal-overlay" onClick={() => setEditing(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 16px' }}>Nota administrativa</h2>
            <form onSubmit={saveNote}>
              <div className="form-group">
                <label>Status</label>
                <select className="input" value={editing.status} onChange={e => setEditing({ ...editing, status: e.target.value })}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Nota para el staff</label>
                <textarea
                  className="input"
                  rows={4}
                  value={editing.notasAdmin}
                  onChange={e => setEditing({ ...editing, notasAdmin: e.target.value })}
                  placeholder="Motivo del rechazo, observaciones, etc."
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditing(null)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">Guardar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

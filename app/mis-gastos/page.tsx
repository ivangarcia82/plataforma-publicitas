'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCurrencyDollar, HiOutlineArrowTopRightOnSquare } from 'react-icons/hi2'

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
}

const CATEGORIAS = ['Transporte', 'Comida', 'Hospedaje', 'Material', 'Otro']

const todayISO = () => new Date().toISOString().split('T')[0]

const emptyForm = () => ({
  fecha: todayISO(),
  categoria: 'Transporte',
  concepto: '',
  monto: 0,
  comprobanteUrl: '',
  notasStaff: '',
})

const statusBadge = (s: string) => ({
  Pendiente: 'badge-warning',
  Aprobado: 'badge-success',
  Rechazado: 'badge-danger',
  Reembolsado: 'badge-info',
}[s] || 'badge-neutral')

export default function MisGastosPage() {
  const [data, setData] = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Gasto | null>(null)
  const [form, setForm] = useState(emptyForm())
  const [filterStatus, setFilterStatus] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterStatus) params.set('status', filterStatus)
    const res = await fetch(`/api/gastos?${params}`)
    setData(await res.json())
    setLoading(false)
  }, [filterStatus])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (item: Gasto) => {
    setEditing(item)
    setForm({
      fecha: item.fecha,
      categoria: item.categoria,
      concepto: item.concepto,
      monto: item.monto,
      comprobanteUrl: item.comprobanteUrl,
      notasStaff: item.notasStaff,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, monto: Number(form.monto) }
    const res = editing
      ? await fetch('/api/gastos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      : await fetch('/api/gastos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Error' }))
      toast.error(error || 'Error al guardar')
      return
    }
    toast.success(editing ? 'Gasto actualizado' : 'Gasto registrado')
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (item: Gasto) => {
    if (!confirm('¿Eliminar este gasto?')) return
    const res = await fetch('/api/gastos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }) })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Error' }))
      toast.error(error || 'Error')
      return
    }
    toast.success('Gasto eliminado')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Mis Gastos</h1>
          <p className="page-subtitle">Registra los gastos de tus viáticos. Adjunta el link de tu comprobante.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo gasto
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los status</option>
          <option value="Pendiente">Pendiente</option>
          <option value="Aprobado">Aprobado</option>
          <option value="Rechazado">Rechazado</option>
          <option value="Reembolsado">Reembolsado</option>
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineCurrencyDollar /></div>
            <p>No has registrado gastos aún</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Categoría</th>
                <th>Concepto</th>
                <th>Monto</th>
                <th>Comprobante</th>
                <th>Status</th>
                <th>Nota admin</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.fecha}</td>
                  <td>{item.categoria}</td>
                  <td style={{ fontWeight: 600 }}>{item.concepto}</td>
                  <td>${item.monto.toFixed(2)}</td>
                  <td>
                    {item.comprobanteUrl ? (
                      <a href={item.comprobanteUrl} target="_blank" rel="noreferrer" style={{ color: '#F5821F', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        Ver <HiOutlineArrowTopRightOnSquare />
                      </a>
                    ) : '—'}
                  </td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notasAdmin || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button
                        className="action-btn"
                        disabled={item.status !== 'Pendiente'}
                        onClick={() => openEdit(item)}
                        title={item.status === 'Pendiente' ? 'Editar' : 'Ya revisado'}
                      ><HiOutlinePencil /></button>
                      <button
                        className="action-btn delete"
                        disabled={item.status !== 'Pendiente'}
                        onClick={() => handleDelete(item)}
                        title={item.status === 'Pendiente' ? 'Eliminar' : 'Ya revisado'}
                      ><HiOutlineTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '24px', margin: '0 0 24px' }}>
              {editing ? 'Editar gasto' : 'Nuevo gasto'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Fecha</label>
                  <input className="input" type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Categoría</label>
                  <select className="input" value={form.categoria} onChange={e => setForm({ ...form, categoria: e.target.value })}>
                    {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Concepto</label>
                <input className="input" required value={form.concepto} onChange={e => setForm({ ...form, concepto: e.target.value })} placeholder="Taxi al hotel, comida, etc." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Monto (MXN)</label>
                  <input className="input" type="number" min={0} step={0.01} required value={form.monto} onChange={e => setForm({ ...form, monto: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Link del comprobante (opcional)</label>
                  <input className="input" type="url" value={form.comprobanteUrl} onChange={e => setForm({ ...form, comprobanteUrl: e.target.value })} placeholder="https://drive.google.com/..." />
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notasStaff} onChange={e => setForm({ ...form, notasStaff: e.target.value })} placeholder="Detalles adicionales..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar cambios' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

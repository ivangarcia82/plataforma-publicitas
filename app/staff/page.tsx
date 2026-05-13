'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUsers, HiOutlineBell } from 'react-icons/hi2'

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
}

const ROL_OPTIONS = ['Líder', 'Coordinador', 'Staff']
const DIA_OPTIONS = ['Día 1', 'Día 2', 'Día 3']
const VIATICO_STATUS_OPTIONS = ['Pendiente', 'Entregado']

const rolBadge = (rol: string) => {
  const map: Record<string, string> = { 'Líder': 'badge-danger', 'Coordinador': 'badge-warning', 'Staff': 'badge-info' }
  return map[rol] || 'badge-neutral'
}

const emptyForm = {
  nombre: '', rol: 'Staff', diaAsignado: 'Día 1', horarioEntrada: '', horarioSalida: '',
  horaComida: '', seccion: '', viaticoCantidad: 0, viaticoStatus: 'Pendiente',
}

export default function StaffPage() {
  const [data, setData] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterDia, setFilterDia] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [showReminder, setShowReminder] = useState(true)

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterDia) params.set('dia', filterDia)
    if (filterRol) params.set('rol', filterRol)
    const res = await fetch(`/api/staff?${params}`)
    setData(await res.json())
    setLoading(false)
  }, [filterDia, filterRol])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: StaffMember) => {
    setEditing(item)
    setForm({
      nombre: item.nombre, rol: item.rol, diaAsignado: item.diaAsignado,
      horarioEntrada: item.horarioEntrada, horarioSalida: item.horarioSalida,
      horaComida: item.horaComida, seccion: item.seccion,
      viaticoCantidad: item.viaticoCantidad, viaticoStatus: item.viaticoStatus,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const payload = { ...form, viaticoCantidad: Number(form.viaticoCantidad) }
    if (editing) {
      await fetch('/api/staff', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      toast.success('Staff actualizado')
    } else {
      await fetch('/api/staff', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      toast.success('Staff registrado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este miembro del staff?')) return
    await fetch('/api/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Staff eliminado')
    fetchData()
  }

  const pendingViaticos = data.filter(s => s.viaticoStatus === 'Pendiente').length

  return (
    <div>
      {showReminder && data.length > 0 && (
        <div
          style={{
            background: 'rgba(245,130,31,0.06)',
            border: '1px solid rgba(245,130,31,0.2)',
            borderRadius: '10px',
            padding: '14px 18px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <HiOutlineBell style={{ color: '#F5821F', fontSize: '20px', flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <strong style={{ color: '#F5821F' }}>Recordatorio:</strong>{' '}
            <span style={{ color: 'var(--color-text-secondary)', fontSize: '13px' }}>
              Hay {data.length} miembros del staff registrados. {pendingViaticos > 0 ? `${pendingViaticos} tienen viáticos pendientes de entregar.` : 'Todos los viáticos han sido entregados.'}
            </span>
          </div>
          <button className="action-btn" onClick={() => setShowReminder(false)} style={{ flexShrink: 0 }}>✕</button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Operativo</h1>
          <p className="page-subtitle">Horarios y viáticos del equipo de apoyo en la Expo</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo Staff
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterDia} onChange={e => setFilterDia(e.target.value)}>
          <option value="">Todos los días</option>
          {DIA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input" value={filterRol} onChange={e => setFilterRol(e.target.value)}>
          <option value="">Todos los roles</option>
          {ROL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineUsers /></div>
            <p>No hay staff registrado</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Rol</th>
                <th>Día</th>
                <th>Entrada</th>
                <th>Salida</th>
                <th>Comida</th>
                <th>Sección</th>
                <th>Viáticos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                  <td><span className={`badge ${rolBadge(item.rol)}`}>{item.rol}</span></td>
                  <td><span className="badge badge-neutral">{item.diaAsignado}</span></td>
                  <td>{item.horarioEntrada}</td>
                  <td>{item.horarioSalida}</td>
                  <td>{item.horaComida || '—'}</td>
                  <td>{item.seccion || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>${item.viaticoCantidad}</span>
                      <span className={`badge ${item.viaticoStatus === 'Entregado' ? 'badge-success' : 'badge-warning'}`}>
                        {item.viaticoStatus}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(item.id)}><HiOutlineTrash /></button>
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
              {editing ? 'Editar Staff' : 'Nuevo Miembro del Staff'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre</label>
                  <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre completo" />
                </div>
                <div className="form-group">
                  <label>Rol</label>
                  <select className="input" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                    {ROL_OPTIONS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Día Asignado</label>
                  <select className="input" value={form.diaAsignado} onChange={e => setForm({ ...form, diaAsignado: e.target.value })}>
                    {DIA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Sección Asignada</label>
                  <input className="input" value={form.seccion} onChange={e => setForm({ ...form, seccion: e.target.value })} placeholder="Sección" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Horario Entrada</label>
                  <input className="input" type="time" required value={form.horarioEntrada} onChange={e => setForm({ ...form, horarioEntrada: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Horario Salida</label>
                  <input className="input" type="time" required value={form.horarioSalida} onChange={e => setForm({ ...form, horarioSalida: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Hora Comida</label>
                <input className="input" type="time" value={form.horaComida} onChange={e => setForm({ ...form, horaComida: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Viáticos (Cantidad)</label>
                  <input className="input" type="number" min={0} step={0.01} value={form.viaticoCantidad} onChange={e => setForm({ ...form, viaticoCantidad: Number(e.target.value) })} />
                </div>
                <div className="form-group">
                  <label>Status Viáticos</label>
                  <select className="input" value={form.viaticoStatus} onChange={e => setForm({ ...form, viaticoStatus: e.target.value })}>
                    {VIATICO_STATUS_OPTIONS.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Registrar Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUsers, HiOutlineBell,
  HiOutlineKey, HiOutlineNoSymbol, HiOutlineClipboard,
} from 'react-icons/hi2'

interface UserMini { id: string; email: string }
interface StaffMember {
  id: string
  nombre: string
  rol: string
  diasAsignados: string[]
  horarioEntrada: string
  horarioSalida: string
  horaComida: string
  seccion: string
  viaticoCantidad: number
  viaticoStatus: string
  email: string
  telefono: string
  activo: boolean
  user: UserMini | null
}

const ROL_OPTIONS = ['Líder', 'Coordinador', 'Staff']
const DIA_OPTIONS = ['Día 1', 'Día 2', 'Día 3']
const VIATICO_STATUS_OPTIONS = ['Pendiente', 'Entregado']

const rolBadge = (rol: string) => {
  const map: Record<string, string> = { 'Líder': 'badge-danger', 'Coordinador': 'badge-warning', 'Staff': 'badge-info' }
  return map[rol] || 'badge-neutral'
}

const emptyForm: {
  nombre: string; rol: string; diasAsignados: string[]; horarioEntrada: string; horarioSalida: string;
  horaComida: string; seccion: string; viaticoCantidad: number; viaticoStatus: string;
  email: string; telefono: string; activo: boolean;
} = {
  nombre: '', rol: 'Staff', diasAsignados: [], horarioEntrada: '', horarioSalida: '',
  horaComida: '', seccion: '', viaticoCantidad: 0, viaticoStatus: 'Pendiente',
  email: '', telefono: '', activo: true,
}

export default function StaffPage() {
  const [data, setData] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<StaffMember | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterDia, setFilterDia] = useState('')
  const [filterRol, setFilterRol] = useState('')
  const [filterActivo, setFilterActivo] = useState('')
  const [showReminder, setShowReminder] = useState(true)
  const [accessModal, setAccessModal] = useState<{ email: string; tempPassword: string } | null>(null)

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterDia) params.set('dia', filterDia)
    if (filterRol) params.set('rol', filterRol)
    if (filterActivo) params.set('activo', filterActivo)
    const res = await fetch(`/api/staff?${params}`)
    setData(await res.json())
    setLoading(false)
  }, [filterDia, filterRol, filterActivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: StaffMember) => {
    setEditing(item)
    setForm({
      nombre: item.nombre, rol: item.rol, diasAsignados: item.diasAsignados || [],
      horarioEntrada: item.horarioEntrada, horarioSalida: item.horarioSalida,
      horaComida: item.horaComida, seccion: item.seccion,
      viaticoCantidad: item.viaticoCantidad, viaticoStatus: item.viaticoStatus,
      email: item.email, telefono: item.telefono, activo: item.activo,
    })
    setShowModal(true)
  }

  const toggleDia = (dia: string) => {
    setForm(prev => ({
      ...prev,
      diasAsignados: prev.diasAsignados.includes(dia)
        ? prev.diasAsignados.filter(d => d !== dia)
        : [...prev.diasAsignados, dia],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.diasAsignados.length === 0) {
      toast.error('Selecciona al menos un día')
      return
    }
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

  const handleDelete = async (item: StaffMember) => {
    if (!confirm('¿Eliminar este miembro del staff?')) return
    const res = await fetch('/api/staff', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id }) })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Error' }))
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Staff eliminado')
    fetchData()
  }

  const handleCreateAccess = async (item: StaffMember) => {
    if (!item.email) {
      toast.error('Agrega un email primero')
      openEdit(item)
      return
    }
    const action = item.user ? 'Restablecer contraseña' : 'Crear acceso'
    if (!confirm(`${action} para ${item.nombre}? Se generará una contraseña temporal.`)) return
    const res = await fetch(`/api/staff/${item.id}/access`, { method: 'POST' })
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: 'Error' }))
      toast.error(error || 'Error')
      return
    }
    const out = await res.json()
    setAccessModal(out)
    fetchData()
  }

  const handleRevokeAccess = async (item: StaffMember) => {
    if (!item.user) return
    if (!confirm(`¿Revocar el acceso de ${item.nombre}? Se eliminará su usuario.`)) return
    const res = await fetch(`/api/staff/${item.id}/access`, { method: 'DELETE' })
    if (!res.ok) {
      toast.error('Error al revocar')
      return
    }
    toast.success('Acceso revocado')
    fetchData()
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copiado')
    } catch {
      toast.error('No se pudo copiar')
    }
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
              {data.length} miembros del staff. {pendingViaticos > 0 ? `${pendingViaticos} con viáticos pendientes.` : 'Todos los viáticos entregados.'}
            </span>
          </div>
          <button className="action-btn" onClick={() => setShowReminder(false)} style={{ flexShrink: 0 }}>✕</button>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Staff Operativo</h1>
          <p className="page-subtitle">Horarios, viáticos y accesos del equipo de apoyo</p>
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
        <select className="input" value={filterActivo} onChange={e => setFilterActivo(e.target.value)}>
          <option value="">Todos</option>
          <option value="true">Solo activos</option>
          <option value="false">Solo inactivos</option>
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
                <th>Horario</th>
                <th>Contacto</th>
                <th>Viáticos</th>
                <th>Acceso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id} style={{ opacity: item.activo ? 1 : 0.55 }}>
                  <td style={{ fontWeight: 600 }}>
                    {item.nombre}
                    {!item.activo && <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', marginLeft: '6px' }}>(inactivo)</span>}
                  </td>
                  <td><span className={`badge ${rolBadge(item.rol)}`}>{item.rol}</span></td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {(item.diasAsignados && item.diasAsignados.length > 0)
                        ? item.diasAsignados.map(d => <span key={d} className="badge badge-neutral">{d}</span>)
                        : <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>—</span>}
                    </div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>{item.horarioEntrada} – {item.horarioSalida}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Comida: {item.horaComida || '—'} · {item.seccion || '—'}</div>
                  </td>
                  <td>
                    <div style={{ fontSize: '12px' }}>{item.email || '—'}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{item.telefono || '—'}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 600 }}>${item.viaticoCantidad}</span>
                      <span className={`badge ${item.viaticoStatus === 'Entregado' ? 'badge-success' : 'badge-warning'}`}>
                        {item.viaticoStatus}
                      </span>
                    </div>
                  </td>
                  <td>
                    {item.user ? (
                      <span className="badge badge-success" title={item.user.email}>Activo</span>
                    ) : (
                      <span className="badge badge-neutral">Sin acceso</span>
                    )}
                  </td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" title={item.user ? 'Restablecer contraseña' : 'Crear acceso'} onClick={() => handleCreateAccess(item)}>
                        <HiOutlineKey />
                      </button>
                      {item.user && (
                        <button className="action-btn delete" title="Revocar acceso" onClick={() => handleRevokeAccess(item)}>
                          <HiOutlineNoSymbol />
                        </button>
                      )}
                      <button className="action-btn" title="Editar" onClick={() => openEdit(item)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" title="Eliminar" onClick={() => handleDelete(item)}><HiOutlineTrash /></button>
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
                  <label>Email (para acceso a la plataforma)</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input className="input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+52 ..." />
                </div>
              </div>
              <div className="form-group">
                <label>Días Asignados</label>
                <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', padding: '8px 0' }}>
                  {DIA_OPTIONS.map(d => (
                    <label key={d} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontSize: '13px' }}>
                      <input
                        type="checkbox"
                        checked={form.diasAsignados.includes(d)}
                        onChange={() => toggleDia(d)}
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Sección Asignada</label>
                <input className="input" value={form.seccion} onChange={e => setForm({ ...form, seccion: e.target.value })} placeholder="Sección" />
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
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
                  Activo
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Registrar Staff'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {accessModal && (
        <div className="modal-overlay" onClick={() => setAccessModal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '20px', fontWeight: 700, margin: '0 0 12px' }}>Credenciales generadas</h2>
            <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: '0 0 16px' }}>
              Comparte esta contraseña temporal con el staff. <strong>No se mostrará otra vez.</strong>
            </p>
            <div className="form-group">
              <label>Email</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input className="input" readOnly value={accessModal.email} />
                <button type="button" className="action-btn" onClick={() => copyText(accessModal.email)}><HiOutlineClipboard /></button>
              </div>
            </div>
            <div className="form-group">
              <label>Contraseña temporal</label>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input className="input" readOnly value={accessModal.tempPassword} style={{ fontFamily: 'monospace' }} />
                <button type="button" className="action-btn" onClick={() => copyText(accessModal.tempPassword)}><HiOutlineClipboard /></button>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-primary" onClick={() => setAccessModal(null)}>Listo</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

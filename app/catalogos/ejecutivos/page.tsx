// app/catalogos/ejecutivos/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi2'

interface Ejecutivo {
  id: string
  nombre: string
  email: string
  telefono: string
  cargo: string
  activo: boolean
}

const emptyForm: Omit<Ejecutivo, 'id'> = {
  nombre: '', email: '', telefono: '', cargo: '', activo: true,
}

export default function EjecutivosPage() {
  const [data, setData] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Ejecutivo | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterActivo, setFilterActivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterActivo) params.set('activo', filterActivo)
    const res = await fetch(`/api/catalogos/ejecutivos?${params}`)
    setData(await res.json())
    setLoading(false)
  }, [filterActivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: Ejecutivo) => {
    setEditing(item)
    setForm({ nombre: item.nombre, email: item.email, telefono: item.telefono, cargo: item.cargo, activo: item.activo })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await fetch('/api/catalogos/ejecutivos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
      toast.success('Ejecutivo actualizado')
    } else {
      await fetch('/api/catalogos/ejecutivos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success('Ejecutivo creado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este ejecutivo? Si tiene registros asociados, no se podrá borrar.')) return
    const res = await fetch('/api/catalogos/ejecutivos', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Ejecutivo eliminado')
    fetchData()
  }

  const handleToggleActivo = async (item: Ejecutivo) => {
    await fetch('/api/catalogos/ejecutivos', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: item.id, activo: !item.activo }) })
    toast.success(item.activo ? 'Ejecutivo desactivado' : 'Ejecutivo activado')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Ejecutivos</h1>
          <p className="page-subtitle">Catálogo de ejecutivos comerciales</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo Ejecutivo
        </button>
      </div>

      <div className="filters-bar">
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
            <div className="icon"><HiOutlineUserGroup /></div>
            <p>No hay ejecutivos registrados</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                  <td>{item.cargo || '—'}</td>
                  <td>{item.email || '—'}</td>
                  <td>{item.telefono || '—'}</td>
                  <td>
                    <button
                      className={`badge ${item.activo ? 'badge-success' : 'badge-neutral'}`}
                      onClick={() => handleToggleActivo(item)}
                      style={{ cursor: 'pointer', border: 'none' }}
                    >
                      {item.activo ? 'Activo' : 'Inactivo'}
                    </button>
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
              {editing ? 'Editar Ejecutivo' : 'Nuevo Ejecutivo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre completo</label>
                <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Cargo</label>
                  <input className="input" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="KAM, Senior, etc." />
                </div>
                <div className="form-group">
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
                </div>
              </div>
              <div className="form-group">
                <label>Teléfono / WhatsApp</label>
                <input className="input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+52 ..." />
              </div>
              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input type="checkbox" checked={form.activo} onChange={e => setForm({ ...form, activo: e.target.checked })} />
                  Activo
                </label>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

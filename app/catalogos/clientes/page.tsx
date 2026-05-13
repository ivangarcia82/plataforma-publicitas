// app/catalogos/clientes/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUsers } from 'react-icons/hi2'

interface Empresa { id: string; nombre: string }
interface Cliente {
  id: string; nombre: string; cargo: string; email: string; telefono: string; notas: string
  empresaId: string
  empresa: Empresa
}

const emptyForm = { nombre: '', cargo: '', email: '', telefono: '', notas: '', empresaId: '' }

export default function ClientesPage() {
  const [data, setData] = useState<Cliente[]>([])
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterEmpresa, setFilterEmpresa] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterEmpresa) params.set('empresaId', filterEmpresa)
    const [clientesRes, empresasRes] = await Promise.all([
      fetch(`/api/catalogos/clientes?${params}`),
      fetch('/api/catalogos/empresas'),
    ])
    setData(await clientesRes.json())
    setEmpresas(await empresasRes.json())
    setLoading(false)
  }, [filterEmpresa])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: Cliente) => {
    setEditing(item)
    setForm({ nombre: item.nombre, cargo: item.cargo, email: item.email, telefono: item.telefono, notas: item.notas, empresaId: item.empresaId })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.empresaId) { toast.error('Selecciona una empresa'); return }
    if (editing) {
      await fetch('/api/catalogos/clientes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
      toast.success('Contacto actualizado')
    } else {
      await fetch('/api/catalogos/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success('Contacto creado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este contacto?')) return
    const res = await fetch('/api/catalogos/clientes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Contacto eliminado')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Clientes</h1>
          <p className="page-subtitle">Búsqueda global de contactos en todas las empresas</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nuevo Contacto
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterEmpresa} onChange={e => setFilterEmpresa(e.target.value)}>
          <option value="">Todas las empresas</option>
          {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineUsers /></div>
            <p>No hay contactos registrados</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Empresa</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.nombre}</td>
                  <td>{item.cargo || '—'}</td>
                  <td>{item.empresa.nombre}</td>
                  <td>{item.email || '—'}</td>
                  <td>{item.telefono || '—'}</td>
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
              {editing ? 'Editar Contacto' : 'Nuevo Contacto'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Empresa</label>
                <select className="input" required value={form.empresaId} onChange={e => setForm({ ...form, empresaId: e.target.value })}>
                  <option value="">Selecciona empresa</option>
                  {empresas.map(e => <option key={e.id} value={e.id}>{e.nombre}</option>)}
                </select>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input className="input" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input className="input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar' : 'Crear'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

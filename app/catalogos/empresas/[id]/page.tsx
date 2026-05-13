// app/catalogos/empresas/[id]/page.tsx
'use client'

import { useEffect, useState, useCallback, use } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineArrowLeft } from 'react-icons/hi2'

interface Cliente {
  id: string
  nombre: string
  cargo: string
  email: string
  telefono: string
  notas: string
}

interface Empresa {
  id: string
  nombre: string
  ciudadEstado: string
  notas: string
  clientes: Cliente[]
}

const emptyClienteForm = { nombre: '', cargo: '', email: '', telefono: '', notas: '' }

export default function EmpresaDetallePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Cliente | null>(null)
  const [form, setForm] = useState(emptyClienteForm)

  const fetchData = useCallback(async () => {
    const res = await fetch(`/api/catalogos/empresas/${id}`)
    if (!res.ok) {
      setLoading(false)
      return
    }
    setEmpresa(await res.json())
    setLoading(false)
  }, [id])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyClienteForm); setShowModal(true) }
  const openEdit = (item: Cliente) => {
    setEditing(item)
    setForm({ nombre: item.nombre, cargo: item.cargo, email: item.email, telefono: item.telefono, notas: item.notas })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (editing) {
      await fetch('/api/catalogos/clientes', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form, empresaId: id }) })
      toast.success('Contacto actualizado')
    } else {
      await fetch('/api/catalogos/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, empresaId: id }) })
      toast.success('Contacto agregado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (clienteId: string) => {
    if (!confirm('¿Eliminar este contacto? Si tiene citas u obsequios asociados, no se podrá borrar.')) return
    const res = await fetch('/api/catalogos/clientes', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: clienteId }) })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Contacto eliminado')
    fetchData()
  }

  if (loading) return <div className="empty-state"><p>Cargando...</p></div>
  if (!empresa) return <div className="empty-state"><p>Empresa no encontrada</p></div>

  return (
    <div>
      <div className="page-header">
        <div>
          <Link href="/catalogos/empresas" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: 'var(--color-text-muted)', textDecoration: 'none', marginBottom: '8px' }}>
            <HiOutlineArrowLeft /> Volver a Empresas
          </Link>
          <h1 className="page-title">{empresa.nombre}</h1>
          <p className="page-subtitle">{empresa.ciudadEstado || 'Sin ubicación'} · {empresa.clientes.length} contactos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Agregar Contacto
        </button>
      </div>

      {empresa.notas && (
        <div className="glass-card" style={{ padding: '16px', marginBottom: '16px' }}>
          <strong>Notas:</strong> {empresa.notas}
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {empresa.clientes.length === 0 ? (
          <div className="empty-state"><p>No hay contactos en esta empresa</p></div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
                <th>Email</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresa.clientes.map(c => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                  <td>{c.cargo || '—'}</td>
                  <td>{c.email || '—'}</td>
                  <td>{c.telefono || '—'}</td>
                  <td>
                    <div className="actions-cell">
                      <button className="action-btn" onClick={() => openEdit(c)}><HiOutlinePencil /></button>
                      <button className="action-btn delete" onClick={() => handleDelete(c.id)}><HiOutlineTrash /></button>
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
              {editing ? 'Editar Contacto' : `Nuevo Contacto en ${empresa.nombre}`}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo</label>
                  <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre" />
                </div>
                <div className="form-group">
                  <label>Cargo</label>
                  <input className="input" value={form.cargo} onChange={e => setForm({ ...form, cargo: e.target.value })} placeholder="Director, Compras..." />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Email</label>
                  <input className="input" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="correo@ejemplo.com" />
                </div>
                <div className="form-group">
                  <label>Teléfono</label>
                  <input className="input" value={form.telefono} onChange={e => setForm({ ...form, telefono: e.target.value })} placeholder="+52 ..." />
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Agregar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

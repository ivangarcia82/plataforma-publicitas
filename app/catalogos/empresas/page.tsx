// app/catalogos/empresas/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineBuildingOffice2 } from 'react-icons/hi2'
import EntityCombobox from '@/components/EntityCombobox'

interface Ejecutivo { id: string; nombre: string }
interface Empresa {
  id: string
  nombre: string
  ciudadEstado: string
  notas: string
  ejecutivoId: string
  ejecutivo: Ejecutivo
  _count: { clientes: number }
}

const emptyForm = { nombre: '', ciudadEstado: '', notas: '', ejecutivoId: '' }

export default function EmpresasPage() {
  const [data, setData] = useState<Empresa[]>([])
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Empresa | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [filterEjecutivo, setFilterEjecutivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterEjecutivo) params.set('ejecutivoId', filterEjecutivo)
    const [empresasRes, ejecutivosRes] = await Promise.all([
      fetch(`/api/catalogos/empresas?${params}`),
      fetch('/api/catalogos/ejecutivos?activo=true'),
    ])
    setData(await empresasRes.json())
    setEjecutivos(await ejecutivosRes.json())
    setLoading(false)
  }, [filterEjecutivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: Empresa) => {
    setEditing(item)
    setForm({ nombre: item.nombre, ciudadEstado: item.ciudadEstado, notas: item.notas, ejecutivoId: item.ejecutivoId })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ejecutivoId) { toast.error('Selecciona un ejecutivo asignado'); return }
    if (editing) {
      await fetch('/api/catalogos/empresas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...form }) })
      toast.success('Empresa actualizada')
    } else {
      await fetch('/api/catalogos/empresas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      toast.success('Empresa creada')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta empresa? Si tiene contactos o registros, no se podrá borrar.')) return
    const res = await fetch('/api/catalogos/empresas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    if (!res.ok) {
      const { error } = await res.json()
      toast.error(error || 'Error al eliminar')
      return
    }
    toast.success('Empresa eliminada')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Empresas</h1>
          <p className="page-subtitle">Catálogo de empresas con ejecutivo asignado y contactos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nueva Empresa
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterEjecutivo} onChange={e => setFilterEjecutivo(e.target.value)}>
          <option value="">Todos los ejecutivos</option>
          {ejecutivos.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineBuildingOffice2 /></div>
            <p>No hay empresas registradas</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad / Estado</th>
                <th>Ejecutivo</th>
                <th>Contactos</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>
                    <Link href={`/catalogos/empresas/${item.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                      {item.nombre}
                    </Link>
                  </td>
                  <td>{item.ciudadEstado || '—'}</td>
                  <td>{item.ejecutivo.nombre}</td>
                  <td><span className="badge badge-neutral">{item._count.clientes}</span></td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.notas || '—'}</td>
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
              {editing ? 'Editar Empresa' : 'Nueva Empresa'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nombre comercial</label>
                <input className="input" required value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Empresa S.A. de C.V." />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ciudad / Estado</label>
                  <input className="input" value={form.ciudadEstado} onChange={e => setForm({ ...form, ciudadEstado: e.target.value })} placeholder="CDMX, Monterrey, etc." />
                </div>
                <div className="form-group">
                  <label>Ejecutivo asignado</label>
                  <EntityCombobox
                    tipo="ejecutivo"
                    value={form.ejecutivoId}
                    onChange={ejecutivoId => setForm({ ...form, ejecutivoId })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas internas..." style={{ resize: 'vertical' }} />
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

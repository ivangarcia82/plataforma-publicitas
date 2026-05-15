'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineClipboardDocumentList } from 'react-icons/hi2'
import { useCurrentUser } from '@/components/UserContext'

interface Ejecutivo { id: string; nombre: string }
interface Empresa { id: string; nombre: string }
interface Cliente { id: string; nombre: string; empresaId: string; empresa: Empresa }
interface CitaGenerada {
  id: string
  fecha: string
  ejecutivoId: string | null
  ejecutivo: Ejecutivo | null
  clienteId: string | null
  cliente: Cliente | null
  empresaTexto: string
  contactoTexto: string
  ejecutivoTexto: string
  accion: string
  notas: string
}

const ACCION_OPTIONS = ['Catálogo', 'Cotización', 'Cita', 'Otro']

const accionBadge = (accion: string) => {
  const map: Record<string, string> = {
    'Catálogo': 'badge-info',
    'Cotización': 'badge-warning',
    'Cita': 'badge-success',
    'Otro': 'badge-neutral',
  }
  return map[accion] || 'badge-neutral'
}

interface FormState {
  fecha: string
  empresaTexto: string
  contactoTexto: string
  ejecutivoTexto: string
  accion: string
  notas: string
}

const todayISO = () => new Date().toISOString().split('T')[0]

const emptyForm = (): FormState => ({
  fecha: todayISO(),
  empresaTexto: '',
  contactoTexto: '',
  ejecutivoTexto: '',
  accion: 'Otro',
  notas: '',
})

// For legacy rows, show FK relation values when free-text empty
const displayEmpresa = (c: CitaGenerada) => c.empresaTexto || c.cliente?.empresa?.nombre || '—'
const displayContacto = (c: CitaGenerada) => c.contactoTexto || c.cliente?.nombre || '—'
const displayEjecutivo = (c: CitaGenerada) => c.ejecutivoTexto || c.ejecutivo?.nombre || '—'

export default function CitasGeneradasPage() {
  const { user } = useCurrentUser()
  const isEjecutivo = user?.rol === 'ejecutivo'
  const [data, setData] = useState<CitaGenerada[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CitaGenerada | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [filterAccion, setFilterAccion] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterAccion) params.set('accion', filterAccion)
    const res = await fetch(`/api/citas-generadas?${params}`)
    setData(await res.json())
    setLoading(false)
  }, [filterAccion])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => {
    setEditing(null)
    setForm({
      ...emptyForm(),
      ejecutivoTexto: isEjecutivo ? (user?.nombre || '') : '',
    })
    setShowModal(true)
  }
  const openEdit = (item: CitaGenerada) => {
    setEditing(item)
    setForm({
      fecha: item.fecha,
      empresaTexto: displayEmpresa(item) === '—' ? '' : displayEmpresa(item),
      contactoTexto: displayContacto(item) === '—' ? '' : displayContacto(item),
      ejecutivoTexto: displayEjecutivo(item) === '—' ? '' : displayEjecutivo(item),
      accion: item.accion,
      notas: item.notas,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.empresaTexto.trim() && !form.contactoTexto.trim()) {
      toast.error('Captura al menos empresa o contacto')
      return
    }
    const payload = form
    if (editing) {
      await fetch('/api/citas-generadas', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      toast.success('Cita actualizada')
    } else {
      await fetch('/api/citas-generadas', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      toast.success('Cita registrada')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return
    await fetch('/api/citas-generadas', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Cita eliminada')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Citas Generadas</h1>
          <p className="page-subtitle">Citas concretadas con prospectos, envío de catálogos y seguimiento post-evento</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nueva Cita
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterAccion} onChange={e => setFilterAccion(e.target.value)}>
          <option value="">Todas las acciones</option>
          {ACCION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="empty-state"><p>Cargando...</p></div>
        ) : data.length === 0 ? (
          <div className="empty-state">
            <div className="icon"><HiOutlineClipboardDocumentList /></div>
            <p>No hay citas generadas</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Contacto</th>
                <th>Empresa</th>
                <th>Ejecutivo</th>
                <th>Acción</th>
                <th>Notas</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.fecha}</td>
                  <td style={{ fontWeight: 600 }}>{displayContacto(item)}</td>
                  <td>{displayEmpresa(item)}</td>
                  <td>{displayEjecutivo(item)}</td>
                  <td><span className={`badge ${accionBadge(item.accion)}`}>{item.accion}</span></td>
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
              {editing ? 'Editar Cita' : 'Registrar Cita Generada'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Fecha</label>
                <input className="input" type="date" required value={form.fecha} onChange={e => setForm({ ...form, fecha: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Empresa</label>
                  <input className="input" value={form.empresaTexto} onChange={e => setForm({ ...form, empresaTexto: e.target.value })} placeholder="Nombre de la empresa" />
                </div>
                <div className="form-group">
                  <label>Contacto</label>
                  <input className="input" value={form.contactoTexto} onChange={e => setForm({ ...form, contactoTexto: e.target.value })} placeholder="Nombre del contacto" />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ejecutivo que Atendió</label>
                  <input className="input" value={form.ejecutivoTexto} onChange={e => setForm({ ...form, ejecutivoTexto: e.target.value })} placeholder="Nombre del ejecutivo" />
                </div>
                <div className="form-group">
                  <label>Acción</label>
                  <select className="input" value={form.accion} onChange={e => setForm({ ...form, accion: e.target.value })}>
                    {ACCION_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Notas</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas de seguimiento..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Registrar'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

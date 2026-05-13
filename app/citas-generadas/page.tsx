'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineClipboardDocumentList } from 'react-icons/hi2'
import EntityCombobox from '@/components/EntityCombobox'
import { useCurrentUser } from '@/components/UserContext'

interface Ejecutivo { id: string; nombre: string }
interface Empresa { id: string; nombre: string }
interface Cliente { id: string; nombre: string; empresaId: string; empresa: Empresa }
interface CitaGenerada {
  id: string
  fecha: string
  ejecutivoId: string
  ejecutivo: Ejecutivo
  clienteId: string
  cliente: Cliente
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
  ejecutivoId: string
  empresaId: string
  clienteId: string
  accion: string
  notas: string
}

const todayISO = () => new Date().toISOString().split('T')[0]

const emptyForm = (): FormState => ({
  fecha: todayISO(),
  ejecutivoId: '', empresaId: '', clienteId: '',
  accion: 'Otro', notas: '',
})

export default function CitasGeneradasPage() {
  const { user } = useCurrentUser()
  const isEjecutivo = user?.rol === 'ejecutivo'
  const [data, setData] = useState<CitaGenerada[]>([])
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CitaGenerada | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [filterAccion, setFilterAccion] = useState('')
  const [filterEjecutivo, setFilterEjecutivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterAccion) params.set('accion', filterAccion)
    if (filterEjecutivo) params.set('ejecutivoId', filterEjecutivo)
    const [citasRes, ejecutivosRes] = await Promise.all([
      fetch(`/api/citas-generadas?${params}`),
      fetch('/api/catalogos/ejecutivos?activo=true'),
    ])
    setData(await citasRes.json())
    setEjecutivos(await ejecutivosRes.json())
    setLoading(false)
  }, [filterAccion, filterEjecutivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (item: CitaGenerada) => {
    setEditing(item)
    setForm({
      fecha: item.fecha,
      ejecutivoId: item.ejecutivoId,
      empresaId: item.cliente.empresaId,
      clienteId: item.clienteId,
      accion: item.accion, notas: item.notas,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.clienteId) {
      toast.error('Selecciona cliente')
      return
    }
    if (!isEjecutivo && !form.ejecutivoId) {
      toast.error('Selecciona ejecutivo')
      return
    }
    const { empresaId: _empresaId, ...payload } = form
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
        {!isEjecutivo && (
          <select className="input" value={filterEjecutivo} onChange={e => setFilterEjecutivo(e.target.value)}>
            <option value="">Todos los ejecutivos</option>
            {ejecutivos.map(ej => <option key={ej.id} value={ej.id}>{ej.nombre}</option>)}
          </select>
        )}
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
                <th>Nombre</th>
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
                  <td style={{ fontWeight: 600 }}>{item.cliente.nombre}</td>
                  <td>{item.cliente.empresa.nombre}</td>
                  <td>{item.ejecutivo.nombre}</td>
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
                  <EntityCombobox tipo="empresa" value={form.empresaId} onChange={empresaId => setForm({ ...form, empresaId, clienteId: '' })} required />
                </div>
                <div className="form-group">
                  <label>Cliente / Contacto</label>
                  <EntityCombobox tipo="cliente" value={form.clienteId} empresaId={form.empresaId} onChange={clienteId => setForm({ ...form, clienteId })} required />
                </div>
              </div>
              <div className="form-row">
                {!isEjecutivo && (
                  <div className="form-group">
                    <label>Ejecutivo que Atendió</label>
                    <EntityCombobox tipo="ejecutivo" value={form.ejecutivoId} onChange={ejecutivoId => setForm({ ...form, ejecutivoId })} required />
                  </div>
                )}
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

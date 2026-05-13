'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineGift } from 'react-icons/hi2'
import EntityCombobox from '@/components/EntityCombobox'
import { useCurrentUser } from '@/components/UserContext'

interface Ejecutivo { id: string; nombre: string }
interface Empresa { id: string; nombre: string }
interface Cliente { id: string; nombre: string; empresaId: string; empresa: Empresa }
interface Obsequio {
  id: string
  fecha: string
  ejecutivoId: string
  ejecutivo: Ejecutivo
  clienteId: string
  cliente: Cliente
  tipoCliente: string
  articulo: string
  observaciones: string
}

const TIPO_CLIENTE_OPTIONS = ['Activo', 'Prospecto']

const tipoBadge = (tipo: string) => tipo === 'Activo' ? 'badge-success' : 'badge-info'

interface FormState {
  fecha: string
  ejecutivoId: string
  empresaId: string
  clienteId: string
  tipoCliente: string
  articulo: string
  observaciones: string
}

const todayISO = () => new Date().toISOString().split('T')[0]

const emptyForm = (): FormState => ({
  fecha: todayISO(),
  ejecutivoId: '', empresaId: '', clienteId: '',
  tipoCliente: 'Prospecto', articulo: '', observaciones: '',
})

export default function ObsequiosPage() {
  const { user } = useCurrentUser()
  const isEjecutivo = user?.rol === 'ejecutivo'
  const [data, setData] = useState<Obsequio[]>([])
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Obsequio | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm())
  const [filterFecha, setFilterFecha] = useState('')
  const [filterEjecutivo, setFilterEjecutivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterFecha) params.set('fecha', filterFecha)
    if (filterEjecutivo) params.set('ejecutivoId', filterEjecutivo)
    const [obsRes, ejecutivosRes] = await Promise.all([
      fetch(`/api/obsequios?${params}`),
      fetch('/api/catalogos/ejecutivos?activo=true'),
    ])
    setData(await obsRes.json())
    setEjecutivos(await ejecutivosRes.json())
    setLoading(false)
  }, [filterFecha, filterEjecutivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setShowModal(true) }
  const openEdit = (item: Obsequio) => {
    setEditing(item)
    setForm({
      fecha: item.fecha,
      ejecutivoId: item.ejecutivoId,
      empresaId: item.cliente.empresaId,
      clienteId: item.clienteId,
      tipoCliente: item.tipoCliente,
      articulo: item.articulo,
      observaciones: item.observaciones,
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
      await fetch('/api/obsequios', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      toast.success('Obsequio actualizado')
    } else {
      await fetch('/api/obsequios', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      toast.success('Obsequio registrado')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este obsequio?')) return
    await fetch('/api/obsequios', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Obsequio eliminado')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Control de Obsequios</h1>
          <p className="page-subtitle">Registro de obsequios entregados a clientes y prospectos</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Registrar Obsequio
        </button>
      </div>

      <div className="filters-bar">
        <input className="input" type="date" value={filterFecha} onChange={e => setFilterFecha(e.target.value)} style={{ width: 'auto' }} />
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
            <div className="icon"><HiOutlineGift /></div>
            <p>No hay obsequios registrados</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Tipo</th>
                <th>Ejecutivo</th>
                <th>Observaciones</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td>{item.fecha}</td>
                  <td style={{ fontWeight: 600 }}>{item.cliente.nombre}</td>
                  <td>{item.cliente.empresa.nombre}</td>
                  <td><span className={`badge ${tipoBadge(item.tipoCliente)}`}>{item.tipoCliente}</span></td>
                  <td>{item.ejecutivo.nombre}</td>
                  <td style={{ maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.observaciones || '—'}</td>
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
              {editing ? 'Editar Obsequio' : 'Registrar Obsequio'}
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
                <div className="form-group">
                  <label>Tipo Cliente</label>
                  <select className="input" value={form.tipoCliente} onChange={e => setForm({ ...form, tipoCliente: e.target.value })}>
                    {TIPO_CLIENTE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                {!isEjecutivo && (
                  <div className="form-group">
                    <label>Ejecutivo Responsable</label>
                    <EntityCombobox tipo="ejecutivo" value={form.ejecutivoId} onChange={ejecutivoId => setForm({ ...form, ejecutivoId })} required />
                  </div>
                )}
              </div>
              <div className="form-group">
                <label>Observaciones</label>
                <textarea className="input" rows={3} value={form.observaciones} onChange={e => setForm({ ...form, observaciones: e.target.value })} placeholder="Observaciones..." style={{ resize: 'vertical' }} />
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

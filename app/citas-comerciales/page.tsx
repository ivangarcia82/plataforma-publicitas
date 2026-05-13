'use client'

import { useEffect, useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineCalendar } from 'react-icons/hi2'
import EntityCombobox from '@/components/EntityCombobox'

interface Ejecutivo { id: string; nombre: string }
interface Empresa { id: string; nombre: string }
interface Cliente { id: string; nombre: string; empresaId: string; empresa: Empresa }
interface CitaComercial {
  id: string
  ejecutivoId: string
  ejecutivo: Ejecutivo
  clienteId: string
  cliente: Cliente
  dia: string
  status: string
  horario: string
  transporte: string
  notas: string
}

const STATUS_OPTIONS = ['Confirmada', 'Tentativa', 'Reagendada', 'Atendida']
const DIA_OPTIONS = ['Día 1', 'Día 2', 'Día 3']
const TRANSPORTE_OPTIONS = ['', 'Uber', 'Estacionamiento', 'Otro']

const statusBadge = (status: string) => {
  const map: Record<string, string> = {
    Confirmada: 'badge-success',
    Tentativa: 'badge-warning',
    Reagendada: 'badge-info',
    Atendida: 'badge-accent',
  }
  return map[status] || 'badge-neutral'
}

interface FormState {
  ejecutivoId: string
  empresaId: string  // estado UI: para encadenar el combobox cliente
  clienteId: string
  dia: string
  status: string
  horario: string
  transporte: string
  notas: string
}

const emptyForm: FormState = {
  ejecutivoId: '', empresaId: '', clienteId: '',
  dia: 'Día 1', status: 'Tentativa', horario: '', transporte: '', notas: '',
}

export default function CitasComercialesPage() {
  const [data, setData] = useState<CitaComercial[]>([])
  const [ejecutivos, setEjecutivos] = useState<Ejecutivo[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<CitaComercial | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [filterDia, setFilterDia] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterEjecutivo, setFilterEjecutivo] = useState('')

  const fetchData = useCallback(async () => {
    const params = new URLSearchParams()
    if (filterDia) params.set('dia', filterDia)
    if (filterStatus) params.set('status', filterStatus)
    if (filterEjecutivo) params.set('ejecutivoId', filterEjecutivo)
    const [citasRes, ejecutivosRes] = await Promise.all([
      fetch(`/api/citas-comerciales?${params}`),
      fetch('/api/catalogos/ejecutivos?activo=true'),
    ])
    setData(await citasRes.json())
    setEjecutivos(await ejecutivosRes.json())
    setLoading(false)
  }, [filterDia, filterStatus, filterEjecutivo])

  useEffect(() => { fetchData() }, [fetchData])

  const openCreate = () => { setEditing(null); setForm(emptyForm); setShowModal(true) }
  const openEdit = (item: CitaComercial) => {
    setEditing(item)
    setForm({
      ejecutivoId: item.ejecutivoId,
      empresaId: item.cliente.empresaId,
      clienteId: item.clienteId,
      dia: item.dia, status: item.status, horario: item.horario, transporte: item.transporte, notas: item.notas,
    })
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.ejecutivoId || !form.clienteId) {
      toast.error('Selecciona ejecutivo y cliente')
      return
    }
    // El backend ignora empresaId (no es columna en CitaComercial); lo dejamos solo en estado UI.
    const { empresaId: _empresaId, ...payload } = form
    if (editing) {
      await fetch('/api/citas-comerciales', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: editing.id, ...payload }) })
      toast.success('Cita actualizada')
    } else {
      await fetch('/api/citas-comerciales', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      toast.success('Cita creada')
    }
    setShowModal(false)
    fetchData()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta cita?')) return
    await fetch('/api/citas-comerciales', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) })
    toast.success('Cita eliminada')
    fetchData()
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Visitas Comerciales</h1>
          <p className="page-subtitle">Gestión de citas con clientes durante la Expo</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <HiOutlinePlus /> Nueva Cita
        </button>
      </div>

      <div className="filters-bar">
        <select className="input" value={filterDia} onChange={e => setFilterDia(e.target.value)}>
          <option value="">Todos los días</option>
          {DIA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select className="input" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">Todos los status</option>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
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
            <div className="icon"><HiOutlineCalendar /></div>
            <p>No hay citas registradas</p>
          </div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Empresa</th>
                <th>Ejecutivo</th>
                <th>Día</th>
                <th>Horario</th>
                <th>Status</th>
                <th>Transporte</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {data.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.cliente.nombre}</td>
                  <td>{item.cliente.empresa.nombre}</td>
                  <td>{item.ejecutivo.nombre}</td>
                  <td><span className="badge badge-neutral">{item.dia}</span></td>
                  <td>{item.horario}</td>
                  <td><span className={`badge ${statusBadge(item.status)}`}>{item.status}</span></td>
                  <td>{item.transporte || '—'}</td>
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
              {editing ? 'Editar Cita' : 'Nueva Visita Comercial'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Empresa</label>
                  <EntityCombobox
                    tipo="empresa"
                    value={form.empresaId}
                    onChange={empresaId => setForm({ ...form, empresaId, clienteId: '' })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cliente / Contacto</label>
                  <EntityCombobox
                    tipo="cliente"
                    value={form.clienteId}
                    empresaId={form.empresaId}
                    onChange={clienteId => setForm({ ...form, clienteId })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ejecutivo Responsable</label>
                  <EntityCombobox
                    tipo="ejecutivo"
                    value={form.ejecutivoId}
                    onChange={ejecutivoId => setForm({ ...form, ejecutivoId })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Día de la Cita</label>
                  <select className="input" value={form.dia} onChange={e => setForm({ ...form, dia: e.target.value })}>
                    {DIA_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Horario Tentativo</label>
                  <input className="input" type="time" value={form.horario} onChange={e => setForm({ ...form, horario: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select className="input" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Uber / Estacionamiento</label>
                <select className="input" value={form.transporte} onChange={e => setForm({ ...form, transporte: e.target.value })}>
                  {TRANSPORTE_OPTIONS.map(t => <option key={t} value={t}>{t || 'Ninguno'}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Notas Adicionales</label>
                <textarea className="input" rows={3} value={form.notas} onChange={e => setForm({ ...form, notas: e.target.value })} placeholder="Notas..." style={{ resize: 'vertical' }} />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Guardar Cambios' : 'Crear Cita'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

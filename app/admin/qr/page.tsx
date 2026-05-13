'use client'

import { useEffect, useState } from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { HiOutlinePrinter, HiOutlineQrCode } from 'react-icons/hi2'

export default function QRPage() {
  const [origin, setOrigin] = useState('')

  useEffect(() => {
    setOrigin(window.location.origin)
  }, [])

  const url = origin ? `${origin}/satisfaccion` : '/satisfaccion'

  const handlePrint = () => window.print()

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">QR de Satisfacción</h1>
          <p className="page-subtitle">Imprime o proyecta este código para que los clientes participen en la rifa.</p>
        </div>
        <button className="btn btn-primary no-print" onClick={handlePrint}>
          <HiOutlinePrinter /> Imprimir
        </button>
      </div>

      <div className="glass-card" style={{ padding: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
        <div style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', fontWeight: 700 }}>Expo Publicitas 2026</div>
        <h2 style={{ fontSize: '28px', fontWeight: 700, margin: 0, textAlign: 'center' }}>
          Escanea, califica y participa en la rifa
        </h2>
        <div style={{ padding: '24px', background: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
          {origin && (
            <QRCodeSVG
              value={url}
              size={280}
              level="H"
              includeMargin={false}
            />
          )}
        </div>
        <div style={{ fontSize: '14px', color: 'var(--color-text-muted)', textAlign: 'center' }}>
          O ingresa a: <strong style={{ color: 'var(--color-text-primary)' }}>{url}</strong>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'center', marginTop: '8px' }}>
          Los participantes registrados hoy entrarán al sorteo del día actual.
        </div>
      </div>

      <style jsx global>{`
        @media print {
          .no-print, .sidebar, .mobile-menu-btn, .page-subtitle, .page-header > button { display: none !important; }
          .app-layout { display: block !important; }
          .main-content { padding: 0 !important; }
          .glass-card { box-shadow: none !important; border: none !important; }
        }
      `}</style>
    </div>
  )
}

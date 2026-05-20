'use client'

import { useState, useEffect, useCallback, useRef, useMemo } from 'react'

/* ──────────────────── Types ──────────────────── */
interface ReviewDB {
  id: string
  nombre: string
  empresa: string
  cargo: string
  rating: number
  texto: string
  createdAt: string
}

interface ReviewDisplay {
  id: string
  name: string
  company: string
  role: string
  rating: number
  text: string
  avatar: string
  timestamp: number
}

/* ──────────────────── Constants ──────────────────── */
const AVATAR_COLORS = [
  'linear-gradient(135deg, #F5821F, #FF6B35)',
  'linear-gradient(135deg, #2BA9A0, #38D9A9)',
  'linear-gradient(135deg, #667eea, #764ba2)',
  'linear-gradient(135deg, #f093fb, #f5576c)',
  'linear-gradient(135deg, #4facfe, #00f2fe)',
  'linear-gradient(135deg, #43e97b, #38f9d7)',
  'linear-gradient(135deg, #fa709a, #fee140)',
  'linear-gradient(135deg, #a18cd1, #fbc2eb)',
  'linear-gradient(135deg, #fccb90, #d57eeb)',
  'linear-gradient(135deg, #e0c3fc, #8ec5fc)',
]

const CYCLE_INTERVAL = 8000 // ms per featured review
const POLL_INTERVAL = 5000  // ms between API polls (aligned to wall clock for multi-screen sync)
const SECTION_CYCLE = 4500  // ms per welcome-section rotation

const SECTIONS = [
  { value: 'digital_evolution',    label: 'Digital Evolution',    color: '#F5821F' },
  { value: 'promotional_workshop', label: 'Promotional Workshop', color: '#2BA9A0' },
  { value: 'print_shop',           label: 'Print Shop',           color: '#3498db' },
] as const

/* ──────────────────── Helpers ──────────────────── */
function hashToColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = id.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const s = Math.floor(diff / 1000)
  if (s < 10) return 'Justo ahora'
  if (s < 60) return `Hace ${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `Hace ${m}m`
  return `Hace ${Math.floor(m / 60)}h`
}

function mapReview(r: ReviewDB): ReviewDisplay {
  return {
    id: r.id, name: r.nombre, company: r.empresa,
    role: r.cargo, rating: r.rating, text: r.texto,
    avatar: hashToColor(r.id), timestamp: new Date(r.createdAt).getTime(),
  }
}

/* ══════════════════════════════════════════════════
   MAIN COMPONENT — Full-screen expo display
   ══════════════════════════════════════════════════ */
export default function ReviewsLivePage() {
  const [reviews, setReviews] = useState<ReviewDisplay[]>([])
  const [featuredIdx, setFeaturedIdx] = useState(0)
  const [sectionIdx, setSectionIdx] = useState(0)
  const [loading, setLoading] = useState(true)
  const [newFlash, setNewFlash] = useState(false)
  const knownIds = useRef(new Set<string>())
  const [, tick] = useState(0)

  // ── Welcome section rotation, sync'd to wall clock across all screens ──
  useEffect(() => {
    const update = () => setSectionIdx(Math.floor(Date.now() / SECTION_CYCLE) % SECTIONS.length)
    update()
    const t = setInterval(update, 200)
    return () => clearInterval(t)
  }, [])

  // ── Fetch reviews from API ──
  const fetchReviews = useCallback(async (initial = false) => {
    try {
      const res = await fetch('/api/reviews')
      const data: ReviewDB[] = await res.json()
      const mapped = data.map(mapReview)

      if (initial) {
        mapped.forEach(r => knownIds.current.add(r.id))
        setReviews(mapped)
        setLoading(false)
        return
      }

      const newOnes = mapped.filter(r => !knownIds.current.has(r.id))
      if (newOnes.length > 0) {
        newOnes.forEach(r => knownIds.current.add(r.id))
        setReviews(prev => [...newOnes, ...prev])
        // Flash effect for new review
        setNewFlash(true)
        setTimeout(() => setNewFlash(false), 1200)
      }
    } catch (e) {
      console.error('Fetch error:', e)
      if (initial) setLoading(false)
    }
  }, [])

  useEffect(() => { fetchReviews(true) }, [fetchReviews])

  // ── Polling aligned to wall-clock multiples of POLL_INTERVAL so all screens
  //    refresh near-simultaneously regardless of when each one was opened ──
  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | null = null
    const delay = POLL_INTERVAL - (Date.now() % POLL_INTERVAL)
    const timeoutId = setTimeout(() => {
      fetchReviews()
      intervalId = setInterval(() => fetchReviews(), POLL_INTERVAL)
    }, delay)
    return () => {
      clearTimeout(timeoutId)
      if (intervalId) clearInterval(intervalId)
    }
  }, [fetchReviews])

  // ── Featured review derived from wall clock + newest-review anchor.
  //    Every screen with the same `reviews` array computes the same index,
  //    so opening a screen mid-cycle joins the rotation already in progress. ──
  useEffect(() => {
    if (reviews.length === 0) return
    const anchor = reviews[0].timestamp
    const update = () => {
      const elapsed = Math.max(0, Date.now() - anchor)
      setFeaturedIdx(Math.floor(elapsed / CYCLE_INTERVAL) % reviews.length)
    }
    update()
    const t = setInterval(update, 200)
    return () => clearInterval(t)
  }, [reviews])

  // ── Tick for time-ago ──
  useEffect(() => {
    const t = setInterval(() => tick(p => p + 1), 5000)
    return () => clearInterval(t)
  }, [])

  const featured = reviews[featuredIdx] || null
  const currentSection = SECTIONS[sectionIdx]

  // Offset for the welcome underline so it aligns with the shared section cycle
  // (a screen opening mid-section must show the bar partially filled).
  const sectionDelayMs = useMemo(() => {
    return Date.now() % SECTION_CYCLE
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection.value])

  // Offset for the progress-bar animation so it aligns with the shared cycle
  // (a screen opening mid-slot must start the bar partially filled, not at 0).
  // Computed once per featured.id so re-renders don't restart the animation.
  const progressDelayMs = useMemo(() => {
    if (!featured || reviews.length === 0) return 0
    const anchor = reviews[0].timestamp
    return Math.max(0, Date.now() - anchor) % CYCLE_INTERVAL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [featured?.id])

  const avgRating = reviews.length > 0
    ? Math.round((reviews.reduce((s, r) => s + r.rating, 0) / reviews.length) * 10) / 10
    : 0
  const fiveStarPct = reviews.length > 0
    ? Math.round((reviews.filter(r => r.rating === 5).length / reviews.length) * 100)
    : 0

  // Sidebar reviews: next 4 after featured
  const sideReviews = reviews.length > 1
    ? Array.from({ length: Math.min(4, reviews.length - 1) }, (_, i) =>
        reviews[(featuredIdx + i + 1) % reviews.length]
      )
    : []

  return (
    <div className="rv-root">
      {/* ── Animated background ── */}
      <div className="rv-bg">
        <div className="rv-bg-orb rv-bg-orb-1" />
        <div className="rv-bg-orb rv-bg-orb-2" />
        <div className="rv-bg-orb rv-bg-orb-3" />
        <div className="rv-bg-grid" />
      </div>

      {/* ── New review flash overlay ── */}
      {newFlash && <div className="rv-flash" />}

      {/* ── Top bar — only when there are reviews; hidden on welcome ── */}
      {reviews.length > 0 && (
        <header className="rv-header">
          <div className="rv-header-left">
            <div className="rv-logo">
              <span className="rv-logo-icon">★</span>
              <div>
                <div className="rv-logo-title">Expo Publicitas 2026</div>
                <div className="rv-logo-sub">Reseñas en vivo</div>
              </div>
            </div>
          </div>

          <div className="rv-header-stats">
            <div className="rv-stat">
              <div className="rv-stat-value">{reviews.length}</div>
              <div className="rv-stat-label">
                <span className="rv-live-dot" />
                Reseñas
              </div>
            </div>
            <div className="rv-stat-divider" />
            <div className="rv-stat">
              <div className="rv-stat-value">{avgRating || '–'}<span className="rv-stat-star">★</span></div>
              <div className="rv-stat-label">Promedio</div>
            </div>
            <div className="rv-stat-divider" />
            <div className="rv-stat">
              <div className="rv-stat-value">{fiveStarPct}<span className="rv-stat-pct">%</span></div>
              <div className="rv-stat-label">5 estrellas</div>
            </div>
          </div>
        </header>
      )}

      {/* ── Main content ── */}
      <div className="rv-main">
        {loading ? (
          <div className="rv-empty">
            <div className="rv-empty-icon">⏳</div>
            <div>Cargando reseñas...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="rv-welcome">
            <div className="rv-welcome-greeting">¡Bienvenidos!</div>
            <div className="rv-welcome-prompt">Conoce nuestra sección de</div>
            <div className="rv-welcome-section-wrap">
              <span
                className="rv-welcome-section"
                key={currentSection.value}
                style={{ color: currentSection.color }}
              >
                {currentSection.label}
              </span>
              <span
                className="rv-welcome-underline"
                key={`${currentSection.value}-u`}
                style={{
                  background: currentSection.color,
                  animationDelay: `-${sectionDelayMs}ms`,
                }}
              />
            </div>
            <div className="rv-welcome-dots">
              {SECTIONS.map((s, i) => (
                <span
                  key={s.value}
                  className="rv-welcome-dot"
                  style={{
                    background: i === sectionIdx ? s.color : '#e8e8ec',
                    width: i === sectionIdx ? 32 : 8,
                  }}
                />
              ))}
            </div>
            <div className="rv-welcome-hint">Cuéntanos tu experiencia al final del recorrido ✨</div>
          </div>
        ) : (
          <div className="rv-content">
            {/* ── Featured review (big card) ── */}
            <div className="rv-featured-wrap">
              {featured && (
                <div className="rv-featured rv-featured-in" key={featured.id}>
                  {/* Quote icon */}
                  <div className="rv-quote-mark">"</div>

                  {/* Stars */}
                  <div className="rv-featured-stars">
                    {[1, 2, 3, 4, 5].map(s => (
                      <span key={s} className={`rv-star ${s <= featured.rating ? 'rv-star-active' : ''}`}>★</span>
                    ))}
                  </div>

                  {/* Text */}
                  <p className="rv-featured-text">{featured.text}</p>

                  {/* Author */}
                  <div className="rv-featured-author">
                    <div className="rv-avatar rv-avatar-lg" style={{ background: featured.avatar }}>
                      {getInitials(featured.name)}
                    </div>
                    <div>
                      <div className="rv-author-name">{featured.name}</div>
                      {(featured.role || featured.company) && (
                        <div className="rv-author-role">
                          {[featured.role, featured.company].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                    <div className="rv-featured-time">{timeAgo(featured.timestamp)}</div>
                  </div>

                  {/* Progress bar */}
                  <div className="rv-progress-track">
                    <div
                      className="rv-progress-bar"
                      key={`${featured.id}-progress`}
                      style={{ animationDelay: `-${progressDelayMs}ms` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ── Side review list ── */}
            {sideReviews.length > 0 && (
              <div className="rv-side">
                <div className="rv-side-header">
                  <span className="rv-live-dot" />
                  Próximas reseñas
                </div>
                {sideReviews.map((r, i) => (
                  <div className="rv-side-card" key={r.id} style={{ animationDelay: `${i * 100}ms` }}>
                    <div className="rv-avatar rv-avatar-sm" style={{ background: r.avatar }}>
                      {getInitials(r.name)}
                    </div>
                    <div className="rv-side-info">
                      <div className="rv-side-name">{r.name}</div>
                      <div className="rv-side-stars">
                        {[1, 2, 3, 4, 5].map(s => (
                          <span key={s} className={s <= r.rating ? 'rv-mini-star-on' : 'rv-mini-star-off'}>★</span>
                        ))}
                      </div>
                      <div className="rv-side-text">{r.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Bottom ticker ── */}
      {reviews.length > 0 && (
        <div className="rv-ticker">
          <div className="rv-ticker-inner">
            {reviews.concat(reviews).map((r, i) => (
              <span key={`${r.id}-${i}`} className="rv-ticker-item">
                <span className="rv-ticker-stars">{'★'.repeat(r.rating)}</span>
                <span className="rv-ticker-name">{r.name}</span>
                <span className="rv-ticker-sep">—</span>
                <span className="rv-ticker-text">&ldquo;{r.text.slice(0, 60)}{r.text.length > 60 ? '...' : ''}&rdquo;</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ────────────────── STYLES ────────────────── */}
      <style>{`
        /* ── Reset & Root ── */
        .rv-root {
          position: fixed; inset: 0;
          background: #ffffff;
          color: #1a1a1a;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
          display: flex; flex-direction: column;
        }

        /* ── Animated background ── */
        .rv-bg {
          position: absolute; inset: 0; z-index: 0; overflow: hidden;
        }
        .rv-bg-orb {
          position: absolute; border-radius: 50%;
          filter: blur(120px);
        }
        .rv-bg-orb-1 {
          width: 640px; height: 640px; top: -220px; right: -120px;
          background: radial-gradient(circle, #F5821F 0%, transparent 70%);
          opacity: 0.18;
          animation: orbFloat1 12s ease-in-out infinite;
        }
        .rv-bg-orb-2 {
          width: 520px; height: 520px; bottom: -160px; left: -120px;
          background: radial-gradient(circle, #2BA9A0 0%, transparent 70%);
          opacity: 0.16;
          animation: orbFloat2 15s ease-in-out infinite;
        }
        .rv-bg-orb-3 {
          width: 420px; height: 420px; top: 40%; left: 50%;
          background: radial-gradient(circle, #3498db 0%, transparent 70%);
          opacity: 0.08;
          animation: orbFloat3 18s ease-in-out infinite;
        }
        .rv-bg-grid {
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(26,26,26,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(26,26,26,0.03) 1px, transparent 1px);
          background-size: 60px 60px;
        }

        @keyframes orbFloat1 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(-80px, 60px) scale(1.1); }
          66% { transform: translate(40px, -40px) scale(0.95); }
        }
        @keyframes orbFloat2 {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(60px, -50px) scale(0.9); }
          66% { transform: translate(-30px, 30px) scale(1.1); }
        }
        @keyframes orbFloat3 {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50% { transform: translate(-50%, -40px) scale(1.15); }
        }

        /* ── Flash overlay ── */
        .rv-flash {
          position: fixed; inset: 0; z-index: 50;
          background: radial-gradient(circle at center, rgba(245,130,31,0.18), transparent 70%);
          animation: flashPulse 1.2s ease-out forwards;
          pointer-events: none;
        }
        @keyframes flashPulse {
          0% { opacity: 0; }
          20% { opacity: 1; }
          100% { opacity: 0; }
        }

        /* ── Header ── */
        .rv-header {
          position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 40px;
          border-bottom: 1px solid #e8e8ec;
          backdrop-filter: blur(20px);
          background: rgba(255,255,255,0.8);
        }
        .rv-header-left { display: flex; align-items: center; gap: 16px; }
        .rv-logo { display: flex; align-items: center; gap: 12px; }
        .rv-logo-icon {
          width: 44px; height: 44px; border-radius: 12px;
          background: linear-gradient(135deg, #F5821F, #FF6B35);
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; color: #fff;
          box-shadow: 0 4px 16px rgba(245,130,31,0.35);
        }
        .rv-logo-title { font-size: 16px; font-weight: 800; letter-spacing: -0.02em; color: #1a1a1a; }
        .rv-logo-sub { font-size: 11px; color: #9b9bab; font-weight: 500; margin-top: 1px; }

        .rv-header-stats { display: flex; align-items: center; gap: 24px; }
        .rv-stat { text-align: center; }
        .rv-stat-value { font-size: 28px; font-weight: 800; letter-spacing: -0.03em; line-height: 1; color: #1a1a1a; }
        .rv-stat-star { color: #F5821F; font-size: 18px; margin-left: 2px; }
        .rv-stat-pct { font-size: 16px; font-weight: 600; color: #9b9bab; }
        .rv-stat-label {
          font-size: 11px; color: #9b9bab; font-weight: 500;
          text-transform: uppercase; letter-spacing: 0.06em; margin-top: 4px;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .rv-stat-divider { width: 1px; height: 32px; background: #e8e8ec; }

        .rv-live-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #2BA9A0;
          box-shadow: 0 0 8px rgba(43,169,160,0.5);
          animation: livePulse 1.5s ease infinite;
          display: inline-block;
        }
        @keyframes livePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.4; transform: scale(0.7); }
        }

        /* ── Main ── */
        .rv-main {
          flex: 1; position: relative; z-index: 10;
          display: flex; align-items: center; justify-content: center;
          padding: 24px 40px;
          overflow: hidden;
        }
        .rv-content {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 32px;
          width: 100%;
          max-width: 1200px;
          height: 100%;
          align-items: center;
        }

        /* ── Loading state ── */
        .rv-empty {
          text-align: center; display: flex; flex-direction: column;
          align-items: center; gap: 12px;
          color: #6b6b7b; font-size: 18px;
        }
        .rv-empty-icon { font-size: 56px; animation: emojiBob 2s ease-in-out infinite; }
        .rv-empty-hint { font-size: 14px; color: #9b9bab; }
        @keyframes emojiBob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        /* ── Welcome (no reviews yet) ── */
        .rv-welcome {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; max-width: 900px; padding: 0 24px;
          animation: welcomeFadeIn 0.8s ease-out;
        }
        @keyframes welcomeFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .rv-welcome-greeting {
          font-size: clamp(56px, 9vw, 96px);
          font-weight: 800; letter-spacing: -0.045em; line-height: 1;
          background: linear-gradient(135deg, #1a1a1a 0%, #4a4a5a 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          margin-bottom: 28px;
        }
        .rv-welcome-prompt {
          font-size: clamp(18px, 2.2vw, 24px); font-weight: 500;
          color: #6b6b7b;
          margin-bottom: 18px;
          letter-spacing: -0.005em;
        }
        .rv-welcome-section-wrap {
          position: relative; display: inline-flex;
          flex-direction: column; align-items: center;
          min-height: clamp(72px, 11vw, 120px);
        }
        .rv-welcome-section {
          font-size: clamp(56px, 9vw, 104px);
          font-weight: 800; letter-spacing: -0.045em; line-height: 1.05;
          animation: sectionIn 0.55s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          display: inline-block;
        }
        @keyframes sectionIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); filter: blur(8px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        .rv-welcome-underline {
          display: block; height: 4px; width: 64%; border-radius: 999px;
          margin-top: 14px;
          transform-origin: left center;
          animation: underlineGrow ${SECTION_CYCLE}ms linear forwards;
          opacity: 0.85;
        }
        @keyframes underlineGrow {
          from { transform: scaleX(0); }
          to { transform: scaleX(1); }
        }
        .rv-welcome-dots {
          display: flex; gap: 8px; margin-top: 36px;
        }
        .rv-welcome-dot {
          height: 8px; border-radius: 999px;
          transition: width 0.45s cubic-bezier(0.16, 1, 0.3, 1),
                      background 0.45s ease;
        }
        .rv-welcome-hint {
          font-size: 15px; color: #9b9bab; font-weight: 500;
          margin-top: 28px; letter-spacing: -0.005em;
        }

        /* ── Featured review ── */
        .rv-featured-wrap {
          display: flex; align-items: center; justify-content: center;
          perspective: 1000px;
        }
        .rv-featured {
          position: relative;
          background: #ffffff;
          border: 1px solid #e8e8ec;
          border-radius: 24px;
          padding: 48px;
          max-width: 700px;
          width: 100%;
          box-shadow: 0 8px 32px rgba(26, 26, 26, 0.05);
        }
        .rv-featured-in {
          animation: featuredIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes featuredIn {
          from { opacity: 0; transform: translateY(30px) scale(0.96); filter: blur(6px); }
          to { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }

        .rv-quote-mark {
          font-size: 100px; font-weight: 900; line-height: 0.6;
          background: linear-gradient(135deg, #F5821F, #FF6B35);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
          opacity: 0.18; position: absolute; top: 24px; left: 36px;
          font-family: Georgia, serif;
        }

        .rv-featured-stars { display: flex; gap: 4px; margin-bottom: 20px; }
        .rv-star { font-size: 22px; color: #e8e8ec; transition: color 0.3s; }
        .rv-star-active { color: #F5821F; text-shadow: 0 0 12px rgba(245,130,31,0.35); }

        .rv-featured-text {
          font-size: 24px; font-weight: 500; line-height: 1.6;
          color: #1a1a1a;
          margin: 0 0 32px;
          letter-spacing: -0.01em;
        }

        .rv-featured-author {
          display: flex; align-items: center; gap: 14px;
          position: relative;
        }
        .rv-avatar {
          border-radius: 14px; display: flex; align-items: center;
          justify-content: center; color: #fff; font-weight: 700;
          flex-shrink: 0; letter-spacing: -0.02em;
        }
        .rv-avatar-lg { width: 52px; height: 52px; font-size: 18px; }
        .rv-avatar-sm { width: 36px; height: 36px; font-size: 12px; border-radius: 10px; }

        .rv-author-name { font-size: 16px; font-weight: 700; color: #1a1a1a; }
        .rv-author-role { font-size: 13px; color: #6b6b7b; margin-top: 2px; }

        .rv-featured-time {
          margin-left: auto; font-size: 12px;
          color: #6b6b7b; font-weight: 500;
          background: #f8f8fa; padding: 4px 12px;
          border-radius: 8px;
          border: 1px solid #e8e8ec;
        }

        /* Progress bar */
        .rv-progress-track {
          position: absolute; bottom: 0; left: 0; right: 0;
          height: 3px; background: #f0f0f4;
          border-radius: 0 0 24px 24px; overflow: hidden;
        }
        .rv-progress-bar {
          height: 100%; background: linear-gradient(90deg, #F5821F, #FF6B35);
          border-radius: 3px;
          animation: progressFill ${CYCLE_INTERVAL}ms linear forwards;
        }
        @keyframes progressFill {
          from { width: 0; }
          to { width: 100%; }
        }

        /* ── Side list ── */
        .rv-side {
          display: flex; flex-direction: column; gap: 12px;
          height: 100%; justify-content: center;
        }
        .rv-side-header {
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: #9b9bab;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 4px;
        }
        .rv-side-card {
          display: flex; gap: 12px; padding: 16px;
          background: #ffffff;
          border: 1px solid #e8e8ec;
          border-radius: 14px;
          transition: all 0.3s ease;
          animation: sideSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
          box-shadow: 0 1px 4px rgba(26,26,26,0.025);
        }
        .rv-side-card:hover {
          background: #fafafa;
          border-color: rgba(245,130,31,0.25);
          transform: translateX(-4px);
          box-shadow: 0 4px 14px rgba(245,130,31,0.08);
        }
        @keyframes sideSlideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .rv-side-info { flex: 1; min-width: 0; }
        .rv-side-name { font-size: 13px; font-weight: 600; margin-bottom: 3px; color: #1a1a1a; }
        .rv-side-stars { font-size: 11px; margin-bottom: 6px; }
        .rv-mini-star-on { color: #F5821F; }
        .rv-mini-star-off { color: #e8e8ec; }
        .rv-side-text {
          font-size: 12px; color: #6b6b7b;
          line-height: 1.5; display: -webkit-box;
          -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
        }

        /* ── Bottom ticker ── */
        .rv-ticker {
          position: relative; z-index: 10;
          border-top: 1px solid #e8e8ec;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(20px);
          padding: 12px 0;
          overflow: hidden;
        }
        .rv-ticker-inner {
          display: flex; gap: 48px;
          white-space: nowrap;
          animation: tickerScroll 40s linear infinite;
        }
        .rv-ticker-item {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 13px; color: #9b9bab;
          flex-shrink: 0;
        }
        .rv-ticker-stars { color: #F5821F; font-size: 11px; }
        .rv-ticker-name { font-weight: 600; color: #6b6b7b; }
        .rv-ticker-sep { color: #d0d0d8; }
        .rv-ticker-text { font-style: italic; }

        @keyframes tickerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* ── Responsive ── */
        @media (max-width: 900px) {
          .rv-content { grid-template-columns: 1fr; }
          .rv-side { display: none; }
          .rv-featured { padding: 32px; }
          .rv-featured-text { font-size: 20px; }
          .rv-header { padding: 16px 20px; }
          .rv-main { padding: 16px 20px; }
          .rv-header-stats { gap: 16px; }
          .rv-stat-value { font-size: 22px; }
        }
      `}</style>
    </div>
  )
}

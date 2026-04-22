import { useEffect, useState } from 'react'
import './App.css'
import PremiumScreen from './PremiumScreen'

const DEV_PREVIEW = import.meta.env.DEV && false   // flip to `true` locally to preview mock data
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'

type Insight = { topic: string; status: string }
type Keyword = { word: string; count: number; sentiment: 'positive' | 'negative' | 'neutral' }

type Analysis = {
  asin?: string
  productKeyword?: string
  title?: string
  brand?: string | null
  price?: string | number | null
  rating?: string | number | null
  reviewCount?: number | null
  overallScore?: number
  reviewIntegrity?: {
    score?: number
    label?: string
    verifiedPurchaseRatio?: number
    sentimentConsistencyRatio?: number
    flags?: Record<string, boolean>
    commonKeywords?: Keyword[]
  }
  brandReputation?: {
    score?: number
    label?: string
    insights?: Insight[]
    reviewsAnalyzed?: number
    commonKeywords?: Keyword[]
  }
  similarProducts?: {
    title?: string
    asin?: string
    brand?: string
    rating?: string | number
    reviewCount?: number
    price?: string
    isPrime?: boolean
    image?: string
    amazonUrl?: string
  }[]
  aiAnalysis?: {
    pros?: string[]
    cons?: string[]
    verdict?: string
    recommendation?: 'BUY' | 'COMPARE' | 'SKIP'
  }
  raw?: {
    reviews?: { rating?: number; body?: string }[]
  }
}

const mockAnalysis: Analysis = {
  title: "Hydro Flask 32 oz Water Bottle",
  brand: "Hydro Flask",
  price: "$44.95",
  rating: 4.7,
  reviewCount: 12000,
  overallScore: 84,
  reviewIntegrity: {
    score: 82,
    label: "Mostly authentic",
    verifiedPurchaseRatio: 0.78,
    sentimentConsistencyRatio: 0.81,
    commonKeywords: [
      { word: "durable", count: 120, sentiment: "positive" },
      { word: "expensive", count: 45, sentiment: "negative" },
      { word: "insulated", count: 90, sentiment: "positive" },
    ],
  },
  brandReputation: {
    score: 76,
    label: "Generally positive",
    reviewsAnalyzed: 500,
    insights: [
      { topic: "Quality", status: "Strong" },
      { topic: "Price", status: "Mixed" },
    ],
    commonKeywords: [
      { word: "premium", count: 60, sentiment: "positive" },
      { word: "overpriced", count: 30, sentiment: "negative" },
    ],
  },
  similarProducts: [
    { title: "Stanley Quencher Tumbler", price: "$35.00", rating: 4.6, image: "", amazonUrl: "https://amazon.com" },
    { title: "Simple Modern Water Bottle", price: "$25.00", rating: 4.5, image: "", amazonUrl: "https://amazon.com" },
  ],
  aiAnalysis: {
    pros: ["Great insulation", "Durable build", "Trusted brand"],
    cons: ["Higher price", "Can dent if dropped"],
    verdict: "Excellent bottle but slightly overpriced compared to competitors.",
    recommendation: "COMPARE",
  },
}

// ─── Skeleton components ──────────────────────────────────────────────────────

function SkeletonLine({ width = '100%', height = 14, mb = 8 }: { width?: string; height?: number; mb?: number }) {
  return <div className="skeleton" style={{ width, height, borderRadius: 8, marginBottom: mb }} />
}

function SkeletonCard({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <section className="section-card">
      <h3>{title}</h3>
      {children ?? (
        <>
          <SkeletonLine width="80%" />
          <SkeletonLine width="60%" />
          <SkeletonLine width="70%" />
        </>
      )}
    </section>
  )
}

function SkeletonResults() {
  return (
    <>
      <SkeletonCard title="Overall Score">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
          <SkeletonLine width="80px" height={48} mb={0} />
          <SkeletonLine width="32px" height={16} mb={0} />
        </div>
        <SkeletonLine width="100%" height={8} />
      </SkeletonCard>

      <SkeletonCard title="Product">
        <SkeletonLine width="85%" />
        <SkeletonLine width="50%" />
        <SkeletonLine width="40%" />
        <SkeletonLine width="30%" />
        <SkeletonLine width="55%" />
      </SkeletonCard>

      <SkeletonCard title="AI Analysis">
        <SkeletonLine width="90%" height={52} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 4 }}>
          <div>
            <SkeletonLine width="100%" height={36} />
            <SkeletonLine width="100%" height={36} />
          </div>
          <div>
            <SkeletonLine width="100%" height={36} />
            <SkeletonLine width="100%" height={36} />
          </div>
        </div>
      </SkeletonCard>

      <SkeletonCard title="Review Integrity">
        <SkeletonLine width="100%" height={8} />
        <SkeletonLine width="65%" mb={4} />
        <SkeletonLine width="55%" mb={4} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
          {[72, 90, 64, 80].map((w, i) => (
            <SkeletonLine key={i} width={`${w}px`} height={24} mb={0} />
          ))}
        </div>
      </SkeletonCard>

      <SkeletonCard title="Brand Reputation">
        <SkeletonLine width="100%" height={8} />
        <SkeletonLine width="70%" mb={4} />
        <SkeletonLine width="45%" />
      </SkeletonCard>

      <SkeletonCard title="Similar Products">
        <div style={{ display: 'flex', gap: 12, overflow: 'hidden' }}>
          {[0, 1, 2].map(i => (
            <div key={i} style={{ minWidth: 160, flexShrink: 0 }}>
              <SkeletonLine width="160px" height={110} />
              <SkeletonLine width="90%" height={12} mb={4} />
              <SkeletonLine width="60%" height={12} mb={4} />
              <SkeletonLine width="40%" height={12} />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </>
  )
}

// ─── SVG placeholder for missing product images ───────────────────────────────

function ProductImagePlaceholder() {
  return (
    <svg
      viewBox="0 0 110 110"
      className="similar-card-image"
      xmlns="http://www.w3.org/2000/svg"
      style={{ background: '#f8f7f5' }}
    >
      <rect width="110" height="110" fill="#f3ede8" rx="12" />
      {/* box outline */}
      <rect x="28" y="30" width="54" height="42" rx="5" fill="none" stroke="#d6cbc3" strokeWidth="2.5" />
      {/* mountain / image icon */}
      <polyline points="28,60 43,44 55,55 67,43 82,60" fill="none" stroke="#d6cbc3" strokeWidth="2.5" strokeLinejoin="round" />
      {/* sun dot */}
      <circle cx="43" cy="42" r="4" fill="#d6cbc3" />
    </svg>
  )
}

// ─── Utility components ───────────────────────────────────────────────────────

function MetricBar({ label, value }: { label: string; value?: number }) {
  const safeValue = Math.max(0, Math.min(100, value ?? 0))
  return (
    <div className="metric">
      <div className="metric-top">
        <span>{label}</span>
        <span>{safeValue}/100</span>
      </div>
      <div className="metric-track">
        <div className="metric-fill" style={{ width: `${safeValue}%` }} />
      </div>
    </div>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="section-card">
      <h3>{title}</h3>
      {children}
    </section>
  )
}

function KeywordPills({
  keywords,
  emptyMessage,
}: {
  keywords?: Keyword[]
  emptyMessage: string
}) {
  if (!keywords?.length) return <p className="body-text muted">{emptyMessage}</p>
  return (
    <div className="keyword-pills">
      {keywords.map((kw) => (
        <span key={kw.word} className={`keyword-pill keyword-pill--${kw.sentiment}`}>
          {kw.word} <em>×{kw.count}</em>
        </span>
      ))}
    </div>
  )
}

function ScoreExplainer({
  metric,
  analysis,
}: {
  metric: 'review_integrity' | 'brand_reputation'
  analysis: Analysis | null
}) {
  const [loading, setLoading] = useState(false)
  const [answer, setAnswer] = useState('')
  const [error, setError] = useState('')

  const handleExplain = async () => {
    if (!analysis) return
    try {
      setLoading(true)
      setError('')
      // Strip raw reviews before sending — they're large and the endpoint doesn't need them
      const { raw: _raw, ...safeAnalysis } = analysis
      const response = await fetch(`${API_BASE}/explain-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metric, analysis: safeAnalysis }),
      })
      const data = await response.json()
      if (!response.ok) {
        setError(typeof data.detail === 'string' ? data.detail : 'Could not explain this score.')
        return
      }
      setAnswer(data.answer ?? 'No explanation returned.')
    } catch {
      setError('Could not explain this score right now.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="score-explainer">
      <button className="why-score-btn" onClick={handleExplain} disabled={loading || !analysis}>
        {loading ? 'Explaining...' : 'Why this score'}
      </button>
      {error ? <p className="body-text status-error explain-text">{error}</p> : null}
      {answer ? <div className="explain-box"><p className="body-text explain-text">{answer}</p></div> : null}
    </div>
  )
}

function VerdictCard({ ai }: { ai: NonNullable<Analysis['aiAnalysis']> }) {
  const rec = ai.recommendation ?? 'COMPARE'
  const colorMap = {
    BUY: { bg: '#dcfce7', border: '#86efac', badge: '#16a34a' },
    COMPARE: { bg: '#fef9c3', border: '#fde047', badge: '#ca8a04' },
    SKIP: { bg: '#fee2e2', border: '#fca5a5', badge: '#dc2626' },
  }
  const c = colorMap[rec]
  return (
    <section className="section-card">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <h3 style={{ margin: 0 }}>AI Analysis</h3>
        <span style={{ background: c.badge, color: '#fff', fontWeight: 800, fontSize: 12, letterSpacing: '0.1em', padding: '4px 12px', borderRadius: 999 }}>
          {rec}
        </span>
      </div>
      <p style={{ margin: '0 0 14px', fontSize: 13, color: '#444', lineHeight: 1.5, background: c.bg, border: `1px solid ${c.border}`, borderRadius: 10, padding: '8px 12px' }}>
        {ai.verdict}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#15803d', letterSpacing: '0.08em' }}>✦ PROS</p>
          {(ai.pros ?? []).map((pro, i) => (
            <p key={i} style={{ margin: '0 0 5px', fontSize: 12, color: '#1e1e1e', lineHeight: 1.4, padding: '6px 8px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>{pro}</p>
          ))}
        </div>
        <div>
          <p style={{ margin: '0 0 6px', fontSize: 11, fontWeight: 700, color: '#dc2626', letterSpacing: '0.08em' }}>✦ CONS</p>
          {(ai.cons ?? []).map((con, i) => (
            <p key={i} style={{ margin: '0 0 5px', fontSize: 12, color: '#1e1e1e', lineHeight: 1.4, padding: '6px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8 }}>{con}</p>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('Loading...')
  const [backendStatus, setBackendStatus] = useState('Ready to scan')
  const [analysis, setAnalysis] = useState<Analysis | null>(DEV_PREVIEW ? mockAnalysis : null)
  const [view, setView] = useState<'home' | 'premium'>('home')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasScanned, setHasScanned] = useState<boolean>(DEV_PREVIEW)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      setCurrentUrl(tabs[0]?.url ?? 'No active tab found')
    })
  }, [])

  const handleScan = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0]?.url ?? ''
      setCurrentUrl(url || 'No active tab found')

      // ── Non-Amazon guard ───────────────────────────────────────────────
      const isAmazon = /amazon\.(com|co\.|ca|com\.au|de|fr|es|it|nl|pl|se|sg|ae)/i.test(url)
      if (!isAmazon) {
        const msg = url
          ? "Navigate to an Amazon product page, then click Scan."
          : "No active tab found. Open an Amazon product page first."
        setError(msg)
        setBackendStatus(msg)
        return
      }

      if (!url) {
        setError('No URL available to send.')
        return
      }

      try {
        setLoading(true)
        setError('')
        setAnalysis(null)
        setBackendStatus('Analyzing product...')

        const response = await fetch(`${API_BASE}/current-url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url }),
        })

        const data = await response.json()

        if (!response.ok) {
          const msg = typeof data.detail === 'string' ? data.detail : 'Request failed.'
          setBackendStatus(msg)
          setError(msg)
          return
        }

        setAnalysis(data.analysis ?? null)
        setBackendStatus('Analysis complete')
        setHasScanned(true)
      } catch {
        const msg = 'Scan failed. Is the server running?'
        setBackendStatus(msg)
        setError(msg)
      } finally {
        setLoading(false)
      }
    })
  }

  if (view === 'premium') return (
    <main className="app-shell">
      <div className="popup-shell">
        <PremiumScreen onBack={() => setView('home')} />
      </div>
    </main>
  )

  return (
    <main className="app-shell">
      <div className="popup-shell">
        <header className="top-header">
          <div className="brand-row">
            <img src="/icons/logo.png" alt="Nectar logo" className="brand-logo" />
            <div className="brand-block">
              <h1>Nectar</h1>
              <p>AMAZON PRODUCT ANALYZER</p>
            </div>
          </div>
          <button className="premium-btn" onClick={() => setView('premium')}>Go Premium</button>
        </header>

        <div className="content">
          <SectionCard title="Product Analysis">
            <p className={`body-text ${error ? 'status-error' : 'status-ok'}`}>
              {error || backendStatus}
            </p>
            <button className="scan-btn" onClick={handleScan} disabled={loading}>
              {loading ? 'Scanning...' : 'Scan Product'}
            </button>
          </SectionCard>

          {/* Show skeletons while a scan is in flight */}
          {loading && <SkeletonResults />}

          {/* Show real results once loaded */}
          {!loading && hasScanned && analysis && (
            <>
              <SectionCard title="Overall Score">
                <div className="score-row">
                  <span className="score-number">{analysis.overallScore ?? '--'}</span>
                  <span className="score-max">/100</span>
                </div>
                <MetricBar label="Trust Score" value={analysis.overallScore} />
              </SectionCard>

              <SectionCard title="Product">
                <div className="info-list">
                  <p><strong>Title:</strong> {analysis.title ?? 'N/A'}</p>
                  <p><strong>Brand:</strong> {analysis.brand ?? 'N/A'}</p>
                  <p><strong>Price:</strong> {analysis.price ?? 'N/A'}</p>
                  <p><strong>Rating:</strong> {analysis.rating ?? 'N/A'}</p>
                  <p><strong>Review Count:</strong> {analysis.reviewCount ?? 'N/A'}</p>
                </div>
              </SectionCard>

              {analysis.aiAnalysis && <VerdictCard ai={analysis.aiAnalysis} />}

              <SectionCard title="Review Integrity">
                <div className="mini-score">
                  <span>Score</span>
                  <strong>{analysis.reviewIntegrity?.score ?? 'N/A'}</strong>
                </div>
                <MetricBar label="Review Integrity" value={analysis.reviewIntegrity?.score} />
                <div className="info-list">
                  <p><strong>Label:</strong> {analysis.reviewIntegrity?.label ?? 'N/A'}</p>
                  <p><strong>Verified Purchase Ratio:</strong> {analysis.reviewIntegrity?.verifiedPurchaseRatio ?? 'N/A'}</p>
                  <p><strong>Sentiment Consistency:</strong> {analysis.reviewIntegrity?.sentimentConsistencyRatio ?? 'N/A'}</p>
                  <p className="keywords-label"><strong>Top Keywords:</strong></p>
                  <KeywordPills keywords={analysis.reviewIntegrity?.commonKeywords} emptyMessage="No keywords found" />
                </div>
                <ScoreExplainer metric="review_integrity" analysis={analysis} />
              </SectionCard>

              <SectionCard title="Brand Reputation">
                <div className="mini-score">
                  <span>Score</span>
                  <strong>{analysis.brandReputation?.score ?? 'N/A'}</strong>
                </div>
                <MetricBar label="Brand Reputation" value={analysis.brandReputation?.score} />
                <div className="info-list">
                  <p><strong>Label:</strong> {analysis.brandReputation?.label ?? 'N/A'}</p>
                  <p><strong>Reviews Analyzed:</strong> {analysis.brandReputation?.reviewsAnalyzed ?? 'N/A'}</p>
                </div>
                {analysis.brandReputation?.insights?.length ? (
                  <div className="insight-list">
                    {analysis.brandReputation.insights.map((insight) => (
                      <div key={insight.topic} className="insight-pill">
                        <span>{insight.topic}</span>
                        <strong>{insight.status}</strong>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="body-text muted">No brand insights yet.</p>
                )}
                <p className="keywords-label"><strong>Top Keywords:</strong></p>
                <KeywordPills keywords={analysis.brandReputation?.commonKeywords} emptyMessage="No keywords found" />
                <ScoreExplainer metric="brand_reputation" analysis={analysis} />
              </SectionCard>

              <SectionCard title="Similar Products">
                {(analysis.similarProducts?.length ?? 0) > 0 ? (
                  <div className="similar-scroll">
                    {analysis.similarProducts?.map((product, i) => (
                      <a
                        key={product.asin ?? i}
                        href={product.amazonUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="similar-card"
                      >
                        {product.image
                          ? <img src={product.image} alt={product.title ?? 'Product'} className="similar-card-image" />
                          : <ProductImagePlaceholder />
                        }
                        <p className="similar-card-title">{product.title ?? 'Untitled Product'}</p>
                        <p className="similar-card-brand">{product.brand ?? 'Unknown brand'}</p>
                        <p className="similar-card-price">{product.price ?? 'No price'}</p>
                        <p className="similar-card-rating">⭐ {product.rating ?? 'N/A'}</p>
                        {product.isPrime && <p className="similar-card-prime">Prime</p>}
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="body-text muted">No similar products found.</p>
                )}
              </SectionCard>
            </>
          )}
        </div>
      </div>
    </main>
  )
}
interface Props {
  onBack: () => void
}

const plans = [
  {
    name: 'FREE',
    price: '$0',
    period: '/mo',
    desc: 'For casual shoppers',
    features: [
      '50 scans per month',
      'Full product analysis',
      'Review Integrity score',
      'Brand Reputation score',
      'Similar product suggestions',
      'One product scan at a time',
    ],
    highlight: false,
    cta: 'Current Plan',
  },
  {
    name: 'PRO',
    price: '$19.99',
    period: '/mo',
    desc: 'For e-commerce & dropshippers',
    features: [
      'Everything in Free',
      '1,500 scans per month',
      'AI-powered pro/con analysis',
      'Deep sentiment analysis',
      'Bulk analysis (up to 50 at once)',
      'Side-by-side product comparison',
      'Search by keyword and URL',
      'Analysis history database',
    ],
    highlight: true,
    cta: 'Upgrade to Pro',
  },
  {
    name: 'BUSINESS',
    price: '$149.99',
    period: '/mo',
    desc: 'For retailers & agencies',
    features: [
      'Everything in Pro',
      '20,000+ scans per month',
      'Reputation trend forecasting',
      'Multi-platform analysis',
      'Demographic & geographic sentiment',
      'Bulk analysis (up to 2,000 at once)',
      'Custom white-label reports',
      'Price and sentiment change alerts',
      'Audit logs'
    ],
    highlight: false,
    cta: 'Upgrade to Business',
  },
]

export default function PremiumScreen({ onBack }: Props) {
  return (
    <>
      {/* Reuse the same sticky header as the home page */}
      <header className="top-header">
        <div className="brand-row">
          <img src="/icons/logo.png" alt="Nectar logo" className="brand-logo" />
          <div className="brand-block">
            <h1>Nectar</h1>
            <p>AMAZON PRODUCT ANALYZER</p>
          </div>
        </div>
        <button className="premium-btn" onClick={onBack}>← Back</button>
      </header>

      {/* Scrollable content area — same as home page */}
      <div className="content">

        {/* Heading */}
        <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
          <p style={{ margin: 0, fontSize: 20, fontWeight: 800, color: '#202020', letterSpacing: '-0.01em' }}>
            Choose Your Plan
          </p>
          <p style={{ margin: '4px 0 0', fontSize: 12, color: '#78716c' }}>
            Unlock the full power of Nectar
          </p>
        </div>

        {/* Plan cards */}
        {plans.map((plan) => (
          <div
            key={plan.name}
            className="section-card"
            style={{
              background: plan.highlight ? '#f97316' : '#f1f1ee',
              border: plan.highlight ? 'none' : '1px solid #e0dfdb',
              position: 'relative',
            }}
          >
            {/* POPULAR badge */}
            {plan.highlight && (
              <div style={{
                position: 'absolute',
                top: -11,
                right: 14,
                background: '#fff',
                color: '#f97316',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.15em',
                padding: '3px 10px',
                borderRadius: 999,
                boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
              }}>
                POPULAR
              </div>
            )}

            {/* Plan name + price row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
              <div>
                <p style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 800,
                  letterSpacing: '0.2em',
                  color: plan.highlight ? '#fff' : '#78716c',
                }}>
                  {plan.name}
                </p>
                <p style={{
                  margin: '3px 0 0',
                  fontSize: 11,
                  color: plan.highlight ? 'rgba(255,255,255,0.8)' : '#78716c',
                }}>
                  {plan.desc}
                </p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: plan.highlight ? '#fff' : '#1e1e1e' }}>
                  {plan.price}
                </span>
                <span style={{ fontSize: 11, color: plan.highlight ? 'rgba(255,255,255,0.75)' : '#78716c' }}>
                  {plan.period}
                </span>
              </div>
            </div>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
              {plan.features.map((f) => (
                <p key={f} style={{
                  margin: 0,
                  fontSize: 12,
                  color: plan.highlight ? 'rgba(255,255,255,0.92)' : '#333',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}>
                  <span style={{ color: plan.highlight ? '#fff' : '#f97316', fontSize: 10 }}>✦</span>
                  {f}
                </p>
              ))}
            </div>

            {/* CTA button */}
            <button style={{
              width: '100%',
              padding: '10px',
              borderRadius: 12,
              border: plan.highlight ? 'none' : '1px solid #f97316',
              background: plan.highlight ? 'rgba(0,0,0,0.15)' : 'transparent',
              color: plan.highlight ? '#fff' : '#f97316',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.04em',
              cursor: 'pointer',
              fontFamily: 'Epilogue, sans-serif',
            }}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </>
  )
}
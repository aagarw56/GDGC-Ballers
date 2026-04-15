import { useEffect, useState } from 'react'
import './App.css'
import React from 'react'

type Analysis = {
  productKeyword?: string
  asin?: string
  title?: string
  price?: string | number | null
  rating?: string | number | null
  reviewCount?: number | null
  brand?: string | null
}

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('Loading...')
  const [backendStatus, setBackendStatus] = useState('Waiting for backend...')
  const [analysis, setAnalysis] = useState<Analysis | null>(null)

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0]?.url ?? ''
      setCurrentUrl(url || 'No active tab URL found')

      if (!url) {
        setBackendStatus('No URL available to send.')
        return
      }

      try {
        const response = await fetch('http://127.0.0.1:8000/current-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ url }),
        })

        const data = await response.json()
        console.log('Backend response:', data)

        if (!response.ok) {
          const errorMessage =
            typeof data.detail === 'string' ? data.detail : 'Backend request failed.'
          setBackendStatus(errorMessage)
          return
        }

        setAnalysis(data.analysis ?? null)
        setBackendStatus(`Sent to backend: ${data.ok ? 'success' : 'failed'}`)
      } catch (error) {
        console.error('Failed to send URL:', error)
        setBackendStatus('Backend request failed. Is FastAPI running on port 8000?')
      }
    })
  }, [])

  return (
    <div className="container">
      <div className="header">
        <div>
          <h2>Nectar</h2>
          <p className="subtitle">PRODUCT ANALYZER</p>
        </div>
        <button className="premium">Go Premium</button>
      </div>

      <div className="card">
        <h3>Premium</h3>
        <h1>{analysis?.rating ? `${analysis.rating} / 5` : 'Waiting...'}</h1>
      </div>

      <div className="card">
        <h3>Current Page</h3>
        <p className="desc">{currentUrl}</p>
      </div>

      <div className="card">
        <h3>Backend Status</h3>
        <p className="desc">{backendStatus}</p>
      </div>

      <div className="card">
        <h3>Product Match</h3>
        <p className="desc">Keyword: {analysis?.productKeyword ?? 'Not detected yet'}</p>
        <p className="desc">ASIN: {analysis?.asin ?? 'Not found yet'}</p>
        <p className="desc">Title: {analysis?.title ?? 'Waiting for Canopy...'}</p>
        <p className="desc">Brand: {analysis?.brand ?? 'Waiting for Canopy...'}</p>
        <p className="desc">Price: {analysis?.price ?? 'Waiting for Canopy...'}</p>
        <p className="desc">
          Reviews: {analysis?.reviewCount != null ? analysis.reviewCount : 'Waiting for Canopy...'}
        </p>
      </div>
    </div>
  )
}

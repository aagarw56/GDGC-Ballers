import { useEffect, useState } from 'react'
import './App.css'

export default function App() {
  const [currentUrl, setCurrentUrl] = useState('Loading...')

  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const url = tabs[0]?.url ?? ''
      setCurrentUrl(url || 'No active tab URL found')

      if (!url) return

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
      } catch (error) {
        console.error('Failed to send URL:', error)
      }
    })
  }, [])

  return <div>{currentUrl}</div>
}

  return (
    <div className = "container">
      {/* Header */}
      <div className = "header">
        <div>
          <h2>Nectar</h2>
          <p className = "subtitle">PRODUCT ANALYZER</p>
        </div>
        <button className = "premium">Go Premium</button>
      </div>
      {/*Premium Score Card */}
      <div className = "card">
        <h3>Premium</h3>
        <h1>9.2 / 10</h1>
      </div>
        {/*Review Integrity*/}
        <div className = "card">
          <h3>Review Integrity</h3>
          <div className = "progress">
            <div className = "progress-fill"></div>
          </div>
          <p className = "desc">
            Most reviews appear organic and verified.
          </p>
        </div>
        <div className = "card">
          <h3>Reputation Insights</h3>
          
        </div>
    </div>
  );
}

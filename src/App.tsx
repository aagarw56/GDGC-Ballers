import './App.css'

export default function App() {

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

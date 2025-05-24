import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom'
import './App.css'
import { Login } from './components/Login'
import { Zettelkasten } from './components/Zettelkasten'
import { TextAnalysis } from './components/TextAnalysis'
import { LiveTextEditor } from './components/LiveTextEditor'

function App() {
  const user = localStorage.getItem('user');

  return (
    <Router>
      <div className="app-container">
        {user && (
          <nav className="app-nav">
            <div className="nav-brand">
              <h2>InfraSyncus</h2>
              <span className="tagline">100% InfraNodus Alternative</span>
            </div>
            <div className="nav-links">
              <Link to="/zettelkasten" className="nav-link">Zettelkasten</Link>
              <Link to="/text-analysis" className="nav-link">Text Analysis</Link>
              <Link to="/live-editor" className="nav-link">Live Editor</Link>
              <button 
                className="logout-button"
                onClick={() => {
                  localStorage.removeItem('user');
                  window.location.reload();
                }}
              >
                Logout
              </button>
            </div>
          </nav>
        )}
        
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/zettelkasten" element={<Zettelkasten />} />
            <Route path="/text-analysis" element={<TextAnalysis />} />
            <Route path="/live-editor" element={<LiveTextEditor />} />
            <Route path="/" element={
              user ? <Navigate to="/live-editor" /> : <Navigate to="/login" />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App 
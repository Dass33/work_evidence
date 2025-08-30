import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import WorkForm from './pages/WorkForm'
import AdminView from './pages/AdminView'
import Header from './components/Header'

function App() {
  const { t } = useTranslation()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    const userData = localStorage.getItem('user')
    
    if (token && userData) {
      setUser(JSON.parse(userData))
    }
    setLoading(false)
  }, [])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
  }

  if (loading) {
    return <div className="flex justify-center items-center h-screen">{t('loading')}</div>
  }

  return (
    <Router basename="/work_evidence">
      <div className="min-h-screen bg-gray-100">
        {user && <Header user={user} onLogout={logout} />}
        
        <main className="container mx-auto px-4 py-3 sm:py-6">
          <Routes>
            <Route 
              path="/login" 
              element={!user ? <Login setUser={setUser} /> : <Navigate to={user?.role === 'admin' ? '/admin' : '/'} />} 
            />
            <Route 
              path="/" 
              element={user ? (user.role === 'admin' ? <Navigate to="/admin" /> : <Dashboard user={user} />) : <Navigate to="/login" />} 
            />
            <Route 
              path="/work-form" 
              element={user ? <WorkForm user={user} /> : <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={user?.role === 'admin' ? <AdminView /> : <Navigate to="/" />} 
            />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

function Dashboard({ user }) {
  const { t } = useTranslation()
  const [workEntries, setWorkEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchWorkEntries()
  }, [])

  const fetchWorkEntries = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/work-entries', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setWorkEntries(data)
      } else {
        setError('Failed to fetch work entries')
      }
    } catch (error) {
      console.error('Error fetching work entries:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 mt-4 space-y-3 sm:space-y-0">
        <Link
          to="/work-form"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 sm:py-2 px-6 sm:px-4 rounded text-base sm:text-sm w-full sm:w-auto text-center transition-colors"
        >
          {t('addWorkEntry')}
        </Link>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-md">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">{t('workEntries')}</h2>
        </div>

        {workEntries.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
            No work entries found. <Link to="/work-form" className="text-blue-500 underline">Add your first entry</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {workEntries.map((entry) => (
              <div key={entry.id} className="px-4 sm:px-6 py-4">
                <div className="flex flex-col space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                    <span className="font-semibold text-gray-900 text-base">
                      {new Date(entry.work_date).toLocaleDateString()}
                    </span>
                    <span className="text-sm text-gray-600">
                      {entry.start_time} - {entry.end_time}
                    </span>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{entry.description}</p>
                  {entry.photo_data && (
                    <div className="mt-3">
                      <img
                        src={entry.photo_data}
                        alt="Work evidence"
                        className="w-40 h-40 sm:w-32 sm:h-32 object-cover rounded-lg border mx-auto sm:mx-0"
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard

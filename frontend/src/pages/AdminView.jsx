import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import UserManagement from '../components/UserManagement'
import { API_BASE_URL } from '../config'

function AdminView() {
  const { t } = useTranslation()
  const [workEntries, setWorkEntries] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedUser, setSelectedUser] = useState('all')
  const [selectedDate, setSelectedDate] = useState('')
  const [activeTab, setActiveTab] = useState('entries')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token')
      
      const [entriesResponse, usersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/work-entries`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }),
        fetch(`${API_BASE_URL}/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        })
      ])

      if (entriesResponse.ok && usersResponse.ok) {
        const entriesData = await entriesResponse.json()
        const usersData = await usersResponse.json()
        setWorkEntries(entriesData)
        setUsers(usersData)
      } else {
        setError('Failed to fetch data')
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const filteredEntries = workEntries.filter(entry => {
    const userMatch = selectedUser === 'all' || entry.user_id.toString() === selectedUser
    const dateMatch = !selectedDate || entry.work_date === selectedDate
    return userMatch && dateMatch
  })

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId)
    return user ? user.username : 'Unknown User'
  }

  const handleUserCreated = (newUser) => {
    setUsers(prevUsers => [...prevUsers, newUser])
  }

  const handleUserDeleted = (userId) => {
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId))
    setWorkEntries(prevEntries => prevEntries.filter(entry => entry.user_id !== userId))
    if (selectedUser === userId.toString()) {
      setSelectedUser('all')
    }
  }

  if (loading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-center sm:text-left">{t('admin')} - {t('viewAll')}</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('entries')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'entries'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Work Entries
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              User Management
            </button>
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'entries' && (
        <>
          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by User:
                </label>
                <select
                  id="userFilter"
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                >
                  <option value="all">All Users</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id.toString()}>
                      {user.username} ({user.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 mb-2">
                  Filter by Date:
                </label>
                <input
                  type="date"
                  id="dateFilter"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
                />
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'entries' && (
        <>
          {/* Work Entries */}
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold">
                {t('workEntries')} ({filteredEntries.length})
              </h2>
            </div>
            
            {filteredEntries.length === 0 ? (
              <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
                No work entries found for the selected filters.
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {filteredEntries.map((entry) => (
                  <div key={entry.id} className="px-4 sm:px-6 py-4">
                    <div className="flex flex-col space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-1 sm:space-y-0">
                        <span className="font-semibold text-blue-600 text-base">
                          {getUserName(entry.user_id)}
                        </span>
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

          {/* Summary Statistics */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-100 p-4 rounded-lg text-center">
              <h3 className="font-semibold text-blue-800 text-sm sm:text-base">Total Entries</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-900">{filteredEntries.length}</p>
            </div>
            <div className="bg-green-100 p-4 rounded-lg text-center">
              <h3 className="font-semibold text-green-800 text-sm sm:text-base">Active Workers</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-900">
                {new Set(filteredEntries.map(entry => entry.user_id)).size}
              </p>
            </div>
            <div className="bg-purple-100 p-4 rounded-lg text-center">
              <h3 className="font-semibold text-purple-800 text-sm sm:text-base">Total Hours</h3>
              <p className="text-xl sm:text-2xl font-bold text-purple-900">
                {filteredEntries.reduce((total, entry) => {
                  const start = new Date(`2000-01-01T${entry.start_time}`)
                  let end = new Date(`2000-01-01T${entry.end_time}`)
                  
                  // Handle overnight shifts (when end time is earlier than start time)
                  if (end <= start) {
                    end = new Date(`2000-01-02T${entry.end_time}`)
                  }
                  
                  const hours = (end - start) / (1000 * 60 * 60)
                  return total + hours
                }, 0).toFixed(1)}h
              </p>
            </div>
          </div>
        </>
      )}

      {activeTab === 'users' && (
        <UserManagement 
          users={users} 
          onUserCreated={handleUserCreated}
          onUserDeleted={handleUserDeleted}
        />
      )}
    </div>
  )
}

export default AdminView
import { useState } from 'react'
import { API_BASE_URL } from '../config'

function ProjectManagement({ projects, onProjectCreated, onProjectUpdated, onProjectDeleted }) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingProject, setEditingProject] = useState(null)
  const [createForm, setCreateForm] = useState({
    name: '',
    is_hidden: false
  })
  const [editForm, setEditForm] = useState({
    name: '',
    is_hidden: false
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCreateProject = async (e) => {
    e.preventDefault()
    if (!createForm.name) {
      setError('Project name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/admin/projects`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(createForm),
      })

      const data = await response.json()

      if (response.ok) {
        onProjectCreated(data.project)
        setCreateForm({ name: '', is_hidden: false })
        setShowCreateForm(false)
        setError('')
      } else {
        setError(data.error || 'Failed to create project')
      }
    } catch (error) {
      console.error('Create project error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateProject = async (e) => {
    e.preventDefault()
    if (!editForm.name) {
      setError('Project name is required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/admin/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      })

      const data = await response.json()

      if (response.ok) {
        onProjectUpdated({ ...editingProject, ...editForm })
        setEditingProject(null)
        setEditForm({ name: '', is_hidden: false })
        setError('')
      } else {
        setError(data.error || 'Failed to update project')
      }
    } catch (error) {
      console.error('Update project error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteProject = async (projectId, projectName) => {
    if (!confirm(`Are you sure you want to delete project "${projectName}"? This action cannot be undone.`)) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`${API_BASE_URL}/api/admin/projects/${projectId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        onProjectDeleted(projectId)
      } else {
        setError(data.error || 'Failed to delete project')
      }
    } catch (error) {
      console.error('Delete project error:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (project) => {
    setEditingProject(project)
    setEditForm({
      name: project.name,
      is_hidden: Boolean(project.is_hidden)
    })
    setError('')
  }

  const cancelEdit = () => {
    setEditingProject(null)
    setEditForm({ name: '', is_hidden: false })
    setError('')
  }

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg sm:text-xl font-semibold">Project Management</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        >
          {showCreateForm ? 'Cancel' : 'Add Project'}
        </button>
      </div>

      {error && (
        <div className="mx-4 sm:mx-6 mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <div className="px-4 sm:px-6 py-4 border-b border-gray-200 bg-gray-50">
          <form onSubmit={handleCreateProject} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  id="projectName"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  disabled={loading}
                />
              </div>
              <div className="flex items-center">
                <div className="flex items-center h-5">
                  <input
                    id="isHidden"
                    type="checkbox"
                    checked={createForm.is_hidden}
                    onChange={(e) => setCreateForm({ ...createForm, is_hidden: e.target.checked })}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                    disabled={loading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="isHidden" className="font-medium text-gray-700">
                    Hide from workers
                  </label>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={loading}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm"
              >
                {loading ? 'Creating...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                disabled={loading}
                className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="divide-y divide-gray-200">
        {projects.length === 0 ? (
          <div className="px-4 sm:px-6 py-8 text-center text-gray-500">
            No projects found.
          </div>
        ) : (
          projects.map((project) => (
            <div key={project.id} className="px-4 sm:px-6 py-4">
              {editingProject?.id === project.id ? (
                <form onSubmit={handleUpdateProject} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="editProjectName" className="block text-sm font-medium text-gray-700 mb-1">
                        Project Name
                      </label>
                      <input
                        type="text"
                        id="editProjectName"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                        disabled={loading}
                      />
                    </div>
                    <div className="flex items-center">
                      <div className="flex items-center h-5">
                        <input
                          id="editIsHidden"
                          type="checkbox"
                          checked={editForm.is_hidden}
                          onChange={(e) => setEditForm({ ...editForm, is_hidden: e.target.checked })}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          disabled={loading}
                        />
                      </div>
                      <div className="ml-3 text-sm">
                        <label htmlFor="editIsHidden" className="font-medium text-gray-700">
                          Hide from workers
                        </label>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-green-600 text-white px-3 py-1 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 text-sm"
                    >
                      {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={loading}
                      className="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span className="font-medium text-gray-900">{project.name}</span>
                    <span className={`px-2 py-1 text-xs rounded-full ${project.is_hidden
                      ? 'bg-red-100 text-red-800'
                      : 'bg-green-100 text-green-800'
                      }`}>
                      {project.is_hidden ? 'Hidden' : 'Visible'}
                    </span>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => startEdit(project)}
                      disabled={loading}
                      className="bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteProject(project.id, project.name)}
                      disabled={loading}
                      className="bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default ProjectManagement

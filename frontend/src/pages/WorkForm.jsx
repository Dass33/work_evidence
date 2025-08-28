import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { API_BASE_URL } from '../config'

function WorkForm({ user }) {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    work_date: new Date().toISOString().split('T')[0],
    start_time: '',
    end_time: '',
    description: '',
    photo: null
  })
  const [compressedPhoto, setCompressedPhoto] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const compressImage = (file) => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      
      img.onload = () => {
        const maxWidth = 800
        const maxHeight = 600
        let { width, height } = img
        
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width
            width = maxWidth
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height
            height = maxHeight
          }
        }
        
        canvas.width = width
        canvas.height = height
        
        ctx.drawImage(img, 0, 0, width, height)
        
        canvas.toBlob((blob) => {
          const reader = new FileReader()
          reader.onload = () => {
            resolve(reader.result)
          }
          reader.readAsDataURL(blob)
        }, 'image/jpeg', 0.6)
      }
      
      img.src = URL.createObjectURL(file)
    })
  }

  const handleChange = async (e) => {
    if (e.target.name === 'photo') {
      const file = e.target.files[0]
      if (file) {
        setFormData({
          ...formData,
          photo: file
        })
        const compressed = await compressImage(file)
        setCompressedPhoto(compressed)
      } else {
        setFormData({
          ...formData,
          photo: null
        })
        setCompressedPhoto(null)
      }
    } else {
      setFormData({
        ...formData,
        [e.target.name]: e.target.value
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const token = localStorage.getItem('token')
      const submitData = {
        work_date: formData.work_date,
        start_time: formData.start_time,
        end_time: formData.end_time,
        description: formData.description,
        photo_data: compressedPhoto
      }

      const response = await fetch(`${API_BASE_URL}/api/work-entries`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        navigate('/')
      } else {
        const data = await response.json()
        setError(data.message || 'Failed to submit work entry')
      }
    } catch (error) {
      console.error('Error submitting work entry:', error)
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-6 text-center sm:text-left">{t('addWorkEntry')}</h1>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div>
            <label htmlFor="work_date" className="block text-sm font-medium text-gray-700 mb-2">
              {t('workDate')}
            </label>
            <input
              type="date"
              id="work_date"
              name="work_date"
              value={formData.work_date}
              onChange={handleChange}
              required
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start_time" className="block text-sm font-medium text-gray-700 mb-2">
                {t('startTime')}
              </label>
              <input
                type="time"
                id="start_time"
                name="start_time"
                value={formData.start_time}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>

            <div>
              <label htmlFor="end_time" className="block text-sm font-medium text-gray-700 mb-2">
                {t('endTime')}
              </label>
              <input
                type="time"
                id="end_time"
                name="end_time"
                value={formData.end_time}
                onChange={handleChange}
                required
                className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows="4"
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base resize-none"
              placeholder="Describe your work activities..."
            />
          </div>

          <div>
            <label htmlFor="photo" className="block text-sm font-medium text-gray-700 mb-2">
              {t('photo')}
            </label>
            <input
              type="file"
              id="photo"
              name="photo"
              onChange={handleChange}
              accept="image/*"
              className="w-full px-3 py-3 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-base"
            />
            {compressedPhoto && (
              <div className="mt-3">
                <img 
                  src={compressedPhoto} 
                  alt="Preview" 
                  className="w-40 h-40 sm:w-32 sm:h-32 object-cover rounded-lg border mx-auto sm:mx-0"
                />
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-4 py-3 sm:py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-base sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-3 sm:py-2 bg-blue-500 hover:bg-blue-700 text-white font-bold rounded focus:outline-none focus:shadow-outline disabled:opacity-50 transition-colors text-base sm:text-sm"
            >
              {loading ? 'Submitting...' : t('submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default WorkForm
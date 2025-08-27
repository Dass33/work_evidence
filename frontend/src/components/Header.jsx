import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function Header({ user, onLogout }) {
  const { t, i18n } = useTranslation()

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng)
  }

  return (
    <header className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center py-2 sm:py-3 space-y-1 sm:space-y-0">

          <div className="flex justify-between items-center space-y-1 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">

            {/* User Info */}
            <div className="flex sm:flex-row items-center space-y-1 sm:space-y-0 space-x-3">
              <span className="text-sm sm:text-lg font-bold text-center">
                {user.username}
              </span>
              <button
                onClick={onLogout}
                className="bg-red-500 hover:bg-red-600 px-3 py-2 text-sm font-semibold rounded transition-colors w-full sm:w-auto"
              >
                {t('logout')}
              </button>
            </div>

            {/* Language Switcher */}
            <div className="flex space-x-1">
              <button
                onClick={() => changeLanguage('en')}
                className={`px-3 py-2 text-sm font-semibold rounded transition-colors ${i18n.language === 'en' ? 'bg-blue-800' : 'hover:bg-blue-700'
                  }`}
              >
                EN
              </button>
              <button
                onClick={() => changeLanguage('cs')}
                className={`px-3 py-2 text-sm font-semibold rounded transition-colors ${i18n.language === 'cs' ? 'bg-blue-800' : 'hover:bg-blue-700'
                  }`}
              >
                CS
              </button>
              <button
                onClick={() => changeLanguage('uz')}
                className={`px-3 py-2 text-sm font-semibold rounded transition-colors ${i18n.language === 'uz' ? 'bg-blue-800' : 'hover:bg-blue-700'
                  }`}
              >
                UZ
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header

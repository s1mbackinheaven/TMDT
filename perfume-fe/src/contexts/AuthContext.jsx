import { createContext, useMemo, useState, useEffect } from 'react'
import { getMyUserApi } from '../api/userApi'

export const AuthContext = createContext(null)

const getInitialAuth = () => {
  const accessToken = localStorage.getItem('accessToken') || ''
  const refreshToken = localStorage.getItem('refreshToken') || ''
  const userRaw = localStorage.getItem('authUser')

  return {
    accessToken,
    refreshToken,
    user: userRaw ? JSON.parse(userRaw) : null,
  }
}

const persistUser = (user) => {
  localStorage.setItem('authUser', JSON.stringify(user))
}

export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuth())

  const isAuthenticated = !!auth?.accessToken

  const login = ({ accessToken, refreshToken, ...user }) => {
    localStorage.setItem('accessToken', accessToken)
    localStorage.setItem('refreshToken', refreshToken)
    persistUser(user)

    setAuth({ accessToken, refreshToken, user })
  }

  const logout = () => {
    if (auth?.user?.email) {
      sessionStorage.removeItem(`promoPopupShown_${auth.user.email}`)
      sessionStorage.removeItem(`campaignPopupShown_${auth.user.email}`)
    }
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('authUser')
    setAuth({ accessToken: '', refreshToken: '', user: null })
  }

  const refreshUser = async () => {
    if (!auth?.accessToken) return
    try {
      const freshUser = await getMyUserApi()
      persistUser(freshUser)
      setAuth((prev) => ({ ...prev, user: freshUser }))
    } catch (error) {
      // ignore
    }
  }

  useEffect(() => {
    refreshUser()
  }, [])

  const value = useMemo(() => ({ ...auth, isAuthenticated, login, logout, refreshUser }), [auth, isAuthenticated])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
// src/pages/auth/AuthPage.jsx
import { useMemo, useState } from 'react'
import LoginForm from './components/LoginForm'
import RegisterForm from './components/RegisterForm'

const AuthPage = () => {
  const [mode, setMode] = useState('login')

  const title = useMemo(() => {
    return mode === 'login' ? 'Đăng Nhập' : 'Đăng Ký'
  }, [mode])

  return (
    <div className="py-12">
      <div className="w-full max-w-[820px] px-4 mx-auto">
        <div className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-2xl">
          <div className="px-6 md:px-12 pt-10 pb-8">
            <div className="flex items-center justify-center gap-4 mb-8">
              <button
                type="button"
                className={`text-base md:text-lg font-medium cursor-pointer ${
                  mode === 'login' ? 'text-black' : 'text-black/40'
                }`}
                onClick={() => setMode('login')}
              >
                Đăng nhập
              </button>
              <span className="text-black/20">/</span>
              <button
                type="button"
                className={`text-base md:text-lg font-medium cursor-pointer ${
                  mode === 'register' ? 'text-black' : 'text-black/40'
                }`}
                onClick={() => setMode('register')}
              >
                Đăng ký
              </button>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-center tracking-wide mb-10">
              {title}
            </h1>

            {mode === 'login' ? (
              <LoginForm onSwitchRegister={() => setMode('register')} />
            ) : (
              <RegisterForm onSwitchLogin={() => setMode('login')} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage
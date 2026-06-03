import { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import { loginApi } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import AuthLoadingOverlay from '../../components/common/AuthLoadingOverlay'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const AdminLoginPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({
    username: '',
    password: '',
    remember: true,
  })
  const [isShowPassword, setIsShowPassword] = useState(false)

  const handleChange = (key) => (e) => {
    const value = key === 'remember' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setIsLoading(true)
    try {
      const loginPromise = loginApi({
        username: form.username,
        password: form.password,
      })
      const [data] = await Promise.all([loginPromise, sleep(1000)])
      
      if (data.role !== 'ADMIN') {
        setErrorMessage('Truy cập bị từ chối. Tài khoản của bạn không phải là Quản trị viên.')
        setIsLoading(false)
        return
      }
      
      login(data)
      navigate('/admin')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Đăng nhập thất bại. Vui lòng thử lại.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-[500px]">
        <div className="bg-white shadow-[0_20px_60px_rgba(0,0,0,0.12)] rounded-2xl">
          <div className="px-6 md:px-10 pt-10 pb-8">
            <h1 className="text-3xl font-semibold text-center tracking-wide mb-8">
              Đăng Nhập Quản Trị
            </h1>

            <form onSubmit={handleSubmit}>
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Username</label>
                  <input
                    value={form.username}
                    onChange={handleChange('username')}
                    className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                    placeholder="Nhập username"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <div className="relative">
                    <input
                      value={form.password}
                      onChange={handleChange('password')}
                      type={isShowPassword ? 'text' : 'password'}
                      className="w-full px-4 py-2.5 pr-12 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                      placeholder="Nhập mật khẩu"
                    />
                    <button
                      type="button"
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-black/50 cursor-pointer hover:text-black transition-colors"
                      onClick={() => setIsShowPassword((v) => !v)}
                      aria-label="toggle-password"
                    >
                      {isShowPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={form.remember}
                      onChange={handleChange('remember')}
                      className="w-4 h-4 accent-black cursor-pointer"
                    />
                    Ghi nhớ mật khẩu
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full flex items-center justify-center py-3.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors mt-6"
                >
                  Đăng nhập
                </button>
              </div>
              <AuthLoadingOverlay isOpen={isLoading} />
              {errorMessage ? (
                <div className="mt-4 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                  {errorMessage}
                </div>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminLoginPage

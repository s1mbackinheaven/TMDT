// src/pages/auth/components/RegisterForm.jsx
import { useMemo, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import { useNavigate } from 'react-router-dom'
import { registerApi } from '../../../api/authApi'
import AuthLoadingOverlay from '../../../components/common/AuthLoadingOverlay'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const RegisterForm = ({ onSwitchLogin }) => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    phoneNumber: '',
    address: '',
    acceptTerms: true,
  })
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowConfirm, setIsShowConfirm] = useState(false)

  const genderOptions = useMemo(() => {
    return [
      { value: '', label: 'Chọn giới tính' },
      { value: 'MALE', label: 'Nam' },
      { value: 'FEMALE', label: 'Nữ' },
      { value: 'OTHER', label: 'Khác' },
    ]
  }, [])

  const handleChange = (key) => (e) => {
    const value = key === 'acceptTerms' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    if (form.password !== form.confirmPassword) {
      setErrorMessage('Mật khẩu và nhập lại mật khẩu không khớp.')
      return
    }
    setIsLoading(true)
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        username: form.username,
        email: form.email,
        password: form.password,
        gender: form.gender,
        phoneNumber: form.phoneNumber,
        address: form.address,
      }
      const registerPromise = registerApi(payload)
      // Đảm bảo loading tối thiểu 5s
      await Promise.all([registerPromise, sleep(5000)])
      // Lưu email tạm để verify OTP
      localStorage.setItem('pendingVerifyEmail', form.email.trim().toLowerCase())
      navigate('/auth/verify')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Đăng ký thất bại. Vui lòng thử lại.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form className="max-w-[560px] mx-auto" onSubmit={handleSubmit}>
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">First name *</label>
            <input
              value={form.firstName}
              onChange={handleChange('firstName')}
              className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder="Nhập first name"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Last name *</label>
            <input
              value={form.lastName}
              onChange={handleChange('lastName')}
              className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder="Nhập last name"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Username *</label>
            <input
              value={form.username}
              onChange={handleChange('username')}
              className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder="Nhập username"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <input
              value={form.email}
              onChange={handleChange('email')}
              className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder="Nhập email"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mật khẩu *</label>
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

        <div className="space-y-2">
          <label className="text-sm font-medium">Nhập lại mật khẩu *</label>
          <div className="relative">
            <input
              value={form.confirmPassword}
              onChange={handleChange('confirmPassword')}
              type={isShowConfirm ? 'text' : 'password'}
              className="w-full px-4 py-2.5 pr-12 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder="Nhập lại mật khẩu"
            />
            <button
              type="button"
              className="absolute top-1/2 right-3 -translate-y-1/2 text-black/50 cursor-pointer hover:text-black transition-colors"
              onClick={() => setIsShowConfirm((v) => !v)}
              aria-label="toggle-confirm-password"
            >
              {isShowConfirm ? <FiEyeOff size={18} /> : <FiEye size={18} />}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <label className="text-sm font-medium">Giới tính *</label>
            <select
              value={form.gender}
              onChange={handleChange('gender')}
              className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30 bg-white"
            >
              {genderOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Số điện thoại</label>
            <input
              value={form.phoneNumber}
              onChange={handleChange('phoneNumber')}
              className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
              placeholder='Ví dụ: +841234567890'
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Địa chỉ *</label>
          <input
            value={form.address}
            onChange={handleChange('address')}
            className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
            placeholder="Nhập địa chỉ"
          />
        </div>

        <p className="text-xs md:text-sm leading-relaxed text-black/60">
          Thông tin cá nhân của bạn sẽ được sử dụng để tăng cường trải nghiệm sử
          dụng website, để quản lý truy cập vào tài khoản của bạn, và cho các mục
          đích cụ thể khác được mô tả trong chính sách riêng tư của chúng tôi.
        </p>

        <label className="inline-flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={form.acceptTerms}
            onChange={handleChange('acceptTerms')}
            className="w-4 h-4 accent-black cursor-pointer"
          />
          Tôi đồng ý với <span className="font-semibold">Điều khoản sử dụng dịch vụ</span>
        </label>

        <button
          type="submit"
          className="w-full flex items-center justify-center py-3.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
        >
          Đăng ký
        </button>

        <div className="pt-6 border-t border-black/10">
          <p className="text-center text-sm">
            Bạn đã có tài khoản?{' '}
            <button
              type="button"
              className="font-semibold cursor-pointer hover:text-black/70 transition-colors"
              onClick={onSwitchLogin}
            >
              Đăng nhập ngay
            </button>
          </p>

          <button
            type="button"
            className="mt-4 w-full flex items-center justify-center gap-3 py-2.5 text-sm border border-black/10 rounded-lg cursor-pointer hover:bg-black/5 transition-colors"
          >
            <FcGoogle size={20} />
            Đăng nhập bằng Google
          </button>
        </div>
      </div>
      <AuthLoadingOverlay isOpen={isLoading} title="Đang đăng ký tài khoản..." />
      {errorMessage ? (
        <div className="mt-4 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
          {errorMessage}
        </div>
      ) : null}
    </form>
  )
}

export default RegisterForm
import { useEffect, useMemo, useRef, useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'
import AuthLoadingOverlay from '../../components/common/AuthLoadingOverlay'
import { loginApi, resendOtpApi, resetPasswordApi, verifyOtpApi } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const STEPS = {
  EMAIL: 'EMAIL',
  OTP: 'OTP',
  RESET: 'RESET',
}

const ForgotPasswordPage = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [step, setStep] = useState(STEPS.EMAIL)
  const [email, setEmail] = useState('')
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', ''])
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isShowPassword, setIsShowPassword] = useState(false)
  const [isShowConfirm, setIsShowConfirm] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [loadingTitle, setLoadingTitle] = useState('')
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  const inputsRef = useRef([])

  useEffect(() => {
    // Khi qua step OTP thì focus vào ô đầu
    if (step === STEPS.OTP) {
      const first = inputsRef.current[0]
      if (first) first.focus()
    }
  }, [step])

  const otp = useMemo(() => otpDigits.join(''), [otpDigits])

  const handleGoBackAuth = () => {
    navigate('/auth')
  }

  const handleSendOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    const normalizedEmail = email.trim().toLowerCase()
    if (!normalizedEmail) {
      setErrorMessage('Vui lòng nhập email.')
      return
    }

    setIsLoading(true)
    setLoadingTitle('Đang gửi OTP...')
    try {
      const promise = resendOtpApi({ email: normalizedEmail })
      await Promise.all([promise, sleep(5000)])

      setEmail(normalizedEmail)
      setStep(STEPS.OTP)
      setInfoMessage('')
    } catch (err) {
      const message =
        err?.response?.data?.message || 'Gửi OTP thất bại. Vui lòng thử lại.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
      setLoadingTitle('')
    }
  }

  const handleChangeDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...otpDigits]
    next[index] = value
    setOtpDigits(next)

    if (value && index < next.length - 1) {
      const nextInput = inputsRef.current[index + 1]
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDownDigit = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      const prevInput = inputsRef.current[index - 1]
      if (prevInput) prevInput.focus()
    }
  }

  const handleVerifyOtp = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (otp.length !== 6) {
      setErrorMessage('OTP phải đủ 6 số.')
      return
    }

    setIsLoading(true)
    setLoadingTitle('Đang xác thực OTP...')
    try {
      const promise = verifyOtpApi({ email, otp })
      await Promise.all([promise, sleep(5000)])
      setStep(STEPS.RESET)
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Xác thực OTP thất bại. Vui lòng thử lại.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
      setLoadingTitle('')
    }
  }

  const handleResendOtp = async () => {
    if (!email) return
    setErrorMessage('')
    setInfoMessage('Đang gửi lại OTP...')
    try {
      await resendOtpApi({ email })
      setInfoMessage('Đã gửi lại OTP, vui lòng kiểm tra email.')
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Gửi lại OTP thất bại. Vui lòng thử lại.'
      setErrorMessage(message)
      setInfoMessage('')
    }
  }

  const handleResetPassword = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    setInfoMessage('')

    if (!username.trim()) {
      setErrorMessage('Vui lòng nhập username.')
      return
    }

    if (password !== confirmPassword) {
      setErrorMessage('Mật khẩu và xác nhận mật khẩu không khớp.')
      return
    }

    setIsLoading(true)
    setLoadingTitle('Đang cập nhật mật khẩu...')
    try {
      const resetPromise = resetPasswordApi({
        username: username.trim().toLowerCase(),
        password,
        confirmPassword,
      })
      await Promise.all([resetPromise, sleep(5000)])

      // Reset OK => đăng nhập ngay
      setLoadingTitle('Đang đăng nhập...')
      const loginPromise = loginApi({
        username: username.trim().toLowerCase(),
        password,
      })
      const [data] = await Promise.all([loginPromise, sleep(5000)])
      login(data)

      navigate('/')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Reset mật khẩu thất bại. Vui lòng thử lại.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
      setLoadingTitle('')
    }
  }

  return (
    <div className="py-12">
      <div className="w-full max-w-[520px] px-4 mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] px-6 md:px-10 py-8">
          <div className="flex items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-black">
                Quên mật khẩu
              </h1>
              <p className="mt-1 text-sm text-black/60">
                {step === STEPS.EMAIL
                  ? 'Nhập email để nhận OTP khôi phục.'
                  : step === STEPS.OTP
                    ? `OTP đã được gửi đến: ${email}`
                    : 'Đặt lại mật khẩu mới cho tài khoản.'}
              </p>
            </div>

            <button
              type="button"
              className="text-sm font-semibold text-black/70 cursor-pointer hover:text-black transition-colors"
              onClick={handleGoBackAuth}
            >
              Quay lại
            </button>
          </div>

          {step === STEPS.EMAIL ? (
            <form className="mt-8 space-y-5" onSubmit={handleSendOtp}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                  placeholder="Nhập email tài khoản"
                />
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center py-3.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
              >
                Gửi OTP
              </button>
            </form>
          ) : null}

          {step === STEPS.OTP ? (
            <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
              <div className="flex items-center justify-between gap-2">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => {
                      inputsRef.current[index] = el
                    }}
                    value={digit}
                    onChange={(e) => handleChangeDigit(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDownDigit(index, e)}
                    maxLength={1}
                    autoFocus={index === 0}
                    className="w-10 h-12 md:w-12 md:h-14 text-center text-lg font-semibold border border-black/10 rounded-lg outline-none focus:border-black/40"
                  />
                ))}
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center py-3.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
              >
                Xác nhận OTP
              </button>

              <div className="text-center text-sm text-black/70">
                Không thấy OTP?{' '}
                <button
                  type="button"
                  className="font-semibold cursor-pointer hover:text-black"
                  onClick={handleResendOtp}
                >
                  Gửi lại
                </button>
              </div>
            </form>
          ) : null}

          {step === STEPS.RESET ? (
            <form className="mt-8 space-y-5" onSubmit={handleResetPassword}>
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-2.5 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                  placeholder="Nhập username tài khoản"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Mật khẩu mới</label>
                <div className="relative">
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={isShowPassword ? 'text' : 'password'}
                    className="w-full px-4 py-2.5 pr-12 text-sm border border-black/10 rounded-lg outline-none focus:border-black/30"
                    placeholder="Nhập mật khẩu mới"
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
                <label className="text-sm font-medium">Xác nhận mật khẩu</label>
                <div className="relative">
                  <input
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
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

              <button
                type="submit"
                className="w-full flex items-center justify-center py-3.5 text-sm font-semibold text-white bg-black rounded-full cursor-pointer hover:bg-black/90 transition-colors"
              >
                Reset mật khẩu
              </button>

              <p className="text-xs leading-relaxed text-black/60">
                Mật khẩu phải có ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt.
              </p>
            </form>
          ) : null}

          {infoMessage ? (
            <div className="mt-4 text-xs text-center text-black/60">
              {infoMessage}
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-4 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
              {errorMessage}
            </div>
          ) : null}
        </div>
      </div>

      <AuthLoadingOverlay isOpen={isLoading} title={loadingTitle} />
    </div>
  )
}

export default ForgotPasswordPage


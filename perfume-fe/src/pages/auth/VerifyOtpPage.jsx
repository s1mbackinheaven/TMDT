import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { verifyRegistrationApi, resendOtpApi } from '../../api/authApi'
import { useAuth } from '../../hooks/useAuth'
import AuthLoadingOverlay from '../../components/common/AuthLoadingOverlay'

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const VerifyOtpPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()

  const initialEmail =
    location.state?.email || localStorage.getItem('pendingVerifyEmail') || ''

  const [email] = useState(initialEmail)
  const inputsRef = useRef([])
  const [digits, setDigits] = useState(['', '', '', '', '', ''])
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [infoMessage, setInfoMessage] = useState('')

  useEffect(() => {
    if (!email) {
      navigate('/auth')
    }
  }, [email, navigate])

  const maskedEmail = useMemo(() => email, [email])

  const handleChangeDigit = (index, value) => {
    if (!/^\d?$/.test(value)) return
    const next = [...digits]
    next[index] = value
    setDigits(next)

    if (value && index < next.length - 1) {
      const nextInput = inputsRef.current[index + 1]
      if (nextInput) nextInput.focus()
    }
  }

  const handleKeyDownDigit = (index, e) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      const prevInput = inputsRef.current[index - 1]
      if (prevInput) prevInput.focus()
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage('')
    const otp = digits.join('')

    if (otp.length !== 6) {
      setErrorMessage('OTP phải đủ 6 số.')
      return
    }

    setIsLoading(true)
    try {
      const verifyPromise = verifyRegistrationApi({ email, otp })
      const [data] = await Promise.all([verifyPromise, sleep(5000)])

      // data là RegisterVerifyResponse: accessToken, refreshToken, fullName, email, role, isVerified
      login(data)

      localStorage.removeItem('pendingVerifyEmail')

      navigate('/')
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        'Xác thực OTP thất bại. Vui lòng thử lại.'
      setErrorMessage(message)
    } finally {
      setIsLoading(false)
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

  return (
    <div className="py-12">
      <div className="w-full max-w-[520px] px-4 mx-auto">
        <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] px-6 md:px-10 py-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-center mb-4">
            Xác thực OTP
          </h1>

          <p className="text-sm text-center text-black/70">
            OTP đã được gửi đến gmail của bạn:{' '}
            <span className="font-semibold">{maskedEmail}</span>
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-6">
            <div className="flex items-center justify-between gap-2">
              {digits.map((digit, index) => (
                <input
                  ref={(el) => (inputsRef.current[index] = el)}
                  key={index}
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

            {infoMessage ? (
              <div className="mt-2 text-xs text-center text-black/60">
                {infoMessage}
              </div>
            ) : null}

            {errorMessage ? (
              <div className="mt-3 px-4 py-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                {errorMessage}
              </div>
            ) : null}
          </form>
        </div>
      </div>

      <AuthLoadingOverlay isOpen={isLoading} title="Đang xác thực OTP..." />
    </div>
  )
}

export default VerifyOtpPage
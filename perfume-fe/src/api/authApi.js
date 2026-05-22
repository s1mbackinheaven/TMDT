import axiosClient from './axiosClient'

export const loginApi = async ({ username, password }) => {
  const res = await axiosClient.post('/auth/login', { username, password })
  return res.data
}

export const registerApi = async (payload) => {
  // payload: RegisterRequest (firstName, lastName, username, email, password, gender, phoneNumber, address)
  const res = await axiosClient.post('/auth/register', payload)
  return res.data
}

export const verifyRegistrationApi = async ({ email, otp }) => {
  const res = await axiosClient.post('/auth/verify-registration', { email, otp })
  return res.data
}

export const resendOtpApi = async ({ email }) => {
  const res = await axiosClient.post('/auth/send-otp', { email })
  return res.data
}

export const verifyOtpApi = async ({ email, otp }) => {
  const res = await axiosClient.post('/auth/verify-otp', { email, otp })
  return res.data
}

export const resetPasswordApi = async ({ username, password, confirmPassword }) => {
  const res = await axiosClient.post('/auth/reset-password', {
    username,
    password,
    confirmPassword,
  })
  return res.data
}

export const myProfileApi = async ({ email }) => {
  const res = await axiosClient.post('/profile/myProfile', { email })
  return res.data
}
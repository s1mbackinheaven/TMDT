const GUEST_KEY_STORAGE = 'guestKey'

const randomKey = () => {
  const bytes = new Uint8Array(16)
  window.crypto.getRandomValues(bytes)
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('')
}

export const getOrCreateGuestKey = () => {
  let key = localStorage.getItem(GUEST_KEY_STORAGE)
  if (!key) {
    key = `guest-${randomKey()}`
    localStorage.setItem(GUEST_KEY_STORAGE, key)
  }
  return key
}

export const ensureGuestKey = () => {
  return getOrCreateGuestKey()
}

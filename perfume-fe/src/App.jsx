import './index.css'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import MainHeader from './components/layout/MainHeader'
import MainFooter from './components/layout/MainFooter'
import HeroSlider from './components/home/HeroSlider'
import FeatureMarquee from './components/home/FeatureMarquee'
import HomeBestSellerSection from './components/home/HomeBestSellerSection'
import NewsPage from './pages/news/NewsPage'
import NewsDetailPage from './pages/news/NewsDetailPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AuthPage from './pages/auth/AuthPage'
import AccountPage from './pages/accounts/AccountPage'
import { AuthProvider } from './contexts/AuthContext'
import { ensureGuestKey } from './utils/guestKey'
import { ToastProvider } from './contexts/ToastContext'
import VerifyOtpPage from './pages/auth/VerifyOtpPage'
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage'
import ProductsPage from './pages/products/ProductsPage'
import ProductDetailPage from './pages/products/ProductDetailPage'
import CartPage from './pages/cart/CartPage'
import CheckoutPage from './pages/checkout/CheckoutPage'
import PayosCheckoutPage from './pages/checkout/PayosCheckoutPage'
import CodSuccessPage from './pages/checkout/CodSuccessPage'
import AdminGuard from './pages/admin/AdminGuard'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminReferencePage from './pages/admin/AdminReferencePage'
import AdminProductsPage from './pages/admin/products/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminArticlesPage from './pages/admin/AdminArticlesPage'
import ProductFormPage from './pages/admin/products/ProductFormPage'

const AppShell = () => {
  const location = useLocation()
  const isHome = location.pathname === '/'
  const isAdmin = location.pathname.startsWith('/admin')

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-black font-[Montserrat] flex flex-col">
      {isAdmin ? null : <MainHeader />}

      <main className={`flex-1 ${isAdmin ? 'pt-0' : isHome ? 'pt-0' : 'pt-24'}`}>
        <Routes>
          <Route
            path="/"
            element={
              <>
                <HeroSlider />
                <FeatureMarquee />
                <HomeBestSellerSection />
              </>
            }
          />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/auth/verify" element={<VerifyOtpPage />} />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/news/:slug" element={<NewsDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/:id" element={<ProductDetailPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout/cod-success" element={<CodSuccessPage />} />
          <Route path="/checkout/payos" element={<PayosCheckoutPage />} />

          {/* Admin */}
          <Route element={<AdminGuard />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboardPage />} />
              <Route path="products" element={<AdminProductsPage />} />
              <Route path="products/new" element={<ProductFormPage />} />
              <Route path="products/:id/edit" element={<ProductFormPage />} />
              <Route path="reference" element={<AdminReferencePage />} />
              <Route path="users" element={<AdminUsersPage />} />
              <Route path="orders" element={<AdminOrdersPage />} />
              <Route path="articles" element={<AdminArticlesPage />} />
              <Route path="notifications" element={<AdminNotificationsPage />} />
            </Route>
          </Route>
        </Routes>
      </main>

      {isAdmin ? null : <MainFooter />}
    </div>
  )
}

const App = () => {
  ensureGuestKey()

  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppShell />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
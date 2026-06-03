import './index.css'
import { BrowserRouter, Routes, Route, useLocation, Navigate, Outlet } from 'react-router-dom'
import MainHeader from './components/layout/MainHeader'
import MainFooter from './components/layout/MainFooter'
import HeroSlider from './components/home/HeroSlider'
import FeatureMarquee from './components/home/FeatureMarquee'
import ProductShowcaseSection from './components/home/ProductShowcaseSection'
import HomeBestSellerSection from './components/home/HomeBestSellerSection'
import NewsPage from './pages/news/NewsPage'
import NewsDetailPage from './pages/news/NewsDetailPage'
import NotificationsPage from './pages/notifications/NotificationsPage'
import AdminNotificationsPage from './pages/admin/AdminNotificationsPage'
import AuthPage from './pages/auth/AuthPage'
import AboutPage from './pages/about/AboutPage'
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
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminUsersPage from './pages/admin/AdminUsersPage'
import AdminReferencePage from './pages/admin/AdminReferencePage'
import AdminProductsPage from './pages/admin/products/AdminProductsPage'
import AdminOrdersPage from './pages/admin/AdminOrdersPage'
import AdminArticlesPage from './pages/admin/AdminArticlesPage'
import ProductFormPage from './pages/admin/products/ProductFormPage'
import AdminCampaignsPage from './pages/admin/campaigns/AdminCampaignsPage'
import Chatbot from './components/common/Chatbot'
import PromoPopup from './components/common/PromoPopup'
import CampaignPopup from './components/common/CampaignPopup'

const AdminDomainGuard = () => {
  const hostname = window.location.hostname
  // Allow localhost for dev, but strictly require admin.culus.io.vn in production
  const isAllowed = hostname === 'admin.culus.io.vn' || hostname === 'localhost' || hostname === '127.0.0.1'
  
  if (!isAllowed) {
    return <Navigate to="/" replace />
  }
  
  return <Outlet />
}

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
                <ProductShowcaseSection />
                <HomeBestSellerSection />
              </>
            }
          />
          <Route path="/news" element={<NewsPage />} />
          <Route path="/about" element={<AboutPage />} />
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
          <Route element={<AdminDomainGuard />}>
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route element={<AdminGuard />}>
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AdminDashboardPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<ProductFormPage />} />
                <Route path="products/:id/edit" element={<ProductFormPage />} />
                <Route path="campaigns" element={<AdminCampaignsPage />} />
                <Route path="reference" element={<AdminReferencePage />} />
                <Route path="users" element={<AdminUsersPage />} />
                <Route path="orders" element={<AdminOrdersPage />} />
                <Route path="articles" element={<AdminArticlesPage />} />
                <Route path="notifications" element={<AdminNotificationsPage />} />
              </Route>
            </Route>
          </Route>
        </Routes>
      </main>

      {isAdmin ? null : <Chatbot />}
      {isAdmin ? null : <MainFooter />}
      {isAdmin ? null : <CampaignPopup />}
      {isAdmin ? null : <PromoPopup />}
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
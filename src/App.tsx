import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import LandingPage from './pages/LandingPage'
import SiteLayout from './components/layout/SiteLayout'
import AboutPage from './pages/AboutPage'
import ServicesPage from './pages/ServicesPage'
import ContactPage from './pages/ContactPage'
import BlankPage from './pages/BlankPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import OnboardSalonPage from './pages/OnboardSalonPage'
import BookingFlowPage from './pages/BookingFlowPage'
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminNewBookingPage from './pages/admin/AdminNewBookingPage'
import AdminClientsPage from './pages/admin/AdminClientsPage'
import AdminServicesPage from './pages/admin/AdminServicesPage'
import AdminPOSPage from './pages/admin/AdminPOSPage'
import AdminStaffPage from './pages/admin/AdminStaffPage'
import AdminInventoryPage from './pages/admin/AdminInventoryPage'
import AdminRevenuePage from './pages/admin/AdminRevenuePage'
import AdminReportsPage from './pages/admin/AdminReportsPage'
import AdminMarketingPage from './pages/admin/AdminMarketingPage'
import AdminLoyaltyPage from './pages/admin/AdminLoyaltyPage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import { AuthProvider } from './store/AuthContext'
import { SalonDataProvider } from './store/SalonDataContext'
import { ToastProvider } from './store/ToastContext'
import ProtectedRoute from './routes/ProtectedRoute'
import AdminFinalizeOnboardPage from './pages/admin/AdminFinalizeOnboardPage'

function App() {

  return (
    <AuthProvider>
      <SalonDataProvider>
        <ToastProvider>
          <BrowserRouter>
            <Routes>
              {/* Public site — shares Header + Footer */}
              <Route element={<SiteLayout />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/services" element={<ServicesPage />} />
                <Route path="/contact" element={<ContactPage />} />
                {/* Was pointed at Blanky, a leftover dev test page with an
              infinite re-render loop (setTimeout in a dep-less useEffect).
              BlankPage is the actual intended empty-canvas page. */}
                <Route path="/blank" element={<BlankPage />} />
              </Route>

              {/* Auth pages — own full-page layout */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/onboard" element={<OnboardSalonPage />} />
              <Route path="onboard-finalize" element={<ProtectedRoute><AdminFinalizeOnboardPage /></ProtectedRoute>} />

              {/* Customer-facing booking PWA — own full-page layout, no auth required */}
              <Route path="/book" element={<BookingFlowPage />} />

              {/* Admin — shares Sidebar + Admin header, now gated behind auth + role */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute>
                    <AdminLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<AdminDashboardPage />} />
                <Route path="bookings" element={<AdminBookingsPage />} />
                <Route path="bookings/new" element={<AdminNewBookingPage />} />
                <Route path="clients" element={<AdminClientsPage />} />
                <Route path="services" element={<AdminServicesPage />} />
                <Route path="pos" element={<AdminPOSPage />} />
                <Route path="staff" element={<AdminStaffPage />} />
                <Route path="inventory" element={<AdminInventoryPage />} />
                <Route path="revenue" element={<AdminRevenuePage />} />
                <Route path="reports" element={<AdminReportsPage />} />
                <Route path="marketing" element={<AdminMarketingPage />} />
                <Route path="loyalty" element={<AdminLoyaltyPage />} />
                <Route path="settings" element={<AdminSettingsPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </ToastProvider>
      </SalonDataProvider>
    </AuthProvider>
  )
}

export default App

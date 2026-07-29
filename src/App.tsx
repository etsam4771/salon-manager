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
import AdminLayout from './components/layout/AdminLayout'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminBookingsPage from './pages/admin/AdminBookingsPage'
import AdminClientsPage from './pages/admin/AdminClientsPage'
import AdminServicesPage from './pages/admin/AdminServicesPage'
import AdminRevenuePage from './pages/admin/AdminRevenuePage'
import AdminSettingsPage from './pages/admin/AdminSettingsPage'
import { AuthProvider } from './store/AuthContext'
import ProtectedRoute from './routes/ProtectedRoute'

function App() {

  return (
   <AuthProvider>
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

        {/* Admin — shares Sidebar + Admin header, now gated behind auth + role */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboardPage />} />
          <Route path="bookings" element={<AdminBookingsPage />} />
          <Route path="clients" element={<AdminClientsPage />} />
          <Route path="services" element={<AdminServicesPage />} />
          <Route path="revenue" element={<AdminRevenuePage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
   </AuthProvider>
  )
}

export default App

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
import AdminPlaceholderPage from './pages/admin/AdminPlaceholderPage'
import Blanky from './pages/Blanky'

function App() {

  return (
   <BrowserRouter>
    <Routes>
      {/* Public Sie  shares Header + Footer*/}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blank" element={<Blanky />} />
      </Route>

      {/* Auth pages — own full-page layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Admin — shares Sidebar + Admin header */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboardPage />} />
        <Route path="bookings" element={<AdminPlaceholderPage title="Bookings" />} />
        <Route path="clients" element={<AdminPlaceholderPage title="Clients" />} />
        <Route path="services" element={<AdminPlaceholderPage title="Services" />} />
        <Route path="revenue" element={<AdminPlaceholderPage title="Revenue" />} />
        <Route path="settings" element={<AdminPlaceholderPage title="Settings" />} />
      </Route>
    </Routes>


  </BrowserRouter>
  )
}

export default App

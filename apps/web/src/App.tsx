import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SummaryProvider } from '@/context/SummaryContext'
import { AdminProvider } from '@/context/AdminContext'
import UploadPage from '@/pages/UploadPage'
import SummaryPage from '@/pages/SummaryPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminStorePage from '@/pages/admin/AdminStorePage'

export default function App() {
  return (
    <SummaryProvider>
      <AdminProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<UploadPage />} />
            <Route path="/summary" element={<SummaryPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin/stores" element={<AdminStorePage />} />
          </Routes>
        </BrowserRouter>
      </AdminProvider>
    </SummaryProvider>
  )
}

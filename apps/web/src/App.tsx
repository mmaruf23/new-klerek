import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { SummaryProvider } from '@/context/SummaryContext'
import UploadPage from '@/pages/UploadPage'
import SummaryPage from '@/pages/SummaryPage'

export default function App() {
  return (
    <SummaryProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/summary" element={<SummaryPage />} />
        </Routes>
      </BrowserRouter>
    </SummaryProvider>
  )
}

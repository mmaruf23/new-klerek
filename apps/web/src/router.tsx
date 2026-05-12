import { createBrowserRouter, redirect } from 'react-router-dom'
import type { Summary } from '@packages/contract'
import UploadPage from '@/pages/UploadPage'
import SummaryPage from '@/pages/SummaryPage'
import AdminLoginPage from '@/pages/admin/AdminLoginPage'
import AdminStorePage, { loader as adminStoreLoader } from '@/pages/admin/AdminStorePage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <UploadPage />,
  },
  {
    path: '/summary',
    loader: (): Summary => {
      const raw = sessionStorage.getItem('klerek_summary')
      if (!raw) throw redirect('/')
      return JSON.parse(raw) as Summary
    },
    element: <SummaryPage />,
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/stores',
    loader: adminStoreLoader,
    element: <AdminStorePage />,
  },
])

import { lazy, Suspense } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import PageFallback from '../components/PageFallback'
import { RequireAuth } from '../features/auth/RequireAuth'
import { PublicLayout } from '../layouts/PublicLayout'
import { SantriLayout } from '../layouts/SantriLayout'
import { StaffLayout } from '../layouts/StaffLayout'
import { ROLES } from '../lib/constants'

const HomePage = lazy(() => import('../pages/HomePage'))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const ChangePasswordPage = lazy(() => import('../pages/ChangePasswordPage'))
const CreateReportPage = lazy(() => import('../pages/santri/CreateReportPage'))
const MyReportsPage = lazy(() => import('../pages/santri/MyReportsPage'))
const SantriReportDetailPage = lazy(
  () => import('../pages/santri/SantriReportDetailPage'),
)
const StaffReportListPage = lazy(
  () => import('../pages/staff/StaffReportListPage'),
)
const StaffReportDetailPage = lazy(
  () => import('../pages/staff/StaffReportDetailPage'),
)
const DashboardPage = lazy(() => import('../pages/pimpinan/DashboardPage'))
const AccountsPage = lazy(() => import('../pages/pimpinan/AccountsPage'))
const ForbiddenPage = lazy(() => import('../pages/ForbiddenPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

export default function AppRouter() {
  return (
    <Suspense fallback={<PageFallback />}>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
        </Route>

        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/ganti-password"
          element={
            <RequireAuth>
              <ChangePasswordPage />
            </RequireAuth>
          }
        />

        <Route
          path="/santri"
          element={
            <RequireAuth roles={[ROLES.SANTRI]}>
              <SantriLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="buat-laporan" replace />} />
          <Route path="buat-laporan" element={<CreateReportPage />} />
          <Route path="laporan-saya" element={<MyReportsPage />} />
          <Route path="laporan/:id" element={<SantriReportDetailPage />} />
        </Route>

        <Route
          path="/petugas"
          element={
            <RequireAuth roles={[ROLES.PENGURUS, ROLES.PIMPINAN]}>
              <StaffLayout />
            </RequireAuth>
          }
        >
          <Route index element={<StaffReportListPage />} />
          <Route path="laporan/:id" element={<StaffReportDetailPage />} />
        </Route>

        <Route
          path="/pimpinan"
          element={
            <RequireAuth roles={[ROLES.PIMPINAN]}>
              <StaffLayout />
            </RequireAuth>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="akun" element={<AccountsPage />} />
        </Route>

        <Route path="/403" element={<ForbiddenPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

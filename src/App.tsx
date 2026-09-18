import { Navigate, Route, Routes } from 'react-router-dom'
import ProtectedLayout from './auth/ProtectedLayout'
import ItemsPage from './pages/ItemsPage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route element={<ProtectedLayout />}>
        {/* Items is the template resource — copy this route, ItemsPage.tsx,
            and its entry in api/endpoints.ts for each real feature you add. */}
        <Route path="/items" element={<ItemsPage />} />
        <Route index element={<Navigate to="/items" replace />} />
      </Route>

      {/* Anything unmatched falls back to the protected area, which itself
          redirects to /login if there is no session — so a bad URL never
          shows a bare blank page. */}
      <Route path="*" element={<Navigate to="/items" replace />} />
    </Routes>
  )
}

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { BookingProvider } from './context/BookingContext';
import { PublicLayout } from './components/PublicLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { BookingPage } from './pages/BookingPage';
import { AuthPage } from './pages/AuthPage';
import { AccountPage } from './pages/AccountPage';
import { LegalPage, NotFoundPage } from './pages/LegalPage';

export default function App() {
  return <BrowserRouter><AuthProvider><BookingProvider><Routes>
    <Route element={<PublicLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/entrar" element={<AuthPage />} />
      <Route path="/termos" element={<LegalPage type="terms" />} />
      <Route path="/privacidade" element={<LegalPage type="privacy" />} />
    </Route>
    <Route path="/agendar" element={<BookingPage />} />
    <Route element={<ProtectedRoute />}><Route path="/conta/*" element={<AccountPage />} /><Route path="/conta" element={<Navigate to="/conta/agendamentos" replace />} /></Route>
    <Route path="*" element={<NotFoundPage />} />
  </Routes></BookingProvider></AuthProvider></BrowserRouter>;
}

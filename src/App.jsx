import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { I18nProvider } from './context/I18nContext';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Dashboard } from './pages/Dashboard';
import { Login } from './pages/Login';
import { Signin } from './pages/Signin';
import { Complaint } from './pages/Complaint';
import { ExtensionDownload } from './pages/ExtensionDownload';
import { EmailVerification } from './pages/EmailVerification';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <I18nProvider>
        <BrowserRouter>
          <Routes>
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signin" element={<Signin />} />
            <Route
              path="/complaint"
              element={
                <ProtectedRoute>
                  <Complaint />
                </ProtectedRoute>
              }
            />
            <Route
              path="/extension"
              element={
                <ProtectedRoute>
                  <ExtensionDownload />
                </ProtectedRoute>
              }
            />
            <Route
              path="/email-verification"
              element={
                <ProtectedRoute>
                  <EmailVerification />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <Settings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </I18nProvider>
    </AuthProvider>
  );
}

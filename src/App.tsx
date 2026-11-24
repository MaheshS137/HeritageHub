/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import { I18nProvider } from './i18n/I18nContext';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { ExplorePage } from './pages/ExplorePage';
import { DiscoveryPage } from './pages/DiscoveryPage';
import { CulturalDetailPage } from './pages/CulturalDetailPage';
import { DistrictDetailPage } from './pages/DistrictDetailPage';
import { AboutPage } from './pages/AboutPage';
import { DestinationsPage } from './pages/DestinationsPage';
import { DestinationDetailPage } from './pages/DestinationDetailPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { PreservationPage } from './pages/PreservationPage';
import { AuthPage } from './pages/AuthPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { UserDashboardPage } from './pages/UserDashboardPage';
import { JournalistDashboardPage } from './pages/JournalistDashboardPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ArticleDetailPage } from './pages/ArticleDetailPage';

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <I18nProvider>
        <AuthProvider>
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/culture" element={<DiscoveryPage />} />
                <Route path="/culture/:slug" element={<CulturalDetailPage />} />
                <Route path="/article/:slug" element={<ArticleDetailPage />} />
                <Route path="/district/:id" element={<DistrictDetailPage />} />
                <Route path="/about" element={<AboutPage />} />

                {/* Auth & Password Recovery */}
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/register" element={<AuthPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />

                {/* Role-Protected Dashboards */}
                <Route
                  path="/dashboard/user"
                  element={
                    <ProtectedRoute allowedRoles={['USER']}>
                      <UserDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/journalist"
                  element={
                    <ProtectedRoute allowedRoles={['JOURNALIST']}>
                      <JournalistDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/admin"
                  element={
                    <ProtectedRoute allowedRoles={['ADMIN']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                {/* Secondary / Deep-Link Routes */}
                <Route path="/destinations" element={<DestinationsPage />} />
                <Route path="/destinations/:slug" element={<DestinationDetailPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/discovery" element={<DiscoveryPage />} />
                <Route path="/discovery/:slug" element={<CulturalDetailPage />} />
                <Route path="/preservation" element={<PreservationPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </AuthProvider>
      </I18nProvider>
    </MotionConfig>
  );
}

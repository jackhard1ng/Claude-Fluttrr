import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Lazy-load pages for code splitting
const HomePage = React.lazy(() => import('./pages/HomePage'));
const ExplorePage = React.lazy(() => import('./pages/ExplorePage'));
const MapViewPage = React.lazy(() => import('./pages/MapViewPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const ChatRoomPage = React.lazy(() => import('./pages/ChatRoomPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const BusinessDetailPage = React.lazy(() => import('./pages/BusinessDetailPage'));
const EventDetailPage = React.lazy(() => import('./pages/EventDetailPage'));
const BusinessDashboardPage = React.lazy(() => import('./pages/BusinessDashboardPage'));
const CreateEventPage = React.lazy(() => import('./pages/CreateEventPage'));
const SettingsPage = React.lazy(() => import('./pages/SettingsPage'));
const LoginPage = React.lazy(() => import('./pages/LoginPage'));
const RegisterPage = React.lazy(() => import('./pages/RegisterPage'));
const NotificationsPage = React.lazy(() => import('./pages/NotificationsPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const DiscoverPage = React.lazy(() => import('./pages/DiscoverPage'));

// Layout components
import BottomNavigation from './components/layout/BottomNavigation';

/**
 * Toast notification container for app-wide notifications.
 * Renders toast messages managed via a simple event-driven approach.
 */
const ToastContainer = () => {
  const [toasts, setToasts] = React.useState([]);

  React.useEffect(() => {
    const handleToast = (event) => {
      const { message, type = 'info', duration = 4000 } = event.detail;
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, type }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    };

    window.addEventListener('fluttrr-toast', handleToast);
    return () => window.removeEventListener('fluttrr-toast', handleToast);
  }, []);

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast-${toast.type}`}
          onClick={() => removeToast(toast.id)}
          role="alert"
        >
          <span className="toast-message">{toast.message}</span>
          <button
            className="toast-close"
            onClick={(e) => {
              e.stopPropagation();
              removeToast(toast.id);
            }}
            aria-label="Dismiss"
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

/**
 * Helper to dispatch toast events from anywhere in the app.
 */
export const showToast = (message, type = 'info', duration = 4000) => {
  window.dispatchEvent(
    new CustomEvent('fluttrr-toast', {
      detail: { message, type, duration },
    })
  );
};

/**
 * Loading fallback component for lazy-loaded pages.
 */
const PageLoader = () => (
  <div className="page-loader">
    <div className="page-loader-spinner" />
    <span className="page-loader-text">Loading...</span>
  </div>
);

/**
 * Auth page paths where the bottom navigation should be hidden.
 */
const AUTH_PATHS = ['/auth/login', '/auth/register'];

/**
 * Layout wrapper that conditionally renders the BottomNavigation.
 */
const AppLayout = ({ children }) => {
  const location = useLocation();
  const isAuthPage = AUTH_PATHS.some((path) => location.pathname.startsWith(path));

  return (
    <div className="app-layout">
      <main className={`app-main ${isAuthPage ? 'app-main-full' : 'app-main-with-nav'}`}>
        <React.Suspense fallback={<PageLoader />}>{children}</React.Suspense>
      </main>
      {!isAuthPage && <BottomNavigation />}
      <ToastContainer />
    </div>
  );
};

/**
 * Main App component.
 * Provides auth, socket, and theme contexts, then renders routes.
 */
const App = () => {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <SocketProvider>
            <AppLayout>
              <Routes>
                {/* Main pages */}
                <Route path="/" element={<HomePage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/explore/map" element={<MapViewPage />} />
                <Route path="/discover" element={<DiscoverPage />} />

                {/* Chat */}
                <Route path="/chat" element={<ChatPage />} />
                <Route path="/chat/:roomId" element={<ChatRoomPage />} />

                {/* Profile */}
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/:userId" element={<ProfilePage />} />

                {/* Business */}
                <Route path="/business/dashboard" element={<BusinessDashboardPage />} />
                <Route path="/business/create-event" element={<CreateEventPage />} />
                <Route path="/business/:businessId" element={<BusinessDetailPage />} />

                {/* Events */}
                <Route path="/event/:eventId" element={<EventDetailPage />} />

                {/* Settings & utilities */}
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/notifications" element={<NotificationsPage />} />
                <Route path="/search" element={<SearchPage />} />

                {/* Auth */}
                <Route path="/auth/login" element={<LoginPage />} />
                <Route path="/auth/register" element={<RegisterPage />} />
              </Routes>
            </AppLayout>
          </SocketProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;

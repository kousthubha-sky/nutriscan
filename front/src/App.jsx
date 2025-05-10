import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import Login from './components/auth/login';
import Home from './components/home/home';
import Signup from './components/auth/signup';
import ForgotPassword from './components/auth/ForgotPassword';
import { Sidebar } from './components/product/sidebar';
import { ThemeProvider } from './components/ui/theme-provider';
import Navbar from './components/shared/Navbar';
import { SettingsMenu } from './components/product/settings-menu';
import { UserProfile } from './components/product/user-profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminDashboard from './components/dashboard/AdminDashboard';

// Protected route componentxx
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
};

function AppContent() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  // Hide sidebar on auth pages
  const hideOnPaths = ['/login', '/signup', '/forgot-password'];
  const shouldShowSidebar = !hideOnPaths.includes(location.pathname);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    // Clean up both user data and auth token
    localStorage.removeItem('user');
    localStorage.removeItem('authToken');
    return <Navigate to="/" />;
  };

  const handleAction = (action) => {
    switch (action) {
      case 'settings':
        setIsSettingsOpen(true);
        break;
      case 'profile':
        setIsProfileOpen(true);
        break;
      case 'logout':
        handleLogout();
        break;
      default:
        console.log(action);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Main layout container */}
      <div className="flex">
        {/* Sidebar - hidden on auth pages */}
        {shouldShowSidebar && (
          <Sidebar 
            user={user}
            onAction={handleAction}
          />
        )}

        {/* Main content */}
        <main className={`flex-1 w-full transition-all duration-300 ${shouldShowSidebar ? 'md:pl-64' : ''}`}>
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={setUser} />} />
            <Route path="/signup" element={<Signup onLogin={setUser} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              } 
            />
          </Routes>
        </main>
      </div>

      {/* Modals */}
      {isSettingsOpen && (
        <SettingsMenu 
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={user}
        />
      )}

      {isProfileOpen && (
        <UserProfile 
          isOpen={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          user={user}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <AppContent />
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

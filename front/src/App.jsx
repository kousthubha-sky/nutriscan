import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import Login from './components/auth/login';
import Home from './components/home/home';
import Signup from './components/auth/signup';
import { Sidebar } from './components/product/sidebar';
import { ThemeProvider } from './components/ui/theme-provider';
import Navbar from './components/shared/Navbar';
import { SettingsMenu } from './components/product/settings-menu';
import { UserProfile } from './components/product/user-profile';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminDashboard from './components/dashboard/AdminDashboard';

// Protected route component
const AdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  if (!user || user.role !== 'admin') {
    return <Navigate to="/" />;
  }
  return children;
};

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

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
        <div className="app-container flex min-h-screen bg-background text-foreground">
          {/* Static sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border">
            <div className="flex min-h-screen bg-background text-foreground">
              <Sidebar 
                user={user}
                onAction={handleAction}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex md:ml-64 pl-">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/login" element={<Login onLogin={setUser} />} />
              <Route path="/signup" element={<Signup onLogin={setUser} />} />
              <Route 
                path="/admin" 
                element={
                  <AdminRoute>
                    <AdminDashboard />
                  </AdminRoute>
                } 
              />
            </Routes>
          </div>

          {/* Settings Modal */}
          {isSettingsOpen && (
            <SettingsMenu 
              isOpen={isSettingsOpen}
              onClose={() => setIsSettingsOpen(false)}
            />
          )}

          {/* User Profile Modal */}
          {isProfileOpen && (
            <UserProfile 
              isOpen={isProfileOpen}
              onClose={() => setIsProfileOpen(false)}
              user={user}
            />
          )}
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState , useEffect } from 'react';
import './App.css';
import { Link } from 'react-router-dom';
import Login from './components/auth/login';
import Home from './components/home/home';
import Signup from './components/auth/signup';
import { Sidebar } from './components/product/sidebar';
import { ThemeProvider } from './components/ui/theme-provider';
import Navbar from './components/shared/Navbar';

function App() {
  const [user, setUser] = useState(() => {
    // Check if user data exists in localStorage
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    // Update localStorage when user state changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    // Redirect to home page after logout
    return <Navigate to="/" />;
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <BrowserRouter>
        <div className="app-container flex min-h-screen bg-background text-foreground">
          {/* Static sidebar */}
          <div className="fixed inset-y-0 left-0 w-64 bg-background border-r border-border">
            <div className="flex min-h-screen bg-background text-foreground">
              <Sidebar 
                user={user}
                onAction={(action) => {
                  if (action === 'logout') {
                    handleLogout()
                  } else {
                    console.log(action)
                  }
                }}
              />


            
              
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 md:ml-64 p-4">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/login" element={<Login onLogin={setUser} />} />
              <Route path="/signup" element={<Signup onLogin={setUser} />} />
            </Routes>
          </div>
        </div>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;

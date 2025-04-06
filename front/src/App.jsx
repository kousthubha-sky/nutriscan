import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Navbar from './components/shared/Navbar';
import Login from './components/auth/login';
import Home from './components/home/home';
import Signup from './components/auth/signup';
import { Sidebar } from './components/product/sidebar';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <BrowserRouter>
      <div className="app-container min-h-screen">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="flex"> {/* Remove justify-between */}
          {/* Sidebar - now on the left */}
          <div className="hidden md:block w-64 min-h-screen bg-gray-50 dark:bg-gray-800 border-r border-gray-200/10">
            <Sidebar onAction={(action) => console.log(action)} />
          </div>

          {/* Main content - after sidebar */}
          <div className="flex-1">
            <Routes>
              <Route path="/" element={<Home user={user} />} />
              <Route path="/login" element={<Login onLogin={setUser} />} />
              <Route path="/signup" element={<Signup onLogin={setUser} />} />
            </Routes>
          </div>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
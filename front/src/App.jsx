import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Navbar from './components/shared/Navbar';
import Login from './components/auth/login';
import Home from './components/home/home';
import Signup from './components/auth/signup';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    setUser(null);
    // Add any additional logout logic here (e.g., clearing local storage)
  };

  return (
    <BrowserRouter>
      <div className="app-container">
        <Navbar user={user} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<Login onLogin={setUser} />} />
          <Route path="/signup" element={<Signup onLogin={setUser} />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState } from 'react';
import './App.css';
import Login from './components/auth/login.jsx';
import Home from './components/home/home.jsx';
import Signup from './components/auth/signup.jsx';

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect to Home if logged in, otherwise go to Login */}
        <Route path="/" element={user ? <Home user={user} /> : <Navigate to="/login" />} />
        {/* Login Route */}
        <Route path="/login" element={<Login onLogin={setUser} />} />
        {/* Signup Route */}
        <Route path="/signup" element={<Signup onLogin={setUser} />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
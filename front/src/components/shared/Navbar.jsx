import { Link } from 'react-router-dom';

export default function Navbar({ user, onLogout }) {
  return (
    <nav className="navbar">
      <div className="nav-content">
        <Link to="/" className="nav-brand">
          NutriScan
        </Link>
        
        <div className="nav-links">
          {user ? (
            <>
              <span className="welcome-text">Welcome, {user.username}!</span>
              <button onClick={onLogout} className="nav-btn logout-btn">
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="nav-btn login-btn">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
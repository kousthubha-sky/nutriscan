// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, LogIn } from "lucide-react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    fetch("/api/user/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || "Login failed. Please check your credentials.");
          });
        }
        return response.json();
      })
      .then((data) => {
        localStorage.setItem('authToken', data.token);
        onLogin(data.user);
        toast.success("Welcome back! Login successful");
        if (data.user.role === 'admin') {
          navigate("/admin");
        } else {
          navigate("/");
        }
      })
      .catch(error => {
        console.error("Error:", error);
        setErrorMessage(error.message);
        toast.error(error.message);
      })
      .finally(() => setIsLoading(false));
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-gradient-to-br from-gray-900 to-gray-800">
      {/* Left side - Form */}
      <div className="flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              Welcome back
            </h1>
            <p className="text-gray-400">
              Please enter your credentials to access your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-200">
                  Username
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-gray-600 bg-gray-800/50 px-3 py-2 pl-11 text-sm ring-offset-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Enter your username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-200">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-gray-600 bg-gray-800/50 px-3 py-2 pl-11 text-sm ring-offset-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end">
              <Link
                to="/forgot-password"
                className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                Forgot your password?
              </Link>
            </div>

            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-md bg-red-500/10 border border-red-500/50 text-sm text-red-200"
              >
                {errorMessage}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="relative w-full h-11 px-4 flex items-center justify-center space-x-2 rounded-md bg-purple-600 font-medium text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <LogIn className="h-5 w-5" />
                  <span>Sign in</span>
                </>
              )}
            </button>

            <p className="text-center text-sm text-gray-400">
              Don't have an account?{" "}
              <Link to="/signup" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                Create one
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right side - Branding */}
      <div className="hidden lg:flex relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/CHGT.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-gray-900/90 backdrop-blur-sm" />
          <div className="relative h-full flex flex-col items-center justify-center text-center p-12 space-y-8">
            <h2 className="text-3xl font-bold text-white">NutriScan</h2>
            <p className="text-lg text-gray-300 max-w-md">
              Your trusted companion for making informed and healthy food choices
            </p>
            <div className="grid grid-cols-2 gap-4 w-full max-w-md">
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="mb-2">
                  <svg className="w-8 h-8 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Smart Analysis</h3>
                <p className="text-sm text-gray-300">Detailed nutritional impact assessment and health ratings</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="mb-2">
                  <svg className="w-8 h-8 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Food Safety</h3>
                <p className="text-sm text-gray-300">Ingredient analysis and allergen alerts</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="mb-2">
                  <svg className="w-8 h-8 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Personalized</h3>
                <p className="text-sm text-gray-300">Dietary preferences and restrictions tracking</p>
              </div>
              <div className="p-4 rounded-lg bg-white/10 backdrop-blur-sm">
                <div className="mb-2">
                  <svg className="w-8 h-8 mx-auto text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">Track Progress</h3>
                <p className="text-sm text-gray-300">Monitor your dietary habits over time</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
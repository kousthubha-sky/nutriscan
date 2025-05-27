// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff, Mail, Lock, UserPlus, ArrowRight } from "lucide-react";

export default function Signup({ onLogin }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  function handleSubmit(event) {
    event.preventDefault();
    setIsLoading(true);
    fetch("/api/user/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: username,
        email: email,
        password: password,
        role: 'user' // Always set to user for public signup
      })
    })
      .then(response => {
        if (!response.ok) {
          return response.json().then(data => {
            throw new Error(data.message || 'Signup failed');
          });
        }
        return response.json();
      })
      .then(() => {
        toast.success("Account created successfully!");
        return fetch("/api/user/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password })
        });
      })
      .then(response => {
        if (!response.ok) throw new Error('Login failed');
        return response.json();
      })
      .then(data => {
        localStorage.setItem('authToken', data.token);
        onLogin(data.user);
        navigate("/");
      })
      .catch(error => {
        console.error("Error:", error);
        setError(error.message);
        toast.error(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
              Create an account
            </h1>
            <p className="text-gray-400">
              Join NutriScan to make informed food choices
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-8">
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="username" className="text-sm font-medium text-gray-200">
                  Username
                </label>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-gray-600 bg-gray-800/50 px-3 py-2 pl-11 text-sm ring-offset-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="Choose a username"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-200">
                  Email address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex h-11 w-full rounded-md border border-gray-600 bg-gray-800/50 px-3 py-2 pl-11 text-sm ring-offset-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    placeholder="you@example.com"
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
                <p className="text-sm text-gray-400">Must be at least 5 characters long</p>
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 rounded-md bg-red-500/10 border border-red-500/50 text-sm text-red-200"
              >
                {error}
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
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create account</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-gray-900 px-2 text-gray-400">Or continue with</span>
              </div>
            </div>

            {/* <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                className="flex items-center justify-center gap-2 h-11 px-4 border border-gray-600 rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-sm font-medium">Google</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-center gap-2 h-11 px-4 border border-gray-600 rounded-md text-gray-300 bg-gray-800/50 hover:bg-gray-800 transition-colors"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span className="text-sm font-medium">GitHub</span>
              </button>
            </div> */}

            <p className="text-center text-sm text-gray-400">
              Already have an account?{" "}
              <Link to="/login" className="font-medium text-purple-400 hover:text-purple-300 transition-colors">
                Sign in instead
              </Link>
            </p>
          </form>
        </motion.div>
      </div>

      {/* Right side - Features */}
      <div className="hidden lg:flex relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/CHGT.png)' }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/90 to-gray-900/90 backdrop-blur-sm" />
          <div className="relative h-full flex flex-col items-center justify-center text-center p-12 space-y-12">
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-white">Join NutriScan Today</h2>
              <p className="text-lg text-gray-300 max-w-lg">
                Make informed decisions about your food choices with our advanced nutritional analysis tools.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
              <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">Instant Analysis</h3>
                <p className="text-gray-300">Get detailed nutritional information and health ratings with our smart barcode scanner</p>
              </div>
              <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">Health Insights</h3>
                <p className="text-gray-300">Understand the health impact of ingredients with our advanced rating system</p>
              </div>
              <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">Dietary Preferences</h3>
                <p className="text-gray-300">Set your dietary requirements and get personalized recommendations</p>
              </div>
              <div className="p-6 rounded-lg bg-white/10 backdrop-blur-sm">
                <h3 className="text-xl font-semibold text-white mb-2">Safety Alerts</h3>
                <p className="text-gray-300">Stay informed about allergens and artificial additives in your food</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
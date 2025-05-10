import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FloatingFoodIcons } from "../ui/floating-food-icons";
import { toast } from "react-toastify";

export default function Login({ onLogin }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const navigate = useNavigate();

    function handleSubmit(event) {
        event.preventDefault();
        setIsLoading(true);
        setErrorMessage("");

        fetch("http://localhost:3000/user/login", {
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
            // Store both user data and token
            localStorage.setItem('authToken', data.token);
            onLogin(data.user);
            toast.success("Welcome back! Login successful");
            // Redirect admins to admin dashboard, regular users to home
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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-black via-gray-900 to-emerald-950 animate-gradient-xy w-390">
            <FloatingFoodIcons className="absolute inset-0 z-0" />
            <div className="backdrop-blur-lg  p-8 rounded-xl shadow-2xl w-full max-w-md transform transition-all hover:scale-105">
                
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                    <p className="text-white/80">Sign in to continue your journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label htmlFor="username" className="block text-sm font-medium text-white">
                            Username
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                placeholder="Enter your username"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="password" className="block text-sm font-medium text-white">
                            Password
                        </label>
                        <div className="relative">
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                                placeholder="Enter your password"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end">
                        <Link 
                            to="/forgot-password"
                            className="text-sm text-white/80 hover:text-white underline transition-colors"
                        >
                            Forgot your password?
                        </Link>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-white text-purple-600 rounded-lg font-medium hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all transform hover:scale-[1.02] disabled:opacity-50"
                    >
                        {isLoading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Logging in...
                            </span>
                        ) : (
                            "Sign In"
                        )}
                    </button>

                    {errorMessage && (
                        <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
                            <p className="text-sm text-white text-center">{errorMessage}</p>
                        </div>
                    )}

                    <p className="text-center text-white mt-4">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-medium text-white hover:text-purple-200 underline transition-colors">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
}
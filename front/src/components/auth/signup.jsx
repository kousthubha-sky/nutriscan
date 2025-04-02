import { useState } from "react";
import { Link, useNavigate } from "react-router-dom"; // Add navigation import
export default function Signup({onLogin}) {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(""); // Add state for error handling
    const navigate = useNavigate(); // Add navigation hook

    function handleSubmit(event) {
        event.preventDefault(); // Add this line
        fetch("http://localhost:3000/user/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        })
        .then(response => {
            if (!response.ok) throw new Error('Signup failed');
            return response.json();
        })
        .then(() => {
            // Auto-login after successful signup
            return fetch("http://localhost:3000/user/login", {
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
            onLogin(data.user);
            navigate("/"); // Add navigation
        })
        .catch(error => {
            console.error("Error:", error);
            setError(error.message); // Add error handling
        });
    }

    return ( 

        <>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link
    href="https://cdn.jsdelivr.net/npm/flowbite@3.1.2/dist/flowbite.min.css"
    rel="stylesheet"
  />
  <title>Document</title>
  <form onSubmit={handleSubmit} method="post" className="max-w-sm mx-auto">
    {/* Username */}
    <label
      htmlFor="website-admin"
      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      Username
    </label>
    <div className="flex">
      <span className="inline-flex items-center px-3 text-sm text-gray-900 bg-gray-200 border border-e-0 border-gray-300 rounded-s-md dark:bg-gray-600 dark:text-gray-400 dark:border-gray-600">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 0a10 10 0 1 0 10 10A10.011 10.011 0 0 0 10 0Zm0 5a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm0 13a8.949 8.949 0 0 1-4.951-1.488A3.987 3.987 0 0 1 9 13h2a3.987 3.987 0 0 1 3.951 3.512A8.949 8.949 0 0 1 10 18Z" />
        </svg>
      </span>
      <input
        type="text"
        id="website-admin"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        name="username"
        className="rounded-none rounded-e-lg bg-gray-50 border border-gray-300 text-gray-900 focus:ring-blue-500 focus:border-blue-500 block flex-1 min-w-0 w-full text-sm p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="Bonnie Green"
      />
    </div>
    {/* Email */}
    <label
      htmlFor="email-address-icon"
      className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
    >
      Your Email
    </label>
    <div className="relative">
      <div className="absolute inset-y-0 start-0 flex items-center ps-3.5 pointer-events-none">
        <svg
          className="w-4 h-4 text-gray-500 dark:text-gray-400"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 20 16"
        >
          <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z" />
          <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z" />
        </svg>
      </div>
      <input
        type="text"
        id="email-address-icon"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        name="email"
        className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5  dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
        placeholder="name@flowbite.com"
      />
    </div>
    {/* Password */}
    <div className="mb-5">
      <label
        htmlFor="password"
        className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
      >
        Your password
      </label>
      <input
        type="password"
        id="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        name="password"
        className="shadow-xs bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 dark:shadow-xs-light"
        required=""
      />
    </div>
    {/* Register Button */}
    <button
      type="submit"
      onSubmit={handleSubmit}
      className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
    >
      Register new account
    </button>
    <p className="mt-4 text-sm">
        Already have an account? <Link to="/login" className="text-blue-600">Log in</Link>
    </p>
    {error && <p className="mt-4 text-sm text-red-600">{error}</p>} {/* Display error */}
  </form>
</>

       )}
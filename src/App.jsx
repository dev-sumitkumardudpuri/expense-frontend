import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";

function App() {
  // Retrieve the configured Google OAuth Client ID from application environment variables
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  // Development environment safeguard to alert when environment keys are uninitialized
  if (!googleClientId) {
    console.warn(
      "Configuration Warning: VITE_GOOGLE_CLIENT_ID is missing from your active .env workspace environment.",
    );
  }

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <Router>
        <Routes>
          {/* Public Landing Platform Route */}
          <Route path="/" element={<Home />} />

          {/* Protected Main Dashboard Workspace (Contains sub-tabs for Transactions, Profile, History) */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;

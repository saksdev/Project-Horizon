import { useState, useCallback } from "react";
import { LogIn, Key, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { InputField } from "../components/ui/InputField";
import { WorkspaceCard } from "../components/ui/WorkspaceCard";

/**
 * Modern Glassmorphic Login view page (FE-13.1 Authentication Fallback).
 */
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    setError("");
  }, []);

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
    setError("");
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (!email.trim() || !password.trim()) {
        setError("Both email and password are required.");
        return;
      }

      setIsSubmitting(true);
      setError("");

      // Simulate network authentication request
      setTimeout(() => {
        setIsSubmitting(false);
        // Save mock session token to browser localStorage
        localStorage.setItem("mock_token", "mock_auth_token_horizon_2026");
        localStorage.setItem("login_success", "true");
        // Force complete page sync and navigate to dashboard root
        navigate("/", { replace: true });
        window.location.reload(); // Hard reload to force MSW/Axios token rebinding
      }, 800);
    },
    [email, password, navigate]
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4">
      <div className="w-full max-w-md">
        <WorkspaceCard
          title="Horizon Gateway"
          description="Enter your administrator credentials to securely authenticate system access."
          icon={<LogIn className="w-5 h-5 text-blue-500 animate-pulse" />}
        >
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/25 text-red-400 rounded-xl text-xs font-semibold font-mono animate-slide-in">
                {error}
              </div>
            )}

            <InputField
              id="loginEmail"
              name="loginEmail"
              label="Email Address"
              type="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="e.g. admin@mekari.co.in"
              leftIcon={<Mail className="w-4 h-4" />}
              disabled={isSubmitting}
            />

            <InputField
              id="loginPassword"
              name="loginPassword"
              label="Secret Credentials"
              type="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="••••••••••••"
              leftIcon={<Key className="w-4 h-4" />}
              disabled={isSubmitting}
            />

            <div className="pt-2">
              <Button
                type="submit"
                disabled={isSubmitting || !email.trim() || !password.trim()}
                leftIcon={<LogIn className="w-4.5 h-4.5" />}
                className="w-full justify-center py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                {isSubmitting ? "Authenticating..." : "Sign In"}
              </Button>
            </div>
          </form>
        </WorkspaceCard>
      </div>
    </div>
  );
}

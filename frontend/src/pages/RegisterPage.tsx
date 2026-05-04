import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { authService } from "@/services/auth.service";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authService.register({ name, email, password });
      const res = await authService.login({ email, password });
      login(res.data.data.token, res.data.data.user);
      navigate("/");
    } catch {
      setError("Registration failed. Email may already be in use.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#F5F5F2",
        padding: "24px 16px",
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginBottom: 40,
          }}
        >
          <div
            style={{
              width: 40,
              height: 40,
              background: "#D1FF19",
              borderRadius: 10,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 800,
              fontSize: 20,
              color: "#111",
            }}
          >
            B
          </div>
          <span
            style={{
              fontWeight: 700,
              fontSize: 20,
              color: "#111",
              letterSpacing: "-0.02em",
            }}
          >
            Budget
          </span>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 36,
            border: "1px solid #EEEEE8",
            boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
          }}
        >
          <h1
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#111",
              margin: "0 0 6px",
              letterSpacing: "-0.02em",
            }}
          >
            Create account
          </h1>
          <p style={{ fontSize: 13, color: "#999", margin: "0 0 28px" }}>
            Start tracking your finances
          </p>

          <form
            onSubmit={handleSubmit}
            style={{ display: "flex", flexDirection: "column", gap: 16 }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#aaa",
                  letterSpacing: "0.07em",
                  marginBottom: 8,
                }}
              >
                NAME
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 8,
                  border: "1px solid #E5E5E0",
                  fontSize: 14,
                  color: "#333",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#aaa",
                  letterSpacing: "0.07em",
                  marginBottom: 8,
                }}
              >
                EMAIL
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 8,
                  border: "1px solid #E5E5E0",
                  fontSize: 14,
                  color: "#333",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 11,
                  fontWeight: 600,
                  color: "#aaa",
                  letterSpacing: "0.07em",
                  marginBottom: 8,
                }}
              >
                PASSWORD
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                style={{
                  width: "100%",
                  padding: "11px 14px",
                  borderRadius: 8,
                  border: "1px solid #E5E5E0",
                  fontSize: 14,
                  color: "#333",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {error && (
              <div
                style={{
                  fontSize: 13,
                  color: "#E05C5C",
                  padding: "10px 14px",
                  background: "#FDF8F8",
                  borderRadius: 8,
                  border: "1px solid #FDEAEA",
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "12px",
                borderRadius: 8,
                border: "none",
                background: "#D1FF19",
                color: "#111",
                fontSize: 14,
                fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Creating account…" : "Create Account"}
            </button>
          </form>

          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: "#999",
              marginTop: 24,
            }}
          >
            Already have an account?{" "}
            <Link
              to="/login"
              style={{ color: "#111", fontWeight: 600, textDecoration: "none" }}
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

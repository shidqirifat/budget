import { Link } from "react-router-dom";
import { useLoginForm } from "@/hooks/useLoginForm";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function LoginPage() {
  const {
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useLoginForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 py-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-10">
          <img
            src="/logo.png"
            alt="Budget"
            className="w-10 h-10 rounded-[10px] object-cover"
          />
          <span className="text-xl font-bold text-text-primary tracking-tight">
            Budget
          </span>
        </div>

        <div className="bg-surface-card rounded-2xl p-9 border border-border-default shadow-sm">
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight mb-1.5">
            Welcome back
          </h1>
          <p className="text-[13px] text-text-secondary mb-7">
            Sign in to your account
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
            <Input
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            {error && (
              <div className="text-[13px] text-text-expense px-3.5 py-2.5 bg-surface-error rounded-lg border border-border-default">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="mt-1">
              {loading ? "Signing in…" : "Sign In"}
            </Button>
          </form>

          <p className="text-center text-[13px] text-text-secondary mt-6">
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-text-primary font-semibold no-underline"
            >
              Register
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

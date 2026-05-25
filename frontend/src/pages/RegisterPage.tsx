import { Link } from "react-router-dom";
import { useRegisterForm } from "@/hooks/useRegisterForm";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const {
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    error,
    loading,
    handleSubmit,
  } = useRegisterForm();

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-primary px-4 py-6">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-bg-lime rounded-[10px] flex items-center justify-center font-extrabold text-xl text-text-primary">
            B
          </div>
          <span className="text-xl font-bold text-text-primary tracking-tight">
            Budget
          </span>
        </div>

        <div className="bg-surface-card rounded-2xl p-9 border border-border-default shadow-sm">
          <h1 className="text-[22px] font-bold text-text-primary tracking-tight mb-1.5">
            Create account
          </h1>
          <p className="text-[13px] text-text-secondary mb-7">
            Start tracking your finances
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="name"
              label="Name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
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
              minLength={8}
              placeholder="Min. 8 characters"
            />

            {error && (
              <div className="text-[13px] text-text-expense px-3.5 py-2.5 bg-surface-error rounded-lg border border-border-default">
                {error}
              </div>
            )}

            <Button type="submit" loading={loading} className="mt-1">
              {loading ? "Creating account…" : "Create Account"}
            </Button>
          </form>

          <p className="text-center text-[13px] text-text-secondary mt-6">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-text-primary font-semibold no-underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

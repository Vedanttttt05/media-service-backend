import { useState, type FormEvent, type ReactNode } from "react";
import { Link, useLocation } from "react-router";
import { errorMessage } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { FormError } from "../components/ui";

function AuthShell({ title, subtitle, children }: { title: string; subtitle: ReactNode; children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex items-center gap-2 font-semibold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-accent text-white">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true">
              <path d="M7 4v16l13-8z" />
            </svg>
          </span>
          StreamBox
        </div>
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mt-1 mb-6 text-sm text-muted">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}

export function LoginPage() {
  const { login } = useAuth();
  const location = useLocation();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      // GuestOnly redirects once the user is set.
      await login(identifier.trim(), password);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Sign in"
      subtitle={
        <>
          New here?{" "}
          <Link to="/register" state={location.state} className="font-medium text-accent hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div>
          <label className="label" htmlFor="identifier">Email or username</label>
          <input
            id="identifier"
            className="input"
            autoComplete="username"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            className="input"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <FormError message={error} />
        <button className="btn-primary mt-2" disabled={submitting}>
          {submitting ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </AuthShell>
  );
}

export function RegisterPage() {
  const { register } = useAuth();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const cover = form.get("coverImage");
    if (cover instanceof File && cover.size === 0) form.delete("coverImage");

    setError(null);
    setSubmitting(true);
    try {
      await register(form);
    } catch (err) {
      setError(errorMessage(err));
      setSubmitting(false);
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Already have one?{" "}
          <Link to="/login" state={location.state} className="font-medium text-accent hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-2 text-xs text-muted">
            {avatarPreview ? <img src={avatarPreview} alt="" className="size-full object-cover" /> : "Avatar"}
          </div>
          <div className="min-w-0 flex-1">
            <label className="label" htmlFor="avatar">Avatar (required)</label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/*"
              required
              className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-fg"
              onChange={(e) => {
                const file = e.target.files?.[0];
                setAvatarPreview(file ? URL.createObjectURL(file) : null);
              }}
            />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="fullName">Full name</label>
          <input id="fullName" name="fullName" className="input" autoComplete="name" required />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="username">Username</label>
            <input id="username" name="username" className="input" autoComplete="username" required />
          </div>
          <div>
            <label className="label" htmlFor="email">Email</label>
            <input id="email" name="email" type="email" className="input" autoComplete="email" required />
          </div>
        </div>
        <div>
          <label className="label" htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            className="input"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="coverImage">Cover image (optional)</label>
          <input
            id="coverImage"
            name="coverImage"
            type="file"
            accept="image/*"
            className="block w-full text-sm text-muted file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-3 file:py-1.5 file:text-sm file:text-fg"
          />
        </div>
        <FormError message={error} />
        <button className="btn-primary mt-2" disabled={submitting}>
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>
    </AuthShell>
  );
}

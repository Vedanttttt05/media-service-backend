import { useState, type FormEvent, type ReactNode } from "react";
import { errorMessage } from "../api/client";
import { usersApi } from "../api/endpoints";
import { useAuth, useCurrentUser } from "../auth/AuthContext";
import { Avatar, FormError, PageHeader } from "../components/ui";

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section className="card grid gap-6 p-6 md:grid-cols-[220px_1fr]">
      <div>
        <h2 className="font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-muted">{description}</p>
      </div>
      <div>{children}</div>
    </section>
  );
}

function Success({ message }: { message: string | null }) {
  if (!message) return null;
  return <p role="status" className="text-sm text-green-600 dark:text-green-400">{message}</p>;
}

/** Tracks one form's submit state so each settings section reports independently. */
function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function run(action: () => Promise<string>) {
    setBusy(true);
    setError(null);
    setSuccess(null);
    try {
      setSuccess(await action());
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return { busy, error, success, run };
}

export function SettingsPage() {
  const user = useCurrentUser();
  const { setUser } = useAuth();

  const details = useSubmit();
  const images = useSubmit();
  const password = useSubmit();

  function saveDetails(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    void details.run(async () => {
      const updated = await usersApi.updateDetails({
        fullName: String(form.get("fullName")),
        email: String(form.get("email")),
        username: String(form.get("username")),
      });
      setUser(updated);
      return "Profile updated.";
    });
  }

  function uploadImage(kind: "avatar" | "coverImage", file: File | undefined) {
    if (!file) return;
    const form = new FormData();
    form.append(kind, file);
    void images.run(async () => {
      const updated = kind === "avatar" ? await usersApi.updateAvatar(form) : await usersApi.updateCoverImage(form);
      setUser(updated);
      return kind === "avatar" ? "Avatar updated." : "Cover image updated.";
    });
  }

  function changePassword(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formEl = e.currentTarget;
    const form = new FormData(formEl);
    const next = String(form.get("newPassword"));
    void password.run(async () => {
      if (next !== form.get("confirmPassword")) throw new Error("New passwords don't match.");
      await usersApi.changePassword(String(form.get("currentPassword")), next);
      formEl.reset();
      return "Password changed.";
    });
  }

  const fileButton =
    "btn-secondary cursor-pointer has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50";

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-6">
      <PageHeader title="Settings" />

      <Section title="Channel images" description="Your avatar and the banner shown on your channel page.">
        <div className="mb-5 aspect-[6/1] min-h-20 overflow-hidden rounded-xl bg-gradient-to-r from-accent/70 to-surface-2">
          {user.coverImage && <img src={user.coverImage} alt="Cover" className="size-full object-cover" />}
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Avatar src={user.avatar} name={user.username} size={64} />
          <label className={fileButton}>
            Change avatar
            <input type="file" accept="image/*" className="sr-only" disabled={images.busy}
              onChange={(e) => uploadImage("avatar", e.target.files?.[0])} />
          </label>
          <label className={fileButton}>
            Change cover
            <input type="file" accept="image/*" className="sr-only" disabled={images.busy}
              onChange={(e) => uploadImage("coverImage", e.target.files?.[0])} />
          </label>
          {images.busy && <span className="text-sm text-muted">Uploading…</span>}
        </div>
        <div className="mt-3">
          <FormError message={images.error} />
          <Success message={images.success} />
        </div>
      </Section>

      <Section title="Profile" description="How you appear to other people.">
        <form onSubmit={saveDetails} className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="fullName">Full name</label>
            <input id="fullName" name="fullName" className="input" required defaultValue={user.fullName} />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="username">Username</label>
              <input id="username" name="username" className="input" required defaultValue={user.username} />
            </div>
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" className="input" required defaultValue={user.email} />
            </div>
          </div>
          <FormError message={details.error} />
          <Success message={details.success} />
          <div>
            <button className="btn-primary" disabled={details.busy}>Save profile</button>
          </div>
        </form>
      </Section>

      <Section title="Password" description="Use at least 6 characters.">
        <form onSubmit={changePassword} className="flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="currentPassword">Current password</label>
            <input id="currentPassword" name="currentPassword" type="password" className="input" autoComplete="current-password" required />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="newPassword">New password</label>
              <input id="newPassword" name="newPassword" type="password" className="input" autoComplete="new-password" minLength={6} required />
            </div>
            <div>
              <label className="label" htmlFor="confirmPassword">Confirm new password</label>
              <input id="confirmPassword" name="confirmPassword" type="password" className="input" autoComplete="new-password" minLength={6} required />
            </div>
          </div>
          <FormError message={password.error} />
          <Success message={password.success} />
          <div>
            <button className="btn-primary" disabled={password.busy}>Change password</button>
          </div>
        </form>
      </Section>
    </div>
  );
}

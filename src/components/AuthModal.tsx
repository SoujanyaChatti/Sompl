"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, Dna, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/auth";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setLoading(true);
    const fn = mode === "in" ? signIn : signUp;
    const { error } = await fn(email.trim(), password);
    setLoading(false);
    if (error) {
      setError(error);
      return;
    }
    if (mode === "up") {
      setNotice("Account created. You're signed in — start building your product's story.");
      setTimeout(onClose, 1200);
    } else {
      onClose();
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2"
            initial={{ opacity: 0, scale: 0.96, y: "-46%" }}
            animate={{ opacity: 1, scale: 1, y: "-50%" }}
            exit={{ opacity: 0, scale: 0.96 }}
          >
            <div className="card overflow-hidden p-6">
              <button onClick={onClose} className="absolute right-4 top-4 text-ink-faint hover:text-ink">
                <X size={18} />
              </button>
              <div className="mb-5 flex items-center gap-2.5">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-deep">
                  <Dna size={17} className="text-white" />
                </span>
                <div>
                  <h2 className="font-semibold leading-tight">
                    {mode === "in" ? "Welcome back" : "Create your account"}
                  </h2>
                  <p className="text-xs text-ink-faint">
                    {mode === "in" ? "Sign in to manage your products" : "Start recording your product's story"}
                  </p>
                </div>
              </div>

              <form onSubmit={submit} className="space-y-3">
                <input
                  type="email"
                  required
                  className="input"
                  placeholder="you@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                />
                <input
                  type="password"
                  required
                  minLength={6}
                  className="input"
                  placeholder="Password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {error && (
                  <p className="rounded-lg border border-danger/30 bg-danger/[0.08] px-3 py-2 text-xs text-danger">
                    {error}
                  </p>
                )}
                {notice && (
                  <p className="rounded-lg border border-success/30 bg-success/[0.08] px-3 py-2 text-xs text-success">
                    {notice}
                  </p>
                )}
                <button type="submit" disabled={loading} className="btn-primary w-full">
                  {loading ? <Loader2 size={15} className="animate-spin" /> : null}
                  {mode === "in" ? "Sign in" : "Create account"}
                </button>
              </form>

              <p className="mt-4 text-center text-xs text-ink-muted">
                {mode === "in" ? "New here? " : "Already have an account? "}
                <button
                  onClick={() => {
                    setMode(mode === "in" ? "up" : "in");
                    setError(null);
                  }}
                  className="font-medium text-brand-glow hover:underline"
                >
                  {mode === "in" ? "Create an account" : "Sign in"}
                </button>
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

"use client";

import Link from "next/link";
import { Dna, Plus, Activity } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { useState } from "react";
import { ActivityPanel } from "./ActivityPanel";
import { AuthModal } from "./AuthModal";
import { useAuth } from "@/lib/auth";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export function Nav() {
  const pathname = usePathname();
  const [activityOpen, setActivityOpen] = useState(false);
  const [authOpen, setAuthOpen] = useState(false);
  const { user, signOut, authEnabled } = useAuth();

  // hide global nav on public story pages (they own their chrome)
  if (pathname?.startsWith("/story/")) return null;

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-bg/70 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand to-brand-deep shadow-lg shadow-brand/30">
              <Dna size={18} className="text-white" />
              <span className="absolute inset-0 rounded-xl bg-brand/40 blur-md opacity-0 transition group-hover:opacity-60" />
            </span>
            <span className="text-[15px] font-semibold tracking-tight">
              Som<span className="text-brand-glow">pl</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            <NavLink href="/" active={pathname === "/"}>
              Museum
            </NavLink>
            <NavLink href="/products" active={pathname?.startsWith("/products")}>
              My Products
            </NavLink>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActivityOpen(true)}
              className="btn-ghost !px-3"
              title="Novus activity"
            >
              <Activity size={15} />
              <span className="hidden sm:inline">Activity</span>
            </button>
            <Link href="/products/new" className="btn-primary !px-3.5">
              <Plus size={15} />
              <span className="hidden sm:inline">New Product</span>
            </Link>

            {authEnabled && (
              user ? (
                <div className="flex items-center gap-1.5 pl-1">
                  <span
                    className="hidden items-center gap-1.5 rounded-lg border border-white/[0.06] bg-white/[0.03] px-2.5 py-1.5 text-xs text-ink-muted sm:flex"
                    title={user.email}
                  >
                    <span className="grid h-4 w-4 place-items-center rounded-full bg-brand/30 text-[9px] font-semibold text-brand-glow">
                      {user.displayName.charAt(0).toUpperCase()}
                    </span>
                    {user.displayName}
                  </span>
                  <button onClick={() => signOut()} className="btn-ghost !px-2.5" title="Sign out">
                    <LogOut size={15} />
                  </button>
                </div>
              ) : (
                <button onClick={() => setAuthOpen(true)} className="btn-ghost !px-3">
                  <LogIn size={15} />
                  <span className="hidden sm:inline">Sign in</span>
                </button>
              )
            )}
          </div>
        </div>
      </header>
      <ActivityPanel open={activityOpen} onClose={() => setActivityOpen(false)} />
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-1.5 text-sm font-medium transition",
        active ? "text-ink bg-white/[0.06]" : "text-ink-muted hover:text-ink"
      )}
    >
      {children}
    </Link>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { SocialSignInForm } from "@/components/auth/social-sign-in-form";
import { buttonVariants } from "@/components/ui/button";
import { getSession } from "@/lib/auth-guard";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to BFS Operations with your approved provider account.",
};

export default async function SignInPage() {
  const session = await getSession();

  if (session) {
    redirect("/");
  }

  const providers = [
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? "google" : null,
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET ? "github" : null,
  ].filter((provider): provider is "google" | "github" => provider !== null);

  return (
    <div className="relative min-h-screen items-center justify-center md:grid lg:grid-cols-2">
      <Link
        href="/"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute top-4 right-4 hidden md:top-8 md:right-8",
        )}
      >
        Back
      </Link>

      <div className="relative hidden h-full flex-col p-10 text-white lg:flex">
        <div className="absolute inset-0 bg-zinc-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(250,204,21,0.18),transparent_35%),radial-gradient(circle_at_bottom_right,rgba(34,197,94,0.18),transparent_30%)]" />

        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="mr-3 flex size-9 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-sm font-semibold">
            BFS
          </div>
          BFS Operations
        </div>

        <div className="relative z-20 mt-auto space-y-6">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/60">Operations Console</p>
            <h1 className="mt-3 max-w-md text-4xl font-semibold leading-tight">
              Centralize inventory, services, and store activity in one workspace.
            </h1>
          </div>

          <blockquote className="max-w-lg space-y-3 text-white/80">
            <p className="text-base leading-7">
              Use your company-approved Google Workspace or GitHub account to access the BFS operations dashboard.
            </p>
            <footer className="text-sm text-white/60">Business-first access for corporate and franchise teams.</footer>
          </blockquote>
        </div>
      </div>

      <div className="flex min-h-screen items-center justify-center p-6 lg:p-10">
        <div className="w-full max-w-md space-y-8">
          <div className="space-y-2 text-center lg:text-left">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-muted-foreground">Welcome back</p>
            <h2 className="text-3xl font-semibold tracking-tight">Sign in to BFS Operations</h2>
            <p className="text-sm text-muted-foreground">
              Choose the provider your team uses. Email and password sign-in is disabled for this workspace.
            </p>
          </div>

          <SocialSignInForm providers={providers} />

          <p className="text-center text-xs text-muted-foreground lg:text-left">
            Need access? Ask your administrator to grant you Google or GitHub sign-in for this workspace.
          </p>
        </div>
      </div>
    </div>
  );
}

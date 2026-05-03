"use client";

import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Provider = "github" | "google";

type SocialSignInFormProps = {
  providers: Provider[];
};

const providerLabel: Record<Provider, string> = {
  github: "Continue with GitHub",
  google: "Continue with Google",
};

export function SocialSignInForm({ providers }: SocialSignInFormProps) {
  const searchParams = useSearchParams();
  const [activeProvider, setActiveProvider] = useState<Provider | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const callbackURL = searchParams.get("callbackUrl") ?? "/";

  const handleSocialSignIn = (provider: Provider) => {
    setErrorMessage(null);
    setActiveProvider(provider);

    startTransition(async () => {
      const result = await authClient.signIn.social({
        provider,
        callbackURL,
        errorCallbackURL: "/sign-in",
      });

      if (result?.error) {
        setErrorMessage(result.error.message ?? `Unable to continue with ${provider}.`);
        setActiveProvider(null);
      }
    });
  };

  if (providers.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
        No social providers are configured yet. Add GitHub and/or Google OAuth credentials to enable sign-in.
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {providers.includes("google") && (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center"
          onClick={() => handleSocialSignIn("google")}
          disabled={isPending}
        >
          <GoogleIcon />
          <span>{activeProvider === "google" && isPending ? "Redirecting..." : providerLabel.google}</span>
        </Button>
      )}

      {providers.includes("github") && (
        <Button
          type="button"
          variant="outline"
          className="w-full justify-center"
          onClick={() => handleSocialSignIn("github")}
          disabled={isPending}
        >
          <GitHubIcon />
          <span>{activeProvider === "github" && isPending ? "Redirecting..." : providerLabel.github}</span>
        </Button>
      )}

      <p className="px-4 text-center text-sm text-muted-foreground">
        Use your approved provider account to access the BFS operations workspace.
      </p>

      {errorMessage && (
        <p className={cn("text-center text-sm text-destructive")}>{errorMessage}</p>
      )}
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="currentColor"
        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.009-.866-.014-1.699-2.782.605-3.369-1.344-3.369-1.344-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.071 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.091-.647.349-1.088.635-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.027 2.748-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.921.678 1.857 0 1.34-.012 2.421-.012 2.75 0 .268.18.58.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2Z"
      />
    </svg>
  );
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4">
      <path
        fill="#EA4335"
        d="M12 10.2v3.9h5.5c-.2 1.2-1.4 3.6-5.5 3.6-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 6.9 2.2 2.8 6.3 2.8 11.4S6.9 20.6 12 20.6c6.9 0 8.6-4.8 8.6-7.3 0-.5-.1-.9-.1-1.3H12Z"
      />
      <path
        fill="#34A853"
        d="M2.8 7.6 6 10c.9-1.8 2.8-3 5-3 1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.2 14.6 2.2 12 2.2 8.1 2.2 4.7 4.4 2.8 7.6Z"
      />
      <path
        fill="#4A90E2"
        d="M12 20.6c2.5 0 4.6-.8 6.1-2.2l-2.8-2.3c-.8.6-1.9 1-3.3 1-2.1 0-4-1.4-4.7-3.4L4.1 16c1.8 2.8 4.9 4.6 7.9 4.6Z"
      />
      <path
        fill="#FBBC05"
        d="M2.8 11.4c0 1.6.4 3.1 1.2 4.5l3.2-2.3c-.2-.6-.3-1.3-.3-2s.1-1.4.3-2L4 7.3c-.8 1.3-1.2 2.8-1.2 4.1Z"
      />
    </svg>
  );
}

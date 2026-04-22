import type { Metadata } from "next";
import {
  ClerkProvider,
  Show,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clerk Keyless Quickstart",
  description: "Next.js App Router app with Clerk keyless auth",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-stone-950 text-stone-50">
        <ClerkProvider>
          <div className="flex min-h-full flex-col">
            <header className="border-b border-white/10 bg-stone-950/90">
              <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between px-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-300/80">
                    Clerk + Next.js
                  </p>
                  <p className="text-xs text-stone-400">
                    App Router with keyless mode
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Show when="signed-out">
                    <SignInButton>
                      <button className="rounded-full border border-white/15 px-4 py-2 text-sm font-medium text-stone-100 transition hover:border-white/30 hover:bg-white/5">
                        Sign in
                      </button>
                    </SignInButton>
                    <SignUpButton>
                      <button className="rounded-full bg-amber-300 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-amber-200">
                        Sign up
                      </button>
                    </SignUpButton>
                  </Show>
                  <Show when="signed-in">
                    <UserButton />
                  </Show>
                </div>
              </div>
            </header>
            <main className="flex flex-1">{children}</main>
          </div>
        </ClerkProvider>
      </body>
    </html>
  );
}

import { auth } from "@clerk/nextjs/server";

export default async function Home() {
  const { userId } = await auth();

  return (
    <section className="mx-auto flex w-full max-w-5xl flex-1 px-6 py-16">
      <div className="grid w-full gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top_left,_rgba(251,191,36,0.18),_transparent_40%),linear-gradient(180deg,rgba(28,25,23,0.96),rgba(12,10,9,0.98))] p-10 shadow-2xl shadow-amber-950/20">
          <p className="mb-4 text-sm uppercase tracking-[0.3em] text-amber-300/80">
            Ready to test Clerk
          </p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
            Keyless auth is wired into this Next.js App Router project.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-stone-300">
            The navigation above is using Clerk&apos;s current App Router
            components, and this page is reading auth state on the server with
            <code className="mx-1 rounded bg-white/8 px-2 py-1 font-mono text-sm">
              await auth()
            </code>
            .
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-stone-400">Middleware</p>
              <p className="mt-2 font-medium text-white">
                proxy.ts uses clerkMiddleware()
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-stone-400">Layout</p>
              <p className="mt-2 font-medium text-white">
                ClerkProvider lives inside body
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm text-stone-400">Mode</p>
              <p className="mt-2 font-medium text-white">
                Keyless, no env vars required
              </p>
            </div>
          </div>
        </div>

        <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-8">
          <p className="text-sm uppercase tracking-[0.28em] text-stone-400">
            Session status
          </p>
          <div className="mt-6 rounded-2xl border border-white/10 bg-stone-950/70 p-5">
            <p className="text-sm text-stone-400">Current user</p>
            <p className="mt-2 font-mono text-sm text-amber-200">
              {userId ?? "signed-out"}
            </p>
          </div>
          <p className="mt-6 text-sm leading-7 text-stone-300">
            Use the header buttons to create your first test user. After sign-up,
            the avatar menu will replace the signed-out actions automatically.
          </p>
        </aside>
      </div>
    </section>
  );
}

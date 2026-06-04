import { getServerSession } from "next-auth/next";
import { authOptions } from "@/auth";
import { RoomScene } from "@/app/_components/room/RoomScene";
import { Button } from "@/app/_components/Button";

const LandingScreen = () => (
  <div className="page-center">
    <main className="home-card">
      <h1 className="page-title">Bookroom</h1>
      <p className="mt-3 text-sm text-zinc-600 dark:text-zinc-400">
        Your cozy personal library. Track what you read, what you love, and
        what&apos;s next.
      </p>
      <div className="auth-form">
        <div className="flex gap-3">
          <Button href="/login" variant="primary">Sign in</Button>
          <Button href="/signup" variant="secondary">Create account</Button>
        </div>
      </div>
    </main>
  </div>
);

export default async function Home() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return <LandingScreen />;

  const userName = session.user.name ?? session.user.email ?? "";
  return <RoomScene userName={userName} />;
}

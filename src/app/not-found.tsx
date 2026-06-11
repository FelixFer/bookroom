import { Button } from '@/app/_components/Button'
import { GoBackButton } from '@/app/_components/GoBackButton'

export default function NotFound() {
  return (
    <div className="page-center">
      <div
        className="pointer-events-none fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat dark:hidden"
        style={{ backgroundImage: "url('/not-found-day.png')" }}
      />
      <div
        className="pointer-events-none fixed inset-0 -z-10 hidden bg-cover bg-center bg-no-repeat dark:block"
        style={{ backgroundImage: "url('/not-found-night.png')" }}
      />
      <div className="pointer-events-none fixed inset-0 -z-10 bg-white/20 dark:bg-black/30" />

      <div className="not-found-card">
        <h1 className="page-title text-4xl">404</h1>
        <p className="not-found-card__lead">How did you get here?</p>
        <p className="not-found-card__note">This page seems to have vanished from the library.</p>
        <p className="not-found-card__note">Nothing remains here except an old book and a quiet room.</p>

        <div className="mt-6 flex justify-center gap-3">
          <Button variant="filled" href="/">
            Back to Room
          </Button>
          <GoBackButton />
        </div>
      </div>
    </div>
  )
}

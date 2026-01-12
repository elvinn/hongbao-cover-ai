import { SignIn } from '@clerk/nextjs'

export default function SignInPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <SignIn
        appearance={{
          elements: {
            rootBox: 'mx-auto w-full max-w-md',
            card: 'shadow-lg rounded-xl',
          },
        }}
        fallbackRedirectUrl="/"
      />
    </div>
  )
}

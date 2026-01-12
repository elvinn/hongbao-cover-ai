import { SignUp } from '@clerk/nextjs'

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <SignUp
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

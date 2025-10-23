// SignUpPage: Clerk-Komponente für die Registrierung.
import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <SignUp appearance={{ variables: { colorPrimary: '#00D8FF' } }} />
    </div>
  );
}

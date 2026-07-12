import SignupForm from '@/modules/fleet-identity/components/SignupForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Signup — TransitOps',
  description: 'Create a new account on TransitOps.',
};

export default function SignupPage() {
  return <SignupForm />;
}

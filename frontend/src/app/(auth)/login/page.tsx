import LoginForm from '@/modules/fleet-identity/components/LoginForm';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Login — TransitOps',
  description: 'Log in to your TransitOps management account.',
};

export default function LoginPage() {
  return <LoginForm />;
}

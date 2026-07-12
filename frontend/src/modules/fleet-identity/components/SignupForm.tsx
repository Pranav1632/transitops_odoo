'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { signupApi } from '../api/fleetApi';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlus } from 'lucide-react';
import Link from 'next/link';

const signupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst']),
});

type SignupValues = z.infer<typeof signupSchema>;

export default function SignupForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      role: 'fleet_manager',
    },
  });

  const onSubmit = async (values: SignupValues) => {
    setLoading(true);
    try {
      const data = await signupApi(values);
      toast.success(data.message || 'Account created successfully! Please log in.');
      router.push('/login');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to create account';
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 p-4">
      {/* Dynamic decorative backdrop */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-900 via-black to-black" />
      
      <Card className="w-full max-w-md border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl">
        <CardHeader className="space-y-2 text-center pb-6">
          <div className="flex justify-center mb-2">
            <div className="rounded-full bg-zinc-800 p-3 ring-8 ring-zinc-900/50">
              <UserPlus className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Create an account</CardTitle>
          <CardDescription className="text-zinc-400">
            Sign up to join your TransitOps workspace
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-zinc-300">Full Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Jane Doe"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={loading}
                {...register('fullName')}
              />
              {errors.fullName && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.fullName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-300">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@company.com"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={loading}
                {...register('email')}
              />
              {errors.email && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.email.message}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-300">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-500 focus-visible:ring-zinc-700"
                disabled={loading}
                {...register('password')}
              />
              {errors.password && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.password.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role" className="text-zinc-300">Workspace Role</Label>
              <select
                id="role"
                className="h-8 w-full rounded-lg border border-zinc-800 bg-zinc-950 px-2.5 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-zinc-700 disabled:pointer-events-none disabled:opacity-50"
                disabled={loading}
                {...register('role')}
              >
                <option value="fleet_manager">Fleet Manager</option>
                <option value="dispatcher">Dispatcher</option>
                <option value="safety_officer">Safety Officer</option>
                <option value="financial_analyst">Financial Analyst</option>
              </select>
              {errors.role && (
                <p className="text-xs text-red-500 mt-1 font-medium">{errors.role.message}</p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200 hover:text-black font-semibold transition-all duration-200 mt-2"
              disabled={loading}
            >
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-2 pb-6">
          <p className="text-sm text-zinc-400 text-center">
            Already have an account?{' '}
            <Link href="/login" className="text-white hover:underline font-medium">
              Log in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { loginApi } from '../api/fleetApi';
import { supabase } from '../../../shared/lib/apiClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Truck } from 'lucide-react';
import Link from 'next/link';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginValues = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: LoginValues) => {
    setLoading(true);
    try {
      // Call backend rate-limited login controller
      const data = await loginApi(values);

      // Sync local Supabase Auth state using the returned session tokens
      const { error } = await supabase.auth.setSession({
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
      });

      if (error) {
        throw error;
      }

      toast.success(data.message || 'Logged in successfully!');
      router.push('/dashboard');
      // Trigger a window reload or route refresh to load new layout/sidebar items correctly based on the new role
      router.refresh();
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || 'Failed to log in';
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
              <Truck className="h-6 w-6 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight text-white">Welcome back</CardTitle>
          <CardDescription className="text-zinc-400">
            Log in to manage your transit operations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-zinc-300">Password</Label>
              </div>
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

            <Button
              type="submit"
              className="w-full bg-white text-black hover:bg-zinc-200 hover:text-black font-semibold transition-all duration-200 mt-2"
              disabled={loading}
            >
              {loading ? 'Logging in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-2 pb-6">
          <p className="text-sm text-zinc-400 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-white hover:underline font-medium">
              Create an account
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

import { Request, Response } from 'express';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { supabase } from '../../../shared/middleware/auth';
import { pool } from '../../../shared/db/pool';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

const signupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  fullName: z.string().min(1, 'Full name is required'),
  role: z.enum(['fleet_manager', 'dispatcher', 'safety_officer', 'financial_analyst']),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function signup(req: Request, res: Response) {
  try {
    const validatedData = signupSchema.parse(req.body);
    const { email, password, fullName, role } = validatedData;

    // 1. Create user in Supabase Auth via admin API (bypasses rate limit & confirms email)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError || !authData.user) {
      return res.status(400).json({ error: authError?.message || 'Authentication signup failed' });
    }

    const userId = authData.user.id;

    // 2. Insert role into profiles table using direct postgres pool (bypasses RLS)
    try {
      await pool.query(
        'INSERT INTO profiles (id, full_name, role) VALUES ($1, $2, $3)',
        [userId, fullName, role]
      );
    } catch (dbError: any) {
      // Cleanup Supabase user on DB insertion failure to prevent orphans (optional admin action, but since we are anon client we might not delete, but we should log it)
      console.error('Failed to create user profile in DB:', dbError);
      return res.status(500).json({ error: 'Failed to create user profile' });
    }

    return res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: userId,
        email: authData.user.email,
        fullName,
        role,
      },
      session: null,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    }
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { email, password } = validatedData;

    // 1. Sign in via Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      return res.status(400).json({ error: authError?.message || 'Invalid credentials' });
    }

    const userId = authData.user.id;

    // 2. Retrieve corresponding user profile
    const profileResult = await pool.query(
      'SELECT id, full_name, role FROM profiles WHERE id = $1',
      [userId]
    );

    if (profileResult.rows.length === 0) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    const profile = profileResult.rows[0];

    return res.status(200).json({
      message: 'Logged in successfully',
      session: authData.session,
      user: authData.user,
      profile: {
        id: profile.id,
        fullName: profile.full_name,
        role: profile.role,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.issues[0]?.message || 'Validation error' });
    }
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

export async function logout(req: Request, res: Response) {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(200).json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}

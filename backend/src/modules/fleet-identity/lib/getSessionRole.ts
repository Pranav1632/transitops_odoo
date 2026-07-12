import { pool } from '../../../shared/db/pool';

/**
 * Helper to get a user's role from their profile.
 * Importable read-only by other modules (Module B & C).
 * 
 * @param userId - The user's UUID from Supabase Auth
 * @returns The user's role or null if not found
 */
export async function getSessionRole(userId: string): Promise<string | null> {
  try {
    const result = await pool.query(
      'SELECT role FROM profiles WHERE id = $1',
      [userId]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0].role;
  } catch (error) {
    console.error(`Error in getSessionRole for user ${userId}:`, error);
    return null;
  }
}

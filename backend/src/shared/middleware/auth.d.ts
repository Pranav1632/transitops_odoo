import { Request, Response, NextFunction } from 'express';
export declare const supabase: import("@supabase/supabase-js").SupabaseClient<any, "public", "public", any, any>;
export interface AuthContext {
    userId: string;
    role: string;
}
declare global {
    namespace Express {
        interface Request {
            context?: AuthContext;
        }
    }
}
export declare function authMiddleware(req: Request, res: Response, next: NextFunction): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=auth.d.ts.map
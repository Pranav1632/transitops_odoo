"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
exports.authMiddleware = authMiddleware;
const express_1 = require("express");
const supabase_js_1 = require("@supabase/supabase-js");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';
if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('WARNING: SUPABASE_URL or SUPABASE_ANON_KEY is not defined in environment variables.');
}
exports.supabase = (0, supabase_js_1.createClient)(supabaseUrl, supabaseAnonKey);
async function authMiddleware(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
        }
        const token = authHeader.split(' ')[1];
        // Fetch user from Supabase auth
        const { data: { user }, error } = await exports.supabase.auth.getUser(token);
        if (error || !user) {
            return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }
        // Retrieve profile role
        const { data: profile, error: profileError } = await exports.supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single();
        if (profileError || !profile) {
            return res.status(403).json({ error: 'Forbidden: Profile role not established' });
        }
        req.context = {
            userId: user.id,
            role: profile.role,
        };
        next();
    }
    catch (error) {
        console.error('Auth middleware validation error:', error);
        return res.status(500).json({ error: 'Internal Server Error' });
    }
}
//# sourceMappingURL=auth.js.map
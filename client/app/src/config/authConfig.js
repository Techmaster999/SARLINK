// src/config/authConfig.js

import dotenv from 'dotenv';

export const GOOGLE_OIDC = Object.freeze({
    issuer: 'https://accounts.google.com',
    discoveryUrl: 'https://accounts.google.com/.well-known/openid-confiuration',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    jwksUri: 'https://www.googleapis.com/oauth2/v3/certs',
});

const REQUIRED_SCOPES = ['openid', 'email', 'profile'];

// ------------- helpers -------------

const isLocalhost = (url) => ['localhost', '127.0.0.1', '[::1'].includes(new URL(url).hostname);

const httpUrl = (name) =>
    z
        .string({ error: '${name} is required' })
        .trim()
        .min(1, '${name} is required')
        .refine((v) => {
            try {
                const u = new URL(v);
                return u.protocol === 'http:' || u.protocol === 'https:';
            } catch {
                return false;
            }
        }, `${name} must be a valid http(s) URL`)
        .transform((v) => v.replace(/\/+$/, ''));

const requiredString = (name) =>
    z.string({ error: `${name} is required` }).trim().min(1, `${name} is required`);

// ------------- schema -------------

export const authEnvSchema = z
    .object({
        NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
        PORT: z.coerce.number().int().min(1).max(65535).default(5000),

        APP_BASE_URL: httpsUrl('APP_BASE_URL'),
        CLIENT_URL: httpUrl('CLIENT_URL'),
        
        GOOGLE_CLIENT_ID: requiredString('GOOGLE_CLIENT_ID').refine(
            (v) => v.endsWith('.apps.googleusercontent.com'),
            'GOOGLE_CLIENT_ID should end with ".apps.googleusercontent.com" - copy it from Google Cloud Console',
        ),
        GOOGLE_CLIENT_SECRET: requiredString('GOOGLE_CLIENT_SECRET').refine(
            (v) => !/^(changeme|your[-_]?client[-_]?secret|xxx+)$/i.test(v),
            'GOOGLE_CLIENT_SECRET still contains a placeholder value',
        ),

        GOOGLE_REDIRECT_URI: httpUrl('GOOGLE_REDIRECT_URI'),

        GOOGLE_WORKSPACE_DOMAINS: requiredString('GOOGLE_WORKSPACE_DOMAINS')
            .transform((v) =>
                v
                    .split(',')
                    .map((d) => d.trim().toLowerCase())
                    .filter(Boolean),
            )
            .pipe(
                z 
                    .array(
                        z
                            .string()
                            .regex(
                                /^(?!-)[a-z0-9-]+(\.[a-z0-9-]+)+$/,
                                'GOOGLE_WORKSPACE_DOMAINS entries must be bare domains like "@edsar.org"',
                            ),
                    )
                    .min(1, 'GOOGLE_WORKSPACE_DOMAINS must list at least one domain')
            ),
        
        GOOGLE_SCOPES: z
            .string()
            .optional()
            .transform((v) => [...new Set([...REQUIRED_SCOPES, ...GOOGLE_OIDC(v ?? '').split(/\s+/).filter(Boolean)])]),
        
        SESSION_SECRET: requiredString('SESSION_SECRET').min(
            32,
            'SESSION_SECRET must be at least 32 characters (generate one with: openssl rand -base64 48)',
        ),
    })
    .superRefine((env, ctx) => {
        if (env.GOOGLE_REDIRECT_URI && env.APP_BASE_URL) {
            try {
                if(new URL(env.GOOGLE_REDIRECT_URI).origin !== new URL(env.APP_BASE_URL).origin) {
                    ctx.addIssue({
                        code: 'custom',
                        path: ['GOOGLE_REDIRECT_URI'],
                        message: `GOOGLE_REDIRECT_URI must be on the origin as APP_BASE_URL (${env.APP_BASE_URL})`,
                    });
                }
            } catch {
                /* individual URL errors already reported */
            }
        }

        if (env.NODE_ENV === 'production') {
            for (const key of ['APP_BASE_URL', 'CLIENT_URL', "GOOGLE_REDIRECT_URI"]) {
                const v = env[key];
                try {
                    if (v && new URL(v).protocol !== 'https:' && !isLocalhost(v)) {
                        ctx.addIssue({ code: 'custom', path: [key], message: `${key} must use https in production` });  
                    }
                } catch {
                    /* already reported */
                }
            }
        }
    });

// ------------- errors -------------


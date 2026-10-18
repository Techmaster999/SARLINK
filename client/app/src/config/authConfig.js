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
        }, '${name} must be a valid http(s) URL')
        .transform((v) => v.replace(/\/+$/, ''));

const requiredString = (name) =>
    z.string({ error: '${name} is required' }).trim().min(1, '${name} is required');

// ------------- helpers -------------

#!/usr/bin/env node
/**
 * One-time owner setup: lock a write credential behind your site password.
 *
 * Usage:
 *   PASSWORD='OurAtlas' TOKEN='ghp_...' node scripts/seal-secret.mjs
 *
 * Then commit the updated config.js.
 */
import { readFileSync, writeFileSync } from 'fs';
import { webcrypto } from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const crypto = webcrypto;
const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const configPath = join(root, 'config.js');

const password = process.env.PASSWORD || '';
const token = process.env.TOKEN || '';

if (!password || !token) {
  console.error('Set PASSWORD and TOKEN environment variables.');
  console.error("Example: PASSWORD='OurAtlas' TOKEN='ghp_...' node scripts/seal-secret.mjs");
  process.exit(1);
}

const textEncoder = new TextEncoder();

function bytesToBase64(bytes) {
  return Buffer.from(bytes).toString('base64');
}

async function deriveKey(pw, saltBytes) {
  const material = await crypto.subtle.importKey('raw', textEncoder.encode(pw), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt: saltBytes, iterations: 250000, hash: 'SHA-256' },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

const salt = crypto.getRandomValues(new Uint8Array(16));
const iv = crypto.getRandomValues(new Uint8Array(12));
const key = await deriveKey(password, salt);
const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, textEncoder.encode(token));

const authSalt = bytesToBase64(salt);
const authIv = bytesToBase64(iv);
const sealedSecret = bytesToBase64(new Uint8Array(cipher));

const next = `export const CONFIG = {
  owner: 'gracurdy',
  repo: 'Crunch',
  branch: 'main',
  tripsPath: 'data/trips.json',
  photosDir: 'assets/photos',
  // Password-locked save credential. Create/update with:
  //   PASSWORD='YourPassword' TOKEN='your_token' node scripts/seal-secret.mjs
  authSalt: '${authSalt}',
  authIv: '${authIv}',
  sealedSecret: '${sealedSecret}'
};
`;

writeFileSync(configPath, next);
console.log('Updated config.js. Commit and push so password-only sign-in works on the live site.');

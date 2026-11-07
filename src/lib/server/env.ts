/** Server-only environment access with clear errors. Never import from client components. */
export class ConfigError extends Error {}

export function env(name: string): string {
  const v = process.env[name];
  if (!v || !v.trim()) throw new ConfigError(`Missing environment variable ${name}`);
  return v.trim();
}

export const optionalEnv = (name: string, fallback = '') => (process.env[name] || fallback).trim();

export const isConfigured = (...names: string[]) => names.every((n) => !!process.env[n]?.trim());

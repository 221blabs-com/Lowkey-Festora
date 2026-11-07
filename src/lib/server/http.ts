import { NextResponse } from 'next/server';
import { ConfigError } from './env';

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });

export function handleError(e: unknown, where: string) {
  if (e instanceof ConfigError) {
    console.error(`[${where}]`, e.message);
    return json({ error: 'Registration is not configured yet. Please try again later.' }, 503);
  }
  console.error(`[${where}]`, e);
  return json({ error: 'Something went wrong. Please try again.' }, 500);
}

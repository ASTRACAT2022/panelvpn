import { test, expect, describe } from 'vitest';

const baseUrl = 'http://localhost:3001';

describe('API Integration', () => {
  test('health endpoint responds', async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveProperty('status', 'ok');
  });

  test('auth login returns token', async () => {
    const res = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@panelvpn.com', password: 'password' }),
    });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json).toHaveProperty('token');
    expect(json).toHaveProperty('user');
  });
});


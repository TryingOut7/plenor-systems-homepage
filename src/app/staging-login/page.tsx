'use client';

import { useState, FormEvent } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';

function LoginForm() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetch('/api/staging-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password, next: searchParams.get('next') }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError('Incorrect password.');
      return;
    }

    router.replace(data.next || '/');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F8F9FA',
        padding: '24px',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #E5E7EB',
          borderRadius: '12px',
          padding: '48px 40px',
          width: '100%',
          maxWidth: '400px',
        }}
      >
        <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1B2D4F', marginBottom: '8px' }}>
          Staging environment
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginBottom: '32px' }}>
          Enter the password to continue.
        </p>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className="form-input"
            style={{ marginBottom: '16px' }}
          />
          {error && (
            <p style={{ fontSize: '14px', color: '#DC2626', marginBottom: '12px' }}>{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Checking…' : 'Enter'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function StagingLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

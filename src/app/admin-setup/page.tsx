'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function AdminSetupPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSetup = async () => {
    setStatus('loading');
    try {
      const res = await fetch('/api/admin/setup', { method: 'POST' });
      const data = await res.json();
      if (!res.ok) {
        setStatus('error');
        setMessage(data.error || 'Something went wrong.');
      } else {
        setStatus('success');
        setMessage(data.message || 'You are now an admin!');
        setTimeout(() => router.push('/admin'), 2000);
      }
    } catch {
      setStatus('error');
      setMessage('Network error. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Admin Setup</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            First-time setup — promote your account to admin. Only works if no admin exists yet.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {status === 'success' && (
            <div className="flex items-center gap-3 p-4 bg-green-50 text-green-700 rounded-lg">
              <CheckCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{message} Redirecting…</p>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-3 p-4 bg-red-50 text-red-700 rounded-lg">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p className="text-sm">{message}</p>
            </div>
          )}
          <div className="space-y-3 text-sm text-muted-foreground bg-slate-50 rounded-lg p-4">
            <p className="font-medium text-slate-700">Before you proceed:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>You must be signed in to an account</li>
              <li>This only works if no admin exists yet</li>
              <li>After setup, manage admins from the Users page</li>
            </ul>
          </div>
          <Button
            className="w-full"
            onClick={handleSetup}
            disabled={status === 'loading' || status === 'success'}
          >
            {status === 'loading' ? 'Setting up…' : 'Make Me Admin'}
          </Button>
          <Button variant="outline" className="w-full" onClick={() => router.push('/admin')}>
            Go to Admin Panel
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

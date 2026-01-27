"use client";

import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, getDocs, limit, query } from 'firebase/firestore';

export default function FirestoreDebug() {
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [projectId, setProjectId] = useState<string>('unknown');
    const [message, setMessage] = useState('');
    const [docCount, setDocCount] = useState<number | null>(null);

    useEffect(() => {
        const checkConnection = async () => {
            try {
                // 1. Check Project ID (from config if possible, or inference)
                // Firebase SDK doesn't easily expose config back publicly, 
                // but we can check the env var we expect (Next.js inlines it)
                const configuredProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
                setProjectId(configuredProjectId || 'MISSING_ENV_VAR');

                if (!configuredProjectId) {
                    throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
                }

                // 2. Try a direct fetch (bypass hooks)
                const q = query(collection(db, 'documents'), limit(1));
                const snap = await getDocs(q);

                setDocCount(snap.size);
                setStatus('success');
                setMessage('Connected to Firestore');

            } catch (e: any) {
                console.error("Debug Error:", e);
                setStatus('error');
                setMessage(e.message || 'Unknown Connection Error');
            }
        };

        checkConnection();
    }, []);

    if (status === 'success') return null; // Hide if all good (or show mini badge?)

    return (
        <div className="fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-xl border text-xs font-mono max-w-sm bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800">
            <h3 className="font-bold border-b pb-2 mb-2">System Diagnostics</h3>

            <div className="space-y-1">
                <div className="flex justify-between">
                    <span className="text-gray-500">Project ID:</span>
                    <span className="font-bold">{projectId}</span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`${status === 'error' ? 'text-red-500' : 'text-blue-500'} font-bold`}>
                        {status.toUpperCase()}
                    </span>
                </div>

                <div className="flex justify-between">
                    <span className="text-gray-500">Message:</span>
                    <span className="text-red-600 truncate max-w-[150px]" title={message}>
                        {message}
                    </span>
                </div>
            </div>
        </div>
    );
}

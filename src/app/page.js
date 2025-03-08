'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';

export default function Home() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push('/chat');
    }
  }, [isAuthenticated, loading, router]);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="relative isolate overflow-hidden">
        <div className="mx-auto max-w-7xl px-6 py-24 sm:py-32 lg:px-8 lg:py-40">
          <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-6xl">
              Real-time Chat App
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
              Connect with friends and colleagues instantly. Our chat app provides seamless real-time 
              messaging, organized rooms, and an intuitive interface.
            </p>
            <div className="mt-10 flex items-center gap-x-6">
              <Link href="/register">
                <Button size="lg">
                  Get Started
                </Button>
              </Link>
              <Link 
                href="/login" 
                className="text-sm font-semibold leading-6 text-gray-900 dark:text-white"
              >
                Log in <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          
          <div className="mt-16 grid grid-cols-1 items-center gap-y-6 gap-x-8 lg:grid-cols-2">
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-lg">
              <div className="h-full w-full bg-gradient-to-br from-blue-400 to-indigo-600 p-8 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="flex justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16" suppressHydrationWarning>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Real-time Messaging</h2>
                  <p className="mt-2 text-gray-100">
                    Send and receive messages instantly with no delay
                  </p>
                </div>
              </div>
            </div>
            <div className="aspect-[4/3] overflow-hidden rounded-2xl bg-gray-100 dark:bg-gray-800 shadow-lg">
              <div className="h-full w-full bg-gradient-to-br from-purple-400 to-pink-600 p-8 flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="flex justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16" suppressHydrationWarning>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold">Chat Rooms</h2>
                  <p className="mt-2 text-gray-100">
                    Create or join rooms for organized discussions
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

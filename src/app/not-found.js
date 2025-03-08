import React from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 dark:text-white">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-700 dark:text-gray-300">Page Not Found</h2>
        <p className="mt-2 text-lg text-gray-600 dark:text-gray-400">
          The page you are looking for doesn't exist or has been moved.
        </p>
        
        <div className="mt-8">
          <Link href="/">
            <Button variant="primary" size="lg">
              Go to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

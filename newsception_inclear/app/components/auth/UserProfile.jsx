'use client';
import { useUser } from '@auth0/nextjs-auth0/client';
import { User, LogOut } from 'lucide-react';
import Link from 'next/link';

export default function UserProfile() {
  const { user, error, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
        <div className="w-20 h-4 bg-gray-200 animate-pulse rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 text-sm px-4 py-2">
        Error: {error.message}
      </div>
    );
  }

  if (!user) {
    return (
      <Link
        href="/api/auth/login"
        className="px-4 py-2 bg-[#1a1a1a] text-white font-serif font-semibold hover:bg-[#2c2c2c] transition-colors rounded"
      >
        Sign In
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-[#e0e0e0] rounded">
        {user.picture ? (
          <img
            src={user.picture}
            alt={user.name || 'User'}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#d4af37] flex items-center justify-center">
            <User className="w-5 h-5 text-white" />
          </div>
        )}
        <span className="font-serif text-sm text-[#1a1a1a]">
          {user.name || user.email}
        </span>
      </div>
      <Link
        href="/api/auth/logout"
        className="px-4 py-2 bg-[#f0f0f0] hover:bg-[#e0e0e0] text-[#1a1a1a] font-serif font-semibold transition-colors rounded flex items-center gap-2"
      >
        <LogOut className="w-4 h-4" />
        Sign Out
      </Link>
    </div>
  );
}


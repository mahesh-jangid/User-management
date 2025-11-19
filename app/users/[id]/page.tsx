'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { useParams } from 'next/navigation';

export default function UserDetailPage() {
  const params = useParams();
  const userId = parseInt(params.id as string);

  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await userAPI.fetchUser(userId);
      return res.data;
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  if (isError || !user) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center text-red-600 dark:text-red-400">User not found</div>
        <Link href="/" className="text-blue-600 dark:text-blue-400 hover:underline">
          Back to Users
        </Link>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      <Link
        href="/"
        className="text-blue-600 dark:text-blue-400 hover:underline mb-4 sm:mb-6 inline-block text-sm sm:text-base"
      >
        ← Back to Users
      </Link>

      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-4 sm:p-8">
        <div className="flex flex-col rounded-xl sm:flex-row items-start sm:items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
          <div className="flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-full font-bold text-2xl flex-shrink-0">
            {getInitials(user.name)}
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">
              {user.name}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base break-words">{user.company?.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {/* Contact Information */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Contact Information
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Email
                </label>
                <p className="text-gray-900 dark:text-white break-all text-sm sm:text-base">{user.email}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <p className="text-gray-900 dark:text-white text-sm sm:text-base">{user.phone}</p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Website
                </label>
                <p className="text-gray-900 dark:text-white break-all text-sm sm:text-base">
                  {user.website || 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Address
            </h2>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Street
                </label>
                <p className="text-gray-900 dark:text-white break-words text-sm sm:text-base">
                  {user.address?.street || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  City
                </label>
                <p className="text-gray-900 dark:text-white text-sm sm:text-base">
                  {user.address?.city || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Zip Code
                </label>
                <p className="text-gray-900 dark:text-white text-sm sm:text-base">
                  {user.address?.zipcode || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Company Information */}
        {user.company && (
          <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-gray-200 dark:border-gray-700">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
              Company Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Company Name
                </label>
                <p className="text-gray-900 dark:text-white break-words text-sm sm:text-base">
                  {user.company.name}
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Catch Phrase
                </label>
                <p className="text-gray-900 dark:text-white break-words text-sm sm:text-base">
                  {user.company.catchPhrase || 'N/A'}
                </p>
              </div>
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Business
                </label>
                <p className="text-gray-900 dark:text-white break-words text-sm sm:text-base">
                  {user.company.bs || 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

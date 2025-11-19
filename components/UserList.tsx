'use client';

import { useState, useMemo, Suspense } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { User } from '@/lib/store';
import dynamic from 'next/dynamic';
import Link from 'next/link';

const UserFormModal = dynamic(() => import('./UserFormModal'), { ssr: false });
const DeleteConfirmation = dynamic(() => import('./DeleteConfirmation'), { ssr: false });

// Loading skeleton component
function TableLoadingSkeleton() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-x-auto">
      <div className="hidden md:block sticky top-[12.8rem] max-h-96 overflow-y-auto scrollbar-hide">
        <div className="p-4 sm:p-6 space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-700 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
      <div className="md:hidden p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="space-y-3">
            <div className="h-12 bg-slate-700 rounded animate-pulse"></div>
            <div className="h-8 bg-slate-700 rounded animate-pulse"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

type UsersPage = {
  items: User[];
  total: number;
};

export default function UserList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCompany, setSelectedCompany] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<number | null>(null);

  const itemsPerPage = 3; // show 3 items per page
  const queryClient = useQueryClient();
  // Fetch a single page; `keepPreviousData` keeps the previous page in cache when switching
  const queryResult = useQuery({
    queryKey: ['users', currentPage, itemsPerPage],
    queryFn: async () => {
      const res = await userAPI.fetchUsers({ _page: currentPage, _limit: itemsPerPage });
      const total = Number(res.headers['x-total-count'] ?? res.data.length);
      return { items: res.data as User[], total } as UsersPage;
    },
  });

  const pageData = queryResult.data as UsersPage | undefined;
  const isLoading = queryResult.isLoading;

  const totalCount = pageData?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

  // currently visible items
  const currentPageItems: User[] = pageData?.items ?? [];

  // Get unique companies from current page (can be expanded later)
  const companies = useMemo(() => {
    return Array.from(new Set(currentPageItems.map((u) => u.company?.name).filter(Boolean))).sort() as string[];
  }, [currentPageItems]);

  // Apply client-side search / company filter and sort only to the currently visible page
  const filteredUsers = useMemo<User[]>(() => {
    let result = currentPageItems.filter((user: User) => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCompany = selectedCompany === 'all' || user.company?.name === selectedCompany;
      return matchesSearch && matchesCompany;
    });

    result.sort((a: User, b: User) => {
      const comparison = a.email.localeCompare(b.email);
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [currentPageItems, searchTerm, sortOrder, selectedCompany]);

  // Pagination indexes for the currently visible page
  const startIdx = (currentPage - 1) * itemsPerPage;

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setIsAddModalOpen(true);
  };

  const handleNext = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const handlePrev = () => setCurrentPage((p) => Math.max(1, p - 1));
  const handleGoToPage = (page: number) => setCurrentPage(Math.min(Math.max(1, page), totalPages));

  const handleCloseModal = () => {
    setIsAddModalOpen(false);
    setEditingUser(null);
  };

  const handleAddSuccess = () => {
    handleCloseModal();
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const handleDeleteSuccess = () => {
    setDeleteUserId(null);
    queryClient.invalidateQueries({ queryKey: ['users'] });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (isLoading) {
    return (
      <div className="space-y-6 bg-white dark:bg-slate-950">
        {/* Header - Show immediately */}
        <div className="sticky top-17 z-20 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 py-3 flex justify-between items-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-slate-100">Users</h2>
          <button
            disabled
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium opacity-50 cursor-not-allowed"
          >
            + Add User
          </button>
        </div>

        {/* Filters - Show immediately */}
        <div className="sticky top-[7.5rem] z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-4 rounded-lg shadow flex gap-3 flex-wrap">
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            disabled
            className="flex-1 min-w-64 px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg opacity-50 cursor-not-allowed"
          />
          <select value={sortOrder} disabled className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg opacity-50 cursor-not-allowed">
            <option value="asc">Email: A-Z</option>
            <option value="desc">Email: Z-A</option>
          </select>
          <select value={selectedCompany} disabled className="px-3 py-2 border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg opacity-50 cursor-not-allowed">
            <option value="all">All Companies</option>
          </select>
        </div>

        {/* Loading skeleton for table */}
        <TableLoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white dark:bg-slate-950">
      {/* Header */}
      <div className="sticky top-17 z-20 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 py-3 px-3 sm:px-0 flex justify-between items-center gap-2">
        <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-slate-100 truncate">Users</h2>
        <button
          onClick={() => {
            setEditingUser(null);
            setIsAddModalOpen(true);
          }}
          className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors cursor-pointer whitespace-nowrap"
        >
          + Add
        </button>
      </div>

      {/* Filters */}
      <div className="sticky top-[7.5rem] z-10 bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 p-3 sm:p-4 rounded-lg shadow flex gap-2 sm:gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="flex-1 min-w-48 sm:min-w-64 px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        />

        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="asc">Email: A-Z</option>
          <option value="desc">Email: Z-A</option>
        </select>

        <select
          value={selectedCompany}
          onChange={(e) => {
            setSelectedCompany(e.target.value);
            setCurrentPage(1);
          }}
          className="px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-slate-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="all">All Companies</option>
          {companies.map((comp) => (
            <option key={comp} value={comp}>
              {comp}
            </option>
          ))}
        </select>
      </div>

      {/* Table with Suspense for lazy loading - Desktop and Mobile responsive */}
      <Suspense fallback={<TableLoadingSkeleton />}>
      <div className="flex flex-col">
        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <div className="sticky top-[12.8rem] max-h-96 overflow-y-auto scrollbar-hide">
            <table className="w-full">
              <thead>
                <tr className="z-20 border-b border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-700 sticky top-0">
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Avatar</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Name</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Email</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Phone</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Company</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-sm font-semibold text-gray-900 dark:text-slate-100">Actions</th>
                </tr>
              </thead>
              <tbody>
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-full font-bold text-sm">
                          {getInitials(user.name)}
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <Link
                          href={`/users/${user.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {user.name}
                        </Link>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{user.email}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">{user.phone}</td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-slate-300">
                        {user.company?.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => handleEditClick(user)}
                          className="px-3 py-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded transition-colors text-xs sm:text-sm cursor-pointer"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteUserId(user.id)}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded transition-colors text-xs sm:text-sm cursor-pointer"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
        
        {/* Mobile Card View - Scrollable Container */}
        <div className="md:hidden bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden">
          <style>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
          <div className="max-h-96 overflow-y-auto scrollbar-hide space-y-3 p-4">
            {filteredUsers.length === 0 ? (
              <p className="text-center text-gray-500 dark:text-slate-400 py-8">No users found</p>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg p-4 space-y-3"
                >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-600 text-white rounded-full font-bold">
                    {getInitials(user.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/users/${user.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline font-semibold block truncate"
                    >
                      {user.name}
                    </Link>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 truncate">
                      {user.email}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Phone</p>
                    <p className="text-gray-900 dark:text-white truncate">{user.phone}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-gray-500 dark:text-slate-400">Company</p>
                    <p className="text-gray-900 dark:text-white truncate">{user.company?.name}</p>
                  </div>
                </div>
                
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => handleEditClick(user)}
                    className="flex-1 px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded text-sm font-medium transition-colors cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeleteUserId(user.id)}
                    className="flex-1 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded text-sm font-medium transition-colors cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-slate-800 p-3 sm:p-4 rounded-lg shadow">
        <div className="text-xs sm:text-sm text-gray-600 dark:text-slate-300 order-2 sm:order-1">
          Showing {startIdx + 1} to {startIdx + filteredUsers.length} of {totalCount}
        </div>
        <div className="flex gap-1 sm:gap-2 order-1 sm:order-2 flex-wrap justify-center">
          <button
            onClick={handlePrev}
            disabled={currentPage === 1}
            className="pagination-btn px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer"
          >
            Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => void handleGoToPage(page)}
              className={`pagination-btn px-2 sm:px-3 py-2 text-xs sm:text-sm rounded-lg cursor-pointer ${
                currentPage === page
                  ? 'bg-blue-600 text-white'
                  : 'border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-600'
              }`}
            >
              {page}
            </button>
          ))}
          <button
            onClick={() => void handleNext()}
            disabled={currentPage === totalPages}
            className="pagination-btn px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-slate-600 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>
      </Suspense>

      {/* Modals */}
      {isAddModalOpen && (
        <UserFormModal user={editingUser} onClose={handleCloseModal} onSuccess={handleAddSuccess} />
      )}
      {deleteUserId !== null && (
        <DeleteConfirmation userId={deleteUserId} onClose={() => setDeleteUserId(null)} onSuccess={handleDeleteSuccess} />
      )}
    </div>
  );
}

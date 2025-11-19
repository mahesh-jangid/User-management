'use client';

import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { userAPI } from '@/lib/api';
import { useStore, User } from '@/lib/store';

interface UserFormModalProps {
  user?: User | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function UserFormModal({
  user,
  onClose,
  onSuccess,
}: UserFormModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
  });

  const addActivityLog = useStore((state) => state.addActivityLog);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone,
        company: user.company?.name || '',
      });
    }
  }, [user]);

  // Add/Update mutation
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (user) {
        // Update existing
        const res = await userAPI.updateUser(user.id, data);
        return res.data;
      } else {
        // Create new
        const res = await userAPI.addUser(data);
        return res.data;
      }
    },
    onMutate: async (newData) => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<User[]>(['users']);

      if (user) {
        // optimistic update for edit
        queryClient.setQueryData<User[] | undefined>(['users'], (old = []) =>
          old.map((u) => (u.id === user.id ? { ...u, ...newData, company: { name: newData.company } } as any : u))
        );
      } else {
        // optimistic update for add: create temp id
        const tempId = Date.now();
        const created = {
          id: tempId,
          name: newData.name,
          email: newData.email,
          phone: newData.phone,
          company: { name: newData.company },
        } as User;
        queryClient.setQueryData<User[] | undefined>(['users'], (old = []) => [created, ...old]);
      }

      return { previous };
    },
    onError: (err, variables, context: any) => {
      if (context?.previous) {
        queryClient.setQueryData(['users'], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },

    onSuccess: (data) => {
      addActivityLog({
        action: user ? 'edit' : 'add',
        userName: formData.name,
        message: user
          ? `User "${formData.name}" updated`
          : `User "${formData.name}" added`,
      });
      // After server returns, call the onSuccess callback (which refetches)
      onSuccess();
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Dialog.Root open={true} onOpenChange={onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 w-[95%] max-w-md p-4 sm:p-6 border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
          <Dialog.Title className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4">
            {user ? 'Edit User' : 'Add New User'}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-6">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={mutation.isPending}
                className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mutation.isPending ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>

          {mutation.isError && (
            <div className="mt-3 sm:mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg text-sm">
              Error: {(mutation.error as any)?.message || 'Failed to save'}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

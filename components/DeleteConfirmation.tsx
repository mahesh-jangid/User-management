'use client';

import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@/lib/store';
import { userAPI } from '@/lib/api';
import { useStore } from '@/lib/store';

interface DeleteConfirmationProps {
  userId: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function DeleteConfirmation({
  userId,
  onClose,
  onSuccess,
}: DeleteConfirmationProps) {
  const addActivityLog = useStore((state) => state.addActivityLog);

  // Fetch the user to get their name
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await userAPI.fetchUser(userId);
      return res.data;
    },
  });

  // Delete mutation
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async () => {
      await userAPI.deleteUser(userId);
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ['users'] });
      const previous = queryClient.getQueryData<User[]>(['users']);
      queryClient.setQueryData<User[] | undefined>(['users'], (old) =>
        old?.filter((u) => u.id !== userId)
      );
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
    onSuccess: () => {
      if (user) {
        addActivityLog({
          action: 'delete',
          userName: user.name,
          message: `User "${user.name}" deleted`,
        });
      }
      onSuccess();
    },
  });

  const handleDelete = () => {
    mutation.mutate();
  };

  return (
    <AlertDialog.Root open={true} onOpenChange={onClose}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 w-full max-w-md p-6 border border-gray-200 dark:border-gray-700">
          <AlertDialog.Title className="text-lg font-bold text-gray-900 dark:text-white">
            Delete User
          </AlertDialog.Title>
          <AlertDialog.Description className="text-gray-600 dark:text-gray-400 mt-2">
            Are you sure you want to delete{' '}
            <strong>{user?.name || 'this user'}</strong>? This action cannot be
            undone.
          </AlertDialog.Description>

          <div className="flex justify-end gap-3 mt-6">
            <AlertDialog.Cancel asChild>
              <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={handleDelete}
                disabled={mutation.isPending}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mutation.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </AlertDialog.Action>
          </div>

          {mutation.isError && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded-lg">
              Error: {(mutation.error as any)?.message || 'Failed to delete'}
            </div>
          )}
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

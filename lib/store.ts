import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ActivityLogEntry {
  id: string;
  timestamp: Date;
  action: 'add' | 'edit' | 'delete';
  userName: string;
  message: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  company: {
    name: string;
  };
  address?: {
    street: string;
    city: string;
    zipcode: string;
  };
}

interface AppStore {
  // Auth & User
  loggedInUser: User | null;
  setLoggedInUser: (user: User) => void;

  // Dark Mode
  darkMode: boolean;
  toggleDarkMode: () => void;

  // Activity Log
  activityLog: ActivityLogEntry[];
  addActivityLog: (entry: Omit<ActivityLogEntry, 'id' | 'timestamp'>) => void;
  clearActivityLog: () => void;
}

export const useStore = create<AppStore>()(
  persist(
    (set) => ({
      loggedInUser: null,
      setLoggedInUser: (user) => set({ loggedInUser: user }),

      darkMode: false,
      toggleDarkMode: () =>
        set((state) => ({
          darkMode: !state.darkMode,
        })),

      activityLog: [],
      addActivityLog: (entry) =>
        set((state) => ({
          activityLog: [
            {
              ...entry,
              id: `${Date.now()}-${Math.random()}`,
              timestamp: new Date(),
            },
            ...state.activityLog,
          ],
        })),
      clearActivityLog: () => set({ activityLog: [] }),
    }),
    {
      name: 'app-store',
    }
  )
);

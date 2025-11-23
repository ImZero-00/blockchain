import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Zustand Store cho Authentication
 * Lưu trữ thông tin user và JWT token
 */
const useAuthStore = create(
  persist(
    (set) => ({
      // State
      user: null,
      token: null,
      isAuthenticated: false,

      // Actions
      login: (user, token) => {
        set({
          user,
          token,
          isAuthenticated: true
        });
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      updateUser: (userData) => {
        set((state) => ({
          user: { ...state.user, ...userData }
        }));
      },

      updateWallet: (walletAddress) => {
        set((state) => ({
          user: { ...state.user, walletAddress }
        }));
      }
    }),
    {
      name: 'auth-storage', // localStorage key
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);

export default useAuthStore;

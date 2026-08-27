import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useAuthStore = create()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,

      setAuth: (user, token) =>
        set({
          user,
          accessToken: token,
          isAuthenticated: true,
        }),
      clearAuth: () =>
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
        }),
      updateToken: (token) =>
        set({
          accessToken: token,
        }),
    }),
    {
      name: "auth-storage", // name of the item in storage (must be unique)
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

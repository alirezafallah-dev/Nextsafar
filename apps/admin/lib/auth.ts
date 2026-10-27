import api from "./api"

export interface User {
  id: string
  mobile: string
  firstName?: string
  lastName?: string
  email?: string
  roles: Array<{ name: string; displayName: string }>
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  user: User
}

export const auth = {
  login: async (mobile: string, password: string): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", { mobile, password })
    const { accessToken, refreshToken, user } = response.data.data
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", accessToken)
      localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))
    }
    return response.data.data
  },

  logout: async () => {
    try {
      const refreshToken = localStorage.getItem("refreshToken")
      if (refreshToken) await api.post("/auth/logout", { refreshToken })
    } catch {} finally {
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
      }
    }
  },

  getCurrentUser: (): User | null => {
    if (typeof window === "undefined") return null
    const userStr = localStorage.getItem("user")
    return userStr ? JSON.parse(userStr) : null
  },

  isAuthenticated: (): boolean => {
    if (typeof window === "undefined") return false
    return !!localStorage.getItem("accessToken")
  },

  hasRole: (role: string): boolean => {
    const user = auth.getCurrentUser()
    return user?.roles.some((r) => r.name === role) || false
  },

  isAdmin: (): boolean => auth.hasRole("admin") || auth.hasRole("super_admin"),
}

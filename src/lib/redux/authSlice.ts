import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Staff {
  id: string
  email: string
  name: string
  role: string
}

export interface AuthState {
  token: string | null
  staff: Staff | null
  permissions: string[]
  actorType: 'staff' | 'super_admin' | null
  twoFactorState: 'pending' | 'verified' | null
  isHydrated: boolean
}

const initialState: AuthState = {
  token: null,
  staff: null,
  permissions: [],
  actorType: null,
  twoFactorState: null,
  isHydrated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (
      state,
      action: PayloadAction<{
        token: string
        staff: Staff
        permissions: string[]
        actorType: 'staff' | 'super_admin'
      }>,
    ) => {
      state.token = action.payload.token
      state.staff = action.payload.staff
      state.permissions = action.payload.permissions
      state.actorType = action.payload.actorType
      state.twoFactorState = 'verified'
      state.isHydrated = true
    },
    setTwoFactorPending: (state) => {
      state.twoFactorState = 'pending'
    },
    setTwoFactorVerified: (state) => {
      state.twoFactorState = 'verified'
    },
    logout: (state) => {
      state.token = null
      state.staff = null
      state.permissions = []
      state.actorType = null
      state.twoFactorState = null
      state.isHydrated = true
    },
    hydrateAuth: (
      state,
      action: PayloadAction<{
        token: string | null
        staff: Staff | null
        permissions: string[]
        actorType: 'staff' | 'super_admin' | null
      }>,
    ) => {
      state.token = action.payload.token
      state.staff = action.payload.staff
      state.permissions = action.payload.permissions
      state.actorType = action.payload.actorType
      state.isHydrated = true
    },
  },
})

export const {
  setAuth,
  setTwoFactorPending,
  setTwoFactorVerified,
  logout,
  hydrateAuth,
} = authSlice.actions
export default authSlice.reducer

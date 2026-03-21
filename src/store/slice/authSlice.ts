import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Staff {
  id: string
  email: string
  name: string
  role: string
  avatar: string | null
}

export interface AuthState {
  token: string | null
  staff: Staff | null
  permissions: string[]
  actorType: 'staff' | 'super_admin' | null
  tempToken: string | null
  mustSetup2FA: boolean
  requiresTwoFactor: boolean
  twoFactorState: 'pending' | 'verified' | null
  isHydrated: boolean
}

const initialState: AuthState = {
  token: null,
  staff: null,
  permissions: [],
  actorType: null,
  tempToken: null,
  mustSetup2FA: false,
  requiresTwoFactor: false,
  twoFactorState: null,
  isHydrated: false,
}

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string>) => {
      state.token = action.payload
    },
    setCredentials: (
      state,
      action: PayloadAction<{
        token: string
        staff: Staff
      }>,
    ) => {
      state.token = action.payload.token
      state.staff = action.payload.staff
      state.actorType = 'staff'
      state.tempToken = null
      state.mustSetup2FA = false
      state.requiresTwoFactor = false
      state.twoFactorState = 'verified'
      state.isHydrated = true
    },
    setTempAuth: (
      state,
      action: PayloadAction<{
        tempToken: string
        mustSetup2FA?: boolean
        requiresTwoFactor?: boolean
      }>,
    ) => {
      state.token = null
      state.staff = null
      state.permissions = []
      state.actorType = null
      state.tempToken = action.payload.tempToken
      state.mustSetup2FA = Boolean(action.payload.mustSetup2FA)
      state.requiresTwoFactor = Boolean(action.payload.requiresTwoFactor)
      state.twoFactorState = 'pending'
    },
    setPermissions: (state, action: PayloadAction<string[]>) => {
      state.permissions = action.payload
    },
    setTwoFactorPending: (state) => {
      state.twoFactorState = 'pending'
    },
    setTwoFactorVerified: (state) => {
      state.twoFactorState = 'verified'
    },
    clearAuth: (state) => {
      state.token = initialState.token
      state.staff = initialState.staff
      state.permissions = initialState.permissions
      state.actorType = initialState.actorType
      state.tempToken = initialState.tempToken
      state.mustSetup2FA = initialState.mustSetup2FA
      state.requiresTwoFactor = initialState.requiresTwoFactor
      state.twoFactorState = initialState.twoFactorState
      state.isHydrated = initialState.isHydrated
    },
    setHydrated: (state) => {
      state.isHydrated = true
    },
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
      state.tempToken = null
      state.mustSetup2FA = false
      state.requiresTwoFactor = false
      state.twoFactorState = 'verified'
      state.isHydrated = true
    },
    logout: (state) => {
      state.token = initialState.token
      state.staff = initialState.staff
      state.permissions = initialState.permissions
      state.actorType = initialState.actorType
      state.tempToken = initialState.tempToken
      state.mustSetup2FA = initialState.mustSetup2FA
      state.requiresTwoFactor = initialState.requiresTwoFactor
      state.twoFactorState = initialState.twoFactorState
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
      state.tempToken = null
      state.mustSetup2FA = false
      state.requiresTwoFactor = false
      state.isHydrated = true
    },
  },
})

export const {
  setToken,
  setCredentials,
  setTempAuth,
  setPermissions,
  clearAuth,
  setHydrated,
  setAuth,
  setTwoFactorPending,
  setTwoFactorVerified,
  logout,
  hydrateAuth,
} = authSlice.actions
export default authSlice.reducer

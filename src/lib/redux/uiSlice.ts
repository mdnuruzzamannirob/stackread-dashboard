import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface UIState {
  sidebarCollapsed: boolean
  theme: 'light' | 'dark' | 'system'
  cmdkOpen: boolean
}

const initialState: UIState = {
  sidebarCollapsed: false,
  theme: 'system',
  cmdkOpen: false,
}

export const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload
    },
    setTheme: (state, action: PayloadAction<'light' | 'dark' | 'system'>) => {
      state.theme = action.payload
    },
    setCommandPaletteOpen: (state, action: PayloadAction<boolean>) => {
      state.cmdkOpen = action.payload
    },
  },
})

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setCommandPaletteOpen,
} = uiSlice.actions
export default uiSlice.reducer

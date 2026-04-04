import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useThemeStore = create(
  persist(
    (set, get) => ({
      theme: 'dark',
      accentColor: 'blue',
      compactMode: false,
      
      toggleTheme: () => {
        const newTheme = get().theme === 'dark' ? 'light' : 'dark'
        set({ theme: newTheme })
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(newTheme)
        get().applyTheme(newTheme, get().accentColor, get().compactMode)
      },
      
      setTheme: (theme) => {
        set({ theme })
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
        get().applyTheme(theme, get().accentColor, get().compactMode)
      },
      
      setAccentColor: (color) => {
        set({ accentColor: color })
        get().applyTheme(get().theme, color, get().compactMode)
      },
      
      setCompactMode: (enabled) => {
        set({ compactMode: enabled })
        get().applyTheme(get().theme, get().accentColor, enabled)
      },
      
      applyTheme: (theme, accentColor, compactMode) => {
        document.documentElement.classList.remove('light', 'dark')
        document.documentElement.classList.add(theme)
        
        const accentColors = {
          blue: { primary: '#3b82f6', secondary: '#8b5cf6' },
          purple: { primary: '#8b5cf6', secondary: '#a855f7' },
          emerald: { primary: '#10b981', secondary: '#14b8a6' },
          amber: { primary: '#f59e0b', secondary: '#f97316' },
          rose: { primary: '#f43f5e', secondary: '#fb7185' },
          cyan: { primary: '#06b6d4', secondary: '#22d3ee' },
        }
        
        const colors = accentColors[accentColor] || accentColors.blue
        document.documentElement.style.setProperty('--primary', colors.primary)
        document.documentElement.style.setProperty('--secondary', colors.secondary)
        
        document.documentElement.classList.toggle('compact', compactMode)
      },
      
      initTheme: () => {
        const state = get()
        get().applyTheme(state.theme, state.accentColor, state.compactMode)
      }
    }),
    {
      name: 'cryptofx-theme'
    }
  )
)

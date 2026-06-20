export const theme = {
  colors: {
    primary: '#6366F1',
    primaryDark: '#4F46E5',
    primaryLight: '#A5B4FC',
    accent: '#8B5CF6',

    sidebarBg: '#0D0C1D',
    sidebarText: '#A0A9C0',
    sidebarTextActive: '#FFFFFF',
    sidebarActiveBg: 'rgba(99,102,241,0.18)',
    sidebarBorder: 'rgba(255,255,255,0.07)',

    background: '#F0EFFE',
    surface: '#FFFFFF',

    text: '#111827',
    textSecondary: '#6B7280',
    textMuted: '#9CA3AF',
    textInverse: '#FFFFFF',

    border: '#E5E7EB',
    borderLight: '#F3F4F6',

    success: '#10B981',
    successBg: '#D1FAE5',
    successText: '#065F46',
    error: '#EF4444',
    errorBg: '#FEE2E2',
    errorText: '#991B1B',
    warning: '#F59E0B',
    warningBg: '#FEF3C7',
    warningText: '#92400E',

    indigo50: '#EEF2FF',
    indigo100: '#E0E7FF',
    indigo200: '#C7D2FE',
  },

  radius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    full: 999,
  },

  shadow: {
    card: {
      shadowColor: '#6366F1',
      shadowOpacity: 0.07,
      shadowRadius: 12,
      elevation: 3,
    },
    modal: {
      shadowColor: '#000',
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 10,
    },
  },
} as const;

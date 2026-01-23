
export const theme = {
    colors: {
        primary: '#4F46E5', // Indigo
        primaryDark: '#4338ca',
        secondary: '#EC4899', // Pink
        secondaryDark: '#db2777',
        background: '#F3F4F6',
        surface: '#FFFFFF',
        text: '#1F2937',
        textLight: '#6B7280',
        textWhite: '#FFFFFF',
        success: '#10B981',
        error: '#EF4444',
        warning: '#F59E0B',
    },
    gradients: {
        primary: ['#4F46E5', '#7C3AED'] as const, // Indigo to Purple
        secondary: ['#EC4899', '#8B5CF6'] as const, // Pink to Violet
        background: ['#E0E7FF', '#F3F4F6'] as const, // Very light indigo to gray
        card: ['#FFFFFF', '#F9FAFB'] as const,
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
    },
    borderRadius: {
        s: 8,
        m: 16,
        l: 24,
        round: 9999,
    },
    shadows: {
        small: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
        },
        medium: {
            shadowColor: '#4F46E5',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 5,
        },
        large: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 10 },
            shadowOpacity: 0.2,
            shadowRadius: 20,
            elevation: 10,
        },
    },
};

import { useCallback } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { format as dfnsFormat } from 'date-fns';

export const useFormatting = () => {
    const { userSettings } = useTheme();
    
    const dateFormat = userSettings?.preferences.dateFormat || 'MMMM d, yyyy';
    const timeFormat = userSettings?.preferences.timeFormat || '12h';

    const timeFormatString = timeFormat === '12h' ? 'p' : 'HH:mm';
    const dateTimeFormatString = `${dateFormat}, ${timeFormatString}`;

    const formatDate = useCallback((date: Date | string | null) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        return dfnsFormat(d, dateFormat);
    }, [dateFormat]);

    const formatTime = useCallback((date: Date | string | null) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        return dfnsFormat(d, timeFormatString);
    }, [timeFormatString]);

    const formatDateTime = useCallback((date: Date | string | null) => {
        if (!date) return '';
        const d = typeof date === 'string' ? new Date(date) : date;
        if (isNaN(d.getTime())) return '';
        return dfnsFormat(d, dateTimeFormatString);
    }, [dateTimeFormatString]);

    return { 
        formatDate, 
        formatTime, 
        formatDateTime,
        dateFormat,
        timeFormat: timeFormatString, // The string for format(), not '12h'/'24h'
        dateTimeFormat: dateTimeFormatString
    };
};

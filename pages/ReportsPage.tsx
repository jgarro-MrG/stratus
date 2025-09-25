import React, { useMemo, useState, useCallback } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import { TimeEntry } from '../types';
import * as api from '../services/api';
// FIX: Some date-fns functions were not found in the main module export.
// They are now imported directly from their submodules to fix resolution issues.
import {
    endOfWeek,
    eachDayOfInterval,
    isWithinInterval,
    format,
    endOfMonth,
    isSameDay,
    endOfDay,
} from 'date-fns';
import startOfWeek from 'date-fns/startOfWeek';
import subWeeks from 'date-fns/subWeeks';
import startOfMonth from 'date-fns/startOfMonth';
import subMonths from 'date-fns/subMonths';
import startOfDay from 'date-fns/startOfDay';
import { useFormatting } from '../hooks/useFormatting';
import { useToast } from '../contexts/ToastContext';
import { GoogleGenAI } from '@google/genai';
import Spinner from '../components/Spinner';

type Period = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth' | 'custom';

const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const DownloadIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
);

const SparklesIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m1-12a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1h-6a1 1 0 01-1-1V6zM17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    </svg>
);


const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-surface border border-border rounded-md shadow-lg">
        <p className="label text-text-primary">{`${label} : ${payload[0].value.toFixed(2)} hrs`}</p>
      </div>
    );
  }
  return null;
};

const formatMillisToHoursMinutes = (millis: number): string => {
    if (!millis || millis < 0) return '0h 0m';
    const totalMinutes = Math.floor(millis / (1000 * 60));
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
};

const ReportsPage: React.FC = () => {
    const { timeEntries, projects, clients } = useAppData();
    const { addToast } = useToast();
    const [period, setPeriod] = useState<Period>('thisWeek');
    const { formatTime, dateFormat } = useFormatting();
    const [summary, setSummary] = useState('');
    const [isSummaryLoading, setIsSummaryLoading] = useState(false);
    
    const [dateRange, setDateRange] = useState(() => {
        const now = new Date();
        return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
    });
    
    const handlePeriodChange = useCallback((newPeriod: Period) => {
        setPeriod(newPeriod);
        setSummary(''); // Clear summary when period changes
        if (newPeriod === 'custom') return;

        const now = new Date();
        let newRange = { start: now, end: now };
        switch (newPeriod) {
            case 'thisWeek':
                newRange = { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
                break;
            case 'lastWeek':
                const lastWeekDate = subWeeks(now, 1);
                newRange = { start: startOfWeek(lastWeekDate, { weekStartsOn: 1 }), end: endOfWeek(lastWeekDate, { weekStartsOn: 1 }) };
                break;
            case 'thisMonth':
                newRange = { start: startOfMonth(now), end: endOfMonth(now) };
                break;
            case 'lastMonth':
                const lastMonthDate = subMonths(now, 1);
                newRange = { start: startOfMonth(lastMonthDate), end: endOfMonth(lastMonthDate) };
                break;
        }
        setDateRange(newRange);
    }, []);

    const handleDateChange = (part: 'start' | 'end', dateString: string) => {
        if (!dateString) return;
        const date = new Date(dateString.replace(/-/g, '/')); // More reliable parsing
        setPeriod('custom');
        setSummary(''); // Clear summary when date changes
        setDateRange(prev => ({
            ...prev,
            [part]: part === 'start' ? startOfDay(date) : endOfDay(date)
        }));
    };

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);
    
    const filteredEntries = useMemo(() => {
        return timeEntries
          .filter(entry => !entry.isArchived && entry.endTime && isWithinInterval(entry.startTime, dateRange))
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }, [timeEntries, dateRange]);

    const handleGenerateSummary = async () => {
        if (!process.env.API_KEY) {
            addToast('Gemini API key is not configured.', 'error');
            return;
        }
        if (filteredEntries.length === 0) {
            addToast('There is no data to summarize for this period.', 'warning');
            return;
        }

        setIsSummaryLoading(true);
        setSummary('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const reportData = filteredEntries.map(entry => {
                const project = projectMap.get(entry.projectId);
                const client = project ? clientMap.get(project.clientId) : 'Unknown';
                const duration = formatMillisToHoursMinutes(entry.endTime!.getTime() - entry.startTime.getTime());
                return `- Client: ${client}, Project: ${project?.name || 'Unknown'}, Task: "${entry.description}", Duration: ${duration}`;
            }).join('\n');
            
            const totalDuration = formatMillisToHoursMinutes(
                filteredEntries.reduce((acc, entry) => acc + (entry.endTime!.getTime() - entry.startTime.getTime()), 0)
            );

            const prompt = `You are a professional project manager's assistant. Your task is to write a concise, clear, and professional summary based on a list of time entries. The summary should be suitable for a client report or an internal stakeholder update.

Here is the data for the period from ${format(dateRange.start, 'MMMM d, yyyy')} to ${format(dateRange.end, 'MMMM d, yyyy')}.
The total time tracked was ${totalDuration}.

Time Entries:
${reportData}

Based on this data, please generate a summary. Group activities by project or theme where possible. Highlight key accomplishments and the general focus of the work during this period. Write in complete sentences. Do not just list the tasks.
`;

            const stream = await ai.models.generateContentStream({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            for await (const chunk of stream) {
                setSummary(prev => prev + chunk.text);
            }
        } catch (error) {
            console.error("AI Summary Generation Error:", error);
            addToast('An error occurred while generating the summary.', 'error');
        } finally {
            setIsSummaryLoading(false);
        }
    };

    const dailySummaryData = useMemo(() => {
        if (!dateRange.start || !dateRange.end) return [];
        const intervalDays = eachDayOfInterval(dateRange);
        return intervalDays.map(day => {
            const entriesForDay = filteredEntries.filter(entry => isSameDay(entry.startTime, day));
            const totalMillis = entriesForDay.reduce((acc, entry) => acc + (entry.endTime!.getTime() - entry.startTime.getTime()), 0);
            return {
                name: format(day, 'EEE d'),
                hours: totalMillis / (1000 * 60 * 60),
            };
        });
    }, [filteredEntries, dateRange]);
    
    const projectTimeData = useMemo(() => {
        const projectTime: { [key: string]: number } = {};
        filteredEntries.forEach(entry => {
            const duration = entry.endTime!.getTime() - entry.startTime.getTime();
            projectTime[entry.projectId] = (projectTime[entry.projectId] || 0) + duration;
        });

        return Object.entries(projectTime)
            .map(([projectId, duration]) => ({
                name: projectMap.get(projectId)?.name || 'Unknown',
                hours: parseFloat((duration / (1000 * 60 * 60)).toFixed(2)),
            }))
            .sort((a, b) => b.hours - a.hours);
    }, [filteredEntries, projectMap]);
    
    const detailedSummary = useMemo(() => {
        const projectTotals: { [key: string]: { name: string; totalMillis: number } } = {};
        const dailyLogs: { [key: string]: (TimeEntry & { startTime: Date, endTime: Date | null })[] } = {};

        for (const entry of filteredEntries) {
            const duration = entry.endTime!.getTime() - entry.startTime.getTime();
            const project = projectMap.get(entry.projectId);
            const key = project?.name || 'Unknown';
            if (!projectTotals[key]) {
                 projectTotals[key] = { name: key, totalMillis: 0 };
            }
            projectTotals[key].totalMillis += duration;

            const dayKey = format(entry.startTime, 'yyyy-MM-dd');
            if (!dailyLogs[dayKey]) dailyLogs[dayKey] = [];
            dailyLogs[dayKey].push(entry);
        }
        
        return {
            projectTotals: Object.values(projectTotals).sort((a, b) => b.totalMillis - a.totalMillis),
            dailyLogs: Object.entries(dailyLogs)
        };
    }, [filteredEntries, projectMap]);

    const handlePrint = async () => {
        // 1. Fetch user settings to customize the report
        const userSettings = await api.getUserSettings();
        const { profile, preferences } = userSettings || {};
        const { reportSettings } = preferences || {};

        // 2. Fetch all data for a complete report, ignoring UI filters
        const allClients = await api.getClients(true);
        const allProjects = await api.getProjects(true);
        const allTimeEntries = await api.getTimeEntries(true);

        const clientMap = new Map(allClients.map(c => [c.id, c.name]));
        const projectMap = new Map(allProjects.map(p => ({
            ...p,
            clientName: clientMap.get(p.clientId) || 'Unknown Client'
        })).map(p => [p.id, p]));
    
        const printableEntries = allTimeEntries
          .filter(entry => entry.endTime && isWithinInterval(entry.startTime, dateRange))
          .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
        // 3. Generate the text report string
        let reportText = '';
    
        // Header
        reportText += '======================================\n';
        reportText += '         STRATUS TIME REPORT\n';
        reportText += '======================================\n\n';
        
        // User Info Header
        if (profile && reportSettings) {
            reportText += 'FROM:\n';
            if (reportSettings.includeName && profile.name) reportText += `${profile.name}\n`;
            if (reportSettings.includeEmail && profile.email) reportText += `${profile.email}\n`;
            if (reportSettings.includePhone && profile.phone) reportText += `${profile.phone}\n`;
            reportText += '\n';
        }

        const dateFormatStr = preferences?.dateFormat || 'MMMM d, yyyy';
        const timeFormatStr = preferences?.timeFormat === '24h' ? 'HH:mm' : 'p';

        reportText += `Date Range: ${format(dateRange.start, dateFormatStr)} - ${format(dateRange.end, dateFormatStr)}\n\n`;
    
        // Project Summary
        const projectTotals = printableEntries.reduce((acc, entry) => {
            const projectId = entry.projectId;
            if (!entry.endTime) return acc;
            const duration = entry.endTime.getTime() - entry.startTime.getTime();
            acc[projectId] = (acc[projectId] || 0) + duration;
            return acc;
        }, {} as {[key: string]: number});
    
        reportText += '-------------------\n';
        reportText += '  PROJECT SUMMARY\n';
        reportText += '-------------------\n';
        for (const projectId in projectTotals) {
            const project = projectMap.get(projectId);
            const totalMillis = projectTotals[projectId];
            reportText += `${project?.name || 'Unknown Project'} (${project?.clientName || 'Unknown Client'}): ${formatMillisToHoursMinutes(totalMillis)}\n`;
        }
        reportText += '\n\n';
    
        // Detailed Log
        const entriesByDay = printableEntries.reduce((acc, entry) => {
            const dayKey = format(entry.startTime, 'yyyy-MM-dd');
            if (!acc[dayKey]) acc[dayKey] = [];
            acc[dayKey].push(entry);
            return acc;
        }, {} as {[key: string]: (TimeEntry & { startTime: Date, endTime: Date | null })[]});
    
        reportText += '-------------------\n';
        reportText += '    DETAILED LOG\n';
        reportText += '-------------------\n';
    
        const sortedDays = Object.keys(entriesByDay).sort();
    
        for (const day of sortedDays) {
            reportText += `\n--- ${format(new Date(day.replace(/-/g, '/')), `EEEE, ${dateFormatStr}`)} ---\n\n`;
            const entries = entriesByDay[day];
            for (const entry of entries) {
                const project = projectMap.get(entry.projectId);
                if (!entry.endTime) continue;
                const duration = entry.endTime.getTime() - entry.startTime.getTime();
                const timeRange = `${format(entry.startTime, timeFormatStr)} - ${format(entry.endTime, timeFormatStr)}`;
                reportText += `  Project: ${project?.name} (${project?.clientName})\n`;
                reportText += `  Task:    ${entry.description}\n`;
                reportText += `  Time:    ${timeRange} (${formatMillisToHoursMinutes(duration)})\n`;
                reportText += `  ------------------------------------\n`;
            }
        }
    
        // 4. Open a new window and print
        const printWindow = window.open('', '_blank', 'height=600,width=800');
        if (printWindow) {
            printWindow.document.write(`<html><head><title>Print Report</title></head><body><pre style="font-family: 'Courier New', Courier, monospace; font-size: 12px;">${reportText}</pre></body></html>`);
            printWindow.document.close();
            printWindow.focus();
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 250);
        }
    };
    
    const handleExportCSV = () => {
        const escapeCsvField = (field: any): string => {
            const str = String(field);
            if (str.includes(',') || str.includes('"') || str.includes('\n')) {
                return `"${str.replace(/"/g, '""')}"`;
            }
            return str;
        };
        
        const formatMillisToHmsString = (millis: number): string => {
            if (!millis || millis < 0) return '00:00:00';
            const totalSeconds = Math.floor(millis / 1000);
            const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
            const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
            const seconds = (totalSeconds % 60).toString().padStart(2, '0');
            return `${hours}:${minutes}:${seconds}`;
        };

        const headers = ['Date', 'Client', 'Project', 'Description', 'Start Time', 'End Time', 'Duration (h:m:s)', 'Duration (decimal)'];
        
        const sortedEntries = [...filteredEntries].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

        const rows = sortedEntries.map(entry => {
            const project = projectMap.get(entry.projectId);
            const clientName = project ? clientMap.get(project.clientId) || 'Unknown Client' : 'Unknown Client';
            const durationMs = entry.endTime ? entry.endTime.getTime() - entry.startTime.getTime() : 0;

            return [
                format(entry.startTime, 'yyyy-MM-dd'),
                clientName,
                project?.name || 'Unknown Project',
                entry.description,
                format(entry.startTime, 'HH:mm:ss'),
                entry.endTime ? format(entry.endTime, 'HH:mm:ss') : '',
                formatMillisToHmsString(durationMs),
                (durationMs / (1000 * 60 * 60)).toFixed(4)
            ].map(escapeCsvField);
        });

        let csvContent = headers.join(',') + '\n' + rows.map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const startDate = format(dateRange.start, 'yyyy-MM-dd');
            const endDate = format(dateRange.end, 'yyyy-MM-dd');
            link.setAttribute("href", url);
            link.setAttribute("download", `stratus_report_${startDate}_to_${endDate}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    const renderDetailedReport = () => (
        <>
            {filteredEntries.length > 0 ? (
                <div className="space-y-8">
                    <div>
                        <h2 className="text-xl font-semibold text-text-primary mb-4">Project Totals</h2>
                        <div className="overflow-x-auto">
                            <table className="min-w-full text-left">
                                <thead className="border-b border-border bg-background">
                                    <tr>
                                        <th className="p-3 font-semibold text-text-secondary">Project</th>
                                        <th className="p-3 font-semibold text-text-secondary text-right">Total Time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {detailedSummary.projectTotals.map(p => (
                                        <tr key={p.name} className="border-b border-border last:border-b-0">
                                            <td className="p-3 font-medium text-text-primary">{p.name}</td>
                                            <td className="p-3 text-right font-semibold text-text-primary">{formatMillisToHoursMinutes(p.totalMillis)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div>
                        <h2 className="text-xl font-semibold text-text-primary mb-4 border-t border-border pt-6">Time Log</h2>
                        <div className="space-y-6">
                            {detailedSummary.dailyLogs.map(([day, entries]) => (
                                <div key={day}>
                                    <h3 className="font-semibold text-text-primary text-lg mb-3">{format(new Date(day.replace(/-/g, '/')), `EEEE, ${dateFormat}`)}</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full text-left text-sm">
                                            <thead className="bg-background">
                                                <tr className="border-b border-border">
                                                    <th className="p-2 font-semibold text-text-secondary w-1/2">Description</th>
                                                    <th className="p-2 font-semibold text-text-secondary">Project</th>
                                                    <th className="p-2 font-semibold text-text-secondary text-right">Time Range</th>
                                                    <th className="p-2 font-semibold text-text-secondary text-right">Duration</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {entries.map(entry => {
                                                    const project = projectMap.get(entry.projectId);
                                                    const clientName = project ? clientMap.get(project.clientId) : 'Unknown';
                                                    return (
                                                        <tr key={entry.id} className="border-b border-border last:border-b-0">
                                                            <td className="p-2 text-text-primary">{entry.description}</td>
                                                            <td className="p-2 text-text-secondary">{project?.name} ({clientName})</td>
                                                            <td className="p-2 text-right text-text-secondary">{formatTime(entry.startTime)} - {formatTime(entry.endTime!)}</td>
                                                            <td className="p-2 text-right font-semibold text-text-primary">{formatMillisToHoursMinutes(entry.endTime!.getTime() - entry.startTime.getTime())}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <p className="text-text-secondary text-center py-8">No time entries found for the selected period.</p>
            )}
        </>
    );

    return (
        <div>
            <div className="screen-only space-y-8">
                <div className="flex flex-wrap justify-between items-center gap-4">
                    <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
                    <div className="flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                             <input 
                                type="date"
                                value={format(dateRange.start, 'yyyy-MM-dd')}
                                onChange={e => handleDateChange('start', e.target.value)}
                                className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                            <span className="text-text-secondary">to</span>
                            <input 
                                type="date"
                                value={format(dateRange.end, 'yyyy-MM-dd')}
                                onChange={e => handleDateChange('end', e.target.value)}
                                className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <select
                            value={period}
                            onChange={(e) => handlePeriodChange(e.target.value as Period)}
                            className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="thisWeek">This Week</option>
                            <option value="lastWeek">Last Week</option>
                            <option value="thisMonth">This Month</option>
                            <option value="lastMonth">Last Month</option>
                            <option value="custom">Custom</option>
                        </select>
                         <button
                            onClick={handleGenerateSummary}
                            disabled={isSummaryLoading}
                            className="flex items-center bg-secondary text-white font-semibold px-4 py-2 rounded-lg hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <SparklesIcon />
                            {isSummaryLoading ? 'Generating...' : 'Generate Summary'}
                        </button>
                    </div>
                </div>

                {(isSummaryLoading || summary) && (
                    <Card title="AI-Generated Summary">
                        {isSummaryLoading && !summary && (
                            <div className="flex items-center justify-center p-8">
                                <Spinner className="w-8 h-8 text-primary" />
                                <p className="ml-4 text-text-secondary">Generating your summary...</p>
                            </div>
                        )}
                        <div className="prose prose-sm dark:prose-invert max-w-none text-text-primary whitespace-pre-wrap">{summary}</div>
                    </Card>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card title="Daily Hours Summary">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={dailySummaryData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                <CartesianGrid stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fill: 'rgb(var(--color-text-secondary))' }} stroke="rgb(var(--color-border))" />
                                <YAxis tick={{ fill: 'rgb(var(--color-text-secondary))' }} stroke="rgb(var(--color-border))" />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--color-primary), 0.1)' }} />
                                <Bar dataKey="hours" fill="rgb(var(--color-primary))" />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>

                    <Card title="Project Breakdown">
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={projectTimeData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <CartesianGrid stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" tick={{ fill: 'rgb(var(--color-text-secondary))', width: 100 }} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--color-primary), 0.1)' }}/>
                                <Legend />
                                <Bar dataKey="hours" name="Hours" fill="rgb(var(--color-primary-dark))" barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </Card>
                </div>

                <Card title="Detailed Report">
                    <div className="flex justify-end gap-2 mb-4 -mt-12">
                        <button
                            onClick={handleExportCSV}
                            className="flex items-center bg-background border border-border text-text-secondary font-semibold px-4 py-2 rounded-lg hover:bg-border transition-colors text-sm"
                        >
                            <DownloadIcon />
                            Export CSV
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center bg-background border border-border text-text-secondary font-semibold px-4 py-2 rounded-lg hover:bg-border transition-colors text-sm"
                        >
                            <PrintIcon />
                            Print Report
                        </button>
                    </div>
                    {renderDetailedReport()}
                </Card>
            </div>
        </div>
    );
};

export default ReportsPage;
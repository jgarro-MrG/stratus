import React, { useMemo, useState } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import { TimeEntry } from '../types';
// FIX: Corrected date-fns imports to explicitly use the default export, resolving "not callable" errors with sub-path imports.
import { default as startOfWeek } from 'date-fns/startOfWeek';
import { default as endOfWeek } from 'date-fns/endOfWeek';
import { default as eachDayOfInterval } from 'date-fns/eachDayOfInterval';
import { default as isWithinInterval } from 'date-fns/isWithinInterval';
import { default as format } from 'date-fns/format';
import { default as subWeeks } from 'date-fns/subWeeks';
import { default as startOfMonth } from 'date-fns/startOfMonth';
import { default as endOfMonth } from 'date-fns/endOfMonth';
import { default as subMonths } from 'date-fns/subMonths';
import { default as isSameDay } from 'date-fns/isSameDay';

type Period = 'thisWeek' | 'lastWeek' | 'thisMonth' | 'lastMonth';

const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
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
    const [period, setPeriod] = useState<Period>('thisWeek');

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);
    const clientMap = useMemo(() => new Map(clients.map(c => [c.id, c.name])), [clients]);
    
    const dateRange = useMemo(() => {
        const now = new Date();
        switch (period) {
            case 'thisWeek':
                return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) };
            case 'lastWeek':
                const lastWeekDate = subWeeks(now, 1);
                return { start: startOfWeek(lastWeekDate, { weekStartsOn: 1 }), end: endOfWeek(lastWeekDate, { weekStartsOn: 1 }) };
            case 'thisMonth':
                return { start: startOfMonth(now), end: endOfMonth(now) };
            case 'lastMonth':
                const lastMonthDate = subMonths(now, 1);
                return { start: startOfMonth(lastMonthDate), end: endOfMonth(lastMonthDate) };
        }
    }, [period]);
    
    const filteredEntries = useMemo(() => {
        return timeEntries
          .filter(entry => entry.endTime && isWithinInterval(entry.startTime, dateRange))
          .sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
    }, [timeEntries, dateRange]);

    const dailySummaryData = useMemo(() => {
        const intervalDays = eachDayOfInterval(dateRange);
        return intervalDays.map(day => {
            const entriesForDay = filteredEntries.filter(entry => isSameDay(entry.startTime, day));
            const totalMillis = entriesForDay.reduce((acc, entry) => acc + (entry.endTime!.getTime() - entry.startTime.getTime()), 0);
            return {
                name: format(day, period === 'thisWeek' || period === 'lastWeek' ? 'EEE' : 'd'),
                hours: totalMillis / (1000 * 60 * 60),
            };
        });
    }, [filteredEntries, dateRange, period]);
    
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
        const dailyLogs: { [key: string]: TimeEntry[] } = {};

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

    const handlePrint = () => window.print();

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center print-hidden">
                <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
                <div className="flex items-center gap-4">
                    <select
                        value={period}
                        onChange={(e) => setPeriod(e.target.value as Period)}
                        className="px-3 py-2 border border-border rounded-lg bg-surface focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="thisWeek">This Week</option>
                        <option value="lastWeek">Last Week</option>
                        <option value="thisMonth">This Month</option>
                        <option value="lastMonth">Last Month</option>
                    </select>
                     <button
                        onClick={handlePrint}
                        className="flex items-center bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        <PrintIcon />
                        Print Report
                    </button>
                </div>
            </div>
             <div className="text-center print:block hidden">
                <h1 className="text-3xl font-bold text-black">Time Report</h1>
                <p className="text-lg text-gray-600">{format(dateRange.start, 'MMMM d, yyyy')} - {format(dateRange.end, 'MMMM d, yyyy')}</p>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 print-hidden">
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
                        <BarChart data={projectTimeData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                             <CartesianGrid stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
                             <XAxis dataKey="name" hide />
                             <YAxis tick={{ fill: 'rgb(var(--color-text-secondary))' }} stroke="rgb(var(--color-border))" />
                             <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--color-primary), 0.1)' }}/>
                             <Legend />
                             <Bar dataKey="hours" name="Hours per Project" fill="rgb(var(--color-primary-dark))" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <Card title="Detailed Report" className="printable-report-card">
                {filteredEntries.length > 0 ? (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-semibold text-text-primary mb-4">Project Totals</h3>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-left">
                                    <thead className="border-b border-border">
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
                            <h3 className="text-xl font-semibold text-text-primary mb-4 border-t border-border pt-6">Time Log</h3>
                            <div className="space-y-6">
                                {detailedSummary.dailyLogs.map(([day, entries]) => (
                                    <div key={day}>
                                        <h4 className="font-semibold text-text-primary text-lg mb-3">{format(new Date(day), 'EEEE, MMMM d')}</h4>
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
                                                                <td className="p-2 text-right text-text-secondary">{format(entry.startTime, 'p')} - {format(entry.endTime!, 'p')}</td>
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
            </Card>
        </div>
    );
};

export default ReportsPage;
import React from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { Client, Project, TimeEntry } from '../types';
import Card from '../components/Card';
import { Link } from 'react-router-dom';
import { useFormatting } from '../hooks/useFormatting';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
// FIX: `subDays` must be imported from its submodule to resolve the module export error.
import { isToday, isThisWeek, isThisMonth, format, isSameDay } from 'date-fns';
import subDays from 'date-fns/subDays';
import EmptyState from '../components/EmptyState';

const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'In progress';
    const durationMs = end.getTime() - start.getTime();
    if (durationMs < 0) return '0h 0m';
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

const formatMillisToHours = (millis: number): string => {
    if (millis < 0) return '0.0';
    return (millis / (1000 * 60 * 60)).toFixed(1);
};

const RecentActivityItem: React.FC<{ entry: TimeEntry & { startTime: Date, endTime: Date | null }, project?: Project, client?: Client }> = ({ entry, project, client }) => {
    const { formatDate } = useFormatting();
    return (
        <div className="flex items-center justify-between py-3">
            <div>
                <p className="font-semibold text-text-primary">{entry.description || 'No description'}</p>
                <p className="text-sm text-text-secondary">
                    {project?.name || 'Unknown Project'} ({client?.name || 'Unknown Client'})
                </p>
            </div>
            <div className="text-right flex-shrink-0 ml-4">
                <p className="font-semibold text-text-primary">{formatDuration(entry.startTime, entry.endTime)}</p>
                <p className="text-sm text-text-secondary">{formatDate(entry.startTime)}</p>
            </div>
        </div>
    );
};

const StatCard: React.FC<{ title: string; value: string; unit: string }> = ({ title, value, unit }) => (
    <Card>
        <p className="text-sm font-medium text-text-secondary">{title}</p>
        <p className="mt-1 text-3xl font-bold text-text-primary">
            {value} <span className="text-lg font-medium text-text-secondary">{unit}</span>
        </p>
    </Card>
);

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="p-2 bg-surface border border-border rounded-md shadow-lg">
                <p className="label text-text-primary">{`${label} : ${payload[0].value.toFixed(1)} hrs`}</p>
            </div>
        );
    }
    return null;
};

const DashboardPage: React.FC = () => {
    const { timeEntries, projects, clients, loading } = useAppData();
    
    const projectMap = new Map(projects.map(p => [p.id, p]));
    const clientMap = new Map(clients.map(c => [c.id, c]));

    const recentEntries = timeEntries.filter(entry => !entry.isArchived).slice(0, 5);

    const completedEntries = React.useMemo(() => timeEntries.filter(e => e.endTime && !e.isArchived), [timeEntries]);

    const dashboardStats = React.useMemo(() => {
        let todayMillis = 0;
        let weekMillis = 0;
        let monthMillis = 0;

        completedEntries.forEach(entry => {
            const duration = entry.endTime!.getTime() - entry.startTime.getTime();
            if (isToday(entry.startTime)) todayMillis += duration;
            if (isThisWeek(entry.startTime, { weekStartsOn: 1 })) weekMillis += duration;
            if (isThisMonth(entry.startTime)) monthMillis += duration;
        });

        return {
            today: formatMillisToHours(todayMillis),
            thisWeek: formatMillisToHours(weekMillis),
            thisMonth: formatMillisToHours(monthMillis),
        };
    }, [completedEntries]);

    const weeklyChartData = React.useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), i)).reverse();
        
        return last7Days.map(day => {
            const entriesForDay = completedEntries.filter(entry => isSameDay(entry.startTime, day));
            const totalMillis = entriesForDay.reduce((acc, entry) => acc + (entry.endTime!.getTime() - entry.startTime.getTime()), 0);
            return {
                name: format(day, 'EEE'),
                hours: parseFloat((totalMillis / (1000 * 60 * 60)).toFixed(1)),
            };
        });
    }, [completedEntries]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Today" value={dashboardStats.today} unit="hours" />
                <StatCard title="This Week" value={dashboardStats.thisWeek} unit="hours" />
                <StatCard title="This Month" value={dashboardStats.thisMonth} unit="hours" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                <Card title="Recent Activity" className="lg:col-span-2">
                    {loading ? (
                        <p>Loading...</p>
                    ) : recentEntries.length > 0 ? (
                        <div className="divide-y divide-border">
                            {recentEntries.map(entry => {
                                const project = projectMap.get(entry.projectId);
                                const client = project ? clientMap.get(project.clientId) : undefined;
                                return <RecentActivityItem key={entry.id} entry={entry} project={project} client={client} />
                            })}
                        </div>
                    ) : (
                        <div className="pt-4">
                            <EmptyState title="No recent activity" message="Your latest time entries will appear here once you track some time.">
                                 <Link
                                    to="/timelog"
                                    className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors inline-block"
                                >
                                    Track Time
                                </Link>
                            </EmptyState>
                        </div>
                    )}
                </Card>

                <Card title="Last 7 Days" className="lg:col-span-3">
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={weeklyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid stroke="rgb(var(--color-border))" strokeDasharray="3 3" />
                            <XAxis dataKey="name" tick={{ fill: 'rgb(var(--color-text-secondary))' }} stroke="rgb(var(--color-border))" />
                            <YAxis tick={{ fill: 'rgb(var(--color-text-secondary))' }} stroke="rgb(var(--color-border))" unit="h"/>
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--color-primary), 0.1)' }} />
                            <Bar dataKey="hours" fill="rgb(var(--color-primary))" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );
};

export default DashboardPage;

import React, { useMemo } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
// FIX: Import date-fns functions from their specific paths to resolve module loading issues.
import startOfWeek from 'date-fns/startOfWeek';
import endOfWeek from 'date-fns/endOfWeek';
import eachDayOfInterval from 'date-fns/eachDayOfInterval';
import isSameDay from 'date-fns/isSameDay';
import format from 'date-fns/format';

const ReportsPage: React.FC = () => {
    const { timeEntries, projects } = useAppData();

    const projectMap = useMemo(() => new Map(projects.map(p => [p.id, p])), [projects]);

    const weeklySummaryData = useMemo(() => {
        const now = new Date();
        const weekStart = startOfWeek(now, { weekStartsOn: 1 });
        const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
        const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

        return daysInWeek.map(day => {
            const entriesForDay = timeEntries.filter(entry => isSameDay(entry.startTime, day) && entry.endTime);
            const totalMillis = entriesForDay.reduce((acc, entry) => {
                if (entry.endTime) {
                   return acc + (entry.endTime.getTime() - entry.startTime.getTime());
                }
                return acc;
            }, 0);
            const totalHours = totalMillis / (1000 * 60 * 60);

            return {
                name: format(day, 'EEE'),
                hours: parseFloat(totalHours.toFixed(2)),
            };
        });
    }, [timeEntries]);
    
    const projectTimeData = useMemo(() => {
        const projectTime: { [key: string]: number } = {};
        timeEntries.forEach(entry => {
            if (entry.endTime) {
                const duration = entry.endTime.getTime() - entry.startTime.getTime();
                if (!projectTime[entry.projectId]) {
                    projectTime[entry.projectId] = 0;
                }
                projectTime[entry.projectId] += duration;
            }
        });

        return Object.entries(projectTime)
            .map(([projectId, duration]) => {
                const project = projectMap.get(projectId);
                return {
                    name: project?.name || 'Unknown Project',
                    hours: parseFloat((duration / (1000 * 60 * 60)).toFixed(2)),
                };
            })
            .sort((a, b) => b.hours - a.hours)
            .slice(0, 10); // Top 10 projects
    }, [timeEntries, projectMap]);

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
            
            <Card title="This Week's Hours">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={weeklySummaryData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="hours" fill="var(--color-primary)" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>

            <Card title="Time per Project (All Time)">
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectTimeData} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
                         <CartesianGrid strokeDasharray="3 3" />
                         <XAxis type="number" />
                         <YAxis type="category" dataKey="name" width={150} interval={0} />
                         <Tooltip />
                         <Legend />
                         <Bar dataKey="hours" fill="var(--color-primary-dark)" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

export default ReportsPage;
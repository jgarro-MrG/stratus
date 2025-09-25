import React from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { Client, Project, TimeEntry } from '../types';
import Card from '../components/Card';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';


const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'In progress';
    const durationMs = end.getTime() - start.getTime();
    if (durationMs < 0) return '0h 0m';
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

const RecentActivityItem: React.FC<{ entry: TimeEntry & { startTime: Date, endTime: Date | null }, project?: Project, client?: Client }> = ({ entry, project, client }) => {
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
                <p className="text-sm text-text-secondary">{format(entry.startTime, 'MMM d')}</p>
            </div>
        </div>
    );
};

const DashboardPage: React.FC = () => {
    const { timeEntries, projects, clients, loading } = useAppData();
    
    const projectMap = new Map(projects.map(p => [p.id, p]));
    const clientMap = new Map(clients.map(c => [c.id, c]));

    const recentEntries = timeEntries.filter(entry => !entry.isArchived).slice(0, 10);

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                <div>
                    <Link
                        to="/timelog"
                        className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                    >
                        Edit Time Entries
                    </Link>
                </div>
            </div>
            
            <Card title="Recent Activity">
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
                    <p className="text-text-secondary">No recent time entries found.</p>
                )}
            </Card>
        </div>
    );
};

export default DashboardPage;
import React, { useState, useMemo } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { Client, Project, TimeEntry } from '../types';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { format } from 'date-fns';

const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'In progress';
    const durationMs = end.getTime() - start.getTime();
    if (durationMs < 0) return '0h 0m';
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
};

const RecentActivityItem: React.FC<{ entry: TimeEntry, project?: Project, client?: Client }> = ({ entry, project, client }) => {
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
    const { timeEntries, projects, clients, loading, addManualTimeEntry } = useAppData();
    const { addToast } = useToast();
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [projectId, setProjectId] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    const projectMap = new Map(projects.map(p => [p.id, p]));
    const clientMap = new Map(clients.map(c => [c.id, c]));

    const recentEntries = timeEntries.slice(0, 10);

    const projectOptions = useMemo(() => {
        const activeProjects = projects.filter(p => !p.isArchived);
        const clientMap = new Map(clients.map(c => [c.id, c.name]));
        
        return activeProjects.map(p => ({
          ...p,
          clientName: clientMap.get(p.clientId) || 'Unknown Client'
        }));
    }, [projects, clients]);

    const resetForm = () => {
        setProjectId('');
        setDescription('');
        setStartTime('');
        setEndTime('');
    };

    const handleSave = async () => {
        if (!projectId || !description.trim() || !startTime || !endTime) {
            addToast('Please fill all fields.', 'warning');
            return;
        }
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            addToast('Invalid date or time format.', 'error');
            return;
        }
        
        if (start >= end) {
            addToast('End time must be after start time.', 'warning');
            return;
        }

        try {
            await addManualTimeEntry({
                projectId,
                description: description.trim(),
                startTime: start,
                endTime: end,
            });
            addToast('Manual entry added successfully.', 'success');
            setIsModalOpen(false);
            resetForm();
        } catch (e) {
            console.error(e);
            addToast('Failed to add manual entry.', 'error');
        }
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Add Manual Entry
                </button>
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

            <Modal isOpen={isModalOpen} onClose={() => { setIsModalOpen(false); resetForm(); }} title="Add Manual Time Entry">
                <div className="space-y-4">
                    <div>
                        <label htmlFor="project" className="block text-sm font-medium text-text-secondary">Project</label>
                        <select
                            id="project"
                            value={projectId}
                            onChange={(e) => setProjectId(e.target.value)}
                            className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                            <option value="">Select a project</option>
                            {projectOptions.map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.clientName})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-text-secondary">Description</label>
                        <textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            placeholder="What did you work on?"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-text-secondary">Start Time</label>
                            <input
                                type="datetime-local"
                                id="startTime"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-text-secondary">End Time</label>
                            <input
                                type="datetime-local"
                                id="endTime"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="mt-1 w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <button onClick={() => { setIsModalOpen(false); resetForm(); }} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button>
                        <button onClick={handleSave} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark">Save Entry</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default DashboardPage;
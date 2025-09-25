

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Timer from '../components/Timer';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { TimeEntry, Project, Client } from '../types';
import { getTimeEntries, getProjects, getClients, updateTimeEntry, deleteTimeEntry, addBatchTimeEntries } from '../services/api';

const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'In progress';
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '0h 0m';
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
};

const formatDate = (date: Date) => {
    return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

const formatTime = (date: Date) => {
    return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
}

const Timesheet: React.FC<{
    entries: TimeEntry[],
    projects: Project[],
    clients: Client[],
    onUpdate: () => void,
    onDeleteRequest: (entry: TimeEntry) => void;
}> = ({ entries, projects, clients, onUpdate, onDeleteRequest }) => {
    
    const getProjectName = (projectId: string) => projects.find(p => p.id === projectId)?.name || 'Unknown Project';
    const getClientName = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return clients.find(c => c.id === project?.clientId)?.name || 'Unknown Client';
    };

    const groupedEntries = useMemo(() => {
        return entries.reduce((acc, entry) => {
            const date = new Date(entry.startTime).toISOString().split('T')[0];
            if (!acc[date]) acc[date] = [];
            acc[date].push(entry);
            return acc;
        }, {} as Record<string, TimeEntry[]>);
    }, [entries]);

    const sortedDates = useMemo(() => Object.keys(groupedEntries).sort((a, b) => b.localeCompare(a)), [groupedEntries]);

    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [isSavingId, setIsSavingId] = useState<string | null>(null);

    const handleEdit = (entry: TimeEntry) => {
        setEditingEntry({ ...entry });
    };

    const handleCancel = () => {
        setEditingEntry(null);
    };

    const handleSave = async () => {
        if (!editingEntry) return;
        setIsSavingId(editingEntry.id);
        try {
            await updateTimeEntry(editingEntry.id, editingEntry);
            setEditingEntry(null);
            onUpdate();
        } catch (error) {
            console.error("Failed to save entry:", error);
            alert("Could not save the time entry. Please try again.");
        } finally {
            setIsSavingId(null);
        }
    };

    const handleToggleArchive = async (entry: TimeEntry) => {
        setIsSavingId(entry.id);
        try {
            await updateTimeEntry(entry.id, { isArchived: !entry.isArchived });
            onUpdate();
        } catch (error) {
            console.error("Failed to archive entry:", error);
            alert("Could not update the time entry. Please try again.");
        } finally {
            setIsSavingId(null);
        }
    };

    const handleChange = (field: keyof TimeEntry, value: any) => {
        if (!editingEntry) return;
        setEditingEntry(prev => prev ? { ...prev, [field]: value } : null);
    };
    
    const inputStyle = "p-1 border border-border rounded bg-background focus:ring-primary focus:border-primary disabled:opacity-50";

    return (
        <div className="space-y-6">
            {sortedDates.map(date => (
                <div key={date}>
                    <h3 className="text-lg font-semibold text-text-primary mb-2 border-b border-border pb-2">{formatDate(new Date(date))}</h3>
                    <div className="space-y-2">
                        {groupedEntries[date].map(entry => (
                            editingEntry?.id === entry.id ? (
                                // EDITING VIEW
                                <div key={entry.id} className="p-4 bg-yellow-400/10 rounded-lg space-y-4 border border-yellow-400/20">
                                    <div>
                                        <label htmlFor={`description-${entry.id}`} className="block text-xs font-medium text-text-secondary mb-1">Description</label>
                                        <input id={`description-${entry.id}`} type="text" value={editingEntry.description} onChange={(e) => handleChange('description', e.target.value)} className={`w-full ${inputStyle}`} disabled={isSavingId === entry.id}/>
                                    </div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="sm:col-span-2">
                                            <label htmlFor={`project-${entry.id}`} className="block text-xs font-medium text-text-secondary mb-1">Project</label>
                                            <select id={`project-${entry.id}`} value={editingEntry.projectId} onChange={e => handleChange('projectId', e.target.value)} className={`w-full ${inputStyle}`} disabled={isSavingId === entry.id}>
                                                {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({getClientName(p.id)})</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label htmlFor={`start-time-${entry.id}`} className="block text-xs font-medium text-text-secondary mb-1">Start Time</label>
                                            <input id={`start-time-${entry.id}`} type="time" value={formatTime(new Date(editingEntry.startTime))} onChange={e => handleChange('startTime', new Date(`${date}T${e.target.value}`))} className={`w-full ${inputStyle}`} disabled={isSavingId === entry.id}/>
                                        </div>
                                        <div>
                                            <label htmlFor={`end-time-${entry.id}`} className="block text-xs font-medium text-text-secondary mb-1">End Time</label>
                                            <input id={`end-time-${entry.id}`} type="time" value={editingEntry.endTime ? formatTime(new Date(editingEntry.endTime)) : ''} onChange={e => handleChange('endTime', e.target.value ? new Date(`${date}T${e.target.value}`) : null)} className={`w-full ${inputStyle}`} disabled={isSavingId === entry.id}/>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2 pt-2">
                                        <button onClick={handleSave} className="px-3 py-1 text-sm bg-secondary text-white rounded hover:bg-emerald-600 disabled:opacity-50" disabled={isSavingId === entry.id}>
                                            {isSavingId === entry.id ? 'Saving...' : 'Save'}
                                        </button>
                                        <button onClick={handleCancel} className="px-3 py-1 text-sm bg-gray-500/20 rounded hover:bg-gray-500/30 disabled:opacity-50" disabled={isSavingId === entry.id}>Cancel</button>
                                    </div>
                                </div>
                            ) : (
                                // DISPLAY VIEW
                                <div key={entry.id} className={`flex items-center justify-between p-4 rounded-lg group ${entry.isArchived ? 'opacity-70 bg-background dark:bg-surface/30' : 'bg-background/50 dark:bg-surface/20 hover:bg-background dark:hover:bg-surface/50'}`}>
                                    <div className="flex-1 min-w-0">
                                        {/* Mobile view: Project / Client */}
                                        <div className="sm:hidden">
                                            <p className={`font-semibold text-text-primary truncate ${entry.isArchived ? 'line-through' : ''}`}>{getProjectName(entry.projectId)}</p>
                                            <p className="text-sm text-text-secondary truncate">{getClientName(entry.projectId)}</p>
                                        </div>

                                        {/* Desktop view: Description / Project (Client) */}
                                        <div className="hidden sm:block">
                                            <p className={`font-semibold text-text-primary truncate ${entry.isArchived ? 'line-through' : ''}`}>{entry.description}</p>
                                            <p className="text-sm text-text-secondary truncate">{getProjectName(entry.projectId)} ({getClientName(entry.projectId)})</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 sm:gap-4 ml-4 flex-shrink-0">
                                        <div className="text-right">
                                            <p className="font-semibold text-text-primary">{formatDuration(new Date(entry.startTime), entry.endTime ? new Date(entry.endTime) : null)}</p>
                                            <p className="hidden sm:block text-sm text-text-secondary">{formatTime(new Date(entry.startTime))} - {entry.endTime ? formatTime(new Date(entry.endTime)) : 'Now'}</p>
                                        </div>
                                        <div className="flex gap-2 w-28 justify-end sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                                            {isSavingId === entry.id ? (
                                                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
                                            ) : (
                                                <>
                                                    {!entry.isArchived && (
                                                        <button onClick={() => handleEdit(entry)} className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Edit</button>
                                                    )}
                                                    <button onClick={() => handleToggleArchive(entry)} className="text-sm text-yellow-600 dark:text-yellow-400 hover:underline">{entry.isArchived ? 'Unarchive' : 'Archive'}</button>
                                                    {entry.isArchived && (
                                                        <button onClick={() => onDeleteRequest(entry)} className="text-sm text-red-600 dark:text-red-400 hover:underline">Delete</button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        ))}
                    </div>
                </div>
            ))}
             {entries.length === 0 && (
                <div className="text-center py-10">
                    <p className="text-text-secondary">No time entries to display.</p>
                </div>
            )}
        </div>
    );
};

interface NewEntryRow {
    tempId: string;
    projectId: string;
    description: string;
    date: string;
    startTime: string;
    endTime: string;
}

const AddEntryForm: React.FC<{
    projects: Project[],
    clients: Client[],
    onAdd: () => void,
    onCancel: () => void
}> = ({ projects, clients, onAdd, onCancel }) => {
    const createNewRow = useCallback((): NewEntryRow => ({
        tempId: uuidv4(),
        projectId: projects[0]?.id || '',
        description: '',
        date: new Date().toISOString().split('T')[0],
        startTime: '09:00',
        endTime: '10:00',
    }), [projects]);

    const [rows, setRows] = useState<NewEntryRow[]>([createNewRow()]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const getClientName = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return clients.find(c => c.id === project?.clientId)?.name || 'Unknown Client';
    };

    const handleRowChange = (tempId: string, field: keyof Omit<NewEntryRow, 'tempId'>, value: string) => {
        setRows(currentRows => currentRows.map(row => 
            row.tempId === tempId ? { ...row, [field]: value } : row
        ));
    };

    const handleAddRow = () => {
        setRows(currentRows => [...currentRows, createNewRow()]);
    };

    const handleRemoveRow = (tempId: string) => {
        setRows(currentRows => currentRows.filter(row => row.tempId !== tempId));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const entriesToAdd: Omit<TimeEntry, 'id'>[] = rows.map(row => {
                 if (!row.description.trim() || !row.projectId || !row.date || !row.startTime || !row.endTime) {
                    throw new Error("All fields must be filled for all entries.");
                }
                const startTime = new Date(`${row.date}T${row.startTime}`);
                const endTime = new Date(`${row.date}T${row.endTime}`);

                if (endTime <= startTime) {
                    throw new Error(`End time must be after start time for entry: "${row.description}"`);
                }

                return {
                    projectId: row.projectId,
                    description: row.description,
                    startTime,
                    endTime,
                };
            });

            if (entriesToAdd.length > 0) {
                await addBatchTimeEntries(entriesToAdd);
            }
            onAdd();
        } catch (error: any) {
            console.error("Failed to add time entries:", error);
            alert(`Could not add entries: ${error.message}`);
        } finally {
            setIsSubmitting(false);
        }
    }
    
    const inputStyle = "w-full p-2 border border-border rounded-md bg-background focus:ring-primary focus:border-primary disabled:opacity-50";
    const TrashIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

    return (
        <Card title="Add Manual Time Entries">
            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    {rows.map((row, index) => (
                        <div key={row.tempId} className="relative p-4 border border-border rounded-lg bg-background/30 dark:bg-surface/20">
                            {rows.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow(row.tempId)}
                                    className="absolute top-2 right-2 p-1 text-text-secondary hover:text-red-500 rounded-full hover:bg-red-500/10 transition-colors"
                                    aria-label="Remove entry"
                                    disabled={isSubmitting}
                                >
                                    <TrashIcon />
                                </button>
                            )}
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-secondary mb-1">Description</label>
                                    <input type="text" value={row.description} onChange={e => handleRowChange(row.tempId, 'description', e.target.value)} required className={inputStyle} disabled={isSubmitting}/>
                                </div>
                                
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Project</label>
                                        <select value={row.projectId} onChange={e => handleRowChange(row.tempId, 'projectId', e.target.value)} className={inputStyle} disabled={isSubmitting}>
                                            {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({getClientName(p.id)})</option>)}
                                        </select>
                                    </div>
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Date</label>
                                        <input type="date" value={row.date} onChange={e => handleRowChange(row.tempId, 'date', e.target.value)} required className={inputStyle} disabled={isSubmitting}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">Start Time</label>
                                        <input type="time" value={row.startTime} onChange={e => handleRowChange(row.tempId, 'startTime', e.target.value)} required className={inputStyle} disabled={isSubmitting}/>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-secondary mb-1">End Time</label>
                                        <input type="time" value={row.endTime} onChange={e => handleRowChange(row.tempId, 'endTime', e.target.value)} required className={inputStyle} disabled={isSubmitting}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={handleAddRow}
                    className="w-full py-2 text-sm text-primary border-2 border-dashed border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
                    disabled={isSubmitting}
                >
                    + Add another entry
                </button>

                <div className="flex gap-2 pt-2">
                    <button type="submit" className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50" disabled={isSubmitting}>
                        {isSubmitting ? 'Adding...' : `Add ${rows.length} ${rows.length > 1 ? 'Entries' : 'Entry'}`}
                    </button>
                    <button type="button" onClick={onCancel} className="px-4 py-2 bg-border text-text-secondary rounded-md hover:bg-border/80" disabled={isSubmitting}>Cancel</button>
                </div>
            </form>
        </Card>
    );
};

const DashboardPage: React.FC = () => {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showArchived, setShowArchived] = useState(false);
    const [entryToDelete, setEntryToDelete] = useState<TimeEntry | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchData = useCallback(async () => {
        // Not setting loading to true here to avoid flicker on updates
        try {
            const [entries, projs, clis] = await Promise.all([getTimeEntries(showArchived), getProjects(), getClients()]);
            setTimeEntries(entries);
            setProjects(projs);
            setClients(clis);
        } catch (error) {
            console.error("Failed to fetch dashboard data:", error);
        } finally {
            setIsLoading(false);
        }
    }, [showArchived]);

    useEffect(() => {
        setIsLoading(true);
        fetchData();
    }, [fetchData]);

    const handleNewEntryFromTimer = (entry: TimeEntry) => {
        setTimeEntries(prevEntries => {
            const existingIndex = prevEntries.findIndex(e => e.id === entry.id);
            if (existingIndex !== -1) {
                const newEntries = [...prevEntries];
                newEntries[existingIndex] = entry;
                return newEntries;
            } else {
                // Ensure new entries from timer are at the top
                return [entry, ...prevEntries].sort((a,b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
            }
        });
    };

    const requestDelete = (entry: TimeEntry) => {
        setEntryToDelete(entry);
    };
    
    const cancelDelete = () => {
        setEntryToDelete(null);
    };

    const confirmDelete = async () => {
        if (!entryToDelete) return;
        setIsDeleting(true);
        try {
            await deleteTimeEntry(entryToDelete.id);
            setEntryToDelete(null);
            fetchData();
        } catch (error) {
            console.error("Failed to delete entry:", error);
            alert("Could not delete the entry. Please try again.");
        } finally {
            setIsDeleting(false);
        }
    };
    
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <Timer onNewEntry={handleNewEntryFromTimer} />

            {showAddForm ? (
                <AddEntryForm 
                    projects={projects.filter(p => !p.isArchived)} 
                    clients={clients.filter(c => !c.isArchived)} 
                    onAdd={() => { setShowAddForm(false); fetchData(); }} 
                    onCancel={() => setShowAddForm(false)}
                />
            ) : (
                <Card>
                    <div className="flex justify-between items-center flex-wrap gap-4 px-6 py-4 border-b border-border -m-6 mb-6">
                        <h3 className="text-lg font-semibold text-text-primary">Timesheet</h3>
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <label htmlFor="show-archived-entries" className="text-sm font-medium text-text-secondary">Show Archived</label>
                                <input
                                    id="show-archived-entries"
                                    type="checkbox"
                                    className="h-4 w-4 rounded border-border bg-surface text-primary focus:ring-primary"
                                    checked={showArchived}
                                    onChange={() => setShowArchived(!showArchived)}
                                />
                            </div>
                            <button onClick={() => setShowAddForm(true)} className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-emerald-600 dark:hover:bg-secondary/80">Add Manual Entry</button>
                        </div>
                    </div>
                    {isLoading ? <p>Loading entries...</p> : (
                        <Timesheet entries={timeEntries} projects={projects} clients={clients} onUpdate={fetchData} onDeleteRequest={requestDelete} />
                    )}
                </Card>
            )}

            {entryToDelete && (
                 <Modal
                    isOpen={!!entryToDelete}
                    onClose={cancelDelete}
                    title="Confirm Deletion"
                >
                    <div>
                        <p className="text-text-secondary">
                            Are you sure you want to permanently delete this time entry?
                        </p>
                        <blockquote className="mt-4 p-3 bg-background border-l-4 border-border rounded-r-lg">
                            <p className="font-semibold text-text-primary truncate">{entryToDelete.description}</p>
                            <p className="text-sm text-text-secondary">
                                {formatDuration(new Date(entryToDelete.startTime), entryToDelete.endTime ? new Date(entryToDelete.endTime) : null)}
                            </p>
                        </blockquote>
                        <p className="mt-4 text-sm font-semibold text-red-600 dark:text-red-400">
                            This action cannot be undone.
                        </p>
                    </div>
                    <div className="mt-6 flex justify-end gap-4">
                        <button
                            type="button"
                            onClick={cancelDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-gray-200 dark:bg-slate-700 text-text-primary rounded-md hover:bg-gray-300 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={confirmDelete}
                            disabled={isDeleting}
                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Entry'}
                        </button>
                    </div>
                </Modal>
            )}
        </div>
    );
};

export default DashboardPage;
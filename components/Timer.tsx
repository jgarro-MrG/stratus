import React, { useState, useEffect, useCallback } from 'react';
import { Client, Project, TimeEntry } from '../types';
import { getClients, getProjectsByClientId, addTimeEntry, stopTimeEntry, getActiveTimeEntry } from '../services/api';
import Card from './Card';

const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const Spinner = () => <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>;

interface TimerProps {
    onNewEntry: (entry: TimeEntry) => void;
}

const Timer: React.FC<TimerProps> = ({ onNewEntry }) => {
    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [selectedClient, setSelectedClient] = useState('');
    const [selectedProject, setSelectedProject] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const inputStyles = "w-full px-4 py-2 bg-background dark:bg-slate-700 border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none placeholder-text-secondary/70";

    useEffect(() => {
        const interval = setInterval(() => {
            if (activeEntry) {
                const now = new Date();
                const start = new Date(activeEntry.startTime);
                setElapsedTime(Math.floor((now.getTime() - start.getTime()) / 1000));
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [activeEntry]);

    const fetchInitialData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [clientsData, activeEntryData] = await Promise.all([getClients(), getActiveTimeEntry()]);
            setClients(clientsData);
            if (clientsData.length > 0) {
                setSelectedClient(clientsData[0].id);
            }
            if (activeEntryData) {
                setActiveEntry(activeEntryData);
                setDescription(activeEntryData.description);
            }
        } catch (error) {
            console.error("Failed to fetch initial timer data", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        if (selectedClient) {
            getProjectsByClientId(selectedClient).then(setProjects);
        } else {
            setProjects([]);
        }
        setSelectedProject('');
    }, [selectedClient]);

    const handleStart = async () => {
        if (!selectedProject || !description) {
            alert('Please select a project and enter a description.');
            return;
        }
        setIsActionLoading(true);
        try {
            const newEntry = await addTimeEntry({
                projectId: selectedProject,
                startTime: new Date(),
                endTime: null,
                description,
            });
            setActiveEntry(newEntry);
            onNewEntry(newEntry);
        } catch (error) {
            console.error("Failed to start timer:", error);
            alert("Could not start the timer. Please try again.");
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleStop = async () => {
        if (!activeEntry) return;
        setIsActionLoading(true);
        try {
            const stoppedEntry = await stopTimeEntry(activeEntry.id);
            setActiveEntry(null);
            setElapsedTime(0);
            setDescription('');
            onNewEntry(stoppedEntry);
        } catch (error) {
            console.error("Failed to stop timer:", error);
            alert("Could not stop the timer. Please try again.");
        } finally {
            setIsActionLoading(false);
        }
    };

    if (isLoading) return <div className="p-6 text-center">Loading timer...</div>

    return (
        <Card title="Time Tracker">
            <div className="flex flex-col md:flex-row items-center gap-4">
                <input
                    type="text"
                    placeholder="What are you working on?"
                    className={`${inputStyles} flex-grow`}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    disabled={!!activeEntry || isActionLoading}
                />
                {!activeEntry ? (
                    <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
                        <select
                            className={`${inputStyles} md:w-56`}
                            value={selectedClient}
                            onChange={(e) => setSelectedClient(e.target.value)}
                            disabled={isActionLoading}
                        >
                            <option value="" disabled>Select Client</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select
                            className={`${inputStyles} md:w-56`}
                            value={selectedProject}
                            onChange={(e) => setSelectedProject(e.target.value)}
                            disabled={!selectedClient || isActionLoading}
                        >
                            <option value="" disabled>Select Project</option>
                            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                ) : null}
                <div className="font-mono text-3xl text-text-primary tracking-wider w-36 text-center">
                    {formatTime(elapsedTime)}
                </div>
                {activeEntry ? (
                    <button
                        onClick={handleStop}
                        disabled={isActionLoading}
                        className="w-full md:w-32 bg-red-500 text-white px-4 py-3 rounded-md font-semibold hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                    >
                        {isActionLoading ? <Spinner /> : 'STOP'}
                    </button>
                ) : (
                    <button
                        onClick={handleStart}
                        className="w-full md:w-32 bg-primary text-white px-4 py-3 rounded-md font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                        disabled={!selectedProject || !description || isActionLoading}
                    >
                        {isActionLoading ? <Spinner /> : 'START'}
                    </button>
                )}
            </div>
        </Card>
    );
};

export default Timer;
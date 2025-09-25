import React, { useState, useEffect, useMemo } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import { Project, Client } from '../types';

const PlayIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

const StopIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9h6v6H9z" />
    </svg>
);

const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const Timer: React.FC = () => {
    const { projects, clients, activeTimeEntry, startTimeEntry, stopTimeEntry } = useAppData();
    const { addToast } = useToast();
    const [description, setDescription] = useState('');
    const [selectedProjectId, setSelectedProjectId] = useState<string>('');
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        // FIX: Changed NodeJS.Timeout to number as setInterval in a browser context returns a number.
        let interval: number | null = null;
        if (activeTimeEntry) {
            setDescription(activeTimeEntry.description);
            setSelectedProjectId(activeTimeEntry.projectId);
            const updateDuration = () => {
                const now = new Date();
                const start = new Date(activeTimeEntry.startTime);
                setDuration(Math.floor((now.getTime() - start.getTime()) / 1000));
            };
            updateDuration();
            // FIX: Explicitly use `window.setInterval` to avoid ambiguity with Node.js types and ensure the return type is `number`.
            interval = window.setInterval(updateDuration, 1000);
        } else {
            setDuration(0);
            setDescription('');
        }
        return () => {
            if (interval) clearInterval(interval);
        };
    }, [activeTimeEntry]);

    const handleStart = async () => {
        if (!selectedProjectId) {
            addToast('Please select a project.', 'warning');
            return;
        }
        if (!description) {
            addToast('Please enter a description.', 'warning');
            return;
        }
        await startTimeEntry(selectedProjectId, description);
        addToast('Timer started!', 'success');
    };

    const handleStop = async () => {
        if (activeTimeEntry) {
            await stopTimeEntry(activeTimeEntry.id);
            addToast('Timer stopped!', 'info');
            setSelectedProjectId('');
        }
    };
    
    const projectOptions = useMemo(() => {
      const activeProjects = projects.filter(p => !p.isArchived);
      const clientMap = new Map(clients.map(c => [c.id, c.name]));
      
      return activeProjects.map(p => ({
        ...p,
        clientName: clientMap.get(p.clientId) || 'Unknown Client'
      }));
    }, [projects, clients]);


    return (
        <div className="flex items-center gap-4 bg-surface p-3 rounded-lg border border-border w-full">
            <input
                type="text"
                placeholder="What are you working on?"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="flex-grow bg-transparent focus:outline-none text-text-primary"
                disabled={!!activeTimeEntry}
            />
            <div className="h-6 border-l border-border"></div>
            <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent focus:outline-none text-text-primary max-w-xs truncate"
                disabled={!!activeTimeEntry}
            >
                <option value="">Select a project</option>
                {projectOptions.map(p => (
                  <option key={p.id} value={p.id}>{p.name} ({p.clientName})</option>
                ))}
            </select>
            <div className="h-6 border-l border-border"></div>
            <span className="font-mono text-lg text-text-primary w-24 text-center">{formatDuration(duration)}</span>
            {activeTimeEntry ? (
                <button onClick={handleStop} className="p-2 rounded-full hover:bg-red-500/10 transition-colors" aria-label="Stop Timer">
                    <StopIcon />
                </button>
            ) : (
                <button onClick={handleStart} className="p-2 rounded-full hover:bg-primary/10 transition-colors" aria-label="Start Timer">
                    <PlayIcon />
                </button>
            )}
        </div>
    );
};

export default Timer;
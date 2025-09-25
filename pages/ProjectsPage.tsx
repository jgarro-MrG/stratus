import React, { useState, useEffect, useCallback } from 'react';
import Card from '../components/Card';
import { Client, Project } from '../types';
import { getClients, getProjects, addClient, updateClient, addProject, updateProject, deleteProject, deleteClient } from '../services/api';

const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>;
const ArchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h14" /></svg>;
const UnarchiveIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>;
const DeleteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>;

const ActionSpinner = () => <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>;

const ProjectsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showArchived, setShowArchived] = useState(false);

    const [editingClientId, setEditingClientId] = useState<string | null>(null);
    const [editingClientName, setEditingClientName] = useState('');
    const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
    const [editingProjectName, setEditingProjectName] = useState('');

    const [newClientName, setNewClientName] = useState('');
    const [addingClient, setAddingClient] = useState(false);
    
    const [newProjectName, setNewProjectName] = useState('');
    const [addingProjectToClientId, setAddingProjectToClientId] = useState<string | null>(null);
    
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeItemId, setActiveItemId] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [clientsData, projectsData] = await Promise.all([getClients(showArchived), getProjects(showArchived)]);
            
            clientsData.sort((a, b) => a.name.localeCompare(b.name));
            projectsData.sort((a, b) => a.name.localeCompare(b.name));

            setClients(clientsData);
            setProjects(projectsData);
        } catch (error) {
            console.error("Failed to fetch project data", error);
        } finally {
            setIsLoading(false);
        }
    }, [showArchived]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Client Handlers
    const handleAddClient = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newClientName.trim()) return;
        setIsSubmitting(true);
        try {
            await addClient(newClientName);
            setNewClientName('');
            setAddingClient(false);
            fetchData();
        } catch (error) {
            console.error("Failed to add client:", error);
            alert("Could not add the client. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleEditClient = (client: Client) => {
        setEditingClientId(client.id);
        setEditingClientName(client.name);
    };

    const handleSaveClient = async (clientId: string) => {
        if (!editingClientName.trim()) {
            setEditingClientId(null);
            return;
        }
        setActiveItemId(clientId);
        try {
            await updateClient(clientId, { name: editingClientName });
            setEditingClientId(null);
            setEditingClientName('');
            fetchData();
        } catch (error) {
            console.error("Failed to save client:", error);
            alert("Could not save the client. Please try again.");
        } finally {
            setActiveItemId(null);
        }
    };
    
    const handleToggleArchiveClient = async (client: Client) => {
        setActiveItemId(client.id);
        try {
            await updateClient(client.id, { isArchived: !client.isArchived });
            fetchData();
        } catch (error) {
            console.error("Failed to toggle archive on client:", error);
            alert("Could not update the client. Please try again.");
        } finally {
            setActiveItemId(null);
        }
    };

    const handleDeleteClient = async (clientId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this client? This will also delete all associated projects and time entries. This action cannot be undone.')) {
            setActiveItemId(clientId);
            try {
                await deleteClient(clientId);
                fetchData();
            } catch (error) {
                console.error("Failed to delete client:", error);
                alert("Could not delete the client. Please try again.");
            } finally {
                setActiveItemId(null);
            }
        }
    };

    // Project Handlers
    const handleAddProject = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newProjectName.trim() || !addingProjectToClientId) return;
        setIsSubmitting(true);
        try {
            await addProject(newProjectName, addingProjectToClientId);
            setNewProjectName('');
            setAddingProjectToClientId(null);
            fetchData();
        } catch (error) {
            console.error("Failed to add project:", error);
            alert("Could not add the project. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditProject = (project: Project) => {
        setEditingProjectId(project.id);
        setEditingProjectName(project.name);
    }

    const handleSaveProject = async (projectId: string) => {
        if (!editingProjectName.trim()) {
            setEditingProjectId(null);
            return;
        }
        setActiveItemId(projectId);
        try {
            await updateProject(projectId, { name: editingProjectName });
            setEditingProjectId(null);
            setEditingProjectName('');
            fetchData();
        } catch (error) {
            console.error("Failed to save project:", error);
            alert("Could not save the project. Please try again.");
        } finally {
            setActiveItemId(null);
        }
    }

    const handleToggleArchiveProject = async (project: Project) => {
        setActiveItemId(project.id);
        try {
            await updateProject(project.id, { isArchived: !project.isArchived });
            fetchData();
        } catch (error) {
            console.error("Failed to toggle archive on project:", error);
            alert("Could not update the project. Please try again.");
        } finally {
            setActiveItemId(null);
        }
    };
    
    const handleDeleteProject = async (projectId: string) => {
        if (window.confirm('Are you sure you want to permanently delete this project and all its time entries? This action cannot be undone.')) {
            setActiveItemId(projectId);
            try {
                await deleteProject(projectId);
                fetchData();
            } catch (error) {
                console.error("Failed to delete project:", error);
                alert("Could not delete the project. Please try again.");
            } finally {
                setActiveItemId(null);
            }
        }
    };

    const inputStyles = "w-full flex-grow px-4 py-2 bg-background dark:bg-slate-700 border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none disabled:opacity-50";
    const editInputStyles = "text-lg font-semibold bg-yellow-400/20 p-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 text-text-primary disabled:opacity-50";

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Clients & Projects</h1>
                <div className="flex items-center space-x-4">
                     <div className="flex items-center space-x-2">
                        <label htmlFor="show-archived" className="text-sm font-medium text-text-secondary">Show Archived</label>
                        <input
                            id="show-archived"
                            type="checkbox"
                            className="h-4 w-4 rounded border-border bg-surface text-primary focus:ring-primary"
                            checked={showArchived}
                            onChange={() => setShowArchived(!showArchived)}
                        />
                    </div>
                    <button onClick={() => setAddingClient(true)} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark">Add Client</button>
                </div>
            </div>

            {addingClient && (
                <Card>
                    <form onSubmit={handleAddClient} className="flex items-center gap-4">
                        <input type="text" value={newClientName} onChange={e => setNewClientName(e.target.value)} placeholder="New client name" autoFocus className={inputStyles} disabled={isSubmitting}/>
                        <button type="submit" className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-emerald-600 disabled:opacity-50" disabled={isSubmitting}>
                            {isSubmitting ? 'Saving...' : 'Save'}
                        </button>
                        <button type="button" onClick={() => setAddingClient(false)} className="px-4 py-2 bg-border text-text-secondary rounded-md hover:bg-border/80" disabled={isSubmitting}>Cancel</button>
                    </form>
                </Card>
            )}

            {isLoading ? <p>Loading projects...</p> : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {clients.map(client => (
                        <Card key={client.id} className={`${client.isArchived ? 'opacity-60 bg-background' : 'bg-surface'}`}>
                            <div className="flex justify-between items-start px-6 py-4 border-b border-border">
                                {editingClientId === client.id ? (
                                     <input type="text" value={editingClientName} onChange={e => setEditingClientName(e.target.value)} onBlur={() => handleSaveClient(client.id)} onKeyDown={e => e.key === 'Enter' && handleSaveClient(client.id)} autoFocus className={editInputStyles} disabled={activeItemId === client.id} />
                                ) : (
                                    <h3 className="text-lg font-semibold text-text-primary">{client.name}</h3>
                                )}
                                <div className="flex items-center space-x-2 text-text-secondary h-6">
                                    {activeItemId === client.id ? <ActionSpinner /> : (
                                        <>
                                            <button onClick={() => handleEditClient(client)} className="hover:text-primary"><EditIcon /></button>
                                            <button onClick={() => handleToggleArchiveClient(client)} className="hover:text-primary">{client.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}</button>
                                            {client.isArchived && (
                                                <button onClick={() => handleDeleteClient(client.id)} className="hover:text-red-500"><DeleteIcon /></button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="p-6">
                                <ul className="space-y-2">
                                    {projects.filter(p => p.clientId === client.id).map(project => (
                                        <li key={project.id} className={`flex justify-between items-center p-3 rounded-md ${project.isArchived ? 'bg-background/50 dark:bg-surface/20' : 'bg-background dark:bg-surface/40'}`}>
                                             {editingProjectId === project.id ? (
                                                <input type="text" value={editingProjectName} onChange={e => setEditingProjectName(e.target.value)} onBlur={() => handleSaveProject(project.id)} onKeyDown={e => e.key === 'Enter' && handleSaveProject(project.id)} autoFocus className="text-text-secondary bg-yellow-400/20 p-1 rounded w-full focus:outline-none focus:ring-1 focus:ring-yellow-500 disabled:opacity-50" disabled={activeItemId === project.id} />
                                             ) : (
                                                <span className={`${project.isArchived ? 'line-through text-text-secondary' : 'text-text-primary'}`}>{project.name}</span>
                                             )}
                                             <div className="flex items-center space-x-2 text-text-secondary h-6">
                                                {activeItemId === project.id ? <ActionSpinner /> : (
                                                    <>
                                                        <button onClick={() => handleEditProject(project)} className="hover:text-primary"><EditIcon /></button>
                                                        <button onClick={() => handleToggleArchiveProject(project)} className="hover:text-primary">{project.isArchived ? <UnarchiveIcon /> : <ArchiveIcon />}</button>
                                                        {project.isArchived && (
                                                            <button onClick={() => handleDeleteProject(project.id)} className="hover:text-red-500"><DeleteIcon /></button>
                                                        )}
                                                    </>
                                                )}
                                             </div>
                                        </li>
                                    ))}
                                    {projects.filter(p => p.clientId === client.id).length === 0 && (
                                        <li className="text-sm text-gray-400 italic">No projects for this client yet.</li>
                                    )}
                                </ul>
                                {addingProjectToClientId === client.id ? (
                                    <form onSubmit={handleAddProject} className="flex items-center gap-2 mt-4">
                                        <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="New project name" autoFocus className="w-full flex-grow px-3 py-1 bg-surface border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none text-sm disabled:opacity-50" disabled={isSubmitting}/>
                                        <button type="submit" className="px-3 py-1 text-sm bg-secondary text-white rounded-md hover:bg-emerald-600 disabled:opacity-50" disabled={isSubmitting}>
                                            {isSubmitting ? '...' : 'Save'}
                                        </button>
                                        <button type="button" onClick={() => setAddingProjectToClientId(null)} className="px-3 py-1 text-sm bg-border text-text-secondary rounded-md hover:bg-border/80" disabled={isSubmitting}>Cancel</button>
                                    </form>
                                ) : (
                                    <button onClick={() => setAddingProjectToClientId(client.id)} className="text-sm text-primary hover:underline mt-4" disabled={client.isArchived}>+ Add Project</button>
                                )}
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectsPage;
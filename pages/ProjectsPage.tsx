import React, { useState } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { Client, Project } from '../types';

const ProjectsPage: React.FC = () => {
    const { clients, projects, addClient, addProject, loading } = useAppData();
    const { addToast } = useToast();
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [newClientName, setNewClientName] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    
    const handleAddClient = async () => {
        if (newClientName.trim()) {
            await addClient(newClientName.trim());
            addToast('Client added successfully', 'success');
            setNewClientName('');
            setIsClientModalOpen(false);
        } else {
            addToast('Client name cannot be empty.', 'warning');
        }
    };

    const handleAddProject = async () => {
        if (newProjectName.trim() && selectedClientId) {
            await addProject(newProjectName.trim(), selectedClientId);
            addToast('Project added successfully', 'success');
            setNewProjectName('');
            setSelectedClientId('');
            setIsProjectModalOpen(false);
        } else {
            addToast('Project name cannot be empty.', 'warning');
        }
    };

    const projectsByClient = clients
        .filter(client => !client.isArchived)
        .map(client => ({
            ...client,
            projects: projects.filter(p => p.clientId === client.id && !p.isArchived)
    }));
    
    const openNewProjectModal = (clientId: string) => {
        setSelectedClientId(clientId);
        setIsProjectModalOpen(true);
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Clients & Projects</h1>
                <button
                    onClick={() => setIsClientModalOpen(true)}
                    className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Add New Client
                </button>
            </div>

            {loading ? <p>Loading projects...</p> : projectsByClient.map(client => (
                <Card key={client.id} title={client.name}>
                    <div className="flex justify-between items-center -mt-2 mb-4">
                        <span className="text-text-secondary text-sm">Active Projects</span>
                         <button
                            onClick={() => openNewProjectModal(client.id)}
                            className="text-sm bg-primary/10 text-primary font-semibold px-3 py-1 rounded-md hover:bg-primary/20 transition-colors"
                        >
                            Add Project
                        </button>
                    </div>
                    {client.projects.length > 0 ? (
                        <ul className="space-y-2">
                            {client.projects.map(project => (
                                <li key={project.id} className="flex justify-between items-center p-2 rounded-md hover:bg-background">
                                    <span>{project.name}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-text-secondary itaic py-4 text-center">No active projects for this client yet.</p>
                    )}
                </Card>
            ))}

            {/* Add Client Modal */}
            <Modal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} title="Add New Client">
                <div className="space-y-4">
                    <label htmlFor="clientName" className="block text-sm font-medium text-text-secondary">Client Name</label>
                    <input
                        type="text"
                        id="clientName"
                        value={newClientName}
                        onChange={(e) => setNewClientName(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Acme Corporation"
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                         <button onClick={() => setIsClientModalOpen(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button>
                         <button onClick={handleAddClient} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark">Add Client</button>
                    </div>
                </div>
            </Modal>
            
            {/* Add Project Modal */}
            <Modal isOpen={isProjectModalOpen} onClose={() => setIsProjectModalOpen(false)} title="Add New Project">
                <div className="space-y-4">
                    <label htmlFor="projectName" className="block text-sm font-medium text-text-secondary">Project Name</label>
                    <input
                        type="text"
                        id="projectName"
                        value={newProjectName}
                        onChange={(e) => setNewProjectName(e.target.value)}
                        className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                        placeholder="e.g., Website Redesign"
                    />
                    <div className="flex justify-end space-x-2 pt-2">
                         <button onClick={() => setIsProjectModalOpen(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button>
                         <button onClick={handleAddProject} className="px-4 py-2 rounded-lg bg-primary text-white hover:bg-primary-dark">Add Project</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectsPage;

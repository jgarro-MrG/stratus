import React, { useState, useMemo, ChangeEvent } from 'react';
import { useAppData } from '../contexts/AppDataContext';
import { useToast } from '../contexts/ToastContext';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { Client, Project } from '../types';
import ActionMenu from '../components/ActionMenu';
import EmptyState from '../components/EmptyState';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <label htmlFor="toggle" className="flex items-center cursor-pointer">
        <div className="relative">
            <input id="toggle" type="checkbox" className="sr-only" checked={checked} onChange={e => onChange(e.target.checked)} />
            <div className={`block w-14 h-8 rounded-full transition ${checked ? 'bg-primary' : 'bg-border'}`}></div>
            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
        </div>
        <div className="ml-3 text-text-secondary font-medium">{label}</div>
    </label>
);

const ProjectsPage: React.FC = () => {
    const { clients, projects, addClient, addProject, loading, updateClient, updateProject, deleteClient, deleteProject } = useAppData();
    const { addToast } = useToast();
    
    // View state
    const [showArchived, setShowArchived] = useState(false);
    const [editingItem, setEditingItem] = useState<{ id: string; name: string; type: 'client' | 'project' } | null>(null);

    // Modal states
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    
    // Form states
    const [newClientName, setNewClientName] = useState('');
    const [newProjectName, setNewProjectName] = useState('');
    const [selectedClientId, setSelectedClientId] = useState<string>('');
    
    // Confirmation modal state
    const [modalConfig, setModalConfig] = useState({ title: '', message: '', onConfirm: async () => {}, confirmText: 'Confirm', isDestructive: false });

    const openConfirmModal = (config: Omit<typeof modalConfig, 'onConfirm'> & { onConfirm: () => Promise<void> }) => {
        setModalConfig(config);
        setIsConfirmModalOpen(true);
    };

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
    
    const openNewProjectModal = (clientId: string) => {
        setSelectedClientId(clientId);
        setIsProjectModalOpen(true);
    }
    
    const handleStartEditing = (item: { id: string; name: string; type: 'client' | 'project' }) => {
        setEditingItem(item);
    };
    
    const handleCancelEditing = () => {
        setEditingItem(null);
    };
    
    const handleSaveEditing = async () => {
        if (!editingItem || !editingItem.name.trim()) {
            addToast('Name cannot be empty.', 'warning');
            return;
        }
        
        try {
            if (editingItem.type === 'client') {
                await updateClient(editingItem.id, { name: editingItem.name.trim() });
            } else {
                await updateProject(editingItem.id, { name: editingItem.name.trim() });
            }
            addToast(`${editingItem.type === 'client' ? 'Client' : 'Project'} renamed successfully.`, 'success');
            handleCancelEditing();
        } catch (error) {
            addToast('Failed to rename.', 'error');
            console.error(error);
        }
    };
    
    const clientsToDisplay = useMemo(() => 
        clients.filter(c => !!c.isArchived === showArchived).sort((a,b) => a.name.localeCompare(b.name)), 
    [clients, showArchived]);

    const getProjectsForClient = (clientId: string): Project[] => 
        projects.filter(p => p.clientId === clientId && !!p.isArchived === showArchived).sort((a,b) => a.name.localeCompare(b.name));

    const renderContent = () => {
        if (loading) {
            return <p>Loading...</p>;
        }

        if (clientsToDisplay.length > 0) {
            return clientsToDisplay.map(client => {
                const clientProjects = getProjectsForClient(client.id);
                const isEditingClient = editingItem?.type === 'client' && editingItem.id === client.id;
                return (
                    <Card key={client.id} className="transition-all duration-300">
                        <div className="flex justify-between items-start -mt-2">
                            {isEditingClient ? (
                                <div className="flex-grow flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editingItem.name}
                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                        className="w-full px-2 py-1 text-lg font-semibold border border-primary rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && handleSaveEditing()}
                                    />
                                    <button onClick={handleSaveEditing} className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary-dark">Save</button>
                                    <button onClick={handleCancelEditing} className="px-3 py-1 text-sm rounded-md border border-border hover:bg-background">Cancel</button>
                                </div>
                            ) : (
                                <h3 className="text-lg font-semibold text-text-primary mb-2">{client.name}</h3>
                            )}
                             {!isEditingClient && <ActionMenu items={showArchived ? [
                                 { label: 'Unarchive Client', onClick: () => updateClient(client.id, { isArchived: false }) },
                                 { label: 'Delete Permanently', isDestructive: true, onClick: () => openConfirmModal({
                                     title: 'Delete Client?',
                                     message: `This will permanently delete "${client.name}" and all its associated projects and time entries. This action cannot be undone.`,
                                     onConfirm: async () => deleteClient(client.id),
                                     confirmText: 'Delete Client',
                                     isDestructive: true,
                                 })}
                             ] : [
                                 { label: 'Rename Client', onClick: () => handleStartEditing({ id: client.id, name: client.name, type: 'client' })},
                                 { label: 'Add Project', onClick: () => openNewProjectModal(client.id) },
                                 { label: 'Archive Client', onClick: () => updateClient(client.id, { isArchived: true }) }
                             ]}/>}
                        </div>

                        {clientProjects.length > 0 ? (
                            <ul className="space-y-2 mt-4 border-t border-border pt-4">
                                {clientProjects.map(project => {
                                    const isEditingProject = editingItem?.type === 'project' && editingItem.id === project.id;
                                    return (
                                        <li key={project.id} className="flex justify-between items-center p-2 rounded-md hover:bg-background group">
                                            {isEditingProject ? (
                                                <div className="flex-grow flex items-center gap-2">
                                                    <input
                                                        type="text"
                                                        value={editingItem.name}
                                                        onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                                                        className="w-full px-2 py-1 border border-primary rounded-md bg-background focus:outline-none focus:ring-1 focus:ring-primary"
                                                        autoFocus
                                                        onKeyDown={e => e.key === 'Enter' && handleSaveEditing()}
                                                    />
                                                    <button onClick={handleSaveEditing} className="px-3 py-1 text-sm rounded-md bg-primary text-white hover:bg-primary-dark">Save</button>
                                                    <button onClick={handleCancelEditing} className="px-3 py-1 text-sm rounded-md border border-border hover:bg-background">Cancel</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <span>{project.name}</span>
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <ActionMenu items={showArchived ? [
                                                            { label: 'Unarchive Project', onClick: () => updateProject(project.id, { isArchived: false }) },
                                                            { label: 'Delete Permanently', isDestructive: true, onClick: () => openConfirmModal({
                                                                 title: 'Delete Project?',
                                                                 message: `This will permanently delete "${project.name}" and its time entries. This action cannot be undone.`,
                                                                 onConfirm: async () => deleteProject(project.id),
                                                                 confirmText: 'Delete Project',
                                                                 isDestructive: true,
                                                            })}
                                                        ] : [
                                                            { label: 'Rename Project', onClick: () => handleStartEditing({ id: project.id, name: project.name, type: 'project' })},
                                                            { label: 'Archive Project', onClick: () => updateProject(project.id, { isArchived: true }) }
                                                        ]} />
                                                    </div>
                                                </>
                                            )}
                                        </li>
                                    )
                                })}
                            </ul>
                        ) : (
                            <p className="text-text-secondary italic py-4 text-center">
                                {showArchived ? 'No archived projects for this client.' : 'No active projects for this client yet.'}
                            </p>
                        )}
                    </Card>
                )
            });
        }

        return (
            <EmptyState
                title={showArchived ? "No Archived Clients" : "No Clients Found"}
                message={showArchived ? "You don't have any archived clients." : "Get started by adding your first client. You can add projects to clients to organize your time entries."}
            >
                {!showArchived && (
                    <button
                        onClick={() => setIsClientModalOpen(true)}
                        className="bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors text-base"
                    >
                        Add Your First Client
                    </button>
                )}
            </EmptyState>
        );
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-3xl font-bold text-text-primary">Clients & Projects</h1>
                <div className="flex items-center gap-4">
                    <ToggleSwitch checked={showArchived} onChange={setShowArchived} label={showArchived ? "Viewing Archived" : "Viewing Active"} />
                    {!showArchived && (
                        <button
                            onClick={() => setIsClientModalOpen(true)}
                            className="bg-primary text-white font-semibold px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                        >
                            Add New Client
                        </button>
                    )}
                </div>
            </div>

            <div className="space-y-6">
                {renderContent()}
            </div>

            {/* Confirmation Modal */}
            <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title={modalConfig.title}>
                <p className="text-text-secondary mb-6">{modalConfig.message}</p>
                <div className="flex justify-end space-x-2">
                    <button onClick={() => setIsConfirmModalOpen(false)} className="px-4 py-2 rounded-lg border border-border hover:bg-background">Cancel</button>
                    <button 
                        onClick={() => { modalConfig.onConfirm(); setIsConfirmModalOpen(false); }}
                        className={`px-4 py-2 rounded-lg text-white ${modalConfig.isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-primary hover:bg-primary-dark'}`}
                    >
                        {modalConfig.confirmText}
                    </button>
                </div>
            </Modal>

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
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../components/Card';
import { Client, Project, TimeEntry } from '../types';
import { getClients, getProjects, getTimeEntries } from '../services/api';
import { useTheme } from '../contexts/ThemeContext';

const PrintIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
    </svg>
);

const formatDuration = (start: Date, end: Date | null): string => {
    if (!end) return 'In progress';
    const diffMs = end.getTime() - start.getTime();
    if (diffMs < 0) return '0h 0m';
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    return `${hours}h ${minutes}m`;
};

const ReportChart: React.FC<{ data: any[] }> = ({ data }) => {
    const { theme } = useTheme();
    const isDarkMode = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

    const tickColor = isDarkMode ? '#94a3b8' : '#64748b'; // slate-400 : slate-500
    const gridColor = isDarkMode ? '#334155' : '#e2e8f0'; // slate-700 : slate-200

    // Truncate long project names for the chart axis
    const chartData = useMemo(() => data.map(item => ({
        ...item,
        name: item.name.length > 20 ? `${item.name.substring(0, 18)}...` : item.name,
        hours: parseFloat(item.hours.toFixed(2))
    })), [data]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            // Find the original full name for the tooltip from the initial data prop
            const originalItem = data.find(d => (d.name.length > 20 ? `${d.name.substring(0, 18)}...` : d.name) === label);
            
            return (
                <div className="bg-surface p-3 rounded-md border border-border shadow-lg">
                    <p className="font-bold text-text-primary">{originalItem ? originalItem.name : label}</p>
                    <p className="text-sm text-secondary">{`Hours: ${payload[0].value}`}</p>
                </div>
            );
        }
        return null;
    };

    return (
        <div style={{ width: '100%', height: 300 }} className="mb-8">
            <ResponsiveContainer>
                <BarChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: -10, bottom: 5, }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
                    <XAxis 
                        dataKey="name" 
                        tick={{ fill: tickColor, fontSize: 12 }} 
                        angle={-30}
                        textAnchor="end"
                        height={80}
                        interval={0}
                    />
                    <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft', fill: tickColor, fontSize: 14 }} tick={{ fill: tickColor, fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(var(--color-primary), 0.1)' }} />
                    <Bar dataKey="hours" fill="rgb(var(--color-primary))" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};


const ReportsPage: React.FC = () => {
    const [clients, setClients] = useState<Client[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const reportCardRef = useRef<HTMLDivElement>(null);

    const [selectedClient, setSelectedClient] = useState<string>('all');
    const today = new Date();
    const oneMonthAgo = new Date(today);
    oneMonthAgo.setMonth(today.getMonth() - 1);

    const [startDate, setStartDate] = useState(oneMonthAgo.toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(today.toISOString().split('T')[0]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const [clientsData, projectsData, entriesData] = await Promise.all([
                getClients(false), // Fetch only active clients
                getProjects(false), // Fetch only active projects
                getTimeEntries(),
            ]);
            setClients(clientsData);
            setProjects(projectsData);
            setTimeEntries(entriesData);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    const filteredEntries = useMemo(() => {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        return timeEntries
            .filter(entry => {
                const entryDate = new Date(entry.startTime);
                return entryDate >= start && entryDate <= end;
            })
            .filter(entry => {
                if (selectedClient === 'all') return true;
                const project = projects.find(p => p.id === entry.projectId);
                return project?.clientId === selectedClient;
            });
    }, [timeEntries, projects, selectedClient, startDate, endDate]);
    
    const sortedFilteredEntries = useMemo(() => {
        return [...filteredEntries].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
    }, [filteredEntries]);

    const getProjectName = (projectId: string) => projects.find(p => p.id === projectId)?.name || 'Unknown Project';
    const getClientName = (projectId: string) => {
        const project = projects.find(p => p.id === projectId);
        return clients.find(c => c.id === project?.clientId)?.name || 'Unknown Client';
    };
    
    const reportData = useMemo(() => {
        const projectTotals: { [key: string]: { name: string; hours: number, clientName: string } } = {};
        
        filteredEntries.forEach(entry => {
            if (entry.endTime) {
                const duration = (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime()) / (1000 * 60 * 60);
                if (!projectTotals[entry.projectId]) {
                     const project = projects.find(p => p.id === entry.projectId);
                     const client = clients.find(c => c.id === project?.clientId);
                     projectTotals[entry.projectId] = { name: project?.name || 'Unknown', hours: 0, clientName: client?.name || 'Unknown' };
                }
                projectTotals[entry.projectId].hours += duration;
            }
        });

        return Object.values(projectTotals).sort((a,b) => b.hours - a.hours);
    }, [filteredEntries, projects, clients]);

    const totalHours = useMemo(() => {
        return reportData.reduce((acc, curr) => acc + curr.hours, 0);
    }, [reportData]);


    const handlePrint = () => {
        const printContent = reportCardRef.current;
        if (!printContent) return;

        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        
        const printDocument = iframe.contentWindow!.document;

        printDocument.open();
        printDocument.write(`
            <html>
                <head>
                    <title>Stratus Time Tracker Report - ${new Date().toLocaleDateString()}</title>
                    ${document.head.innerHTML}
                </head>
                <body class="${document.body.className} p-8">
                     ${printContent.innerHTML}
                </body>
            </html>
        `);
        printDocument.close();

        iframe.onload = () => {
            const printWindow = iframe.contentWindow!;

            const onAfterPrint = () => {
                document.body.removeChild(iframe);
                printWindow.removeEventListener('afterprint', onAfterPrint);
            };
            printWindow.addEventListener('afterprint', onAfterPrint);

            setTimeout(() => {
                printWindow.focus();
                printWindow.print();
            }, 250);
        };
    }
    
    const inputStyles = "w-full px-4 py-2 bg-background dark:bg-slate-700 border border-border rounded-md focus:ring-2 focus:ring-primary focus:outline-none";

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center print:hidden">
                <h1 className="text-3xl font-bold text-text-primary">Reports</h1>
                <button
                    onClick={handlePrint}
                    className="flex items-center px-4 py-2 bg-secondary text-white rounded-md hover:bg-emerald-600"
                >
                    <PrintIcon />
                    Print Report
                </button>
            </div>

            <Card className="print:hidden">
                <div className="flex flex-wrap items-end gap-4">
                    <div className="flex-1 min-w-[200px]">
                        <label htmlFor="client-filter" className="block text-sm font-medium text-text-secondary mb-1">Client</label>
                        <select id="client-filter" value={selectedClient} onChange={e => setSelectedClient(e.target.value)} className={inputStyles}>
                            <option value="all">All Clients</option>
                            {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label htmlFor="start-date" className="block text-sm font-medium text-text-secondary mb-1">Start Date</label>
                        <input type="date" id="start-date" value={startDate} onChange={e => setStartDate(e.target.value)} className={inputStyles} />
                    </div>
                    <div className="flex-1 min-w-[150px]">
                        <label htmlFor="end-date" className="block text-sm font-medium text-text-secondary mb-1">End Date</label>
                        <input type="date" id="end-date" value={endDate} onChange={e => setEndDate(e.target.value)} className={inputStyles} />
                    </div>
                </div>
            </Card>

            <Card ref={reportCardRef}>
                <div className="-m-6">
                    <div className="px-6 py-4 border-b border-border">
                        <h2 className="text-xl font-semibold text-text-primary">Time Report</h2>
                        <p className="text-text-secondary">
                            {selectedClient === 'all' ? 'All Clients' : clients.find(c => c.id === selectedClient)?.name}
                            {' from '}
                            {new Date(startDate + 'T00:00:00').toLocaleDateString()} to {new Date(endDate + 'T00:00:00').toLocaleDateString()}
                        </p>
                    </div>

                    {isLoading ? <p className="p-6">Loading report...</p> : (
                        <div className="p-6">
                            {reportData.length > 0 ? (
                                <>
                                    <div className="print:hidden">
                                      <ReportChart data={reportData} />
                                    </div>

                                    <h3 className="text-lg font-semibold text-text-primary mb-4">Project Summary</h3>
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-border">
                                                <th className="p-2 font-semibold">Project</th>
                                                <th className="p-2 font-semibold hidden sm:table-cell">Client</th>
                                                <th className="p-2 font-semibold text-right">Hours</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {reportData.map((item, index) => (
                                                <tr key={`${item.name}-${index}`} className="border-b border-border/50">
                                                    <td className="p-2">{item.name}</td>
                                                    <td className="p-2 hidden sm:table-cell">{item.clientName}</td>
                                                    <td className="p-2 text-right font-mono">{item.hours.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot>
                                            <tr className="font-bold border-t-2 border-border">
                                                <td className="p-2">Total</td>
                                                <td className="p-2 hidden sm:table-cell"></td>
                                                <td className="p-2 text-right font-mono">{totalHours.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>

                                    <h3 className="text-lg font-semibold text-text-primary mt-12 mb-4 pt-4 border-t border-border">
                                        Time Entry Details
                                    </h3>
                                    <table className="w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b-2 border-border">
                                                <th className="p-2 font-semibold">Date</th>
                                                <th className="p-2 font-semibold">Project / Client</th>
                                                <th className="p-2 font-semibold">Description</th>
                                                <th className="p-2 font-semibold text-right">Duration</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {sortedFilteredEntries.map((entry) => (
                                                <tr key={entry.id} className="border-b border-border/50">
                                                    <td className="p-2 whitespace-nowrap">{new Date(entry.startTime).toLocaleDateString()}</td>
                                                    <td className="p-2">
                                                        <div className="font-medium">{getProjectName(entry.projectId)}</div>
                                                        <div className="text-xs text-text-secondary">{getClientName(entry.projectId)}</div>
                                                    </td>
                                                    <td className="p-2">{entry.description}</td>
                                                    <td className="p-2 text-right font-mono whitespace-nowrap">
                                                        {formatDuration(new Date(entry.startTime), entry.endTime ? new Date(entry.endTime) : null)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </>
                            ) : (
                                <p className="text-text-secondary">No data for the selected period.</p>
                            )}
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
};

export default ReportsPage;

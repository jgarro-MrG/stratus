import React, { useEffect, useState, useCallback, ChangeEvent } from 'react';
import Card from '../components/Card';
import { useToast } from '../contexts/ToastContext';
import * as api from '../services/api';
import { UserSettings, DateFormat, TimeFormat, Theme } from '../types';
import { useTheme } from '../contexts/ThemeContext';
import Spinner from '../components/Spinner';

const UserIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const SettingsPage: React.FC = () => {
    const { addToast } = useToast();
    const { setTheme } = useTheme();
    const [settings, setSettings] = useState<UserSettings | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        setIsLoading(true);
        const userSettings = await api.getUserSettings();
        if (userSettings) {
            setSettings(userSettings);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const handleProfileChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        setSettings({
            ...settings,
            profile: { ...settings.profile, [e.target.name]: e.target.value },
        });
    };

    const handlePreferencesChange = (e: ChangeEvent<HTMLSelectElement>) => {
        if (!settings) return;
        const { name, value } = e.target;
        
        if (name === 'theme') {
            setTheme(value as Theme); // Update theme context immediately for UI feedback
        }

        setSettings({
            ...settings,
            preferences: { ...settings.preferences, [name]: value },
        });
    };

    const handleReportSettingsChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        setSettings({
            ...settings,
            preferences: {
                ...settings.preferences,
                reportSettings: {
                    ...settings.preferences.reportSettings,
                    [e.target.name]: e.target.checked,
                },
            },
        });
    };

    const handleProfilePictureChange = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && settings) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setSettings({
                    ...settings,
                    profile: { ...settings.profile, profilePicture: reader.result as string },
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = async () => {
        if (settings) {
            try {
                await api.updateUserSettings(settings);
                addToast('Settings saved successfully!', 'success');
            } catch (error) {
                addToast('Failed to save settings.', 'error');
                console.error(error);
            }
        }
    };
    
    if (isLoading || !settings) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner className="h-10 w-10 text-primary" />
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-4xl mx-auto">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-text-primary">Settings</h1>
                <button
                    onClick={handleSaveChanges}
                    className="bg-primary text-white font-semibold px-6 py-2 rounded-lg hover:bg-primary-dark transition-colors"
                >
                    Save Changes
                </button>
            </div>

            <Card title="User Profile">
                <div className="flex flex-col md:flex-row items-center gap-8">
                    <div className="flex flex-col items-center">
                        <div className="w-32 h-32 rounded-full bg-background flex items-center justify-center overflow-hidden border border-border mb-4">
                            {settings.profile.profilePicture ? (
                                <img src={settings.profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon />
                            )}
                        </div>
                        <input
                            type="file"
                            id="profilePictureInput"
                            className="hidden"
                            accept="image/png, image/jpeg"
                            onChange={handleProfilePictureChange}
                        />
                        <label
                            htmlFor="profilePictureInput"
                            className="cursor-pointer text-sm text-primary hover:text-primary-dark font-semibold"
                        >
                            Change Picture
                        </label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-grow w-full">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Full Name</label>
                            <input
                                type="text"
                                name="name"
                                value={settings.profile.name}
                                onChange={handleProfileChange}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="Your Name"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Email Address</label>
                            <input
                                type="email"
                                name="email"
                                value={settings.profile.email}
                                onChange={handleProfileChange}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="your.email@example.com"
                            />
                        </div>
                         <div className="col-span-1 sm:col-span-2">
                            <label className="block text-sm font-medium text-text-secondary mb-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={settings.profile.phone}
                                onChange={handleProfileChange}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="(123) 456-7890"
                            />
                        </div>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card title="Application Preferences">
                     <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Date Format</label>
                            <select
                                name="dateFormat"
                                value={settings.preferences.dateFormat}
                                onChange={handlePreferencesChange}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="MMMM d, yyyy">Month d, yyyy (e.g., April 15, 2024)</option>
                                <option value="MM/dd/yyyy">MM/dd/yyyy (e.g., 04/15/2024)</option>
                                <option value="dd/MM/yyyy">dd/MM/yyyy (e.g., 15/04/2024)</option>
                                <option value="yyyy-MM-dd">yyyy-MM-dd (e.g., 2024-04-15)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Time Format</label>
                            <select
                                name="timeFormat"
                                value={settings.preferences.timeFormat}
                                onChange={handlePreferencesChange}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="12h">12-hour (e.g., 3:30 PM)</option>
                                <option value="24h">24-hour (e.g., 15:30)</option>
                            </select>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-text-secondary mb-1">Theme</label>
                            <select
                                name="theme"
                                value={settings.preferences.theme}
                                onChange={handlePreferencesChange}
                                className="w-full px-3 py-2 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                            >
                                <option value="light">Light</option>
                                <option value="dark">Dark</option>
                                <option value="system">System</option>
                            </select>
                        </div>
                    </div>
                </Card>

                <Card title="Report Settings">
                    <div className="space-y-4">
                        <p className="text-sm text-text-secondary -mt-2">Choose which profile details to include in printed reports.</p>
                        <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-background">
                            <input
                                type="checkbox"
                                name="includeName"
                                checked={settings.preferences.reportSettings.includeName}
                                onChange={handleReportSettingsChange}
                                className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-text-primary">Include Full Name</span>
                        </label>
                        <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-background">
                            <input
                                type="checkbox"
                                name="includeEmail"
                                checked={settings.preferences.reportSettings.includeEmail}
                                onChange={handleReportSettingsChange}
                                className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-text-primary">Include Email Address</span>
                        </label>
                        <label className="flex items-center space-x-3 p-2 rounded-md hover:bg-background">
                            <input
                                type="checkbox"
                                name="includePhone"
                                checked={settings.preferences.reportSettings.includePhone}
                                onChange={handleReportSettingsChange}
                                className="h-5 w-5 rounded border-border text-primary focus:ring-primary"
                            />
                            <span className="text-text-primary">Include Phone Number</span>
                        </label>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default SettingsPage;

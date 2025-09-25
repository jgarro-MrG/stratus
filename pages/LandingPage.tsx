import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/Card';

const OnboardingIllustration: React.FC = () => (
    <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M100 25C130 25 140 40 140 60V120C140 140 160 150 160 150H40C40 150 60 140 60 120V60C60 40 70 25 100 25Z" fill="rgb(var(--color-surface))" stroke="rgb(var(--color-text-primary))" strokeWidth="4"/>
        <path d="M80 120H120" stroke="rgb(var(--color-border))" strokeWidth="4"/>
        <circle cx="100" cy="75" r="15" fill="rgb(var(--color-primary) / 0.2)" stroke="rgb(var(--color-primary))" strokeWidth="4"/>
        <path d="M40 150L60 175H140L160 150H40Z" fill="rgb(var(--color-primary))"/>
        <path d="M85 175V190C85 190 80 195 70 195C60 195 65 175 65 175" stroke="rgb(var(--color-text-secondary))" strokeWidth="4" strokeLinecap="round"/>
        <path d="M115 175V190C115 190 120 195 130 195C140 195 135 175 135 175" stroke="rgb(var(--color-text-secondary))" strokeWidth="4" strokeLinecap="round"/>
    </svg>
);


const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
      <div className="text-center mb-8">
        <OnboardingIllustration />
      </div>
      <h1 className="text-4xl font-bold text-primary mb-4">Welcome to Stratus Time Tracker</h1>
      <p className="text-lg text-text-secondary max-w-2xl text-center mb-10">
        The simple, elegant way to track your time, manage projects, and generate reports. Let's get your workspace set up.
      </p>
      
      <Card className="max-w-md w-full animate-scaleUp">
          <h2 className="text-xl font-semibold text-text-primary mb-2">Let's Get Started</h2>
          <p className="text-text-secondary mb-6">
            The first step is to add a client. A client can be a company or an individual you're doing work for. After that, you can add projects for that client.
          </p>
          <Link
            to="/projects"
            className="w-full block text-center bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-dark transition-colors text-lg"
          >
            Add Your First Client
          </Link>
      </Card>
       <p className="text-sm text-text-secondary mt-8">
            You can always configure your profile and preferences in the <Link to="/settings" className="text-primary hover:underline">Settings</Link> page later.
        </p>
    </div>
  );
};

export default LandingPage;
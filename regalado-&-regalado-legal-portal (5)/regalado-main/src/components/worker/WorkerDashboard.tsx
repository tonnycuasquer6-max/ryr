
import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import Sidebar from '../shared/Sidebar';
import { HamburgerIcon, FolderIcon, ClockIcon, CurrencyDollarIcon } from '../shared/Icons';
import CaseView from '../CaseView';
import TimeBillingView from './TimeBillingView';
import ExpensesView from './ExpensesView';

const navItems = [
    { icon: <FolderIcon />, label: 'Mis Casos', view: 'CASES' },
    { icon: <ClockIcon />, label: 'Registro de Actividades (Time Billing)', view: 'TIME_BILLING' },
    { icon: <CurrencyDollarIcon />, label: 'Gastos', view: 'EXPENSES' },
];

const WorkerDashboard: React.FC<{ session: Session }> = ({ session }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [activeView, setActiveView] = useState('CASES');

    const renderContent = () => {
        switch (activeView) {
            case 'CASES':
                return <CaseView title="Mis Casos" />;
            case 'TIME_BILLING':
                return <TimeBillingView />;
            case 'EXPENSES':
                return <ExpensesView />;
            default:
                return <CaseView title="Mis Casos" />;
        }
    };
    
    return (
        <div className="relative min-h-screen bg-black flex">
            <Sidebar 
                isOpen={isMenuOpen} 
                onClose={() => setIsMenuOpen(false)}
                activeView={activeView}
                setActiveView={setActiveView}
                session={session}
                navItems={navItems}
            />
            <div className="flex-1 lg:pl-72">
                <header className="absolute top-0 left-0 p-3 z-30 lg:hidden">
                    <HamburgerIcon onClick={() => setIsMenuOpen(prev => !prev)} />
                </header>
                
                <main className="p-4 sm:p-8 text-white w-full">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default WorkerDashboard;

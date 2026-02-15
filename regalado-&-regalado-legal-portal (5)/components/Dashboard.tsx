
import React, { useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../services/supabaseClient';
import { DashboardView } from '../types';
import CaseView from './CaseView';

const HamburgerIcon = ({ onClick }: { onClick: () => void }) => (
  <button onClick={onClick} className="p-2 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded z-50" aria-label="Open menu">
    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
    </svg>
  </button>
);

// FIX: Replaced JSX.Element with React.ReactNode to resolve "Cannot find namespace 'JSX'" error. This ensures the type is correctly resolved from the React import.
const NavLink: React.FC<{ icon: React.ReactNode; label: string; isActive: boolean; onClick: () => void }> = ({ icon, label, isActive, onClick }) => (
    <a href="#" onClick={onClick} className={`flex items-center py-3 px-4 rounded transition-colors text-lg ${isActive ? 'bg-navy text-white' : 'text-gray-300 hover:bg-navy'}`}>
      <span className="mr-4">{icon}</span>
      {label}
    </a>
);

const Sidebar: React.FC<{ isOpen: boolean; onClose: () => void; activeView: DashboardView; setActiveView: (view: DashboardView) => void; session: Session }> = ({ isOpen, onClose, activeView, setActiveView, session }) => {
  const handleLogout = async () => {
    await supabase.auth.signOut();
  };
  
  const userEmail = session.user?.email || 'usuario@regalado.com';

  return (
    <>
      <div className={`fixed inset-0 bg-black bg-opacity-70 z-40 transition-opacity duration-300 lg:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={onClose} />
      <div className={`fixed top-0 left-0 h-full w-72 bg-navy-light text-white z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 flex flex-col`}>
        <div className="p-6 flex-grow">
          <h2 className="text-2xl font-semibold mb-8 text-white">Portal Seguro</h2>
          <nav>
            <ul>
              <li className="mb-4">
                <NavLink 
                    icon={<FolderIcon />} 
                    label="Casos" 
                    isActive={activeView === DashboardView.CASES}
                    onClick={() => setActiveView(DashboardView.CASES)}
                />
              </li>
              <li className="mb-4">
                <NavLink 
                    icon={<ClockIcon />} 
                    label="Registro de Actividades" 
                    isActive={activeView === DashboardView.ACTIVITY_LOG}
                    onClick={() => setActiveView(DashboardView.ACTIVITY_LOG)}
                />
              </li>
            </ul>
          </nav>
        </div>
        <div className="p-6 border-t border-gray-700">
            <div className="text-sm text-brand-gray mb-4">
                <p className="font-semibold text-white">Sesión activa como:</p>
                <p className="truncate">{userEmail}</p>
            </div>
           <button onClick={handleLogout} className="w-full flex items-center text-left py-3 px-4 rounded bg-red-600 hover:bg-red-700 transition-colors text-lg">
             <LogoutIcon />
             <span className="ml-2">Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

interface DashboardProps {
  session: Session;
}

const Dashboard: React.FC<DashboardProps> = ({ session }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<DashboardView>(DashboardView.CASES);

  return (
    <div className="relative min-h-screen bg-navy flex">
      <Sidebar 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        activeView={activeView}
        setActiveView={setActiveView}
        session={session}
      />
      <div className="flex-1 lg:pl-72">
        <header className="absolute top-0 left-0 p-3 z-30 lg:hidden">
            <HamburgerIcon onClick={() => setIsMenuOpen(prev => !prev)} />
        </header>
        
        <main className="p-4 sm:p-8 text-white w-full">
            {activeView === DashboardView.CASES && <CaseView />}
            {activeView === DashboardView.ACTIVITY_LOG && <ActivityLogView />}
        </main>
      </div>
    </div>
  );
};

const ActivityLogView = () => (
    <div>
        <h1 className="text-3xl font-bold mb-6">Registro de Actividades</h1>
        <div className="bg-navy-light p-8 text-center text-brand-gray">
            <p>La funcionalidad de registro de actividades estará disponible próximamente.</p>
        </div>
    </div>
);

// Icons
const FolderIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>;
const ClockIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const LogoutIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>;

export default Dashboard;
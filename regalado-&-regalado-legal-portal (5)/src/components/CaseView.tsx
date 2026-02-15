import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Case } from '../types';
import { CaseStatus } from '../types';

const statusStyles: { [key in CaseStatus]: string } = {
    [CaseStatus.Open]: 'bg-green-500 text-green-100',
    [CaseStatus.Pending]: 'bg-yellow-500 text-yellow-100',
    [CaseStatus.Closed]: 'bg-gray-500 text-gray-100',
};

const CaseCard: React.FC<{ caseData: Case }> = ({ caseData }) => {
    return (
        <div className="bg-navy-light p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white">{caseData.titulo}</h3>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${statusStyles[caseData.estado]}`}>{caseData.estado}</span>
                </div>
                <p className="text-brand-gray mb-1 font-mono text-sm">Caso ID: {caseData.id.substring(0, 8)}...</p>
                <p className="text-gray-300 mt-4">{caseData.descripcion}</p>
            </div>
            <div className="mt-6 text-right text-xs text-brand-gray">
                Fecha de Creación: {new Date(caseData.created_at).toLocaleDateString()}
            </div>
        </div>
    );
};


const CaseView: React.FC = () => {
    const [cases, setCases] = useState<Case[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCases = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: dbError } = await supabase
                .from('cases')
                .select('*')
                .order('created_at', { ascending: false });

            if (dbError) {
                throw dbError;
            }
            
            setCases(data as Case[]);
        } catch (err: any) {
            console.error("Error fetching cases:", err);
            setError("No se pudieron cargar los casos. Por favor, inténtelo de nuevo más tarde.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCases();
    }, [fetchCases]);

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Mis Casos</h1>
                <button 
                    onClick={fetchCases} 
                    disabled={loading} 
                    className="flex items-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded transition-colors disabled:opacity-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h5M20 20v-5h-5M4 4l5 5M20 20l-5-5" /></svg>
                    {loading ? 'Cargando...' : 'Actualizar'}
                </button>
            </div>

            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-navy-light p-6 shadow-lg animate-pulse">
                            <div className="h-6 bg-gray-700 rounded w-3/4 mb-4"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/4 mb-6"></div>
                            <div className="h-4 bg-gray-700 rounded w-full mb-2"></div>
                            <div className="h-4 bg-gray-700 rounded w-5/6"></div>
                            <div className="h-4 bg-gray-700 rounded w-1/3 mt-6 ml-auto"></div>
                        </div>
                    ))}
                </div>
            )}
            
            {error && !loading && (
                <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && cases.length === 0 && (
                 <div className="bg-navy-light p-8 text-center text-brand-gray">
                    <p>No se encontraron casos asignados a su cuenta.</p>
                </div>
            )}

            {!loading && !error && cases.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cases.map((caseItem) => (
                        <CaseCard key={caseItem.id} caseData={caseItem} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default CaseView;

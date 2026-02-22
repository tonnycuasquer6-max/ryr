import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { supabase } from '../../services/supabaseClient';
import { PencilIcon, TrashIcon, SearchIcon } from '../shared/Icons';

// --- Type Definitions ---
interface Profile {
    id: string;
    primer_nombre: string;
    segundo_nombre: string | null;
    primer_apellido: string;
    segundo_apellido: string | null;
    matricula_nro: string | null;
    cedula: string;
    email: string;
    foto_url: string | null;
    rol: 'trabajador' | 'cliente';
    categoria_usuario: 'abogado' | 'estudiante' | 'cliente';
}

interface ListaPerfilesProps {
    role: 'abogado' | 'estudiante' | 'cliente';
    onCancel: () => void;
}

// --- Reusable Modal Component ---
const Modal: React.FC<{ isOpen: boolean; onClose: () => void; children: React.ReactNode }> = ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in-25"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-black border border-zinc-800 shadow-2xl w-full max-w-lg">
                {children}
            </div>
        </div>
    );
};

// --- Profile Row Component ---
const ProfileRow: React.FC<{ profile: Profile; onEdit: (profile: Profile) => void; onDelete: (profile: Profile) => void }> = ({ profile, onEdit, onDelete }) => {
    const fullName = [profile.primer_nombre, profile.segundo_nombre, profile.primer_apellido, profile.segundo_apellido].filter(Boolean).join(' ');
    const identification = profile.matricula_nro || profile.cedula;

    return (
        <div className="group flex items-center p-4 border-b border-zinc-900 hover:bg-zinc-900/50 transition-colors duration-200">
            <img
                src={profile.foto_url || 'https://via.placeholder.com/150/000000/FFFFFF/?text=R&R'}
                alt="Foto de perfil"
                className="w-16 h-16 rounded-full object-cover border-2 border-zinc-800"
            />
            <div className="ml-6 flex-grow">
                <p className="text-lg font-bold text-white tracking-wide">{fullName}</p>
                <p className="text-sm text-zinc-400 font-mono">{identification}</p>
                <p className="text-sm text-zinc-500">{profile.email}</p>
            </div>
            <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button onClick={() => onEdit(profile)} className="text-zinc-500 hover:text-white transition-colors" aria-label="Editar">
                    <PencilIcon />
                </button>
                <button onClick={() => onDelete(profile)} className="text-zinc-500 hover:text-red-500 transition-colors" aria-label="Eliminar">
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
};

// --- Main List Component ---
const ListaPerfiles: React.FC<ListaPerfilesProps> = ({ role, onCancel }) => {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [profileToDelete, setProfileToDelete] = useState<Profile | null>(null);
    const [profileToEdit, setProfileToEdit] = useState<Profile | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<Profile>>({});
    const [searchTerm, setSearchTerm] = useState('');

    const fetchProfiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: dbError } = await supabase
                .from('profiles')
                .select('*')
                .eq('categoria_usuario', role);

            if (dbError) throw dbError;
            setProfiles(data || []);
        } catch (err: any) {
            setError("No se pudieron cargar los perfiles.");
        } finally {
            setLoading(false);
        }
    }, [role]);

    useEffect(() => {
        fetchProfiles();
    }, [fetchProfiles]);

    const handleDelete = async () => {
        if (!profileToDelete) return;

        setActionLoading(true);
        const { error: deleteError } = await supabase
            .from('profiles')
            .delete()
            .eq('id', profileToDelete.id);

        if (deleteError) {
            setError('Error al eliminar el perfil.');
        } else {
            setProfiles(prev => prev.filter(p => p.id !== profileToDelete.id));
            setProfileToDelete(null);
        }
        setActionLoading(false);
    };

    const handleEdit = (profile: Profile) => {
        setProfileToEdit(profile);
        setEditFormData({
            primer_nombre: profile.primer_nombre,
            segundo_nombre: profile.segundo_nombre,
            primer_apellido: profile.primer_apellido,
            segundo_apellido: profile.segundo_apellido,
            cedula: profile.cedula,
            matricula_nro: profile.matricula_nro,
            email: profile.email,
        });
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!profileToEdit) return;

        setActionLoading(true);
        const { data, error: updateError } = await supabase
            .from('profiles')
            .update(editFormData)
            .eq('id', profileToEdit.id)
            .select()
            .single();

        if (updateError) {
            setError('Error al actualizar el perfil.');
        } else if (data) {
            setProfiles(prev => prev.map(p => (p.id === data.id ? data : p)));
            setProfileToEdit(null);
        }
        setActionLoading(false);
    };
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const roleTitle = role.charAt(0).toUpperCase() + role.slice(1);

    const filteredProfiles = profiles.filter(profile => {
        const term = searchTerm.toLowerCase();
        const fullName = [profile.primer_nombre, profile.segundo_nombre, profile.primer_apellido, profile.segundo_apellido].filter(Boolean).join(' ').toLowerCase();

        return (
            fullName.includes(term) ||
            (profile.cedula && profile.cedula.toLowerCase().includes(term)) ||
            (profile.matricula_nro && profile.matricula_nro.toLowerCase().includes(term))
        );
    });

    return (
        <Fragment>
            <div className="max-w-4xl mx-auto animate-in fade-in duration-500">
                <header className="flex items-center justify-between mb-8 pb-4 border-b border-zinc-900">
                    <h1 className="text-3xl font-black uppercase tracking-tighter italic text-white">Perfiles: {roleTitle}s</h1>
                    <button onClick={onCancel} className="text-zinc-400 hover:text-white font-black py-2 px-6 transition-colors uppercase text-[10px] tracking-[0.3em]">Volver</button>
                </header>

                <div className="relative flex items-center mb-8">
                    <SearchIcon className="absolute left-0 h-5 w-5 text-zinc-600 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Buscar por nombre, cédula o matrícula..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={`w-full bg-transparent pl-8 pb-2 text-white placeholder-zinc-700
                                    focus:outline-none border-b transition-colors duration-300
                                    ${searchTerm ? 'border-transparent' : 'border-zinc-800'}
                                    focus:border-zinc-500`}
                    />
                </div>
                
                {error && <div className="text-center text-red-500 p-4 mb-4 bg-red-900/20 border border-red-800">{error}</div>}

                {loading ? (
                    <div className="text-center text-zinc-500 p-4">Cargando perfiles...</div>
                ) : profiles.length === 0 ? (
                    <div className="text-center text-zinc-500 p-10">
                        No se encontraron perfiles de tipo '{roleTitle}'.
                    </div>
                ) : filteredProfiles.length === 0 ? (
                    <div className="text-center text-zinc-500 p-10">
                        No se encontraron perfiles que coincidan con la búsqueda.
                    </div>
                ) : (
                    <div className="bg-black">
                        {filteredProfiles.map(profile => (
                            <ProfileRow key={profile.id} profile={profile} onEdit={handleEdit} onDelete={setProfileToDelete} />
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={!!profileToDelete} onClose={() => setProfileToDelete(null)}>
                <div className="p-8">
                    <h2 id="modal-title" className="text-xl font-bold text-white mb-4">Confirmar Eliminación</h2>
                    <p className="text-zinc-400 mb-8">¿Seguro que desea eliminar este perfil? Esta acción es irreversible.</p>
                </div>
                <div className="p-4 bg-zinc-900/50 flex justify-end gap-4">
                    <button onClick={() => setProfileToDelete(null)} className="font-bold py-2 px-6 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
                    <button onClick={handleDelete} disabled={actionLoading} className="bg-red-900 hover:bg-red-800 text-white font-bold py-2 px-6 disabled:opacity-50 transition-colors">
                        {actionLoading ? 'Eliminando...' : 'Eliminar'}
                    </button>
                </div>
            </Modal>

            {/* Edit Profile Modal */}
            <Modal isOpen={!!profileToEdit} onClose={() => setProfileToEdit(null)}>
                <form onSubmit={handleUpdate}>
                    <div className="p-8">
                        <h2 id="modal-title" className="text-xl font-bold text-white mb-8">Editar Perfil</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                            <InputField label="Primer Nombre" name="primer_nombre" value={editFormData.primer_nombre || ''} onChange={handleInputChange} />
                            <InputField label="Segundo Nombre" name="segundo_nombre" value={editFormData.segundo_nombre || ''} onChange={handleInputChange} />
                            <InputField label="Primer Apellido" name="primer_apellido" value={editFormData.primer_apellido || ''} onChange={handleInputChange} />
                            <InputField label="Segundo Apellido" name="segundo_apellido" value={editFormData.segundo_apellido || ''} onChange={handleInputChange} />
                            <InputField label="DNI / Cédula" name="cedula" value={editFormData.cedula || ''} onChange={handleInputChange} />
                            {role === 'abogado' && <InputField label="Matrícula Prof." name="matricula_nro" value={editFormData.matricula_nro || ''} onChange={handleInputChange} />}
                            <div className="md:col-span-2">
                               <InputField label="Email" name="email" type="email" value={editFormData.email || ''} onChange={handleInputChange} />
                            </div>
                        </div>
                    </div>
                    <div className="p-4 bg-zinc-900/50 flex justify-end gap-4">
                        <button type="button" onClick={() => setProfileToEdit(null)} className="font-bold py-2 px-6 text-zinc-400 hover:text-white transition-colors">Cancelar</button>
                        <button type="submit" disabled={actionLoading} className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-2 px-6 disabled:opacity-50 transition-colors">
                            {actionLoading ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </Modal>
        </Fragment>
    );
};

// --- Helper InputField Component for the Modal Form ---
const InputField: React.FC<{ label: string, name: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, type?: string }> = ({ label, name, value, onChange, type = 'text' }) => (
    <div>
        <label htmlFor={name} className="block text-zinc-500 text-[10px] font-black mb-2 uppercase tracking-[0.3em]">{label}</label>
        <input
            id={name}
            name={name}
            type={type}
            value={value}
            onChange={onChange}
            className="w-full py-2 px-0 bg-transparent border-b-2 border-zinc-800 text-white focus:outline-none focus:border-zinc-500 transition-colors"
        />
    </div>
);

export default ListaPerfiles;

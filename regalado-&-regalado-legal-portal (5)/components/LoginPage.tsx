
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

const Logo = () => (
    <svg width="80" height="80" viewBox="0 0 100 100" fill="none" xmlns="http://www.w.org/2000/svg">
        <path d="M50 10 L15 30 L15 70 L50 90 L85 70 L85 30 L50 10 Z" stroke="#B0B0B0" strokeWidth="5"/>
        <text x="50" y="58" fontFamily="Georgia, serif" fontSize="30" fill="#FFFFFF" textAnchor="middle" fontWeight="bold">R</text>
        <path d="M50 45 L50 75" stroke="#B0B0B0" strokeWidth="3"/>
        <text x="33" y="65" fontFamily="Georgia, serif" fontSize="20" fill="#FFFFFF" textAnchor="middle">&</text>
        <text x="67" y="65" fontFamily="Georgia, serif" fontSize="20" fill="#FFFFFF" textAnchor="middle">R</text>
    </svg>
);

interface LoginPageProps {
    setIsAwaitingMfa: (isAwaiting: boolean) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ setIsAwaitingMfa }) => {
    enum LoginStep {
        Credentials,
        EmailOtp
    }
    
    const [loginStep, setLoginStep] = useState<LoginStep>(LoginStep.Credentials);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        
        // Clear previous errors and signal that the MFA process is starting.
        // This prevents the parent component from unmounting this page prematurely.
        setError(null);
        setIsAwaitingMfa(true);
        setLoading(true);

        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            setError(signInError.message);
            setIsAwaitingMfa(false); // Reset MFA state on error
            setLoading(false);
            return;
        }

        const { error: signOutError } = await supabase.auth.signOut();
        if (signOutError) {
            setError("A temporary session conflict occurred. Please try again.");
            setIsAwaitingMfa(false); // Reset MFA state on error
            setLoading(false);
            return;
        }

        const { error: otpError } = await supabase.auth.signInWithOtp({
            email,
            options: {
                shouldCreateUser: false,
            },
        });

        if (otpError) {
            setError("Could not send verification code. Please try again later.");
            setIsAwaitingMfa(false); // Reset MFA state on error
            setLoading(false);
            return;
        }

        // On success, transition to the OTP step.
        setLoginStep(LoginStep.EmailOtp);
        setLoading(false);
    };

    const verificarCodigo = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const { data, error: verifyError } = await supabase.auth.verifyOtp({
            email,
            token: otp,
            type: 'email'
        });

        if (verifyError) {
            setError(verifyError.message);
            setLoading(false);
            return;
        }
        
        // On successful verification, a session is created.
        // The onAuthStateChange listener in App.tsx will receive it.
        // We signal that the MFA flow is now complete.
        if (data.session) {
            setIsAwaitingMfa(false);
        } else {
            setError("No se pudo verificar la sesión. Por favor, intente de nuevo.");
            setLoading(false);
        }
    };
    
    const handleReturnToLogin = () => {
        setError(null);
        setOtp('');
        setPassword('');
        setLoginStep(LoginStep.Credentials);
        setIsAwaitingMfa(false); // Reset MFA state
    };
    
    return (
        <div className="flex flex-col items-center justify-center min-h-screen px-4 bg-navy">
            <div className="w-full max-w-md">
                <div className="flex justify-center mb-8">
                    <Logo />
                </div>
                <div className="bg-navy-light shadow-2xl px-8 pt-6 pb-8 mb-4">
                    <h1 className="text-2xl font-bold text-center text-white mb-2">
                        {loginStep === LoginStep.Credentials ? 'Regalado & Regalado' : 'Verificación de Seguridad'}
                    </h1>
                    <p className="text-center text-brand-gray mb-8">
                        {loginStep === LoginStep.Credentials ? 'Secure Access Portal' : 'Ingrese el código enviado a su correo.'}
                    </p>

                    {error && (
                        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 relative mb-4" role="alert">
                            <span className="block sm:inline">{error}</span>
                        </div>
                    )}

                    {loginStep === LoginStep.Credentials ? (
                        <form onSubmit={handleLogin}>
                            <div className="mb-4">
                                <label className="block text-gray-300 text-sm font-bold mb-2">Usuario (Email)</label>
                                <input
                                    className="shadow appearance-none border border-gray-600 w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    type="email"
                                    placeholder="ejemplo@correo.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="mb-6">
                                <label className="block text-gray-300 text-sm font-bold mb-2">Contraseña</label>
                                <input
                                    className="shadow appearance-none border border-gray-600 w-full py-3 px-4 bg-gray-700 text-white leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    type="password"
                                    placeholder="******************"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 w-full disabled:opacity-50 transition-colors" type="submit" disabled={loading}>
                                {loading ? 'Verificando...' : 'Ingresar'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={verificarCodigo}>
                            <div className="mb-6">
                                <label className="block text-gray-300 text-sm font-bold mb-2">Código de Verificación</label>
                                <input
                                    className="shadow appearance-none border border-gray-600 w-full py-3 px-4 bg-gray-700 text-white text-center tracking-[0.5em] font-mono text-lg leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
                                    type="text"
                                    inputMode="numeric"
                                    placeholder="123456"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                    required
                                />
                            </div>
                            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 w-full disabled:opacity-50 transition-colors mb-4" type="submit" disabled={loading}>
                                {loading ? 'Validando...' : 'Verificar e Ingresar'}
                            </button>
                            <div className="text-center">
                                <button type="button" onClick={handleReturnToLogin} className="text-sm text-brand-gray hover:text-white">
                                    ¿Problemas con el código? Volver al inicio
                                </button>
                            </div>
                        </form>
                    )}
                </div>
                <p className="text-center text-brand-gray text-xs">
                    &copy;{new Date().getFullYear()} Regalado & Regalado Abogados.
                </p>
            </div>
        </div>
    );
};

export default LoginPage;

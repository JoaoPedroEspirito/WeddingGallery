import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Heart, Lock, User, ArrowRight } from 'lucide-react';

export default function Home() {
    const [accessCode, setAccessCode] = useState('');
    const [guestName, setGuestName] = useState(localStorage.getItem('@WeddingGallery:guestName') || '');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const colors = {
        primary: '#639496',
        background: '#F9F6F0', 
        cardBg: '#FFFFFF',
        text: '#333333',
        shadow: 'rgba(99, 148, 150, 0.12)'
    };

    const handleJoinEvent = async (e) => {
        e.preventDefault();
        if (!accessCode || !guestName) {
            setError('Por favor, preencha seu nome e o código.');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const response = await api.get(`/events/${accessCode}`);

            localStorage.setItem('@WeddingGallery:guestName', guestName);

            navigate(`/events/${response.data.id}`);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                setError('Código inválido. Verifique o convite e tente novamente.');
            } else {
                setError('Erro ao conectar com o servidor.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            justifyContent: 'center', alignItems: 'center', padding: '20px'
        }}>
            <div style={{
                backgroundColor: 'rgba(255, 255, 255, 0.90)', 
                backdropFilter: 'blur(8px)',
                padding: '45px 30px', borderRadius: '16px',
                boxShadow: `0 10px 30px ${colors.shadow}`,
                textAlign: 'center', maxWidth: '400px', width: '100%',
                border: '1px solid rgba(255, 255, 255, 0.5)'
            }}>
                <Heart size={32} color={colors.primary} style={{ marginBottom: '15px' }} />

                <h1 style={{ fontFamily: "'Georgia', serif", color: colors.primary, margin: '0 0 10px 0', fontSize: '26px', fontWeight: 'normal' }}>
                    Compartilhe este momento
                </h1>

                <p style={{ color: '#777', fontSize: '14px', marginBottom: '35px', lineHeight: '1.6' }}>
                    Identifique-se e digite o código do convite para acessar o mural.
                </p>

                <form onSubmit={handleJoinEvent} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

                    
                    <div style={{ position: 'relative' }}>
                        <User size={18} color={colors.primary} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="NOME e SOBRENOME"
                            value={guestName}
                            onChange={(e) => setGuestName(e.target.value)}
                            style={{
                                width: '100%', padding: '14px 15px 14px 45px', fontSize: '14px', borderRadius: '8px',
                                border: `1px solid ${colors.primary}40`, outline: 'none', boxSizing: 'border-box', color: colors.text
                            }}
                        />
                    </div>

                    
                    <div style={{ position: 'relative' }}>
                        <Lock size={18} color={colors.primary} style={{ position: 'absolute', left: '15px', top: '50%', transform: 'translateY(-50%)' }} />
                        <input
                            type="text"
                            placeholder="CÓDIGO DO EVENTO"
                            value={accessCode}
                            onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
                            style={{
                                width: '100%', padding: '14px 15px 14px 45px', fontSize: '14px', borderRadius: '8px',
                                border: `1px solid ${colors.primary}40`, outline: 'none', boxSizing: 'border-box', color: colors.text, letterSpacing: '1px'
                            }}
                        />
                    </div>

                    {error && <span style={{ color: '#e17055', fontSize: '13px', marginTop: '-5px' }}>{error}</span>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                            padding: '14px', fontSize: '15px', fontWeight: '500',
                            backgroundColor: colors.primary, color: '#fff', border: 'none', borderRadius: '30px',
                            cursor: isLoading ? 'not-allowed' : 'pointer', marginTop: '10px', boxShadow: '0 4px 10px rgba(99, 148, 150, 0.2)'
                        }}
                    >
                        {isLoading ? 'Acessando...' : 'Entrar no Mural'}
                        {!isLoading && <ArrowRight size={18} />}
                    </button>
                </form>
            </div>
        </div>
    );
}
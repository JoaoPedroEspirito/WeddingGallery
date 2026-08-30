import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/api';
import { Camera, UploadCloud, Download, X, ChevronLeft, ChevronRight, CheckSquare, CheckCircle } from 'lucide-react';

export default function Gallery() {
    const { eventId } = useParams();
    const [photos, setPhotos] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(null);

    const [isSelectionMode, setIsSelectionMode] = useState(false);
    const [selectedPhotoIds, setSelectedPhotoIds] = useState([]);
    const [isDownloading, setIsDownloading] = useState(false);

    const currentGuestName = localStorage.getItem('@WeddingGallery:guestName') || 'Convidado';

    const colors = {
        primary: '#639496',
        cardBg: '#FFFFFF',
        text: '#333333',
        shadow: 'rgba(99, 148, 150, 0.12)'
    };

    const fetchPhotos = async () => {
        try {
            const response = await api.get(`/events/${eventId}/photos`);
            setPhotos(response.data);
        } catch (err) {
            console.error("Erro ao buscar fotos:", err);
            setError('Não foi possível carregar as fotos.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchPhotos();
    }, [eventId]);

    const handleFileUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        setIsUploading(true);

        try {
            await Promise.all(files.map(file => {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('guestName', currentGuestName);
                return api.post(`/events/${eventId}/photos`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
            }));
            await fetchPhotos();
        } catch (err) {
            console.error("Erro no upload múltiplo:", err);
            alert('Algumas fotos podem não ter sido enviadas. Tente novamente.');
        } finally {
            setIsUploading(false);
            event.target.value = null;
        }
    };

    const handlePhotoClick = (photo, index) => {
        if (isSelectionMode) {
            setSelectedPhotoIds(prev =>
                prev.includes(photo.id)
                    ? prev.filter(id => id !== photo.id)
                    : [...prev, photo.id]
            );
        } else {
            setSelectedIndex(index);
        }
    };

    const toggleSelectionMode = () => {
        setIsSelectionMode(!isSelectionMode);
        setSelectedPhotoIds([]);
    };

    const handleBatchDownload = async () => {
        if (selectedPhotoIds.length === 0) return;

        setIsDownloading(true);
        try {
            const response = await api.post(`/events/${eventId}/photos/download-batch`, selectedPhotoIds, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Selecao_Casamento.zip');
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            setIsSelectionMode(false);
            setSelectedPhotoIds([]);
        } catch (err) {
            console.error("Erro ao baixar ZIP:", err);
            alert('Falha ao compactar as fotos selecionadas.');
        } finally {
            setIsDownloading(false);
        }
    };

    const handleNext = (e) => {
        e.stopPropagation();
        setSelectedIndex((prev) => (prev === photos.length - 1 ? 0 : prev + 1));
    };

    const handlePrev = (e) => {
        e.stopPropagation();
        setSelectedIndex((prev) => (prev === 0 ? photos.length - 1 : prev - 1));
    };

    const currentPhoto = selectedIndex !== null ? photos[selectedIndex] : null;

    return (
        <div style={{ minHeight: '100vh', padding: '20px 0', paddingBottom: selectedPhotoIds.length > 0 ? '80px' : '20px' }}>
            <div style={{ maxWidth: '800px', margin: '0 auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
                <header style={{
                    display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '30px',
                    borderBottom: `1px solid ${colors.primary}40`, paddingBottom: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.85)', padding: '20px', borderRadius: '12px',
                    backdropFilter: 'blur(8px)',
                    margin: '10px'
                }}>
                    <h2 style={{ fontFamily: "'Georgia', serif", color: colors.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: 0, fontWeight: 'normal' }}>
                        <Camera size={24} />
                        Casamento Fernanda & Fabio
                    </h2>

                    <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <button onClick={toggleSelectionMode} style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                            backgroundColor: isSelectionMode ? '#ef4444' : 'transparent',
                            color: isSelectionMode ? 'white' : colors.primary,
                            border: `1px solid ${isSelectionMode ? '#ef4444' : colors.primary}`,
                            borderRadius: '30px', cursor: 'pointer', transition: 'all 0.3s ease',
                            fontSize: '14px', fontWeight: '500'
                        }}>
                            {isSelectionMode ? <X size={18} /> : <CheckSquare size={18} />}
                            {isSelectionMode ? 'Cancelar' : 'Selecionar'}
                        </button>

                        <label style={{
                            display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 18px',
                            backgroundColor: colors.primary, color: 'white', borderRadius: '30px',
                            cursor: 'pointer', opacity: isUploading ? 0.7 : 1, transition: 'all 0.3s ease',
                            boxShadow: '0 4px 6px rgba(0,0,0,0.05)', fontSize: '14px', fontWeight: '500'
                        }}>
                            <UploadCloud size={18} />
                            {isUploading ? 'Enviando...' : 'Enviar Fotos'}
                            <input type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFileUpload} disabled={isUploading} />
                        </label>
                    </div>
                </header>

                {error && <p style={{ color: '#e17055', textAlign: 'center', backgroundColor: 'white', padding: '10px', borderRadius: '8px' }}>{error}</p>}

                {isLoading ? (
                    <div style={{ textAlign: 'center', color: colors.primary, marginTop: '40px', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '20px', borderRadius: '12px' }}>
                        <p style={{ fontStyle: 'italic' }}>Preparando as lembranças...</p>
                    </div>
                ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: '15px' }}>
                        {photos.length === 0 ? (
                            <p style={{ gridColumn: '1 / -1', textAlign: 'center', color: colors.primary, fontStyle: 'italic', backgroundColor: 'rgba(255, 255, 255, 0.8)', padding: '20px', borderRadius: '12px' }}>
                                Nenhuma foto ainda. Seja o primeiro a eternizar este momento!
                            </p>
                        ) : (
                            photos.map((photo, index) => {
                                const isSelected = selectedPhotoIds.includes(photo.id);
                                return (
                                    <div
                                        key={photo.id}
                                        style={{
                                            position: 'relative', backgroundColor: colors.cardBg, borderRadius: '8px', overflow: 'hidden',
                                            cursor: 'pointer',
                                            border: isSelected ? `4px solid ${colors.primary}` : '4px solid #FFFFFF',
                                            boxShadow: `0 4px 12px ${colors.shadow}`,
                                            transition: 'all 0.2s ease',
                                            opacity: isSelectionMode && !isSelected ? 0.7 : 1
                                        }}
                                        onClick={() => handlePhotoClick(photo, index)}
                                    >
                                        <img
                                            src={`https://localhost:7189${photo.url}`}
                                            alt="Foto do casamento"
                                            style={{ width: '100%', aspectRatio: '1 / 1', objectFit: 'cover', display: 'block', borderRadius: '4px' }}
                                        />

                                        {isSelected && (
                                            <div style={{
                                                position: 'absolute', top: '5px', right: '5px',
                                                backgroundColor: 'white', borderRadius: '50%', color: colors.primary,
                                                display: 'flex', boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                            }}>
                                                <CheckCircle size={24} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })
                        )}
                    </div>
                )}

                {isSelectionMode && selectedPhotoIds.length > 0 && (
                    <div style={{
                        position: 'fixed', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                        backgroundColor: colors.cardBg, padding: '15px 25px', borderRadius: '40px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 500
                    }}>
                        <span style={{ fontWeight: '500', color: colors.text }}>
                            {selectedPhotoIds.length} selecionada(s)
                        </span>
                        <button
                            onClick={handleBatchDownload}
                            disabled={isDownloading}
                            style={{
                                display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px',
                                backgroundColor: colors.primary, color: 'white', border: 'none',
                                borderRadius: '30px', cursor: isDownloading ? 'not-allowed' : 'pointer',
                                fontSize: '14px', fontWeight: '500', opacity: isDownloading ? 0.8 : 1
                            }}
                        >
                            <Download size={18} />
                            {isDownloading ? 'Gerando ZIP...' : 'Baixar'}
                        </button>
                    </div>
                )}

                {!isSelectionMode && currentPhoto && (
                    <div
                        style={{
                            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
                            backgroundColor: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(8px)',
                            display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', zIndex: 1000
                        }}
                        onClick={(e) => { if (e.target === e.currentTarget) setSelectedIndex(null); }}
                    >
                        <button onClick={handlePrev} style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: colors.primary, zIndex: 1001 }}>
                            <ChevronLeft size={28} />
                        </button>

                        <div style={{ position: 'relative', maxWidth: '85%', maxHeight: '70vh' }}>
                            <img src={`https://localhost:7189${currentPhoto.originalUrl}`} alt="Ampliada" style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', objectFit: 'contain', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', margin: '0 auto', display: 'block' }} />
                        </div>

                        <button onClick={handleNext} style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', background: 'rgba(255, 255, 255, 0.6)', backdropFilter: 'blur(4px)', border: 'none', borderRadius: '50%', width: '45px', height: '45px', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.1)', color: colors.primary, zIndex: 1001 }}>
                            <ChevronRight size={28} />
                        </button>

                        <p style={{ color: colors.primary, marginTop: '20px', fontSize: '16px', fontFamily: "'Georgia', serif", fontStyle: 'italic' }}>
                            Capturado por {currentPhoto.guestName}
                        </p>

                        <div style={{ display: 'flex', gap: '15px', marginTop: '10px' }}>
                            <a href={`https://localhost:7189/api/events/${eventId}/photos/${currentPhoto.id}/download`} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', backgroundColor: colors.primary, color: 'white', textDecoration: 'none', borderRadius: '30px', fontSize: '14px', fontWeight: '500', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                                <Download size={18} />
                                Salvar
                            </a>
                            <button onClick={() => setSelectedIndex(null)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', cursor: 'pointer', backgroundColor: 'transparent', color: colors.text, border: '1px solid #ccc', borderRadius: '30px', fontSize: '14px' }}>
                                <X size={18} />
                                Fechar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
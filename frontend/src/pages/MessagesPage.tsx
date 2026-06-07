import { useState, useEffect, useContext, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../service/api';
import { AuthContext } from '../context/AuthContext';
import type { User, Message } from '../types';

interface ChatPartner extends User {
    lastMessage?: string;
    unread?: number;
}

function MessagesPage() {
    const { user: currentUser, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [chats, setChats] = useState<ChatPartner[]>([]);
    const [selectedChat, setSelectedChat] = useState<ChatPartner | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');

    useEffect(() => {
        if (!currentUser && !authLoading) {
            navigate('/login');
        }
    }, [currentUser, authLoading]);

    useEffect(() => {
        fetchChats();
    }, []);

    useEffect(() => {
        if (selectedChat) {
            fetchMessages(selectedChat.id);
        }
    }, [selectedChat]);

    const fetchChats = async () => {
        try {
            const response = await api.get('/messages/chats');
            setChats(response.data);
        } catch (err) {
            console.error('Ошибка загрузки чатов', err);
        } finally {
        }
    };

    const fetchMessages = async (userId: number) => {
        try {
            const response = await api.get(`/messages/chat/${userId}`);
            setMessages(response.data);
        } catch (err) {
            console.error('Ошибка загрузки сообщений', err);
        }
    };

    const handleSend = async (e: FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedChat) return;
        try {
            await api.post(`/messages/send/${selectedChat.id}`, { content: newMessage });
            setNewMessage('');
            fetchMessages(selectedChat.id);
            fetchChats();
        } catch (err) {
            console.error('Ошибка отправки', err);
        }
    };

    if (authLoading) return <p style={{ textAlign: 'center', padding: 40 }}>Загрузка...</p>;



    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial' }}>
            {/* Шапка */}
            <header style={{
                background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
                padding: '14px 24px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
            }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: 18 }}>← Назад</Link>
                <h1 style={{ color: 'white', fontSize: 22, margin: 0 }}>💬 Сообщения</h1>
                <div style={{ width: 70 }} /> {/* пустое место для симметрии */}
            </header>

            <div style={{ maxWidth: 800, margin: '24px auto', padding: '0 16px', display: 'flex', gap: 16, height: 'calc(100vh - 120px)' }}>
                {/* Список чатов */}
                <div style={{
                    width: 280, background: 'white', borderRadius: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)', overflow: 'auto'
                }}>
                    <div style={{ padding: 16, borderBottom: '1px solid #eee', fontWeight: 600, color: '#0d47a1' }}>
                        Чаты
                    </div>
                    {chats.map(chat => (
                        <div key={chat.id}
                             onClick={() => setSelectedChat(chat)}
                             style={{
                                 padding: '12px 16px', cursor: 'pointer',
                                 display: 'flex', alignItems: 'center', gap: 10,
                                 background: selectedChat?.id === chat.id ? '#e3f2fd' : 'white',
                                 borderBottom: '1px solid #f0f0f0',
                                 transition: 'background 0.2s'
                             }}
                        >
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: '#e3f2fd', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: 20
                            }}>👤</div>
                            <div>
                                <div style={{ fontWeight: 600, color: '#333', fontSize: 15 }}>
                                    {chat.firstName} {chat.lastName}
                                </div>
                                <div style={{ color: '#888', fontSize: 13, marginTop: 2 }}>
                                    @{chat.username}
                                </div>
                            </div>
                        </div>
                    ))}
                    {chats.length === 0 && (
                        <div style={{ padding: 20, textAlign: 'center', color: '#888' }}>
                            Нет чатов
                        </div>
                    )}
                </div>

                {/* Окно чата */}
                <div style={{
                    flex: 1, background: 'white', borderRadius: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    display: 'flex', flexDirection: 'column'
                }}>
                    {selectedChat ? (
                        <>
                            {/* Заголовок чата */}
                            <div style={{
                                padding: 14, borderBottom: '1px solid #eee',
                                fontWeight: 600, color: '#0d47a1', display: 'flex', alignItems: 'center', gap: 10
                            }}>
                                <div style={{
                                    width: 35, height: 35, borderRadius: '50%',
                                    background: '#e3f2fd', display: 'flex',
                                    alignItems: 'center', justifyContent: 'center', fontSize: 18
                                }}>👤</div>
                                {selectedChat.firstName} {selectedChat.lastName}
                            </div>

                            {/* Сообщения */}
                            <div style={{
                                flex: 1, padding: 16, overflow: 'auto',
                                display: 'flex', flexDirection: 'column', gap: 8
                            }}>
                                {messages.map(msg => (
                                    <div key={msg.id} style={{
                                        maxWidth: '70%',
                                        padding: '10px 14px',
                                        borderRadius: 16,
                                        background: msg.senderId === currentUser.id ? '#1a73e8' : '#e8e8e8',
                                        color: msg.senderId === currentUser.id ? 'white' : '#333',
                                        alignSelf: msg.senderId === currentUser.id ? 'flex-end' : 'flex-start',
                                        fontSize: 15,
                                        lineHeight: 1.4
                                    }}>
                                        {msg.content}
                                        <div style={{
                                            fontSize: 11, marginTop: 4,
                                            opacity: 0.7, textAlign: 'right'
                                        }}>
                                            {new Date(msg.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Отправка */}
                            <form onSubmit={handleSend} style={{
                                padding: 12, borderTop: '1px solid #eee', display: 'flex', gap: 10
                            }}>
                                <input
                                    type="text"
                                    placeholder="Сообщение..."
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    style={{
                                        flex: 1, padding: '10px 14px',
                                        border: '1px solid #ddd', borderRadius: 20,
                                        fontSize: 15, outline: 'none'
                                    }}
                                />
                                <button type="submit" style={{
                                    padding: '10px 20px', background: '#1a73e8',
                                    color: 'white', border: 'none', borderRadius: 20,
                                    cursor: 'pointer', fontWeight: 600
                                }}>
                                    Отправить
                                </button>
                            </form>
                        </>
                    ) : (
                        <div style={{
                            flex: 1, display: 'flex', alignItems: 'center',
                            justifyContent: 'center', color: '#888', fontSize: 16
                        }}>
                            Выберите чат
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default MessagesPage;
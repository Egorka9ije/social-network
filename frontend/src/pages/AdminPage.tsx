import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../service/api';
import { AuthContext } from '../context/AuthContext';
import type { User, Post } from '../types';

function AdminPage() {
    const { user: currentUser, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'users' | 'posts'>('users');

    useEffect(() => {
        if (!currentUser && !authLoading) { navigate('/login'); return; }
        if (currentUser && currentUser.role !== 'ROLE_ADMIN') { navigate('/'); return; }
        fetchData();
    }, [currentUser, authLoading]);

    const fetchData = async () => {
        try {
            const [usersRes, postsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/admin/posts')
            ]);
            setUsers(usersRes.data);
            setPosts(postsRes.data);
        } catch (err) { console.error('Ошибка', err); }
        finally { setLoading(false); }
    };

    const handleDeleteUser = async (userId: number, username: string) => {
        if (!confirm(`Удалить @${username}?`)) return;
        try { await api.delete(`/admin/users/${userId}`); fetchData(); }
        catch (err) { console.error('Ошибка', err); }
    };

    const handleToggleActive = async (userId: number) => {
        try { await api.put(`/admin/users/${userId}/toggle-active`); fetchData(); }
        catch (err) { console.error('Ошибка', err); }
    };

    const handleChangeRole = async (userId: number, role: string) => {
        try { await api.put(`/admin/users/${userId}/role`, { role }); fetchData(); }
        catch (err) { console.error('Ошибка', err); }
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm('Удалить пост?')) return;
        try { await api.delete(`/admin/posts/${postId}`); fetchData(); }
        catch (err) { console.error('Ошибка', err); }
    };

    const handleLogout = () => { localStorage.removeItem('token'); navigate('/login'); };

    if (authLoading || loading) return <p style={{ textAlign: 'center', padding: 40 }}>Загрузка...</p>;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial' }}>
            <header style={{
                background: 'linear-gradient(135deg, #0d47a1, #1565c0, #1a73e8)',
                padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)', position: 'sticky' as const, top: 0, zIndex: 100
            }}>
                <Link to="/" style={btnStyle}>← Лента</Link>
                <h1 style={{ color: 'white', fontSize: 22, margin: 0 }}>🛡 Админ-панель</h1>
                <button onClick={handleLogout} style={btnStyle}>🚪 Выйти</button>
            </header>

            <div style={{ maxWidth: 900, margin: '24px auto', padding: '0 16px' }}>
                {/* Вкладки */}
                <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <button onClick={() => setActiveTab('users')} style={{
                        padding: '10px 24px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        background: activeTab === 'users' ? '#1a73e8' : '#e0e0e0',
                        color: activeTab === 'users' ? 'white' : '#333', fontWeight: 600
                    }}>👥 Пользователи</button>
                    <button onClick={() => setActiveTab('posts')} style={{
                        padding: '10px 24px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        background: activeTab === 'posts' ? '#1a73e8' : '#e0e0e0',
                        color: activeTab === 'posts' ? 'white' : '#333', fontWeight: 600
                    }}>📄 Посты</button>
                </div>

                {/* Пользователи */}
                {activeTab === 'users' && (
                    <div style={{ background: 'white', borderRadius: 16, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.1)' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                            <tr style={{ background: '#f8f9fa' }}>
                                <th style={thStyle}>ID</th>
                                <th style={thStyle}>Пользователь</th>
                                <th style={thStyle}>Роль</th>
                                <th style={thStyle}>Статус</th>
                                <th style={{ ...thStyle, textAlign: 'center' }}>Действия</th>
                            </tr>
                            </thead>
                            <tbody>
                            {users.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                                    <td style={tdStyle}>{u.id}</td>
                                    <td style={tdStyle}>
                                        <div style={{ fontWeight: 600 }}>{u.firstName} {u.lastName}</div>
                                        <div style={{ fontSize: 13, color: '#888' }}>@{u.username}</div>
                                    </td>
                                    <td style={tdStyle}>
                                        <select value={u.role} onChange={(e) => handleChangeRole(u.id, e.target.value)}
                                                style={{ padding: '4px 8px', borderRadius: 8, border: '1px solid #ddd' }}>
                                            <option value="ROLE_USER">Пользователь</option>
                                            <option value="ROLE_ADMIN">Админ</option>
                                        </select>
                                    </td>
                                    <td style={tdStyle}>
                                            <span style={{
                                                padding: '4px 10px', borderRadius: 12, fontSize: 13,
                                                background: u.active ? '#e8f5e9' : '#fee2e2',
                                                color: u.active ? '#2e7d32' : '#c62828'
                                            }}>
                                                {u.active ? 'Активен' : 'Заблокирован'}
                                            </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                                        <button onClick={() => handleToggleActive(u.id)} style={smallBtn}>
                                            {u.active ? '🔒' : '🔓'}
                                        </button>
                                        {u.role !== 'ROLE_ADMIN' && (
                                            <button onClick={() => handleDeleteUser(u.id, u.username)} style={{ ...smallBtn, color: '#c62828' }}>
                                                🗑
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Посты */}
                {activeTab === 'posts' && (
                    <div>
                        {posts.map(post => (
                            <div key={post.id} style={{
                                background: 'white', borderRadius: 12, padding: 16, marginBottom: 12,
                                boxShadow: '0 1px 4px rgba(0,0,0,0.1)', display: 'flex', justifyContent: 'space-between'
                            }}>
                                <div>
                                    <Link to={`/profile/${post.authorId}`} style={{ fontWeight: 600, color: '#1a73e8', textDecoration: 'none' }}>
                                        {post.authorName}
                                    </Link>
                                    <p style={{ margin: '8px 0 0', color: '#333' }}>{post.text}</p>
                                    <div style={{ fontSize: 13, color: '#888', marginTop: 6 }}>
                                        {new Date(post.createdAt).toLocaleDateString('ru-RU')} · ❤️ {post.likesAmount}
                                    </div>
                                </div>
                                <button onClick={() => handleDeletePost(post.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#c62828'
                                }}>🗑</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

const btnStyle: React.CSSProperties = {
    color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 500,
    padding: '8px 18px', borderRadius: 25, background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer'
};

const thStyle: React.CSSProperties = {
    padding: '14px 16px', textAlign: 'left', fontSize: 14, color: '#555', fontWeight: 600
};

const tdStyle: React.CSSProperties = {
    padding: '12px 16px', fontSize: 14, color: '#333'
};

const smallBtn: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, marginLeft: 8
};

export default AdminPage;
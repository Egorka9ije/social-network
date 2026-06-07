import { useState, useEffect, useContext, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../service/api';
import { AuthContext } from '../context/AuthContext';
import type { Post, Comment, User } from '../types';

function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedComments, setExpandedComments] = useState<number | null>(null);
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [commentText, setCommentText] = useState<Record<number, string>>({});
    const navigate = useNavigate();
    const { user: currentUser } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<User[]>([]);
    const [showSearch, setShowSearch] = useState(false);
    const [postImage, setPostImage] = useState<File | null>(null);
    const [fullImage, setFullImage] = useState<string | null>(null);

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch (err) { console.error('Ошибка', err); }
    };

    useEffect(() => {
        fetchPosts();
        setLoading(false);
    }, []);

    const handleCreatePost = async (e: FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        try {
            const formData = new FormData();
            formData.append('content', newPost);
            if (postImage) {
                formData.append('image', postImage);
            }
            await api.post('/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setNewPost('');
            setPostImage(null);
            fetchPosts();
        } catch (err) { console.error('Ошибка', err); }
    };

    const handleLike = async (postId: number) => {
        try {
            await api.post(`/posts/${postId}/like`);
            fetchPosts();
        } catch (err) { console.error('Ошибка', err); }
    };

    const loadComments = async (postId: number) => {
        if (expandedComments === postId) { setExpandedComments(null); return; }
        try {
            const response = await api.get(`/posts/${postId}/comments`);
            setComments({ ...comments, [postId]: response.data });
            setExpandedComments(postId);
        } catch (err) { console.error('Ошибка', err); }
    };

    const handleSearch = async (query: string) => {
        setSearchQuery(query);
        if (query.length < 2) {
            setSearchResults([]);
            setShowSearch(false);
            return;
        }
        try {
            const response = await api.get(`/users/search?query=${query}`);
            setSearchResults(response.data);
            setShowSearch(true);
        } catch (err) {
            console.error('Ошибка поиска', err);
        }
    };

    const handleAddComment = async (postId: number) => {
        const text = commentText[postId] || '';
        if (!text.trim()) return;
        try {
            await api.post(`/posts/${postId}/comments`, { content: text });
            setCommentText({ ...commentText, [postId]: '' });
            loadComments(postId);
            fetchPosts();
        } catch (err) { console.error('Ошибка', err); }
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm('Удалить пост?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            fetchPosts();
        } catch (err) { console.error('Ошибка удаления', err); }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (loading) return <p>Загрузка...</p>;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial' }}>
            {/* Шапка */}
            <header style={{
                background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1a73e8 100%)',
                padding: '14px 28px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                position: 'sticky' as const, top: 0, zIndex: 100
            }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 42, height: 42, background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%', display: 'flex', alignItems: 'center',
                        justifyContent: 'center', fontSize: 24, backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.3)'
                    }}>⚡</div>
                    <span style={{ color: 'white', fontSize: 26, fontWeight: 800,
                        letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.2)' }}>Connect</span>
                </Link>
                {/* Поиск */}
                    <div style={{ position: 'relative', flex: 1, maxWidth: 300, margin: '0 20px' }}>
                        <input
                            type="text"
                            placeholder="🔍 Поиск пользователей..."
                            value={searchQuery}
                            onChange={(e) => handleSearch(e.target.value)}
                            style={{
                                width: '100%', padding: '8px 16px',
                                borderRadius: 20, border: '1px solid rgba(255,255,255,0.3)',
                                background: 'rgba(255,255,255,0.15)', color: 'white',
                                fontSize: 14, outline: 'none',
                                boxSizing: 'border-box' as const
                            }}
                        />
                        {showSearch && searchResults.length > 0 && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                background: 'white', borderRadius: 12, marginTop: 8,
                                boxShadow: '0 4px 20px rgba(0,0,0,0.2)', overflow: 'hidden', zIndex: 200
                            }}>
                                {searchResults.map(u => (
                                    <Link to={`/profile/${u.id}`} key={u.id}
                                          onClick={() => { setShowSearch(false); setSearchQuery(''); }}
                                          style={{
                                              display: 'flex', alignItems: 'center', gap: 10,
                                              padding: '10px 16px', textDecoration: 'none', color: '#333',
                                              borderBottom: '1px solid #f0f0f0'
                                          }}>
                                        <div style={{
                                            width: 35, height: 35, borderRadius: '50%',
                                            background: '#e3f2fd', display: 'flex',
                                            alignItems: 'center', justifyContent: 'center', fontSize: 18
                                        }}>👤</div>
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: 14 }}>{u.firstName} {u.lastName}</div>
                                            <div style={{ color: '#888', fontSize: 12 }}>@{u.username}</div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                <nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Link to="/" style={navBtnStyle}>🏠 Лента</Link>
                    <Link to="/profile/me" style={navBtnStyle}>👤 Профиль</Link>
                    <Link to="/messages" style={navBtnStyle}>💬 Чаты</Link>
                    <button onClick={handleLogout} style={logoutBtnStyle}>🚪 Выйти</button>
                </nav>
            </header>

            {/* Форма создания поста */}
            <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 16px' }}>
                <form onSubmit={handleCreatePost} style={{
                    background: 'white', borderRadius: 12, padding: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                    <textarea placeholder="Что нового?" value={newPost}
                              onChange={(e) => setNewPost(e.target.value)} rows={3}
                              style={{ width: '100%', padding: 12, border: '1px solid #ddd',
                                  borderRadius: 8, resize: 'none', fontSize: 15,
                                  boxSizing: 'border-box', outline: 'none' }} />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type="submit" style={{ padding: '8px 24px', background: '#1a73e8',
                            color: 'white', border: 'none', borderRadius: 20, cursor: 'pointer',
                            fontWeight: 600, fontSize: 14 }}>Опубликовать</button>
                    </div>
                    <div style={{ marginBottom: 10 }}>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setPostImage(e.target.files?.[0] || null)}
                            style={{ fontSize: 14 }}
                        />
                    </div>
                </form>
            </div>

            {/* Лента */}
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px' }}>
                {/* Лента */}
                <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px' }}>
                    {posts.map(post => (
                        <div key={post.id} style={{
                            background: 'white', borderRadius: 12, padding: 16,
                            marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e3f2fd',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>👤</div>
                                <Link to={`/profile/${post.authorId}`} style={{ textDecoration: 'none', color: '#0d47a1', fontWeight: 600 }}>
                                    {post.authorName}
                                </Link>
                            </div>

                            {/* Текст + кнопка удаления */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 12, flex: 1 }}>{post.text}</p>
                                {currentUser && post.authorId === currentUser.id && (
                                    <button onClick={() => handleDeletePost(post.id)} style={{
                                        background: 'none', border: 'none', cursor: 'pointer',
                                        fontSize: 18, color: '#ccc', padding: '0 0 0 10px'
                                    }}>🗑</button>
                                )}
                            </div>

                            {/* Картинка поста */}
                            {/* Картинка поста */}
                            {post.image && (
                                <div
                                    onClick={() => setFullImage(post.image!)}
                                    style={{
                                        marginBottom: 12, borderRadius: 8, overflow: 'hidden',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <img
                                        src={`http://localhost:8080${post.image}`}
                                        alt=""
                                        style={{ width: '100%', maxHeight: 400, objectFit: 'cover', borderRadius: 8 }}
                                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {/* Просмотр картинки в полном размере */}
            {fullImage && (
                <div
                    onClick={() => setFullImage(null)}
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: 'rgba(0,0,0,0.9)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        zIndex: 1000, cursor: 'pointer'
                    }}
                >
                    <img
                        src={`http://localhost:8080${fullImage}`}
                        alt=""
                        style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }}
                    />
                    <button
                        onClick={() => setFullImage(null)}
                        style={{
                            position: 'absolute', top: 20, right: 20,
                            background: 'rgba(255,255,255,0.2)', color: 'white',
                            border: 'none', fontSize: 24, width: 40, height: 40,
                            borderRadius: '50%', cursor: 'pointer'
                        }}
                    >✕</button>
                </div>
            )}
        </div>
    );
}

const navBtnStyle: React.CSSProperties = {
    color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 500,
    padding: '8px 16px', borderRadius: 25, transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255,255,255,0.15)'
};

const logoutBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.15)', color: 'white',
    border: '1px solid rgba(255,255,255,0.25)', padding: '8px 18px',
    borderRadius: 25, cursor: 'pointer', fontSize: 15, fontWeight: 500,
    transition: 'all 0.3s ease', backdropFilter: 'blur(5px)'
};

const actionBtnStyle: React.CSSProperties = {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: 15, color: '#666', padding: '4px 12px', borderRadius: 12
};

export default FeedPage;
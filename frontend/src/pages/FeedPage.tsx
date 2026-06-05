import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../service/api';
import type { Post, Comment } from '../types';

function FeedPage() {
    const [posts, setPosts] = useState<Post[]>([]);
    const [newPost, setNewPost] = useState('');
    const [loading, setLoading] = useState(true);
    const [expandedComments, setExpandedComments] = useState<number | null>(null);
    const [comments, setComments] = useState<Record<number, Comment[]>>({});
    const [commentText, setCommentText] = useState<Record<number, string>>({});
    const navigate = useNavigate();

    const fetchPosts = async () => {
        try {
            const response = await api.get('/posts');
            setPosts(response.data);
        } catch (err) {
            console.error('Ошибка', err);
        }
    };

    useEffect(() => {
        fetchPosts();
        setLoading(false);
    }, []);

    const handleCreatePost = async (e: FormEvent) => {
        e.preventDefault();
        if (!newPost.trim()) return;
        try {
            await api.post('/posts', { content: newPost, image: null });
            setNewPost('');
            fetchPosts();
        } catch (err) {
            console.error('Ошибка', err);
        }
    };

    const handleLike = async (postId: number) => {
        try {
            await api.post(`/posts/${postId}/like`);
            fetchPosts();
        } catch (err) {
            console.error('Ошибка', err);
        }
    };

    const loadComments = async (postId: number) => {
        if (expandedComments === postId) {
            setExpandedComments(null);
            return;
        }
        try {
            const response = await api.get(`/posts/${postId}/comments`);
            setComments({ ...comments, [postId]: response.data });
            setExpandedComments(postId);
        } catch (err) {
            console.error('Ошибка', err);
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
        } catch (err) {
            console.error('Ошибка', err);
        }
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
                padding: '14px 28px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)',
                position: 'sticky' as const,
                top: 0,
                zIndex: 100
            }}>
                <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 42, height: 42,
                        background: 'rgba(255,255,255,0.2)',
                        borderRadius: '50%',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 24, backdropFilter: 'blur(10px)',
                        border: '2px solid rgba(255,255,255,0.3)'
                    }}>⚡</div>
                    <span style={{
                        color: 'white', fontSize: 26, fontWeight: 800,
                        letterSpacing: '-0.5px', textShadow: '0 2px 4px rgba(0,0,0,0.2)'
                    }}>Connect</span>
                </Link>

                <nav style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <Link to="/" style={navBtnStyle}
                          onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                          }}
                    >🏠 Лента</Link>

                    <Link to="/profile/me" style={navBtnStyle}
                          onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                          }}
                    >👤 Профиль</Link>

                    <Link to="/messages" style={navBtnStyle}
                          onMouseEnter={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                              e.currentTarget.style.transform = 'translateY(-2px)';
                              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                          }}
                          onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                          }}
                    >💬 Чаты</Link>

                    <button onClick={handleLogout} style={logoutBtnStyle}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)';
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = 'none';
                            }}
                    >🚪 Выйти</button>
                </nav>
            </header>

            {/* Форма создания поста */}
            <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 16px' }}>
                <form onSubmit={handleCreatePost} style={{
                    background: 'white', borderRadius: 12, padding: 16,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                    <textarea
                        placeholder="Что нового?"
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        rows={3}
                        style={{
                            width: '100%', padding: 12, border: '1px solid #ddd',
                            borderRadius: 8, resize: 'none', fontSize: 15,
                            boxSizing: 'border-box', outline: 'none'
                        }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 10 }}>
                        <button type="submit" style={{
                            padding: '8px 24px', background: '#1a73e8', color: 'white',
                            border: 'none', borderRadius: 20, cursor: 'pointer',
                            fontWeight: 600, fontSize: 14
                        }}>Опубликовать</button>
                    </div>
                </form>
            </div>

            {/* Лента постов */}
            <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 16px 40px' }}>
                {posts.map((post) => (
                    <div key={post.id} style={{
                        background: 'white', borderRadius: 12, padding: 16,
                        marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                            <div style={{
                                width: 40, height: 40, borderRadius: '50%',
                                background: '#e3f2fd', display: 'flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: 20
                            }}>👤</div>
                            <Link to={`/profile/${post.authorId}`} style={{ textDecoration: 'none', color: '#0d47a1', fontWeight: 600 }}>
                                {post.authorName}
                            </Link>
                        </div>
                        <p style={{ fontSize: 15, lineHeight: 1.5, marginBottom: 12 }}>{post.text}</p>
                        <div style={{ display: 'flex', gap: 20, borderTop: '1px solid #eee', paddingTop: 10 }}>
                            <button onClick={() => handleLike(post.id)} style={actionBtnStyle}>
                                ❤️ {post.likesAmount}
                            </button>
                            <button onClick={() => loadComments(post.id)} style={actionBtnStyle}>
                                💬 {post.commentAmount}
                            </button>
                        </div>
                        {expandedComments === post.id && (
                            <div style={{ marginTop: 12, padding: 12, background: '#f8f9fa', borderRadius: 8 }}>
                                {comments[post.id]?.map((c) => (
                                    <div key={c.id} style={{ padding: '4px 0', fontSize: 14 }}>
                                        <strong>{c.username}</strong>: {c.content}
                                    </div>
                                ))}
                                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                                    <input
                                        placeholder="Комментарий..."
                                        value={commentText[post.id] || ''}
                                        onChange={(e) => setCommentText({ ...commentText, [post.id]: e.target.value })}
                                        style={{ flex: 1, padding: 8, border: '1px solid #ddd', borderRadius: 8, outline: 'none' }}
                                    />
                                    <button onClick={() => handleAddComment(post.id)} style={{
                                        padding: '8px 16px', background: '#1a73e8', color: 'white',
                                        border: 'none', borderRadius: 8, cursor: 'pointer'
                                    }}>Отправить</button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
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
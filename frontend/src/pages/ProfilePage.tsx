import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../service/api';
import { AuthContext } from '../context/AuthContext';
import type { User, Post } from '../types';

function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user: currentUser, loading: authLoading } = useContext(AuthContext);
    const [profile, setProfile] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const [profileLoading, setProfileLoading] = useState(true);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);
    const [totalLikes, setTotalLikes] = useState(0);

    const isOwnProfile = id === 'me' || (currentUser && Number(id) === currentUser.id);
    const userId = id === 'me' ? currentUser?.id : Number(id);

    useEffect(() => {
        if (id === 'me' && !currentUser && !authLoading) {
            navigate('/login');
            return;
        }
        if (!userId) return;
        fetchProfile();
    }, [userId, currentUser, authLoading]);

    const fetchProfile = async () => {
        try {
            const [userRes, postsRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/posts/user/${userId}`)
            ]);
            setProfile(userRes.data);
            setPosts(postsRes.data);

            try {
                const fRes = await api.get(`/users/${userId}/followers`);
                setFollowers(fRes.data);
            } catch (e) {}

            try {
                const likesRes = await api.get(`/users/${userId}/likes-count`);
                setTotalLikes(likesRes.data);
            } catch (e) {}

            try {
                const fngRes = await api.get(`/users/${userId}/following`);
                setFollowing(fngRes.data);
            } catch (e) {}

            if (currentUser && !isOwnProfile) {
                try {
                    const myFng = await api.get(`/users/${currentUser.id}/following`);
                    setIsFollowing(myFng.data.some((u: User) => u.id === userId));
                } catch (e) {}
            }
        } catch (err) {
            console.error('Ошибка', err);
        } finally {
            setProfileLoading(false);
        }
    };

    const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            await api.put('/users/me/avatar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchProfile();
        } catch (err) {
            console.error('Ошибка загрузки аватара', err);
        }
    };

    const handleSubscribe = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/users/${userId}/subscribe`);
            } else {
                await api.post(`/users/${userId}/subscribe`);
            }
            setIsFollowing(!isFollowing);
            try {
                const fRes = await api.get(`/users/${userId}/followers`);
                setFollowers(fRes.data);
            } catch (e) {}
        } catch (err) {
            console.error('Ошибка подписки', err);
        }
    };

    const handleDeletePost = async (postId: number) => {
        if (!confirm('Удалить пост?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            fetchProfile();
        } catch (err) {
            console.error('Ошибка удаления', err);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    if (authLoading || profileLoading) return <p style={{ textAlign: 'center', padding: 40 }}>Загрузка...</p>;
    if (!profile) return <p style={{ textAlign: 'center', padding: 40 }}>Пользователь не найден</p>;

    return (
        <div style={{ minHeight: '100vh', background: '#f0f2f5', fontFamily: 'Arial' }}>
            {/* Шапка */}
            <header style={{
                background: 'linear-gradient(135deg, #0d47a1 0%, #1565c0 40%, #1a73e8 100%)',
                padding: '14px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.25)', position: 'sticky' as const, top: 0, zIndex: 100
            }}>
                <Link to="/" style={{
                    color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 500,
                    padding: '8px 18px', borderRadius: 25, transition: 'all 0.3s ease',
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)',
                    border: '1px solid rgba(255,255,255,0.15)'
                }}
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
                >← Лента</Link>

                <h1 style={{ color: 'white', fontSize: 22, margin: 0, fontWeight: 700, letterSpacing: '-0.5px' }}>Профиль</h1>
                <div style={{ display: 'flex', gap: 10 }}>
                    {currentUser?.role === 'ROLE_ADMIN' && (
                        <Link to="/admin" style={{
                            background: 'rgba(255,255,255,0.15)', color: 'white',
                            border: '1px solid rgba(255,255,255,0.25)', padding: '8px 20px',
                            borderRadius: 25, cursor: 'pointer', fontSize: 15, fontWeight: 500,
                            transition: 'all 0.3s ease',textDecoration: 'none', backdropFilter: 'blur(5px)'
                        }}
                              onMouseEnter={(e) => {
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.25)';
                                  e.currentTarget.style.transform = 'translateY(-2px)';
                                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
                              }}
                              onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.boxShadow = 'none';
                              }}>🛡 Админ</Link>
                    )}
                    {isOwnProfile && (
                        <button onClick={handleLogout} style={{
                            background: 'rgba(255,255,255,0.15)', color: 'white',
                            border: '1px solid rgba(255,255,255,0.25)', padding: '8px 20px',
                            borderRadius: 25, cursor: 'pointer', fontSize: 15, fontWeight: 500,
                            transition: 'all 0.3s ease', backdropFilter: 'blur(5px)'
                        }}
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

                        >🚪 Выйти</button>
                    )}
                </div>
            </header>

            <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 16px' }}>
                {/* Карточка профиля */}
                <div style={{
                    background: 'white', borderRadius: 20, padding: 30, textAlign: 'center',
                    boxShadow: '0 2px 12px rgba(0,0,0,0.08)', marginBottom: 24
                }}>
                    {/* Кнопка изменения фото (над аватаркой) */}
                    {isOwnProfile && (
                        <label style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            marginBottom: 10,
                            padding: '8px 18px', background: '#e3f2fd',
                            color: '#1a73e8', borderRadius: 20, cursor: 'pointer',
                            fontSize: 14, fontWeight: 500, transition: 'all 0.2s',
                            border: '1px solid #bbdefb'
                        }}
                               onMouseEnter={(e) => {
                                   e.currentTarget.style.background = '#bbdefb';
                                   e.currentTarget.style.transform = 'scale(1.03)';
                               }}
                               onMouseLeave={(e) => {
                                   e.currentTarget.style.background = '#e3f2fd';
                                   e.currentTarget.style.transform = 'scale(1)';
                               }}>
                            📷 Изменить фото
                            <input type="file" accept="image/*" onChange={handleAvatarChange}
                                   style={{ display: 'none' }} />
                        </label>
                    )}

                    {/* Аватарка */}
                    <div style={{ textAlign: 'center', marginBottom: 16 }}>
                        {profile.avatar ? (
                            <img src={`http://localhost:8080${profile.avatar}`} alt=""
                                 style={{
                                     width: 100, height: 100, borderRadius: '50%',
                                     objectFit: 'cover', margin: '0 auto',
                                     border: '4px solid #1a73e8', boxShadow: '0 4px 12px rgba(26,115,232,0.3)'
                                 }} />
                        ) : (
                            <div style={{
                                width: 100, height: 100, borderRadius: '50%', background: '#e3f2fd',
                                margin: '0 auto', display: 'flex', alignItems: 'center',
                                justifyContent: 'center', fontSize: 48,
                                border: '4px solid #1a73e8', boxShadow: '0 4px 12px rgba(26,115,232,0.3)'
                            }}>👤</div>
                        )}
                    </div>
                    <h2 style={{ margin: '0 0 4px', color: '#0d47a1', fontSize: 24 }}>
                        {profile.firstName} {profile.lastName}
                    </h2>
                    <p style={{ color: '#888', margin: '0 0 8px', fontSize: 16 }}>@{profile.username}</p>
                    {profile.bio && <p style={{ color: '#555', marginBottom: 16 }}>{profile.bio}</p>}
                    <p style={{ color: '#aaa', fontSize: 13 }}>
                        На сайте с {new Date(profile.createdAt).toLocaleDateString('ru-RU')}
                    </p>

                    {!isOwnProfile && currentUser && (
                        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginTop: 16 }}>
                            <button onClick={handleSubscribe} style={{
                                padding: '10px 30px',
                                background: isFollowing ? '#dc3545' : '#1a73e8',
                                color: 'white', border: 'none', borderRadius: 25,
                                cursor: 'pointer', fontSize: 16, fontWeight: 600
                            }}>
                                {isFollowing ? 'Отписаться' : 'Подписаться'}
                            </button>
                            <button onClick={() => navigate(`/messages?chat=${userId}`)} style={{
                                padding: '10px 30px',
                                background: '#e3f2fd',
                                color: '#1a73e8',
                                border: '1px solid #bbdefb',
                                borderRadius: 25,
                                cursor: 'pointer', fontSize: 16, fontWeight: 600
                            }}>
                                💬 Написать
                            </button>
                        </div>
                    )}

                    {/* Подписчики, подписки, лайки */}
                    <div style={{ marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 40 }}>
                            <div onClick={() => { setShowFollowers(!showFollowers); setShowFollowing(false); }}
                                 style={{ cursor: 'pointer', textAlign: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a73e8' }}>{followers.length}</div>
                                <div style={{ fontSize: 13, color: '#888' }}>подписчиков</div>
                            </div>
                            <div onClick={() => { setShowFollowing(!showFollowing); setShowFollowers(false); }}
                                 style={{ cursor: 'pointer', textAlign: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a73e8' }}>{following.length}</div>
                                <div style={{ fontSize: 13, color: '#888' }}>подписок</div>
                            </div>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 22, fontWeight: 700, color: '#1a73e8' }}>{totalLikes}</div>
                                <div style={{ fontSize: 13, color: '#888' }}>лайков</div>
                            </div>
                        </div>

                        {/* Списки — теперь ВНЕ flex-контейнера */}
                        {showFollowers && (
                            <div style={{ marginTop: 12, textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, marginBottom: 8, color: '#555' }}>Подписчики:</div>
                                {followers.map(u => (
                                    <Link to={`/profile/${u.id}`} key={u.id} style={userLinkStyle}>
                                        <div style={miniAvatarStyle}>👤</div>
                                        <span>{u.firstName} {u.lastName}</span>
                                    </Link>
                                ))}
                            </div>
                        )}

                        {showFollowing && (
                            <div style={{ marginTop: 12, textAlign: 'left' }}>
                                <div style={{ fontWeight: 600, marginBottom: 8, color: '#555' }}>Подписки:</div>
                                {following.map(u => (
                                    <Link to={`/profile/${u.id}`} key={u.id} style={userLinkStyle}>
                                        <div style={miniAvatarStyle}>👤</div>
                                        <span>{u.firstName} {u.lastName}</span>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Посты */}
                <h3 style={{ marginBottom: 12, color: '#333', fontSize: 20 }}>Посты</h3>
                {posts.length === 0 && <p style={{ color: '#888' }}>Нет постов</p>}
                {posts.map(post => (
                    <div key={post.id} style={{
                        background: 'white', borderRadius: 16, padding: 20,
                        marginBottom: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                            <p style={{ margin: 0, fontSize: 15, lineHeight: 1.5, flex: 1 }}>{post.text}</p>
                            {isOwnProfile && (
                                <button onClick={() => handleDeletePost(post.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: 18, color: '#ccc', padding: '0 0 0 10px'
                                }}>🗑</button>
                            )}
                        </div>
                        <div style={{ color: '#aaa', fontSize: 13, marginTop: 10 }}>
                            {new Date(post.createdAt).toLocaleDateString('ru-RU')} ·
                            ❤️ {post.likesAmount} · 💬 {post.commentAmount}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

const navBtnStyle: React.CSSProperties = {
    color: 'white', textDecoration: 'none', fontSize: 15, fontWeight: 500,
    padding: '8px 18px', borderRadius: 25, transition: 'all 0.3s ease',
    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(5px)',
    border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer'
};

const logoutBtnStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.15)', color: 'white',
    border: '1px solid rgba(255,255,255,0.25)', padding: '8px 20px',
    borderRadius: 25, cursor: 'pointer', fontSize: 15, fontWeight: 500,
    transition: 'all 0.3s ease', backdropFilter: 'blur(5px)'
};

const userLinkStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
    textDecoration: 'none', color: '#333'
};

const miniAvatarStyle: React.CSSProperties = {
    width: 30, height: 30, borderRadius: '50%', background: '#e3f2fd',
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16
};

export default ProfilePage;
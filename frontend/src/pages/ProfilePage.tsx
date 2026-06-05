import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../service/api';
import { AuthContext } from '../context/AuthContext';
import type { User, Post } from '../types';

function ProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [profile, setProfile] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [isFollowing, setIsFollowing] = useState(false);
    const { user: currentUser, loading: authLoading } = useContext(AuthContext);
    const [profileLoading, setProfileLoading] = useState(true);
    const [followers, setFollowers] = useState<User[]>([]);
    const [following, setFollowing] = useState<User[]>([]);
    const [showFollowers, setShowFollowers] = useState(false);
    const [showFollowing, setShowFollowing] = useState(false);


    // Свой или чужой профиль?
    const isOwnProfile = id === 'me' || (currentUser && Number(id) === currentUser.id);
    const userId = id === 'me' ? currentUser?.id : Number(id);

    // Загрузка профиля
    useEffect(() => {
        if (id === 'me' && !currentUser && !authLoading) {  // ← добавь !loading
            navigate('/login');
            return;
        }
        if (!userId) return;
        fetchProfile();
    }, [userId, currentUser, authLoading]);  // ← добавь loading

    const fetchProfile = async () => {
        try {
            const [userRes, postsRes] = await Promise.all([
                api.get(`/users/${userId}`),
                api.get(`/posts/user/${userId}`)
            ]);
            setProfile(userRes.data);
            setPosts(postsRes.data);

            // Загружаем подписчиков
            try {
                const followersRes = await api.get(`/users/${userId}/followers`);
                setFollowers(followersRes.data);
            } catch (e) { console.error('Ошибка подписчиков', e); }

            // Загружаем подписки
            try {
                const followingRes = await api.get(`/users/${userId}/following`);
                setFollowing(followingRes.data);
            } catch (e) { console.error('Ошибка подписок', e); }

            // Проверяем, подписан ли текущий пользователь
            if (currentUser && !isOwnProfile) {
                try {
                    const myFollowingRes = await api.get(`/users/${currentUser.id}/following`);
                    const isSubscribed = myFollowingRes.data.some((u: User) => u.id === userId);
                    setIsFollowing(isSubscribed);
                } catch (e) { console.error('Ошибка проверки подписки', e); }
            }

        } catch (err) {
            console.error('Ошибка загрузки профиля', err);
        } finally {
            setProfileLoading(false);
        }
    };

    // Подписка / отписка
    const handleSubscribe = async () => {
        try {
            if (isFollowing) {
                await api.delete(`/users/${userId}/subscribe`);
            } else {
                await api.post(`/users/${userId}/subscribe`);
            }
            setIsFollowing(!isFollowing);
            // Обновляем подписчиков
            try {
                const followersRes = await api.get(`/users/${userId}/followers`);
                setFollowers(followersRes.data);
            } catch (e) {}
        } catch (err) {
            console.error('Ошибка подписки', err);
        }
    };

    // Удаление поста
    const handleDeletePost = async (postId: number) => {
        if (!confirm('Удалить пост?')) return;
        try {
            await api.delete(`/posts/${postId}`);
            fetchProfile();
        } catch (err) {
            console.error('Ошибка удаления', err);
        }
    };

    // Выход
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
                background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
                padding: '12px 24px', display: 'flex',
                justifyContent: 'space-between', alignItems: 'center'
            }}>
                <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: 18 }}>← Назад</Link>
                <h1 style={{ color: 'white', fontSize: 20, margin: 0 }}>Профиль</h1>
                <div style={{ display: 'flex', gap: 12 }}>
                    {isOwnProfile && (
                        <button onClick={handleLogout} style={{
                            background: 'rgba(255,255,255,0.2)', color: 'white',
                            border: '1px solid rgba(255,255,255,0.3)', padding: '6px 16px',
                            borderRadius: 20, cursor: 'pointer'
                        }}>Выйти</button>
                    )}
                </div>
            </header>

            {/* Карточка профиля */}
            <div style={{ maxWidth: 600, margin: '24px auto', padding: '0 16px' }}>
                <div style={{
                    background: 'white', borderRadius: 16, padding: 30,
                    textAlign: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                }}>
                    <div style={{
                        width: 100, height: 100, borderRadius: '50%',
                        background: '#e3f2fd', margin: '0 auto 16px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 45
                    }}>
                        {profile.avatar ? <img src={profile.avatar} alt="" style={{ width: '100%', borderRadius: '50%' }} /> : '👤'}
                    </div>
                    <h2 style={{ margin: '0 0 4px', color: '#1a73e8' }}>
                        {profile.firstName} {profile.lastName}
                    </h2>
                    <p style={{ color: '#888', margin: '0 0 8px' }}>@{profile.username}</p>
                    {profile.bio && <p style={{ color: '#555' }}>{profile.bio}</p>}

                    {/* Кнопка подписки (только для чужих профилей) */}
                    {!isOwnProfile && currentUser && (
                        <button onClick={handleSubscribe} style={{
                            marginTop: 16, padding: '8px 28px',
                            background: isFollowing ? '#dc3545' : '#1a73e8',
                            color: 'white', border: 'none', borderRadius: 20,
                            cursor: 'pointer', fontSize: 15, fontWeight: 600
                        }}>
                            {isFollowing ? 'Отписаться' : 'Подписаться'}
                        </button>
                    )}
                    {/* Подписчики и подписки */}
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 30, marginTop: 20, borderTop: '1px solid #eee', paddingTop: 16 }}>
                        <div onClick={() => {
                            setShowFollowers(!showFollowers);
                            setShowFollowing(false);  // ← скрываем подписки
                        }} style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#1a73e8' }}>{followers.length}</div>
                            <div style={{ fontSize: 13, color: '#888' }}>подписчиков</div>
                        </div>
                        <div onClick={() => {
                            setShowFollowing(!showFollowing);
                            setShowFollowers(false);  // ← скрываем подписчиков
                        }} style={{ cursor: 'pointer', textAlign: 'center' }}>
                            <div style={{ fontSize: 20, fontWeight: 700, color: '#1a73e8' }}>{following.length}</div>
                            <div style={{ fontSize: 13, color: '#888' }}>подписок</div>
                        </div>
                    </div>

                    {/* Список подписчиков */}
                    {showFollowers && (
                        <div style={{ marginTop: 12, textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#555' }}>Подписчики:</div>
                            {followers.map(u => (
                                <Link to={`/profile/${u.id}`} key={u.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                                    textDecoration: 'none', color: '#333'
                                }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '50%',
                                        background: '#e3f2fd', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: 16
                                    }}>👤</div>
                                    <span>{u.firstName} {u.lastName}</span>
                                </Link>
                            ))}
                            {followers.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>Нет подписчиков</p>}
                        </div>
                    )}

                    {/* Список подписок */}
                    {showFollowing && (
                        <div style={{ marginTop: 12, textAlign: 'left' }}>
                            <div style={{ fontWeight: 600, marginBottom: 8, color: '#555' }}>Подписки:</div>
                            {following.map(u => (
                                <Link to={`/profile/${u.id}`} key={u.id} style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                                    textDecoration: 'none', color: '#333'
                                }}>
                                    <div style={{
                                        width: 30, height: 30, borderRadius: '50%',
                                        background: '#e3f2fd', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: 16
                                    }}>👤</div>
                                    <span>{u.firstName} {u.lastName}</span>
                                </Link>
                            ))}
                            {following.length === 0 && <p style={{ color: '#888', fontSize: 14 }}>Нет подписок</p>}
                        </div>
                    )}
                </div>

                {/* Посты */}
                <h3 style={{ margin: '24px 0 12px', color: '#333' }}>Посты</h3>
                {posts.length === 0 && <p style={{ color: '#888' }}>Нет постов</p>}
                {posts.map((post) => (
                    <div key={post.id} style={{
                        background: 'white', borderRadius: 12, padding: 16,
                        marginBottom: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <p style={{ margin: 0, fontSize: 15 }}>{post.text}</p>
                            {isOwnProfile && (
                                <button onClick={() => handleDeletePost(post.id)} style={{
                                    background: 'none', border: 'none', cursor: 'pointer',
                                    fontSize: 18, color: '#999'
                                }}>🗑</button>
                            )}
                        </div>
                        <div style={{ color: '#999', fontSize: 13, marginTop: 8 }}>
                            {new Date(post.createdAt).toLocaleDateString('ru-RU')} ·
                            ❤️ {post.likesAmount} · 💬 {post.commentAmount}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ProfilePage;
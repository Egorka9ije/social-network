import {useState, FormEvent, useContext} from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../service/api';
import {AuthContext} from "../context/AuthContext.tsx";

function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { login } = useContext(AuthContext);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        try {
            const response = await api.post('/auth/login', { username, password });
            localStorage.setItem('token', response.data.token);

            // Получаем данные пользователя и сохраняем в контекст
            const userRes = await api.get('/users/me');
            login(userRes.data);

            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ошибка входа');
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1a73e8, #0d47a1)',
            fontFamily: 'Arial, sans-serif'
        }}>
            <div style={{
                backgroundColor: 'white',
                borderRadius: 16,
                padding: 40,
                width: 360,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                textAlign: 'center'
            }}>
                <h1 style={{ color: '#0d47a1', fontSize: 28, marginBottom: 8 }}>Вход</h1>
                <p style={{ color: '#888', marginBottom: 24 }}>Добро пожаловать!</p>

                {error && <p style={{ color: 'red', marginBottom: 12 }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input
                        placeholder="Логин"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <input
                        type="password"
                        placeholder="Пароль"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        style={inputStyle}
                    />
                    <button type="submit" style={{
                        width: '100%',
                        padding: 14,
                        backgroundColor: '#1a73e8',
                        color: 'white',
                        border: 'none',
                        borderRadius: 8,
                        fontSize: 16,
                        cursor: 'pointer',
                        fontWeight: 600
                    }}>
                        Войти
                    </button>
                </form>

                <p style={{ marginTop: 20, color: '#888' }}>
                    Нет аккаунта? <Link to="/register" style={{ color: '#1a73e8' }}>Зарегистрироваться</Link>
                </p>
            </div>
        </div>
    );
}

const inputStyle = {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    border: '1px solid #bbdefb',
    borderRadius: 8,
    fontSize: 15,
    boxSizing: 'border-box' as const,
    outline: 'none'
};

export default LoginPage;
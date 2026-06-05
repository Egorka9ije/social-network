import { useState, FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../service/api';

function RegisterPage() {
    // useState — хранит то, что ввёл пользователь в каждое поле
    const [firstName, setFirstName] = useState('');   // имя
    const [lastName, setLastName] = useState('');     // фамилия
    const [username, setUsername] = useState('');     // логин
    const [email, setEmail] = useState('');           // почта
    const [password, setPassword] = useState('');     // пароль
    const [error, setError] = useState('');           // ошибка
    const navigate = useNavigate();                   // для перехода

    // Функция отправки формы
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();  // чтобы страница не перезагружалась
        setError('');        // очищаем старую ошибку
        try {
            // Отправляем данные на сервер
            await api.post('/auth/register', {
                username,
                email,
                password,
                firstName,
                lastName,
                avatar: null,
                bio: null
            });
            // После успешной регистрации — на страницу входа
            navigate('/login');
        } catch (err: any) {
            // Если ошибка — показываем
            setError(err.response?.data?.message || 'Ошибка регистрации');
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
                width: 380,
                boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
                textAlign: 'center'
            }}>
                <h1 style={{ color: '#0d47a1', fontSize: 28, marginBottom: 8 }}>Регистрация</h1>
                <p style={{ color: '#888', marginBottom: 24 }}>Создайте аккаунт</p>

                {/* Ошибка — только если есть */}
                {error && <p style={{ color: 'red', marginBottom: 12, fontSize: 14 }}>{error}</p>}

                <form onSubmit={handleSubmit}>
                    <input placeholder="Имя" value={firstName}
                           onChange={(e) => setFirstName(e.target.value)}
                           required style={inputStyle} />
                    <input placeholder="Фамилия" value={lastName}
                           onChange={(e) => setLastName(e.target.value)}
                           required style={inputStyle} />
                    <input placeholder="Логин" value={username}
                           onChange={(e) => setUsername(e.target.value)}
                           required style={inputStyle} />
                    <input type="email" placeholder="Email" value={email}
                           onChange={(e) => setEmail(e.target.value)}
                           required style={inputStyle} />
                    <input type="password" placeholder="Пароль" value={password}
                           onChange={(e) => setPassword(e.target.value)}
                           required style={inputStyle} />

                    <button type="submit" style={{
                        width: '100%', padding: 14, backgroundColor: '#1a73e8',
                        color: 'white', border: 'none', borderRadius: 8,
                        fontSize: 16, cursor: 'pointer', fontWeight: 600, marginTop: 8
                    }}>
                        Зарегистрироваться
                    </button>
                </form>

                <p style={{ marginTop: 20, color: '#888' }}>
                    Уже есть аккаунт? <Link to="/login" style={{ color: '#1a73e8' }}>Войти</Link>
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

export default RegisterPage;
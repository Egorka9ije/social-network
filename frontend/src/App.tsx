import { Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage';
import AdminPage from './pages/AdminPage';


function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/profile/:id" element={< ProfilePage />} />
            <Route path="/" element={<FeedPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/admin" element={<AdminPage />} />


        </Routes>
    );
}

export default App;
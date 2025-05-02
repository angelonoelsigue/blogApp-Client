import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import AppNavbar from './components/AppNavbar';
import Login from './pages/Login';
import Logout from './pages/Logout';
import Register from './pages/Register';
import AdminDashboard from "./pages/AdminDashboard";
import CreateBlog from "./pages/CreateBlog";
import BlogList from './pages/BlogList';
import SingleBlog from './pages/SingleBlog';
import { UserProvider } from './UserContext';

function App() {
  const [user, setUser] = useState({ id: null, isAdmin: false });

  const unsetUser = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    setUser({ id: null, isAdmin: false });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');

    if (token && storedUserId) {
      setUser({ id: storedUserId, isAdmin: localStorage.getItem("isAdmin") === "true" });
    } else if (token) {
      fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setUser({ id: data.user._id, isAdmin: data.user.isAdmin });
            localStorage.setItem('userId', data.user._id);
            localStorage.setItem('isAdmin', data.user.isAdmin);
          } else {
            setUser({ id: null, isAdmin: false });
          }
        })
        .catch(() => setUser({ id: null, isAdmin: false }));
    }
  }, []);

  return (
    <UserProvider value={{ user, setUser, unsetUser }}>
      <Router>
        <AppNavbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/logout" element={<Logout />} />
          <Route path="/register" element={<Register />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/create-blog" element={<CreateBlog />} />
          <Route path="/blogs" element={<BlogList />} />
          <Route path="/blogs/:id" element={<SingleBlog />} />
        </Routes>
      </Router>
    </UserProvider>
  );
}

export default App;

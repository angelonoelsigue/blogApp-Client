import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import UserContext from '../UserContext';

export default function Logout() {
  const { unsetUser } = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    const notyf = new Notyf({ position: { x: 'center', y: 'top' } });
    
    unsetUser(); // ✅ Clears authentication state
    localStorage.removeItem("token"); // ✅ Extra cleanup
    localStorage.removeItem("userId");
    localStorage.removeItem("isAdmin");

    notyf.success("Logged out successfully!");
    setTimeout(() => navigate("/login"), 1000); // ✅ Smooth redirection after 1 sec
  }, [unsetUser, navigate]);

  return null; // ✅ Avoid unnecessary extra rendering
}

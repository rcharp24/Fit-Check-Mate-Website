import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from './firebase';
import { signOut } from 'firebase/auth';

const LogoutPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleLogout = async () => {
      try {
        await signOut(auth);
        navigate('/'); // Redirect to login after logout
      } catch (error) {
        console.error("Logout failed:", error);
      }
    };

    handleLogout();
  }, [navigate]);

  return (
    <div className="vh-100 d-flex justify-content-center align-items-center bg-dark text-white transparent-centered-container">
      <h2>Logging out...</h2>
    </div>
  );
};

export default LogoutPage;

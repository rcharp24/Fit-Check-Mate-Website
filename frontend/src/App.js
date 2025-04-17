import { useEffect, useState } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import MainPage from "./MainPage";
import LoginPage from "./LoginPage";
import ForgotPW from "./ForgotPW";
import Register from "./Register";
import HomePage from ".//HomePage";
import UploadPage from "./UploadPage";
import ResultPage from "./ResultPage";
import AboutPage from "./AboutPage";
import Logout from "./Logout";
import NavBarComponent from "./NavBarComponent";
import SavedColors from "./SavedColors";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe(); // Cleanup function
  }, []);

  return (
    <div className="checkered-background">
      <Router>
        <Routes>
          {/* Main Page (no NavBarComponent) */}
          <Route path="/" element={<MainPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/logout" element={<Logout />} />
          {/* Other Pages Wrapped in NavBarComponent */}
          <Route
            path="*"
            element={
              <NavBarComponent>
                <Routes>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/forgot" element={<ForgotPW />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/home" element={user ? <HomePage /> : <Navigate to="/" />} />
                  <Route path="/upload" element={<UploadPage />} />
                  <Route path="/results" element={<ResultPage />} />
                  <Route path="/about" element={<AboutPage />} />
                  <Route path="/savedcolors" element={<SavedColors />} />
                </Routes>
              </NavBarComponent>
            }
          />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
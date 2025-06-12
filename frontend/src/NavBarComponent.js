import React from "react";
import { useLocation } from "react-router-dom";
import NoSloganLogo from "./NoSloganLogo.jpg"; // Adjust path if needed

const NavBarComponent = ({ children }) => {
  const location = useLocation();

  // Don't show the logo on the main page
  if (location.pathname === "/") {
    return <>{children}</>;
  }

  return (
    <div className="checkered-background">
      {/* Logo at the top-left */}
      <img
        src={NoSloganLogo}
        alt="FitCheckMate Logo"
        style={{
        width: "120px",
        height: "120px",
        position: "absolute",
        top: "20px",
        left: "20px",
        zIndex: 1051, // Higher than modal backdrop (1050)
      }}
      />
      
      {/* Page content */}
      <div>{children}</div>
    </div>
  );
};

export default NavBarComponent;

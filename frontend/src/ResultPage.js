import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function ResultsPage() {
  const location = useLocation();
  const [colors, setColors] = useState({ top: "N/A", bottom: "N/A", shoes: "N/A" });

  useEffect(() => {
    console.log("Location State: ", location.state);

    if (location.state && location.state.extractedColors) {
      const { top, bottom, shoes } = location.state.extractedColors;

      // Log the received colors to the console
      console.log("Extracted Colors:", { top, bottom, shoes });

      // Set the colors in the state
      setColors({ top, bottom, shoes });
    }
  }, [location]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        textAlign: "center",
        color: "white",
        backgroundColor: "rgba(10, 10, 40, 0.9)",
        padding: "20px",
      }}
    >
      <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Color Analysis Results</h2>

      {/* Display the colors in styled cards */}
      <div style={{ display: "flex", gap: "20px" }}>
        {Object.entries(colors).map(([key, value]) => (
          <div
            key={key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              padding: "20px",
              backgroundColor: "rgba(10, 10, 40, 0.9)",
              borderRadius: "10px",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
              minWidth: "150px",
            }}
          >
            <h3 style={{ fontSize: "1.5rem", marginBottom: "10px" }}>
              {key.charAt(0).toUpperCase() + key.slice(1)} Color
            </h3>
            <div
              style={{
                width: "50px",
                height: "50px",
                backgroundColor: value !== "N/A" ? value : "gray",
                borderRadius: "5px",
                marginBottom: "10px",
                border: "2px solid white",
              }}
            />
            <p style={{ fontSize: "1.2rem" }}>{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ResultsPage;

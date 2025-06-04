import React, { useEffect, useState } from "react";
import { Button, Row, Card, Spinner } from "react-bootstrap";
import { Link } from "react-router-dom";

function SavedOutfits() {
  // State to hold the list of saved outfits fetched from backend
  const [outfits, setOutfits] = useState([]);

  // Loading state while fetching data
  const [loading, setLoading] = useState(true);

  // Error message state if fetch or delete fails
  const [error, setError] = useState("");

  // Fetch saved outfits from backend when component mounts
  useEffect(() => {
    fetchOutfits();
  }, []);

  // Function to fetch saved outfits from the backend API
  const fetchOutfits = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("http://localhost:5000/api/saved-outfits");
      if (!response.ok) throw new Error("Failed to fetch saved outfits");
      const data = await response.json();
      setOutfits(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Function to delete an outfit by id
  const deleteOutfit = async (id) => {
  try {
    const response = await fetch(`http://localhost:5000/api/delete-outfit/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      // Try to parse JSON error if possible, otherwise fallback
      let errorMessage = "Failed to delete outfit";
      try {
        const data = await response.json();
        if (data.message) errorMessage = data.message;
      } catch {
        // response not JSON, maybe HTML error page
        errorMessage = `Server returned status ${response.status}`;
      }
      throw new Error(errorMessage);
    }

    // Success: remove outfit from list
    setOutfits((prevOutfits) => prevOutfits.filter((outfit) => outfit.id !== id));
  } catch (err) {
    setError(`Error deleting outfit: ${err.message}`);
  }
};


  return (
    <div
      style={{
        padding: "20px",
        backgroundColor: "rgba(10, 10, 40, 0.9)",
        minHeight: "100vh",
        color: "white",
        textAlign: "center",
      }}
    >
      {/* Navigation buttons */}
      <Row className="mb-3">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about">
              <Button variant="primary">About</Button>
            </Link>
            <Link to="/savedcolors">
              <Button variant="primary">Saved Colors</Button>
            </Link>
            <Link to="/logout">
              <Button variant="primary">Logout</Button>
            </Link>
          </div>
        </nav>
      </Row>

      <h2>Saved Outfits</h2>

      {/* Show spinner while loading data */}
      {loading && <Spinner animation="border" variant="light" />}

      {/* Show error message if any */}
      {error && <p style={{ color: "tomato" }}>{error}</p>}

      {/* Show message if no saved outfits */}
      {!loading && outfits.length === 0 && <p>No saved outfits yet.</p>}

      {/* Display saved outfits in cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {outfits.map((outfit) => (
          <Card
            key={outfit.id}
            style={{
              width: "250px",
              backgroundColor: "rgba(20,20,60,0.8)",
              color: "white",
              position: "relative",
            }}
          >
            <Card.Body>
              <Card.Title>Outfit #{outfit.id}</Card.Title>
              <Card.Text>
                <strong>Gender:</strong> {outfit.gender || "N/A"}
                <br />
                <strong>Season:</strong> {outfit.season || "N/A"}
                <br />
                <strong>Style:</strong> {outfit.style || "N/A"}
              </Card.Text>

              {/* Display color swatches for top, bottom, shoes */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "10px",
                }}
              >
                {/* Make sure the keys you use here exactly match your backend response keys */}
                {["top", "bottom", "shoes"].map((part) => (
                  <div key={part} style={{ textAlign: "center" }}>
                    <div
                      style={{
                        width: "50px",
                        height: "50px",
                        backgroundColor: outfit[part] || "gray", // Use color or fallback
                        borderRadius: "5px",
                        border: "2px solid white",
                        marginBottom: "5px",
                      }}
                    />
                    <small>{part.charAt(0).toUpperCase() + part.slice(1)}</small>
                  </div>
                ))}
              </div>

              {/* Delete button to remove this outfit */}
              <Button
                variant="danger"
                size="sm"
                onClick={() => deleteOutfit(outfit.id)}
                style={{ marginTop: "15px" }}
              >
                Delete
              </Button>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Back to upload page button */}
      <div className="mt-3">
        <Link to="/upload">
          <Button variant="warning">Back to Upload Page</Button>
        </Link>
      </div>
    </div>
  );
}

export default SavedOutfits;

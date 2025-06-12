import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Row, Card, Spinner } from "react-bootstrap";


function SavedOutfits() {
  const [outfits, setOutfits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  useEffect(() => {
    fetchOutfits();
  }, []);

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

  const deleteOutfit = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/delete-outfit/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        let errorMessage = "Failed to delete outfit";
        try {
          const data = await response.json();
          if (data.message) errorMessage = data.message;
        } catch {
          errorMessage = `Server returned status ${response.status}`;
        }
        throw new Error(errorMessage);
      }

      setOutfits((prevOutfits) => prevOutfits.filter((outfit) => outfit.id !== id));
    } catch (err) {
      setError(`Error deleting outfit: ${err.message}`);
    }
  };
    
  return (
    <div
      className='transparent-centered-container'
      style={{
        padding: "20px",
        backgroundColor: "rgba(10, 10, 40, 0.9)",
        minHeight: "100vh",
        color: "white",
        textAlign: "center",
      }}
    >
      {/* Navigation */}
      <Row className="mb-3">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about"><Button variant="primary">About</Button></Link>
            <Link to="/savedcolors"><Button variant="primary">Saved Colors</Button></Link>
            <Link to="/logout"><Button variant="primary">Logout</Button></Link>
          </div>
        </nav>
      </Row>

      <h2>Saved Outfits</h2>

      {loading && <Spinner animation="border" variant="light" />}
      {error && <p style={{ color: "tomato" }}>{error}</p>}
      {!loading && outfits.length === 0 && <p>No saved outfits yet.</p>}

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
              width: "300px",
              background: "linear-gradient(135deg, rgba(5,3,50,0.8), rgba(151,120,56,0.85))",
              color: "white",
              position: "relative",
            }}
          >
            <Card.Body>
              <Card.Title>Outfit #{outfit.id}</Card.Title>
              <Card.Text>
                <strong>Gender:</strong> {outfit.gender || "N/A"}<br />
                <strong>Season:</strong> {outfit.season || "N/A"}<br />
                <strong>Style:</strong> {outfit.style || "N/A"}
              </Card.Text>

              {/* Image + Color Swatches */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-around",
                  marginTop: "10px",
                  flexWrap: "wrap",
                  gap: "20px",
                }}
              >
                
                {["top", "bottom", "shoes"].map((part) => {
                  const colorKey = `${part}_color`; // DB might use lowercase field names
                  const imageKey = `${part}_image`;
                  

                  return (
                    <div key={part} style={{ textAlign: "center", maxWidth: "100px" }}>
                      <small style={{ display: "block", fontWeight: "bold" }}>
                        {part.charAt(0).toUpperCase() + part.slice(1)}
                      </small>
                    {outfit[imageKey] && (
                      <img
                          src={outfit[imageKey]}
                          alt={`${part} preview`}
                          style={{
                            width: "60px",
                            height: "60px",
                            objectFit: "cover",
                            borderRadius: "6px",
                            border: "1px solid #ccc",
                          }}
                      />
                  )}
                      <div
                        style={{
                          width: "50px",
                          height: "50px",
                          backgroundColor: outfit[colorKey] || "#ccc",
                          border: "2px solid white",
                          borderRadius: "4px",
                          margin: "5px auto",
                        }}
                        title={outfit[colorKey]}
                      />

                      
                    </div>
                  );
                })}
              </div>

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

      {/* Back to upload */}
      <div className="mt-3">
        <Link to="/upload">
          <Button variant="warning">Back to Upload Page</Button>
        </Link>
      </div>
    </div>
  );
}

export default SavedOutfits;

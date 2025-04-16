import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";

function SavedColors() {
  const [savedColors, setSavedColors] = useState([]);

  useEffect(() => {
    fetch("https://fit-check-mate-uxwr.onrender.com/api/saved-colors")
      .then((response) => response.json())
      .then((data) => setSavedColors(data))
      .catch((error) => console.error("Error fetching saved colors:", error));
  }, []);
  
  const handleDeleteColor = (id) => {
    fetch(`https://fit-check-mate-uxwr.onrender.com/api/delete-color/${id}`, { method: "DELETE" })
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to delete color");
        }
        return response.json();
      })
      .then(() => {
        setSavedColors((prevColors) => prevColors.filter((color) => color.id !== id));
      })
      .catch((error) => console.error("Error deleting color:", error));
  };
  

  return (
    <div className="bg-dark text-white checkered-background overflow-auto">
      {/* Navbar Section */}
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about">
              <Button variant="primary">About</Button>
            </Link>
            <Link to="/home">
              <Button variant="primary">Home</Button>
            </Link>
            <Link to="/upload">
              <Button variant="primary">Upload</Button>
            </Link>
            <Link to="/logout">
              <Button variant="primary">Logout</Button>
            </Link>
          </div>
        </nav>
      </Row>

      {/* Saved Colors Section */}
      <Container className="d-flex flex-column align-items-center pt-4">
        <Card className="shadow-lg text-center mb-4" style={{ width: '40%', backgroundColor: 'rgba(10, 10, 40, 0.9)', color: 'white'}}>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: "3rem" }}>Saved Colors</h2>
        </Card>
        <Row className="w-100 justify-content-center">
          {savedColors.length > 0 ? (
            savedColors.map((color) => (
              <Col key={color.id} md={4} sm={6} xs={12} className="mb-4">
                <Card className="shadow-lg text-center bg-light text-dark border-secondary">
                  <Card.Body>
                    <div
                      className="rounded mb-2"
                      style={{ backgroundColor: color.extracted_color, height: "100px" }}
                    ></div>
                    <p><strong>Extracted:</strong> {color.extracted_color}</p>
                    <div
                      className="rounded mb-2"
                      style={{ backgroundColor: color.match_color, height: "100px" }}
                    ></div>
                    <p><strong>Closest Match:</strong> {color.match_color}</p>
                    <Button
                      variant="danger"
                      className="mt-2 w-100"
                      onClick={() => handleDeleteColor(color.id)}
                    >
                      Delete
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <p className="text-light">No saved colors yet.</p>
          )}
        </Row>
      </Container>
    </div>
  );
}

export default SavedColors;

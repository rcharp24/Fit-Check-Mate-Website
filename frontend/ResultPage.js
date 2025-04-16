import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Toast, ToastContainer } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

function ResultsPage() {
  const location = useLocation();
  const { extractedColors } = location.state || {};
  const [showNotification, setShowNotification] = useState(false);

  // Function to save colors to the database
  const handleSaveColors = async () => {
    if (!extractedColors) {
      alert("No colors to save!");
      return;
    }
  
    try {
      const response = await fetch("https://fit-check-mate-uxwr.onrender.com/api/save-colors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ extractedColors }),
      });
  
      if (!response.ok) {
        throw new Error("Failed to save colors");
      }
  
      setShowNotification(true); // Show success notification
    } catch (error) {
      console.error("Error saving colors:", error);
    }
  };
  

  return (
    <div className="overflow-auto">
      {/* Toast Notification */}
      <ToastContainer position="top-end" className="p-3" >
        <Toast
          onClose={() => setShowNotification(false)}
          show={showNotification}
          bg="success"
          autohide
          delay={7000}
        >
          <Toast.Header style={{backgroundColor: "rgba(20,20,60,0.9)"}}>
            <strong className="me-auto text-white" >Success!</strong>
          </Toast.Header>
          <Toast.Body style={{backgroundColor: "white"}}>All colors have been saved successfully! 🎨</Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Navbar */}
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about"><Button variant="primary">About</Button></Link>
            <Link to="/home"><Button variant="primary">Home</Button></Link>
            <Link to="/savedcolors"><Button variant="primary">Saved Colors</Button></Link>
            <Link to="/logout"><Button variant="primary">Logout</Button></Link>
          </div>
        </nav>
      </Row>

      {/* Results Container */}
      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Row className="w-100 justify-content-center">
          <Col md={8} lg={6}>
            <Card className="w-100 shadow-lg text-white" style={{ backgroundColor: "rgba(10, 10, 40, 0.9)" }}>
              <Card.Body>
                <h4 className="text-center mb-4">Analysis Results</h4>

                {extractedColors ? (
                  <Row>
                    {["topImage", "bottomImage", "shoeImage"].map((item) => (
                      <Col key={item} md={4}>
                        <Card className="p-3 text-center">
                          <div style={{ backgroundColor: extractedColors[item]?.extracted, height: "50px" }}></div>
                          <p><strong>Extracted: </strong>{extractedColors[item]?.extracted}</p>
                          <div style={{ backgroundColor: extractedColors[item]?.matchHex, height: "50px" }}></div>
                          <p><strong> Closest Match: </strong>{extractedColors[item]?.closestMatch}, {extractedColors[item]?.matchHex}</p>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <p>No data available. Please go back and try again.</p>
                )}

                {/* Buttons */}
                <div className="text-center mt-4">
                  <Button variant="outline-warning" style={{ marginRight: "10px" }} href="/upload">
                    Go Back to Upload
                  </Button>
                  <Button variant="outline-warning" onClick={handleSaveColors}>
                    Save Colors
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default ResultsPage;

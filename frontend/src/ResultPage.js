import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Toast, ToastContainer } from "react-bootstrap";
import { useLocation } from "react-router-dom";

function ResultsPage() {
  const location = useLocation();
  const { extractedColors } = location.state || {}; // Get colors from state passed by UploadPage
  console.log("Extracted colors:", extractedColors);

  const [showNotification, setShowNotification] = useState(false);

  // Check if extractedColors is undefined or empty
  if (!extractedColors) {
    return <div>Loading...</div>; // Show loading state while waiting for data
  }

  // Function to save colors to the database
  const handleSaveColors = async () => {
    if (!extractedColors) {
      alert("No colors to save!");
      return (
        <div className="text-center">
          <h3>Loading Analysis Results...</h3>
        </div>
      );
    }

    try {
      const response = await fetch("https://localhost:5000/api/save-colors", {
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
      <ToastContainer position="top-end" className="p-3">
        <Toast
          onClose={() => setShowNotification(false)}
          show={showNotification}
          bg="success"
          autohide
          delay={7000}
        >
          <Toast.Header style={{ backgroundColor: "rgba(20,20,60,0.9)" }}>
            <strong className="me-auto text-white">Success!</strong>
          </Toast.Header>
          <Toast.Body style={{ backgroundColor: "white" }}>
            All colors have been saved successfully! 🎨
          </Toast.Body>
        </Toast>
      </ToastContainer>

      {/* Results Container */}
      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Row className="w-100 justify-content-center">
          <Col md={8} lg={6}>
            <Card className="w-100 shadow-lg text-white" style={{ backgroundColor: "rgba(10, 10, 40, 0.9)" }}>
              <Card.Body>
                <h4 className="text-center mb-4">Analysis Results</h4>

                <Row>
                  {["top", "bottom", "shoes"].map((item) => (
                    extractedColors[item] ? (
                      <Col key={item} md={4}>
                        <Card className="p-3 text-center">
                          <div
                            style={{
                              backgroundColor: extractedColors[item], // <-- just use extractedColors[item]
                              height: "50px",
                              borderRadius: "5px",
                              border: "1px solid #ccc",
                            }}
                          ></div>
                          <p><strong>Extracted: </strong>{extractedColors[item]}</p>
                        </Card>
                      </Col>
                    ) : (
                      <Col key={item} md={4}>
                        <Card className="p-3 text-center">
                          <p>Data not available for {item}</p>
                        </Card>
                      </Col>
                    )
                  ))}
                </Row>

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

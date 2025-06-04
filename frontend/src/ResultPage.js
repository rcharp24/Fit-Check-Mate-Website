import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Button, Row, Modal, Form, Spinner } from 'react-bootstrap';
import { Link } from "react-router-dom";

function ResultsPage() {
  const location = useLocation();

  // Store extracted colors for top, bottom, shoes
  const [colors, setColors] = useState({ top: "N/A", bottom: "N/A", shoes: "N/A" });

  // Control whether the save preferences modal is visible
  const [showModal, setShowModal] = useState(false);

  // Store selected preferences from modal dropdowns
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");

  // Store message to show after save attempt (success/failure)
  const [saveMessage, setSaveMessage] = useState("");
   const [isSaving, setIsSaving] = useState(false); // <-- Track saving state
  // Toggle modal visibility on/off
  const handleModalToggle = () => setShowModal(!showModal);

  // Handle saving the outfit colors + preferences to backend
  const handleSaveColors = async () => {
    setIsSaving(true);  // Start spinner
    setSaveMessage(""); // Clear any old messages

    const payload = {
      top: colors.top,
      bottom: colors.bottom,
      shoes: colors.shoes,
      gender: selectedGender,
      season: selectedSeason,
      style: selectedStyle,
    };

    try {
      const response = await fetch('http://localhost:5000/api/save-outfit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage("Outfit saved successfully!");
      } else {
        setSaveMessage("Failed to save outfit: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving colors:", error);
      setSaveMessage("Error saving outfit: " + error.message);
    }

    setIsSaving(false);  // Stop spinner
    // Close the modal after attempting to save
    handleModalToggle();
  };

  // On mount / location change, load extracted colors passed via navigation state
  useEffect(() => {
    if (location.state && location.state.extractedColors) {
      const { top, bottom, shoes } = location.state.extractedColors;
      setColors({ top, bottom, shoes });
    }
  }, [location]);

  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center",
      justifyContent: "center", height: "100vh", textAlign: "center",
      color: "white", backgroundColor: "rgba(10, 10, 40, 0.9)", padding: "20px"
    }}>
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about"><Button variant="primary">About</Button></Link>
            <Link to="/logout"><Button variant="primary">Logout</Button></Link>
          </div>
        </nav>
      </Row>

      <div>
        <h2 style={{ fontSize: "2rem", marginBottom: "20px" }}>Color Analysis Results</h2>
        <div style={{ display: "flex", gap: "20px" }}>
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              padding: "20px", backgroundColor: "rgba(10, 10, 40, 0.9)",
              borderRadius: "10px", boxShadow: "0 4px 8px rgba(0, 0, 0, 0.3)",
              minWidth: "150px"
            }}>
              <h3>{key.charAt(0).toUpperCase() + key.slice(1)} Color</h3>
              <div style={{
                width: "50px", height: "50px",
                backgroundColor: value !== "N/A" ? value : "gray",
                borderRadius: "5px", marginBottom: "10px",
                border: "2px solid white"
              }} />
              <p>{value}</p>
            </div>
          ))}
        </div>

        {/* Buttons for navigation and saving */}
        <div className="mt-3">
          <Link to="/savedoutfit"><Button variant="warning">Go to Saved Outfits</Button></Link>
          <Button
            variant="success"
            onClick={handleModalToggle}
            className="ms-2"
            disabled={isSaving} // Disable while saving
          >
            {isSaving ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  aria-hidden="true"
                /> Saving...
              </>
            ) : (
              "Save Outfit"
            )}
          </Button>
          <Link to="/upload"><Button variant="warning" className="ms-2">Back to Upload Page</Button></Link>
        </div>

        {saveMessage && (
          <p style={{ marginTop: "10px", color: saveMessage.includes("successfully") ? "lightgreen" : "tomato" }}>
            {saveMessage}
          </p>
        )}

        {/* Modal for selecting gender, season, style before saving */}
        <Modal show={showModal} onHide={handleModalToggle} centered>
          <Modal.Header closeButton>
            <Modal.Title>Save Your Outfit</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Gender</Form.Label>
                <Form.Select value={selectedGender} onChange={e => setSelectedGender(e.target.value)}>
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unisex">Unisex</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Season</Form.Label>
                <Form.Select value={selectedSeason} onChange={e => setSelectedSeason(e.target.value)}>
                  <option value="">Select Season</option>
                  <option value="Winter">Winter</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                </Form.Select>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Style</Form.Label>
                <Form.Select value={selectedStyle} onChange={e => setSelectedStyle(e.target.value)}>
                  <option value="">Select Style</option>
                  <option value="Casual">Casual</option>
                  <option value="Formal">Formal</option>
                  <option value="Sporty">Sporty</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleModalToggle} disabled={isSaving}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveColors} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Spinner
                    as="span"
                    animation="border"
                    size="sm"
                    role="status"
                    aria-hidden="true"
                  /> Saving...
                </>
              ) : (
                "Save"
              )}
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
}

export default ResultsPage;

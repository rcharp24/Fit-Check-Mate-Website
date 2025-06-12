import React, {useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Container, Row, Col, Card, Button } from "react-bootstrap";

const ColorSwatch = ({ hex }) => (
  <div style={{ textAlign: "center" }}>
    <div
      style={{
        backgroundColor: hex,
        width: "50px",
        height: "50px",
        borderRadius: "5px",
        margin: "auto",
        border: "1px solid #ccc",
      }}
    />
    <small style={{ color: "#fff" }}>{hex}</small>
  </div>
);


function ResultsPage() {
  const location = useLocation();

  const [showModal, setShowModal] = useState(false);
  const [selectedGender, setSelectedGender] = useState("");
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleModalToggle = () => setShowModal(!showModal);

  const {
    extractedColors = {},
    recommendedColors = {},
    matchStatus = false,
    topImage,
    bottomImage,
    shoesImage,
  } = location.state || {};

  const handleSaveColors = async () => {
    setIsSaving(true);
    setSaveMessage("");

    const payload = {
      topColor: extractedColors.top,
      bottomColor: extractedColors.bottom,
      shoesColor: extractedColors.shoes,
      gender: selectedGender,
      season: selectedSeason,
      style: selectedStyle,
      topImage: topImage,        // Cloudinary URL of top
      bottomImage: bottomImage,  // Cloudinary URL of bottom
      shoesImage: shoesImage,     // Cloudinary URL of shoes
      //recommendedTop: recommendedColors?.top || null,
      //recommendedBottom: recommendedColors?.bottom || null,
      //recommendedShoes: recommendedColors?.shoes || null,
      
    };

    try {
      const response = await fetch("http://localhost:5000/api/save-outfit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        setSaveMessage("Outfit saved successfully!");
      } else {
        setSaveMessage("Failed to save outfit: " + (data.message || "Unknown error"));
      }
    } catch (error) {
      console.error("Error saving outfit:", error);
      setSaveMessage("Error saving outfit: " + error.message);
    }

    setIsSaving(false);
    handleModalToggle();
  };

  if (!extractedColors || !extractedColors.top) {
    return (
      <Container className="text-center text-white mt-5">
        <h3>No results to display.</h3>
        <Link to="/upload">
          <Button variant="warning" className="mt-3">
            Go Back
          </Button>
        </Link>
      </Container>
    );
  }

  const items = [
    {
      label: "Top Image",
      image: topImage,
      color: extractedColors.top,
      suggestion: recommendedColors?.top,
    },
    {
      label: "Bottom Image",
      image: bottomImage,
      color: extractedColors.bottom,
      suggestion: recommendedColors?.bottom,
    },
    {
      label: "Shoes Image",
      image: shoesImage,
      color: extractedColors.shoes,
      suggestion: recommendedColors?.shoes,
    },
  ];

  return (
    <div className="transparent-centered-container">
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about"><Button variant="primary">About</Button></Link>
            <Link to="/home"><Button variant="primary">Home</Button></Link>
            <Link to="/savedoutfit"><Button variant="primary">Saved Outfits</Button></Link>
            <Link to="/logout"><Button variant="primary">Logout</Button></Link>
          </div>
        </nav>
      </Row>
      <Container
        fluid
        className="d-flex flex-column align-items-center justify-content-center text-white "
        style={{
          minHeight: "75vh",
          backgroundColor: "transparent",
          paddingTop: "3rem",
        }}
      >
        <Card
          className="text-center mb-4"
          style={{
            maxWidth: "400px",
            width: "75%",
            backgroundColor: "rgba(10, 10, 40, 0.9)",
            background: "linear-gradient(135deg, rgba(5,3,50,0.8), rgba(151,120,56,0.85))",
            color: "white",
            borderRadius: "2rem",
          }}
        >
          <Card.Body>
            <h1
              className="main-title text-center"
              style={{ fontFamily: "'Dancing Script', cursive", fontSize: "3rem" }}
            >
              Results Page
            </h1>
            <p className="lead mb-0">Extracted colors and suggested adjustments</p>
          </Card.Body>
        </Card>

        <Row className="justify-content-center w-70 px-4">
          {items.map(({ label, image, color, suggestion }) => (
            <Col key={label} md={4} className="mb-4 d-flex justify-content-center">
              <Card
                style={{
                  background: "linear-gradient(135deg, rgba(5,3,50,0.8), rgba(151,120,56,0.85))",
                  color: "#fff",
                  width: "100%",
                  maxWidth: "275px",
                }}
              >
                <Card.Body>
                  <Card.Title className="text-center" style={{ textDecoration: "underline" }}>
                    {label}
                  </Card.Title>
                  {image && (
                    <Card className ='justify-content-center' style={{background: 'white'}}>
                    <img
                      src={typeof image === "string" ? image : URL.createObjectURL(image)}
                      alt={`${label} Preview`}
                      style={{
                        width: 'auto',
                        height: "180px",
                        objectFit: "fill",
                        borderRadius: "5px",
                      }}
                    />
                    </Card>
                  )}
                  <div className="d-flex justify-content-center mt-3">
                    <Card.Title className="text-center" style={{ textDecoration: "underline" }}>
                      <p>Extracted Color</p>
                      <ColorSwatch hex={color} />
                    </Card.Title>
                  </div>
                  {!matchStatus && suggestion && suggestion !== color && (
                    <div className="mt-3 text-center">
                      <p className="mb-1">Suggested Color</p>
                      <ColorSwatch hex={suggestion} />
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        <Row className="text-center mt-3">
          <Col>
            <Link to="/upload">
              <Button variant="warning">Back to Upload Page</Button>
            </Link>
          </Col>
          <Col>
            <Button variant="warning" onClick={handleModalToggle}>
              Save This Outfit
            </Button>
          </Col>
        </Row>

        {showModal && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              backgroundColor: "rgba(0, 0, 0, 0.6)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1050,
            }}
          >
            <Card
              className="shadow p-4"
              style={{
                width: "100%",
                maxWidth: "400px",
                backgroundColor: "#ffffff",
                borderRadius: "1rem",
                zIndex: 1060,
              }}
            >
              <h4 className="text-center mb-3 text-dark">Save Outfit Preferences</h4>

              <div className="mb-3">
                <label className="text-dark"><strong>Gender</strong></label>
                <select
                  className="form-control"
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Unisex">Unisex</option>
                </select>
              </div>

              <div className="mb-3">
                <label className="text-dark"><strong>Season</strong></label>
                <select
                  className="form-control"
                  value={selectedSeason}
                  onChange={(e) => setSelectedSeason(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="Spring">Spring</option>
                  <option value="Summer">Summer</option>
                  <option value="Fall">Fall</option>
                  <option value="Winter">Winter</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="text-dark"><strong>Style</strong></label>
                <select
                  className="form-control"
                  value={selectedStyle}
                  onChange={(e) => setSelectedStyle(e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="casual">Casual</option>
                  <option value="formal">Formal</option>
                  <option value="sporty">Sporty</option>
                  <option value="streetwear">Streetwear</option>
                </select>
              </div>

              <div className="d-flex justify-content-between">
                <Button variant="secondary" onClick={handleModalToggle}>Cancel</Button>
                <Button variant="success" onClick={handleSaveColors} disabled={isSaving}>
                  {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>

              {saveMessage && (
                <p className="text-center mt-3 text-success">{saveMessage}</p>
              )}
            </Card>
          </div>
        )}
      </Container>
    </div>
  );
}

export default ResultsPage;

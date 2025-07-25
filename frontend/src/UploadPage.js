import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  process.env.REACT_APP_API_BASE_URL ||
  "http://localhost:5000";

const ColorSwatch = ({ hex }) => {
  const isLight = (hex) => {
    const r = parseInt(hex.substr(1, 2), 16);
    const g = parseInt(hex.substr(3, 2), 16);
    const b = parseInt(hex.substr(5, 2), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 180;
  };

  return (
    <div style={{ textAlign: "center" }}>
      <div
        style={{
          backgroundColor: hex,
          width: "65px",
          height: "65px",
          borderRadius: "10px",
          margin: "10px",
          border: "1px solid #ccc",
        }}
      />
      <large style={{ color: isLight(hex) }}>{hex}</large>
    </div>
  );
};

function UploadPage() {
  const [topImage, setTopImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [shoesImage, setShoesImage] = useState(null);

  const [preview, setPreview] = useState({ top: null, bottom: null, shoes: null });
  const [colors, setColors] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [extracted, setExtracted] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e, setImage, key) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview((prev) => ({ ...prev, [key]: URL.createObjectURL(file) }));
      setColors(null);
      setExtracted(false);
    }
  };

  const handleRemoveImage = (setImage, key) => {
    setImage(null);
    setPreview((prev) => ({ ...prev, [key]: null }));
    setColors(null);
    setExtracted(false);
  };

  const handleExtractColors = async (e) => {
    e.preventDefault();
    setError("");

    if (!topImage || !bottomImage || !shoesImage) {
      setError("Please upload images for all clothing items.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("topImage", topImage);
    data.append("bottomImage", bottomImage);
    data.append("shoesImage", shoesImage);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze`, data);
      if (res.data?.result) {
        const { result, recommendedColors, matchStatus } = res.data;
        setColors({ ...result, recommendedColors, matchStatus });
        setExtracted(true);
      } else {
        setError("No color analysis results found. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Color extraction failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateResults = async () => {
    if (!colors) return;
    try {
      
      navigate("/results", {
        state: {
          analyzedColors: colors,
          recommendedColors: colors?.recommendedColors,
          matchStatus: colors?.matchStatus,
          topImage: preview.top,
          bottomImage: preview.bottom,
          shoesImage: preview.shoes,
        },
      });
    } catch (err) {
      console.error("Navigation to results failed", err);
    }
  };

  return (
    <div className="transparent-centered-container">
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about">
              <Button>About</Button>
            </Link>
            <Link to="/home">
              <Button>Home</Button>
            </Link>
            <Link to="/logout">
              <Button>Logout</Button>
            </Link>
          </div>
        </nav>
      </Row>

      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Row className="w-100 justify-content-center">
          <Col md={10} lg={7}>
            <Card
              className="text-white"
              style={{ background: "linear-gradient(135deg, rgba(5,3,50,0.8), rgba(151,120,56,0.85))" }}
            >
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <form onSubmit={handleExtractColors}>
                  <Row className="mt-4 text-center justify-content-center">
                    {[{ label: "Top", setter: setTopImage, key: "top" }, { label: "Bottom", setter: setBottomImage, key: "bottom" }, { label: "Shoes", setter: setShoesImage, key: "shoes" }].map(({ label, setter, key }) => (
                      <Col md={4} key={label}>
                        <Card className="p-3 h-100">
                          <h3 className="card-title text-center mb-4" style={{ textDecoration: "underline" }}>{label}</h3>

                          {preview[key] ? (
                            <div className="text-center">
                              <img
                                src={preview[key]}
                                alt={`${label} Preview`}
                                style={{ width: "75%", height: "190px", borderRadius: "5px", marginBottom: "15px" }}
                              />
                              <Button variant="danger" onClick={() => handleRemoveImage(setter, key)}>Remove</Button>
                            </div>
                          ) : (
                            <label className="custom-file-upload">
                              <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, setter, key)} />
                              Choose File
                            </label>
                          )}

                          {colors?.[key] && (
                            <div className="mt-3 d-flex justify-content-center">
                              {Array.isArray(colors[key])
                                ? colors[key].map((hex, i) => <ColorSwatch key={i} hex={hex} />)
                                : <ColorSwatch hex={colors[key]} />}
                            </div>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <div className="text-center mt-4">
                    {!extracted && (
                      <Button
                        type="submit"
                        className="btn-warning"
                        disabled={loading || !topImage || !bottomImage || !shoesImage}
                      >
                        {loading ? "Analyzing..." : "Extract Colors"}
                      </Button>
                    )}
                    {extracted && (
                      <Button className="btn-success mt-3" onClick={handleNavigateResults}>
                        Check Match Results
                      </Button>
                    )}
                  </div>
                </form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default UploadPage;

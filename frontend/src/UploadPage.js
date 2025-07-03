import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

/* ------------------------------------------------------------
   Resolve API base URL for Vite *or* CRA, with a localhost fallback
------------------------------------------------------------- */
const API_BASE_URL =
  // Vite (`import.meta.env`)
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  // Create‑React‑App (`process.env`)
  process.env.REACT_APP_API_BASE_URL ||
  // final fallback
  "http://localhost:5000";

function UploadPage() {
  /* ─── state ──────────────────────────────────────────────── */
  const [topImage, setTopImage]       = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [shoesImage, setShoesImage]   = useState(null);

  const [preview, setPreview] = useState({ top: null, bottom: null, shoes: null });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  /* ─── helpers ─────────────────────────────────────────────── */
  const handleFileChange = (e, setImage, key) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(prev => ({ ...prev, [key]: URL.createObjectURL(file) }));
    }
  };

  const handleRemoveImage = (setImage, key) => {
    setImage(null);
    setPreview(prev => ({ ...prev, [key]: null }));
  };

  /* ─── form submit ─────────────────────────────────────────── */
  const handleAnalyze = async (e) => {
    e.preventDefault();
    setError("");

    if (!topImage || !bottomImage || !shoesImage) {
      setError("Please upload images for all clothing items.");
      return;
    }

    setLoading(true);
    const data = new FormData();
    data.append("topImage",    topImage);
    data.append("bottomImage", bottomImage);
    data.append("shoesImage",  shoesImage);

    try {
      const res = await axios.post(`${API_BASE_URL}/api/analyze`, data);
      if (res.data?.extractedColors) {
        navigate("/results", {
          state: {
            extractedColors: res.data.extractedColors,
            topImage,
            bottomImage,
            shoesImage,
          },
        });
      } else {
        setError("No colors extracted. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* ─── UI ──────────────────────────────────────────────────── */
  return (
    <div className="transparent-centered-container">
      {/* Navigation bar */}
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about"><Button>About</Button></Link>
            <Link to="/home"><Button>Home</Button></Link>
            <Link to="/logout"><Button>Logout</Button></Link>
          </div>
        </nav>
      </Row>

      {/* Upload form */}
      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Row className="w-100 justify-content-center">
          <Col md={10} lg={7}>
            <Card
              className="text-white"
              style={{ background: "linear-gradient(135deg, rgba(5,3,50,0.8), rgba(151,120,56,0.85))" }}
            >
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}

                <form onSubmit={handleAnalyze}>
                  <Row className="mt-4 text-center justify-content-center">
                    {[
                      { label: "Top",    setter: setTopImage,    key: "top"    },
                      { label: "Bottom", setter: setBottomImage, key: "bottom" },
                      { label: "Shoes",  setter: setShoesImage,  key: "shoes"  },
                    ].map(({ label, setter, key }) => (
                      <Col md={4} key={label}>
                        <Card className="p-3 h-100">
                          <h3 className="card-title text-center mb-4" style={{ textDecoration: "underline" }}>
                            {label}
                          </h3>

                          {preview[key] ? (
                            <div className="text-center">
                              <img
                                src={preview[key]}
                                alt={`${label} Preview`}
                                style={{ width: "75%", height: "175px", borderRadius: "5px", marginBottom: "25px" }}
                              />
                              <Button variant="danger" onClick={() => handleRemoveImage(setter, key)}>
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="custom-file-upload">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleFileChange(e, setter, key)}
                              />
                              Choose File
                            </label>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  <div className="text-center mt-4">
                    <Button
                      type="submit"
                      className="btn-warning"
                      disabled={loading || !topImage || !bottomImage || !shoesImage}
                    >
                      {loading ? "Analyzing..." : "Analyze"}
                    </Button>
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

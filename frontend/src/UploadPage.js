import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function UploadPage() {
  const [topImage, setTopImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [shoeImage, setShoeImage] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState({ top: null, bottom: null, shoes: null });

  const navigate = useNavigate();

  const handleFileChange = (event, setImage, setPreviewKey) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      setPreview((prev) => ({ ...prev, [setPreviewKey]: URL.createObjectURL(file) }));
    }
  };

  const handleRemoveImage = (setImage, setPreviewKey) => {
    setImage(null);
    setPreview((prev) => ({ ...prev, [setPreviewKey]: null }));
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");

    if (!topImage || !bottomImage || !shoeImage) {
      setError("Please upload images for all clothing items.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("topImage", topImage);
    formData.append("bottomImage", bottomImage);
    formData.append("shoeImage", shoeImage);

    try {
      const response = await axios.post("http://localhost:5000/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data && response.data.extractedColors) {
        navigate("/results", {
          state: { extractedColors: response.data.extractedColors },
        });
      } else {
        setError("No colors extracted. Please try again.");
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="transparent-centered-container">
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about"><Button variant="primary">About</Button></Link>
            <Link to="/home"><Button variant="primary">Home</Button></Link>
            <Link to="/logout"><Button variant="primary">Logout</Button></Link>
          </div>
        </nav>
      </Row>

      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Row className="w-100 justify-content-center">
          <Col md={6} lg={5}>
            <Card className=" text-white" style={{ backgroundColor: "rgba(10, 10, 40, 0.9)" }}>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <form onSubmit={handleAnalyze}>
                  <Row className="mt-4">
                    {[
                      { label: "Top", image: topImage, setImage: setTopImage, previewKey: "top" },
                      { label: "Bottom", image: bottomImage, setImage: setBottomImage, previewKey: "bottom" },
                      { label: "Shoes", image: shoeImage, setImage: setShoeImage, previewKey: "shoes" },
                    ].map(({ label, image, setImage, previewKey }) => (
                      <Col md={4} key={label}>
                        <Card className="p-3 h-100">
                          <h3 className="card-title" style={{ textDecoration: "underline", textAlign: "center" }}>{label}</h3>
                          {preview[previewKey] ? (
                            <div className="text-center">
                              <img
                                src={preview[previewKey]}
                                alt={`${label} Preview`}
                                style={{
                                  width: "100%",
                                  height: "100px",
                                  borderRadius: "5px",
                                  marginBottom: "8px",
                                }}
                              />
                              <Button
                                variant="danger"
                                onClick={() => handleRemoveImage(setImage, previewKey)}
                              >
                                Remove
                              </Button>
                            </div>
                          ) : (
                            <label className="custom-file-upload">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) =>
                                  handleFileChange(event, setImage, previewKey)
                                }
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
                      disabled={loading || !topImage || !bottomImage || !shoeImage}
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

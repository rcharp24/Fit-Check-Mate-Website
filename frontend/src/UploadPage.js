import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function UploadPage() {
  // State for storing the selected image files for each clothing part
  const [topImage, setTopImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [shoesImage, setShoeImage] = useState(null);

  // State to store any error messages for display
  const [error, setError] = useState("");

  // Loading state to show "Analyzing..." button text and disable button during async upload
  const [loading, setLoading] = useState(false);

  // State for preview URLs of selected images (created from local files)
  const [preview, setPreview] = useState({ top: null, bottom: null, shoes: null });

  const navigate = useNavigate();

  /**
   * Handles file selection for each clothing part.
   * - Reads the selected file from the event.
   * - Updates corresponding state with the File object.
   * - Creates a temporary URL for preview display.
   */
  const handleFileChange = (event, setImage, setPreviewKey) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
      // Create local preview URL for user feedback
      setPreview((prev) => ({ ...prev, [setPreviewKey]: URL.createObjectURL(file) }));
    }
  };

  /**
   * Removes selected image and clears the preview.
   * - Used for "Remove" buttons under each image preview.
   */
  const handleRemoveImage = (setImage, setPreviewKey) => {
    setImage(null);
    setPreview((prev) => ({ ...prev, [setPreviewKey]: null }));
  };

  /**
   * Handles the form submission for analyzing uploaded images.
   * - Validates that all three images are selected.
   * - Prepares a FormData object with the images.
   * - Sends POST request to backend /api/analyze endpoint.
   * - On success, navigates to results page passing extracted colors.
   * - Shows error message if upload or analysis fails.
   */
  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");

    // Validate that all images are selected before sending request
    if (!topImage || !bottomImage || !shoesImage) {
      setError("Please upload images for all clothing items.");
      return;
    }

    setLoading(true);

    // Prepare FormData for multipart/form-data upload
    const formData = new FormData();
    formData.append("topImage", topImage);
    formData.append("bottomImage", bottomImage);
    formData.append("shoesImage", shoesImage);

    try {
      // Axios POST request to backend analyze route
      const response = await axios.post("http://localhost:5000/api/analyze", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // If backend returns extracted colors, navigate to results page
      if (response.data && response.data.extractedColors) {
  navigate("/results", {
    state: {
      extractedColors: response.data.extractedColors,
      topImage,
      bottomImage,
      shoesImage,
    },
  });
}
 else {
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
      {/* Navigation bar with links */}
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about">
              <Button variant="primary">About</Button>
            </Link>
            <Link to="/home">
              <Button variant="primary">Home</Button>
            </Link>
            <Link to="/logout">
              <Button variant="primary">Logout</Button>
            </Link>
          </div>
        </nav>
      </Row>

      {/* Main container for upload form */}
      <Container
        fluid
        className="vh-100 d-flex flex-column justify-content-center align-items-center"
      >
        <Row className="w-100 justify-content-center">
          <Col md={10} lg={7}>
            <Card className="text-white" style={{ background: "linear-gradient(135deg, rgba(5,3,50,0.8), rgba(151,120,56,0.85))" }}>
              <Card.Body>
                {/* Show error alert if any error */}
                {error && <Alert variant="danger">{error}</Alert>}

                {/* Upload form */}
                <form onSubmit={handleAnalyze}>
                  <Row className="mt-4 text-center justify-content-center">
                    {/* Map through each clothing part for DRY UI */}
                    {[
                      {
                        label: "Top",
                        image: topImage,
                        setImage: setTopImage,
                        previewKey: "top",
                      },
                      {
                        label: "Bottom",
                        image: bottomImage,
                        setImage: setBottomImage,
                        previewKey: "bottom",
                      },
                      {
                        label: "Shoes",
                        image: shoesImage,
                        setImage: setShoeImage,
                        previewKey: "shoes",
                      },
                    ].map(({ label, setImage, previewKey }) => (
                      <Col md={4} key={label}>
                        <Card className="p-3 h-100">
                          <h3
                            className="card-title"
                            style={{ textDecoration: "underline", textAlign: "center", marginBottom: "25px" }}
                          >
                            {label}
                          </h3>

                          {/* Show image preview and remove button if image is selected */}
                          {preview[previewKey] ? (
                            <div className="text-center">
                              <img
                                src={preview[previewKey]}
                                alt={`${label} Preview`}
                                style={{
                                  width: "75%",
                                  height: "175px",
                                  borderRadius: "5px",
                                  marginBottom: "25px",
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
                            // File input label styled as button
                            <label className="custom-file-upload">
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(event) => handleFileChange(event, setImage, previewKey)}
                              />
                              Choose File
                            </label>
                          )}
                        </Card>
                      </Col>
                    ))}
                  </Row>

                  {/* Analyze button, disabled if loading or if images are missing */}
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

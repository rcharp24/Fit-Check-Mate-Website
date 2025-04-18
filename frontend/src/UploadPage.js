import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert, Spinner } from "react-bootstrap";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";

function UploadPage() {
  const [topImage, setTopImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [shoeImage, setShoeImage] = useState(null);
  const [extractedColors, setExtractedColors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (event, setImage) => {
    const file = event.target.files[0];
    const allowedTypes = ["image/jpeg", "image/png", "image/jpg"];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (file) {
      if (!allowedTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a JPG, JPEG, or PNG image.");
        return;
      }
      if (file.size > maxSize) {
        setError("File size too large. Please upload an image smaller than 5MB.");
        return;
      }
      setError("");
      setImage(file);
    }
  };

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleAnalyze = async (event) => {
    event.preventDefault();
    setError("");

    if (!topImage || !bottomImage || !shoeImage) {
      setError("Please upload images for all clothing items.");
      return;
    }

    setLoading(true);

    try {
      const topBase64 = await convertToBase64(topImage);
      const bottomBase64 = await convertToBase64(bottomImage);
      const shoeBase64 = await convertToBase64(shoeImage);

      const response = await axios.post('/api/analyze', {
        topImage: topBase64,
        bottomImage: bottomBase64,
        shoeImage: shoeBase64
      });

      const matchedColors = response.data;
      setExtractedColors(matchedColors);
      navigate("/results", { state: { extractedColors: matchedColors } });
    } catch (error) {
      console.error("Analysis Error:", error);
      setError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Navigation Bar */}
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

      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center">
        <Card className="shadow-lg text-center mb-4" style={{ width: '30%', backgroundColor: 'rgba(10, 10, 40, 0.9)', color: 'white' }}>
          <h2 style={{ fontFamily: "'Dancing Script', cursive", fontSize: "3rem" }}>Upload Pictures</h2>
        </Card>

        <Row className="w-100 justify-content-center">
          <Col md={6} lg={5}>
            <Card className="shadow-lg text-white" style={{ backgroundColor: "rgba(10, 10, 40, 0.9)" }}>
              <Card.Body>
                {error && <Alert variant="danger">{error}</Alert>}
                <form onSubmit={handleAnalyze}>
                  <Row className="mt-4">
                    {["Tops", "Bottoms", "Shoes"].map((category, index) => {
                      const setImage = index === 0 ? setTopImage : index === 1 ? setBottomImage : setShoeImage;
                      const image = index === 0 ? topImage : index === 1 ? bottomImage : shoeImage;
                      return (
                        <Col md={4} key={category}>
                          <Card className="p-3" style={{ backgroundColor: "#1A1A40" }}>
                            <h3 style={{ color: "white" }}>Upload {category}</h3>
                            <label className="custom-file-upload">
                              <input
                                type="file"
                                accept="image/png, image/jpeg, image/jpg"
                                onChange={(event) => handleFileChange(event, setImage)}
                              />
                              Choose file
                            </label>
                            {image && (
                              <>
                                <img
                                  src={URL.createObjectURL(image)}
                                  alt={`${category} preview`}
                                  style={{ width: "100%", height: "auto", marginTop: "10px" }}
                                />
                                <Button
                                  variant="outline-danger"
                                  onClick={() => setImage(null)}
                                  className="mt-2"
                                >
                                  Remove
                                </Button>
                              </>
                            )}
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                  <div className="text-center mt-4">
                    <Button
                      type="submit"
                      className="btn-warning"
                      disabled={loading || !topImage || !bottomImage || !shoeImage}
                    >
                      {loading ? <Spinner animation="border" size="sm" /> : "Analyze"}
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

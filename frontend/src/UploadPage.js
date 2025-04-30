import React, { useState } from "react";
import { Container, Row, Col, Card, Button, Alert } from "react-bootstrap";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function UploadPage() {
  const [topImage, setTopImage] = useState(null);
  const [bottomImage, setBottomImage] = useState(null);
  const [shoeImage, setShoeImage] = useState(null);
  const [dominantColors, setDominantColors] = useState({});
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (event, setImage) => {
    const file = event.target.files[0];
    if (file) {
      setImage(file);
    }
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

      const extractedColors = {
        topImage: response.data.topImage.extracted,
        bottomImage: response.data.bottomImage.extracted,
        shoeImage: response.data.shoeImage.extracted,
      };

      setDominantColors(extractedColors); // Update the state

      navigate("/results", { state: { extractedColors } }); // Navigate to results page with data
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
            <Link to="/logout"><Button variant="primary">Logout</Button></Link>
          </div>
        </nav>
      </Row>

      {/* Main Content */}
      <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center checkered-background">
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
                          <Card className="p-3 h-100">
                            <h3 className="card-title">Upload {category}</h3>
                            <label className="custom-file-upload">
                              <input type="file" accept="image/*" onChange={(event) => handleFileChange(event, setImage)} />
                              Choose File
                            </label>
                            {image && (
                              <>
                                <img src={URL.createObjectURL(image)} alt={`${category} preview`} style={{ width: "100%", height: "auto", marginTop: "10px" }} />
                                <Button variant="outline-danger" onClick={() => setImage(null)} className="mt-2">Remove</Button>
                              </>
                            )}
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                  <div className="text-center mt-4">
                    <Button type="submit" className="btn-warning" disabled={loading || !topImage || !bottomImage || !shoeImage}>
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

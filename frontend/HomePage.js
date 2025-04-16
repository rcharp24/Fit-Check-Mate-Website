import React from 'react';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
const HomePage = () => {
  const navigate = useNavigate();

  return (
    
    <div>
      {/* Navigation Bar */}
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/about"><Button variant="primary">About</Button></Link>
            <Link to="/logout"><Button variant="primary">Logout</Button></Link>
          </div>
        </nav>
      </Row>

      {/* Main Content */}
      <Container fluid className="home-page-container vh-100 d-flex flex-column justify-content-center align-items-center checkered-background overflow-auto">
        {/* Title Section */}
        <Card className="shadow-lg text-center mb-4" style={{ width: '40%', backgroundColor: 'rgba(10, 10, 40, 0.9)', color: 'white' }}>
            <Card.Body>
              <h1 className="main-title" style={{ fontFamily: "'Dancing Script', cursive", fontSize: "4rem" }}>Fit Check Mate</h1>
          
              <p className="lead mb-0">Ready to check your outfit fit?</p>
            </Card.Body>
        </Card>

        {/* Features Section */}
        <Row className="w-75 text-center">
          <Col md={4} className="mb-4">
            <Card className="shadow-lg h-100"> {/* Ensuring equal height */}
              <Card.Body className="d-flex flex-column">
                <h5 className="card-title">Upload Your Outfit</h5>
                <p className="card-text flex-grow-1">Let us check if your outfit matches!</p>
                <Button variant="warning" onClick={() => navigate('/upload')} className="w-100 mt-auto">Upload</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="shadow-lg h-100">
              <Card.Body className="d-flex flex-column">
                <h5 className="card-title">Saved Colors</h5>
                <p className="card-text flex-grow-1">Forgot what colors you saved? Click here to see your previously saved looks.</p>
                <Button variant="warning" onClick={() => navigate('/savedcolors')} className="w-100 mt-auto">See Matches</Button>
              </Card.Body>
            </Card>
          </Col>

          <Col md={4} className="mb-4">
            <Card className="shadow-lg h-100">
              <Card.Body className="d-flex flex-column">
                <h5 className="card-title">Wardrobe Insights</h5>
                <p className="card-text flex-grow-1">Get analytics on your clothing trends & color coordination.</p>
                <Button variant="warning" onClick={() => navigate('/analytics')} className="w-100 mt-auto">View Insights</Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default HomePage;

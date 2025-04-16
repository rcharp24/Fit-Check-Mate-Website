import React from 'react';
import { Container, Row, Button, Col, Card } from 'react-bootstrap';
import { Link } from "react-router-dom";

const AboutPage = () => {
  return (
    <div className="bg-dark text-white min-vh-100 checkered-background d-flex flex-column align-items-center overflow-auto">
      {/* Navbar */}
      <Row className="text-center pt-4">
        <nav>
          <div className="d-flex justify-content-center gap-3">
            <Link to="/home">
              <Button variant="primary" >Home</Button>
            </Link>
            <Link to="/logout">
              <Button variant="primary" >Logout</Button>
            </Link>
          </div>
        </nav>
      </Row>

      {/* Page Title */}
      <Container className="mt-5 d-flex flex-column align-items-center">
        <Row className="w-75 justify-content-center">
          <Col md={8} className="text-center">
            <Card className="shadow-lg p-4 border-0 text-white" style={{ backgroundColor: 'rgba(5,3,50,0.95)', borderRadius: "10px" }}>
              <h2 className="text-white fw-bold" style={{ fontFamily: "'Dancing Script', cursive", fontSize: "3.5rem" }}>
                About Fit Check Mate
              </h2>
            </Card>
          </Col>
        </Row>

        {/* Description */}
        <Row className="w-75 text-center mt-4 p-4">
          <Col>
            <p className="fs-5 text-white" style={{ lineHeight: "1.6", backgroundColor: 'rgba(151, 120, 56, 255)', borderRadius: "10px" }}>
              Fit Check Mate helps you put together stylish outfits by analyzing your wardrobe and giving you matching suggestions. 
              Whether you're planning a special event or just want to look your best every day, we’ve got you covered!
            </p>
          </Col>
        </Row>

        {/* Info Cards */}
        <Row className="w-100 justify-content-center mt-4">
          {[
            { title: "How It Works", text: "Upload an image of your clothes, and we’ll analyze it to suggest complementary pieces to match your style." },
            { title: "Our Mission", text: "We aim to help people build confidence by providing fashion recommendations tailored to their preferences." },
            { title: "Get In Touch", text: "Have questions? Reach out to us and we’ll be happy to assist you!" }
          ].map((item, index) => (
            <Col md={4} sm={6} xs={12} className="mb-4" key={index}>
              <Card className="shadow-lg p-2 border-0 text-center transition-effect" 
                    style={{ backgroundColor: "rgba(20,20,60,0.9)", borderRadius: "10px" }}>
                <Card.Body>
                  <Card.Title className="fw-bold text-white">{item.title}</Card.Title>
                  <Card.Text className="text-white">
                    {item.text}
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </div>
  );
};

export default AboutPage;

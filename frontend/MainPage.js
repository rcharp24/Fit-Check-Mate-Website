import React from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import fcmlogo from './fcmlogo.jpg';

const MainPage = () => {
  return (
    <Container fluid className="vh-100 d-flex flex-column justify-content-center align-items-center overflow-auto">
      <Row className="d-flex justify-content-center align-items-center w-100">
        <Col className="text-center d-flex flex-column justify-content-center align-items-center">
          <img src={fcmlogo} alt="FitCheckMate Logo" style={{ width: '600px', marginBottom: '30px' }} />
        
          <Button variant="primary" size="lg" href="/login" className="mt-3">
            Let's login and get started
          </Button>
        </Col>
      </Row>

      <Row className="mt-5">
        <Col md={13}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title>Why Choose Us?</Card.Title>
              <Card.Text>
                We analyze your clothing and recommend matching outfits based on color, style, and more.
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default MainPage;
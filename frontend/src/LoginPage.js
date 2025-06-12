import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { auth } from './firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import "./App.css";
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Initialize useNavigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, formData.email, formData.password);
      navigate('/home'); // Redirect to home page after successful login
    } catch (err) {
      setError("Invalid email or password.");
    }
  };

  return (
    <div>
      <Container fluid className="vh-100 d-flex justify-content-center align-items-center checkered-background transparent-centered-container" >
        <Row className="w-100 justify-content-center">
          <Col md={5} lg={4}>
            <Card className="shadow-lg text-white" style={{ background: "linear-gradient(135deg, rgba(5,3,50,0.8), rgba(151,120,56,0.85))"}}>
              <div className="text-center">
                <Card style={{ width: '40%', margin: '0 auto', color: 'navy' }}>
                  <h2 className="mb-1 p-1">Login</h2>
                </Card>
              </div>
              <Card.Body>
                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                    />
                  </Form.Group>

                  <Button variant="primary" type="submit" className="w-100">
                    Login
                  </Button>
                </Form>

                {error && (
                  <Alert variant="danger" className="mt-3">
                    {error}
                  </Alert>
                )}

                <div className="d-flex justify-content-between mt-3 gap-2">
                  <Button variant="outline-light" href="/forgot">
                    Forgot Password?
                  </Button>
                  <Button variant="success" href="/register">
                    Register
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;

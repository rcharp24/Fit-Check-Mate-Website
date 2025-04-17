import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert} from 'react-bootstrap';
import { auth } from './firebase';
import { sendPasswordResetEmail } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setMessage] = useState('');
  const [message, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    if (!email) {
      setError("Please enter your email.");
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
      setTimeout(() => {
        navigate("/login"); // Redirect to login after success
      }, 2000); // Wait a bit before navigating
    } catch (err) {
      setError("Error sending password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="vh-100 d-flex justify-content-center align-items-center bg-dark checkered-background overflow-auto">
      <Row className="w-100 justify-content-center">
        <Col md={5} lg={4}>
          <Card className="shadow-lg text-white" style={{ backgroundColor: 'rgba(10, 10, 40, 0.9)' }}>
            {/* Smaller Card Around "Forgot Password" Heading */}
            <div className="text-center">
              <Card style={{ width: '45%', margin: '0 auto', color: 'black' }}>
                <h2 className="mb-1 p-1">Forgot Password</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
              </Card>
            </div>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className=" mb-3 formBasicEmail">
                  <Form.Label>Enter Your Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    
                  />
                </Form.Group>

                <Button
                variant="primary"
                type="submit"
                className="w-100 mt-1"
                disabled={loading}
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </Button>

              </Form>

              <div className="text-center mt-3">
                <Button variant="outline-light" href="/login">
                  Back to Login
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ForgotPassword;

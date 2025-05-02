import { useState } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { Notyf } from 'notyf';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } });
  const navigate = useNavigate();

  const [userDetails, setUserDetails] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errorMessage, setErrorMessage] = useState(null);

  const handleChange = (e) => {
    setUserDetails({
      ...userDetails,
      [e.target.name]: e.target.value,
    });
  };

  const registerUser = async (e) => {
    e.preventDefault();
    setErrorMessage(null);

    const { username, email, password, confirmPassword } = userDetails;

    if (!email.includes("@")) {
      notyf.error("Invalid email format.");
      return;
    }

    if (password.length < 8) {
      notyf.error("Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      notyf.error("Passwords do not match.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed.");
      }

      setUserDetails({ username: "", email: "", password: "", confirmPassword: "" });
      notyf.success("Registration successful! Redirecting to login...");
      setTimeout(() => navigate("/login"), 1500); // Redirect after success

    } catch (error) {
      setErrorMessage(error.message);
      notyf.error(error.message);
    }
  };

  return (
    <Container className="mt-5 register-container">
      <Card className="register-card">
        <Card.Body>
          <h2 className="register-header text-center mb-4">Register</h2>
          {errorMessage && (
            <Alert variant="danger" className="text-center">
              {errorMessage}
            </Alert>
          )}
          <Form onSubmit={registerUser} className="register-form">
            <Form.Group className="mb-3">
              <Form.Label className="register-label">Username</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Enter Username" 
                required
                name="username"
                value={userDetails.username}
                onChange={handleChange}
                className="register-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="register-label">Email</Form.Label>
              <Form.Control 
                type="email" 
                placeholder="Enter Email" 
                required
                name="email"
                value={userDetails.email}
                onChange={handleChange}
                className="register-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="register-label">Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Enter Password" 
                required
                name="password"
                value={userDetails.password}
                onChange={handleChange}
                className="register-input"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="register-label">Confirm Password</Form.Label>
              <Form.Control 
                type="password" 
                placeholder="Confirm Password" 
                required
                name="confirmPassword"
                value={userDetails.confirmPassword}
                onChange={handleChange}
                className="register-input"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="register-button w-100">
              Register
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}

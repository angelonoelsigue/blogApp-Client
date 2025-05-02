import { useState, useEffect, useContext } from 'react';
import { Form, Button, Container, Card, Alert } from 'react-bootstrap';
import { Navigate, useNavigate } from 'react-router-dom';
import { Notyf } from 'notyf';
import UserContext from '../UserContext';

export default function Login() {
  const notyf = new Notyf({ position: { x: 'center', y: 'top' } });
  const { user, setUser } = useContext(UserContext);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    identifier: "", // Accepts email or username
    password: "",
  });

  const [isActive, setIsActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  function authenticate(e) {
    e.preventDefault();
    setErrorMessage(null);

    fetch(`${process.env.REACT_APP_API_URL}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    })
      .then(res => res.json())
      .then(data => {
        if (data.access) {
          localStorage.setItem("token", data.access);
          retrieveUserDetails(data.access);
          setCredentials({ identifier: "", password: "" });
          notyf.success("Successful Login");
        } else {
          notyf.error(data.message || "Login failed.");
          setErrorMessage(data.message || "Incorrect Credentials. Try Again.");
        }
      })
      .catch(() => {
        notyf.error("Server error. Try again later.");
        setErrorMessage("Server error. Please try again later.");
      });
  }

  function retrieveUserDetails(token) {
    fetch(`${process.env.REACT_APP_API_URL}/users/details`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data.user && data.user._id) {
          setUser({ id: data.user._id, isAdmin: data.user.isAdmin });
          localStorage.setItem("userId", data.user._id);
          localStorage.setItem("isAdmin", data.user.isAdmin);
          navigate("/blogs"); // Redirect after successful login
        } else {
          console.error("User details not properly returned.");
        }
      })
      .catch(error => console.error("Error fetching user details:", error));
  }

  useEffect(() => {
    setIsActive(credentials.identifier !== "" && credentials.password !== "");
  }, [credentials]);

  return (
    user.id !== null 
      ? <Navigate to="/blogs" /> 
      : (
          <Container className="mt-5 login-container">
            <Card className="login-card">
              <Card.Body>
                <h2 className="login-header text-center mb-4">Login</h2>
                {errorMessage && (
                  <Alert variant="danger" className="text-center">
                    {errorMessage}
                  </Alert>
                )}

                <Form onSubmit={authenticate} className="login-form">
                  <Form.Group className="mb-3">
                    <Form.Label>Email or Username</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Enter email or username" 
                      required
                      value={credentials.identifier}
                      onChange={(e) =>
                        setCredentials({ 
                          ...credentials, 
                          identifier: e.target.value 
                        })
                      }
                      className="login-input"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Password" 
                      required
                      value={credentials.password}
                      onChange={(e) =>
                        setCredentials({ 
                          ...credentials, 
                          password: e.target.value 
                        })
                      }
                      className="login-input"
                    />
                  </Form.Group>

                  <Button 
                    variant={isActive ? "primary" : "secondary"} 
                    type="submit" 
                    disabled={!isActive}
                    className="login-button w-100"
                  >
                    Login
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Container>
      )
  );
}

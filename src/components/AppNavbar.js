import { useContext } from 'react';
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';
import { Link, NavLink } from 'react-router-dom';
import UserContext from '../UserContext';

export default function AppNavbar() {
  const { user } = useContext(UserContext);
  const authenticated = user && user.id !== null;
  const isAdmin = user && user.isAdmin; // Check if the user is an admin

  return (
    <Navbar expand="lg" bg="dark" variant="dark" className="app-navbar">
      <Container>
        <Navbar.Brand as={Link} to="/blogs" className="app-navbar-brand">
          Blog Hub
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link 
              as={NavLink} 
              to="/blogs" 
              className="nav-link-custom"
            >
              Blogs
            </Nav.Link>
          </Nav>
          <Nav>
            {authenticated ? (
              <>
                {isAdmin && (
                  <Nav.Link
                    as={NavLink}
                    to="/admin"
                    className="nav-link-custom"
                  >
                    Admin Panel
                  </Nav.Link>
                )}
                <Nav.Link 
                  as={NavLink} 
                  to="/logout" 
                  className="nav-link-custom"
                >
                  Logout
                </Nav.Link>
              </>
            ) : (
              <>
                <Nav.Link 
                  as={NavLink} 
                  to="/login" 
                  className="nav-link-custom"
                >
                  Login
                </Nav.Link>
                <Nav.Link 
                  as={NavLink} 
                  to="/register" 
                  className="nav-link-custom"
                >
                  Register
                </Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

import React, { useState } from 'react';
import { Container, Form, Button, Row,Col} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // Use useNavigate instead of useHistory
import axios from 'axios'; // import axios for HTTP requests
import NavigationBar from '../../component/NevigationBar';
import './Login.css';
import AlertModal from '../../Modal/AlertModal';
import Footer from '../../component/Footer';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // For displaying login error messages
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate(); // useNavigate hook to navigate

  const handleLogin = async (event) => {
    event.preventDefault();

    await axios.get("http://localhost:4000/api/route").then(result => {
      console.log(result);
    });


    try {
      const response = await axios.post('/api/auth/login', { username, password });
      // Assuming your backend sends back a token and/or user details in response
      // Save the token in localStorage or in a global state/context
      localStorage.setItem('userToken', response.data.token);
      setError(''); // Clear any previous error
      navigate('/'); // Redirect to the home page or dashboard using navigate
    } catch (err) {
      // Handle errors (e.g., user not found, wrong password)
      setError('Invalid username or password');
    }
  };

  const handleForgotPassword = (event) => {
    event.preventDefault();
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (

<>
  <NavigationBar showLoginButton={false} />
  <div className="login-page"> {/* Changed from Container to div to remove default padding */}
    <Row className="justify-content-center align-items-stretch min-vh-100 m-0"> {/* m-0 removes default margin */}
      <Col xs={12} md={6} className="login-section d-flex align-items-center justify-content-center px-0">
        <Form className="login-form text-center" onSubmit={handleLogin}>
          <h2>Welcome back!</h2>
          <p>Login to get your seats reserved.</p>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form.Group controlId="formBasicEmail" className="mb-3">
          <Form.Control
            type="email"
            placeholder="Email"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </Form.Group>

        <Form.Group controlId="formBasicPassword" className="mb-3">
          <Form.Control
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3 d-flex justify-content-between">
          <Form.Check type="checkbox" label="Remember me" />
          <Link to="/forgot-password" onClick={handleForgotPassword} className="forgot-password">
            Forgot Password?
          </Link>
        </Form.Group>

        <Button variant="primary" type="submit" className="w-100 mb-3">
          Login
        </Button>

        <div className="or-container">
          <div className="line"></div>
            <span className="or-text">or</span>
          <div className="line"></div>
        </div>

        <Button variant="outline-primary" className="mb-4 w-100">
          Login with Google
        </Button>

        <div className="text-center mt-3">
          <span>Don't have an account? </span>
          <Link to="/register" className="register-link">Create one</Link>
        </div>
      </Form>
      </Col>
      <Col md={6} className="image-section p-0 d-none d-md-block"> {/* p-0 removes padding */}
        <img src="src\assets\busLogin.png" alt="Login Visual" className="img-fluid w-100 h-100" /> {/* w-100 and h-100 make the image full width and height */}
      </Col>
    </Row>
  </div>
  <AlertModal 
    show={showModal} 
    handleClose={handleCloseModal} 
    message="Password reset functionality needs to be implemented on the backend."
  />
  <Footer />
</>




  );
};

export default LoginPage;
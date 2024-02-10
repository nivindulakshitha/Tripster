import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
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
      <Container className="login-container d-flex align-items-center justify-content-center">
        <Form className="login-form" onSubmit={handleLogin}>
          <h2 className="text-center mb-4">Login</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form.Group controlId="formBasicEmail" className="mb-3">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formBasicPassword" className="mb-3">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Form.Group>

          <Button variant="primary" type="submit" className="w-100">
            Login
          </Button>

          <div className="text-center mt-3">
            <Link to="/register">Need an account? Register</Link>
          </div>

          <div className="text-center mt-2">
            <Link to="/forgot-password" onClick={handleForgotPassword}>Forgot password?</Link>
          </div>
        </Form>
      </Container>
      <AlertModal 
        show={showModal} 
        handleClose={handleCloseModal} 
        message="Password reset functionality needs to be implemented on the backend."
      />
      <Footer></Footer>
    </>
  );
};

export default LoginPage;

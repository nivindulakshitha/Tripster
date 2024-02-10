import React, { useState } from 'react';
import { Container, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // useNavigate instead of useHistory
import axios from 'axios'; // For sending HTTP requests to your backend
import NavigationBar from '../../component/NevigationBar';
import './Signup.css'; // Assuming you have a separate CSS file for the signup page
import AlertModal from '../../Modal/AlertModal'; // For showing alert modals if needed
import Footer from '../../component/Footer';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // To display any error messages
  const [showModal, setShowModal] = useState(false); // Optional, if you have modal-based alerts
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      // Replace '/api/users/signup' with your actual backend API endpoint for user registration
      const response = await axios.post('/api/users/signup', { name, email, password });
      console.log(response.data); // Handle response data as needed
      // Reset form state
      setName('');
      setEmail('');
      setPassword('');
      setError('');
      // Optionally, show a success modal or navigate to the login page
      // setShowModal(true); // If you want to show a confirmation modal
      navigate('/login'); // Redirect user to login page after successful signup
    } catch (err) {
      // Handle errors such as email already in use, weak password, etc.
      setError(err.response.data.message || 'An error occurred during signup.');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <>
      <NavigationBar showLoginButton={false} />
      <Container className="signup-container d-flex align-items-center justify-content-center">
        <Form className="signup-form" onSubmit={handleSignup}>
          <h2 className="text-center mb-4">Sign Up</h2>
          {error && <div className="alert alert-danger">{error}</div>}
          <Form.Group controlId="formBasicName" className="mb-3">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </Form.Group>

          <Form.Group controlId="formBasicEmail" className="mb-3">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
            Register
          </Button>

          <div className="text-center mt-3">
            Already have an account? <Link to="/login">Login Here</Link>
          </div>
        </Form>
      </Container>
      {showModal && (
        <AlertModal
          show={showModal}
          handleClose={handleCloseModal}
          message="You have successfully signed up! Please log in."
        />
      )}
      <Footer />
    </>
  );
};

export default SignupPage;

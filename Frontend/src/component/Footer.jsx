import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom'; // Import Link from react-router-dom for internal navigation
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook, faWhatsapp, faAppStore, faGooglePlay } from '@fortawesome/free-brands-svg-icons';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Footer.css'; // Import your custom CSS

const Footer = () => {
  return (
    <footer className="custom-footer">
      <Container>
        <Row>
          <Col md={3} sm={6} xs={12} className="footer-section">
            <h5><Link to="/login" className="footer-link">Login</Link></h5> {/* Make "Login" a link */}
            <ul>
              <li><Link to="/send-ticket" className="footer-link">Send Ticket</Link></li> {/* Assuming "/send-ticket" is the route */}
              <li><Link to="/transfer-ticket" className="footer-link">Transfer Ticket</Link></li> {/* Assuming "/transfer-ticket" is the route */}
              <li><Link to="/contact-us" className="footer-link">Contact Us</Link></li> {/* Assuming "/contact-us" is the route */}
            </ul>
          </Col>
          <Col md={3} sm={6} xs={12} className="footer-section">
            <h5>FAQ</h5>
            <ul>
              <li><Link to="/terms-and-conditions" className="footer-link">T & C</Link></li> {/* Assuming "/terms-and-conditions" is the route */}
              <li><Link to="/privacy-policy" className="footer-link">Privacy Policy</Link></li> {/* Assuming "/privacy-policy" is the route */}
            </ul>
          </Col>
          <Col md={3} sm={6} xs={12} className="footer-section">
            <h5>Download On</h5>
            <div className="icon-pack download-icons">
              <a href="https://www.apple.com/app-store/" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faAppStore} size="2x" /></a>
              <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faGooglePlay} size="2x" /></a>
            </div>
            <h5>Connect With Us</h5>
            <div className="icon-pack social-icons">
              <a href="https://www.facebook.com/" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faFacebook} size="2x" /></a>
              <a href="https://www.whatsapp.com/" target="_blank" rel="noopener noreferrer"><FontAwesomeIcon icon={faWhatsapp} size="2x" /></a>
            </div>
          </Col>
          <Col md={3} sm={6} xs={12} className="footer-section">
            <h5>Company Address Here</h5>
            <p>Hotline: 1015</p>
            <p>Email: <a href="mailto:info@example.com" className="footer-email">info@example.com</a></p> {/* Make the email clickable */}
          </Col>
        </Row>
        <Row>
          <Col xs={12} className="text-center mt-3">
            <p>©2024 Company Name. All rights reserved</p>
          </Col>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;

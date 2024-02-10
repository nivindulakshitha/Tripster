// Home.jsx

import React from 'react';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Home.css';
import NavigationBar from '../../component/NevigationBar';
import ReservationForm from '../../component/ReservationForm';
import Footer from '../../component/Footer';

const Home = () => {
const isMobile = window.innerWidth < 768;

  return (
    <Container fluid className="p-0 home">
      <NavigationBar />
      <Container className="mt-5 pt-4">
        <ReservationForm />
      </Container>
      <Footer />
    </Container>
  );
};

export default Home;

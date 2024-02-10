import React, { useState } from 'react';
import { Form, Button, Row, Col, InputGroup, FormControl } from 'react-bootstrap';
import axios from 'axios'; // Import axios for HTTP requests
import './Reservation.css';

const ReservationForm = () => {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    // Construct the reservation data
    const reservationData = {
      from,
      to,
      date,
      time,
    };

    try {
      // Replace '/api/reservations' with your actual backend API endpoint for creating reservations
      const response = await axios.post('/api/reservations', reservationData);
      console.log(response.data); // Handle the response as needed
      // Optionally reset form fields here
      setFrom('');
      setTo('');
      setDate('');
      setTime('');
      // Further actions upon successful submission (e.g., show a success message)
    } catch (error) {
      console.error('Failed to submit reservation:', error);
      // Handle errors, e.g., display an error message to the user
    }
  };

  return (
    <>
      <Form onSubmit={handleSubmit}>
        <h5 className="destination mb-3">Destination</h5>
        <Row>
          <Col xs={12} md={6}>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="From"
                aria-label="From"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
              />
              <Button variant="outline-secondary" id="button-addon1">
                Select
              </Button>
            </InputGroup>
          </Col>
          <Col xs={12} md={6}>
            <InputGroup className="mb-3">
              <FormControl
                placeholder="To"
                aria-label="To"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
              <Button variant="outline-secondary" id="button-addon2">
                Select
              </Button>
            </InputGroup>
          </Col>
        </Row>

        <h5 className="dateTime mb-3">Date & Time</h5>
        <Row>
          <Col xs={12} sm={6}>
            <FormControl
              type="date"
              placeholder="Date"
              aria-label="Date"
              className="mb-3"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Col>
          <Col xs={12} sm={6}>
            <FormControl
              type="time"
              placeholder="Time"
              aria-label="Time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </Col>
        </Row>

        <Button variant="primary" size="lg" className="mb-4 w-100" type="submit">
          Check
        </Button>
      </Form>

      <div className="areYouASection">
        <h5 className="areYouA mb-3">Are you a bus owner?</h5>
        <Button variant="outline-primary" size="lg" className="w-100">
          Add your bus
        </Button>
      </div>
    </>
  );
};

export default ReservationForm;

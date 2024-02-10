import { useState } from 'react'
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './Pages/home/Home';
import LoginPage from './Pages/login/LoginPage';
import SignupPage from './Pages/signup/SignupPage';


function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<SignupPage />} />
        {/* Add other routes here */}
      </Routes>
    </Router>
    </>
  )
}

export default App

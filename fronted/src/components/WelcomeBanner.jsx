import React from 'react';
import { useNavigate } from 'react-router-dom';
import heroImage from '../assets/Imagen.jpeg';
import './WelcomeBanner.css';

export default function WelcomeBanner() {
  const navigate = useNavigate();

  return (
    <div className="welcome-banner">
      <div className="welcome-banner__text">
        <h1 className="welcome-banner__title">¡Bienvenido!</h1>
        <p className="welcome-banner__subtitle">Gracias por ser parte del coro.</p>
        <button type="button" className="welcome-banner__button" onClick={() => navigate('/cantos')}>
          Explorar cantos
        </button>
      </div>

      <div className="welcome-banner__image" style={{ backgroundImage: `url(${heroImage})` }} />
    </div>
  );
}

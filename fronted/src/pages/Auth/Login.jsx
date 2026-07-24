import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Toast from '../../components/Toast.jsx';
import AuthLayout from '../../components/AuthLayout.jsx';
import './Auth.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [correo, setCorreo] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const validate = () => {
    const next = {};
    if (!correo.trim()) next.correo = 'El correo electrónico es obligatorio.';
    else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(correo)) next.correo = 'Ingresa un correo electrónico con una extensión válida (ej. .com, .mx).';
    if (!contrasena) next.contrasena = 'La contraseña es obligatoria.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setEnviando(true);
    try {
      await login(correo, contrasena);
      setShowToast(true);
      setTimeout(() => navigate('/inicio'), 900);
    } catch (err) {
      setErrors({ contrasena: err.message || 'Correo o contraseña incorrectos.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2 className="auth-title">Iniciar sesión</h2>
        <p className="auth-subtitle">Ingresa tus datos para continuar</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="correo">Correo Electrónico</label>
            <input
              id="correo"
              type="email"
              placeholder="Ingrese su correo electrónico"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
            />
            {errors.correo && <span className="field-error">{errors.correo}</span>}
          </div>

          <div className="field">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              placeholder="Ingrese su contraseña"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
            {errors.contrasena && <span className="field-error">{errors.contrasena}</span>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={enviando}>
            {enviando ? 'Ingresando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <p className="auth-footer-link">
          ¿No tienes una cuenta? <Link to="/registro">Regístrate</Link>
        </p>
      </div>

      {showToast && <Toast message="¡Bienvenido! Inicio de sesión exitoso." onDone={() => setShowToast(false)} />}
    </AuthLayout>
  );
}

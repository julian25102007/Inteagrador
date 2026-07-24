import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import Toast from '../../components/Toast.jsx';
import AuthLayout from '../../components/AuthLayout.jsx';
import './Auth.css';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '',
    correo: '',
    contrasena: '',
    confirmar: ''
  });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const onChange = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const validate = () => {
    const next = {};
    if (!form.nombre.trim()) next.nombre = 'El nombre completo es obligatorio.';
    else if (form.nombre.trim().length > 15) next.nombre = 'El nombre no puede superar los 15 caracteres.';
    if (!form.correo.trim()) next.correo = 'El correo electrónico es obligatorio.';
    // Exige un dominio con extensión real de al menos 2 letras (.com, .mx, .edu, etc.),
    // no cualquier texto después del punto.
    else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(form.correo)) next.correo = 'Ingresa un correo electrónico con una extensión válida (ej. .com, .mx).';
    if (!form.contrasena) next.contrasena = 'La contraseña es obligatoria.';
    else if (form.contrasena.length !== 8) next.contrasena = 'La contraseña debe tener exactamente 8 caracteres.';
    if (!form.confirmar) next.confirmar = 'Debes confirmar la contraseña.';
    else if (form.confirmar !== form.contrasena) next.confirmar = 'Las contraseñas no coinciden.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setEnviando(true);
    try {
      // El backend decide el rol automáticamente: si el correo está en la
      // whitelist de coordinadores entra como Coordinador, si no, como Corista.
      await register({
        nombreCompleto: form.nombre,
        correo: form.correo,
        contrasena: form.contrasena
      });
      setShowToast(true);
      setTimeout(() => navigate('/inicio'), 900);
    } catch (err) {
      setErrors({ correo: err.message || 'No se pudo completar el registro.' });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <AuthLayout>
      <div className="auth-card">
        <h2 className="auth-title">Registro de sesión</h2>
        <p className="auth-subtitle">Crea tu cuenta para unirte al coro</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          <div className="field">
            <label htmlFor="nombre">Nombre completo</label>
            <input
              id="nombre"
              type="text"
              placeholder="Ej. Juan Escobar"
              maxLength={15}
              value={form.nombre}
              onChange={onChange('nombre')}
            />
            <span className="field-hint">{form.nombre.length}/15 caracteres</span>
            {errors.nombre && <span className="field-error">{errors.nombre}</span>}
          </div>

          <div className="field">
            <label htmlFor="correo">Correo electrónico</label>
            <input
              id="correo"
              type="email"
              placeholder="Ej. juanescobar753@gmail.com"
              value={form.correo}
              onChange={onChange('correo')}
            />
            {errors.correo && <span className="field-error">{errors.correo}</span>}
          </div>

          <div className="field">
            <label htmlFor="contrasena">Contraseña</label>
            <input
              id="contrasena"
              type="password"
              placeholder="Ej. Juan1234"
              maxLength={8}
              value={form.contrasena}
              onChange={onChange('contrasena')}
            />
            <span className="field-hint">{form.contrasena.length}/8 caracteres</span>
            {errors.contrasena && <span className="field-error">{errors.contrasena}</span>}
          </div>

          <div className="field">
            <label htmlFor="confirmar">Confirmar contraseña</label>
            <input
              id="confirmar"
              type="password"
              placeholder="Ingrese su contraseña"
              maxLength={8}
              value={form.confirmar}
              onChange={onChange('confirmar')}
            />
            {errors.confirmar && <span className="field-error">{errors.confirmar}</span>}
          </div>

          <button type="submit" className="btn btn-primary auth-submit" disabled={enviando}>
            {enviando ? 'Creando cuenta...' : 'Registrarse'}
          </button>
        </form>

        <p className="auth-footer-link">
          ¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link>
        </p>
      </div>

      {showToast && <Toast message="¡Registro exitoso! Tu cuenta ha sido creada correctamente." onDone={() => setShowToast(false)} />}
    </AuthLayout>
  );
}

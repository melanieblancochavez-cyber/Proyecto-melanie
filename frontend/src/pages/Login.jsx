// src/pages/Login.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

function Login() {
  const [nombre_usuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [mensaje, setMensaje] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        nombre_usuario,
        contrasena
      });

      localStorage.setItem('token', response.data.token);
      setMensaje('Inicio de sesión exitoso ✅');

      setTimeout(() => navigate('/grupos'), 800);
    } catch (error) {
      const msg = error.response?.data?.message || 'Error al iniciar sesión';
      setMensaje(msg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}><span style={styles.titleAccent}>Iniciar</span> sesión</h1>
        <p style={styles.subtitle}>Descubre el potencial de una buena organización para tus clases y tus alumnos</p>

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            style={styles.input}
            type="text"
            placeholder="Usuario"
            value={nombre_usuario}
            onChange={(e) => setNombreUsuario(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={contrasena}
            onChange={(e) => setContrasena(e.target.value)}
            required
          />
          <button style={{ ...styles.button, backgroundColor: '#0A4174' }} type="submit">Ingresa a tu cuenta →</button>
          {mensaje && (
            <p style={{ marginTop: '10px', color: mensaje.includes('exitoso') ? 'green' : 'red' }}>{mensaje}</p>
          )}
          <p style={styles.registerText}>¿No tienes una cuenta? <Link to="/registro">Regístrate</Link></p>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    padding: '00px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '50px 40px',
    boxShadow: '0 10px 40px #4E8EA2',
    maxWidth: '500px',
    textAlign: 'center'
  },
  title: {
    fontFamily: "Segoe UI",
    fontSize: '32px',
    fontWeight: '700',
   // marginBottom: '10px',
    marginTop: '10px',

  },
  titleAccent: {
    color: '#083e61',
    fontFamily: "Segoe UI",
    borderBottom:'3px solid #4e8ea2',
  },
  subtitle: {
    fontSize: '14px',
    color: '#454545ff',
    marginBottom: '30px'
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px'
  },
  input: {
    padding: '12px 20px',
    borderRadius: '15px',
    border: '1px solid #ccc',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#e8f0fe'
  },
  button: {
    padding: '12px 15px',
    borderRadius: '30px',
    color: '#ffffffff',
    fontWeight: 'bold',
    fontSize: '14px',
    border: 'none',
    cursor: 'pointer'
  },
  registerText: {
    fontSize: '14px',
    marginTop: '15px'
  }
};

export default Login;

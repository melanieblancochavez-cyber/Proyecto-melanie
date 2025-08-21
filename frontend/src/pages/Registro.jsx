import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Registro() {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contrasena: '',
    nombre: '',
    apellido1: '',
    apellido2: '',
  });

  const [mensaje, setMensaje] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/registrar-profesor', formData);
      setMensaje(res.data.message);
      setFormData({
        nombre_usuario: '',
        contrasena: '',
        nombre: '',
        apellido1: '',
        apellido2: '',
      });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error al registrar';
      setMensaje(msg);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}><span style={styles.titleAccent}>Registro</span> de Profesor</h1>
        <p style={styles.subtitle}>Crea tu cuenta para empezar a organizar tus clases fácilmente</p>

        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            name="nombre_usuario"
            placeholder="Nombre de Usuario"
            value={formData.nombre_usuario}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="password"
            name="contrasena"
            placeholder="Contraseña"
            value={formData.contrasena}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="text"
            name="apellido1"
            placeholder="Apellido 1"
            value={formData.apellido1}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <input
            type="text"
            name="apellido2"
            placeholder="Apellido 2"
            value={formData.apellido2}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <button type="submit" style={{ ...styles.button, backgroundColor: '#0A4174' }}>Registrar</button>
        </form>

        {mensaje && (
          <p style={{ marginTop: '10px', color: mensaje.includes('exitosamente') ? 'green' : 'red' }}>{mensaje}</p>
        )}

        <p style={styles.registerText}>¿Ya tienes una cuenta? <Link to="/login">Inicia sesión</Link></p>
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
    padding: '30px'
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '50px 40px',
    boxShadow: '0 10px 40px #4E8EA2',
    maxWidth: '470px',
    width: '100%',
    textAlign: 'center'
  },
  title: {
    fontFamily: "Segoe UI",
    fontSize: '32px',
    fontWeight: '700',
    marginTop: '10px'
  },
  titleAccent: {
    color: '#083e61',
    fontFamily: "Segoe UI",
    borderBottom: '3px solid #4e8ea2',
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
    color: '#ffffff',
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

export default Registro;

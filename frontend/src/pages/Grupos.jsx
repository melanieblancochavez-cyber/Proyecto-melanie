import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Grupos() {
  const [grupos, setGrupos] = useState([]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState('Sétimo');

  // Modal crear grupo
  const [mostrarModal, setMostrarModal] = useState(false);
  const [nuevoGrupo, setNuevoGrupo] = useState({ nombre_grupo: '', nivel: 'Sétimo' });
  const [guardando, setGuardando] = useState(false);

  const navigate = useNavigate();

  // Obtener id_usuario desde el token JWT guardado
  const getIdUsuario = () => {
    const token = localStorage.getItem('token');
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.id;
    } catch {
      return null;
    }
  };

  const cargarGrupos = async () => {
    const idUsuario = getIdUsuario();
    if (!idUsuario) return;

    try {
      const res = await axios.get(`http://localhost:5000/api/profesor/${idUsuario}/grupos`);
      setGrupos(res.data || []);
    } catch (err) {
      console.error('Error al cargar grupos:', err);
    }
  };

  useEffect(() => {
    cargarGrupos();
  }, []);

  const niveles = ['Sétimo', 'Octavo', 'Noveno', 'Décimo', 'Undécimo'];
  const gruposFiltrados = grupos.filter(g => g.nivel === nivelSeleccionado);

  const abrirModal = () => {
    setNuevoGrupo({ nombre_grupo: '', nivel: nivelSeleccionado });
    setMostrarModal(true);
  };

  const crearGrupo = async (e) => {
    e.preventDefault();
    if (!nuevoGrupo.nombre_grupo.trim()) {
      alert('Escribe un nombre de grupo');
      return;
    }
    const id_usuario = getIdUsuario();
    if (!id_usuario) return alert('Sesión no válida');

    try {
      setGuardando(true);
      // El backend debe aceptar { nombre_grupo, nivel, id_usuario }
      await axios.post('http://localhost:5000/api/grupos', { ...nuevoGrupo, id_usuario });
      setMostrarModal(false);
      setNuevoGrupo({ nombre_grupo: '', nivel: nivelSeleccionado });
      await cargarGrupos();
    } catch (err) {
      console.error('Error al crear grupo:', err);
      alert(err?.response?.data?.message || 'Error al crear grupo');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* ===== Sidebar limpio de niveles (solo texto) ===== */}
      <aside style={styles.sidebar}>
        <h3 style={styles.sidebarTitle}>Niveles</h3>
        <ul style={styles.menuList}>
          {niveles.map((nivel) => (
            <li
              key={nivel}
              style={{
                ...styles.menuItem,
                ...(nivelSeleccionado === nivel ? styles.activeItem : {})
              }}
              onClick={() => setNivelSeleccionado(nivel)}
            >
              {nivel}
            </li>
          ))}
        </ul>
        <button style={styles.newGroupBtn} onClick={abrirModal}>+ Nuevo grupo</button>
      </aside>

      {/* ===== Contenido principal ===== */}
      <main style={styles.main}>
        <div style={styles.card}>
          <div style={styles.header}>
            <h1 style={styles.title}>
              <span style={styles.titleAccent}>{nivelSeleccionado}</span>: grupos
            </h1>
          </div>

          <div style={styles.grid}>
            {gruposFiltrados.map((grupo) => (
              <div
                key={grupo.id_grupo}
                style={styles.grupoCard}
                onClick={() => navigate(`/grupo/${grupo.id_grupo}/tareas`)}
              >
                <img src="/3.png" alt="Grupo" style={styles.grupoIcon} />
                <p style={styles.grupoText}>{grupo.nombre_grupo}</p>
                <p style={styles.grupoNivel}>{grupo.nivel}</p>
              </div>
            ))}
            {gruposFiltrados.length === 0 && (
              <p style={{ marginTop: 10 }}>No hay grupos para este nivel.</p>
            )}
          </div>
        </div>
      </main>

      {/* ===== Modal crear grupo ===== */}
      {mostrarModal && (
        <div style={styles.modalBackdrop} onClick={() => setMostrarModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Crear nuevo grupo</h3>

            <form onSubmit={crearGrupo} style={styles.form}>
              <label style={styles.label}>Nombre del grupo</label>
              <input
                type="text"
                placeholder="Ej. Matemáticas 7C"
                value={nuevoGrupo.nombre_grupo}
                onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, nombre_grupo: e.target.value })}
                style={styles.input}
              />

              <label style={styles.label}>Nivel</label>
              <select
                value={nuevoGrupo.nivel}
                onChange={(e) => setNuevoGrupo({ ...nuevoGrupo, nivel: e.target.value })}
                style={styles.input}
              >
                {niveles.map(n => <option key={n} value={n}>{n}</option>)}
              </select>

              <div style={styles.modalActions}>
                <button
                  type="button"
                  style={styles.btnGhost}
                  onClick={() => setMostrarModal(false)}
                  disabled={guardando}
                >
                  Cancelar
                </button>
                <button type="submit" style={styles.btnPrimary} disabled={guardando}>
                  {guardando ? 'Creando…' : 'Crear'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== Estilos ===== */
const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'Segoe UI',
    backgroundColor: '#fff'
  },

  /* Sidebar limpio */
  sidebar: {
    width: '220px',
    backgroundColor: '#f9fcff',
    padding: '20px',
    borderRight: '1px solid #e0e0e0',
    borderRadius: '12px 0 0 12px',
    boxShadow: '2px 0 6px rgba(0,0,0,0.05)'
  },
  sidebarTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#0A4174',
    marginBottom: '15px',
    paddingBottom: '6px',
    borderBottom: '2px solid #0A4174'
  },
  menuList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  menuItem: {
    padding: '10px 15px',
    marginBottom: '10px',
    borderRadius: '10px',
    cursor: 'pointer',
    fontSize: '15px',
    color: '#0A4174',
    backgroundColor: 'transparent',
    transition: 'all 0.25s ease',
    border: '1px solid transparent'
  },
  activeItem: {
    backgroundColor: '#0A4174',
    color: '#fff',
    fontWeight: 'bold',
    border: '1px solid #0A4174'
  },
  newGroupBtn: {
    width: '100%',
    padding: '10px',
    marginTop: '20px',
    background: 'linear-gradient(90deg, #0A4174, #4a90e2)',
    color: 'white',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 6px 16px rgba(10,65,116,.2)'
  },

  /* Main */
  main: { flex: 1, padding: '24px' },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '20px',
    padding: '40px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.08)',
    maxWidth: '1100px',
    margin: '0 auto'
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: '28px', margin: 0, color: '#0A4174' },
  titleAccent: { borderBottom: '3px solid #4E8EA2' },

  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '24px'
  },
  grupoCard: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    textAlign: 'center',
    cursor: 'pointer',
    boxShadow: '0 6px 18px rgba(0,0,0,0.08)',
    transition: 'transform .12s ease, box-shadow .2s'
  },
  grupoIcon: { width: '200px', height: '100px', marginBottom: '10px' },
  grupoText: { fontWeight: 'bold', color: '#0A4174', margin: 0, fontSize: '18px' },
  grupoNivel: { marginTop: 6, color: '#6b7a8c', fontSize: 14 },

  /* Modal */
  modalBackdrop: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.35)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    width: 420,
    maxWidth: '90vw',
    background: '#fff',
    borderRadius: 12,
    padding: 22,
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    boxSizing: 'border-box'
  },
  modalTitle: { margin: '0 0 12px 0', color: '#0A4174' },
  form: { display: 'flex', flexDirection: 'column', gap: 10 },
  label: { fontWeight: 600, color: '#0A4174' },
  input: {
    width: '100%',
    padding: 10,
    borderRadius: 8,
    border: '1px solid #cfd8dc',
    boxSizing: 'border-box',
    outline: 'none'
  },
  modalActions: { display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  btnPrimary: {
    padding: '10px 14px',
    backgroundColor: '#4E8EA2',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700
  },
  btnGhost: {
    padding: '10px 14px',
    backgroundColor: '#ECEFF1',
    color: '#0A4174',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 700
  }
};

export default Grupos;

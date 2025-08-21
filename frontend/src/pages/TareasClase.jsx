// TareasClase.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const TareasClase = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tareas, setTareas] = useState([]);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [nuevaTarea, setNuevaTarea] = useState({
    titulo: '',
    descripcion: '',
    fecha_entrega: ''
  });
  const [modoEdicion, setModoEdicion] = useState(false);
  const [tareaEditando, setTareaEditando] = useState(null);

  useEffect(() => {
    obtenerTareas();
  }, [id]);

  const obtenerTareas = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/grupo/${id}/tareas`);
      setTareas(res.data);
    } catch (error) {
      console.error('Error al cargar tareas:', error);
    }
  };

  const handleChange = (e) => {
    setNuevaTarea({ ...nuevaTarea, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (modoEdicion && tareaEditando) {
        await axios.put(`http://localhost:5000/api/tareas/${tareaEditando.id_tarea}`, nuevaTarea);
      } else {
        await axios.post('http://localhost:5000/api/tareas', {
          ...nuevaTarea,
          id_grupo: id
        });
      }
      obtenerTareas();
      setNuevaTarea({ titulo: '', descripcion: '', fecha_entrega: '' });
      setMostrarFormulario(false);
      setModoEdicion(false);
      setTareaEditando(null);
    } catch (error) {
      console.error('Error al guardar tarea:', error);
    }
  };

  const eliminarTarea = async (idTarea) => {
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        await axios.delete(`http://localhost:5000/api/tareas/${idTarea}`);
        obtenerTareas();
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    }
  };

  const editarTarea = (tarea) => {
    setNuevaTarea({
      titulo: tarea.titulo,
      descripcion: tarea.descripcion,
      fecha_entrega: tarea.fecha_entrega.slice(0, 10)
    });
    setTareaEditando(tarea);
    setModoEdicion(true);
    setMostrarFormulario(true);
  };

  return (
    <div style={styles.container}>
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Grupo {id}</h2>

        <nav style={styles.nav}>
          <Link to={`/grupo/${id}/planificacion`} style={styles.link}>
            Planificación
          </Link>
          <Link to={`/grupo/${id}/recursos`} style={styles.link}>
            Recursos
          </Link>
          <div style={{ ...styles.link, ...styles.linkActive }}>Tareas</div>
        </nav>

        {/* Botón final */}
        <button style={styles.backBtn} onClick={() => navigate('/grupos')}>
           Volver a grupos
        </button>
      </aside>

      <main style={styles.mainContent}>
        <div style={styles.headerBar}>
          <h2 style={styles.pageTitle}>Tareas del grupo</h2>
          <button
            style={styles.primaryBtn}
            onClick={() => {
              setMostrarFormulario(true);
              setModoEdicion(false);
              setNuevaTarea({ titulo: '', descripcion: '', fecha_entrega: '' });
            }}
          >
            + Crear tarea
          </button>
        </div>

        <div style={styles.contentWrapper}>
          <section style={styles.colLeft}>
            {tareas.length === 0 ? (
              <p>No hay tareas asignadas aún.</p>
            ) : (
              tareas.map((tarea) => (
                <article key={tarea.id_tarea} style={styles.card}>
                  <h3 style={styles.cardTitle}>{tarea.titulo}</h3>
                  <p style={styles.cardText}><strong>Descripción:</strong> {tarea.descripcion}</p>
                  <p style={styles.cardText}>
                    <strong>Fecha de entrega:</strong>{' '}
                    {new Date(tarea.fecha_entrega).toLocaleDateString()}
                  </p>
                  <div style={styles.cardButtons}>
                    <button style={styles.editBtn} onClick={() => editarTarea(tarea)}>Editar</button>
                    <button style={styles.deleteBtn} onClick={() => eliminarTarea(tarea.id_tarea)}>Eliminar</button>
                  </div>
                </article>
              ))
            )}
          </section>

          {mostrarFormulario && (
            <aside style={styles.formSide}>
              <h3 style={{ marginTop: 0 }}>{modoEdicion ? 'Editar tarea' : 'Crear nueva tarea'}</h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  name="titulo"
                  placeholder="Título"
                  value={nuevaTarea.titulo}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
                <textarea
                  name="descripcion"
                  placeholder="Descripción"
                  value={nuevaTarea.descripcion}
                  onChange={handleChange}
                  required
                  style={styles.textarea}
                />
                <input
                  type="date"
                  name="fecha_entrega"
                  value={nuevaTarea.fecha_entrega}
                  onChange={handleChange}
                  required
                  style={styles.input}
                />
                <div style={{ display: 'flex', gap: 10 }}>
                  <button type="submit" style={styles.primaryBtn}>
                    {modoEdicion ? 'Actualizar' : 'Guardar tarea'}
                  </button>
                  <button
                    type="button"
                    style={styles.secondaryBtn}
                    onClick={() => {
                      setMostrarFormulario(false);
                      setModoEdicion(false);
                      setTareaEditando(null);
                    }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </aside>
          )}
        </div>
      </main>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'Segoe UI, system-ui, -apple-system, Arial'
  },
  sidebar: {
    width: 220,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 16,
    alignSelf: 'stretch',
    margin: 16,
    boxShadow: '0 8px 20px rgba(2, 8, 20, 0.06)',
    border: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
    justifyContent: 'space-between'
  },
  sidebarTitle: {
    margin: 0,
    fontSize: 18,
    color: '#0A4174',
    borderBottom: '2px solid #eef2f7',
    paddingBottom: 8,
    fontWeight: 800
  },
  nav: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  link: {
    display: 'block',
    padding: '12px 14px',
    borderRadius: 12,
    textDecoration: 'none',
    color: '#0A4174',
    background: '#ffffff',
    border: '1px solid #e5e7eb',
    transition: 'all .2s ease',
  },
  linkActive: {
    background:
      'linear-gradient(180deg, rgba(71,141,201,0.12) 0%, rgba(71,141,201,0.08) 100%)',
    border: '1px solid #b6d3ec',
    color: '#0A4174',
    fontWeight: 700,
  },
  backBtn: {
    padding: '12px 14px',
    background: 'linear-gradient(90deg, #4e8ea2, #7bbde8)',
    color: 'white',
    border: 'none',
    borderRadius: 12,
    cursor: 'pointer',
    fontWeight: 700,
    textAlign: 'center',
    marginTop: 'auto'
  },
  mainContent: {
    flex: 1,
    padding: 24,
    paddingLeft: 8
  },
  headerBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24
  },
  pageTitle: {
    fontSize: 28,
    color: '#0A4174',
    margin: 0
  },
  primaryBtn: {
    padding: '10px 16px',
    backgroundColor: '#4e8ea2',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 4px 10px rgba(78,142,162,0.24)'
  },
  secondaryBtn: {
    padding: '10px 16px',
    backgroundColor: '#e5e7eb',
    color: '#111827',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 600
  },
  contentWrapper: {
    display: 'grid',
    gridTemplateColumns: '1fr 360px',
    gap: 24
  },
  colLeft: {
    minWidth: 0
  },
  formSide: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 14,
    border: '1px solid #e5e7eb',
    boxShadow: '0 8px 20px rgba(2, 8, 20, 0.06)',
    alignSelf: 'start'
  },
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    boxShadow: '0 6px 18px rgba(2, 8, 20, 0.06)',
    border: '1px solid #e5e7eb',
    marginBottom: 14
  },
  cardTitle: {
    color: '#0A4174',
    marginTop: 0,
    marginBottom: 8
  },
  cardText: {
    margin: '6px 0',
    color: '#374151'
  },
  cardButtons: {
    marginTop: 10,
    display: 'flex',
    gap: 10
  },
  editBtn: {
    backgroundColor: '#4E8EA2',
    border: 'none',
    padding: '8px 12px',
    color: 'white',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600
  },
  deleteBtn: {
    backgroundColor: '#c14953',
    border: 'none',
    padding: '8px 12px',
    color: 'white',
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600
  },
  input: {
    width: '100%',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    border: '1px solid #cfd8e3',
    outline: 'none'
  },
  textarea: {
    width: '100%',
    minHeight: 90,
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
    border: '1px solid #cfd8e3',
    outline: 'none',
    resize: 'vertical'
  }
};

export default TareasClase;

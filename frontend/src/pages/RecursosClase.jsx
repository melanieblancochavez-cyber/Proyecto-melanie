// RecursosClase.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

const RecursosClase = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [recursos, setRecursos] = useState([]);
  const [archivo, setArchivo] = useState(null);
  const [nombre, setNombre] = useState('');
  const [archivoCargado, setArchivoCargado] = useState(false);

  useEffect(() => {
    obtenerRecursos();
  }, [id]);

  const obtenerRecursos = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/grupo/${id}/recursos`);
      setRecursos(res.data);
    } catch (error) {
      console.error('Error al obtener recursos:', error);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!archivo || !nombre) return alert('Completa todos los campos');

    const formData = new FormData();
    formData.append('archivo', archivo);
    formData.append('nombre', nombre);
    formData.append('id_grupo', id);

    try {
      await axios.post('http://localhost:5000/api/recursos', formData);
      setNombre('');
      setArchivo(null);
      setArchivoCargado(false);
      obtenerRecursos();
    } catch (error) {
      console.error('Error al subir archivo:', error);
    }
  };

  const eliminarRecurso = async (idRecurso) => {
    if (!window.confirm('¿Seguro que deseas eliminar este recurso?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/recursos/${idRecurso}`);
      obtenerRecursos();
    } catch (error) {
      console.error('Error al eliminar recurso:', error);
    }
  };

  const getTipoArchivo = (archivoNombre) => {
    const ext = (archivoNombre.split('.').pop() || '').toLowerCase();
    if (['pdf'].includes(ext)) return 'PDF';
    if (['doc', 'docx'].includes(ext)) return 'Word';
    if (['ppt', 'pptx'].includes(ext)) return 'PowerPoint';
    if (['xls', 'xlsx'].includes(ext)) return 'Excel';
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(ext)) return 'Imagen';
    return 'Archivo';
  };

  return (
    <div style={styles.container}>
      {/* Sidebar idéntico al de TareasClase.jsx */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Grupo {id}</h2>

        <nav style={styles.nav}>
          <Link to={`/grupo/${id}/planificacion`} style={styles.link}>Planificación</Link>
          <div style={{ ...styles.link, ...styles.linkActive }}>Recursos</div>
          <Link to={`/grupo/${id}/tareas`} style={styles.link}>Tareas</Link>
        </nav>

        <button style={styles.backBtn} onClick={() => navigate('/grupos')}>
          Volver a grupos
        </button>
      </aside>

      {/* Contenido principal */}
      <main style={styles.mainContent}>
        <div style={styles.headerBar}>
          <h2 style={styles.pageTitle}>Recursos del grupo</h2>
        </div>

        {/* Panel de carga */}
        <section style={styles.uploadPanel}>
          <form onSubmit={handleUpload} style={styles.uploadForm}>
            <input
              type="text"
              placeholder="Nombre del recurso"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              style={styles.input}
            />

            {/* Botón EXACTO + Añadir o crear (no se modifica la UX) */}
            <label style={styles.addLabel}>
              <span>+ Añadir o crear</span>
              <input
                type="file"
                style={styles.hiddenFile}
                onChange={(e) => {
                  setArchivo(e.target.files?.[0] || null);
                  setArchivoCargado(!!e.target.files?.[0]);
                }}
              />
            </label>

            <button type="submit" style={styles.primaryBtn}>
              Subir recurso
            </button>
          </form>

          {archivoCargado && (
            <div style={styles.fileChip}>
              Archivo cargado
            </div>
          )}
        </section>

        {/* Listado en cuadrícula */}
        <section style={styles.grid}>
          {recursos.length === 0 ? (
            <div style={styles.emptyBox}>No hay recursos todavía.</div>
          ) : (
            recursos.map((r) => (
              <article key={r.id_recurso} style={styles.card}>
                <div style={styles.cardHeader}>
                  <span style={styles.badge}>{getTipoArchivo(r.archivo)}</span>
                </div>

                <h4 style={styles.cardTitle}>{r.nombre}</h4>

                <div style={styles.cardActions}>
                  <a
                    href={`http://localhost:5000/uploads/${r.archivo}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={styles.viewBtn}
                  >
                    Ver
                  </a>
                  <button
                    onClick={() => eliminarRecurso(r.id_recurso)}
                    style={styles.deleteBtn}
                  >
                    Eliminar
                  </button>
                </div>
              </article>
            ))
          )}
        </section>
      </main>
    </div>
  );
};

/* ===== Estilos compartidos con Tareas (mismo layout/menú) ===== */
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
    marginBottom: 16
  },
  pageTitle: {
    fontSize: 28,
    color: '#0A4174',
    margin: 0
  },

  /* Panel de carga */
  uploadPanel: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    boxShadow: '0 8px 20px rgba(2, 8, 20, 0.06)',
    padding: 16,
    marginBottom: 18
  },
  uploadForm: {
    display: 'grid',
    gridTemplateColumns: '1fr auto auto',
    gap: 12,
    alignItems: 'center'
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 10,
    border: '1px solid #cfd8e3',
    outline: 'none'
  },
  addLabel: {
    border: '1px solid #cfd8e3',
    padding: '11px 16px',
    borderRadius: 24,
    backgroundColor: '#fff',
    cursor: 'pointer',
    fontWeight: 700,
    color: '#1663cc',
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  hiddenFile: { display: 'none' },
  primaryBtn: {
    padding: '11px 16px',
    backgroundColor: '#4e8ea2',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    cursor: 'pointer',
    fontWeight: 700,
    boxShadow: '0 4px 10px rgba(78,142,162,0.24)',
    whiteSpace: 'nowrap'
  },
  fileChip: {
    marginTop: 10,
    display: 'inline-block',
    padding: '6px 10px',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    fontWeight: 700,
    borderRadius: 20,
    border: '1px solid #cde9d6'
  },

  /* Grid de recursos */
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
    gap: 16
  },
  emptyBox: {
    gridColumn: '1 / -1',
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    padding: 16,
    color: '#6b7280',
    textAlign: 'center'
  },
  card: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 12,
    boxShadow: '0 6px 18px rgba(2, 8, 20, 0.06)',
    padding: 14,
    display: 'flex',
    flexDirection: 'column',
    gap: 10
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'flex-end'
  },
  badge: {
    fontSize: 12,
    fontWeight: 800,
    color: '#0A4174',
    background: 'rgba(71,141,201,0.12)',
    padding: '4px 8px',
    borderRadius: 999,
    border: '1px solid #b6d3ec'
  },
  cardTitle: {
    margin: 0,
    color: '#0A4174',
    fontSize: 16,
    lineHeight: 1.2
  },
  cardActions: {
    marginTop: 'auto',
    display: 'flex',
    gap: 10
  },
  viewBtn: {
    textDecoration: 'none',
    backgroundColor: '#4e8ea2',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 8,
    fontWeight: 700,
    textAlign: 'center'
  },
  deleteBtn: {
    backgroundColor: '#c14953',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: 8,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 700
  }
};

export default RecursosClase;

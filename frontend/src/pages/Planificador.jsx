// Planificador.jsx 
import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';

import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import esES from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Typography, Button, MenuItem, Select, InputLabel, FormControl
} from '@mui/material';

const locales = { es: esES };
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

/* --- Botones estilo primario (como “Crear evento”) --- */
const primaryBtnStyle = {
  background: '#4e8ea2',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '8px 14px',
  fontWeight: 700,
  cursor: 'pointer',
  boxShadow: '0 4px 10px rgba(78,142,162,0.24)',
  textTransform: 'none'
};
const ghostBtnStyle = {
  ...primaryBtnStyle,
  background: '#f3f6f9',
  color: '#0A4174',
  boxShadow: 'none',
  border: '1px solid #e5e7eb'
};

/* --- Toolbar personalizada para estilos de navegación y vistas --- */
function CustomToolbar({ label, onNavigate, onView, view }) {
  const viewBtn = (name, v) => (
    <button
      key={v}
      onClick={() => onView(v)}
      style={view === v ? primaryBtnStyle : ghostBtnStyle}
    >
      {name}
    </button>
  );

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: 12,
      marginBottom: 12
    }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <button style={ghostBtnStyle} onClick={() => onNavigate('TODAY')}>Hoy</button>
        <button style={ghostBtnStyle} onClick={() => onNavigate('PREV')}>Anterior</button>
        <button style={ghostBtnStyle} onClick={() => onNavigate('NEXT')}>Siguiente</button>
      </div>

      <div style={{ fontWeight: 800, color: '#0A4174' }}>{label}</div>

      <div style={{ display: 'flex', gap: 8 }}>
        {viewBtn('Mes', Views.MONTH)}
        {viewBtn('Semana', Views.WEEK)}
        {viewBtn('Día', Views.DAY)}
        {viewBtn('Agenda', Views.AGENDA)}
      </div>
    </div>
  );
}

const Planificador = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [eventos, setEventos] = useState([]);
  const [eventoSel, setEventoSel] = useState(null);
  const [modalDetalle, setModalDetalle] = useState(false);
  const [modalCrear, setModalCrear] = useState(false);
  const [fechaSeleccionada, setFechaSeleccionada] = useState(null);

  // crear
  const [formData, setFormData] = useState({ titulo: '', descripcion: '', hora_inicio: '', hora_fin: '' });

  // editar
  const [editData, setEditData] = useState({
    id_evento: null,
    titulo: '',
    descripcion: '',
    fecha_evento: '',
    hora_inicio: '',
    hora_fin: '',
    estado: 'sin_estado'
  });

  // Colores por estado (reservados)
  const colorPorEstado = useMemo(() => ({
    pendiente: '#FFCC80',   // naranja pastel
    en_proceso: '#FFD54F',  // amarillo
    realizado: '#A5D6A7'    // verde claro
  }), []);

  // Paleta para color aleatorio por defecto (evitando reservados)
  const paletaAleatoria = useMemo(() => [
    '#90CAF9', '#F48FB1', '#CE93D8', '#B39DDB', '#80CBC4',
    '#81D4FA', '#EF9A9A', '#B0BEC5', '#A1887F', '#E6EE9C'
  ].filter(c => !['#A5D6A7', '#FFD54F', '#FFCC80'].includes(c)), []);

  const colorAleatorioParaId = (id) => {
    const lista = paletaAleatoria;
    if (!lista.length) return '#90CAF9';
    const idx = Math.abs(Number(id || 0)) % lista.length;
    return lista[idx];
  };

  useEffect(() => { obtenerEventos(); }, [id]);

  const obtenerEventos = async () => {
    try {
      const res = await axios.get(`http://localhost:5000/api/grupo/${id}/planificador`);
      const eventosFmt = res.data
        .filter(e => e && e.titulo && e.fecha_evento && e.hora_inicio && e.hora_fin)
        .map(e => {
          const start = new Date(`${e.fecha_evento}T${e.hora_inicio}:00`);
          const end   = new Date(`${e.fecha_evento}T${e.hora_fin}:00`);
          if (isNaN(start) || isNaN(end)) return null;
          const estado = e.estado ?? 'sin_estado'; // ← por defecto sin estado
          return {
            id: e.id_evento,
            title: e.titulo,
            start,
            end,
            descripcion: e.descripcion,
            estado,
            fecha_evento: e.fecha_evento,
            hora_inicio: e.hora_inicio,
            hora_fin: e.hora_fin
          };
        })
        .filter(Boolean);
      setEventos(eventosFmt);
    } catch (err) {
      console.error('Error al obtener eventos:', err);
    }
  };

  const handleSelectSlot = info => {
    setFechaSeleccionada(info.start);
    setModalCrear(true);
  };

  const handleSelectEvent = e => {
    setEventoSel(e);
    setEditData({
      id_evento: e.id,
      titulo: e.title,
      descripcion: e.descripcion || '',
      fecha_evento: e.fecha_evento ?? e.start.toISOString().slice(0,10),
      hora_inicio: e.hora_inicio ?? e.start.toTimeString().slice(0,5),
      hora_fin: e.hora_fin ?? e.end.toTimeString().slice(0,5),
      estado: e.estado ?? 'sin_estado'
    });
    setModalDetalle(true);
  };

  const handleCrearEvento = async () => {
    const { titulo, descripcion, hora_inicio, hora_fin } = formData;
    if (!titulo || !hora_inicio || !hora_fin || !fechaSeleccionada) return;

    const fecha_evento = fechaSeleccionada.toISOString().split('T')[0];
    try {
      // Enviamos 'sin_estado' para mantener color aleatorio hasta que lo cambies (si tu backend lo ignora, igual funciona).
      await axios.post('http://localhost:5000/api/planificador', {
        titulo, descripcion, hora_inicio, hora_fin, fecha_evento, id_grupo: id, estado: 'sin_estado'
      }).catch(() => Promise.resolve());
      setFormData({ titulo: '', descripcion: '', hora_inicio: '', hora_fin: '' });
      setModalCrear(false);
      obtenerEventos();
    } catch (err) {
      console.error('Error al crear evento:', err);
    }
  };

  const handleGuardarCambios = async () => {
    const { id_evento, titulo, descripcion, fecha_evento, hora_inicio, hora_fin, estado } = editData;
    if (!id_evento || !titulo || !fecha_evento || !hora_inicio || !hora_fin) return;

    try {
      await axios.put(`http://localhost:5000/api/planificador/${id_evento}`, {
        titulo, descripcion, fecha_evento, hora_inicio, hora_fin, estado
      }).catch(() => Promise.resolve()); // por si el backend aún no acepta estado
      setModalDetalle(false);
      obtenerEventos();
    } catch (err) {
      console.error('Error al actualizar evento:', err);
    }
  };

  const handleEliminar = async () => {
    if (!eventoSel?.id) return;
    if (!window.confirm('¿Eliminar este evento?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/planificador/${eventoSel.id}`);
      setModalDetalle(false);
      obtenerEventos();
    } catch (err) {
      console.error('Error al eliminar evento:', err);
    }
  };

  // >>> AQUÍ está el cambio clave del color por defecto:
  const eventStyleGetter = event => {
    const base = {
      borderRadius: '6px',
      color: '#0b2033',
      fontSize: '0.8rem',
      padding: '4px',
      fontWeight: 'bold',
      border: '1px solid rgba(0,0,0,0.05)'
    };

    let backgroundColor;
    if (event.estado === 'realizado') backgroundColor = colorPorEstado.realizado;
    else if (event.estado === 'en_proceso') backgroundColor = colorPorEstado.en_proceso;
    else if (event.estado === 'pendiente') backgroundColor = colorPorEstado.pendiente;
    else backgroundColor = colorAleatorioParaId(event.id); // sin_estado → aleatorio (evita reservados)

    return { style: { ...base, backgroundColor } };
  };

  return (
    <div style={styles.container}>
      {/* Sidebar igual al de Tareas/Recursos */}
      <aside style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>Grupo {id}</h2>

        <nav style={styles.nav}>
          <div style={{ ...styles.link, ...styles.linkActive }}>Planificación</div>
          <Link to={`/grupo/${id}/recursos`} style={styles.link}>Recursos</Link>
          <Link to={`/grupo/${id}/tareas`} style={styles.link}>Tareas</Link>
        </nav>

        <button style={styles.backBtn} onClick={() => navigate('/grupos')}>
          Volver a grupos
        </button>
      </aside>

      {/* Contenido principal */}
      <main style={styles.mainContent}>
        <div style={styles.headerBar}>
          <h2 style={styles.pageTitle}>Calendario de eventos</h2>
          <button
            style={primaryBtnStyle}
            onClick={() => { setFechaSeleccionada(new Date()); setModalCrear(true); }}
          >
            + Crear evento
          </button>
        </div>

        <section style={styles.calendarCard}>
          <Calendar
            localizer={localizer}
            events={eventos}
            startAccessor="start"
            endAccessor="end"
            views={['month', 'week', 'day', 'agenda']}
            defaultView="month"
            defaultDate={new Date()}
            step={30}
            timeslots={2}
            selectable
            components={{ toolbar: CustomToolbar }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            eventPropGetter={eventStyleGetter}
            style={{ height: '74vh' }}
            messages={{
              month: 'Mes',
              week: 'Semana',
              day: 'Día',
              agenda: 'Agenda',
              date: 'Fecha',
              time: 'Hora',
              event: 'Evento',
              next: 'Siguiente',
              previous: 'Anterior',
              today: 'Hoy',
              noEventsInRange: 'No hay eventos en este rango',
              showMore: total => `+ Ver más (${total})`
            }}
          />
        </section>
      </main>

      {/* Modal crear */}
      <Dialog open={modalCrear} onClose={() => setModalCrear(false)} fullWidth>
        <DialogTitle>Crear evento {fechaSeleccionada ? `para ${fechaSeleccionada.toLocaleDateString()}` : ''}</DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            fullWidth
            margin="dense"
            value={formData.titulo}
            onChange={e => setFormData({ ...formData, titulo: e.target.value })}
          />
          <TextField
            label="Descripción"
            fullWidth
            margin="dense"
            value={formData.descripcion}
            onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
          />
          <TextField
            label="Hora inicio"
            type="time"
            fullWidth
            margin="dense"
            value={formData.hora_inicio}
            onChange={e => setFormData({ ...formData, hora_inicio: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hora fin"
            type="time"
            fullWidth
            margin="dense"
            value={formData.hora_fin}
            onChange={e => setFormData({ ...formData, hora_fin: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalCrear(false)}>Cancelar</Button>
          <Button onClick={handleCrearEvento} variant="contained">Crear evento</Button>
        </DialogActions>
      </Dialog>

      {/* Modal detalle / editar */}
      <Dialog open={modalDetalle} onClose={() => setModalDetalle(false)} fullWidth>
        <DialogTitle>Editar evento</DialogTitle>
        <DialogContent>
          <TextField
            label="Título"
            fullWidth
            margin="dense"
            value={editData.titulo}
            onChange={e => setEditData({ ...editData, titulo: e.target.value })}
          />
          <TextField
            label="Descripción"
            fullWidth
            margin="dense"
            value={editData.descripcion}
            onChange={e => setEditData({ ...editData, descripcion: e.target.value })}
          />
          <TextField
            label="Fecha"
            type="date"
            fullWidth
            margin="dense"
            value={editData.fecha_evento}
            onChange={e => setEditData({ ...editData, fecha_evento: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hora inicio"
            type="time"
            fullWidth
            margin="dense"
            value={editData.hora_inicio}
            onChange={e => setEditData({ ...editData, hora_inicio: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />
          <TextField
            label="Hora fin"
            type="time"
            fullWidth
            margin="dense"
            value={editData.hora_fin}
            onChange={e => setEditData({ ...editData, hora_fin: e.target.value })}
            InputLabelProps={{ shrink: true }}
          />

          <FormControl fullWidth margin="dense">
            <InputLabel id="estado-label">Estado</InputLabel>
            <Select
              labelId="estado-label"
              label="Estado"
              value={editData.estado}
              onChange={(e) => setEditData({ ...editData, estado: e.target.value })}
            >
              <MenuItem value="sin_estado">Sin estado</MenuItem>
              <MenuItem value="pendiente">Pendiente</MenuItem>
              <MenuItem value="en_proceso">En proceso</MenuItem>
              <MenuItem value="realizado">Realizado</MenuItem>
            </Select>
          </FormControl>

          {eventoSel && (
            <div style={{ marginTop: 8, fontSize: 13, color: '#4b5563' }}>
              <strong>Vista previa:</strong>{' '}
              {new Date(eventoSel.start).toLocaleString()} — {new Date(eventoSel.end).toLocaleString()}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleEliminar}>Eliminar</Button>
          <Button onClick={() => setModalDetalle(false)}>Cancelar</Button>
          <Button onClick={handleGuardarCambios} variant="contained">Guardar cambios</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

/* ===== Estilos (idénticos a Tareas/Recursos) ===== */
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
  calendarCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #e5e7eb',
    borderRadius: 14,
    boxShadow: '0 8px 20px rgba(2, 8, 20, 0.06)',
    padding: 10
  }
};

export default Planificador;

// server.js
const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//Conexión MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'nuva'
});

db.connect(err => {
  if (err) {
    console.error('❌ Error al conectar con MySQL:', err);
    return;
  }
  console.log('✅ Conectado a MySQL');
});

// Login
app.post('/api/login', (req, res) => {
  const { nombre_usuario, contrasena } = req.body;
  db.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario], async (err, results) => {
    if (err || results.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

    const usuario = results[0];
    const match = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!match) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign({ id: usuario.id_usuario, rol: usuario.rol }, 'secreto_super_seguro', { expiresIn: '1h' });
    res.json({ token, rol: usuario.rol });
  });
});

// Registro de profesor
app.post('/api/registrar-profesor', async (req, res) => {
  const { nombre_usuario, contrasena, nombre, apellido1, apellido2 } = req.body;
  if (!nombre_usuario || !contrasena || !nombre || !apellido1 || !apellido2) {
    return res.status(400).json({ message: 'Faltan campos' });
  }

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    db.query(
      'INSERT INTO usuarios (nombre_usuario, contrasena, rol) VALUES (?, ?, ?)',
      [nombre_usuario, hashedPassword, 'profesor'],
      (err, result) => {
        if (err) return res.status(500).json({ message: 'Error al registrar usuario' });

        const id_usuario = result.insertId;
        db.query(
          'INSERT INTO profesores (id_usuario, nombre, apellido1, apellido2) VALUES (?, ?, ?, ?)',
          [id_usuario, nombre, apellido1, apellido2],
          err2 => {
            if (err2) return res.status(500).json({ message: 'Error al registrar profesor' });
            res.status(200).json({ message: 'Profesor registrado' });
          }
        );
      }
    );
  } catch (err) {
    res.status(500).json({ message: 'Error del servidor' });
  }
});

/* =========================================================
   📚 GRUPOS (listado por profesor + crear/editar/eliminar)
   ========================================================= */

// Obtener grupos de un profesor (ya existente)
app.get('/api/profesor/:id_usuario/grupos', (req, res) => {
  const sql = `
    SELECT g.* FROM grupos g
    JOIN profesores p ON g.id_profesor = p.id_profesor
    WHERE p.id_usuario = ?
  `;
  db.query(sql, [req.params.id_usuario], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener grupos' });
    res.json(results);
  });
});

// ➕ Crear grupo (el profesor crea grupos)
// Espera: { nombre_grupo, nivel, id_usuario }
// Busca id_profesor a partir de id_usuario, valida duplicados por (nombre_grupo, nivel, id_profesor)
app.post('/api/grupos', (req, res) => {
  const { nombre_grupo, nivel, id_usuario } = req.body;
  if (!nombre_grupo || !nivel || !id_usuario) {
    return res.status(400).json({ message: 'Faltan campos' });
  }

  const sqlProfesor = 'SELECT id_profesor FROM profesores WHERE id_usuario = ?';
  db.query(sqlProfesor, [id_usuario], (err, rows) => {
    if (err || rows.length === 0) {
      return res.status(404).json({ message: 'Profesor no encontrado' });
    }
    const id_profesor = rows[0].id_profesor;

    // Chequeo de duplicado
    const sqlDup = 'SELECT 1 FROM grupos WHERE nombre_grupo = ? AND nivel = ? AND id_profesor = ? LIMIT 1';
    db.query(sqlDup, [nombre_grupo, nivel, id_profesor], (err2, dup) => {
      if (err2) return res.status(500).json({ message: 'Error validando grupo' });
      if (dup.length > 0) return res.status(400).json({ message: 'Ya existe un grupo con ese nombre y nivel' });

      const sqlIns = 'INSERT INTO grupos (nombre_grupo, nivel, id_profesor) VALUES (?, ?, ?)';
      db.query(sqlIns, [nombre_grupo, nivel, id_profesor], (err3, result) => {
        if (err3) return res.status(500).json({ message: 'Error al crear grupo' });
        res.status(201).json({ message: 'Grupo creado', id_grupo: result.insertId });
      });
    });
  });
});

// ✏️ Editar nombre/nivel de un grupo del profesor
// Espera: { nombre_grupo, nivel }
app.put('/api/grupos/:id_grupo', (req, res) => {
  const { nombre_grupo, nivel } = req.body;
  if (!nombre_grupo || !nivel) return res.status(400).json({ message: 'Faltan campos' });

  const sql = 'UPDATE grupos SET nombre_grupo = ?, nivel = ? WHERE id_grupo = ?';
  db.query(sql, [nombre_grupo, nivel, req.params.id_grupo], err => {
    if (err) return res.status(500).json({ message: 'Error al actualizar grupo' });
    res.json({ message: 'Grupo actualizado' });
  });
});

// 🗑️ Eliminar grupo
app.delete('/api/grupos/:id_grupo', (req, res) => {
  db.query('DELETE FROM grupos WHERE id_grupo = ?', [req.params.id_grupo], err => {
    if (err) return res.status(500).json({ message: 'Error al eliminar grupo' });
    res.json({ message: 'Grupo eliminado' });
  });
});

/* ======================
   ✅ TAREAS (sin cambios)
   ====================== */
app.post('/api/tareas', (req, res) => {
  const { titulo, descripcion, fecha_entrega, id_grupo } = req.body;
  if (!titulo || !fecha_entrega || !id_grupo) return res.status(400).json({ message: 'Faltan campos' });

  const verificar = 'SELECT * FROM tareas WHERE titulo = ? AND id_grupo = ?';
  db.query(verificar, [titulo, id_grupo], (err, result) => {
    if (result?.length > 0) return res.status(400).json({ message: 'Tarea duplicada' });

    const insertar = 'INSERT INTO tareas (titulo, descripcion, fecha_entrega, id_grupo) VALUES (?, ?, ?, ?)';
    db.query(insertar, [titulo, descripcion || '', fecha_entrega, id_grupo], err2 => {
      if (err2) return res.status(500).json({ message: 'Error al guardar tarea' });
      res.status(200).json({ message: 'Tarea guardada' });
    });
  });
});

app.get('/api/grupo/:id_grupo/tareas', (req, res) => {
  db.query('SELECT * FROM tareas WHERE id_grupo = ? ORDER BY fecha_entrega ASC', [req.params.id_grupo], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener tareas' });
    res.json(results);
  });
});

app.put('/api/tareas/:id', (req, res) => {
  const { titulo, descripcion, fecha_entrega } = req.body;
  db.query(
    'UPDATE tareas SET titulo = ?, descripcion = ?, fecha_entrega = ? WHERE id_tarea = ?',
    [titulo, descripcion, fecha_entrega, req.params.id],
    err => {
      if (err) return res.status(500).json({ message: 'Error al actualizar tarea' });
      res.json({ message: 'Tarea actualizada' });
    }
  );
});

app.delete('/api/tareas/:id', (req, res) => {
  db.query('DELETE FROM tareas WHERE id_tarea = ?', [req.params.id], err => {
    if (err) return res.status(500).json({ message: 'Error al eliminar tarea' });
    res.json({ message: 'Tarea eliminada' });
  });
});

/*RECURSOS (uploads/files) */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = 'uploads/';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir);
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});
const upload = multer({ storage });

app.post('/api/recursos', upload.single('archivo'), (req, res) => {
  const { nombre, id_grupo } = req.body;
  const archivo = req.file?.filename;
  if (!archivo || !nombre || !id_grupo) return res.status(400).json({ message: 'Faltan campos' });

  db.query('INSERT INTO recursos (nombre, archivo, id_grupo) VALUES (?, ?, ?)', [nombre, archivo, id_grupo], err => {
    if (err) return res.status(500).json({ message: 'Error al guardar recurso' });
    res.status(200).json({ message: 'Recurso subido' });
  });
});

app.get('/api/grupo/:id_grupo/recursos', (req, res) => {
  db.query('SELECT * FROM recursos WHERE id_grupo = ? ORDER BY id_recurso DESC', [req.params.id_grupo], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener recursos' });
    res.json(results);
  });
});

app.delete('/api/recursos/:id', (req, res) => {
  db.query('SELECT archivo FROM recursos WHERE id_recurso = ?', [req.params.id], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ message: 'No encontrado' });
    const filePath = path.join(__dirname, 'uploads', rows[0].archivo);
    fs.unlink(filePath, () => {});
    db.query('DELETE FROM recursos WHERE id_recurso = ?', [req.params.id], err2 => {
      if (err2) return res.status(500).json({ message: 'Error al eliminar recurso' });
      res.json({ message: 'Recurso eliminado' });
    });
  });
});

/* PLANIFICADOR (estado)*/

// Crear evento (estado por defecto 'pendiente' si no viene)
app.post('/api/planificador', (req, res) => {
  const { titulo, descripcion, fecha_evento, hora_inicio, hora_fin, id_grupo, estado } = req.body;
  if (!titulo || !fecha_evento || !hora_inicio || !hora_fin || !id_grupo) {
    return res.status(400).json({ message: 'Faltan campos' });
  }
  const fecha_creacion = new Date().toISOString().split('T')[0];

  const sql = `
    INSERT INTO planificador (titulo, descripcion, fecha_evento, hora_inicio, hora_fin, fecha_creacion, id_grupo, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  db.query(
    sql,
    [titulo, descripcion || '', fecha_evento, hora_inicio, hora_fin, fecha_creacion, id_grupo, estado || 'pendiente'],
    err => {
      if (err) {
        console.error('❌ Error al guardar evento:', err);
        return res.status(500).json({ message: 'Error al guardar evento' });
      }
      res.status(200).json({ message: 'Evento creado' });
    }
  );
});

// Leer eventos (formateado + estado)
app.get('/api/grupo/:id_grupo/planificador', (req, res) => {
  const sql = `
    SELECT 
      id_evento,
      titulo,
      descripcion,
      DATE_FORMAT(fecha_evento, '%Y-%m-%d') AS fecha_evento,
      DATE_FORMAT(hora_inicio,  '%H:%i')   AS hora_inicio,
      DATE_FORMAT(hora_fin,     '%H:%i')   AS hora_fin,
      DATE_FORMAT(fecha_creacion, '%Y-%m-%d') AS fecha_creacion,
      id_grupo,
      estado
    FROM planificador
    WHERE id_grupo = ?
    ORDER BY fecha_evento, hora_inicio
  `;
  db.query(sql, [req.params.id_grupo], (err, results) => {
    if (err) return res.status(500).json({ message: 'Error al obtener eventos' });
    res.json(results);
  });
});

// Editar evento (título, desc, fecha, horas y estado)
app.put('/api/planificador/:id_evento', (req, res) => {
  const { titulo, descripcion, fecha_evento, hora_inicio, hora_fin, estado } = req.body;
  if (!titulo || !fecha_evento || !hora_inicio || !hora_fin) {
    return res.status(400).json({ message: 'Faltan campos' });
  }

  const sql = `
    UPDATE planificador
    SET titulo = ?, descripcion = ?, fecha_evento = ?, hora_inicio = ?, hora_fin = ?, estado = ?
    WHERE id_evento = ?
  `;
  db.query(
    sql,
    [titulo, descripcion || '', fecha_evento, hora_inicio, hora_fin, estado || 'pendiente', req.params.id_evento],
    err => {
      if (err) return res.status(500).json({ message: 'Error al actualizar evento' });
      res.json({ message: 'Evento actualizado' });
    }
  );
});

// Eliminar evento
app.delete('/api/planificador/:id_evento', (req, res) => {
  db.query('DELETE FROM planificador WHERE id_evento = ?', [req.params.id_evento], err => {
    if (err) return res.status(500).json({ message: 'Error al eliminar evento' });
    res.json({ message: 'Evento eliminado' });
  });
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});


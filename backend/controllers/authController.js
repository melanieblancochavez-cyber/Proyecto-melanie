const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.register = async (req, res) => {
    const { nombre_usuario, contrasena, nombre, apellido1, apellido2 } = req.body;
    const hashed = await bcrypt.hash(contrasena, 10);

    db.query('INSERT INTO usuarios (nombre_usuario, contrasena, rol) VALUES (?, ?, ?)', 
    [nombre_usuario, hashed, 'profesor'], (err, result) => {
        if (err) return res.status(500).json({ error: err });

        const id_usuario = result.insertId;

        db.query('INSERT INTO profesores (id_usuario, nombre, apellido1, apellido2) VALUES (?, ?, ?, ?)',
        [id_usuario, nombre, apellido1, apellido2], (err2) => {
            if (err2) return res.status(500).json({ error: err2 });

            return res.status(201).json({ message: 'Profesor registrado' });
        });
    });
};

exports.login = (req, res) => {
    const { nombre_usuario, contrasena } = req.body;

    db.query('SELECT * FROM usuarios WHERE nombre_usuario = ?', [nombre_usuario], async (err, results) => {
        if (err) return res.status(500).json({ error: err });
        if (results.length === 0) return res.status(400).json({ message: 'Usuario no encontrado' });

        const user = results[0];
        const valid = await bcrypt.compare(contrasena, user.contrasena);
        if (!valid) return res.status(400).json({ message: 'Contraseña incorrecta' });

        const token = jwt.sign({ id: user.id_usuario }, 'secret', { expiresIn: '1h' });
        res.json({ token });
    });
};



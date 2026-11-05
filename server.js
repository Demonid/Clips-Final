const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware para JSON y archivos estaticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Iniciar sesion
app.post('/api/login', (req, res) => {
  const { correo, password } = req.body;
  const sql = 'SELECT id, nombre, correo, telefono, rol FROM usuarios WHERE correo = ? AND password = ?';

  db.get(sql, [correo, password], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al iniciar sesion' });
    }
    if (!row) {
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });
    }
    res.json(row);
  });
});

// Registrar nuevo usuario
app.post('/api/registro', (req, res) => {
  const { nombre, correo, telefono, password } = req.body;
  if (!nombre || !correo || !password) {
    return res.status(400).json({ error: 'Todos los campos obligatorios deben completarse' });
  }

  const sql = 'INSERT INTO usuarios (nombre, correo, telefono, password, rol) VALUES (?, ?, ?, ?, ?)';
  db.run(sql, [nombre, correo, telefono || '', password, 'cliente'], function (err) {
    if (err) {
      return res.status(400).json({ error: 'El correo ya está registrado' });
    }
    res.json({
      id: this.lastID,
      nombre,
      correo,
      telefono: telefono || '',
      rol: 'cliente'
    });
  });
});

// Obtener todas las categorias
app.get('/api/categorias', (req, res) => {
  db.all('SELECT * FROM categorias', [], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al consultar categorias' });
    }
    res.json(rows);
  });
});

// Obtener lista de productos con filtro opcional de busqueda y categoria
app.get('/api/productos', (req, res) => {
  const { busqueda, categoria_id } = req.query;

  let sql = `
    SELECT p.*, c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE 1 = 1
  `;
  const params = [];

  if (busqueda && busqueda.trim() !== '') {
    sql += ' AND (p.nombre LIKE ? OR p.descripcion LIKE ?)';
    params.push(`%${busqueda.trim()}%`, `%${busqueda.trim()}%`);
  }

  if (categoria_id && categoria_id !== '') {
    sql += ' AND p.categoria_id = ?';
    params.push(categoria_id);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Error al consultar productos' });
    }
    res.json(rows);
  });
});

// Obtener detalle de un producto por su id
app.get('/api/productos/:id', (req, res) => {
  const sql = `
    SELECT p.*, c.nombre AS categoria
    FROM productos p
    LEFT JOIN categorias c ON p.categoria_id = c.id
    WHERE p.id = ?
  `;

  db.get(sql, [req.params.id], (err, row) => {
    if (err) {
      return res.status(500).json({ error: 'Error al consultar el producto' });
    }
    if (!row) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(row);
  });
});

// Ruta principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});

const express = require('express');
const path = require('path');
const db = require('./db');

const app = express();
const PORT = 3000;

// Middleware para JSON y archivos estaticos
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

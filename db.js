const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'papeleria.db');
const db = new sqlite3.Database(dbPath);

// Crear tablas e insertar datos iniciales
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio REAL NOT NULL,
      existencias INTEGER NOT NULL DEFAULT 0,
      imagen TEXT,
      categoria_id INTEGER,
      FOREIGN KEY (categoria_id) REFERENCES categorias(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS usuarios (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      correo TEXT UNIQUE NOT NULL,
      telefono TEXT,
      password TEXT NOT NULL,
      rol TEXT DEFAULT 'cliente'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id INTEGER,
      nombre_cliente TEXT,
      telefono TEXT,
      notas TEXT,
      fecha TEXT DEFAULT CURRENT_TIMESTAMP,
      total REAL NOT NULL,
      estado TEXT DEFAULT 'Pendiente',
      FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS detalle_pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER,
      producto_id INTEGER,
      nombre_producto TEXT,
      precio REAL,
      cantidad INTEGER,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id)
    )
  `);

  // Insertar usuarios de prueba si no existen
  db.get('SELECT COUNT(*) AS count FROM usuarios', (err, row) => {
    if (err || row.count > 0) return;

    const stmtUser = db.prepare(`
      INSERT INTO usuarios (nombre, correo, telefono, password, rol)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmtUser.run(['Administrador', 'admin@clips.com', '3310000000', 'admin123', 'admin']);
    stmtUser.run(['Cliente Demo', 'cliente@correo.com', '3320000000', '123456', 'cliente']);
    stmtUser.finalize();
  });

  // Verificar si ya existen categorias para no duplicar datos
  db.get('SELECT COUNT(*) AS count FROM categorias', (err, row) => {
    if (err || row.count > 0) return;

    const categorias = ['Escolares', 'Oficina', 'Papel y Cuadernos', 'Arte y Dibujo'];
    const stmtCat = db.prepare('INSERT INTO categorias (nombre) VALUES (?)');
    categorias.forEach(nombre => stmtCat.run(nombre));
    stmtCat.finalize();

    const productos = [
      [
        'Cuaderno Profesional Raya 100 Hojas',
        'Cuaderno cosido tamaño profesional con 100 hojas de raya y pasta dura.',
        45.00,
        30,
        'https://placehold.co/400x280/e3f2fd/1565c0?text=Cuaderno+Profesional',
        3
      ],
      [
        'Paquete 500 Hojas Blancas Carta',
        'Resma de 500 hojas blancas tamaño carta de alta blancura para impresión y copiado.',
        135.00,
        20,
        'https://placehold.co/400x280/f5f5f5/424242?text=Hojas+Blancas+Carta',
        3
      ],
      [
        'Caja de Clips Metálicos 100 pzas',
        'Clips estándar número 1 resistentes a la oxidación para sujetar documentos.',
        18.00,
        50,
        'https://placehold.co/400x280/fff3e0/e65100?text=Caja+de+Clips',
        2
      ],
      [
        'Bolígrafo Punto Mediano Negro',
        'Pluma de tinta negra de secado rápido y escritura suave.',
        8.00,
        100,
        'https://placehold.co/400x280/eceff1/263238?text=Boligrafo+Negro',
        1
      ],
      [
        'Juego de Geometría 5 Piezas',
        'Incluye regla de 30 cm, dos escuadras, transportador y compás escolar.',
        38.00,
        15,
        'https://placehold.co/400x280/e8f5e9/2e7d32?text=Juego+de+Geometria',
        1
      ],
      [
        'Carpeta Blanca de 3 Argollas',
        'Carpeta tamaño carta de 1 pulgada con cubiertas plásticas transparentes.',
        65.00,
        12,
        'https://placehold.co/400x280/e0f7fa/006064?text=Carpeta+Argollas',
        2
      ],
      [
        'Lápiz Adhesivo Escolar 40g',
        'Pegamento en barra lavable y no tóxico para papel, cartulina y fotos.',
        28.00,
        35,
        'https://placehold.co/400x280/fff8e1/f57f17?text=Lapiz+Adhesivo',
        1
      ],
      [
        'Caja de 12 Colores de Madera',
        'Colores largos de mina resistente y tonos intensos para dibujo escolar.',
        55.00,
        25,
        'https://placehold.co/400x280/fce4ec/c2185b?text=Colores+de+Madera',
        4
      ],
      [
        'Engrapadora Metálica de Escritorio',
        'Engrapadora de media tira con capacidad para engrapar hasta 20 hojas.',
        95.00,
        10,
        'https://placehold.co/400x280/ede7f6/4527a0?text=Engrapadora',
        2
      ],
      [
        'Marcatextos Fluorescente Amarillo',
        'Resaltador de punta cincel para subrayar textos en todo tipo de papel.',
        15.00,
        40,
        'https://placehold.co/400x280/fffde7/fbc02d?text=Marcatextos',
        1
      ],
      [
        'Acuarelas Escolares 12 Colores',
        'Estuche de plástico con 12 pastillas de acuarela y pincel incluido.',
        42.00,
        18,
        'https://placehold.co/400x280/f3e5f5/6a1b9a?text=Acuarelas+12+Colores',
        4
      ],
      [
        'Notas Adhesivas 3x3 Pulgadas',
        'Block con 100 hojas adhesivas amarillas para recordatorios y apuntes rápidos.',
        22.00,
        45,
        'https://placehold.co/400x280/fff9c4/f9a825?text=Notas+Adhesivas',
        2
      ]
    ];

    const stmtProd = db.prepare(`
      INSERT INTO productos (nombre, descripcion, precio, existencias, imagen, categoria_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    productos.forEach(p => stmtProd.run(p));
    stmtProd.finalize();
  });
});

module.exports = db;

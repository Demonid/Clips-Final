const { createApp } = Vue;

createApp({
  data() {
    return {
      vistaActual: 'inicio',
      categorias: [],
      productos: [],
      productosDestacados: [],
      productoSeleccionado: null,
      cantidadDetalle: 1,
      textoBusqueda: '',
      busquedaActiva: '',
      categoriaActiva: '',
      carrito: [],
      usuarioActual: null,
      formLogin: {
        correo: '',
        password: ''
      },
      formRegistro: {
        nombre: '',
        correo: '',
        telefono: '',
        password: ''
      },
      mensajeAlerta: '',
      mensajeError: ''
    };
  },
  computed: {
    nombreCategoriaActiva() {
      const cat = this.categorias.find(c => c.id === this.categoriaActiva);
      return cat ? cat.nombre : '';
    },
    totalCarrito() {
      return this.carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    },
    totalArticulosCarrito() {
      return this.carrito.reduce((acc, item) => acc + item.cantidad, 0);
    }
  },
  mounted() {
    this.cargarCategorias();
    this.cargarProductosIniciales();
  },
  methods: {
    cambiarVista(vista) {
      this.mensajeError = '';
      this.vistaActual = vista;
    },
    irInicio() {
      this.vistaActual = 'inicio';
    },
    verCatalogoCompleto() {
      this.textoBusqueda = '';
      this.busquedaActiva = '';
      this.categoriaActiva = '';
      this.cargarProductos();
      this.vistaActual = 'catalogo';
    },
    async cargarCategorias() {
      try {
        const res = await fetch('/api/categorias');
        this.categorias = await res.json();
      } catch (error) {
        console.error('Error al cargar categorias:', error);
      }
    },
    async cargarProductosIniciales() {
      try {
        const res = await fetch('/api/productos');
        const data = await res.json();
        this.productos = data;
        this.productosDestacados = data.slice(0, 4);
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    },
    async cargarProductos() {
      try {
        const params = new URLSearchParams();
        if (this.busquedaActiva) {
          params.append('busqueda', this.busquedaActiva);
        }
        if (this.categoriaActiva) {
          params.append('categoria_id', this.categoriaActiva);
        }

        const res = await fetch(`/api/productos?${params.toString()}`);
        this.productos = await res.json();
      } catch (error) {
        console.error('Error al filtrar productos:', error);
      }
    },
    buscarProductos() {
      this.busquedaActiva = this.textoBusqueda.trim();
      this.cargarProductos();
      this.vistaActual = 'catalogo';
    },
    seleccionarCategoria(idCategoria) {
      this.categoriaActiva = idCategoria;
      this.cargarProductos();
      this.vistaActual = 'catalogo';
    },
    limpiarFiltros() {
      this.textoBusqueda = '';
      this.busquedaActiva = '';
      this.categoriaActiva = '';
      this.cargarProductos();
    },
    verDetalle(producto) {
      this.productoSeleccionado = producto;
      this.cantidadDetalle = 1;
      this.vistaActual = 'detalle';
    },
    agregarAlCarrito(producto, cantidad = 1) {
      const existente = this.carrito.find(item => item.id === producto.id);
      if (existente) {
        const nuevaCantidad = existente.cantidad + cantidad;
        existente.cantidad = Math.min(nuevaCantidad, producto.existencias);
      } else {
        this.carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          categoria: producto.categoria,
          precio: producto.precio,
          imagen: producto.imagen,
          existencias: producto.existencias,
          cantidad: Math.min(cantidad, producto.existencias)
        });
      }

      this.mostrarAlerta(`Se agregó "${producto.nombre}" al carrito.`);
    },
    cambiarCantidadCarrito(item, cambio) {
      const nuevaCantidad = item.cantidad + cambio;
      if (nuevaCantidad >= 1 && nuevaCantidad <= item.existencias) {
        item.cantidad = nuevaCantidad;
      }
    },
    quitarDelCarrito(index) {
      this.carrito.splice(index, 1);
    },
    async iniciarSesion() {
      this.mensajeError = '';
      try {
        const res = await fetch('/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.formLogin)
        });
        const data = await res.json();

        if (!res.ok) {
          this.mensajeError = data.error || 'Error al iniciar sesión';
          return;
        }

        this.usuarioActual = data;
        this.formLogin = { correo: '', password: '' };
        this.mostrarAlerta(`Bienvenido, ${data.nombre}`);
        this.vistaActual = 'inicio';
      } catch (error) {
        this.mensajeError = 'No se pudo conectar con el servidor';
      }
    },
    async registrarUsuario() {
      this.mensajeError = '';
      try {
        const res = await fetch('/api/registro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.formRegistro)
        });
        const data = await res.json();

        if (!res.ok) {
          this.mensajeError = data.error || 'Error al registrar usuario';
          return;
        }

        this.usuarioActual = data;
        this.formRegistro = { nombre: '', correo: '', telefono: '', password: '' };
        this.mostrarAlerta('Cuenta creada correctamente.');
        this.vistaActual = 'inicio';
      } catch (error) {
        this.mensajeError = 'No se pudo conectar con el servidor';
      }
    },
    cerrarSesion() {
      this.usuarioActual = null;
      this.mostrarAlerta('Sesión cerrada.');
      this.vistaActual = 'inicio';
    },
    mostrarAlerta(texto) {
      this.mensajeAlerta = texto;
      setTimeout(() => {
        this.mensajeAlerta = '';
      }, 2500);
    }
  }
}).mount('#app');

const { createApp } = Vue;

createApp({
  data() {
    return {
      vistaActual: 'inicio',
      categorias: [],
      productos: [],
      productosDestacados: [],
      productoSeleccionado: null,
      textoBusqueda: '',
      busquedaActiva: '',
      categoriaActiva: ''
    };
  },
  computed: {
    nombreCategoriaActiva() {
      const cat = this.categorias.find(c => c.id === this.categoriaActiva);
      return cat ? cat.nombre : '';
    }
  },
  mounted() {
    this.cargarCategorias();
    this.cargarProductosIniciales();
  },
  methods: {
    cambiarVista(vista) {
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
      this.vistaActual = 'detalle';
    }
  }
}).mount('#app');

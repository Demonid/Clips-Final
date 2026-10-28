const { createApp } = Vue;

createApp({
  data() {
    return {
      vistaActual: 'inicio',
      productos: [],
      productosDestacados: [],
      productoSeleccionado: null,
      textoBusqueda: '',
      busquedaActiva: ''
    };
  },
  mounted() {
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
      this.cargarProductos();
      this.vistaActual = 'catalogo';
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
    limpiarBusqueda() {
      this.textoBusqueda = '';
      this.busquedaActiva = '';
      this.cargarProductos();
    },
    verDetalle(producto) {
      this.productoSeleccionado = producto;
      this.vistaActual = 'detalle';
    }
  }
}).mount('#app');

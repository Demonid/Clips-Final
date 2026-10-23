const { createApp } = Vue;

createApp({
  data() {
    return {
      vistaActual: 'inicio',
      productos: []
    };
  },
  mounted() {
    this.cargarProductos();
  },
  methods: {
    cambiarVista(vista) {
      this.vistaActual = vista;
    },
    async cargarProductos() {
      try {
        const res = await fetch('/api/productos');
        this.productos = await res.json();
      } catch (error) {
        console.error('Error al cargar productos:', error);
      }
    }
  }
}).mount('#app');

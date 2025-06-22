const FacturadorApp = {
  generarFactura() {
    const cliente = document.getElementById('cliente').value.trim();
    const producto = document.getElementById('producto').value.trim();
    const precio = parseFloat(document.getElementById('precio').value);
    const cantidad = parseInt(document.getElementById('cantidad').value);

    if (!cliente || !producto || isNaN(precio) || isNaN(cantidad)) {
      alert('Por favor, completá todos los campos correctamente.');
      return;
    }

    const nuevaFactura = {
      cliente,
      producto,
      precio,
      cantidad,
      fecha: new Date().toISOString()
    };

    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
    facturas.unshift(nuevaFactura); // Insertar arriba
    localStorage.setItem('facturas', JSON.stringify(facturas));

    this.renderFacturas();
    this.limpiarFormulario();
    this.sonar('beep-add');
    this.mostrarExito();
    recalcularTotal();
  },

  limpiarFormulario() {
    document.getElementById('cliente').value = '';
    document.getElementById('producto').value = '';
    document.getElementById('precio').value = '';
    document.getElementById('cantidad').value = 1;
  },

  renderFacturas() {
    const contenedor = document.getElementById('factura');
    contenedor.innerHTML = '';
    const facturas = JSON.parse(localStorage.getItem('facturas')) || [];

    facturas.forEach((f, index) => {
      const fecha = new Date(f.fecha).toLocaleString("es-AR", {
        day: "2-digit", month: "2-digit", year: "2-digit",
        hour: "2-digit", minute: "2-digit"
      });

      const cantidad = f.cantidad || 1;
      const total = (f.precio * cantidad).toFixed(2);

      const div = document.createElement("div");
      div.className = "producto";

      const texto = document.createElement("div");
      texto.innerHTML = `
        <strong>📅 ${fecha}</strong><br />
        <span>${f.producto}</span> — Cantidad: ${cantidad} — <strong>Total: $${total}</strong>
      `;

      const button = document.createElement("button");
      button.textContent = "Borrar";
      button.className = "borrar";
      button.addEventListener("click", () => {
        if (!confirm("¿Estás seguro de eliminar esta factura?")) return;

        facturas.splice(index, 1);
                localStorage.setItem('facturas', JSON.stringify(facturas));
        this.renderFacturas();
        recalcularTotal();
      });

      div.appendChild(texto);
      div.appendChild(button);
      contenedor.appendChild(div);
    });
  },

  mostrarExito() {
    const mensaje = document.getElementById("mensajeExito");
    if (mensaje) {
      mensaje.classList.remove("d-none");
      setTimeout(() => mensaje.classList.add("d-none"), 2000);
    }
  },

  sonar(id) {
    const sonido = document.getElementById(id);
    if (sonido) {
      sonido.currentTime = 0;
      sonido.play();
    }
  },

  toggleSidebar() {
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
      sidebar.classList.toggle("d-none");
    }
  }
};

function recalcularTotal() {
  const facturas = JSON.parse(localStorage.getItem('facturas')) || [];
  const total = facturas.reduce((acum, f) => {
    const cantidad = f.cantidad || 1;
    return acum + (f.precio * cantidad);
  }, 0);

  const totalEl = document.getElementById("totalVentas");
  totalEl.textContent = `$${total.toFixed(2)}`;

  totalEl.classList.add("animado");
  setTimeout(() => totalEl.classList.remove("animado"), 300);
}

window.addEventListener("DOMContentLoaded", () => {
  FacturadorApp.renderFacturas();
  recalcularTotal();
});

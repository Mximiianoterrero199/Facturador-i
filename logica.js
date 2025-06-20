const FacturadorApp = (() => {
      let total = parseFloat(localStorage.getItem('totalVentas')) || 0;
      let facturas = JSON.parse(localStorage.getItem('facturas')) || [];

      function init() {
        total = Math.max(total, 0);
        document.getElementById("totalVentas").textContent = `$${total.toFixed(2)}`;
        document.getElementById("factura").innerHTML = "";
      }

      function toggleSidebar() {
        document.getElementById("sidebar").classList.toggle("active");
      }

      function generarFactura() {
        const cliente = document.getElementById("cliente").value.trim();
        const producto = document.getElementById("producto").value.trim();
        const precio = parseFloat(document.getElementById("precio").value);
        const cantidad = parseInt(document.getElementById("cantidad").value);
        const beep = document.getElementById("beep");

        if (!cliente || !producto || isNaN(precio) || isNaN(cantidad) || precio < 0 || cantidad < 1) {
          alert("Completá todos los campos correctamente.");
          return;
        }

        const fecha = new Date().toISOString();
        const factura = { cliente, producto, precio, cantidad, fecha };
        facturas.push(factura);
        total += precio * cantidad;

        localStorage.setItem('facturas', JSON.stringify(facturas));
        localStorage.setItem('totalVentas', total.toFixed(2));
        document.getElementById("totalVentas").textContent = `$${total.toFixed(2)}`;

        document.getElementById("cliente").value = "";
        document.getElementById("producto").value = "";
        document.getElementById("precio").value = "";
        document.getElementById("cantidad").value = "1";

        beep.play().catch(() => {});
      }

      function eliminarFactura(i) {
        total -= facturas[i].precio * facturas[i].cantidad;
        facturas.splice(i, 1);
        total = Math.max(total, 0);
        localStorage.setItem('facturas', JSON.stringify(facturas));
        localStorage.setItem('totalVentas', total.toFixed(2));
        document.getElementById("totalVentas").textContent = `$${total.toFixed(2)}`;
        filtrarFacturas();
      }

      function filtrarFacturas() {
        const texto = document.getElementById("buscar").value.toLowerCase().trim();
        const contenedor = document.getElementById("factura");
        contenedor.innerHTML = "";
        if (texto === "") return;

        let coincidencias = 0;
        facturas.forEach((factura, i) => {
          const contenido = `${factura.cliente} ${factura.producto}`.toLowerCase();
          if (contenido.includes(texto)) {
            renderFactura(factura, i);
            coincidencias++;
          }
        });

        if (coincidencias === 0) {
          const aviso = document.createElement("div");
          aviso.className = "mt-3 text-info";
          aviso.textContent = "🔍 Sin resultados para esta búsqueda.";
          contenedor.appendChild(aviso);
        }
      }

      function renderFactura(factura, index) {
        const totalLinea = (factura.precio * factura.cantidad).toFixed(2);
        const cont = document.createElement("div");
        cont.className = "card p-4 factura-card mt-3 scan";
        cont.dataset.index = index;
        const fechaFormateada = new Date(factura.fecha).toLocaleString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        });
        cont.innerHTML = `
          <h2 class="card-title">Factura</h2>
          <p><strong>Cliente:</strong> ${factura.cliente}</p>
          <p><strong>Producto:</strong> ${factura.producto}</p>
          <p><strong>Cantidad:</strong> ${factura.cantidad}</p>
          <p><strong>Precio unitario:</strong> $${factura.precio.toFixed(2)}</p>
          <p><strong>Total:</strong> $${totalLinea}</p>
          <p><strong>Fecha:</strong> ${fechaFormateada}</p>
          <button class="delete-btn" onclick="FacturadorApp.eliminarFactura(${index})">Eliminar</button>
        `;
        document.getElementById("factura").appendChild(cont);
      }

      return {
        init,
        toggleSidebar,
        generarFactura,
        eliminarFactura,
        filtrarFacturas
      };
    })();

    window.onload = FacturadorApp.init;
  
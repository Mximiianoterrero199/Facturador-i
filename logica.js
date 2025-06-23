document.addEventListener("DOMContentLoaded", () => {
  const campos = {
    cliente: document.getElementById("cliente"),
    producto: document.getElementById("producto"),
    precio: document.getElementById("precio"),
    cantidad: document.getElementById("cantidad"),
    aplicarIVA: document.getElementById("aplicarIVA"),
  };

  const filtroCliente = document.getElementById("filtroCliente");
  const filtroProducto = document.getElementById("filtroProducto");
  const beepAdd = document.getElementById("beep-add");
  const beepDel = document.getElementById("beep-del");

  let total = 0;
  let contador = 1;
  let facturas = [];

  const FacturadorApp = {
    generarFactura,
    borrarFactura,
    limpiarHistorial,
    limpiarFiltros,
    toggleFacturas,
    mostrarHistorial,
    mostrarPrincipal,
    init,
  };

  function validarCampos() {
    let valido = true;
    Object.values(campos).forEach(input => {
      input.classList.remove("invalid");
      if (
        input.type !== "checkbox" &&
        (input.value.trim() === "" || parseFloat(input.value) <= 0)
      ) {
        input.classList.add("invalid");
        valido = false;
      }
    });
    return valido;
  }

  function generarFactura() {
    if (!validarCampos()) return;

    const nombre = campos.cliente.value.trim();
    const producto = campos.producto.value.trim();
    const precio = parseFloat(campos.precio.value);
    const cantidad = parseInt(campos.cantidad.value);
    const aplicarIVA = campos.aplicarIVA.checked;
    let subtotal = precio * cantidad;
    if (aplicarIVA) subtotal *= 1.21;
    subtotal = parseFloat(subtotal.toFixed(2));

    const factura = {
      id: `#${String(contador).padStart(4, "0")}`,
      cliente: nombre,
      producto,
      precio,
      cantidad,
      subtotal,
    };

    facturas.push(factura);
    contador++;
    total += subtotal;
    actualizarVista();
    guardarEnLocalStorage();
    resetCampos();
    mostrarExito();
    beepAdd.play();
  }

  function resetCampos() {
    Object.values(campos).forEach(input => {
      if (input.type === "checkbox") input.checked = false;
      else input.value = "";
    });
    campos.cantidad.value = 1;
  }

  function mostrarExito() {
    const msg = document.getElementById("mensajeExito");
    msg.classList.remove("d-none");
    setTimeout(() => msg.classList.add("d-none"), 2000);
  }

  function borrarFactura(index) {
    if (!facturas[index]?.subtotal || isNaN(facturas[index].subtotal)) return;
    total -= facturas[index].subtotal;
    facturas.splice(index, 1);
    actualizarVista();
    guardarEnLocalStorage();
    beepDel.play();
  }

  function actualizarVista() {
    const contenedor = document.getElementById("factura");
    if (!contenedor) return;
    contenedor.innerHTML = "";

    const clientesSet = new Set();
    const productosSet = new Set();

    facturas.forEach((item, index) => {
      if (!item.subtotal || isNaN(item.subtotal)) return;

      clientesSet.add(item.cliente);
      productosSet.add(item.producto);

      const fCliente = filtroCliente?.value.toLowerCase() || "";
      const fProducto = filtroProducto?.value.toLowerCase() || "";
      if (
        fCliente && !item.cliente.toLowerCase().includes(fCliente) ||
        fProducto && !item.producto.toLowerCase().includes(fProducto)
      ) return;

      const div = document.createElement("div");
      div.className = "producto";
      div.innerHTML = `
        <div>
          <strong>${item.producto}</strong><br/>
          <span>${item.cliente}</span><br/>
          <span>${item.cantidad} x $${item.precio.toFixed(2)}</span><br/>
          <small>${item.id}</small>
        </div>
        <div class="text-end">
          <span>$${item.subtotal.toFixed(2)}</span><br/>
          <button class="borrar btn btn-sm mt-2" onclick="FacturadorApp.borrarFactura(${index})">Eliminar</button>
        </div>
      `;
      contenedor.appendChild(div);
    });

    document.getElementById("totalVentas").innerText = `$${total.toFixed(2)}`;
    document.getElementById("contadorFacturas").innerText = `${facturas.length} factura(s) registradas`;

    actualizarDatalist("clientesList", [...clientesSet]);
    actualizarDatalist("productosList", [...productosSet]);
  }

  function actualizarDatalist(id, valores) {
    const list = document.getElementById(id);
    if (!list) return;
    list.innerHTML = "";
    valores.sort().forEach(valor => {
      const opt = document.createElement("option");
      opt.value = valor;
      list.appendChild(opt);
    });
  }

  function guardarEnLocalStorage() {
    localStorage.setItem("facturas", JSON.stringify(facturas));
    localStorage.setItem("total", total.toString());
    localStorage.setItem("contador", contador.toString());
  }

  function cargarDesdeLocalStorage() {
    try {
      const guardado = localStorage.getItem("facturas");
      if (guardado) facturas = JSON.parse(guardado);
      total = parseFloat(localStorage.getItem("total")) || 0;
      contador = parseInt(localStorage.getItem("contador")) || 1;
    } catch {
      facturas = [];
      total = 0;
      contador = 1;
      localStorage.clear();
    }
    actualizarVista();
  }

  function limpiarHistorial() {
    if (confirm("¿Seguro que querés borrar todo el historial?")) {
      facturas = [];
      total = 0;
      contador = 1;
      localStorage.clear();
      actualizarVista();
    }
  }

  function limpiarFiltros() {
    if (filtroCliente) filtroCliente.value = "";
    if (filtroProducto) filtroProducto.value = "";
    actualizarVista();
  }

  function toggleFacturas() {
    const lista = document.getElementById("factura");
    const btn = document.getElementById("toggleFacturas");
    if (!lista || !btn) return;

    const oculto = lista.style.display === "none";
    lista.style.display = oculto ? "block" : "none";
    btn.textContent = oculto ? "Ocultar facturas" : "Mostrar facturas";
  }

  function mostrarHistorial() {
    document.getElementById("seccionFormulario").style.display = "none";
    document.getElementById("seccionHistorial").style.display = "block";
  }

  function mostrarPrincipal() {
    document.getElementById("seccionFormulario").style.display = "block";
    document.getElementById("seccionHistorial").style.display = "none";
  }

  function toggleModoOscuro() {
    const toggle = document.getElementById("modoOscuroToggle");
    const body = document.body;
    const guardado = localStorage.getItem("modoOscuro") === "true";
    toggle.checked = guardado;
    body.classList.toggle("modo-oscuro", guardado);
    toggle.addEventListener("change", () => {
      const activo = toggle.checked;
      body.classList.toggle("modo-oscuro", activo);
      localStorage.setItem("modoOscuro", activo);
    });
  }

  function init() {
    toggleModoOscuro();
    cargarDesdeLocalStorage();
    filtroCliente?.addEventListener("input", actualizarVista);
    filtroProducto?.addEventListener("input", actualizarVista);
  }

  window.FacturadorApp = FacturadorApp;
  FacturadorApp.init();
});

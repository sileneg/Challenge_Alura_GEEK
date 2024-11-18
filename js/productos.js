import { obtenerProductos, agregarProducto, eliminarProducto, actualizarProducto } from './api.js';

const contenedorProductos = document.getElementById("productos");
const formularioProducto = document.querySelector("#formularioProducto");
const formularioContenido = document.querySelector("#productoForm");
const overlay = document.getElementById("overlay");
const closeBtn = document.querySelector(".close-btn"); // Botón de cerrar
const modalHeader = document.getElementById("modalHeader"); // Encabezado del modal

//Carrusel
document.addEventListener("DOMContentLoaded", () => {
    const items = document.querySelectorAll(".carousel-item");
    const prevButton = document.querySelector(".carousel-control.prev");
    const nextButton = document.querySelector(".carousel-control.next");

    let currentIndex = 0;

    function updateCarousel(index) {
        items.forEach((item, i) => {
            item.classList.remove("active");
            if (i === index) {
                item.classList.add("active");
            }
        });
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % items.length;
        updateCarousel(currentIndex);
    }

    function showPrev() {
        currentIndex = (currentIndex - 1 + items.length) % items.length;
        updateCarousel(currentIndex);
    }

    nextButton.addEventListener("click", showNext);
    prevButton.addEventListener("click", showPrev);

    // Auto-carrusel cada 5 segundos
    setInterval(showNext, 5000);
});

// Elementos del formulario
const nombreInput = document.getElementById('nombre');
const precioInput = document.getElementById('precio');
const descripcionInput = document.getElementById('descripcion');
const imagenUrlInput = document.getElementById('imagenUrl');
const btnAgregar = document.getElementById('btnAgregarProducto'); // Botón de agregar
const btnActualizar = document.getElementById('btnActualizarProducto'); // Botón de actualizar
const formTitle = document.getElementById('formTitle'); // Título del formulario

// Variables para productos
let productos = [];
let currentPage = 1;
const itemsPerPage = 8;

// Mostrar mensaje de confirmación
function mostrarMensaje(mensaje, duracion = 8000) {
    // Elimina cualquier mensaje existente
    const mensajeExistente = document.querySelector('.mensaje-confirmacion');
    if (mensajeExistente) {
        mensajeExistente.remove();
    }

    const mensajeDiv = document.createElement('div');
    mensajeDiv.textContent = mensaje;
    mensajeDiv.className = 'mensaje-confirmacion';
    document.body.appendChild(mensajeDiv);

    // Mantener el mensaje visible durante la duración especificada
    setTimeout(() => {
        mensajeDiv.style.opacity = 0; // Inicia la transición de opacidad
        setTimeout(() => mensajeDiv.remove(), 800); // Elimina el mensaje después de la transición
    }, duracion);
}

//Paginación
function renderizarPaginacion() {
    const totalPages = Math.ceil(productos.length / itemsPerPage);
    const paginationContainer = document.getElementById("pagination");

    paginationContainer.innerHTML = ""; // Limpia la paginación existente

    // Botón "Anterior"
    const prevButton = document.createElement("button");
    prevButton.textContent = "←";
    prevButton.className = "page-control prev";
    prevButton.disabled = currentPage === 1; // Desactiva si está en la primera página
    prevButton.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderizarProductos();
        }
    });
    paginationContainer.appendChild(prevButton);

    // Botones de número de página
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement("button");
        pageButton.textContent = i;
        pageButton.className = "page-control";

        // Resalta la página activa
        if (i === currentPage) {
            pageButton.classList.add("active");
        }

        pageButton.addEventListener("click", () => {
            currentPage = i;
            renderizarProductos();
        });

        paginationContainer.appendChild(pageButton);
    }

    // Botón "Siguiente"
    const nextButton = document.createElement("button");
    nextButton.textContent = "→";
    nextButton.className = "page-control next";
    nextButton.disabled = currentPage === totalPages; // Desactiva si está en la última página
    nextButton.addEventListener("click", () => {
        if (currentPage < totalPages) {
            currentPage++;
            renderizarProductos();
        }
    });
    paginationContainer.appendChild(nextButton);
}

// Renderizar productos
async function renderizarProductos() {
    productos = await obtenerProductos();
    const noProductos = document.getElementById("noProductos");
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const productosPagina = productos.slice(start, end);

    contenedorProductos.innerHTML = "";

    if (productosPagina.length === 0) {
        noProductos.style.display = "block";
    } else {
        noProductos.style.display = "none";
        productosPagina.forEach((producto) => {
            const imgSrc = producto.imagen;

            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <img src="${imgSrc}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='./image/placeholder.png';">
                <div class="card-container--info">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p>${producto.precio}</p>
                    <div class="iconos">
                        <i class="fa fa-edit" data-id="${producto.id}" title="Actualizar"></i>
                        <i class="fa fa-trash" data-id="${producto.id}" title="Eliminar"></i>
                    </div>
                </div>
            `;
            contenedorProductos.appendChild(card);
        });

        // Asignar eventos después de añadir los productos al DOM
        document.querySelectorAll('.fa-edit').forEach((icono) => {
            icono.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                if (id) configurarFormularioActualizar(id);
            });
        });

        document.querySelectorAll('.fa-trash').forEach((icono) => {
            icono.addEventListener('click', (event) => {
                const id = event.target.dataset.id;
                if (id) eliminarProductoConfirmacion(id);
            });
        });
    }

    renderizarPaginacion();
}

// Función para eliminar un producto
async function eliminarProductoConfirmacion(id) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este producto?");
    if (confirmacion) {
        const resultado = await eliminarProducto(id);
        if (resultado) {
            const mensajeDiv = document.createElement('div');
            mensajeDiv.textContent = "Producto eliminado exitosamente";
            mensajeDiv.className = 'mensaje-confirmacion';
            document.body.appendChild(mensajeDiv);
            setTimeout(() => {
                mensajeDiv.remove();
            }, 8000); // Duración ajustada a 8000 ms (8 segundos)
            renderizarProductos();
        } else {
            mostrarMensaje("Error al eliminar el producto");
        }
    }
}

// Configurar formulario para agregar
function configurarFormularioAgregar() {
    formTitle.textContent = "Agregar Nuevo Producto";
    btnAgregar.style.display = "block";
    btnActualizar.style.display = "none";
    formularioContenido.reset();
    mostrarFormulario();
}

// Configurar formulario para actualizar
async function configurarFormularioActualizar(id) {
    const producto = productos.find((p) => p.id === id);
    if (producto) {
        nombreInput.value = producto.nombre || '';
        precioInput.value = producto.precio || '';
        descripcionInput.value = producto.descripcion || '';
        imagenUrlInput.value = producto.imagen || '';

        formTitle.textContent = "Actualizar Producto";
        btnAgregar.style.display = "none";
        btnActualizar.style.display = "block";

        mostrarFormulario();

        // Configurar evento para actualizar
        btnActualizar.onclick = async (event) => {
            event.preventDefault();

            const productoActualizado = {
                ...producto,
                nombre: nombreInput.value.trim(),
                precio: parseFloat(precioInput.value).toFixed(2),
                descripcion: descripcionInput.value.trim(),
                imagen: imagenUrlInput.value.trim() || producto.imagen
            };

            const resultado = await actualizarProducto(id, productoActualizado);
            if (resultado) {
                mostrarMensaje("Producto actualizado exitosamente");
                renderizarProductos();
                ocultarFormulario();
            } else {
                mostrarMensaje("Error al actualizar el producto");
            }
        };
    } else {
        mostrarMensaje("Producto no encontrado");
    }
}

// Mostrar formulario
function mostrarFormulario() {
    formularioProducto.style.display = 'block';
    overlay.style.display = 'block';
    setTimeout(() => {
        nombreInput.focus();
    }, 50);
}

// Ocultar formulario
function ocultarFormulario() {
    formularioProducto.style.display = 'none';
    overlay.style.display = 'none';
    formularioContenido.reset(); // Limpia los campos del formulario
    formTitle.textContent = "Agregar Nuevo Producto"; // Restablece el título por defecto
    btnAgregar.style.display = "block";
    btnActualizar.style.display = "none";
}

// Agregar eventos para cerrar el formulario
closeBtn.addEventListener("click", ocultarFormulario);
overlay.addEventListener("click", ocultarFormulario);

// Agregar producto
btnAgregar.addEventListener("click", async (event) => {
    event.preventDefault();

    if (!nombreInput.value.trim() || !precioInput.value.trim() || !descripcionInput.value.trim()) {
        alert("Por favor, completa los campos de Nombre, Precio y Descripción.");
        return;
    }

    if (isNaN(precioInput.value) || precioInput.value <= 0) {
        alert("Por favor, ingresa un precio válido.");
        return;
    }

    const producto = {
        id: crypto.randomUUID(),
        nombre: nombreInput.value.trim(),
        precio: parseFloat(precioInput.value).toFixed(2),
        descripcion: descripcionInput.value.trim(),
        imagen: imagenUrlInput.value.trim() || ""
    };

    const resultado = await agregarProducto(producto);
    if (resultado) {
        mostrarMensaje("Producto agregado exitosamente");
        renderizarProductos();
        ocultarFormulario();
    } else {
        mostrarMensaje("Error al agregar el producto");
    }
});

// Buscar productos por nombre
function buscarProducto() {
    const terminoBusqueda = document.getElementById("buscarProducto").value.toLowerCase().trim();
    const noProductos = document.getElementById("noProductos");

    if (!terminoBusqueda) {
        renderizarProductos(); // Si no hay término de búsqueda, renderiza todos los productos
        return;
    }

    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(terminoBusqueda)
    );

    contenedorProductos.innerHTML = "";

    if (productosFiltrados.length === 0) {
        noProductos.style.display = "block"; // Muestra el mensaje de "no productos"
    } else {
        noProductos.style.display = "none"; // Oculta el mensaje de "no productos"
        productosFiltrados.forEach(producto => {
            const imgSrc = producto.imagen;

            const card = document.createElement("div");
            card.classList.add("card");
            card.innerHTML = `
                <img src="${imgSrc}" alt="${producto.nombre}" onerror="this.onerror=null; this.src='./image/placeholder.png';">
                <div class="card-container--info">
                    <h3>${producto.nombre}</h3>
                    <p>${producto.descripcion}</p>
                    <p>${producto.precio}</p>
                    <div class="iconos">
                        <i class="fa fa-edit" data-id="${producto.id}" title="Actualizar"></i>
                        <i class="fa fa-trash" data-id="${producto.id}" title="Eliminar"></i>
                    </div>
                </div>
            `;
            contenedorProductos.appendChild(card);
            
        });

        // Reasignar eventos para los botones de editar y eliminar en los productos filtrados
        document.querySelectorAll('.fa-edit').forEach(icono => {
            icono.addEventListener('click', event => {
                const id = event.target.dataset.id;
                if (id) configurarFormularioActualizar(id);
            });
        });

        document.querySelectorAll('.fa-trash').forEach(icono => {
            icono.addEventListener('click', event => {
                const id = event.target.dataset.id;
                if (id) eliminarProductoConfirmacion(id);
            });
        });
    }
}

// Inicializar el evento para el botón de búsqueda
document.getElementById("buscarProducto").addEventListener("input", buscarProducto);

// Función para mostrar todos los productos
function mostrarTodosLosProductos() {
    document.getElementById("buscarProducto").value = ""; // Limpia el campo de búsqueda
    renderizarProductos(); // Renderiza todos los productos
}

// Evento para el botón "Mostrar Todos"
document.getElementById("mostrarTodos").addEventListener("click", mostrarTodosLosProductos);

// Funcionalidad para mover el formulario (drag and drop)
let offsetX = 0;
let offsetY = 0;
let isDragging = false;

modalHeader.addEventListener('mousedown', (event) => {
    isDragging = true;
    offsetX = event.clientX - formularioProducto.offsetLeft;
    offsetY = event.clientY - formularioProducto.offsetTop;
    formularioProducto.style.transition = 'none';
});

document.addEventListener('mousemove', (event) => {
    if (isDragging) {
        formularioProducto.style.left = `${event.clientX - offsetX}px`;
        formularioProducto.style.top = `${event.clientY - offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
    formularioProducto.style.transition = '';
});

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
    renderizarProductos();

    // Botón del menú para agregar producto
    document.getElementById("btnMenuAgregar").addEventListener("click", configurarFormularioAgregar);
});

    const scrollUp = document.getElementById('scrollUp');

    // Mostrar/ocultar la flecha dependiendo de la posición de scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) { // Muestra la flecha al hacer scroll hacia abajo
            scrollUp.style.display = 'block';
        } else {
            scrollUp.style.display = 'none';
        }
    });

    // Desplazarse hacia arriba al hacer clic en la flecha
    scrollUp.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

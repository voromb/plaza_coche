// Lógica para la página de administrador
const authService = AuthService.getInstance();
const apiService = ApiService.getInstance();

// Proteger la ruta (solo admins)
if (!authService.requireAdmin()) {
    throw new Error('Acceso denegado');
}

// Variables globales
let currentEditingPlazaId = null;

// Elementos del DOM
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const messageDiv = document.getElementById('message');
const plazaModal = document.getElementById('plazaModal');
const plazaForm = document.getElementById('plazaForm');
const closeModal = document.querySelector('.close');
const addPlazaBtn = document.getElementById('addPlazaBtn');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    const user = authService.getCurrentUser();
    userName.textContent = `${user.nombre} ${user.apellidos} (Admin)`;

    initTabs();
    loadParkingSpots();
});

// Logout
logoutBtn.addEventListener('click', () => {
    authService.logout();
});

// Sistema de tabs
function initTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.getAttribute('data-tab');

            // Remover clase active de todos
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activar seleccionado
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // Cargar contenido según tab
            if (tabId === 'plazas') {
                loadParkingSpots();
            } else if (tabId === 'reservas') {
                loadAllReservations();
            } else if (tabId === 'usuarios') {
                loadUsers();
            }
        });
    });
}

// Cargar todas las plazas
async function loadParkingSpots() {
    try {
        const spots = await apiService.getAllParkingSpots();
        const container = document.getElementById('parkingSpotsList');

        if (spots.length === 0) {
            container.innerHTML = '<p>No hay plazas registradas</p>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Número</th>
                        <th>Ubicación</th>
                        <th>Descripción</th>
                        <th>Disponible</th>
                        <th>Activa</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${spots
                        .map(
                            spot => `
                        <tr>
                            <td><strong>${spot.numero}</strong></td>
                            <td>${spot.ubicacion}</td>
                            <td>${spot.descripcion || '-'}</td>
                            <td>
                                <span class="status ${spot.disponible ? 'disponible' : 'ocupada'}">
                                    ${spot.disponible ? 'Sí' : 'No'}
                                </span>
                            </td>
                            <td>
                                <span class="status ${spot.activa ? 'disponible' : 'ocupada'}">
                                    ${spot.activa ? 'Sí' : 'No'}
                                </span>
                            </td>
                            <td>
                                <button class="btn btn-primary btn-small" onclick="togglePlaza('${spot._id}')">
                                    ${spot.activa ? 'Desactivar' : 'Activar'}
                                </button>
                                <button class="btn btn-danger btn-small" onclick="deletePlaza('${spot._id}')">
                                    Eliminar
                                </button>
                            </td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        showMessage('Error al cargar plazas: ' + error.message, 'error');
    }
}

// Cargar todas las reservas
async function loadAllReservations() {
    try {
        const reservations = await apiService.getAllReservations();
        const container = document.getElementById('reservationsList');

        if (reservations.length === 0) {
            container.innerHTML = '<p>No hay reservas registradas</p>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Plaza</th>
                        <th>Ubicación</th>
                        <th>Fecha Inicio</th>
                        <th>Fecha Fin</th>
                        <th>Estado</th>
                    </tr>
                </thead>
                <tbody>
                    ${reservations
                        .map(res => {
                            const fechaInicio = new Date(res.fechaInicio).toLocaleDateString();
                            const fechaFin = new Date(res.fechaFin).toLocaleDateString();

                            return `
                            <tr>
                                <td>${res.userId.nombre} ${res.userId.apellidos}</td>
                                <td><strong>${res.parkingSpotId.numero}</strong></td>
                                <td>${res.parkingSpotId.ubicacion}</td>
                                <td>${fechaInicio}</td>
                                <td>${fechaFin}</td>
                                <td>
                                    <span class="status ${
                                        res.estado === 'activa' ? 'activa' : 'ocupada'
                                    }">
                                        ${res.estado}
                                    </span>
                                </td>
                            </tr>
                        `;
                        })
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        showMessage('Error al cargar reservas: ' + error.message, 'error');
    }
}

// Cargar usuarios
async function loadUsers() {
    try {
        const users = await apiService.getAllUsers();
        const container = document.getElementById('usersList');

        if (users.length === 0) {
            container.innerHTML = '<p>No hay usuarios registrados</p>';
            return;
        }

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Email</th>
                        <th>Rol</th>
                        <th>Fecha Registro</th>
                    </tr>
                </thead>
                <tbody>
                    ${users
                        .map(user => {
                            const fecha = new Date(user.createdAt).toLocaleDateString();
                            return `
                            <tr>
                                <td>${user.nombre} ${user.apellidos}</td>
                                <td>${user.email}</td>
                                <td>
                                    <span class="status ${
                                        user.role === 'admin' ? 'activa' : 'disponible'
                                    }">
                                        ${user.role}
                                    </span>
                                </td>
                                <td>${fecha}</td>
                            </tr>
                        `;
                        })
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        showMessage('Error al cargar usuarios: ' + error.message, 'error');
    }
}

// Abrir modal para crear plaza
addPlazaBtn.addEventListener('click', () => {
    currentEditingPlazaId = null;
    document.getElementById('modalTitle').textContent = 'Nueva Plaza';
    plazaForm.reset();
    plazaModal.classList.add('active');
});

// Cerrar modal
closeModal.addEventListener('click', () => {
    plazaModal.classList.remove('active');
    plazaForm.reset();
});

window.addEventListener('click', e => {
    if (e.target === plazaModal) {
        plazaModal.classList.remove('active');
        plazaForm.reset();
    }
});

// Crear plaza
plazaForm.addEventListener('submit', async e => {
    e.preventDefault();

    const numero = document.getElementById('numero').value;
    const ubicacion = document.getElementById('ubicacion').value;
    const descripcion = document.getElementById('descripcion').value;

    try {
        await apiService.createParkingSpot(numero, ubicacion, descripcion);
        showMessage('Plaza creada correctamente', 'success');
        plazaModal.classList.remove('active');
        plazaForm.reset();
        loadParkingSpots();
    } catch (error) {
        showMessage('Error al crear plaza: ' + error.message, 'error');
    }
});

// Eliminar plaza
async function deletePlaza(id) {
    if (!confirm('¿Estás seguro de que deseas eliminar esta plaza?')) {
        return;
    }

    try {
        await apiService.deleteParkingSpot(id);
        showMessage('Plaza eliminada correctamente', 'success');
        loadParkingSpots();
    } catch (error) {
        showMessage('Error al eliminar plaza: ' + error.message, 'error');
    }
}

// Activar/Desactivar plaza
async function togglePlaza(id) {
    try {
        const response = await apiService.toggleParkingSpot(id);
        showMessage(response.message, 'success');
        loadParkingSpots();
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Mostrar mensajes
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

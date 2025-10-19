// Lógica para la página de usuario
const authService = AuthService.getInstance();
const apiService = ApiService.getInstance();

// Proteger la ruta
if (!authService.requireAuth()) {
    throw new Error('No autorizado');
}

// Variables globales
let currentParkingSpotId = null;

// Elementos del DOM
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const parkingSpotsDiv = document.getElementById('parkingSpots');
const myReservationsDiv = document.getElementById('myReservations');
const messageDiv = document.getElementById('message');
const reserveModal = document.getElementById('reserveModal');
const reserveForm = document.getElementById('reserveForm');
const closeModal = document.querySelector('.close');

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    const user = authService.getCurrentUser();
    userName.textContent = `${user.nombre} ${user.apellidos}`;

    loadParkingSpots();
    loadMyReservations();
});

// Logout
logoutBtn.addEventListener('click', () => {
    authService.logout();
});

// Cargar plazas disponibles
async function loadParkingSpots() {
    try {
        const spots = await apiService.getParkingSpots();

        if (spots.length === 0) {
            parkingSpotsDiv.innerHTML = '<p>No hay plazas disponibles en este momento</p>';
            return;
        }

        parkingSpotsDiv.innerHTML = spots
            .map(
                spot => `
            <div class="card">
                <h3>Plaza ${spot.numero}</h3>
                <p><strong>Ubicación:</strong> ${spot.ubicacion}</p>
                <p>${spot.descripcion || 'Sin descripción'}</p>
                <span class="status disponible">Disponible</span>
                <button class="btn btn-primary btn-small" onclick="openReserveModal('${
                    spot._id
                }', '${spot.numero}')" style="margin-top: 1rem; width: 100%;">
                    Reservar
                </button>
            </div>
        `
            )
            .join('');
    } catch (error) {
        showMessage('Error al cargar plazas: ' + error.message, 'error');
    }
}

// Cargar mis reservas
async function loadMyReservations() {
    try {
        const reservations = await apiService.getMyReservations();

        if (reservations.length === 0) {
            myReservationsDiv.innerHTML = '<p>No tienes reservas activas</p>';
            return;
        }

        myReservationsDiv.innerHTML = reservations
            .map(res => {
                const fechaInicio = new Date(res.fechaInicio).toLocaleDateString();
                const fechaFin = new Date(res.fechaFin).toLocaleDateString();
                const estadoClass = res.estado === 'activa' ? 'activa' : 'ocupada';

                return `
                <div class="reservation-card">
                    <h4>Plaza ${res.parkingSpotId.numero}</h4>
                    <p><strong>Ubicación:</strong> ${res.parkingSpotId.ubicacion}</p>
                    <p><strong>Desde:</strong> ${fechaInicio}</p>
                    <p><strong>Hasta:</strong> ${fechaFin}</p>
                    <span class="status ${estadoClass}">${res.estado}</span>
                    ${
                        res.estado === 'activa'
                            ? `
                        <div class="reservation-actions">
                            <button class="btn btn-danger btn-small" onclick="cancelReservation('${res._id}')">
                                Cancelar
                            </button>
                        </div>
                    `
                            : ''
                    }
                </div>
            `;
            })
            .join('');
    } catch (error) {
        showMessage('Error al cargar reservas: ' + error.message, 'error');
    }
}

// Abrir modal de reserva
function openReserveModal(parkingSpotId, numero) {
    currentParkingSpotId = parkingSpotId;
    document.getElementById('modalPlazaNumero').textContent = numero;

    // Establecer fecha mínima como hoy
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fechaInicio').setAttribute('min', today);
    document.getElementById('fechaFin').setAttribute('min', today);

    reserveModal.classList.add('active');
}

// Cerrar modal
closeModal.addEventListener('click', () => {
    reserveModal.classList.remove('active');
    reserveForm.reset();
});

window.addEventListener('click', e => {
    if (e.target === reserveModal) {
        reserveModal.classList.remove('active');
        reserveForm.reset();
    }
});

// Crear reserva
reserveForm.addEventListener('submit', async e => {
    e.preventDefault();

    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    // Validar fechas
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
        showMessage('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
        return;
    }

    try {
        await apiService.createReservation(currentParkingSpotId, fechaInicio, fechaFin);
        showMessage('Reserva creada correctamente', 'success');
        reserveModal.classList.remove('active');
        reserveForm.reset();
        loadParkingSpots();
        loadMyReservations();
    } catch (error) {
        showMessage('Error al crear reserva: ' + error.message, 'error');
    }
});

// Cancelar reserva
async function cancelReservation(reservationId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        return;
    }

    try {
        await apiService.cancelReservation(reservationId);
        showMessage('Reserva cancelada correctamente', 'success');
        loadParkingSpots();
        loadMyReservations();
    } catch (error) {
        showMessage('Error al cancelar reserva: ' + error.message, 'error');
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

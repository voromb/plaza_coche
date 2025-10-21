// Lógica para la página de administrador
const authService = AuthService.getInstance();
const apiService = ApiService.getInstance();

// Proteger la ruta (solo admins)
if (!authService.requireAdmin()) {
    throw new Error('Acceso denegado');
}

// Variables para guardar ids cuando se editan o asignan plazas
let currentEditingPlazaId = null;
let currentAssignPlazaId = null;

// Elementos del DOM
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const messageDiv = document.getElementById('message');
const plazaModal = document.getElementById('plazaModal');
const plazaForm = document.getElementById('plazaForm');
const closeModal = document.querySelector('.close');
const addPlazaBtn = document.getElementById('addPlazaBtn');
const assignPlazaModal = document.getElementById('assignPlazaModal');
const usuarioSelect = document.getElementById('usuarioSelect');
const confirmAssignBtn = document.getElementById('confirmAssignBtn');

// Cargar datos al abrir la página
document.addEventListener('DOMContentLoaded', () => {
    const user = authService.getCurrentUser();
    userName.textContent = `${user.nombre} ${user.apellidos} (Admin)`;

    initTabs();
    loadParkingSpots();
});

// Cerrar sesión
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

            // Desactivar todos los tabs
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Activar el tab seleccionado
            btn.classList.add('active');
            document.getElementById(tabId).classList.add('active');

            // Cargar los datos según el tab
            if (tabId === 'plazas') {
                loadParkingSpots();
            } else if (tabId === 'usuarios') {
                loadUsers();
            } else if (tabId === 'uso') {
                loadUsageList();
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
                        <th>Estado</th>
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
                                <label class="toggle-switch">
                                    <input type="checkbox" ${
                                        spot.activa ? 'checked' : ''
                                    } onchange="togglePlaza('${spot._id}')">
                                    <span class="toggle-slider"></span>
                                </label>
                            </td>
                            <td>
                                <button class="btn btn-success btn-small" onclick="openAssignPlazaModal('${
                                    spot._id
                                }')">
                                    Asignar
                                </button>
                                ${
                                    spot.disponible === false
                                        ? `<button class="btn btn-warning btn-small" onclick="unassignPlaza('${spot._id}')">Liberar</button>`
                                        : ''
                                }
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

// Cargar todos los usuarios
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

// Cerrar modales
closeModal.addEventListener('click', () => {
    plazaModal.classList.remove('active');
    plazaForm.reset();
});

window.addEventListener('click', e => {
    if (e.target === plazaModal) {
        plazaModal.classList.remove('active');
        plazaForm.reset();
    }
    if (e.target === assignPlazaModal) {
        assignPlazaModal.classList.remove('active');
    }
});

document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', function () {
        this.closest('.modal').classList.remove('active');
    });
});

// Crear nueva plaza
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

// Activar o desactivar una plaza
async function togglePlaza(id) {
    try {
        const response = await apiService.toggleParkingSpot(id);
        showMessage(response.message, 'success');
        loadParkingSpots();
    } catch (error) {
        showMessage('Error: ' + error.message, 'error');
    }
}

// Mostrar mensajes en pantalla
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Abrir modal para asignar plaza a usuario
async function openAssignPlazaModal(plazaId) {
    currentAssignPlazaId = plazaId;

    try {
        const users = await apiService.getAllUsers();
        // Mostrar solo los usuarios normales (no admins)
        usuarioSelect.innerHTML = users
            .filter(u => u.role === 'user')
            .map(u => `<option value="${u._id}">${u.nombre} ${u.apellidos} (${u.email})</option>`)
            .join('');

        assignPlazaModal.classList.add('active');
    } catch (error) {
        showMessage('Error al cargar usuarios: ' + error.message, 'error');
    }
}

// Confirmar asignación de plaza
confirmAssignBtn.addEventListener('click', async () => {
    const userId = usuarioSelect.value;

    if (!userId) {
        showMessage('Selecciona un usuario', 'error');
        return;
    }

    try {
        await apiService.assignPlaza(currentAssignPlazaId, userId);
        showMessage('Plaza asignada correctamente', 'success');
        assignPlazaModal.classList.remove('active');
        loadParkingSpots();
    } catch (error) {
        showMessage('Error al asignar plaza: ' + error.message, 'error');
    }
});

// Liberar una plaza asignada
async function unassignPlaza(plazaId) {
    if (!confirm('¿Liberar esta plaza?')) {
        return;
    }

    try {
        await apiService.unassignPlaza(plazaId);
        showMessage('Plaza liberada', 'success');
        loadParkingSpots();
    } catch (error) {
        showMessage('Error al liberar plaza: ' + error.message, 'error');
    }
}

// Cargar y mostrar uso del cargador de todos los usuarios
async function loadUsageList() {
    try {
        const usuarios = await apiService.getUsuariosHoras();
        const container = document.getElementById('usageList');
        const filterUser = document.getElementById('filterUser');

        if (!usuarios || usuarios.length === 0) {
            container.innerHTML = '<p>No hay usuarios registrados</p>';
            return;
        }

        // Llenar el dropdown de usuarios
        filterUser.innerHTML = '<option value="">Selecciona un usuario...</option>';
        usuarios.forEach(user => {
            const option = document.createElement('option');
            option.value = user._id;
            option.textContent = `${user.nombre} ${user.apellidos}`;
            filterUser.appendChild(option);
        });

        container.innerHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Usuario</th>
                        <th>Email</th>
                        <th>Total Horas</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${usuarios
                        .map(
                            user => `
                        <tr>
                            <td>${user.nombre} ${user.apellidos}</td>
                            <td>${user.email}</td>
                            <td>${user.horasUtilizadas || 0}h</td>
                            <td>
                                <button class="btn btn-sm btn-primary" onclick="openUsageHistoryModal('${user._id}', '${user.nombre} ${user.apellidos}')">Ver Histórico</button>
                            </td>
                        </tr>
                    `
                        )
                        .join('')}
                </tbody>
            </table>
        `;
    } catch (error) {
        showMessage('Error al cargar uso: ' + error.message, 'error');
    }
}

// Buscar uso semanal de un usuario específico
document.getElementById('filterBtn').addEventListener('click', async () => {
    const userId = document.getElementById('filterUser').value;
    const semana = document.getElementById('filterWeek').value;
    const container = document.getElementById('usageList');

    if (!userId) {
        showMessage('Selecciona un usuario', 'error');
        return;
    }

    if (!semana) {
        showMessage('Ingresa una semana (Ej: 2025-43)', 'error');
        return;
    }

    try {
        // Obtener historial y buscar la semana
        const usage = await apiService.getUserUsageHistory(userId);
        const weekData = usage.find(u => u.semana === semana);

        if (!weekData) {
            showMessage(`No hay datos para la semana ${semana}`, 'warning');
            container.innerHTML = '<p>No hay datos disponibles para esa semana</p>';
            return;
        }

        // Mostrar datos de esa semana
        let html = '<table><thead><tr><th>Día</th><th>Horas</th></tr></thead><tbody>';
        if (weekData.detalleHoras && weekData.detalleHoras.length > 0) {
            weekData.detalleHoras.forEach(dia => {
                html += `<tr><td>${dia.dia}</td><td>${dia.horas}h</td></tr>`;
            });
        }
        html += `</tbody></table>`;
        html += `<p style="margin-top: 1rem;"><strong>Total semana ${semana}: ${weekData.horasUtilizadas}h</strong></p>`;

        container.innerHTML = html;
    } catch (error) {
        showMessage('Error al buscar datos: ' + error.message, 'error');
    }
});

// Abrir modal para ver histórico de un usuario
async function openUsageHistoryModal(userId, userName) {
    try {
        const usage = await apiService.getUserUsageHistory(userId);
        const weekSelect = document.getElementById('usageWeekSelect');
        const modalTitle = document.getElementById('usageModalTitle');
        
        modalTitle.textContent = `Histórico - ${userName}`;
        
        weekSelect.innerHTML = '';
        if (usage && usage.length > 0) {
            usage.forEach(item => {
                const option = document.createElement('option');
                option.value = item.semana;
                option.textContent = `Semana ${item.semana} - ${item.horasUtilizadas}h`;
                weekSelect.appendChild(option);
            });
        } else {
            weekSelect.innerHTML = '<option>Sin histórico</option>';
        }

        // Guardar el userId actual para usar después
        window.currentUsageUserId = userId;
        document.getElementById('editUsageModal').classList.add('active');
    } catch (error) {
        showMessage('Error al cargar histórico: ' + error.message, 'error');
    }
}

// Guardar horas editadas
document.getElementById('saveUsageBtn').addEventListener('click', async () => {
    const userId = window.currentUsageUserId;
    const semana = document.getElementById('usageWeekSelect').value;
    const dia = document.getElementById('usageDaySelect').value;
    const horas = parseFloat(document.getElementById('usageHoursInput').value);

    if (!semana || !dia || isNaN(horas)) {
        showMessage('Completa todos los campos', 'error');
        return;
    }

    try {
        await apiService.updateUserWeeklyUsage(userId, semana, dia, horas);
        showMessage('Horas actualizadas correctamente', 'success');
        document.getElementById('editUsageModal').classList.remove('active');
        loadUsageList();
    } catch (error) {
        showMessage('Error al actualizar horas: ' + error.message, 'error');
    }
});

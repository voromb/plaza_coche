// Lógica para la página de usuario
const authService = AuthService.getInstance();
const apiService = ApiService.getInstance();

// Proteger la ruta - si no está autenticado, no entra
if (!authService.requireAuth()) {
    throw new Error('No autorizado');
}

// Variables para guardar datos mientras el usuario está en la página
let currentParkingSpotId = null;
let selectedHours = {};

// Elementos del DOM - los elementos HTML que vamos a usar desde JavaScript
const userName = document.getElementById('userName');
const logoutBtn = document.getElementById('logoutBtn');
const messageDiv = document.getElementById('message');
const scheduleModal = document.getElementById('scheduleModal');
const scheduleGrid = document.getElementById('scheduleGrid');
const saveScheduleBtn = document.getElementById('saveScheduleBtn');
const scheduleDisplay = document.getElementById('scheduleDisplay');
const editScheduleBtn = document.getElementById('editScheduleBtn');
const weeklyHours = document.getElementById('weeklyHours');
const usageBar = document.getElementById('usageBar');
const usageDetails = document.getElementById('usageDetails');
const chargerAssignment = document.getElementById('chargerAssignment');

// Cuando la página carga, mostrar datos del usuario, su horario y uso semanal
document.addEventListener('DOMContentLoaded', () => {
    const user = authService.getCurrentUser();
    userName.textContent = `${user.nombre} ${user.apellidos}`;
    
    initTabs();
    loadChargerAssignment();
    loadScheduleDisplay();
    loadWeeklyUsage();
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
        });
    });
}

// Cerrar sesión
logoutBtn.addEventListener('click', () => {
    authService.logout();
});

// Mostrar mensajes en pantalla (éxito, error, etc)
function showMessage(text, type) {
    messageDiv.textContent = text;
    messageDiv.className = 'message ' + type;
    messageDiv.style.display = 'block';

    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
}

// Abrir formulario para introducir horario
editScheduleBtn.addEventListener('click', () => {
    renderScheduleGrid();
    scheduleModal.classList.add('active');
});

// Cerrar modales
document.querySelectorAll('.close').forEach(btn => {
    btn.addEventListener('click', function () {
        this.closest('.modal').classList.remove('active');
    });
});

// Crear la tabla clickeable con días y horas
function renderScheduleGrid() {
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];
    const horas = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21];

    selectedHours = {};
    dias.forEach(dia => {
        selectedHours[dia] = [];
    });

    let html = '<div class="schedule-table">';
    html += '<div class="schedule-header"><div></div>';

    dias.forEach(dia => {
        html += `<div class="schedule-day">${dia}</div>`;
    });
    html += '</div>';

    horas.forEach(hora => {
        html += `<div class="schedule-row"><div class="schedule-hour">${hora}:00</div>`;
        dias.forEach(dia => {
            html += `<div class="schedule-cell" data-dia="${dia}" data-hora="${hora}"></div>`;
        });
        html += '</div>';
    });

    html += '</div>';
    scheduleGrid.innerHTML = html;

    // Evento para seleccionar/deseleccionar horas
    document.querySelectorAll('.schedule-cell').forEach(cell => {
        cell.addEventListener('click', function () {
            this.classList.toggle('selected');
        });
    });
}

// Guardar horario seleccionado
saveScheduleBtn.addEventListener('click', async () => {
    const horarios = [];
    const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

    // Recopilar las horas seleccionadas por día
    dias.forEach(dia => {
        const horas = [];
        document.querySelectorAll(`.schedule-cell.selected[data-dia="${dia}"]`).forEach(cell => {
            horas.push(parseInt(cell.getAttribute('data-hora')));
        });
        if (horas.length > 0) {
            horarios.push({ dia, horas });
        }
    });

    if (horarios.length === 0) {
        showMessage('Debes seleccionar al menos una hora', 'error');
        return;
    }

    try {
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const año = hoy.getFullYear();

        await apiService.saveSchedule(horarios, mes, año);
        showMessage('Horario guardado correctamente', 'success');
        scheduleModal.classList.remove('active');
        loadScheduleDisplay();
    } catch (error) {
        showMessage('Error al guardar horario: ' + error.message, 'error');
    }
});

// Cargar y mostrar el horario del usuario
async function loadScheduleDisplay() {
    try {
        const schedule = await apiService.getSchedule();

        if (!schedule) {
            scheduleDisplay.innerHTML = '<p>No hay horario registrado para este mes</p>';
            editScheduleBtn.style.display = 'block';
            return;
        }

        let html = '<table><thead><tr><th>Día</th><th>Horas</th></tr></thead><tbody>';
        schedule.horarios.forEach(item => {
            html += `<tr><td>${item.dia}</td><td>${item.horas.join(', ')}</td></tr>`;
        });
        html += '</tbody></table>';

        scheduleDisplay.innerHTML = html;
        editScheduleBtn.style.display = 'none';
    } catch (error) {
        console.error('Error al cargar horario:', error);
    }
}

// Cargar y mostrar el uso semanal del cargador
async function loadWeeklyUsage() {
    try {
        const usage = await apiService.getWeeklyUsage();

        if (!usage) {
            weeklyHours.textContent = '0 horas';
            usageBar.style.width = '0%';
            usageDetails.innerHTML = '<p>Sin registro de uso esta semana</p>';
            return;
        }

        // Mostrar total de horas (máximo 40 horas en 5 días = 8 horas/día)
        const maxHoras = 40;
        const porcentaje = Math.min((usage.horasUtilizadas / maxHoras) * 100, 100);

        weeklyHours.textContent = `${usage.horasUtilizadas} horas`;
        usageBar.style.width = `${porcentaje}%`;

        // Mostrar detalle por día
        let html = '<table class="usage-table"><tbody>';
        usage.detalleHoras.forEach(item => {
            html += `<tr><td>${item.dia}</td><td>${item.horas}h</td></tr>`;
        });
        html += '</tbody></table>';

        usageDetails.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar uso semanal:', error);
    }
}

// Cargar y mostrar las horas asignadas para esta semana
async function loadChargerAssignment() {
    try {
        const usage = await apiService.getWeeklyUsage();
        const schedule = await apiService.getSchedule();

        if (!usage) {
            chargerAssignment.innerHTML = '<p>No hay asignación de cargador esta semana</p>';
            return;
        }

        // Crear un mapa de horarios por día para búsqueda rápida
        const horariosPorDia = {};
        if (schedule && schedule.horarios) {
            schedule.horarios.forEach(item => {
                horariosPorDia[item.dia] = item.horas;
            });
        }

        let html = '<div class="assignment-info">';
        html += `<p class="assignment-hours">Te tocan <strong>${usage.horasUtilizadas} horas</strong> esta semana</p>`;
        html += '<p class="assignment-detail">Distribuido por días:</p>';
        html += '<table><tbody>';
        
        usage.detalleHoras.forEach(item => {
            // Obtener las horas específicas del horario
            const horasDelDia = horariosPorDia[item.dia] || [];
            let horasTexto = `${item.horas}h`;
            
            // Si tiene horas asignadas, mostrar el rango (primeras N horas)
            if (horasDelDia.length > 0 && item.horas > 0) {
                const primerasHoras = horasDelDia.slice(0, item.horas);
                const primerHora = Math.min(...primerasHoras);
                const ultimaHora = Math.max(...primerasHoras) + 1;
                horasTexto = `${item.horas}h (${primerHora}:00 - ${ultimaHora}:00)`;
            }
            
            html += `<tr><td>${item.dia}</td><td>${horasTexto}</td></tr>`;
        });
        
        html += '</tbody></table></div>';
        chargerAssignment.innerHTML = html;
    } catch (error) {
        console.error('Error al cargar asignación:', error);
        chargerAssignment.innerHTML = '<p>Error cargando información</p>';
    }
}

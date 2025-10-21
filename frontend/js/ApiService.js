// Patrón Singleton para gestionar todas las llamadas a la API
class ApiService {
    static instance = null;

    constructor() {
        if (ApiService.instance) {
            return ApiService.instance;
        }

        this.baseURL = 'http://localhost:3010/api';
        ApiService.instance = this;
    }

    static getInstance() {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    // Método genérico para todas las peticiones (GET, POST, PUT, DELETE)
    async request(endpoint, options = {}) {
        const token = localStorage.getItem('token');

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            ...options,
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Error en la petición');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // Login
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    // Registro de usuario
    async register(email, password, nombre, apellidos) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, nombre, apellidos }),
        });
    }

    // Obtener plazas disponibles
    async getParkingSpots() {
        return this.request('/user/parking-spots');
    }

    // Crear reserva en plaza
    async createReservation(parkingSpotId, fechaInicio, fechaFin) {
        return this.request('/user/reserve', {
            method: 'POST',
            body: JSON.stringify({ parkingSpotId, fechaInicio, fechaFin }),
        });
    }

    // Ver reservas del usuario
    async getMyReservations() {
        return this.request('/user/my-reservations');
    }

    // Cancelar reserva
    async cancelReservation(reservationId) {
        return this.request(`/user/cancel-reservation/${reservationId}`, {
            method: 'DELETE',
        });
    }

    // Obtener todas las reservas (admin)
    async getAllReservations() {
        return this.request('/admin/all-reservations');
    }

    // Obtener todas las plazas (admin)
    async getAllParkingSpots() {
        return this.request('/admin/parking-spots');
    }

    // Crear nueva plaza (admin)
    async createParkingSpot(numero, ubicacion, descripcion) {
        return this.request('/admin/parking-spot', {
            method: 'POST',
            body: JSON.stringify({ numero, ubicacion, descripcion }),
        });
    }

    // Actualizar datos de una plaza (admin)
    async updateParkingSpot(id, data) {
        return this.request(`/admin/parking-spot/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    // Activar/desactivar plaza (admin)
    async toggleParkingSpot(id) {
        return this.request(`/admin/parking-spot/${id}/toggle`, {
            method: 'PUT',
        });
    }

    // Eliminar plaza (admin)
    async deleteParkingSpot(id) {
        return this.request(`/admin/parking-spot/${id}`, {
            method: 'DELETE',
        });
    }

    // Obtener lista de usuarios (admin)
    async getAllUsers() {
        return this.request('/admin/users');
    }

    // Guardar horario semanal del usuario
    async saveSchedule(horarios, mes, año) {
        return this.request('/user/schedule', {
            method: 'POST',
            body: JSON.stringify({ horarios, mes, año }),
        });
    }

    // Obtener horario actual del usuario
    async getSchedule() {
        return this.request('/user/schedule');
    }

    // Asignar plaza a un usuario (admin)
    async assignPlaza(plazaId, userId) {
        return this.request(`/admin/assign-plaza/${plazaId}/user/${userId}`, {
            method: 'POST',
        });
    }

    // Liberar plaza (admin)
    async unassignPlaza(plazaId) {
        return this.request(`/admin/unassign-plaza/${plazaId}`, {
            method: 'POST',
        });
    }

    // Obtener horas utilizadas de un usuario (admin)
    async getHorasUtilizadas(userId) {
        return this.request(`/admin/user/${userId}/horas-utilizadas`);
    }

    // Actualizar horas utilizadas de un usuario (admin)
    async updateHorasUtilizadas(userId, horas) {
        return this.request(`/admin/user/${userId}/horas-utilizadas`, {
            method: 'PUT',
            body: JSON.stringify({ horas }),
        });
    }

    // Obtener todos los usuarios con sus horas (admin)
    async getUsuariosHoras() {
        return this.request('/admin/usuarios-horas');
    }

    // Obtener uso semanal actual del usuario
    async getWeeklyUsage() {
        return this.request('/user/weekly-usage');
    }

    // Agregar horas al uso semanal
    async addWeeklyUsage(horas, dia) {
        return this.request('/user/weekly-usage/add', {
            method: 'POST',
            body: JSON.stringify({ horas, dia }),
        });
    }

    // Obtener histórico de uso semanal de un usuario (admin)
    async getUserUsageHistory(userId) {
        return this.request(`/admin/user/${userId}/usage-history`);
    }

    // Obtener uso semanal de un usuario (admin)
    async getUserWeeklyUsage(userId) {
        return this.request(`/admin/user/${userId}/weekly-usage`);
    }

    // Actualizar horas de un usuario en una semana (admin)
    async updateUserWeeklyUsage(userId, semana, dia, horas) {
        return this.request(`/admin/user/${userId}/weekly-usage`, {
            method: 'PUT',
            body: JSON.stringify({ semana, dia, horas }),
        });
    }
}

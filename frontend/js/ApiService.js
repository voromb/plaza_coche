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

    // Método genérico para hacer peticiones
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

    // Auth endpoints
    async login(email, password) {
        return this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password }),
        });
    }

    async register(email, password, nombre, apellidos) {
        return this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify({ email, password, nombre, apellidos }),
        });
    }

    // User endpoints
    async getParkingSpots() {
        return this.request('/user/parking-spots');
    }

    async createReservation(parkingSpotId, fechaInicio, fechaFin) {
        return this.request('/user/reserve', {
            method: 'POST',
            body: JSON.stringify({ parkingSpotId, fechaInicio, fechaFin }),
        });
    }

    async getMyReservations() {
        return this.request('/user/my-reservations');
    }

    async cancelReservation(reservationId) {
        return this.request(`/user/cancel-reservation/${reservationId}`, {
            method: 'DELETE',
        });
    }

    // Admin endpoints
    async getAllReservations() {
        return this.request('/admin/all-reservations');
    }

    async getAllParkingSpots() {
        return this.request('/admin/parking-spots');
    }

    async createParkingSpot(numero, ubicacion, descripcion) {
        return this.request('/admin/parking-spot', {
            method: 'POST',
            body: JSON.stringify({ numero, ubicacion, descripcion }),
        });
    }

    async updateParkingSpot(id, data) {
        return this.request(`/admin/parking-spot/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async toggleParkingSpot(id) {
        return this.request(`/admin/parking-spot/${id}/toggle`, {
            method: 'PUT',
        });
    }

    async deleteParkingSpot(id) {
        return this.request(`/admin/parking-spot/${id}`, {
            method: 'DELETE',
        });
    }

    async getAllUsers() {
        return this.request('/admin/users');
    }
}

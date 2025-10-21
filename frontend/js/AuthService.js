// Patrón Singleton para gestionar autenticación y sesión
class AuthService {
    static instance = null;

    constructor() {
        if (AuthService.instance) {
            return AuthService.instance;
        }

        this.apiService = ApiService.getInstance();
        this.currentUser = null;
        this.token = null;

        // Cargar sesión guardada si existe
        this.loadSession();

        AuthService.instance = this;
    }

    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // Recuperar token y usuario de localStorage
    loadSession() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            this.token = token;
            this.currentUser = JSON.parse(user);
        }
    }

    // Guardar token y usuario en localStorage
    saveSession(token, user) {
        this.token = token;
        this.currentUser = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Limpiar sesión (logout)
    clearSession() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Hacer login con email y contraseña
    async login(email, password) {
        try {
            const response = await this.apiService.login(email, password);
            this.saveSession(response.token, response.user);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Registrar nuevo usuario
    async register(email, password, nombre, apellidos) {
        try {
            const response = await this.apiService.register(email, password, nombre, apellidos);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Cerrar sesión y volver a inicio
    logout() {
        this.clearSession();
        window.location.href = 'index.html';
    }

    // Verificar si hay sesión activa
    isAuthenticated() {
        return this.token !== null && this.currentUser !== null;
    }

    // Obtener datos del usuario autenticado
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si el usuario es admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Redirigir si no está autenticado
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // Redirigir si no es admin
    requireAdmin() {
        if (!this.requireAuth()) return false;

        if (!this.isAdmin()) {
            window.location.href = 'user.html';
            return false;
        }
        return true;
    }
}

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

        // Cargar datos de sesión si existen
        this.loadSession();

        AuthService.instance = this;
    }

    static getInstance() {
        if (!AuthService.instance) {
            AuthService.instance = new AuthService();
        }
        return AuthService.instance;
    }

    // Cargar sesión desde localStorage
    loadSession() {
        const token = localStorage.getItem('token');
        const user = localStorage.getItem('user');

        if (token && user) {
            this.token = token;
            this.currentUser = JSON.parse(user);
        }
    }

    // Guardar sesión en localStorage
    saveSession(token, user) {
        this.token = token;
        this.currentUser = user;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
    }

    // Limpiar sesión
    clearSession() {
        this.token = null;
        this.currentUser = null;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    // Login
    async login(email, password) {
        try {
            const response = await this.apiService.login(email, password);
            this.saveSession(response.token, response.user);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Register
    async register(email, password, nombre, apellidos) {
        try {
            const response = await this.apiService.register(email, password, nombre, apellidos);
            return response;
        } catch (error) {
            throw error;
        }
    }

    // Logout
    logout() {
        this.clearSession();
        window.location.href = 'index.html';
    }

    // Verificar si está autenticado
    isAuthenticated() {
        return this.token !== null && this.currentUser !== null;
    }

    // Obtener usuario actual
    getCurrentUser() {
        return this.currentUser;
    }

    // Verificar si es admin
    isAdmin() {
        return this.currentUser && this.currentUser.role === 'admin';
    }

    // Proteger rutas
    requireAuth() {
        if (!this.isAuthenticated()) {
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    requireAdmin() {
        if (!this.requireAuth()) return false;

        if (!this.isAdmin()) {
            window.location.href = 'user.html';
            return false;
        }
        return true;
    }
}

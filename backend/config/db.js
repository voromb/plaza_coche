const mongoose = require('mongoose');

// Patrón Singleton para asegurar una única conexión a MongoDB
class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.connection = null;
        Database.instance = this;
        this.connect();
    }

    // Conectar a la base de datos MongoDB
    async connect() {
        try {
            const mongoURI = process.env.MONGO_URI || 'mongodb://mongodb:27017/plaza_coche';

            this.connection = await mongoose.connect(mongoURI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });

            console.log('MongoDB conectado correctamente');
        } catch (error) {
            console.error('Error al conectar MongoDB:', error);
            process.exit(1);
        }
    }

    // Obtener la conexión establecida
    getConnection() {
        return this.connection;
    }
}

// Instancia única de la conexión
const database = new Database();

module.exports = database;

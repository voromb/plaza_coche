const mongoose = require('mongoose');

// Patrón Singleton para la conexión a MongoDB
class Database {
    constructor() {
        if (Database.instance) {
            return Database.instance;
        }

        this.connection = null;
        Database.instance = this;
        this.connect();
    }

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

    getConnection() {
        return this.connection;
    }
}

// Crear instancia única
const database = new Database();

module.exports = database;

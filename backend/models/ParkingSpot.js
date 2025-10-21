const mongoose = require('mongoose');

// Esquema de plaza de estacionamiento
const parkingSpotSchema = new mongoose.Schema({
    numero: {
        type: String,
        required: true,
        unique: true,
    },
    // Si está disponible para asignar a un usuario
    disponible: {
        type: Boolean,
        default: true,
    },
    // Si está activada o desactivada por el admin
    activa: {
        type: Boolean,
        default: true,
    },
    ubicacion: {
        type: String,
        required: true,
    },
    descripcion: {
        type: String,
        default: '',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('ParkingSpot', parkingSpotSchema);

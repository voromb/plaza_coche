const mongoose = require('mongoose');

const parkingSpotSchema = new mongoose.Schema({
    numero: {
        type: String,
        required: true,
        unique: true,
    },
    disponible: {
        type: Boolean,
        default: true,
    },
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

const mongoose = require('mongoose');

// Esquema de reserva de plaza
const reservationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    parkingSpotId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ParkingSpot',
        required: true,
    },
    fechaInicio: {
        type: Date,
        required: true,
    },
    fechaFin: {
        type: Date,
        required: true,
    },
    // Estado de la reserva: activa, completada o cancelada
    estado: {
        type: String,
        enum: ['activa', 'completada', 'cancelada'],
        default: 'activa',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Reservation', reservationSchema);

const mongoose = require('mongoose');

// Esquema para guardar el horario semanal de cada usuario
const scheduleSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Array de días con horas disponibles
    horarios: [
        {
            dia: {
                type: String,
                enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
            },
            horas: [Number],
        },
    ],
    mes: {
        type: Number,
        required: true,
    },
    año: {
        type: Number,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Schedule', scheduleSchema);

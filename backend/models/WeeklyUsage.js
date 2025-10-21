const mongoose = require('mongoose');

// Esquema para guardar el historial de uso semanal del cargador
const weeklyUsageSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Semana en formato YYYY-WW (ej: 2025-43)
    semana: {
        type: String,
        required: true,
    },
    // Total de horas utilizadas esa semana
    horasUtilizadas: {
        type: Number,
        default: 0,
    },
    // Detalle por día (lunes a viernes)
    detalleHoras: [
        {
            dia: {
                type: String,
                enum: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
            },
            horas: {
                type: Number,
                default: 0,
            },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Crear índice único para usuario + semana
weeklyUsageSchema.index({ userId: 1, semana: 1 }, { unique: true });

module.exports = mongoose.model('WeeklyUsage', weeklyUsageSchema);

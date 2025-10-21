const cron = require('node-cron');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const WeeklyUsage = require('../models/WeeklyUsage');

// Función para calcular el número de semana (mismo formato que seed-data.js)
const getWeekNumber = date => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNumber).padStart(2, '0')}`;
};

// Función para asignar cargador automáticamente
const autoAssignCharger = async () => {
    try {
        console.log('Iniciando asignación automática de cargador...');

        // Obtener semana anterior
        const hoy = new Date();
        const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        const semanaAnterior = getWeekNumber(hace7Dias);

        // Obtener todos los usuarios activos
        const usuarios = await User.find({ role: 'user' });

        if (usuarios.length === 0) {
            console.log('No hay usuarios registrados');
            return;
        }

        // Obtener uso de la semana anterior para cada usuario
        const usosSemanaPasada = {};
        for (const usuario of usuarios) {
            const uso = await WeeklyUsage.findOne({
                userId: usuario._id,
                semana: semanaAnterior,
            });
            usosSemanaPasada[usuario._id] = uso ? uso.horasUtilizadas : 0;
        }

        // Ordenar usuarios por horas utilizadas (menor primero)
        const usuariosOrdenados = usuarios.sort((a, b) => {
            return usosSemanaPasada[a._id] - usosSemanaPasada[b._id];
        });

        // Asignar horas equitativas basadas en el horario del usuario
        const semanaActual = getWeekNumber(hoy);
        const mes = hoy.getMonth() + 1;
        const año = hoy.getFullYear();
        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

        let usuariosAsignados = 0;

        for (const usuario of usuariosOrdenados) {
            // Obtener horario del usuario
            const schedule = await Schedule.findOne({
                userId: usuario._id,
                mes: mes,
                año: año,
            });

            // Si no tiene horario, no se puede asignar
            if (!schedule) {
                continue;
            }

            // Calcular horas disponibles por día desde el horario
            const horasPorDia = {};
            dias.forEach(dia => {
                horasPorDia[dia] = 0;
            });

            schedule.horarios.forEach(item => {
                if (item.horas && item.horas.length > 0) {
                    // Contar horas pero limitar a máximo 2 horas por día
                    horasPorDia[item.dia] = Math.min(item.horas.length, 2);
                }
            });

            // Crear detalleHoras basado en disponibilidad
            const detalleHoras = [];
            let totalHoras = 0;

            dias.forEach(dia => {
                const horas = horasPorDia[dia];
                detalleHoras.push({
                    dia: dia,
                    horas: horas,
                });
                totalHoras += horas;
            });

            // Crear o actualizar registro de uso semanal
            let weeklyUsage = await WeeklyUsage.findOne({
                userId: usuario._id,
                semana: semanaActual,
            });

            if (!weeklyUsage) {
                weeklyUsage = new WeeklyUsage({
                    userId: usuario._id,
                    semana: semanaActual,
                    horasUtilizadas: totalHoras,
                    detalleHoras: detalleHoras,
                });
            } else {
                // Si ya tiene asignación, actualizar con las nuevas horas
                weeklyUsage.horasUtilizadas = totalHoras;
                weeklyUsage.detalleHoras = detalleHoras;
            }

            await weeklyUsage.save();
            usuariosAsignados++;
        }

        console.log(`Cargador asignado a ${usuariosAsignados} usuarios`);
    } catch (error) {
        console.error('Error en asignación automática:', error);
    }
};

// Programar job cada lunes a las 00:00
// Formato: segundo minuto hora día_mes día_semana
// 0 0 0 * * 1 = cada lunes a las 00:00
const initChargerAssignmentJob = () => {
    cron.schedule('0 0 0 * * 1', () => {
        console.log('Ejecutando asignación automática de cargador (cada lunes)');
        autoAssignCharger();
    });
    console.log('Job de asignación de cargador programado para cada lunes a las 00:00');
};

module.exports = { initChargerAssignmentJob, autoAssignCharger };

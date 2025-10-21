const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const ParkingSpot = require('../models/ParkingSpot');
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

// Todas las rutas de usuario requieren autenticación
router.use(verifyToken);

// GET /api/user/parking-spots - Plazas disponibles y activas
router.get('/parking-spots', async (req, res) => {
    try {
        const parkingSpots = await ParkingSpot.find({ disponible: true, activa: true });
        res.json(parkingSpots);
    } catch (error) {
        console.error('Error al obtener plazas:', error);
        res.status(500).json({ message: 'Error al obtener plazas' });
    }
});

// POST /api/user/schedule - Guardar horario semanal
router.post('/schedule', async (req, res) => {
    try {
        const userId = req.user.id;
        const { horarios, mes, año } = req.body;

        const schedule = new Schedule({
            userId,
            horarios,
            mes,
            año,
        });

        await schedule.save();

        res.status(201).json({
            message: 'Horario guardado correctamente',
            schedule,
        });
    } catch (error) {
        console.error('Error al guardar horario:', error);
        res.status(500).json({ message: 'Error al guardar horario' });
    }
});

// GET /api/user/schedule - Obtener horario del mes actual
router.get('/schedule', async (req, res) => {
    try {
        const userId = req.user.id;
        const hoy = new Date();
        const mes = hoy.getMonth() + 1;
        const año = hoy.getFullYear();

        const schedule = await Schedule.findOne({
            userId,
            mes,
            año,
        });

        if (!schedule) {
            return res.json(null);
        }

        res.json(schedule);
    } catch (error) {
        console.error('Error al obtener horario:', error);
        res.status(500).json({ message: 'Error al obtener horario' });
    }
});

// GET /api/user/weekly-usage - Obtener uso semanal actual
router.get('/weekly-usage', async (req, res) => {
    try {
        const userId = req.user.id;

        // Calcular número de semana actual usando la función correcta
        const semana = getWeekNumber(new Date());

        let weeklyUsage = await WeeklyUsage.findOne({ userId, semana });

        // Si no existe, crear uno nuevo
        if (!weeklyUsage) {
            weeklyUsage = new WeeklyUsage({
                userId,
                semana,
                horasUtilizadas: 0,
                detalleHoras: [
                    { dia: 'lunes', horas: 0 },
                    { dia: 'martes', horas: 0 },
                    { dia: 'miercoles', horas: 0 },
                    { dia: 'jueves', horas: 0 },
                    { dia: 'viernes', horas: 0 },
                ],
            });
            await weeklyUsage.save();
        }

        res.json(weeklyUsage);
    } catch (error) {
        console.error('Error al obtener uso semanal:', error);
        res.status(500).json({ message: 'Error al obtener uso semanal' });
    }
});

// POST /api/user/weekly-usage/add - Agregar horas al uso semanal
router.post('/weekly-usage/add', async (req, res) => {
    try {
        const userId = req.user.id;
        const { horas, dia } = req.body;

        if (typeof horas !== 'number' || horas < 0) {
            return res.status(400).json({ message: 'Horas debe ser un número positivo' });
        }

        // Calcular número de semana actual
        const hoy = new Date();
        const primeroEnero = new Date(hoy.getFullYear(), 0, 1);
        const diasDesdeInicio = hoy - primeroEnero;
        const semanaNum = Math.ceil((diasDesdeInicio + primeroEnero.getDay() + 1) / 604800000);
        const semana = `${hoy.getFullYear()}-${String(semanaNum).padStart(2, '0')}`;

        let weeklyUsage = await WeeklyUsage.findOne({ userId, semana });

        if (!weeklyUsage) {
            weeklyUsage = new WeeklyUsage({
                userId,
                semana,
                horasUtilizadas: 0,
                detalleHoras: [
                    { dia: 'lunes', horas: 0 },
                    { dia: 'martes', horas: 0 },
                    { dia: 'miercoles', horas: 0 },
                    { dia: 'jueves', horas: 0 },
                    { dia: 'viernes', horas: 0 },
                ],
            });
        }

        // Si se especifica día, actualizar ese día
        if (dia) {
            const detalle = weeklyUsage.detalleHoras.find(d => d.dia === dia);
            if (detalle) {
                detalle.horas += horas;
            }
        }

        // Actualizar total
        weeklyUsage.horasUtilizadas = weeklyUsage.detalleHoras.reduce((sum, d) => sum + d.horas, 0);
        weeklyUsage.updatedAt = new Date();
        await weeklyUsage.save();

        res.json({
            message: 'Horas agregadas correctamente',
            weeklyUsage,
        });
    } catch (error) {
        console.error('Error al agregar horas:', error);
        res.status(500).json({ message: 'Error al agregar horas' });
    }
});

module.exports = router;

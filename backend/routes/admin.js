const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const ParkingSpot = require('../models/ParkingSpot');
const Reservation = require('../models/Reservation');
const User = require('../models/User');
const WeeklyUsage = require('../models/WeeklyUsage');
const Schedule = require('../models/Schedule');

// Función para calcular el número de semana (mismo formato que seed-data.js)
const getWeekNumber = date => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNumber).padStart(2, '0')}`;
};

// Todas las rutas requieren autenticación y rol admin
router.use(verifyToken);
router.use(verifyAdmin);

// GET /api/admin/all-reservations - Ver todas las reservas
router.get('/all-reservations', async (req, res) => {
    try {
        const reservations = await Reservation.find()
            .populate('userId', 'nombre apellidos email')
            .populate('parkingSpotId')
            .sort({ createdAt: -1 });

        res.json(reservations);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error al obtener reservas' });
    }
});

// GET /api/admin/parking-spots - Ver todas las plazas
router.get('/parking-spots', async (req, res) => {
    try {
        const parkingSpots = await ParkingSpot.find().sort({ numero: 1 });
        res.json(parkingSpots);
    } catch (error) {
        console.error('Error al obtener plazas:', error);
        res.status(500).json({ message: 'Error al obtener plazas' });
    }
});

// POST /api/admin/parking-spot - Crear nueva plaza
router.post('/parking-spot', async (req, res) => {
    try {
        const { numero, ubicacion, descripcion } = req.body;

        // Comprobar que el número de plaza no exista ya
        const existing = await ParkingSpot.findOne({ numero });
        if (existing) {
            return res.status(400).json({ message: 'El número de plaza ya existe' });
        }

        const parkingSpot = new ParkingSpot({
            numero,
            ubicacion,
            descripcion: descripcion || '',
            disponible: true,
        });

        await parkingSpot.save();

        res.status(201).json({
            message: 'Plaza creada correctamente',
            parkingSpot,
        });
    } catch (error) {
        console.error('Error al crear plaza:', error);
        res.status(500).json({ message: 'Error al crear plaza' });
    }
});

// PUT /api/admin/parking-spot/:id - Actualizar plaza
router.put('/parking-spot/:id', async (req, res) => {
    try {
        const { numero, ubicacion, descripcion, disponible } = req.body;

        const parkingSpot = await ParkingSpot.findByIdAndUpdate(
            req.params.id,
            { numero, ubicacion, descripcion, disponible },
            { new: true }
        );

        if (!parkingSpot) {
            return res.status(404).json({ message: 'Plaza no encontrada' });
        }

        res.json({
            message: 'Plaza actualizada correctamente',
            parkingSpot,
        });
    } catch (error) {
        console.error('Error al actualizar plaza:', error);
        res.status(500).json({ message: 'Error al actualizar plaza' });
    }
});

// DELETE /api/admin/parking-spot/:id - Eliminar plaza
router.delete('/parking-spot/:id', async (req, res) => {
    try {
        const parkingSpot = await ParkingSpot.findByIdAndDelete(req.params.id);

        if (!parkingSpot) {
            return res.status(404).json({ message: 'Plaza no encontrada' });
        }

        res.json({ message: 'Plaza eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar plaza:', error);
        res.status(500).json({ message: 'Error al eliminar plaza' });
    }
});

// PUT /api/admin/parking-spot/:id/toggle - Activar/Desactivar plaza
router.put('/parking-spot/:id/toggle', async (req, res) => {
    try {
        const parkingSpot = await ParkingSpot.findById(req.params.id);

        if (!parkingSpot) {
            return res.status(404).json({ message: 'Plaza no encontrada' });
        }

        // Cambiar estado activa y disponible juntos
        parkingSpot.activa = !parkingSpot.activa;
        parkingSpot.disponible = parkingSpot.activa;

        await parkingSpot.save();

        res.json({
            message: `Plaza ${parkingSpot.activa ? 'activada' : 'desactivada'} correctamente`,
            parkingSpot,
        });
    } catch (error) {
        console.error('Error al cambiar estado de plaza:', error);
        res.status(500).json({ message: 'Error al cambiar estado de plaza' });
    }
});

// GET /api/admin/users - Ver todos los usuarios
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        console.error('Error al obtener usuarios:', error);
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
});

// POST /api/admin/assign-plaza - Asignar plaza a usuario
router.post('/assign-plaza/:plazaId/user/:userId', async (req, res) => {
    try {
        const { plazaId, userId } = req.params;

        const plaza = await ParkingSpot.findById(plazaId);
        if (!plaza) {
            return res.status(404).json({ message: 'Plaza no encontrada' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        plaza.disponible = false;
        await plaza.save();

        res.json({
            message: `Plaza asignada a ${user.nombre} ${user.apellidos}`,
            plaza,
        });
    } catch (error) {
        console.error('Error al asignar plaza:', error);
        res.status(500).json({ message: 'Error al asignar plaza' });
    }
});

// POST /api/admin/unassign-plaza - Liberar plaza
router.post('/unassign-plaza/:plazaId', async (req, res) => {
    try {
        const { plazaId } = req.params;

        const plaza = await ParkingSpot.findById(plazaId);
        if (!plaza) {
            return res.status(404).json({ message: 'Plaza no encontrada' });
        }

        plaza.disponible = true;
        await plaza.save();

        res.json({
            message: 'Plaza liberada correctamente',
            plaza,
        });
    } catch (error) {
        console.error('Error al liberar plaza:', error);
        res.status(500).json({ message: 'Error al liberar plaza' });
    }
});

// GET /api/admin/user/:userId/horas-utilizadas - Ver horas de un usuario
router.get('/user/:userId/horas-utilizadas', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json({
            userId: user._id,
            nombre: user.nombre,
            apellidos: user.apellidos,
            horasUtilizadas: user.horasUtilizadas,
        });
    } catch (error) {
        console.error('Error al obtener horas utilizadas:', error);
        res.status(500).json({ message: 'Error al obtener horas utilizadas' });
    }
});

// PUT /api/admin/user/:userId/horas-utilizadas - Actualizar horas de un usuario
router.put('/user/:userId/horas-utilizadas', async (req, res) => {
    try {
        const { horas } = req.body;

        // Validar que sea un número positivo
        if (typeof horas !== 'number' || horas < 0) {
            return res.status(400).json({ message: 'Las horas deben ser un número no negativo' });
        }

        const user = await User.findByIdAndUpdate(
            req.params.userId,
            { horasUtilizadas: horas },
            { new: true }
        );

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json({
            message: 'Horas actualizadas correctamente',
            horasUtilizadas: user.horasUtilizadas,
        });
    } catch (error) {
        console.error('Error al actualizar horas utilizadas:', error);
        res.status(500).json({ message: 'Error al actualizar horas utilizadas' });
    }
});

// GET /api/admin/usuarios-horas - Listar usuarios con sus horas
router.get('/usuarios-horas', async (req, res) => {
    try {
        const usuarios = await User.find({ role: 'user' }).select(
            'nombre apellidos email horasUtilizadas'
        );
        res.json(usuarios);
    } catch (error) {
        console.error('Error al obtener usuarios con horas:', error);
        res.status(500).json({ message: 'Error al obtener usuarios con horas' });
    }
});

// GET /api/admin/user/:userId/usage-history - Obtener histórico de uso semanal de un usuario
router.get('/user/:userId/usage-history', async (req, res) => {
    try {
        const { userId } = req.params;

        const usage = await WeeklyUsage.find({ userId }).sort({ semana: -1 });

        if (!usage || usage.length === 0) {
            return res.json([]);
        }

        res.json(usage);
    } catch (error) {
        console.error('Error al obtener histórico de uso:', error);
        res.status(500).json({ message: 'Error al obtener histórico de uso' });
    }
});

// GET /api/admin/user/:userId/weekly-usage - Obtener uso semanal actual de un usuario
router.get('/user/:userId/weekly-usage', async (req, res) => {
    try {
        const { userId } = req.params;

        // Calcular semana actual usando la función correcta
        const semana = getWeekNumber(new Date());

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
            await weeklyUsage.save();
        }

        res.json(weeklyUsage);
    } catch (error) {
        console.error('Error al obtener uso semanal:', error);
        res.status(500).json({ message: 'Error al obtener uso semanal' });
    }
});

// PUT /api/admin/user/:userId/weekly-usage - Actualizar horas de un usuario en una semana
router.put('/user/:userId/weekly-usage', async (req, res) => {
    try {
        const { userId } = req.params;
        const { semana, dia, horas } = req.body;

        if (typeof horas !== 'number' || horas < 0) {
            return res.status(400).json({ message: 'Horas debe ser un número positivo' });
        }

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

        // Actualizar horas del día específico
        if (dia) {
            const detalle = weeklyUsage.detalleHoras.find(d => d.dia === dia);
            if (detalle) {
                detalle.horas = horas;
            }
        }

        // Recalcular total
        weeklyUsage.horasUtilizadas = weeklyUsage.detalleHoras.reduce((sum, d) => sum + d.horas, 0);
        weeklyUsage.updatedAt = new Date();
        await weeklyUsage.save();

        res.json({
            message: 'Horas actualizadas correctamente',
            weeklyUsage,
        });
    } catch (error) {
        console.error('Error al actualizar horas:', error);
        res.status(500).json({ message: 'Error al actualizar horas' });
    }
});

// POST /api/admin/auto-assign-charger - Asignar cargador de forma equitativa
router.post('/auto-assign-charger', async (req, res) => {
    try {
        // Obtener semana anterior
        const hoy = new Date();
        const hace7Dias = new Date(hoy.getTime() - 7 * 24 * 60 * 60 * 1000);
        const semanaAnterior = getWeekNumber(hace7Dias);

        // Obtener todos los usuarios activos
        const usuarios = await User.find({ role: 'user' });

        if (usuarios.length === 0) {
            return res.status(400).json({ message: 'No hay usuarios registrados' });
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
        }

        res.json({
            message: 'Cargador asignado equitativamente según disponibilidad',
            usuariosAsignados: usuariosOrdenados.length,
            semana: semanaActual,
        });
    } catch (error) {
        console.error('Error asignando cargador:', error);
        res.status(500).json({ message: 'Error asignando cargador' });
    }
});

module.exports = router;

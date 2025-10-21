const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const ParkingSpot = require('../models/ParkingSpot');
const Reservation = require('../models/Reservation');
const User = require('../models/User');

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

        // Verificar si ya existe
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

        // Cambiar estado activa
        parkingSpot.activa = !parkingSpot.activa;
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

module.exports = router;

const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/auth');
const ParkingSpot = require('../models/ParkingSpot');
const Reservation = require('../models/Reservation');

// Todas las rutas requieren autenticación
router.use(verifyToken);

// GET /api/user/parking-spots - Ver plazas disponibles
router.get('/parking-spots', async (req, res) => {
    try {
        const parkingSpots = await ParkingSpot.find({ disponible: true });
        res.json(parkingSpots);
    } catch (error) {
        console.error('Error al obtener plazas:', error);
        res.status(500).json({ message: 'Error al obtener plazas' });
    }
});

// POST /api/user/reserve - Reservar una plaza
router.post('/reserve', async (req, res) => {
    try {
        const { parkingSpotId, fechaInicio, fechaFin } = req.body;
        const userId = req.user.id;

        // Verificar que la plaza existe y está disponible
        const parkingSpot = await ParkingSpot.findById(parkingSpotId);
        if (!parkingSpot) {
            return res.status(404).json({ message: 'Plaza no encontrada' });
        }
        if (!parkingSpot.disponible) {
            return res.status(400).json({ message: 'Plaza no disponible' });
        }

        // Crear reserva
        const reservation = new Reservation({
            userId,
            parkingSpotId,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            estado: 'activa',
        });

        await reservation.save();

        // Marcar plaza como no disponible
        parkingSpot.disponible = false;
        await parkingSpot.save();

        res.status(201).json({
            message: 'Reserva creada correctamente',
            reservation,
        });
    } catch (error) {
        console.error('Error al crear reserva:', error);
        res.status(500).json({ message: 'Error al crear reserva' });
    }
});

// GET /api/user/my-reservations - Ver mis reservas
router.get('/my-reservations', async (req, res) => {
    try {
        const userId = req.user.id;
        const reservations = await Reservation.find({ userId })
            .populate('parkingSpotId')
            .sort({ createdAt: -1 });

        res.json(reservations);
    } catch (error) {
        console.error('Error al obtener reservas:', error);
        res.status(500).json({ message: 'Error al obtener reservas' });
    }
});

// DELETE /api/user/cancel-reservation/:id - Cancelar reserva
router.delete('/cancel-reservation/:id', async (req, res) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user.id;

        const reservation = await Reservation.findOne({
            _id: reservationId,
            userId,
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Cambiar estado a cancelada
        reservation.estado = 'cancelada';
        await reservation.save();

        // Liberar la plaza
        await ParkingSpot.findByIdAndUpdate(reservation.parkingSpotId, {
            disponible: true,
        });

        res.json({ message: 'Reserva cancelada correctamente' });
    } catch (error) {
        console.error('Error al cancelar reserva:', error);
        res.status(500).json({ message: 'Error al cancelar reserva' });
    }
});

module.exports = router;

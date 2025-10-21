const express = require('express');
const cors = require('cors');
require('./config/db');
const { initChargerAssignmentJob } = require('./jobs/chargerAssignment');

const app = express();

// Configurar middleware para JSON y CORS
app.use(cors());
app.use(express.json());

// Registrar rutas de la API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Endpoint de prueba
app.get('/', (req, res) => {
    res.json({ message: 'API Plaza Coche funcionando correctamente' });
});

const PORT = process.env.PORT || 3000;

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);

    // Inicializar cron job para asignación automática de cargador
    initChargerAssignmentJob();
});

const mongoose = require('mongoose');
const User = require('../models/User');
const Schedule = require('../models/Schedule');
const WeeklyUsage = require('../models/WeeklyUsage');
const ParkingSpot = require('../models/ParkingSpot');

// Conectar a MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/plaza_coche');
        console.log('Conectado a MongoDB');
    } catch (error) {
        console.error('Error conectando a MongoDB:', error);
        process.exit(1);
    }
};

// Función para calcular el número de semana
const getWeekNumber = date => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNumber).padStart(2, '0')}`;
};

// Datos de usuarios con horarios
const usuariosData = [
    {
        email: 'juan.garcia@iestacio.gva.es',
        password: '123456',
        nombre: 'Juan',
        apellidos: 'García López',
        horasUtilizadas: 10,
        horario: {
            lunes: [8, 9, 10, 11, 12, 13, 15, 16, 17],
            martes: [8, 9, 10, 11, 12, 13, 15, 16],
            miercoles: [8, 9, 10, 11, 12, 13, 15, 16, 17, 18],
            jueves: [8, 9, 10, 11, 12, 13],
            viernes: [15, 16, 17, 18, 19, 20, 21],
        },
        horasSemanales: { lunes: 3, martes: 2, miercoles: 4, jueves: 1, viernes: 0 },
    },
    {
        email: 'maria.rodriguez@iestacio.gva.es',
        password: '123456',
        nombre: 'María',
        apellidos: 'Rodríguez Pérez',
        horasUtilizadas: 2,
        horario: {
            lunes: [8, 9, 10],
            martes: [15, 16],
            miercoles: [],
            jueves: [8, 9, 10, 11],
            viernes: [],
        },
        horasSemanales: { lunes: 1, martes: 1, miercoles: 0, jueves: 0, viernes: 0 },
    },
    {
        email: 'pedro.martinez@iestacio.gva.es',
        password: '123456',
        nombre: 'Pedro',
        apellidos: 'Martínez González',
        horasUtilizadas: 15,
        horario: {
            lunes: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
            martes: [8, 9, 10, 11, 12, 13, 15, 16, 17, 18, 19, 20],
            miercoles: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18],
            jueves: [8, 9, 10, 11, 12, 13, 15, 16, 17, 18],
            viernes: [8, 9, 10, 11, 12, 13, 14],
        },
        horasSemanales: { lunes: 3, martes: 3, miercoles: 3, jueves: 3, viernes: 3 },
    },
    {
        email: 'laura.sanchez@iestacio.gva.es',
        password: '123456',
        nombre: 'Laura',
        apellidos: 'Sánchez Ruiz',
        horasUtilizadas: 5,
        horario: {
            lunes: [8, 9, 10, 11, 12],
            martes: [15, 16, 17, 18, 19],
            miercoles: [8, 9, 10],
            jueves: [],
            viernes: [15, 16, 17],
        },
        horasSemanales: { lunes: 1, martes: 1, miercoles: 1, jueves: 0, viernes: 1 },
    },
    {
        email: 'carlos.fernandez@iestacio.gva.es',
        password: '123456',
        nombre: 'Carlos',
        apellidos: 'Fernández López',
        horasUtilizadas: 8,
        horario: {
            lunes: [9, 10, 11, 12],
            martes: [9, 10, 11, 12],
            miercoles: [9, 10, 11, 12],
            jueves: [9, 10, 11, 12],
            viernes: [16, 17, 18, 19],
        },
        horasSemanales: { lunes: 2, martes: 2, miercoles: 0, jueves: 0, viernes: 2 },
    },
];

// Función principal
const initUsers = async () => {
    try {
        await connectDB();

        console.log('Inicializando usuarios...');

        // Limpiar usuarios (menos admin)
        await User.deleteMany({ role: 'user' });
        await Schedule.deleteMany({});
        await WeeklyUsage.deleteMany({});

        const mes = new Date().getMonth() + 1;
        const año = new Date().getFullYear();
        const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

        for (const userData of usuariosData) {
            // Crear usuario
            const usuario = new User({
                email: userData.email,
                password: userData.password,
                nombre: userData.nombre,
                apellidos: userData.apellidos,
                role: 'user',
                horasUtilizadas: userData.horasUtilizadas,
            });

            await usuario.save();
            console.log(`Usuario creado: ${userData.nombre} ${userData.apellidos}`);

            // Crear horario
            const horarios = [];
            for (const dia of dias) {
                if (userData.horario[dia] && userData.horario[dia].length > 0) {
                    horarios.push({
                        dia: dia,
                        horas: userData.horario[dia],
                    });
                }
            }

            const schedule = new Schedule({
                userId: usuario._id,
                horarios: horarios,
                mes: mes,
                año: año,
            });

            await schedule.save();
            console.log(`Horario creado para: ${userData.nombre}`);

            // Crear uso semanal
            const semanaActual = getWeekNumber(new Date());
            const detalleHoras = [];
            let totalHoras = 0;

            for (const dia of dias) {
                const horas = userData.horasSemanales[dia] || 0;
                detalleHoras.push({
                    dia: dia,
                    horas: horas,
                });
                totalHoras += horas;
            }

            const weeklyUsage = new WeeklyUsage({
                userId: usuario._id,
                semana: semanaActual,
                horasUtilizadas: totalHoras,
                detalleHoras: detalleHoras,
            });

            await weeklyUsage.save();
            console.log(`Uso semanal creado para: ${userData.nombre} (${totalHoras} horas)`);
        }

        console.log('\nUsuarios inicializados correctamente');

        process.exit(0);
    } catch (error) {
        console.error('Error inicializando usuarios:', error);
        process.exit(1);
    }
};

initUsers();

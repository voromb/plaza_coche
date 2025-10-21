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

// Función para generar semana en formato YYYY-WW
const getWeekNumber = date => {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNumber = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-${String(weekNumber).padStart(2, '0')}`;
};

// Datos de horarios por usuario
const horariosPorUsuario = {
    'miqui.profe@iestacio.gva.es': {
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
    'jordi.smx@iestacio.gva.es': {
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
    'jairo.smx@iestacio.gva.es': {
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
    'xavi.smx@iestacio.gva.es': {
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
    'voro.moran@iestacio.gva.es': {
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
    'juan.garcia@iestacio.gva.es': {
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
    'maria.rodriguez@iestacio.gva.es': {
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
    'pedro.martinez@iestacio.gva.es': {
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
    'laura.sanchez@iestacio.gva.es': {
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
    'carlos.fernandez@iestacio.gva.es': {
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
};

// Función principal
const seedData = async () => {
    try {
        await connectDB();

        console.log('Añadiendo horarios y horas a usuarios existentes...');

        for (const [email, datos] of Object.entries(horariosPorUsuario)) {
            const usuario = await User.findOne({ email });

            if (!usuario) {
                console.log(`Usuario no encontrado: ${email}`);
                continue;
            }

            // Actualizar horas utilizadas
            usuario.horasUtilizadas = datos.horasUtilizadas;
            await usuario.save();
            console.log(`Horas utilizadas actualizadas para: ${email} (${datos.horasUtilizadas}h)`);

            // Crear horario
            const horarios = [];
            const dias = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes'];

            for (const dia of dias) {
                if (datos.horario[dia] && datos.horario[dia].length > 0) {
                    horarios.push({
                        dia: dia,
                        horas: datos.horario[dia],
                    });
                }
            }

            await Schedule.deleteOne({ userId: usuario._id });
            const schedule = new Schedule({
                userId: usuario._id,
                horarios: horarios,
                mes: new Date().getMonth() + 1,
                año: new Date().getFullYear(),
            });

            await schedule.save();
            console.log(`Horario creado para: ${email}`);

            // Crear uso semanal
            const semanaActual = getWeekNumber(new Date());
            const detalleHoras = [];
            let totalHoras = 0;

            for (const dia of dias) {
                const horas = datos.horasSemanales[dia] || 0;
                detalleHoras.push({
                    dia: dia,
                    horas: horas,
                });
                totalHoras += horas;
            }

            await WeeklyUsage.deleteOne({ userId: usuario._id, semana: semanaActual });
            const weeklyUsage = new WeeklyUsage({
                userId: usuario._id,
                semana: semanaActual,
                horasUtilizadas: totalHoras,
                detalleHoras: detalleHoras,
            });

            await weeklyUsage.save();
            console.log(`Uso semanal creado para: ${email} (${totalHoras} horas)`);
        }

        console.log('\nDatos de horarios añadidos correctamente');

        // Crear las 3 plazas de aparcamiento
        console.log('\nCreando plazas de aparcamiento...');
        await ParkingSpot.deleteMany({});

        const plazas = [
            {
                numero: 'A-01',
                disponible: true,
                activa: true,
                ubicacion: 'Planta baja - Pasillo A',
            },
            {
                numero: 'B-01',
                disponible: true,
                activa: true,
                ubicacion: 'Planta baja - Pasillo B',
            },
            {
                numero: 'C-01',
                disponible: true,
                activa: true,
                ubicacion: 'Planta baja - Pasillo C',
            },
        ];

        for (const plazaData of plazas) {
            const plaza = new ParkingSpot(plazaData);
            await plaza.save();
            console.log(`Plaza creada: ${plazaData.numero}`);
        }

        console.log('\nTodos los datos han sido configurados correctamente');

        process.exit(0);
    } catch (error) {
        console.error('Error añadiendo datos:', error);
        process.exit(1);
    }
};

seedData();

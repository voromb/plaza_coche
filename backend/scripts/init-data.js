// Script para inicializar datos de prueba
// Ejecutar con: node scripts/init-data.js

const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://mongodb:27017/plaza_coche', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const User = require('../models/User');
const ParkingSpot = require('../models/ParkingSpot');

async function initData() {
    try {
        console.log('🚀 Iniciando carga de datos...');

        // Limpiar colecciones existentes
        await User.deleteMany({});
        await ParkingSpot.deleteMany({});
        console.log('✅ Colecciones limpiadas');

        // Crear usuario admin
        const admin = new User({
            email: 'admin@iestacio.gva.es',
            password: 'admin123',
            nombre: 'Admin',
            apellidos: 'IES Estació',
            role: 'admin',
        });
        await admin.save();
        console.log('✅ Usuario admin creado: admin@iestacio.gva.es / admin123');

        // Crear usuarios normales
        const usuarios = [
            {
                email: 'voro.moran@iestacio.gva.es',
                password: 'user123',
                nombre: 'Voro',
                apellidos: 'Morán',
                role: 'user',
            },
            {
                email: 'xavi.smx@iestacio.gva.es',
                password: 'user123',
                nombre: 'Xavi',
                apellidos: 'SMX',
                role: 'user',
            },
            {
                email: 'jairo.smx@iestacio.gva.es',
                password: 'user123',
                nombre: 'Jairo',
                apellidos: 'SMX',
                role: 'user',
            },
            {
                email: 'jordi.smx@iestacio.gva.es',
                password: 'user123',
                nombre: 'Jordi',
                apellidos: 'SMX',
                role: 'user',
            },
            {
                email: 'miqui.profe@iestacio.gva.es',
                password: 'user123',
                nombre: 'Miqui',
                apellidos: 'Profesor',
                role: 'user',
            },
        ];

        for (const userData of usuarios) {
            const user = new User(userData);
            await user.save();
        }
        console.log(`✅ ${usuarios.length} usuarios normales creados`);

        // Crear plazas de estacionamiento
        const plazas = [
            {
                numero: 'A-01',
                ubicacion: 'Zona A - Planta Baja',
                descripcion: 'Cerca de la entrada principal',
            },
            { numero: 'A-02', ubicacion: 'Zona A - Planta Baja', descripcion: 'Plaza amplia' },
            { numero: 'A-03', ubicacion: 'Zona A - Planta Baja', descripcion: 'Con sombra' },
            {
                numero: 'B-01',
                ubicacion: 'Zona B - Primera Planta',
                descripcion: 'Acceso por rampa',
            },
            { numero: 'B-02', ubicacion: 'Zona B - Primera Planta', descripcion: 'Plaza estándar' },
            { numero: 'C-01', ubicacion: 'Zona C - Exterior', descripcion: 'Al aire libre' },
        ];

        for (const plazaData of plazas) {
            const plaza = new ParkingSpot(plazaData);
            await plaza.save();
        }
        console.log(`✅ ${plazas.length} plazas creadas`);

        console.log('\n✨ Datos de prueba cargados correctamente!');
        console.log('\n📝 Credenciales:');
        console.log('   👤 Admin: admin@iestacio.gva.es / admin123');
        console.log('\n   👥 Usuarios (todos con password: user123):');
        console.log('   • voro.moran@iestacio.gva.es');
        console.log('   • xavi.smx@iestacio.gva.es');
        console.log('   • jairo.smx@iestacio.gva.es');
        console.log('   • jordi.smx@iestacio.gva.es');
        console.log('   • miqui.profe@iestacio.gva.es');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error al cargar datos:', error);
        process.exit(1);
    }
}

initData();

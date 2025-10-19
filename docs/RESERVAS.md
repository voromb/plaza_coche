# 📚 EXPLICACIÓN COMPLETA: LÓGICA DE RESERVAS

Sistema de reservas de plazas de estacionamiento - Plaza Coche

---

## 🔄 Flujo Completo de una Reserva

### **1️⃣ FRONTEND - Usuario hace clic en "Reservar"**

**Ubicación:** `frontend/user.html` + `frontend/js/user.js`

```javascript
// Línea 55-59: Botón de reservar en cada tarjeta de plaza
<button onclick="openReserveModal('${spot._id}', '${spot.numero}')">Reservar</button>
```

**¿Qué pasa?**

-   El usuario ve las plazas disponibles
-   Hace clic en "Reservar" de una plaza específica
-   Se ejecuta `openReserveModal()` con el ID de la plaza

---

### **2️⃣ FRONTEND - Se abre el Modal de Reserva**

**Código:** `frontend/js/user.js` (línea 113-123)

```javascript
function openReserveModal(parkingSpotId, numero) {
    currentParkingSpotId = parkingSpotId; // Guarda el ID de la plaza
    document.getElementById('modalPlazaNumero').textContent = numero; // Muestra el número

    // Establece fecha mínima como HOY (no puedes reservar en el pasado)
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('fechaInicio').setAttribute('min', today);
    document.getElementById('fechaFin').setAttribute('min', today);

    reserveModal.classList.add('active'); // Muestra el modal
}
```

**¿Qué pasa?**

-   Se guarda el ID de la plaza en `currentParkingSpotId`
-   Se muestra el modal con un formulario
-   Se bloquean fechas pasadas (solo se pueden reservar fechas futuras)

---

### **3️⃣ FRONTEND - Usuario llena el formulario**

**Código:** `frontend/js/user.js` (línea 139-161)

```javascript
reserveForm.addEventListener('submit', async e => {
    e.preventDefault();

    const fechaInicio = document.getElementById('fechaInicio').value;
    const fechaFin = document.getElementById('fechaFin').value;

    // VALIDACIÓN: Fecha fin debe ser posterior a fecha inicio
    if (new Date(fechaFin) <= new Date(fechaInicio)) {
        showMessage('La fecha de fin debe ser posterior a la fecha de inicio', 'error');
        return;
    }

    try {
        // LLAMADA AL BACKEND
        await apiService.createReservation(currentParkingSpotId, fechaInicio, fechaFin);
        showMessage('Reserva creada correctamente', 'success');

        // Cerrar modal y recargar datos
        reserveModal.classList.remove('active');
        reserveForm.reset();
        loadParkingSpots(); // Recarga plazas (la reservada ya no aparece)
        loadMyReservations(); // Recarga mis reservas (aparece la nueva)
    } catch (error) {
        showMessage('Error al crear reserva: ' + error.message, 'error');
    }
});
```

**¿Qué pasa?**

1. Usuario selecciona fecha inicio y fecha fin
2. Se valida que fecha fin > fecha inicio
3. Se llama a `apiService.createReservation()` (envía datos al backend)
4. Si todo va bien, cierra el modal y recarga las listas

---

### **4️⃣ API SERVICE - Petición HTTP al Backend**

**Ubicación:** `frontend/js/ApiService.js`

```javascript
async createReservation(parkingSpotId, fechaInicio, fechaFin) {
    return this.request('/api/user/reserve', {
        method: 'POST',
        body: JSON.stringify({
            parkingSpotId,
            fechaInicio,
            fechaFin
        })
    });
}
```

**¿Qué pasa?**

-   Se envía una petición POST a `http://localhost:3000/api/user/reserve`
-   Se envía el JWT token en el header (para autenticación)
-   Se envían los datos: `parkingSpotId`, `fechaInicio`, `fechaFin`

---

### **5️⃣ BACKEND - Middleware de Autenticación**

**Ubicación:** `backend/middleware/auth.js`

```javascript
// Línea 8: Todas las rutas requieren autenticación
router.use(verifyToken);
```

**¿Qué pasa?**

-   El middleware `verifyToken` intercepta la petición
-   Verifica que el JWT token sea válido
-   Extrae el `userId` del token y lo añade a `req.user.id`
-   Si el token es inválido → Error 401 (No autorizado)

---

### **6️⃣ BACKEND - Controlador de Reserva**

**Ubicación:** `backend/routes/user.js` (línea 22-59)

```javascript
router.post('/reserve', async (req, res) => {
    try {
        // 1. EXTRAER DATOS
        const { parkingSpotId, fechaInicio, fechaFin } = req.body;
        const userId = req.user.id; // Del JWT token

        // 2. VERIFICAR QUE LA PLAZA EXISTE
        const parkingSpot = await ParkingSpot.findById(parkingSpotId);
        if (!parkingSpot) {
            return res.status(404).json({ message: 'Plaza no encontrada' });
        }

        // 3. VERIFICAR QUE ESTÁ DISPONIBLE
        if (!parkingSpot.disponible) {
            return res.status(400).json({ message: 'Plaza no disponible' });
        }

        // 4. CREAR LA RESERVA
        const reservation = new Reservation({
            userId,
            parkingSpotId,
            fechaInicio: new Date(fechaInicio),
            fechaFin: new Date(fechaFin),
            estado: 'activa',
        });
        await reservation.save(); // Guarda en MongoDB

        // 5. MARCAR PLAZA COMO NO DISPONIBLE
        parkingSpot.disponible = false;
        await parkingSpot.save();

        // 6. RESPONDER AL FRONTEND
        res.status(201).json({
            message: 'Reserva creada correctamente',
            reservation,
        });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear reserva' });
    }
});
```

**Pasos del Backend:**

1. **Extrae datos:** `parkingSpotId`, `fechaInicio`, `fechaFin`, `userId` (del token)
2. **Busca la plaza:** `ParkingSpot.findById()`
3. **Valida disponibilidad:** Si `disponible === false` → Error
4. **Crea reserva:** Nuevo documento en MongoDB
5. **Marca plaza ocupada:** `disponible = false`
6. **Responde al frontend:** Status 201 + datos de la reserva

---

## 📊 Modelo de Datos: Reservation

**Ubicación:** `backend/models/Reservation.js`

```javascript
{
    userId: ObjectId,           // Referencia al usuario que reserva
    parkingSpotId: ObjectId,    // Referencia a la plaza reservada
    fechaInicio: Date,          // Fecha de inicio de la reserva
    fechaFin: Date,             // Fecha de fin de la reserva
    estado: String,             // 'activa' | 'completada' | 'cancelada'
    createdAt: Date             // Fecha de creación del registro
}
```

**Relaciones:**

-   `userId` → Hace referencia a la colección `users`
-   `parkingSpotId` → Hace referencia a la colección `parkingspots`

---

## 🔄 Flujo de Cancelación de Reserva

### **FRONTEND - Cancelar Reserva**

**Código:** `frontend/js/user.js` (línea 164-177)

```javascript
async function cancelReservation(reservationId) {
    // 1. Confirmación del usuario
    if (!confirm('¿Estás seguro de que deseas cancelar esta reserva?')) {
        return;
    }

    try {
        // 2. Llamada al backend
        await apiService.cancelReservation(reservationId);
        showMessage('Reserva cancelada correctamente', 'success');

        // 3. Recargar datos
        loadParkingSpots(); // La plaza vuelve a estar disponible
        loadMyReservations(); // La reserva muestra estado "cancelada"
    } catch (error) {
        showMessage('Error al cancelar reserva: ' + error.message, 'error');
    }
}
```

### **BACKEND - Cancelar Reserva**

**Código:** `backend/routes/user.js` (línea 77-105)

```javascript
router.delete('/cancel-reservation/:id', async (req, res) => {
    try {
        const reservationId = req.params.id;
        const userId = req.user.id;

        // 1. Buscar la reserva (SOLO del usuario actual)
        const reservation = await Reservation.findOne({
            _id: reservationId,
            userId, // Seguridad: Solo puedes cancelar TUS reservas
        });

        if (!reservation) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // 2. Cambiar estado a 'cancelada'
        reservation.estado = 'cancelada';
        await reservation.save();

        // 3. LIBERAR LA PLAZA (vuelve a estar disponible)
        await ParkingSpot.findByIdAndUpdate(reservation.parkingSpotId, {
            disponible: true,
        });

        res.json({ message: 'Reserva cancelada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cancelar reserva' });
    }
});
```

**Pasos:**

1. **Busca la reserva:** Solo del usuario autenticado
2. **Cambia estado:** `estado = 'cancelada'`
3. **Libera la plaza:** `disponible = true`
4. **Responde:** Confirmación al frontend

---

## 📈 Diagrama de Flujo Completo

```
👤 USUARIO
   ↓
   1. Hace clic en "Reservar Plaza A-01"
   ↓
🌐 FRONTEND (user.js)
   ↓
   2. Se abre modal → Usuario llena fechas
   ↓
   3. Validación: fechaFin > fechaInicio
   ↓
   4. apiService.createReservation()
   ↓
📡 HTTP POST → /api/user/reserve
   {
     parkingSpotId: "abc123",
     fechaInicio: "2024-10-20",
     fechaFin: "2024-10-25"
   }
   ↓
🔒 MIDDLEWARE (auth.js)
   ↓
   5. Verifica JWT token → Extrae userId
   ↓
⚙️ BACKEND (user.js)
   ↓
   6. Verifica que plaza existe
   ↓
   7. Verifica que plaza está disponible
   ↓
   8. Crea documento Reservation en MongoDB
   ↓
   9. Marca plaza.disponible = false
   ↓
   10. Guarda en MongoDB
   ↓
📤 RESPUESTA HTTP 201
   { message: "Reserva creada correctamente", reservation: {...} }
   ↓
🌐 FRONTEND
   ↓
   11. Cierra modal
   ↓
   12. Recarga plazas (A-01 ya NO aparece)
   ↓
   13. Recarga "Mis Reservas" (aparece la nueva)
   ↓
✅ COMPLETADO
```

---

## 🗄️ Estado en la Base de Datos

### **Antes de reservar:**

```javascript
// Plaza
{
  _id: "abc123",
  numero: "A-01",
  ubicacion: "Zona A",
  disponible: true  // ✅ Disponible
}

// Reservas del usuario
[] // Vacío
```

### **Después de reservar:**

```javascript
// Plaza
{
  _id: "abc123",
  numero: "A-01",
  ubicacion: "Zona A",
  disponible: false  // ❌ Ocupada
}

// Nueva reserva creada
{
  _id: "xyz789",
  userId: "user_id",
  parkingSpotId: "abc123",
  fechaInicio: "2024-10-20T00:00:00.000Z",
  fechaFin: "2024-10-25T00:00:00.000Z",
  estado: "activa",  // ✅ Activa
  createdAt: "2024-10-19T10:00:00.000Z"
}
```

### **Después de cancelar:**

```javascript
// Plaza (vuelve a estar disponible)
{
  _id: "abc123",
  disponible: true  // ✅ Disponible de nuevo
}

// Reserva (actualizada)
{
  _id: "xyz789",
  estado: "cancelada"  // ❌ Cancelada
}
```

---

## 🔐 Seguridad Implementada

### **1. Autenticación (JWT)**

```javascript
// Todas las rutas de usuario requieren token válido
router.use(verifyToken);
```

-   Cada petición lleva un token JWT en el header
-   El middleware verifica el token antes de procesar la petición
-   Si el token es inválido → Error 401

### **2. Autorización (Solo tus reservas)**

```javascript
// Solo puedes cancelar TUS propias reservas
const reservation = await Reservation.findOne({
    _id: reservationId,
    userId: req.user.id, // ← Filtra por usuario
});
```

-   No puedes cancelar reservas de otros usuarios
-   El `userId` se extrae del token (no se puede falsificar)

### **3. Validaciones**

**Frontend:**

-   Fecha fin > Fecha inicio
-   No se pueden seleccionar fechas pasadas

**Backend:**

-   Plaza existe
-   Plaza está disponible
-   Datos requeridos presentes

---

## 📋 Endpoints de Reservas

### **GET /api/user/parking-spots**

-   **Descripción:** Obtiene plazas disponibles
-   **Auth:** Requerida
-   **Respuesta:** Array de plazas con `disponible: true`

### **POST /api/user/reserve**

-   **Descripción:** Crea una nueva reserva
-   **Auth:** Requerida
-   **Body:**
    ```json
    {
        "parkingSpotId": "abc123",
        "fechaInicio": "2024-10-20",
        "fechaFin": "2024-10-25"
    }
    ```
-   **Respuesta:** Reserva creada + mensaje de éxito

### **GET /api/user/my-reservations**

-   **Descripción:** Obtiene reservas del usuario actual
-   **Auth:** Requerida
-   **Respuesta:** Array de reservas con datos de la plaza (populate)

### **DELETE /api/user/cancel-reservation/:id**

-   **Descripción:** Cancela una reserva
-   **Auth:** Requerida
-   **Parámetro:** ID de la reserva
-   **Respuesta:** Mensaje de confirmación

---

## 🔑 Puntos Clave

1. **Autenticación:** Todas las acciones requieren JWT token válido
2. **Validación Frontend:** Fecha fin > fecha inicio, no fechas pasadas
3. **Validación Backend:** Plaza existe y está disponible
4. **Transacción:** Se crea reserva Y se marca plaza como no disponible (en ese orden)
5. **Seguridad:** Solo puedes cancelar TUS propias reservas
6. **Estado:** Las plazas se sincronizan automáticamente (disponible ↔ ocupada)
7. **Populate:** Al obtener reservas, se traen datos completos de la plaza
8. **Estados de reserva:** `activa`, `completada`, `cancelada`

---

## 🚀 Mejoras Posibles (Futuro)

1. **Validación de solapamiento:** Verificar que no haya reservas solapadas
2. **Sistema de cola:** Lista de espera si plaza no disponible
3. **Notificaciones:** Email/push cuando se confirma o cancela reserva
4. **Historial:** Ver reservas completadas
5. **Renovación:** Extender una reserva activa
6. **Penalizaciones:** Sistema de puntos por cancelaciones
7. **Calendario:** Vista de calendario para ver disponibilidad
8. **Reservas recurrentes:** Reservar los mismos días cada semana

---

## 📚 Archivos Relacionados

-   `frontend/js/user.js` - Lógica del dashboard de usuario
-   `frontend/js/ApiService.js` - Comunicación con el backend
-   `backend/routes/user.js` - Endpoints de reservas
-   `backend/models/Reservation.js` - Modelo de datos
-   `backend/models/ParkingSpot.js` - Modelo de plazas
-   `backend/middleware/auth.js` - Autenticación JWT

---

**Proyecto:** Plaza Coche - Sistema de Alquiler de Plazas de Estacionamiento  
**Patrón:** Singleton  
**Stack:** MongoDB + Express + Vanilla JavaScript  
**Fecha:** Octubre 2024

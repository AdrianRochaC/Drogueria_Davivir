// Definición de empleados
const roles = {
    AF: 4, // 4 Asistentes de Farmacia
    AD: 2, // 2 Asistentes de Domicilio
    Domiciliario: 2 // 2 Domiciliarios
};

let employees = [];
let schedule = [];

// Función para crear empleados
function createEmployees(numEmployees) {
    for (let i = 0; i < numEmployees; i++) {
        let role;
        if (i < roles.AF) {
            role = 'AF';
        } else if (i < roles.AF + roles.AD) {
            role = 'AD';
        } else {
            role = 'Domiciliario';
        }
        employees.push({ id: i + 1, name: `Empleado ${i + 1}`, role: role, schedule: [], restDays: [] });
    }
}

// Función para asignar días de descanso
function assignRestDays() {
    const restDays = ['Lunes', 'Miércoles', 'Domingo']; // Ejemplo de días de descanso
    const daysOff = ['Martes', 'Sábado', 'Jueves']; // Días que no pueden descansar

    // Asignar días de descanso a AF
    for (let i = 0; i < roles.AF; i++) {
        let restDay;
        do {
            restDay = restDays[Math.floor(Math.random() * restDays.length)];
        } while (employees.filter(emp => emp.restDays.includes(restDay)).length >= 2); // No más de 2 AF en el mismo día
        employees[i].restDays.push(restDay);
    }

    // Asignar días de descanso a AD
    for (let i = roles.AF; i < roles.AF + roles.AD; i++) {
        let restDay;
        do {
            restDay = 'Domingo'; // Solo descansan los domingos
        } while (employees.filter(emp => emp.restDays.includes(restDay)).length >= 1); // No más de 1 AD en el mismo día
        employees[i].restDays.push(restDay);
    }
}

// Función para generar horarios
function generateSchedule() {
    const daysInNovember = 30; // Noviembre tiene 30 días
    const deliveryPerson = employees.filter(emp => emp.role === 'Domiciliario');

    for (let day = 1; day <= daysInNovember; day++) {
        const date = new Date(2024, 10, day); // Mes es 0-indexado (Noviembre es 10)

        // Filtrar empleados disponibles
        const availableEmployees = employees.filter(emp => !emp.restDays.includes(getDayName(date)));

        // Asignar turnos
        const morningShifts = [];
        const afternoonShifts = [];

        // Asignar turnos de la mañana
        const morningAF = availableEmployees.filter(emp => emp.role === 'AF').slice(0, 2);
        const morningAD = availableEmployees.filter(emp => emp.role === 'AD').slice(0, 1);
        const morningDelivery = deliveryPerson[0]; // Domiciliario fijo

        if (morningAF.length === 2 && morningAD.length === 1 && morningDelivery) {
            morningShifts.push(...morningAF, morningAD[0], morningDelivery);
        }

                // Asignar turnos de la tarde
                const afternoonAF = availableEmployees.filter(emp => emp.role === 'AF').slice(0, 2);
                const afternoonAD = availableEmployees.filter(emp => emp.role === 'AD').slice(0, 1);
        
                if (afternoonAF.length === 2 && afternoonAD.length === 1 && morningDelivery) {
                    afternoonShifts.push(...afternoonAF, afternoonAD[0], morningDelivery);
                }
        
                // Asignar turnos
                morningShifts.forEach(emp => {
                    emp.schedule.push({ date: date.toISOString().split('T')[0], shift: 'Mañana', hours: 8 });
                });
        
                afternoonShifts.forEach(emp => {
                    emp.schedule.push({ date: date.toISOString().split('T')[0], shift: 'Tarde', hours: 8 });
                });
            }
        
            // Organizar horarios por empleado
            employees.forEach(emp => {
                emp.schedule.sort((a, b) => new Date(a.date) - new Date(b.date));
            });
        }
        
        // Función para obtener el nombre del día
        function getDayName(date) {
            const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
            return days[date.getDay()]; // Devuelve el nombre del día correspondiente
        }
        
        // Ejecución del código
        createEmployees(roles.AF + roles.AD + roles.Domiciliario); // Crear empleados
        assignRestDays(); // Asignar días de descanso
        generateSchedule(); // Generar horarios
        
        // Mostrar resultados
        console.log(employees);
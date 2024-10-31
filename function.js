class Employee {
    constructor(name, role) {
        this.name = name;
        this.role = role;
        this.schedule = [];
        this.restDays = [];
    }
}

class Schedule {
    constructor(date, shift, employee) {
        this.date = date;
        this.shift = shift; // Turno 1, Turno 2, Turno 3, Domiciliario
        this.employee = employee;
    }
}

const employees = [];
const shifts = [
    { name: 'Turno 1', hours: 8, description: 'Mañana (7:00 AM - 3:00 PM)' },
    { name: 'Turno 2', hours: 8.5, description: 'Tarde (1:00 PM - 9:30 PM)' },
    { name: 'Turno 3', hours: 7.5, description: 'Turno partido (7:00 AM - 12:00 PM, 5:00 PM - 9:30 PM)' },
    { name: 'Domiciliario', hours: 8, description: 'Turno de trabajo fijo (9:00 AM - 1:00 PM, 3:00 PM - 9:00 PM)' }
];

document.getElementById('configForm').addEventListener('submit', function(event) {
    event.preventDefault();
    generateEmployees();
    calculateRestDays();
    generateSchedule();
    displaySchedule();
    displayRestDays();
});

function generateEmployees() {
    employees.length = 0; // Reset employees array

    // Create 4 Auxiliares Farmacéuticos
    for (let i = 1; i <= 4; i++) {
        employees.push(new Employee(`AF${i}`, 'Auxiliar Farmacéutico'));
    }

    // Create 2 Administrativos
    for (let i = 1; i <= 2; i++) {
        employees.push(new Employee(`AD${i}`, 'Administrativo'));
    }

    // Create 2 Domiciliarios
    for (let i = 1; i <= 2; i++) {
        employees.push(new Employee(`D${i}`, 'Domiciliario'));
    }
}

function generateSchedule() {
    console.log("Generando horario...");
    const daysInNovember = 30;
    const deliveryPersons = employees.filter(employee => employee.role === 'Domiciliario');
    const auxiliaries = employees.filter(employee => employee.role === 'Auxiliar Farmacéutico');
    const administrators = employees.filter(employee => employee.role === 'Administrativo');

    // Días válidos para trabajar
    const validWorkDays = ['Lunes', 'Miércoles', 'Viernes', 'Domingo'];

    for (let day = 1; day <= daysInNovember; day++) {
        const date = new Date(2024, 10, day);
        const dayString = date.toISOString().split('T')[0];
        const dayName = getDayName(date);

        // Solo trabajar en días válidos
        if (validWorkDays.includes(dayName)) {
            const restDayEmployees = employees.filter(employee => employee.restDays.includes(dayString));
            console.log(`Día: ${dayString}, Empleados en descanso: ${restDayEmployees.map(e => e.name).join(', ')}`);

            // Asignar 1 Domiciliario (solo uno por día)
            const availableDeliveryPersons = deliveryPersons.filter(employee => !restDayEmployees.includes(employee));
            if (availableDeliveryPersons.length > 0) {
                const selectedDeliveryPerson = availableDeliveryPersons[Math.floor(Math.random() * availableDeliveryPersons.length)];
                selectedDeliveryPerson.schedule.push(new Schedule(dayString, 'Domiciliario', selectedDeliveryPerson.name));
            }

            // Filtrar Auxiliares Farmacéuticos disponibles
            const availableAF = auxiliaries.filter(employee => !restDayEmployees.includes(employee));

            // Si hay exactamente 3 Auxiliares Farmacéuticos, asignar uno con turno partido
            if (availableAF.length === 3) {
                const indexForPartido = Math.floor(Math.random() * availableAF.length);
                const partidoAF = availableAF[indexForPartido];

                // Asignar el turno partido al AF seleccionado
                partidoAF.schedule.push(new Schedule(dayString, 'Turno 3', partidoAF.name)); // Turno partido

                // Asignar turnos normales a los otros dos AF
                availableAF.forEach((employee, index) => {
                    if (index !== indexForPartido) {
                        // Continuación de la función generateSchedule
                        employee.schedule.push(new Schedule(dayString, 'Turno 1', employee.name)); // Mañana
                    }
                });
            } else if (availableAF.length > 0) {
                // Asignar turnos normales a los disponibles
                availableAF.forEach(employee => {
                    employee.schedule.push(new Schedule(dayString, 'Turno 1', employee.name)); // Mañana
                });
            }
        }
    }

    // Llama a displaySchedule después de generar el horario
    displaySchedule();
}

function displaySchedule() {
    console.log("Mostrando horario...");
    const allSchedules = [];

    // Agrupar turnos por fecha
    employees.forEach(employee => {
        employee.schedule.forEach(schedule => {
            allSchedules.push({
                date: schedule.date,
                shift: schedule.shift,
                employee: employee.name,
                hours: shifts.find(shift => shift.name === schedule.shift).description,
                type: 'turno' // Tipo de evento
            });
        });

        // Agrupar días de descanso
        employee.restDays.forEach(restDay => {
            allSchedules.push({
                date: restDay,
                shift: 'Descanso',
                employee: employee.name,
                hours: 'Día de descanso',
                type: 'descanso' // Tipo de evento
            });
        });
    });

    allSchedules.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Limpiar eventos anteriores
    window.calendar.removeAllEvents();

    // Crear eventos para cada empleado en cada fecha
    allSchedules.forEach(schedule => {
        const event = {
            title: `${schedule.employee}: ${schedule.hours}`, // Mostrar el nombre del empleado y sus horas
            start: schedule.date,
            extendedProps: {
                shift: schedule.shift,
                employee: schedule.employee,
                hours: schedule.hours,
                type: schedule.type
            }
        };

        // Asignar un color diferente para los días de descanso
        if (schedule.type === 'descanso') {
            event.color = 'green'; // Color para días de descanso
        } else {
            event.color = 'blue'; // Color para turnos
        }

        window.calendar.addEvent(event);
    });
}

function getDayName(date) {
    const options = { weekday: 'long' };
    return new Intl.DateTimeFormat('es-ES', options).format(date);
}

function calculateRestDays() {
    // Aquí puedes definir la lógica para calcular los días de descanso de los empleados
    const totalEmployees = employees.length;
    const restDaysCount = Math.floor(totalEmployees / 2); // Ejemplo: cada empleado tiene 2 días de descanso

    employees.forEach(employee => {
        const restDays = [];
        for (let i = 0; i < restDaysCount; i++) {
            const randomRestDay = `2024-11-${Math.floor(Math.random() * 30) + 1}`; // Genera un día aleatorio en noviembre
            if (!restDays.includes(randomRestDay)) {
                restDays.push(randomRestDay);
            }
        }
        employee.restDays = restDays;
    });
}

function displayRestDays() {
    console.log("Mostrando días de descanso...");
    employees.forEach(employee => {
        console.log(`Días de descanso para ${employee.name}: ${employee.restDays.join(', ')}`);
    });
}



// Function to show a confirmation message
function showConfirmation() {
    alert('El horario ha sido guardado exitosamente.');
}

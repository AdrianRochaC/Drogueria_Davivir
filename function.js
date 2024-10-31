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
    const numEmployees = document.getElementById('numEmpleados').value;

    // Obtener las horas de los turnos desde el formulario
    const turnoDiaInicio = document.getElementById('turnoDiaInicio').value;
    const turnoDiaFin = document.getElementById('turnoDiaFin').value;
    const turnoTardeInicio = document.getElementById('turnoTardeInicio').value;
    const turnoTardeFin = document.getElementById('turnoTardeFin').value;
    const turnoPartidoInicio1 = document.getElementById('turnoPartidoInicio1').value;
    const turnoPartidoFin1 = document.getElementById('turnoPartidoFin1').value;
    const turnoPartidoInicio2 = document.getElementById('turnoPartidoInicio2').value;
    const turnoPartidoFin2 = document.getElementById('turnoPartidoFin2').value;

    // Actualizar la lista de turnos
    shifts[0].description = `Mañana (${turnoDiaInicio} - ${turnoDiaFin})`;
    shifts[1].description = `Tarde (${turnoTardeInicio} - ${turnoTardeFin})`;
    shifts[2].description = `Partido (${turnoPartidoInicio1} - ${turnoPartidoFin1}, ${turnoPartidoInicio2} - ${turnoPartidoFin2})`;

    generateEmployees(numEmployees);
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

    for (let day = 1; day <= daysInNovember; day++) {
        const date = new Date(2024, 10, day);
        const dayString = date.toISOString().split('T')[0];

        const restDayEmployees = employees.filter(employee => employee.restDays.includes(dayString));
        console.log(`Día: ${dayString}, Empleados en descanso: ${restDayEmployees.map(e => e.name).join(', ')}`);

                // Asignar 1 Domiciliario (solo uno por día)
        // Asignar 1 Domiciliario (solo uno por día)
        const availableDeliveryPersons = deliveryPersons.filter(employee => !restDayEmployees.includes(employee));
        if (availableDeliveryPersons.length > 0) {
            const selectedDeliveryPerson = availableDeliveryPersons[Math.floor(Math.random() * availableDeliveryPersons.length)];
@@ -113,6 +113,14 @@
            selectedAF.forEach(employee => {
                employee.schedule.push(new Schedule(dayString, 'Turno 1', employee.name)); // Mañana
            });
        } else if (availableAF.length === 2) {
            // Si hay exactamente 2 Auxiliares Farmacéuticos, asignar el turno partido a uno y el turno tarde al otro
            const selectedAF = availableAF.sort(() => Math.random() - 0.5);
            selectedAF[0].schedule.push(new Schedule(dayString, 'Turno 3', selectedAF[0].name)); // Turno partido
            selectedAF[1].schedule.push(new Schedule(dayString, 'Turno 2', selectedAF[1].name)); // Turno tarde
        } else if (availableAF.length === 1) {
            // Si solo hay 1 Auxiliar Farmacéutico, asignar solo el turno de mañana
            availableAF[0].schedule.push(new Schedule(dayString, 'Turno 1', availableAF[0].name)); // Turno de mañana
        }

        // Asignar 1 Administrativo (AD) en la mañana
@@ -123,167 +131,170 @@
            selectedADMorning.schedule.push(new Schedule(dayString, 'Turno 1', selectedADMorning.name));
        }

        // Asignar 1 Administrativo (AD) en la tarde
                // Asignar 1 Administrativo (AD) en la tarde
        const availableADAfternoon = administrators.filter(ad => !restDayEmployees.includes(ad) && ad !== selectedADMorning);
        if (availableADAfternoon.length > 0) {
            const selectedADAfternoon = availableADAfternoon[Math.floor(Math.random() * availableADAfternoon.length)];
            selectedADAfternoon.schedule.push(new Schedule(dayString, 'Turno 2', selectedADAfternoon.name));
        } else if (availableADMorning && !restDayEmployees.includes(selectedADMorning)) {
            // Si no hay disponibles para la tarde, asignar el turno partido al administrativo
            selectedADMorning.schedule.push(new Schedule(dayString, 'Turno 3', selectedADMorning.name));
        }
    }
}

// Helper function to get the name of the day
function getDayName(date) {
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
}

// Inicializar el calendario
document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    const calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Initial view of the calendar
        events: [], // Events will be added here
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventClick: function(info) {
            alert('Shift: ' + info.event.title + '\nEmployee: ' + info.event.extendedProps.employee);
        }
    });

    calendar.render();
    window.calendar = calendar; // Save reference to the calendar
});

// Modificar displaySchedule para usar el calendario
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
                hours: shifts.find(shift => shift.name === schedule.shift).description
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
                hours: schedule.hours
            }
        };
        window.calendar.addEvent(event);
    });

    console.log("Horario mostrado en el calendario:", allSchedules);
}

function calculateRestDays() {
    console.log("Calculando días de descanso...");
    const validRestDays = ['Lunes', 'Miércoles', 'Viernes', 'Domingo'];
    const restDaysMap = {
        'Lunes': 1,
        'Miércoles': 3,
        'Viernes': 5,
        'Domingo': 0
    };

    const assignedRestDays = new Set(); // Para rastrear los días de descanso asignados
        employees.forEach(employee => {
        const restDays = [];

        // Asegúrate de que solo se asignen días de descanso válidos
        while (restDays.length < 2) {
            const randomIndex = Math.floor(Math.random() * validRestDays.length);
            const selectedDay = validRestDays[randomIndex];

            // Verifica que el día no esté ya asignado a otro empleado
            if (!restDays.includes(selectedDay) && !assignedRestDays.has(selectedDay)) {
                restDays.push(selectedDay);
                assignedRestDays.add(selectedDay); // Marca el día como asignado
            }

            // Si ya se han asignado todos los días válidos, salimos del bucle
            if (assignedRestDays.size === validRestDays.length) {
                break;
            }
        }

        console.log(`Empleado: ${employee.name}, Días de descanso: ${restDays.join(', ')}`);

        const restDates = restDays.map(day => {
            const dayOfMonth = restDaysMap[day];
            const date = new Date(2024, 10, dayOfMonth);
            return date.toISOString().split('T')[0];
        });

        employee.restDays = restDates;
    });
}

function displayRestDays() {
    console.log("Mostrando días de descanso...");
    const descansosBody = document.getElementById('descansosBody');
    descansosBody.innerHTML = ''; // Limpiar el contenido anterior

    employees.forEach(employee => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${employee.name}</td>
            <td>${employee.restDays.length > 0 ? employee.restDays.join(', ') : 'Sin días de descanso'}</td>
        `;
        descansosBody.appendChild(row);
    });

    console.log("Días de descanso mostrados:", employees.map(e => ({ name: e.name, restDays: e.restDays })));
}

// Function to save schedule changes
function saveSchedule() {
    const scheduleData = employees.map(employee => {
        return {
            name: employee.name,
            schedule: employee.schedule,
            restDays: employee.restDays
        };
    });

    // Aquí puedes implementar la lógica para guardar los datos, por ejemplo, enviarlos a un servidor
    console.log('Schedule saved:', JSON.stringify(scheduleData, null, 2));
}

// Event for the save button
document.getElementById('saveButton').addEventListener('click', function() {
    saveSchedule();
    showConfirmation();
});

// Function to show a confirmation message
function showConfirmation() {
    alert('El horario ha sido guardado exitosamente.');
}


// Function to show a confirmation message
function showConfirmation() {
    alert('El horario ha sido guardado exitosamente.');
}

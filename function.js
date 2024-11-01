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

// Inicializar el calendario
let calendar;

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth', // Vista inicial del calendario
        events: [], // Los eventos se agregarán aquí
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventClick: function(info) {
            alert('Turno: ' + info.event.title + '\nEmpleado: ' + info.event.extendedProps.employee);
        }
    });

    calendar.render();
});

// Manejar el envío del formulario
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

function generateEmployees(numEmployees) {
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

        // Asignar días de descanso
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

        // Asignar turnos a Auxiliares Farmacéuticos y Administrativos
        if (availableAF.length >= 4) {
            // Asignar 2 AF a la mañana de manera aleatoria
            const morningAF = [];
            while (morningAF.length < 2 && availableAF.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableAF.length);
                morningAF.push(availableAF[randomIndex]);
                availableAF.splice(randomIndex, 1); // Eliminar el empleado seleccionado para que no se repita
            }
            morningAF.forEach(employee => {
                employee.schedule.push(new Schedule(dayString, 'Turno 1', employee.name)); // Turno de mañana
            });

            // Asignar 1 AD a la mañana de manera aleatoria
            const availableADMorning = administrators.filter(ad => !restDayEmployees.includes(ad));
            if (availableADMorning.length > 0) {
                const selectedADMorning = availableADMorning[Math.floor(Math.random() * availableADMorning.length)];
                selectedADMorning.schedule.push(new Schedule(dayString, 'Turno 1', selectedADMorning.name));
            }

            // Asignar 2 AF a la tarde de manera aleatoria
            const afternoonAF = [];
            while (afternoonAF.length < 2 && availableAF.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableAF.length);
                afternoonAF.push(availableAF[randomIndex]);
                availableAF.splice(randomIndex, 1); // Eliminar el empleado seleccionado para que no se repita
            }
            afternoonAF.forEach(employee => {
                employee.schedule.push(new Schedule(dayString, 'Turno 2', employee.name)); // Turno de tarde
            });

            // Asignar 1 AD a la tarde de manera aleatoria, asegurando que no sea el mismo que el de la mañana
            const availableADAfternoon = administrators.filter(ad => !restDayEmployees.includes(ad) && ad !== selectedADMorning);
            if (availableADAfternoon.length > 0) {
                const selectedADAfternoon = availableADAfternoon[Math.floor(Math.random() * availableADAfternoon.length)];
                selectedADAfternoon.schedule.push(new Schedule(dayString, 'Turno 2', selectedADAfternoon.name));
            }
        } else {
            console.log(`No hay suficientes Auxiliares Farmacéuticos disponibles para el día ${dayString}`);
        }
    }
}

function calculateRestDays() {
    console.log("Calculando días de descanso...");

    // Días válidos para descanso
    const validRestDays = [
        new Date(2024, 10, 2), // Ejemplo de fechas específicas
        new Date(2024, 10, 9),
        new Date(2024, 10, 16),
        new Date(2024, 10, 23),
        new Date(2024, 10, 30)
    ];

    employees.forEach(employee => {
        // Seleccionar un día de descanso aleatorio de las fechas válidas
        const randomIndex = Math.floor(Math.random() * validRestDays.length);
        const restDay = validRestDays[randomIndex].toISOString().split('T')[0]; // Formato YYYY-MM-DD

        console.log(`Empleado: ${employee.name}, Día de descanso: ${restDay}`);

        // Asignar el día de descanso al empleado
        employee.restDays = [restDay]; // Solo un día de descanso
    });
}

function displaySchedule() {
    console.log("Mostrando horario...");
    const allSchedules = [];

    employees.forEach(employee => {
        // Agregar turnos
        employee.schedule.forEach(schedule => {
            allSchedules.push({
                date: schedule.date,
                shift: schedule.shift,
                employee: employee.name,
                hours: shifts.find(shift => shift.name === schedule.shift).description,
                type: 'turno'
            });
        });

        // No agregar días de descanso al calendario
        // No se agrega nada para los días de descanso
    });

    allSchedules.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Limpiar eventos anteriores en el calendario
    calendar.removeAllEvents();

    allSchedules.forEach(schedule => {
        const event = {
            title: `${schedule.employee}: ${schedule.hours}`,
            start: schedule.date,
            extendedProps: {
                shift: schedule.shift,
                employee: schedule.employee,
                hours: schedule.hours,
                type: schedule.type
            }
        };

        event.color = 'blue'; // Color para turnos

        calendar.addEvent(event);
    });

    console.log("Horario mostrado en el calendario:", allSchedules);
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

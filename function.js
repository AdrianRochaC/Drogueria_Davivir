class Employee {
    constructor(name, role) {
        this.name = name;
        this.role = role;
        this.schedule = [];
        this.restDays = [];
    }
}

class Schedule {
    constructor(date, shift, employeeName) {
        this.date = date;
        this.shift = shift; // Turno 1, Turno 2, Turno 3, Domiciliario
        this.employeeName = employeeName;
    }
}

const employees = [];
const shifts = [
    { name: 'Turno 1', description: '' }, // Turno de mañana
    { name: 'Turno 2', description: '' }, // Turno de tarde
    { name: 'Turno 3', description: '' }, // Turno partido
    { name: 'Domiciliario', description: '' } // Turno domiciliario
];

// Inicializar el calendario
let calendar;

document.addEventListener('DOMContentLoaded', function() {
    const calendarEl = document.getElementById('calendar');
    calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: 'dayGridMonth',
        events: [],
        headerToolbar: {
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
        },
        eventClick: function(info) {
            alert('Turno: ' + info.event.title + '\nEmpleado: ' + info.event.extendedProps.employeeName);
        },
        datesSet: function(dateInfo) {
            const year = dateInfo.start.getFullYear();
            const month = dateInfo.start.getMonth();
            generateScheduleForMonth(year, month);
            displaySchedule();
            displayRestDays();
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
    shifts[3].description = `Domiciliario (9:00 AM - 1:00 PM, 3:00 PM - 9:00 PM)`; // Este turno es fijo

    generateEmployees(numEmployees);
    const year = new Date().getFullYear(); // Año actual
    const month = new Date().getMonth(); // Mes actual
    generateScheduleForMonth(year, month);
    displaySchedule();
    displayRestDays();
});

function generateEmployees(numEmployees) {
    employees.length = 0; // Reset employees array

    // Crear 4 Auxiliares Farmacéuticos
    for (let i = 1; i <= 4; i++) {
        employees.push(new Employee(`AF${i}`, 'Auxiliar Farmacéutico'));
    }

    // Crear 2 Administrativos
    for (let i = 1; i <= 2; i++) {
        employees.push(new Employee(`AD${i}`, 'Administrativo'));
    }

    // Crear 2 Domiciliarios
    for (let i = 1; i <= 2; i++) {
        employees.push(new Employee(`D${i}`, 'Domiciliario'));
    }
}

function generateScheduleForMonth(year, month) {
    console.log(`Generando horario para ${month + 1}/${year}...`);

    // Limpiar el horario actual
    employees.forEach(employee => {
        employee.schedule = [];
        employee.restDays = [];
    });

    const daysInMonth = new Date(year, month + 1, 0).getDate(); // Obtener el número de días en el mes
    const deliveryPersons = employees.filter(employee => employee.role === 'Domiciliario');
    const auxiliaries = employees.filter(employee => employee.role === 'Auxiliar Farmacéutico');
    const administrators = employees.filter(employee => employee.role === 'Administrativo');

    // Asignar días de descanso
    calculateRestDaysForMonth(year, month, daysInMonth);

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dayString = date.toISOString().split('T')[0];
        const dayOfWeek = date.getDay(); // 0: Domingo, 1: Lunes, ..., 6: Sábado

        // Asignar 1 Domiciliario (solo uno por día)
        const availableDeliveryPersons = deliveryPersons.filter(employee => !employee.restDays.includes(dayString));
        if (availableDeliveryPersons.length > 0) {
            const selectedDeliveryPerson = availableDeliveryPersons[Math.floor(Math.random() * availableDeliveryPersons.length)];
            selectedDeliveryPerson.schedule.push(new Schedule(dayString, 'Domiciliario', selectedDeliveryPerson.name));
        }

        // Filtrar Auxiliares Farmacéuticos disponibles
        const availableAF = auxiliaries.filter(employee => !employee.restDays.includes(dayString));

        // Asignar turnos a Auxiliares Farmacéuticos
        if (availableAF.length >= 2) {
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
        }

        // Asignar turnos a Administrativos
        const availableAdministrators = administrators.filter(ad => !ad.restDays.includes(dayString));
        if (availableAdministrators.length > 0) {
            const selectedADMorning = availableAdministrators[Math.floor(Math.random() * availableAdministrators.length)];
            selectedADMorning.schedule.push(new Schedule(dayString, 'Turno 1', selectedADMorning.name)); // Turno de mañana
        }

        // Asignar 2 AF a la tarde de manera aleatoria
        if (availableAF.length >= 2) {
            const afternoonAF = [];
            while (afternoonAF.length < 2 && availableAF.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableAF.length);
                afternoonAF.push(availableAF[randomIndex]);
                availableAF.splice(randomIndex, 1); // Eliminar el empleado seleccionado para que no se repita
            }
            afternoonAF.forEach(employee => {
                employee.schedule.push(new Schedule(dayString, 'Turno 2', employee.name)); // Turno de tarde
            });
        }

        // Asignar 1 AD a la tarde de manera aleatoria, si hay disponibles
        if (availableAdministrators.length > 0) {
            const selectedADAfternoon = availableAdministrators[Math.floor(Math.random() * availableAdministrators.length)];
            selectedADAfternoon.schedule.push(new Schedule(dayString, 'Turno 2', selectedADAfternoon.name)); // Turno de tarde
        }
    }
}

function calculateRestDaysForMonth(year, month, daysInMonth) {
    console.log("Calculando días de descanso para el mes...");

    // Limpiar días de descanso anteriores
    employees.forEach(employee => {
        employee.restDays = [];
    });

    // Asignar días de descanso a Auxiliares Farmacéuticos
    const auxiliaries = employees.filter(employee => employee.role === 'Auxiliar Farmacéutico');
    
    auxiliaries.forEach(employee => {
        let restDay;
        do {
            restDay = Math.floor(Math.random() * daysInMonth) + 1; // Día aleatorio entre 1 y daysInMonth
        } while (employee.restDays.includes(`2024-${String(month + 1).padStart(2, '0')}-${String(restDay).padStart(            2, '0')}-${String(restDay).padStart(2, '0')}`)); // Asegurarse de que no se repita el día de descanso

        employee.restDays.push(`2024-${String(month + 1).padStart(2, '0')}-${String(restDay).padStart(2, '0')}`);
    });

    // Asignar días de descanso a Administrativos
    const administrators = employees.filter(employee => employee.role === 'Administrativo');
    administrators.forEach(employee => {
        let restDay;
        do {
            restDay = Math.floor(Math.random() * daysInMonth) + 1; // Día aleatorio entre 1 y daysInMonth
        } while (employee.restDays.includes(`2024-${String(month + 1).padStart(2, '0')}-${String(restDay).padStart(2, '0')}`));

        employee.restDays.push(`2024-${String(month + 1).padStart(2, '0')}-${String(restDay).padStart(2, '0')}`);
    });
}

function displaySchedule() {
    const events = [];
    employees.forEach(employee => {
        employee.schedule.forEach(schedule => {
            events.push({
                title: `${schedule.shift} - ${employee.name}`,
                start: schedule.date,
                extendedProps: {
                    employeeName: employee.name
                }
            });
        });
    });
    calendar.addEventSource(events);
}

function displayRestDays() {
    const restDaysEl = document.getElementById('restDays');
    restDaysEl.innerHTML = ''; // Limpiar días de descanso previos

    employees.forEach(employee => {
        if (employee.restDays.length > 0) {
            const restDaysList = document.createElement('ul');
            restDaysList.innerHTML = `<strong>${employee.name} (${employee.role})</strong>:`;
            employee.restDays.forEach(day => {
                const listItem = document.createElement('li');
                listItem.textContent = day;
                restDaysList.appendChild(listItem);
            });
            restDaysEl.appendChild(restDaysList);
        }
    });
}


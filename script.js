let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("events")) || [];

const calendar = document.getElementById("calendar");
const monthYear = document.getElementById("monthYear");

function renderCalendar() {
  calendar.innerHTML = "";
  const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
  monthYear.textContent = `${monthStart.toLocaleString('default', { month: 'long' })} ${currentDate.getFullYear()}`;
  
  const startDay = monthStart.getDay();
  for (let i = 0; i < startDay; i++) {
    calendar.innerHTML += `<div></div>`;
  }

  for (let d = 1; d <= monthEnd.getDate(); d++) {
    const dateStr = `${currentDate.getFullYear()}-${(currentDate.getMonth()+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`;
    const dayEl = document.createElement("div");
    dayEl.className = "day";
    if (new Date().toDateString() === new Date(dateStr).toDateString()) dayEl.classList.add("today");
    dayEl.dataset.date = dateStr;
    dayEl.innerHTML = `<strong>${d}</strong>`;
    dayEl.addEventListener("click", openAddEventModal);
    dayEl.ondragover = e => e.preventDefault();
    dayEl.ondrop = e => onDropEvent(e, dateStr);

    events.filter(ev => ev.date === dateStr).forEach(ev => {
      const evEl = document.createElement("div");
      evEl.className = "event";
      evEl.textContent = ev.title;
      evEl.style.background = ev.color;
      evEl.draggable = true;
      evEl.ondragstart = e => e.dataTransfer.setData("text/plain", ev.id);
      evEl.onclick = e => {
        e.stopPropagation();
        openEditEventModal(ev.id);
      };
      dayEl.appendChild(evEl);
    });

    calendar.appendChild(dayEl);
  }
}

function openAddEventModal(e) {
  e.stopPropagation();
  document.getElementById("eventForm").reset();
  document.getElementById("editingEventId").value = "";
  document.getElementById("eventDateTime").value = e.currentTarget.dataset.date+"T12:00";
  document.getElementById("eventModal").style.display = "flex";
  document.getElementById("modalTitle").textContent = "Add Event";
}

function openEditEventModal(id) {
  const ev = events.find(e => e.id == id);
  document.getElementById("eventTitle").value = ev.title;
  document.getElementById("eventDateTime").value = ev.date+"T12:00";
  document.getElementById("eventDescription").value = ev.desc;
  document.getElementById("eventRecurrence").value = ev.recurrence;
  document.getElementById("eventColor").value = ev.color;
  document.getElementById("editingEventId").value = ev.id;
  document.getElementById("modalTitle").textContent = "Edit Event";
  document.getElementById("eventModal").style.display = "flex";
}

function onDropEvent(e, newDate) {
  const id = e.dataTransfer.getData("text/plain");
  const ev = events.find(ev => ev.id == id);
  if (events.some(ev => ev.date == newDate && ev.title == ev.title)) {
    alert("Conflict: Event with same title exists on this day.");
    return;
  }
  ev.date = newDate;
  saveEvents();
  renderCalendar();
}

document.getElementById("eventForm").onsubmit = function(e) {
  e.preventDefault();
  const id = document.getElementById("editingEventId").value;
  const eventObj = {
    id: id || Date.now(),
    title: document.getElementById("eventTitle").value,
    date: document.getElementById("eventDateTime").value.slice(0,10),
    desc: document.getElementById("eventDescription").value,
    recurrence: document.getElementById("eventRecurrence").value,
    color: document.getElementById("eventColor").value
  };

  if (id) {
    events = events.map(ev => ev.id == id ? eventObj : ev);
  } else {
    events.push(eventObj);
  }
  saveEvents();
  document.getElementById("eventModal").style.display = "none";
  renderCalendar();
}

function saveEvents() {
  localStorage.setItem("events", JSON.stringify(events));
}

document.getElementById("closeModal").onclick = () => document.getElementById("eventModal").style.display = "none";
document.getElementById("prevMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth()-1); renderCalendar(); }
document.getElementById("nextMonth").onclick = () => { currentDate.setMonth(currentDate.getMonth()+1); renderCalendar(); }

renderCalendar();

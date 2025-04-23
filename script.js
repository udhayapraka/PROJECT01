document.addEventListener("DOMContentLoaded", () => {
  const moodButtons = document.querySelectorAll(".mood-btn");
  const noteEl = document.getElementById("note");
  const saveBtn = document.getElementById("save-entry");
  const weatherEl = document.getElementById("weather");
  const iconEl = document.getElementById("weather-icon");
  const tempEl = document.getElementById("weather-temp");
  const calendar = document.getElementById("calendar");
  const entriesList = document.getElementById("entries-list");
  const dateEl = document.getElementById("date");

  const currentDate = new Date();
  const formattedDate = currentDate.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });
  dateEl.textContent = formattedDate;

  let selectedMood = null;
  moodButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      moodButtons.forEach(b => b.classList.remove("ring", "ring-orange-400"));
      btn.classList.add("ring", "ring-orange-400");
      selectedMood = btn.textContent;
    });
  });

  function fetchWeather(lat, lon) {
    const apiKey = "1e0e0adcd546b9a71c99d536164d42d9";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        const iconCode = data.weather[0].icon;
        const temp = Math.round(data.main.temp);
        iconEl.innerHTML = `<img src="https://openweathermap.org/img/wn/${iconCode}@2x.png" class="h-6 w-6"/>`;
        tempEl.textContent = `${temp}°C`;
      })
      .catch(() => {
        iconEl.textContent = "☁️";
        tempEl.textContent = "--";
      });
  }

  navigator.geolocation.getCurrentPosition(pos => {
    const { latitude, longitude } = pos.coords;
    fetchWeather(latitude, longitude);
  });

  function renderEntries() {
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    entriesList.innerHTML = "";
    entries.reverse().forEach(entry => {
      const card = document.createElement("div");
      card.className = "p-4 bg-orange-50 rounded-xl shadow text-sm";
      card.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="text-xl">${entry.mood}</span>
          <span class="text-gray-500">${entry.date}</span>
        </div>
        <p class="mt-2 text-gray-800">${entry.note}</p>
        <p class="text-xs text-gray-500 mt-1">${entry.weather}</p>
      `;
      entriesList.appendChild(card);
    });

    const calendarCells = calendar.querySelectorAll("[data-day]");
    calendarCells.forEach(cell => {
      const day = cell.dataset.day;
      const match = entries.find(e => e.date.includes(` ${parseInt(day)},`));
      if (match) {
        cell.textContent = match.mood;
      } else {
        cell.textContent = day;
      }
    });
  }

  saveBtn.addEventListener("click", () => {
    if (!selectedMood || !noteEl.value.trim()) {
      alert("Please select a mood and write a note.");
      return;
    }
    const entry = {
      date: formattedDate,
      mood: selectedMood,
      note: noteEl.value.trim(),
      weather: `${iconEl.innerHTML} ${tempEl.textContent}`
    };
    const entries = JSON.parse(localStorage.getItem("entries") || "[]");
    entries.push(entry);
    localStorage.setItem("entries", JSON.stringify(entries));
    noteEl.value = "";
    selectedMood = null;
    moodButtons.forEach(b => b.classList.remove("ring", "ring-orange-400"));
    renderEntries();
  });

  renderEntries();
});

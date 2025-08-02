const apiKey = '09cba8d1378643a6849195052253107';

const weatherDiv = document.getElementById('weatherDisplay');
const locationDiv = document.getElementById('location');
const tempDiv = document.getElementById('temp');
const descDiv = document.getElementById('description');
const iconImg = document.getElementById('icon');
const humidityDiv = document.getElementById('humidity');
const windDiv = document.getElementById('wind');
const feelsLikeDiv = document.getElementById('feelslike');
const loadingDiv = document.getElementById('loading');
const toggleBtn = document.getElementById('toggleTemp');
const modeBtn = document.getElementById('modeToggle');
const citySelect = document.getElementById('citySelect');
const customInput = document.getElementById('customLocation');
const setLocationBtn = document.getElementById('setLocationBtn');

const funMessageDiv = document.getElementById('funMessage');
const funMessage2Div = document.getElementById('funMessage2');
const forecastContainer = document.getElementById('forecast');

// New elements
const uvDiv = document.getElementById('uvIndex');
const airQualityDiv = document.getElementById('airQuality');
const sunDiv = document.getElementById('sunriseSunset');
const moonDiv = document.getElementById('moonPhase');

let currentTempC = null; // Celsius
let isFahrenheit = false;
let isDarkMode = false;

function fetchWeather(city) {
  loadingDiv.style.display = 'block';
  weatherDiv.classList.remove('show');
  forecastContainer.innerHTML = '';

  if (!city || city === "Your Location") {
    if (city === 'Your Location' && customInput.style.display === 'block' && customInput.value.trim() !== '') {
      city = customInput.value.trim();
      customInput.value = '';
      fetchWeatherData(city);
      return;
    } else if (city === 'Your Location' && customInput.style.display === 'none') {
      customInput.style.display = 'block';
      setTimeout(() => { customInput.focus(); }, 100);
      return;
    } else {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            getWeatherByCoords(latitude, longitude);
          },
          () => {
            loadingDiv.style.display = 'none';
            alert('Geolocation access denied.');
          }
        );
      } else {
        loadingDiv.style.display = 'none';
        alert('Geolocation not supported.');
      }
      return;
    }
  }

  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${encodeURIComponent(city)}&days=7`)
    .then(res => res.json())
    .then(data => updateWeather(data))
    .catch(() => {
      loadingDiv.style.display = 'none';
      alert('Error fetching weather data.');
    });
}

function getWeatherByCoords(lat, lon) {
  fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${lat},${lon}&days=7`)
    .then(res => res.json())
    .then(data => updateWeather(data))
    .catch(() => {
      loadingDiv.style.display = 'none';
      alert('Error fetching weather data.');
    });
}

function updateWeather(data) {
  currentTempC = data.current.temp_c;
  isFahrenheit = false;
  locationDiv.innerText = `${data.location.name}, ${data.location.region}`;
  updateTemperatureDisplay();
  descDiv.innerText = data.current.condition.text;
  iconImg.src = data.current.condition.icon;
  iconImg.alt = data.current.condition.text;
  humidityDiv.innerText = `Humidity: ${data.current.humidity}%`;
  windDiv.innerText = `Wind: ${data.current.wind_kph} kph`;
  feelsLikeDiv.innerText = `Feels like: ${data.current.feelslike_c} °C`;

  // Day/Night mode
  if (typeof data.current.is_day !== 'undefined') {
    if (data.current.is_day == 0) {
      document.body.classList.add('dark-mode');
      isDarkMode = true;
      document.getElementById('modeToggle').innerText = 'Light Mode';
    } else {
      document.body.classList.remove('dark-mode');
      isDarkMode = false;
      document.getElementById('modeToggle').innerText = 'Dark Mode';
    }
  } else {
    const localTimeStr = data.location.localtime;
    const hour = parseInt(localTimeStr.split(' ')[1].split(':')[0]);
    if (hour >= 19 || hour <= 6) {
      document.body.classList.add('dark-mode');
      isDarkMode = true;
      document.getElementById('modeToggle').innerText = 'Light Mode';
    } else {
      document.body.classList.remove('dark-mode');
      isDarkMode = false;
      document.getElementById('modeToggle').innerText = 'Dark Mode';
    }
  }

  // Display fun message
  displayFunMessage(data);

  // Generate forecast
  generateForecast(data.forecast.forecastday);

  // Populate new data points
  // UV Index
  if (data.current.uv !== undefined) {
    uvDiv.innerText = `UV Index: ${data.current.uv}`;
  } else {
    uvDiv.innerText = 'UV Index: N/A';
  }

  // Air Quality
  if (data.current.air_quality) {
    const pm25 = data.current.air_quality.pm2_5;
    airQualityDiv.innerText = `Air Quality (PM2.5): ${pm25}`;
  } else {
    airQualityDiv.innerText = 'Air Quality: N/A';
  }

  // Sunrise / Sunset
  if (data.forecast.forecastday && data.forecast.forecastday.length > 0) {
    const todayForecast = data.forecast.forecastday[0];
    const sunrise = todayForecast.astro.sunrise;
    const sunset = todayForecast.astro.sunset;
    sunDiv.innerText = `Sunrise: ${sunrise} / Sunset: ${sunset}`;
  } else {
    sunDiv.innerText = 'Sunrise/Sunset: N/A';
  }

  // Moon Phase
  if (data.forecast.forecastday && data.forecast.forecastday.length > 0) {
    const moonPhase = todayForecast.astro.moon_phase;
    moonDiv.innerText = `Moon Phase: ${moonPhase}`;
  } else {
    moonDiv.innerText = 'Moon Phase: N/A';
  }

  // Animate weather info
  weatherDiv.style.animation = 'fadeInUp 0.6s forwards';
  setTimeout(() => {
    loadingDiv.style.display = 'none';
    weatherDiv.classList.add('show');
  }, 200);
}

function updateTemperatureDisplay() {
  if (currentTempC === null) return;
  if (isFahrenheit) {
    const tempF = (currentTempC * 9/5) + 32;
    tempDiv.innerText = `${tempF.toFixed(1)} °F`;
    toggleBtn.innerText = 'Show in °C';
  } else {
    tempDiv.innerText = `${currentTempC.toFixed(1)} °C`;
    toggleBtn.innerText = 'Show in °F';
  }
}

function displayFunMessage(data) {
  const conditionCode = data.current.condition.code;
  let message = '';
  if (conditionCode === 1000) {
    message = "It's sunny! Perfect day for ice cream.";
  } else if ([1003, 1006, 1009].includes(conditionCode)) {
    message = "Cloudy skies. Maybe stay in with a good book.";
  } else if ([1183, 1186, 1189].includes(conditionCode)) {
    message = "LOOKS LIKE YOU NEED AN UMBRELLA !";
  } else if ([1273, 1276].includes(conditionCode)) {
    message = "Thunderstorms! Stay safe and dry.";
  } else if ([1135, 1147].includes(conditionCode)) {
    message = "Foggy! Drive carefully.";
  } else {
    message = getRandomFunLine();
  }
  document.getElementById('funMessage').innerText = message;
}

function getRandomFunLine() {
  const lines = [
    "Weather's unpredictable! Stay prepared!",
    "Remember: a sunny outlook starts with a sunny day.",
    "Time for a nap or a snack!",
    "Weather or not, you're awesome!",
    "Stay cozy, no matter the weather.",
    "Look on the bright side!",
    "Rain or shine, keep smiling!"
  ];
  return lines[Math.floor(Math.random() * lines.length)];
}

function generateForecast(forecastDays) {
  forecastContainer.innerHTML = '';
  forecastDays.forEach(day => {
    const dateStr = day.date;
    const date = new Date(dateStr);
    const options = { weekday: 'short' };
    const dayName = date.toLocaleDateString(undefined, options);
    const iconSrc = day.day.condition.icon;
    const maxTemp = day.day.maxtemp_c;
    const minTemp = day.day.mintemp_c;
    const forecastDiv = document.createElement('div');
    forecastDiv.className = 'day';
    forecastDiv.innerHTML = `
      <div style="font-weight:600;">${dayName}</div>
      <img src="${iconSrc}" alt="${day.day.condition.text}" style="width:50px;height:50px;" />
      <div>${maxTemp.toFixed(1)}° / ${minTemp.toFixed(1)}°</div>
    `;
    forecastContainer.appendChild(forecastDiv);
  });
}

// Event Listeners
document.getElementById('citySelect').addEventListener('change', () => {
  const val = document.getElementById('citySelect').value;
  if (val === 'Your Location') {
    customInput.style.display = 'block';
    customInput.focus();
  } else {
    customInput.style.display = 'none';
    fetchWeather(val);
  }
});

document.getElementById('setLocationBtn').onclick = () => {
  const loc = customInput.value.trim();
  if (loc !== '') {
    fetchWeather(loc);
    customInput.style.display = 'none';
  }
};

customInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('setLocationBtn').click();
  }
});

document.getElementById('toggleTemp').addEventListener('click', () => {
  isFahrenheit = !isFahrenheit;
  updateTemperatureDisplay();
});

document.getElementById('modeToggle').onclick = () => {
  document.body.classList.toggle('dark-mode');
  isDarkMode = !isDarkMode;
  document.getElementById('modeToggle').innerText = isDarkMode ? 'Light Mode' : 'Dark Mode';
};

window.onload = () => {
  fetchWeather(document.getElementById('citySelect').value);
};
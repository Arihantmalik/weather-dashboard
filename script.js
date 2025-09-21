const API_KEY = "0c3b762fa5f99c95fe2abf6174aee349";

window.onload = function() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        getWeatherByCoords(position.coords.latitude, position.coords.longitude);
      },
      () => console.log("Geolocation not allowed or unavailable")
    );
  }
};

async function getWeather() {
  const city = document.getElementById("cityInput").value;
  if (!city) return alert("Please enter a city");
  await fetchWeather(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`,
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );
}

function useMyLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => getWeatherByCoords(position.coords.latitude, position.coords.longitude),
      () => alert("Geolocation not allowed or unavailable.")
    );
  } else {
    alert("Geolocation is not supported by your browser.");
  }
}

async function getWeatherByCoords(lat, lon) {
  await fetchWeather(
    `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`,
    `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
  );
}

async function fetchWeather(urlCurrent, urlForecast) {
  try {
    const [resCurrent, resForecast] = await Promise.all([fetch(urlCurrent), fetch(urlForecast)]);
    if (!resCurrent.ok || !resForecast.ok) throw new Error("City/Location not found");

    const dataCurrent = await resCurrent.json();
    const dataForecast = await resForecast.json();

    changeBackground(dataCurrent.weather[0].main);

    document.getElementById("weatherResult").innerHTML = `
      <div class="card weather-card p-4">
        <h2>${dataCurrent.name}, ${dataCurrent.sys.country}</h2>
        <img class="icon" src="https://openweathermap.org/img/wn/${dataCurrent.weather[0].icon}@2x.png" alt="">
        <h3>${dataCurrent.main.temp} °C</h3>
        <p>${dataCurrent.weather[0].description}</p>
        <div class="row mt-3">
          <div class="col">💧 Humidity: ${dataCurrent.main.humidity}%</div>
          <div class="col">💨 Wind: ${dataCurrent.wind.speed} m/s</div>
          <div class="col">🌡️ Feels like: ${dataCurrent.main.feels_like}°C</div>
        </div>
      </div>
    `;

    const dailyForecast = dataForecast.list.filter(item => item.dt_txt.includes("12:00:00"));
    document.getElementById("forecastTitle").innerText = "5-Day Forecast";
    document.getElementById("forecastResult").innerHTML = dailyForecast.map(day => {
      const date = new Date(day.dt_txt);
      return `
        <div class="col-6 col-md-2 forecast-card">
          <h6>${date.toDateString().split(" ").slice(0,3).join(" ")}</h6>
          <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="">
          <p><b>${day.main.temp}°C</b></p>
          <small>${day.weather[0].description}</small>
        </div>
      `;
    }).join("");
  } catch (error) {
    alert(error.message);
  }
}

function changeBackground(condition) {
  let body = document.body;
  switch (condition.toLowerCase()) {
    case "clear": body.style.background = "linear-gradient(to bottom, #f7e36d, #f0a500)"; break;
    case "clouds": body.style.background = "linear-gradient(to bottom, #d7d2cc, #304352)"; break;
    case "rain": body.style.background = "linear-gradient(to bottom, #00c6fb, #005bea)"; break;
    case "snow": body.style.background = "linear-gradient(to bottom, #e6e9f0, #eef1f5)"; break;
    case "thunderstorm": body.style.background = "linear-gradient(to bottom, #373b44, #4286f4)"; break;
    case "drizzle": body.style.background = "linear-gradient(to bottom, #89f7fe, #66a6ff)"; break;
    case "mist":
    case "fog": body.style.background = "linear-gradient(to bottom, #606c88, #3f4c6b)"; break;
    default: body.style.background = "linear-gradient(to bottom, #87ceeb, #f0f8ff)";
  }
}

// Halden coordinates
const LAT = 59.1311;
const LON = 11.3873;

const ENDPOINT = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${LAT}&lon=${LON}`;
// Note: Browsers forbid setting the `User-Agent` header from client-side JS.
// The MET API requires requests to include a proper User-Agent identifying
// the application and contact info. For production, proxy requests through a
// small server that adds the header. See README.md for a proxy example.

const el = {
  current: document.getElementById('current'),
  temp: document.getElementById('temp'),
  condition: document.getElementById('condition'),
  wind: document.getElementById('wind'),
  time: document.getElementById('time'),
  forecast: document.getElementById('forecast'),
  forecastList: document.getElementById('forecast-list'),
  error: document.getElementById('error')
};

function showError(msg){
  el.error.textContent = msg;
  el.error.classList.remove('hidden');
}

function hideError(){
  el.error.classList.add('hidden');
}

function formatTime(iso){
  const d = new Date(iso);
  return d.toLocaleString();
}

function kelvinToCelsius(k){
  return (k - 273.15).toFixed(1);
}

async function fetchForecast(){
  hideError();
  try{
    // Do a plain fetch from the browser. This will not include a custom
    // User-Agent header because browsers disallow it. Many users can run
    // this page as static files and the API will respond normally.
    // If the API rejects requests (HTTP 401/403) or the browser blocks the
    // response due to CORS, we show a helpful message explaining the
    // limitation and next steps.
    const resp = await fetch(ENDPOINT);
    if(!resp.ok){
      if(resp.status === 401 || resp.status === 403){
        throw new Error(`API blocked the request (HTTP ${resp.status}). This often happens when the server requires a custom User-Agent header that browsers cannot set. Try opening the page from a different host or use a server-side proxy when deploying.`);
      }
      throw new Error(`HTTP ${resp.status}`);
    }
    const data = await resp.json();
    render(data);
  }catch(err){
    console.error(err);
    // Distinguish CORS/network errors which manifest without an HTTP status
    if(err instanceof TypeError && err.message === 'Failed to fetch'){
      showError('Network or CORS error when fetching MET data. Run a local static server (e.g. `python3 -m http.server`) and ensure your browser allows the request. See README for notes.');
    }else{
      showError('Failed to load data from MET API: ' + err.message);
    }
  }
}

function pickCurrent(data){
  // compact response has properties: timeseries: [{time, data: {instant: {details}, next_1_hours, ...}}]
  const t = data?.properties?.timeseries;
  if(!t || !t.length) return null;
  // pick first timeseries as 'now'
  return t[0];
}

function render(data){
  const now = pickCurrent(data);
  if(!now){
    showError('No timeseries data available');
    return;
  }

  const instant = now.data.instant.details;
  const tempC = instant.air_temperature ?? null;
  const windSpeed = instant.wind_speed ?? null;

  el.temp.textContent = tempC == null ? '—' : `${tempC.toFixed(1)}°C`;
  el.condition.textContent = `Pressure ${instant.air_pressure_at_sea_level?.toFixed(0) ?? '—'} hPa`;
  el.wind.textContent = `Wind ${windSpeed == null ? '—' : windSpeed.toFixed(1) + ' m/s'}`;
  el.time.textContent = formatTime(now.time);
  el.current.classList.remove('hidden');

  // forecast: show next 6 entries (1h or next_* if available)
  el.forecastList.innerHTML = '';
  const times = data.properties.timeseries.slice(0, 8);
  times.forEach(ts => {
    const d = document.createElement('div');
    d.className = 'forecast-item';
    const t = document.createElement('div');
    t.textContent = new Date(ts.time).toLocaleTimeString();
    const temp = ts.data.instant?.details?.air_temperature;
    const p = ts.data.next_1_hours?.summary?.symbol_code || ts.data.next_6_hours?.summary?.symbol_code || '';
    const icon = document.createElement('div');
    icon.textContent = p.replace('_', ' ');
    const tempEl = document.createElement('div');
    tempEl.textContent = temp == null ? '—' : `${temp.toFixed(1)}°C`;
    d.appendChild(t);
    d.appendChild(icon);
    d.appendChild(tempEl);
    el.forecastList.appendChild(d);
  });
  el.forecast.classList.remove('hidden');
}

// Start
fetchForecast();

// Poll every 10 minutes
setInterval(fetchForecast, 1000 * 60 * 10);

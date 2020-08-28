import * as mapboxPolyline from '@mapbox/polyline';
import { chinaGeojson } from '../static/run_countries';
import { MUNICIPALITY_CITIES_ARR } from './const';

const titleForShow = (run) => {
  const date = run.start_date_local.slice(0, 11);
  const distance = (run.distance / 1000.0).toFixed(1);
  let name = 'Run';
  if (run.name.slice(0, 7) === 'Running') {
    name = 'run';
  }
  if (run.name) {
    name = run.name;
  }
  return `${name} ${date} ${distance} KM`;
};

const formatPace = (d) => {
  const pace = (1000.0 / 60.0) * (1.0 / d);
  const minutes = Math.floor(pace);
  const seconds = Math.floor((pace - minutes) * 60.0);
  return `${minutes}:${seconds.toFixed(0).toString().padStart(2, '0')}`;
};

// for scroll to the map
const scrollToMap = () => {
  const el = document.querySelector('.fl.w-100.w-70-l');
  const rect = el.getBoundingClientRect();
  window.scroll(rect.left + window.scrollX, rect.top + window.scrollY);
};

const locationForRun = (run) => {
  const location = run.location_country;
  let [city, province, country] = ['', '', ''];
  if (location) {
    const cityMatch = location.match(/[\u4e00-\u9fa5]*市/);
    const provinceMatch = location.match(/[\u4e00-\u9fa5]*省/);
    if (cityMatch) {
      [city] = cityMatch;
    }
    if (provinceMatch) {
      [province] = provinceMatch;
    }
    const l = location.split(',');
    const countryMatch = l[l.length - 1].match(/[\u4e00-\u9fa5].*[\u4e00-\u9fa5]/);
    if (countryMatch) {
      [country] = countryMatch;
    }
  }
  if (MUNICIPALITY_CITIES_ARR.includes(city)) {
    province = city;
  }

  return { country, province, city };
};

const intComma = (x) => x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const pathForRun = (run) => {
  try {
    const c = mapboxPolyline.decode(run.summary_polyline);
    // reverse lat long for mapbox
    c.forEach((arr) => {
      [arr[0], arr[1]] = [arr[1], arr[0]];
    });
    return c;
  } catch (err) {
    return [];
  }
};

const geoJsonForRuns = (runs) => ({
  type: 'FeatureCollection',
  features: runs.map((run) => {
    const points = pathForRun(run);
    if (!points) {
      return null;
    }

    return {
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: points,
      },
    };
  }),
});

const geoJsonForMap = () => chinaGeojson;

const titleForRun = (run) => {
  const runDistance = run.distance / 1000;
  const runHour = +run.start_date_local.slice(11, 13);
  if (runDistance > 20 && runDistance < 40) {
    return '跑了个半马';
  }
  if (runDistance >= 40) {
    return '跑了个全马';
  }
  if (runHour >= 0 && runHour <= 8) {
    return '清晨跑步';
  }
  if (runHour > 8 && runHour <= 12) {
    return '上午跑步';
  }
  if (runHour > 12 && runHour <= 18) {
    return '午后跑步';
  }
  if (runHour > 18 && runHour <= 21) {
    return '傍晚跑步';
  }
  return '夜晚跑步';
};

export {
  titleForShow, formatPace, scrollToMap, locationForRun, intComma, pathForRun, geoJsonForRuns, geoJsonForMap, titleForRun,
};

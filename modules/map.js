import { getElement, addClass, setListener, setStyle, removeClass, Maybe, hasAttribute, getAttribute, fetcher, compose } from '../utils';

const geojson = {
  "features": []
};
const clusterRadius = 10;
const API_PATH = '/api/v1.0/about-us';
const domain = location.origin;
const API_URL = `${domain}${API_PATH}`;
const defaultImg = 'https://cdn.amomama.com/production/amotest/assets/nophoto.png';
const MAPBOX_TOKEN = 'pk.eyJ1IjoiZ2FuaTRrYSIsImEiOiJjankwMmJ5c28wOWIyM2Rya25nYms4ZndrIn0.zJ1ekRngMExe9FxYx1b75Q';
const MAPBOX_STYLE = 'mapbox://styles/gani4ka/cjy02hbv127r31cs1syc9s23n';
const LEAFLET_STYLE = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}';
const TRANSLATIONS = {
  en: 'Go to page',
  es: 'Ir a la página',
  fr: 'Aller à la page',
  de: 'Gehe zur Seite',
}
const siteLang = getElement('html').map(getAttribute('lang')).valueOf();
const getTranslation = () => {
const lang = Object.keys(TRANSLATIONS).filter(key => key === siteLang)[0];
return TRANSLATIONS[lang]
};

const makeGeoJson = (data) => {
data.map(el => {
  geojson.features.push(
          {'properties': {
            'id': el.id,
            'link': el.url_to_editor_page,
            'name': el.username,
            'src': el.avatar,
            'description': el.description,
            'position': el.position
          },
          "geometry": {
            "type": "Point",
            "coordinates": [
              el.locations.lng,
              el.locations.lat
            ]
          }}
        )
      });
      return geojson
};

const mapContainer = getElement('#map-container');
const isMobile = mapContainer.map(hasAttribute('data-is-mobile')).valueOf();

const closePopup = elem => elem.map(removeClass('show'));

const showPopup = (arr) => {
  const popup = getElement('.popup');
  popup.map(el => el.innerHTML = '<div class="popup__close-btn"></div>');
  popup.map(addClass('show'));
  const closeBtn = getElement('.popup__close-btn');
  closeBtn.map(setListener('click', () => closePopup(popup)));
  arr.map(obj => {
    const link = document.createElement('A');
    link.insertAdjacentHTML('beforeend', 
    `<div class="popup__item"><div class="popup__img-wrap"><img src=${obj.properties.src || defaultImg} alt="editor photo"></div><div class="popup__text-wrap"><h3 class="popup__name">${obj.properties.name}</h3><p class="popup__post">${obj.properties.position || ''}</p><p class="popup__action">${getTranslation()}</p></div><p class="popup__desc">${obj.properties.description ||  ''}</p></div>`);
    popup.map(el => el.appendChild(link));
    link.setAttribute("href", obj.properties.link);
  })
};

const initBigMap = () => {
  mapboxgl.accessToken = MAPBOX_TOKEN;
  const mapStyle = MAPBOX_STYLE;
  
  const map = new mapboxgl.Map({
    container: 'mapid',
    style: mapStyle,
    center: [10, 10],
    zoom: 1.15,
    minZoom: 1.15,
    maxZoom: 1.15,
    attributionControl: false,
    interactive: false,
  });

  const makeClusters = (data) => {
    map.addSource("editors", {
      type: "geojson",
      data: data,
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: clusterRadius,
    });
    map.addLayer({
      id: "clusters",
      type: "circle",
      source: "editors",
      paint: {
        "circle-color": "#e53966",
        "circle-radius": 7,
        "circle-stroke-width": 5,
        "circle-stroke-color": "rgba(229, 57, 102, 0.3)"
      }
    });
  };

  map.on('load', () => fetcher(API_URL, compose(makeClusters, makeGeoJson)));
  
  const getClusterData = e => {
    const cluster = map.queryRenderedFeatures(e.point, { layers: ["clusters"] });
    if (cluster[0]) {
      const pointsInCluster = geojson.features.filter(f => {
        const pointPixels = map.project(f.geometry.coordinates)
        const pixelDistance = Math.sqrt(
          Math.pow(e.point.x - pointPixels.x, 2) +
          Math.pow(e.point.y - pointPixels.y, 2)
        );
        return Math.abs(pixelDistance) <= clusterRadius;
      });
      showPopup(pointsInCluster);
    }
  }
  map.on('click', 'clusters', getClusterData);
  map.on('mouseenter', 'clusters', function () {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', 'clusters', function () {
    map.getCanvas().style.cursor = '';
  });

  const checkScreenSize = () => {
    map.resize();
      const screenWidth = document.body.offsetWidth;
      switch (true) {
        case screenWidth >= 800 && screenWidth <= 930: {
          map.setMinZoom(0);
          map.setMaxZoom(10);
          map.setZoom(1);
          map.resize();
          break;
        };
        case screenWidth >= 650 && screenWidth < 800: {
          map.setMinZoom(0);
          mapContainer.map(setStyle('height', '400px'));
          map.setZoom(0.6);
          map.resize();
          break;
        };
        case screenWidth >= 500 && screenWidth < 650: {
          map.setMinZoom(0);
          mapContainer.map(setStyle('height', '320px'));
          map.setZoom(0.3);
          map.resize();
          break;
        };
        case screenWidth >= 400 && screenWidth < 500: {
          map.setMinZoom(0);
          mapContainer.map(setStyle('height', '200px'));
          map.setZoom(0);
          map.resize();
          break;
        };
        default: {
          return
        }
      }
  };  
  setListener('load', checkScreenSize, window);
 };

const initSmallMap = () => {
  mapContainer.map(setStyle('height', '200px'));

  const tiles = L.tileLayer(LEAFLET_STYLE, {
    zoomControl: false,
  });

  const makeMarkers = (data) => {
    const markers = L.markerClusterGroup({ 
      maxClusterRadius: clusterRadius, 
      showCoverageOnHover: false,
      zoomToBoundsOnClick: false,
      singleMarkerMode: true,
      spiderfyOnMaxZoom: false
    });
    for (let i = 0; i < data.features.length; i++) {       
      const marker = L.marker(new L.LatLng(data.features[i].geometry.coordinates[1], data.features[i].geometry.coordinates[0]));
      markers.addLayer(marker);
    }
    smallMap.addLayer(markers);
  };

  const smallMap = L.map('map-container', { 
    zoomSnap: 0.1, 
    layers: [tiles],           
    zoomControl: false, 
    doubleClickZoom: false, 
    boxZoom: false,
    scrollWheelZoom: false,
    touchZoom: false,
  })
  .on('load', () => fetcher(API_URL, compose(makeMarkers, makeGeoJson)))
  .setView([0, 0], 0.6);

  const checkScreenSize = () => {
      const screenWidth = document.body.offsetWidth;
      switch (true) {
        case screenWidth >= 600 && screenWidth < 700: {
          mapContainer.map(setStyle('height', '300px'));
          smallMap.setView([25, 0], 1.4);
          break;
        };
        case screenWidth >= 500 && screenWidth < 600: {
          smallMap.setMinZoom(0);
          mapContainer.map(setStyle('height', '250px'));
          smallMap.setView([15, 0], 1);
          break;
        };
        case screenWidth >= 400 && screenWidth < 500: {
          smallMap.setMinZoom(0);
          mapContainer.map(setStyle('height', '220px'));
          smallMap.setView([25, 0], 0.7);
          break;
        };
        default: {
          return
        }
      }
  };
  setListener('load', checkScreenSize, window);
}

Maybe(!mapContainer.isNothing() && isMobile !== '1')
 .map(initBigMap);

 Maybe(!mapContainer.isNothing() && isMobile === '1')
 .map(initSmallMap);

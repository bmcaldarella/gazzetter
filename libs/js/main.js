$(document).ready(function () {
  let map;
  let countryBordersData;
  let borderLayer;
  let clickMarker;
  let poiMarkers = [];

  //icons
  const icons = {
    museum: L.icon({
      iconUrl: 'src/museum.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    airport: L.icon({
      iconUrl: 'src/airport.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    church: L.icon({
      iconUrl: 'src/church.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    stadium: L.icon({
      iconUrl: 'src/stadium.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    hotel: L.icon({
      iconUrl: 'src/hotel.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    default: L.icon({
      iconUrl: 'src/location.gif',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    tower: L.icon({
      iconUrl: 'src/tower.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    monument: L.icon({
      iconUrl: 'src/monument.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    bridge: L.icon({
      iconUrl: 'src/bridge.png', 
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    palace: L.icon({
      iconUrl: 'src/palace.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),
    park: L.icon({
      iconUrl: 'src/park.png',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    }),

  };

  let cityBorderLayer; 

function mostrarLimiteCiudad(cityName) {
  $.getJSON('data/cityBoundaries.geojson', function (data) {
    const cityFeature = data.features.find(
      feature => feature.properties.NAME.toLowerCase() === cityName.toLowerCase()
    );
    console.log("Buscando límite para:", cityName);
    if (cityFeature) {
      if (cityBorderLayer) {
        map.removeLayer(cityBorderLayer);
      }

      cityBorderLayer = L.geoJSON(cityFeature, {
        style: {
          color: '#FF5733',
          weight: 2,
          opacity: 1,
          fillOpacity: 0.1
        }
      }).addTo(map);

      map.fitBounds(cityBorderLayer.getBounds());
    } else {
      console.log('Límite de la ciudad no encontrado: ' + cityName);
    }
  });
}

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition, showError);
  } else {
    alert("Geolocation is not supported by this browser.");
    initMap([-34.6037, -58.3816], false);
  }

  function showPosition(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    initMap([lat, lon], true);
  }

  function showError(error) {
    alert("Error getting location: " + error.message);
    initMap([-34.6037, -58.3816], false);
  }

  function initMap(coords, showCircle) {
    map = L.map('map').setView(coords, 10);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    L.marker(coords).addTo(map)
      .bindPopup("<b>Your current location</b><br>Lat: " + coords[0] + "<br>Lon: " + coords[1])
      .openPopup();

    if (showCircle) {
      L.circle(coords, {
        color: '#4A90E2',
        fillColor: '#4A90E2',
        fillOpacity: 0.25,
        radius: 500
      }).addTo(map);
    }

    map.on('click', function (e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      $.ajax({
        url: `https://secure.geonames.org/findNearbyPlaceNameJSON?lat=${lat}&lng=${lon}&username=bmcaldarella`,
        method: 'GET',
        success: function (response) {
          if (response.geonames && response.geonames.length > 0) {
            const place = response.geonames[0];
            const city = place.name;
            const countryName = place.countryName;
            const countryCode = place.countryCode;

            window.selectedLat = lat;
            window.selectedLon = lon;
            window.selectedCountryCode = countryCode;

            if (clickMarker) {
              map.removeLayer(clickMarker);
            }

            clickMarker = L.marker(e.latlng).addTo(map)
              .bindPopup(`<b>${city}, ${countryName}</b><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
              .openPopup();

            if (countryBordersData) {
              const countryFeature = countryBordersData.features.find(
                f => f.properties.iso_a2 === countryCode
              );

              if (countryFeature) {
                if (borderLayer) borderLayer.remove();

                borderLayer = L.geoJSON(countryFeature, {
                  style: { color: '#4A90E2', weight: 2 }
                }).addTo(map);

                map.fitBounds(borderLayer.getBounds());
              }
            }
                mostrarLimiteCiudad(city);
          } else {
            alert("Error.");
          }
        },
        error: function () {
          alert("Error");
        }
      });
    });
  }

  function mostrarLugaresDeInteres(lat, lon) {
    poiMarkers.forEach(marker => map.removeLayer(marker));
    poiMarkers = [];

    const poiIcon = L.icon({
      iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
      iconSize: [40, 40],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });

    $.ajax({
      url: `https://secure.geonames.org/findNearbyWikipediaJSON?lat=${lat}&lng=${lon}&username=bmcaldarella`,
      method: 'GET',
      success: function (data) {
        if (data.geonames && data.geonames.length > 0) {
          data.geonames.forEach((item) => {
            let icon = icons.default;
            const title = item.title.toLowerCase();

            if (title.includes("museum")) {
              icon = icons.museum;
            } else if (title.includes("airport")) {
              icon = icons.airport;
            } else if (title.includes("church")) {
              icon = icons.church;
            } else if (title.includes("stadium")) {
              icon = icons.stadium;
            } else if (title.includes("hotel")) {
              icon = icons.hotel;
            }

            const marker = L.marker([item.lat, item.lng], { icon }).addTo(map)
              .bindPopup(`<b>${item.title}</b><br>${item.summary}<br><a href="https://${item.wikipediaUrl}" target="_blank">Ver más</a>`);
            poiMarkers.push(marker);
          });

        }
      },
      error: function () {
        console.log(Error);
      }
    });
  }
  $.ajax({
    url: "data/countryBorders.geo.json",
    dataType: "json",
    success: function (data) {
      countryBordersData = data;
      const select = $("#countrySelect");
      const sorted = data.features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
      sorted.forEach(function (feature) {
        const isoCode = feature.properties.iso_a2;
        const name = feature.properties.name;
        select.append(`<option value="${isoCode}">${name}</option>`);
      });
    },
    error: function () {
      alert("Error loading country borders data.");
    }
  });

$("#countrySelect").on("change", function () {
  const selectedISO = $(this).val();
  if (!selectedISO || !countryBordersData) return;

  const selectedFeature = countryBordersData.features.find(
    f => f.properties.iso_a2 === selectedISO
  );
  if (!selectedFeature) {
    alert("Country not found");
    return;
  }

  if (borderLayer) borderLayer.remove();

  borderLayer = L.geoJSON(selectedFeature, {
    style: { color: '#4A90E2', radius: 500 }
  }).addTo(map);

  map.fitBounds(borderLayer.getBounds());

  let lat, lon;

  if (selectedFeature.properties && selectedFeature.properties.capital_latlng) {
    lat = selectedFeature.properties.capital_latlng[1]; // lat
    lon = selectedFeature.properties.capital_latlng[0]; // lon
  } else {
    const center = borderLayer.getBounds().getCenter();
    lat = center.lat;
    lon = center.lng;
  }

  window.selectedLat = lat;
  window.selectedLon = lon;
  window.selectedCountryCode = selectedISO;

  mostrarLugaresDeInteres(lat, lon); // ✅ Solo una llamada aquí

  // ✅ Zoom automático a los marcadores si hay
  setTimeout(() => {
    if (poiMarkers.length > 0) {
      const group = new L.featureGroup(poiMarkers);
      map.fitBounds(group.getBounds());
    }
  }, 1000); // ⚠️ Un pequeño delay ayuda a que se agreguen los markers antes del zoom
});
  $("#weatherBtn").on("click", function () {
    if (!window.selectedLat || !window.selectedLon) {
      alert("Por favor, hacé clic en el mapa primero.");
      return;
    }

    $.ajax({
      url: "libs/php/getWeather.php",
      type: "GET",
      data: {
        lat: window.selectedLat,
        lon: window.selectedLon
      },
      dataType: "json",
      success: function (weatherData) {
        const icon = weatherData.weather[0].icon;
        const description = weatherData.weather[0].description;
        const temp = Math.round(weatherData.main.temp);
        const feelsLike = Math.round(weatherData.main.feels_like);
        const maxTemp = Math.round(weatherData.main.temp_max);
        const minTemp = Math.round(weatherData.main.temp_min);
        const city = weatherData.name;
        const country = weatherData.sys.country;
        let capitalLat = null;
        let capitalLon = null;

        if (country.capitalInfo && Array.isArray(country.capitalInfo.latlng) && country.capitalInfo.latlng.length === 2) {
          capitalLat = country.capitalInfo.latlng[0];
          capitalLon = country.capitalInfo.latlng[1];
        }
        if (capitalLat !== null && capitalLon !== null) {
          if (capitalMarker) {
            map.removeLayer(capitalMarker);
          }

          capitalMarker = L.marker([capitalLat, capitalLon], {
            icon: L.icon({
              iconUrl: 'src/city.png',
              iconSize: [50, 50],
              iconAnchor: [15, 30],
              popupAnchor: [0, -30]
            })
          }).addTo(map).bindPopup(`<strong>Capital:</strong> ${capital}`);
        }


        const html = `
          <div>
            <h5 style="font-size: 30px;">${city}, ${country}</h5>
            <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
            <p style="font-size: 30px;"><strong>${description}</strong></p>
            <p><strong>Temp:</strong>${temp}°C (feels like ${feelsLike}°C)</p>
            <p><strong>Max:</strong> ${maxTemp}°C / Min: ${minTemp}°C</p>
          </div>
        `;

        $('#weather').html(html);
      },
      error: function () {
        alert("No se pudo obtener el clima.");
      }
    });
  });

  $("#nearbyBtn").on("click", function () {
    if (!window.selectedLat || !window.selectedLon) {
      alert("Por favor, hacé clic en el mapa primero.");
      return;
    }

    $.ajax({
      url: 'libs/php/getWikiInfo.php',
      method: 'GET',
      data: {
        lat: window.selectedLat,
        lng: window.selectedLon
      },
      dataType: 'json',
      success: function (data) {
        if (data.geonames && data.geonames.length > 0) {
          let html = '<ul>';
          data.geonames.forEach(item => {
            html += `
              <li style="margin-bottom: 20px;">
                <h5>${item.title}</h5>
                ${item.thumbnailImg ? `<img src="${item.thumbnailImg}" alt="${item.title}" style="max-width:100px;">` : ''}
                <p>${item.summary}</p>
                <a href="https://${item.wikipediaUrl}" target="_blank">Ver más</a>
              </li>`;
          });
          html += '</ul>';
          $('#output').html(html);
        } else {
          $('#output').html('<p>No se encontraron lugares cercanos.</p>');
        }
        const modal = new bootstrap.Modal(document.getElementById('nearbyModal'));
        modal.show();
      },
      error: function () {
        $('#output').html('<p>Error al obtener lugares cercanos.</p>');
        const modal = new bootstrap.Modal(document.getElementById('nearbyModal'));
        modal.show();
      }
    });
  });
  $("#countryInfoBtn").on("click", function () {
    if (!window.selectedCountryCode) {
      alert("Hacé clic en el mapa o seleccioná un país.");
      return;
    }

    $.ajax({
      url: "libs/php/getCountryInfo.php",
      type: "GET",
      data: { code: window.selectedCountryCode },
      dataType: "json",
      success: function (data) {
        const country = data[0];
        const name = country.name.common;
        const capital = country.capital ? country.capital[0] : 'N/A';
        const population = country.population?.toLocaleString() || 'N/A';
        const region = country.region || 'N/A';
        const flag = country.flags?.svg || '';
        const languages = country.languages ? Object.values(country.languages).join(', ') : 'N/A';

        const currencies = country.currencies;
        let currencyCode = 'N/A';
        let currencyName = 'N/A';
        let currencySymbol = '';

        if (currencies) {
          const code = Object.keys(currencies)[0];
          currencyCode = code;
          currencyName = currencies[code].name;
          currencySymbol = currencies[code].symbol || '';
        }

        const html = `
        <div style="padding: 30px; border-radius: 10px;">
          <h3>${name}</h3>
          <img src="${flag}" alt="${name}" style="width:300px; height:200px; object-fit:contain;" />
          <p><strong>Capital:</strong> ${capital}</p>
          <p><strong>Population:</strong> ${population}</p>
          <p><strong>Región:</strong> ${region}</p>
          <p><strong>Languages:</strong> ${languages}</p>
          <p><strong>Currency:</strong> ${currencyName} (${currencyCode}) ${currencySymbol}</p>
          <div id="currencyConversion">
            <label for="amountInput">Convert to USD:</label>
            <input type="number" id="amountInput" class="form-control" placeholder="${currencyCode}" />
            <button id="convertBtn" class="btn btn-primary mt-2">Exchange</button>
            <p id="conversionResult" class="mt-2 text-success"></p>
          </div>
        </div>
      `;

        $('#infoCard').html(html);

        $('#convertBtn').on('click', function () {
          const amount = parseFloat($('#amountInput').val());

          if (isNaN(amount) || amount <= 0) {
            $('#conversionResult');
            return;
          }

          $.ajax({
            url: `libs/php/getExchangeRate.php`,
            method: 'GET',
            data: { currency: currencyCode },
            dataType: "json",
            success: function (rateData) {
              const rateToUSD = 1 / rateData.rate;
              const result = amount * rateToUSD;
              $('#conversionResult').html(`${amount} ${currencyCode} ≈ <strong>${result.toFixed(2)} USD</strong>`);
            },
            error: function () {
              $('#conversionResult').text("Error.");
            }
          });

        });
      },
      error: function () {
        alert("Error.");
      }
    });
  });


});

let detectedCountryCode = null;
let countriesLoaded = false;
let countryBordersData;

function detectUserCountry(lat, lon) {
  $.ajax({
    url: 'libs/php/getCountryCode.php',
    method: 'GET',
    data: { lat: lat, lng: lon },
    dataType: 'json',
    success: function (data) {
      if (data && data.countryCode) {
        detectedCountryCode = data.countryCode;
        console.log("🌍 Detected country:", detectedCountryCode);

        const previous = $('#countrySelect').val();

        if (previous !== detectedCountryCode) {
          $('#countrySelect').val(detectedCountryCode).trigger('change');
        } else {

          $('#countrySelect').trigger('change');
        }
      } else {
        console.warn("Country code not found.");
      }
    },
    error: function () {
      console.warn("Error calling getCountryCode.php");
    }
  });
}

function loadCountriesIntoSelect(callback) {
  $.ajax({
    url: "libs/php/getCountryBorders.php", 
    dataType: "json",
    success: function (data) {
      countriesLoaded = true;
      countryBordersData = data;
      const select = $("#countrySelect");
      select.empty();
      const sorted = data.features.sort((a, b) => a.properties.name.localeCompare(b.properties.name));
      sorted.forEach(function (feature) {
        const isoCode = feature.properties.iso_a2;
        const name = feature.properties.name;
        select.append(`<option value="${isoCode}">${name}</option>`);
      });

      if (typeof callback === "function") callback();
    },
    error: function () {
      alert("Error loading country data.");
    }
  });
}



$(document).ready(function () {
  let map;
  let borderLayer;
  let clickMarker;
  let cityBorderLayer;
  let capitalMarker;
  let poiClusterGroup = L.markerClusterGroup();



  //icons
  const icons = {
    museum: L.icon({
      iconUrl: 'src/museum.png',
      iconSize: [40, 40],
      iconAnchor: [40, 40],
      popupAnchor: [0, -30]
    }),

    village: L.icon({
      iconUrl: 'src/village.svg',
      iconSize: [40, 40],
      iconAnchor: [40, 40],
      popupAnchor: [0, -30]
    }),

    airport: L.icon({
      iconUrl: 'src/airport.png',
      iconSize: [40, 40],
      iconAnchor: [40, 30],
      popupAnchor: [0, -30]
    }),
    church: L.icon({
      iconUrl: 'src/church.png',
      iconSize: [40, 40],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),
    town: L.icon({
      iconUrl: 'src/stadium.png',
      iconSize: [40, 34],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),
    hotel: L.icon({
      iconUrl: 'src/hotel.png',
      iconSize: [40, 40],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),
    default: L.icon({
      iconUrl: 'src/location.gif',
      iconSize: [40, 40],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),
    castle: L.icon({
      iconUrl: 'src/tower.png',
      iconSize: [40, 40],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),
    monument: L.icon({
      iconUrl: 'src/monument.png',
      iconSize: [40, 40],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),
    bridge: L.icon({
      iconUrl: 'src/bridge.png',
      iconSize: [40, 34],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),
    palace: L.icon({
      iconUrl: 'src/palace.png',
      iconSize: [40, 40],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),
    park: L.icon({
      iconUrl: 'src/park.png',
      iconSize: [40, 40],
      iconAnchor: [45, 30],
      popupAnchor: [0, -30]
    }),

  };
  $('#loader').fadeIn(200); 

  loadCountriesIntoSelect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;

          window.selectedLat = lat;
          window.selectedLon = lon;

          detectUserCountry(lat, lon);
          initMap([lat, lon], true); 
          $('#map').fadeIn(300);
          $('#loader').fadeOut(500);
        },
        function (error) {
          console.warn("Geolocation error:", error.message);
          initMap([20, 0], false); 
          $('#map').fadeIn(300);
          $('#loader').fadeOut(500);
        }
      );
    } else {
      initMap([20, 0], false); 
      $('#map').fadeIn(300);
      $('#loader').fadeOut(500);
    }
  });

  // show my current location

  $("#myLocationBtn").on("click", function () {
    if (!map) {
      alert("Map not loaded.");
      return;
    }

    $("#loader").fadeIn(200);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function (position) {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        window.selectedLat = lat;
        window.selectedLon = lon;

        if (!countriesLoaded) {
          loadCountriesIntoSelect(() => {
            setTimeout(() => {
              detectUserCountry(lat, lon);
            }, 200);
          });
        } else {
          detectUserCountry(lat, lon);
        }



        $.ajax({
          url: 'libs/php/getOpenCageInfo.php',
          method: 'GET',
          data: { lat, lon },
          dataType: 'json',
          success: function (data) {
            let cityName = '';
            if (data.results && data.results.length > 0) {
              cityName = data.results[0].components.city ||
                data.results[0].components.town ||
                data.results[0].components.village ||
                data.results[0].components.county ||
                'Unknown location';
            }

            map.flyTo([lat, lon], 13, {
              animate: true,
              duration: 1.5
            });

            map.addLayer(poiClusterGroup);

            if (window.locationMarker) map.removeLayer(window.locationMarker);
            if (window.locationCircle) map.removeLayer(window.locationCircle);

            window.locationMarker = L.marker([lat, lon])
              .bindPopup(`<b>${cityName}</b><br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`)
              .openPopup()
              .addTo(map);

            window.locationCircle = L.circle([lat, lon], {
              color: '#4A90E2',
              fillColor: '#4A90E2',
              fillOpacity: 0.3,
              radius: 600
            }).addTo(map);

            $("#loader").fadeOut(500);
          },
          error: function () {
            console.warn("❌ Error.");
            $("#loader").fadeOut(500);
          }
        });

      }, function (error) {
        alert("Error: " + error.message);
        $("#loader").fadeOut(500);
      });

    } else {
      alert("Location not supported.");
      $("#loader").fadeOut(500);
    }
  });


  function mostrarLimiteCiudad(cityName) {
    $.getJSON('data/cityBoundaries.geojson', function (data) {
      const cityFeature = data.features.find(
        feature => feature.properties.NAME.toLowerCase() === cityName.toLowerCase()
      );
      console.log("Looking limit", cityName);
      if (cityFeature) {
        if (cityBorderLayer) {
          map.removeLayer(cityBorderLayer);
        }

        cityBorderLayer = L.geoJSON(cityFeature, {
          style: {
            color: '#FF5733',
            weight: 4,
            opacity: 1,
            fillOpacity: 0.1
          }
        }).addTo(map);

        map.fitBounds(cityBorderLayer.getBounds());
      } else {
        console.log('Limit not found: ' + cityName);
      }
    });
  }



  function initMap(coords, showCircle) {
    map = L.map('map').setView(coords, 1.5);
    const ligthMode = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 13,
      attribution: ''
    });

    const darkMode = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 12,
      attribution: '&copy; OpenStreetMap &copy; CARTO'
    });

    ligthMode.addTo(map); 

    const baseMaps = {
      "🌞 Light": ligthMode,
      "🌑 Dark": darkMode
    };

    const overlayMaps = {
      "📍 Important places": poiClusterGroup
    };

    L.control.layers(baseMaps, overlayMaps, { position: 'topright' }).addTo(map);



    if (showCircle) {
      L.marker(coords).addTo(map)
        .bindPopup("<b>Your current location</b><br>Lat: " + coords[0] + "<br>Lon: " + coords[1])
        .openPopup();
    }

    map.on('click', function (e) {
      const lat = e.latlng.lat;
      const lon = e.latlng.lng;

      window.selectedLat = lat;
      window.selectedLon = lon;

      $.ajax({
        url: 'libs/php/getNearbyPlace.php',
        method: 'GET',
        data: {
          lat: lat,
          lon: lon
        },
        success: function (response) {
          if (response.geonames && response.geonames.length > 0) {
            const place = response.geonames[0];
            const city = place.name || place.adminName1 || place.adminName2 || place.toponymName || 'Unknown City';

            const countryName = place.countryName;
            const countryCode = place.countryCode;

            window.selectedCountryCode = countryCode;

            if (clickMarker) map.removeLayer(clickMarker);

            const latLng = L.latLng(lat, lon);

            clickMarker = L.marker(latLng).addTo(map)
              .bindPopup(`<b>${city}, ${countryName}</b><br>Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}`)
              .openPopup();

            // show borders countries
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

            $('#countrySelect').val(countryCode);

           console.log("🧭 City:", city);
           if (city) {
  mostrarLimiteCiudad(city);
  if (countryName) {
  mostrarLugaresWikipedia(countryName);
}


} else {
  console.warn("No city name available, skipping city boundary display.");
}

          } else {
            alert("No nearby places found.");
          }
        },
        error: function () {
          alert("Error contacting backend.");
        }
      });
    });


  }

  function mostrarLugaresWikipedia(countryName) {
    poiClusterGroup.clearLayers();
    $.ajax({
      url: 'libs/php/getWikipediaSearch.php',
      method: 'GET',
      data: { country: countryName },
      dataType: 'json', success: function (response) {
        const searchResults = response.query.search.slice(0, 50);
        searchResults.forEach(result => {
          const title = result.title;
          console.log("🔍 Looking for:", countryName);

          $.ajax({
            url: 'libs/php/getWikiInfo.php',
            data: {
              title: title,
            },
            success: function (data) {
              const pages = data.query.pages;
              for (let pageId in pages) {
                const page = pages[pageId];
                if (page.coordinates) {
                  const lat = page.coordinates[0].lat;
                  const lon = page.coordinates[0].lon;
                  const description = page.extract || "";
                  const image = page.thumbnail?.source;
                  const url = `https://en.wikipedia.org/?curid=${pageId}`;

                  let icon = icons.default;
                  const lowerTitle = title.toLowerCase();

                  if (lowerTitle.includes("museum")) icon = icons.museum;
                  else if (lowerTitle.includes("airport")) icon = icons.airport;
                  else if (lowerTitle.includes("church") || lowerTitle.includes("cathedral")) icon = icons.church;
                  else if (lowerTitle.includes("castle")) icon = icons.castle;
                  else if (lowerTitle.includes("monument")) icon = icons.monument;
                  else if (lowerTitle.includes("bridge")) icon = icons.bridge;
                  else if (lowerTitle.includes("palace")) icon = icons.palace;
                  else if (lowerTitle.includes("park")) icon = icons.park;
                  else if (lowerTitle.includes("hotel")) icon = icons.hotel;
                  else if (lowerTitle.includes("stadium")) icon = icons.town;

                  const popupContent = `
                  <div style="max-width:100px;  height:20; font-family: Arial, sans-serif;">
                    <h5 style="margin-bottom: 5px; font-size: 12px;">${title}</h5>
                    ${image ? `<img src="${image}" style="width: 100%; border-radius: 5px; margin-bottom: 5px;" />` : ""}
                    <p style="font-size: 13px; margin-bottom: 8px; line-height: 1.3;">${description.substring(0, 100)}...</p>
                    <a href="${url}" target="_blank" style="color: #007bff; text-decoration: underline; font-weight: bold;">Read more</a>
                  </div>
                `;

                  const marker = L.marker([lat, lon], { icon }).bindPopup(popupContent);
                  poiClusterGroup.addLayer(marker);
                }
              }
              map.addLayer(poiClusterGroup);
            },
            error: function () {
              console.warn("❌ Error fetching coordinates for", title);
            }
          });
        });
      },
      error: function () {
        alert("❌ Error fetching Wikipedia landmarks.");
      }
    });
  }

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
      style: { color: '#4A90E2', radius: 800 }
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

    map.panTo([lat, lon], {
      animate: true,
      duration: 1.5
    });


    if (capitalMarker) {
      map.removeLayer(capitalMarker);
    }

    const capitalName = selectedFeature.properties.capital || 'Capital';

    capitalMarker = L.marker([lat, lon], {
      icon: L.icon({
        iconUrl: 'src/city.svg',
        iconSize: [40, 40],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
      })
    }).addTo(map).bindPopup(`<strong>${capitalName}</strong><br>Lat: ${lat.toFixed(4)}<br>Lon: ${lon.toFixed(4)}`);

    mostrarLugaresWikipedia(selectedFeature.properties.name);

    setTimeout(() => {
      if (poiClusterGroup.getLayers().length > 0) {
      const group = new L.featureGroup(poiClusterGroup.getLayers());
      const bounds = group.getBounds();
        map.fitBounds(bounds, {
      maxZoom: 7,
      padding: [50, 50] 
    });
      }
    }, 1000);
  });


  $("#currencyBtn").on("click", function () {
    if (!window.selectedCountryCode) {
      alert("Select a country first.");
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
        const currencies = country.currencies;

        if (!currencies) {
          $('#currencyInfo').text("No currency info available.");
          return;
        }

        const code = Object.keys(currencies)[0];
        const currencyName = currencies[code].name;
        const symbol = currencies[code].symbol || '';

        $('#currencyInfo').html(`<p><strong>${currencyName} (${code})</strong> ${symbol}</p>`);
        $('#currencyConversion').show();

        $('#convertBtn').off('click').on('click', function () {
          const amount = parseFloat($('#amountInput').val());
          if (isNaN(amount) || amount <= 0) {
            $('#conversionResult').text("Enter a valid amount.");
            return;
          }

          $.ajax({
            url: `libs/php/getExchangeRate.php`,
            method: 'GET',
            data: { currency: code },
            dataType: "json",
            success: function (rateData) {
              const rateToUSD = 1 / rateData.rate;
              const result = amount * rateToUSD;
              $('#conversionResult').html(`${amount} ${code} ≈ <strong>${result.toFixed(2)} USD</strong>`);
            },
            error: function () {
              $('#conversionResult').text("Error loading exchange rate.");
            }
          });
        });

        const modal = new bootstrap.Modal(document.getElementById('currencyModal'));
        modal.show();
      },
      error: function () {
        alert("Error loading country info.");
      }
    });
  });

  //wiki InfoCountry Btn

  $("#wikiBtn").on("click", function () {
    if (!window.selectedCountryCode) {
      alert("Please select a country first.");
      return;
    }

    const countryName = $("#countrySelect option:selected").text();

    $("#wikiContent").html("Loading...");

    $.ajax({
      url: "libs/php/getWikiSummary.php",
      type: "GET",
      data: { country: countryName },
      dataType: "json",
      success: function (data) {
        const title = data.title || countryName;
        const description = data.extract || "No summary available.";
        const image = data.thumbnail?.source;
        const link = data.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${countryName}`;

        let html = `
        <h5>${title}</h5>
        ${image ? `<img src="${image}" class="img-fluid mb-3" alt="${title}" />` : ''}
        <p>${description}</p>
        <a href="${link}" target="_blank" class="btn btn-info mt-2">Read more on Wikipedia</a>
      `;

        $("#wikiContent").html(html);
      },
      error: function () {
        $("#wikiContent").html("<p class='text-danger'>Failed to load summary.</p>");
      }
    });
  });

  //wiki news

  $("#newsBtn").on("click", function () {
    if (!window.selectedCountryCode) {
      alert("Please select a country first.");
      return;
    }
    const countryName = $("#countrySelect option:selected").text();
    $("#newsContent").html("Loading news...");
    $.ajax({
      url: "libs/php/getCountryNews.php",
      type: "GET",
      data: { country: countryName },
      dataType: "json",
      success: function (data) {
        console.log("📰 News data received:", data);
        if (!data.articles || data.articles.length === 0) {
          $("#newsContent").html("<p>No news articles found.</p>");
          return;
        }
        let html = '<ul class="list-unstyled">';
        data.articles.forEach(article => {
          html += `
          <li class="mb-3">
            <h6>${article.title}</h6>
            ${article.image ? `<img src="${article.image}" class="img-fluid mb-2" alt="news">` : ""}
            <p>${article.description || ""}</p>
            <a href="${article.url}" target="_blank" class="btn btn-sm btn-outline-info">Read more</a>
          </li>
        `;
        });
        html += '</ul>';

        $("#newsContent").html(html);
      },
      error: function () {
        $("#newsContent").html("<p class='text-danger'>Failed to load news.</p>");
      }
    });
  });


  $("#weatherBtn").on("click", function (e) {
    if (!window.selectedLat || !window.selectedLon) {
      e.preventDefault();
      alert("Select a location first.");



      return;
    }

    // Get current weather
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

        const html = `
        <div class="text-center mb-3">
          <h5>${city}, ${country}</h5>
          <img src="https://openweathermap.org/img/wn/${icon}@2x.png" alt="${description}" />
          <p><strong>${description}</strong></p>
          <p>Temp: ${temp}°C (feels like ${feelsLike}°C)</p>
          <p>Max: ${maxTemp}°C / Min: ${minTemp}°C</p>
        </div>
      `;
        $('#weather').html(html);
        const modal = new bootstrap.Modal(document.getElementById('weatherModal'));
        modal.show();

      },
      error: function () {
        $('#weather').html("<p>Error loading current weather.</p>");
      }
    });

    // Get forecast
    $.ajax({
      url: "libs/php/getForecast.php",
      type: "GET",
      data: {
        lat: window.selectedLat,
        lon: window.selectedLon
      },
      dataType: "json",
      success: function (forecastData) {
        const list = forecastData.list;
        let forecastHTML = "";


        for (let i = 0; i < list.length; i += 8) {
          const f = list[i];
          const date = new Date(f.dt * 1000);
          const day = date.toLocaleDateString();
          const icon = f.weather[0].icon;
          const desc = f.weather[0].description;
          const temp = Math.round(f.main.temp);

          forecastHTML += `
          <div class="mb-2 p-2 border border-secondary rounded">
            <strong>${day}</strong><br>
            <img src="https://openweathermap.org/img/wn/${icon}.png" alt="${desc}" />
            ${desc}, ${temp}°C
          </div>
        `;
        }

        $('#forecastBody').html(forecastHTML);
      },
      error: function () {
        $('#forecastBody').html("<p>Error loading forecast.</p>");
      }
    });
  });

  $("#nearbyBtn").on("click", function () {
    if (!window.selectedLat || !window.selectedLon) {
      alert("Select a location firts.");
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

          const modal = new bootstrap.Modal(document.getElementById('nearbyModal'));
          modal.show();
        } else {
          alert("No nearby data found.");
        }
      },
      error: function () {
        $('#output').html('<p>Error loading nearby places.</p>');
      }
    });
  });
  $("#countryInfoBtn").on("click", function () {
    if (!window.selectedCountryCode) {
      alert("Select a country firts.");
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

        const html = `
        <div style="padding: 30px; border-radius: 10px;">
          <h3>${name}</h3>
          <img src="${flag}" alt="${name}" style="max-width: 100%; height: auto; display: block; margin: 0 auto; object-fit: contain;" />
          <p><strong>Capital:</strong> ${capital}</p>
          <p><strong>Population:</strong> ${population}</p>
          <p><strong>Region:</strong> ${region}</p>
          <p><strong>Languages:</strong> ${languages}</p>
        </div>
      `;

        $('#infoCard').html(html);
        const modal = new bootstrap.Modal(document.getElementById('exampleModalCenter'));
        modal.show();


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


  //loader

  function getInitialLocation() {
    $('#loader').fadeIn(200);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const coords = [position.coords.latitude, position.coords.longitude];

          initMap(coords);

          $('#loader').fadeOut(500);
          $('#map').show();
        },
        function (error) {
          console.warn("Geolocation denied or failed:", error.message);

          initMap([0, 0]);

          $('#loader').fadeOut(500);
          $('#map').show();
        }
      );
    } else {
      console.log("Geolocation not supported");
      initMap([0, 0]);
      $('#loader').fadeOut(200);
      $('#map').show();
    }
  }




});



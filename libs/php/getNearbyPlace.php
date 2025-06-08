<?php
header('Content-Type: application/json');

// Verifica si llegan lat y lon
if (!isset($_GET['lat']) || !isset($_GET['lon'])) {
  echo json_encode(["error" => "Missing coordinates"]);
  exit;
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$username = 'bmcaldarella'; // Tu nombre de usuario de GeoNames

$url = "http://api.geonames.org/findNearbyPlaceNameJSON?lat=$lat&lng=$lon&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);

if (curl_errno($ch)) {
  echo json_encode(["error" => curl_error($ch)]);
  curl_close($ch);
  exit;
}

curl_close($ch);

// Muestra el resultado en bruto
echo $response;

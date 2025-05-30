<?php
if (!isset($_GET['lat']) || !isset($_GET['lon'])) {
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$username = 'bmcaldarella'; // tu nombre de usuario de GeoNames

$url = "https://secure.geonames.org/countryCodeJSON?lat=$lat&lng=$lon&username=$username";

$response = file_get_contents($url);
if ($response === FALSE) {
    echo json_encode(['error' => 'Error calling GeoNames API']);
    exit;
}

echo $response;
?>

<?php

if (!isset($_GET['lat']) || !isset($_GET['lng'])) {
    echo json_encode(['error' => 'Missing parameters']);
    exit;
}

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$username = 'bmcaldarella';

$url = "https://secure.geonames.org/countryCodeJSON?lat=$lat&lng=$lng&username=$username";

$response = file_get_contents($url);
if ($response === FALSE) {
    echo json_encode(['error' => 'Error calling GeoNames API']);
    exit;
}

header('Content-Type: application/json');
echo $response;
?>

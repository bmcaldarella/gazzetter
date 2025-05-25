<?php
header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['lat']) || !isset($_GET['lng'])) {
    http_response_code(400);
    echo json_encode(["error" => "Lat and Lng are required"]);
    exit;
}

$lat = $_GET['lat'];
$lng = $_GET['lng'];
$username = 'bmcaldarella'; 

$url = "http://api.geonames.org/findNearbyWikipediaJSON?lat=$lat&lng=$lng&radius=20&maxRows=30&username=$username";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$result = curl_exec($ch);
curl_close($ch);

echo $result;
?>

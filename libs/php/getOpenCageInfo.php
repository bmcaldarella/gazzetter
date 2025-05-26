<?php
if (!isset($_GET['lat']) || !isset($_GET['lon'])) {
  echo json_encode(['error' => 'Missing coordinates']);
  exit;
}

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$apiKey = '12f29244a845415c8d9e168f222b1a0f'; 

$url = "https://api.opencagedata.com/geocode/v1/json?q=$lat+$lon&key=$apiKey&language=en&pretty=1";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

echo $response;
?>
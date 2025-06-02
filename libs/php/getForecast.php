<?php
header("Content-Type: application/json");

$lat = $_GET['lat'];
$lon = $_GET['lon'];
$apiKey = "b397906a637ac06a44200e129be15dd4"; 

$url = "https://api.openweathermap.org/data/2.5/forecast?lat={$lat}&lon={$lon}&units=metric&appid={$apiKey}";

$curl = curl_init();
curl_setopt($curl, CURLOPT_URL, $url);
curl_setopt($curl, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($curl);
curl_close($curl);

echo $response;
?>


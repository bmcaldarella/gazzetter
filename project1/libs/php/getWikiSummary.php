<?php
header("Content-Type: application/json");

if (!isset($_GET['country'])) {
    http_response_code(400);
    echo json_encode(["error" => "Country parameter is required"]);
    exit;
}

$country = urlencode($_GET['country']);
$url = "https://en.wikipedia.org/api/rest_v1/page/summary/$country";


$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode !== 200 || !$response) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch Wikipedia data"]);
    exit;
}

echo $response;

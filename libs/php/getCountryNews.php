<?php
header("Content-Type: application/json");

if (!isset($_GET['country'])) {
    http_response_code(400);
    echo json_encode(["error" => "Country parameter is required"]);
    exit;
}

$country = urlencode($_GET['country']);
$apiKey = trim("45c51fb957682b4347536c30f85a04d8"); 

$url = "https://gnews.io/api/v4/search?q=$country&lang=en&max=10&apikey=$apiKey";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(["error" => "cURL error: $curlError"]);
    exit;
}

if ($httpcode !== 200 || !$response) {
    http_response_code(500);
    echo json_encode([
        "error" => "Failed to fetch news",
        "http_code" => $httpcode,
        "response" => $response
    ]);
    exit;
}

echo $response;

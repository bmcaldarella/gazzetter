<?php
header("Content-Type: application/json");

if (!isset($_GET['country'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing country"]);
    exit;
}

$country = urlencode($_GET['country']);
$url = "https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=top+attractions+in+{$country}&format=json&origin=*&srlimit=100";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || $response === false) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch Wikipedia search"]);
    exit;
}

echo $response;



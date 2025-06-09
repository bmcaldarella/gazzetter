<?php
header("Content-Type: application/json");

if (!isset($_GET['title'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing title"]);
    exit;
}

$title = urlencode($_GET['title']);

$url = "https://en.wikipedia.org/w/api.php?action=query&prop=coordinates|extracts|pageimages&format=json&exintro=true&titles={$title}&origin=*&pithumbsize=200";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || $response === false) {
    http_response_code(500);
    echo json_encode(["error" => "Failed to fetch Wiki info"]);
    exit;
}

echo $response;

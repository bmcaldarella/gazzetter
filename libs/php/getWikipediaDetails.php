<?php
header('Content-Type: application/json; charset=utf-8');

if (!isset($_GET['title'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Missing title']);
    exit;
}

$title = urlencode($_GET['title']);

$url = "https://en.wikipedia.org/w/api.php?action=query&titles=$title&prop=coordinates|pageimages|extracts&format=json&exintro=1&explaintext=1&piprop=thumbnail&pithumbsize=100&origin=*";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || $response === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Wikipedia detail fetch failed']);
    exit;
}

echo $response;

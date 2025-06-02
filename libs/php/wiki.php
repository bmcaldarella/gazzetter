<?php

header('Content-Type: application/json');

$countryName = isset($_GET['country']) ? $_GET['country'] : '';

if (!$countryName) {
    echo json_encode(['error' => 'No country provided']);
    exit;
}

$url = 'https://en.wikipedia.org/w/api.php';
$params = [
    'action' => 'query',
    'list' => 'search',
    'srsearch' => "landmarks in $countryName",
    'format' => 'json',
    'origin' => '*'
];

$ch = curl_init();

curl_setopt($ch, CURLOPT_URL, $url . '?' . http_build_query($params));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);

if (curl_errno($ch)) {
    echo json_encode(['error' => curl_error($ch)]);
} else {
    echo $response;
}

curl_close($ch);

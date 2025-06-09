<?php
header("Content-Type: application/json");

if (!isset($_GET['currency'])) {
    http_response_code(400);
    echo json_encode(["error" => "Currency code is required"]);
    exit;
}

$currency = strtoupper($_GET['currency']);
$app_id = "9843ea12180e42319f2578f2c44157a0"; 

$url = "https://openexchangerates.org/api/latest.json?app_id={$app_id}";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$response = curl_exec($ch);
curl_close($ch);

$data = json_decode($response, true);

if (!isset($data['rates'][$currency])) {
    http_response_code(404);
    echo json_encode(["error" => "Rate not found"]);
    exit;
}

$rate = $data['rates'][$currency];
echo json_encode(["rate" => $rate]);

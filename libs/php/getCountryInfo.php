<?php
if (!isset($_GET['code'])){
    http_response_code(400);
    echo json_encode(array("error" => "Country code is required"));
    exit();
}
$code = $_GET['code'];
$url= "https://restcountries.com/v3.1/alpha/".urlencode($code);

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

$response = curl_exec($ch);
curl_close($ch);

header("Content-Type: application/json");
echo $response;
?>
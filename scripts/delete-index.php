<?php
// Delete old index and redirect to new site
@unlink(__DIR__ . '/index.html');
@unlink(__DIR__ . '/extract.php');
header('Location: /');
exit;

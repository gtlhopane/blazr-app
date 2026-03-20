<?php
// Blazr deploy extractor script
// Access via: https://wholesale.blazr.africa/extract.php
// Then delete this file after use!

$tarfile = __DIR__ . '/../blazr-full.tar.gz';
$dest = __DIR__ . '/';

header('Content-Type: text/plain');

if (!file_exists($tarfile)) {
    echo "ERROR: Tar file not found: $tarfile\n";
    exit(1);
}

echo "Extracting $tarfile to $dest...\n";

$result = shell_exec("tar -xzf " . escapeshellarg($tarfile) . " -C " . escapeshellarg($dest) . " 2>&1");

if ($result === null) {
    echo "Extraction failed or returned no output.\n";
} else {
    echo "Extraction output: $result\n";
}

// List some files to confirm
$files = scandir($dest);
$htmlFiles = array_filter($files, function($f) { return strpos($f, '.html') !== false || strpos($f, '_next') !== false || strpos($f, 'next') !== false; });
echo "\nFiles in destination:\n";
foreach (array_slice($htmlFiles, 0, 20) as $f) {
    echo "  $f\n";
}
echo "\nDone!\n";

// Clean up tarball
@unlink($tarfile);
echo "Tarball deleted.\n";

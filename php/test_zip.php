<?PHP

require_once __DIR__ . '/vendor/autoload.php';

$zipFile = new \PhpZip\ZipFile();
$zip=$zipFile->openFile("zips/files.zip");
$nb=$zip->count();
print ("$nb fichiers <br>");

$entries=$zip->getEntries();
foreach ($entries as $clef => $valeur) {
	$size=$valeur->getUncompressedSize();
	print ("$clef : $size octets <br>\n");
}



?>
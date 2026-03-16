<?php
include_once ("util.php");
include_once ("init.php");
include_once ("lang.php");
header("Content-Type: text/csv");
$limite=50000000000; // pour faire des tests
$modulo=1; // défaut 1

$nom_rep2=$_REQUEST["nom_rep"];
$nom_rep="../".$nom_rep2;


$liste_rep=scandir($nom_rep);


print ("IMG;cat\n"); // en tête

// 1) on récupère les sous répertoires qui seront aussi les catégories
$idx=0;
foreach ($liste_rep as $rep) {
	if ($rep == "." OR $rep == "..") {
		continue;
	}
	if (is_dir ("$nom_rep/$rep")) {
		//array_push($liste_rep2, $rep);
		$liste_files=scandir("$nom_rep/$rep");
		foreach ($liste_files as $file) {
			if ($file == "." OR $file == "..") {
				continue;
			}
			if (is_file("$nom_rep/$rep/$file")) {
				$idx++;
				if ($idx % $modulo === 0) {
					//print ($GLOBALS["conf"]["toolkait_racine"]."$nom_rep2/$rep/$file;$rep\n");
					print ("$nom_rep2/$rep/$file;$rep\n");
				}
				if ($idx >= $limite) {
					die ("");
				}
				
			}
			
		}
	}
}











?>
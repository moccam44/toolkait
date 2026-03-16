<?PHP

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function verifie_extension ($extension, $liste) {
    $extension=strtolower($extension);
    foreach ($liste as $verif) {
        if ($extension == $verif) {
            return(true);
        }
    }

    return (false);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function ddbl_file ($rep, $nom) {
    if ($nom == "") {
        return (false);
    }
    $chemin=$rep.$nom;
    return (file_exists($chemin));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function DirSize($path , $recursive=TRUE){
    $result = 0;
    if(!is_dir($path) || !is_readable($path)) {
        return 0;
    }
    $fd = dir($path);
    while($file = $fd->read()){
        if(($file != ".") && ($file != "..")){
            if(@is_dir("$path$file/") && $recursive===true) {
                $result += DirSize("$path$file/");
            } else  {
                $result += filesize("$path$file");
            }
        }
    }
    $fd->close();
    return $result;
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function get_size_user ($dirs) {
    $taille=0;
    foreach ($dirs as $dir) {
        $taille+=DirSize($dir, true);
    }
    return ($taille);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//$elements=explode(".", $nom_fichier);
//$extension=$elements[count($elements)-1];
function verif_zip ($chemin) {
    $retour=array();
    $retour["succes"]=true;
    $retour["erreur"]="";
    $retour["size"]=0;
    $zipFile = new \PhpZip\ZipFile();
    try {
        $zip=$zipFile->openFile($chemin);
        $entries=$zip->getEntries();
        foreach ($entries as $clef => $valeur) {
        	$retour["size"]+=$valeur->getUncompressedSize();
            // verif structure
        	$segments=explode("/", $clef);
        	if (count($segments) != 2) {
        	    $retour["succes"]=false;
                $retour["erreur"]="la structure de l'archive n'est pas conforme : ".count($segments)." segments trouvés dans $clef contre 2 attendus";
                return ($retour);
        	}
            // verif extensions
            $last=$segments[count($segments)-1];
            if ($last != "") {
                $elements=explode(".", $last);
                $extension=$elements[count($elements)-1];
                if (verifie_extension($extension, $GLOBALS["conf"]["extensions_autorisees_img"]) === false) {
                    $retour["succes"]=false;
                    $retour["erreur"]=get_intitule("alert_extension_forbidden", array("%extension"=>$extension));
                    return ($retour);
                }
            }
        }
        return ($retour);


    } catch (Exception $e) {
        $retour["succes"]=false;
        $retour["erreur"]=$e->getMessage();
        return ($retour);
    }

}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// supprime de manière récursive un fichier ou un  répertoire
function delete_elem ($chemin) {
    $test="OK";
    if (is_dir($chemin)) {
        $liste=scandir($chemin);
        if ($liste === false) {
            return ("impossible de lister le contenu de $chemin");
        }
        foreach ($liste as $elem) {
            if ($elem == "." OR $elem == "..") {
                // on ne fait rien
            } else {
                $chemin2=$chemin."/".$elem;
                $test=delete_elem($chemin2);
                if ($test !== "OK") {
                    return ($test);
                }
            }
        }

        $test=rmdir($chemin);
        if ($test === false) {
            return ("impossible de supprimer le répertoire $chemin");
        }

    } else {
        $test=unlink($chemin);
        if ($test === false) {
            return ("impossible de supprimer le fichier $chemin");
        }
    }
    return ("OK");
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Sécurise des arguments pour inclure dans une requête SQL
// tient compte du paramètre 'magic_quotes' du PHP.INI
// Récursif pour les array
function secure_sql ($asecuriser) {
	if (is_array($asecuriser)) {
	  	$retour=array();
	  	foreach ($asecuriser as $idx=>$valeur) {
		    $retour[$idx]=secure_sql($valeur);
		}
		return($retour);
	}

	// Si ce n'est pas une array...
	// Si magic_quotes = ON, on enl�ves les slashes
	if (get_magic_quotes_gpc()==1) {
	  	$asecuriser=stripslashes($asecuriser);
	}

    $asecuriser=$GLOBALS["mysqli"]->real_escape_string($asecuriser);

	return($asecuriser);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// envoi de mail
function envoie_mail ($to, $sujet, $message) {
    $headers=array(
        "MIME-Version"=>"1.0",
        "Content-type"=>"text/html; charset=utf-8",
        "From"=>$GLOBALS["conf"]["mail_from"],
        "Reply-To"=>$GLOBALS["conf"]["mail_from"],
    );
     $headers[] = 'MIME-Version: 1.0';
     $headers[] = 'Content-type: text/html; charset=iso-8859-1';
     $addition="-f ".$GLOBALS["conf"]["mail_from"];

     // Envoi
     $tmp=mail($to, $sujet, $message, $headers, $addition);
     return($tmp);

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// get_intitule
function get_intitule ($code, $variables=array()) {
    $lang=$_SESSION["lang"];
    $intitule=$GLOBALS["intitules"][$code][$lang];

    if ($intitule == "") {
        $intitule=$GLOBALS["intitules"][$code][$GLOBALS["conf"]["default_lang"]];
    }
    if ($intitule == "") {
        $intitule=$code;
    }

    foreach ($variables as $clef => $valeur) {
        $intitule=str_ireplace($clef, $valeur, $intitule);
    }

    return ($intitule);

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// print_intitule
function print_intitule ($code, $variables=array()) {
    $intitule=get_intitule($code, $variables);
    print ($intitule);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// print_liste
function print_liste ($nom_liste, $selected, $options=array()) {
    $lang=$_SESSION["lang"];
    $liste=$GLOBALS["listes"][$nom_liste];
    $html="";
    foreach ($liste as $code => $valeurs) {
        $val=$valeurs[$lang];
        if ($val == "") {
            $val=$valeurs[$GLOBALS["conf"]["default_lang"]];
        }
        if ($val == "") {
            $val=$code;
        }
        $html_selected="";
        if ($code === $selected) {
            $html_selected=" selected ";
        }
        $html.="<option value='$code' $html_selected >$val</option>";
    }
    print ($html);

}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// print_language
function print_language() {
    if ($_SESSION["lang"] != "") {
        print ($_SESSION["lang"]);
    } else {
        print($GLOBALS["conf"]["default_lang"]);
    }
}




?>
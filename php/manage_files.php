<?PHP

// TODO
// Vérifier les fichiers pour empêchér d'écrire en dehors du répertoire (pas de ../)
// Vérifier la taille limite du rep

include_once ("util.php");
include_once ("init.php");
include_once ("lang.php");

// seuls les utilisateurs authentifiés peuvent utiliser les fichiers
if ($_SESSION["user"]["ID"]=="") {
    die ("CONNEXION");
}
//print("manage_files \n");
//print_r($_FILES);

$action=$_REQUEST["action"];
$commentaire=$_REQUEST["commentaire"];
$nom=$_REQUEST["nom"];
$nouv_nom=$_REQUEST["nouv_nom"];
$type=$_REQUEST["type"];
$commentaire=$_REQUEST["commentaire"];
$dir_data=$GLOBALS["conf"]["dir_data"].$_SESSION["user"]["dir"]."/";
$dir_model=$GLOBALS["conf"]["dir_model"].$_SESSION["user"]["dir"]."/";
$dir_model_url=$GLOBALS["conf"]["dir_model_url"].$_SESSION["user"]["dir"]."/";
$dirs_user=array($dir_data, $dir_model);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// upload_data
if ($action == "upload_data") {
    $nom_fichier=$_FILES["fichier"]["name"];
    $elements=explode(".", $nom_fichier);
    $extension=$elements[count($elements)-1];
    // verif extension
    if (verifie_extension($extension, $GLOBALS["conf"]["extensions_autorisees_data"]) === false) {
        die (get_intitule("alert_extension_forbidden", array("%extension"=>$extension)));
    }
    // si zip
    if (strtolower($extension) === "zip") {
        $test=verif_zip($_FILES["fichier"]["tmp_name"]);
        if ($test["succes"]===false) {
            die ($test["erreur"]);
        }
        $taille_fichier=$test["size"];
    } else {
        $taille_fichier=filesize($_FILES["fichier"]["tmp_name"]);
    }

    // verif taille
    $taille=get_size_user($dirs_user);
    if ($taille_fichier+$taille > $GLOBALS["conf"]["max_size_user"]) {
        die (get_intitule("alert_size_excessed", array("%size"=>$taille_fichier+$taille, "%max_size"=>$GLOBALS["conf"]["max_size_user"])));
    }
    if (strtolower($extension) === "zip") {

        delete_elem ($dir_data."/".$_FILES["fichier"]["name"]);
        mkdir($dir_data."/".$_FILES["fichier"]["name"], 0777);
        try {
            $zipFile = new \PhpZip\ZipFile();
            $zip=$zipFile->openFile($_FILES["fichier"]["tmp_name"]);
            $zip->extractTo($dir_data."/".$_FILES["fichier"]["name"]);
        } catch (Exception $e) {
            die ($e->getMessage());
        }

    } else {
        move_uploaded_file($_FILES["fichier"]["tmp_name"], $dir_data."/".$_FILES["fichier"]["name"]) OR die (get_intitule("alert_impossible_move_file", array("%from"=>$_FILES["fichier"]["tmp_name"], "to"=>$dir_data.$name."/".$_FILES["fichier"]["name"])));
    }
    print ("OK");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// upload_model
} elseif ($action == "upload_model") {

    // si pas de nom
    $nom_fichier=$_REQUEST["nom_fichier"];
    if ($nom_fichier == "") {
        die (get_intitule("alert_model_name_mandatory"));
    }
    // si pas de fichier json
    if ($_FILES["fichier_json"]["tmp_name"] == "") {
        die (get_intitule("alert_json_file_mandatory"));
    }
    // si taille dépassée
    $taille_json=filesize($_FILES["fichier_json"]["tmp_name"]);
    $taille_bin=0;
    if ($_FILES["fichier_weights"]["tmp_name"] != "") {
        $taille_bin=filesize($_FILES["fichier_weights"]["tmp_name"]);
    }
    $taille=get_size_user($dirs_user);
    if ($taille_json+$taille_bin+$taille > $GLOBALS["conf"]["max_size_user"]) {
        die (get_intitule("alert_size_excessed", array("%size"=>$taille_json+$taille_bin+$taille, "%max_size"=>$GLOBALS["conf"]["max_size_user"])));
    }

    // si nécessaire on crée le répertoire
    if (ddbl_file($dir_model, $nom_fichier) === false) {
        mkdir($dir_model.$nom_fichier);
    }

    move_uploaded_file($_FILES["fichier_json"]["tmp_name"], $dir_model.$nom_fichier."/model.json") OR die (get_intitule("alert_impossible_move_file", array("%from"=>$_FILES["fichier_json"]["tmp_name"], "to"=>$dir_model.$nom_fichier."/model.json")));
    if ($_FILES["fichier_weights"]["tmp_name"] != "") {
        move_uploaded_file($_FILES["fichier_weights"]["tmp_name"], $dir_model.$nom_fichier."/model.weights.bin") OR die (get_intitule("alert_impossible_move_file", array("%from"=>$_FILES["fichier_weights"]["tmp_name"], "to"=>$dir_model.$nom_fichier."/model.weights.bin")));
    }
    print ("OK");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// list_data
} elseif ($action == "list_data") {
    $liste=scandir($dir_data);
    print("[");
    $idx=0;
    foreach ($liste as $elem) {
        if ($elem =="." OR $elem=="..") {
            continue;
        }
        if ($idx >= 1) {
            print (",");
        }
        $commentaire=get_intitule("label_default_comment");
        $sql="select commentaire from commentaires where user='".$_SESSION["user"]["ID"]."' AND nom='".secure_sql($elem)."' AND type='data'";
        $resultat=$GLOBALS["mysqli"]->query($sql);
        if ($ligne=$resultat->fetch_assoc()) {
            $commentaire=$ligne["commentaire"];
        }

        print("{\"url\":\"".$dir.$elem."\", \"name\":\"$elem\", \"commentaire\":\"$commentaire\"}");
        $idx++;
    }
    print("]");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// list_models
} elseif ($action == "list_models") {
    $liste=scandir($dir_model);
    print("[");
    $idx=0;
    foreach ($liste as $elem) {
        if ($elem =="." OR $elem=="..") {
            continue;
        }
        if ($idx >= 1) {
            print (",");
        }
        $commentaire=get_intitule("label_default_comment");
        $sql="select commentaire from commentaires where user='".$_SESSION["user"]["ID"]."' AND nom='".secure_sql($elem)."' AND type='model'";
        $resultat=$GLOBALS["mysqli"]->query($sql);
        if ($ligne=$resultat->fetch_assoc()) {
            $commentaire=$ligne["commentaire"];
        }
        print("{\"url\":\"".$dir.$elem."\", \"name\":\"$elem\", \"commentaire\":\"$commentaire\"}");
        $idx++;
    }
    print("]");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// delete_data
} elseif ($action == "delete_data") {
    if (ddbl_file($dir_data, $nom) === false) {
        die (get_intitule("alert_file_non_exist", array("%nom"=>$nom)));
    }
    $test=delete_elem($dir_data.$nom);

    // on supprime les commentaires
    $sql="delete from commentaires where user='".$_SESSION["user"]["ID"]."' AND nom='".secure_sql($nom)."' AND type='data'";
    $resultat=$GLOBALS["mysqli"]->query($sql);

    die ($test);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// delete_model
} elseif ($action == "delete_model") {
    if (ddbl_file($dir_model, $nom) === false) {
        die (get_intitule("alert_file_non_exist", array("%nom"=>$nom)));
    }
    $test=delete_elem($dir_model.$nom);

    // on supprime les commentaires
    $sql="delete from commentaires where user='".$_SESSION["user"]["ID"]."' AND nom='".secure_sql($nom)."' AND type='model'";
    $resultat=$GLOBALS["mysqli"]->query($sql);

    die ($test);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// check_data
} elseif ($action == "check_data") {
    if (ddbl_file($dir_data, $nom) === false) {
        die ("false");
    }
    die ("true");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// check_model
} elseif ($action == "check_model") {
    if (ddbl_file($dir_model, $nom) === false) {
        die ("false");
    }
    die ("true");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// update_data => renommer un fichier
} elseif ($action == "update_data") {
    // on vérifie que le nouveau nom n'est pas déjà utilisé
    if (ddbl_file($dir_data, $nouv_nom) === true) {
        die (get_intitule("alert_file_already_exists", array("%nom"=>$nouv_nom)));
    }

    // on vérifie que le fichier à renommer existe
    if (ddbl_file($dir_data, $nom) === false) {
        die (get_intitule("alert_file_already_exists", array("%nom"=>$nom)));
    }

    // on vérifie l'extension (sauf si répertoire)
    if (! is_dir($dir_data.$nom)) {
        $elements=explode(".", $nouv_nom);
        $extension=$elements[count($elements)-1];

        if (verifie_extension($extension, $extensions_autorisees_data) === false) {
            die (get_intitule("alert_extension_forbidden", array("%extension"=>$extension)));
        }
    }

    // on renomme
    $test=rename($dir_data.$nom, $dir_data.$nouv_nom);
    if ($test === false) {
        die (get_intitule("alert_impossible_rename", array("%nom"=>$nom, "%nouv_nom"=>$nouv_nom)));
    }

    // on renomme les commentaires
    $sql="update commentaires set nom='".secure_sql($nouv_nom)."' where user='".$_SESSION["user"]["ID"]."' AND nom='".secure_sql($nom)."' AND type='data'";
    $resultat=$GLOBALS["mysqli"]->query($sql);

    die ("OK");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// update_model => renommer un répertoire
} elseif ($action == "update_model") {
    // on vérifie que le nouveau nom n'est pas déjà utilisé
    if (ddbl_file($dir_model, $nouv_nom) === true) {
        die (get_intitule("alert_file_already_exists", array("%nom"=>$nouv_nom)));
    }

    // on vérifie que le fichier à renommer existe
    if (ddbl_file($dir_model, $nom) === false) {
        die (get_intitule("alert_file_non_exist", array("%nom"=>$nom)));
    }

    // on renomme
    $test=rename($dir_model.$nom, $dir_model.$nouv_nom);
    if ($test === false) {
        die (get_intitule("alert_impossible_rename", array("%nom"=>$nom, "%nouv_nom"=>$nouv_nom)));
    }

    // on renomme les commentaires
    $sql="update commentaires set nom='".secure_sql($nouv_nom)."' where user='".$_SESSION["user"]["ID"]."' AND nom='".secure_sql($nom)."' AND type='model'";
    $resultat=$GLOBALS["mysqli"]->query($sql);

    die ("OK");

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// download_model => télécharge le fichier .json ou .bin
} elseif ($action == "download_model") {
    $type=$_REQUEST["type"];
    $url=$dir_model_url.$nom;
    if ($type==="json") {
        $url.="/model.json";
    } elseif ($type === "bin") {
        $url.="/model.weights.bin";
    }
    //header ("Content-Disposition: attachment");
    //header("Location: $url");
    die ($url);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// save_model => sauvegarde le modèle actuel
} elseif ($action == "save_model") {

    // si taille dépassée
    $taille_json=filesize($_FILES["model_json"]["tmp_name"]);
    $taille_bin=0;
    if ($_FILES["model_weights_bin"]["tmp_name"] != "") {
        $taille_bin=filesize($_FILES["model_weights_bin"]["tmp_name"]);
    }
    $taille=get_size_user($dirs_user);
    if ($taille_json+$taille_bin+$taille > $GLOBALS["conf"]["max_size_user"]) {
        die (get_intitule("alert_size_excessed", array("%size"=>$taille_json+$taille_bin+$taille, "%max_size"=>$GLOBALS["conf"]["max_size_user"])));
    }

    // 1. on regarde si un répertoire $name existe déjà sinon on le crée
    if (!is_dir($dir_model.$nom)) {
    	mkdir($dir_model.$nom, 0777) OR die (get_intitule("alert_impossible_create_directory", array("%nom"=>$dir_model.$nom)));
    }

    // 2. on enregistre les fichiers
    // 1) model_json
    move_uploaded_file($_FILES["model_json"]["tmp_name"], $dir_model.$nom."/".$_FILES["model_json"]["name"]) OR die (get_intitule("alert_impossible_move_file", array("%from"=>$_FILES["model_json"]["tmp_name"], "to"=>$dir_model.$nom."/".$_FILES["model_json"]["name"])));
    move_uploaded_file($_FILES["model_weights_bin"]["tmp_name"], $dir_model.$nom."/".$_FILES["model_weights_bin"]["name"]) OR die (get_intitule("alert_impossible_move_file", array("%from"=>$_FILES["model_weights_bin"]["tmp_name"], "to"=>$dir_model.$nom."/".$_FILES["model_weights_bin"]["name"])));

    print ("OK");
} elseif ($action == "get_user_size") {
    $taille=get_size_user($dirs_user);
    die ("{\"used\": \"$taille\", \"max\": \"".$GLOBALS["conf"]["max_size_user"]."\"}");

} elseif ($action == "get_commentaire") {
    $sql="select commentaire from commentaires where user='".$_SESSION["user"]["ID"]."' AND type='".secure_sql($type)."' AND nom='".secure_sql($nom)."'";
    $resultat=$GLOBALS["mysqli"]->query($sql);
    if ($resultat === false) {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_update_impossible")."\"}");
    }
    $commentaire="";
    if ($ligne=$resultat->fetch_assoc()) {
        $commentaire=$ligne["commentaire"];
    }
    die ("{\"commentaire\" : \"$commentaire\"}");
} elseif ($action == "set_commentaire") {
    // 1) on supprime le commentaire
    $sql="delete from commentaires where user='".$_SESSION["user"]["ID"]."' AND type='".secure_sql($type)."' AND nom='".secure_sql($nom)."'";
    $resultat=$GLOBALS["mysqli"]->query($sql);
    //2) on le crée
    $sql="insert into commentaires values ('".$_SESSION["user"]["ID"]."', '".secure_sql($type)."', '".secure_sql($nom)."', '".secure_sql($commentaire)."')";
    $resultat=$GLOBALS["mysqli"]->query($sql);
    if ($resultat === false) {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_update_impossible")."\"}");
    }
    die ("{\"commentaire\" : \"$commentaire\"}");
} // fin de la vérification de $action



?>
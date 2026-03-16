<?PHP

include_once("init.php");
include_once("util.php");
include_once ("lang.php");

$mail_user=$_REQUEST["mail_user"];
$pwd_user=$_REQUEST["pwd_user"];
$name_user=$_REQUEST["name_user"];
$action=$_REQUEST["action"];

if ($action === "connexion") {
    $mail_user2=secure_sql($mail_user);
    $sql="select * from users where mail=\"$mail_user2\"";
    $resultat=$GLOBALS["mysqli"]->query($sql);
    if ($ligne=$resultat->fetch_assoc()) {
        $hash=$ligne["pwd"];
        if (!password_verify($pwd_user, $hash)) { // verif mdp
            die ("{\"success\":false, \"message\":\"".get_intitule("alert_wrong_login_or_pwd")."\"}");
        }
        $name_user=$ligne["name"];
        $ID_user=$ligne["ID"];
        $dir_user=$ligne["dir"];
        $_SESSION["user"]=array("name"=>$name_user, "ID"=>$ID_user, "mail"=>$mail_user, "dir"=>$ID_user."_".$dir_user);
        die ("{\"success\":true, \"message\":\"\", \"name\":\"$name_user\", \"ID\":$ID_user, \"mail\":\"$mail_user\", \"dir\":\"".$ID_user."_".$dir_user."\"}");

    } else {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_wrong_login_or_pwd")."\"}");
    }

} elseif ($action==="inscription") {
    // 1) vérifier que le compte n'existe pas déjà
    $mail_user2=secure_sql($mail_user);
    //$pwd_user2=secure_sql($pwd_user);
    $pwd_user2=password_hash($pwd_user, PASSWORD_DEFAULT);
    $name_user2=secure_sql($name_user);
    $sql="select * from users where mail=\"$mail_user2\"";
    $resultat=$GLOBALS["mysqli"]->query($sql);
    if ($ligne=$resultat->fetch_assoc()) {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_user_already_exists", array("%user"=>$mail_user))."\"}");
    }

    // vérifie que l'e-mail est bien formé
     if (!filter_var($mail_user, FILTER_VALIDATE_EMAIL)) {
            die ("{\"success\":false, \"message\":\"".get_intitule("alert_mail_malformed", array("%mail"=>$mail_user))."\"}");
     }

    // 2) vérifier qu'aucune donnée n'est nulle
    if ($mail_user === "" OR $pwd_user === "" OR $name_user === "") {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_all_fields_required")."\"}");
    }

    // 3) création du compte
    $dir=bin2hex(random_bytes(5));
    $sql2="insert into users values (NULL, \"$mail_user2\", \"$pwd_user2\", \"$name_user2\", \"$dir\")";
    $resultat2=$GLOBALS["mysqli"]->query($sql2);
    if ($resultat2 === true) {
        $ID=$GLOBALS["mysqli"]->insert_id;
        $rep=$GLOBALS["conf"]["dir_data"].$ID."_".$dir;
        mkdir($rep);
        $rep=$GLOBALS["conf"]["dir_model"].$ID."_".$dir;
        mkdir($rep);
        die ("{\"success\":true, \"message\":\"\"}");
    } else {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_impossible_create_account")."\"}");
    }


} elseif ($action==="modification") {
    // on vérifie que l'utilisateur est bien connecté
    if ($_SESSION["user"]["ID"]=="") {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_not_connected")."\"}");
    }

    // 2) vérifier qu'aucune donnée n'est nulle
    if ($mail_user === ""  OR $name_user === "") {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_mail_name_mandatory")."\"}");
    }

    // vérifie que l'e-mail est bien formé
     if (!filter_var($mail_user, FILTER_VALIDATE_EMAIL)) {
            die ("{\"success\":false, \"message\":\"".get_intitule("alert_mail_malformed", array("%mail"=>$mail_user))."\"}");
     }

    // 3) MAJ
    $ID=$_SESSION["user"]["ID"];
    $dir=$_SESSION["user"]["dir"];
    $mail_user2=secure_sql($mail_user);
    $pwd_user2=password_hash($pwd_user, PASSWORD_DEFAULT);
    $name_user2=secure_sql($name_user);
    if ($pwd_user == "") {
        $sql="update users SET mail= \"$mail_user2\", name= \"$name_user2\" where ID=$ID";
    } else {
        $sql="update users SET mail= \"$mail_user2\", name= \"$name_user2\", pwd= \"$pwd_user2\" where ID=$ID";
    }
    $resultat=$GLOBALS["mysqli"]->query($sql);
    if ($resultat === false) {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_update_impossible")."\"}");
    } else {
         $_SESSION["user"]["name"]=$name_user;
         $_SESSION["user"]["mail"]=$mail_user;
         //$_SESSION["user"]["pwd"]=$pwd_user;
         die ("{\"success\":true, \"message\":\"\", \"name\":\"$name_user\", \"ID\":$ID, \"mail\":\"$mail_user\", \"dir\":\"".$dir."\"}");

    }

} elseif ($action==="deconnexion") {
    $_SESSION["user"]=array();
    die ("{\"success\":true, \"message\":\"\"}");
} elseif ($action==="suppression") {
    $ID=$_SESSION["user"]["ID"];
    $dir=$_SESSION["user"]["dir"];

    if ($ID=="" OR $dir=="") {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_id_or_dir_undefined")."\"}");
    }

    // 1) suppression du compte sql
    $sql="delete from users where ID=$ID";
    $resultat=$GLOBALS["mysqli"]->query($sql);
    if ($resultat === false) {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_impossible_delete_account", array("%id"=>$ID))."\"}");
    }

    // 1bis) suppression des commentaires
    $sql="delete from commentaires where user=$ID";
    $resultat=$GLOBALS["mysqli"]->query($sql);

    // 2) suppression des répertoires
    $message="";
    $rep=$GLOBALS["conf"]["dir_model"].$dir;
    $tmp=delete_elem($rep);
    if ($tmp != "OK") {
        $message=$tmp." ";
    }
    $rep=$GLOBALS["conf"]["dir_data"].$dir;
    $tmp=delete_elem($rep);
    if ($tmp != "OK") {
        $message.=$tmp;
    }
    if ($message != "") {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_impossible_delete_dirs", array("%dirs"=>$message))."\"}");
    }


    $_SESSION["user"]=array();
    die ("{\"success\":true, \"message\":\"\"}");
} elseif ($action==="pwd_oublie") {
    if ($mail_user === "") {
        die ("{\"success\":false, \"message\":\"".get_intitule("alert_prompt_mail")."\"}");
    }
    $mail_user2=secure_sql($mail_user);
    $sql="select * from users where mail = \"$mail_user2\"";
    $resultat=$GLOBALS["mysqli"]->query($sql);
    if ($ligne=$resultat->fetch_assoc()) {
        $hash=bin2hex(random_bytes(10));
        $now=time();
        $sql2="insert into reset_pwd value (\"$mail_user2\", \"$hash\", '$now')";
        $resultat2=$GLOBALS["mysqli"]->query($sql2);
        if ($resultat2 === false) {
            die ("{\"success\":false, \"message\":\"".get_intitule("alert_impossible_register_key")."\"}");
        }
        $lien=$GLOBALS["conf"]["toolkait_url"]."reset_pwd.php?hash=$hash";
        $message=get_intitule("text_mail_pwd_forgotten", array("%lien"=>$lien));
        $tmp=envoie_mail($mail_user, get_intitule("subject_mail_pwd_forgotten"), $message);
        if ($tmp === false) {
            die ("{\"success\":false, \"message\":\"".get_intitule("alert_impossible_send_mail", array("%mail"=>$mail_user))."\"}");
        }

        die ("{\"success\":true, \"message\":\"\"}");
    } else {
         die ("{\"success\":false, \"message\":\"".get_intitule("alert_user_not_exists", array("%mail"=>$mail_user))."\"}");
    }

}

// si pas d'action mais user déjà existant => reload
if ($_SESSION["user"]["ID"] != "") {
    $name_user=$_SESSION["user"]["name"];
    $ID_user=$_SESSION["user"]["ID"];
    $mail_user=$_SESSION["user"]["mail"];
    $dir_user=$_SESSION["user"]["dir"];
    die ("{\"success\":true, \"message\":\"\", \"name\":\"$name_user\", \"ID\":$ID_user, \"mail\":\"$mail_user\", \"dir\":\"$dir_user\"}");
}

// si aucune action reconnue
die ("{\"success\":false, \"message\":\"".get_intitule("alert_action_invalid")."\"}");


?>
<?PHP

include_once("init.php");
include_once("util.php");
include_once ("lang.php");

$pwd=$_REQUEST["pwd"];
$hash=$_REQUEST["hash"];
$mail="";
$mail2="";

$hash2=secure_sql($hash);
$pwd2=password_hash($pwd, PASSWORD_DEFAULT);

if ($hash == "") {
    die (get_intitule("alert_no_hash"));
}

// On vérifie le hash
$sql="select * from reset_pwd where hash=\"$hash2\"";
$resultat=$GLOBALS["mysqli"]->query($sql);
if ($ligne=$resultat->fetch_assoc()) {
    $timestamp=$ligne["timestamp"];
    $mail=$ligne["mail"];
    $mail2=secure_sql($mail);
    $now=time();
    $diff=$now-$timestamp;
    if ($diff > 60*60) {
        die (get_intitule("alert_deadline_exceeded"));
    }
} else {
    die (get_intitule("alert_hash_not_exists", array("%hash"=>$hash)));
}

// Si mot de passe fourni, on le change
if ($pwd != "") {
    $sql2="update users SET pwd=\"$pwd2\" where mail=\"$mail2\"";
    $resultat2=$GLOBALS["mysqli"]->query($sql2);
    if ($resultat2 === false) {
        die (get_intitule("alert_impossible_update_pwd"));
    } else {
        die (get_intitule("alert_update_done"));
    }
}

// sinon on affiche le formulaire


?>

<HTML>
    <HEAD>
        <title>Toolkait : reset password</title>
    </HEAD>
    <BODY>
       <form action="reset_pwd.php">
       <input type="hidden" name="hash" value="<?PHP  print ("$hash"); ?>">
       <?PHP print_intitule("label_new_pwd");  ?> :
       <input type="password" name="pwd"><br>
       <button type="submit"><?PHP print_intitule("button_validate");  ?></button>


       </form>

    </BODY>

</HTML>
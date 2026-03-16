<?PHP

include_once("perso.php");

ini_set('session.gc_maxlifetime', 172800); // 48 heures
ini_set('session.gc_probability', 1);
ini_set('session.gc_divisor', 100);

require_once __DIR__ . '/vendor/autoload.php'; // gestion du zip



// SESSION
session_start();
$sid=session_id();
$sname=session_name();
setcookie($sname,$sid);



$GLOBALS["mysqli"]= new mysqli($mysql_server, $mysql_user, $mysql_pwd, $mysql_db);
if ($GLOBALS["mysqli"]->connect_error) {
    die('Connection error: ' . $GLOBALS["mysqli"]->connect_error);
}
$GLOBALS["mysqli"]->query("SET NAMES 'UTF8'");

// LANG
if ($_REQUEST["lang"] != "") {
    $_SESSION["lang"]=$_REQUEST["lang"];
} elseif ( $_SESSION["lang"]=="") {
     $_SESSION["lang"]=$GLOBALS["conf"]["default_lang"];
}



?>
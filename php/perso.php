<?PHP
$GLOBALS["conf"]=array();

// MYSQL
$mysql_server="localhost";
$mysql_user="xxx";
$mysql_pwd="xxx";
$mysql_db="xxx";

// GLOBAL VAR TO CHANGE
$GLOBALS["conf"]["mail_from"]="xxx@xxx.com";
$GLOBALS["conf"]["toolkait_racine"]="https://toolkait.net/"; // f.e https://my_toolkait.com/ OR https://my_site.com/toolkait/

// VARIABLES GLOBALES
$GLOBALS["conf"]["dir_data"]="../saved_data/";
$GLOBALS["conf"]["dir_model"]="../saved_models/";
$GLOBALS["conf"]["dir_model_url"]="saved_models/";
$GLOBALS["conf"]["toolkait_url"]=$GLOBALS["conf"]["toolkait_racine"]."php/";
$GLOBALS["conf"]["default_lang"]="en";
$GLOBALS["conf"]["max_size_user"]=1000*1000*500; // 500Mo
$GLOBALS["conf"]["extensions_autorisees_data"]=["csv", "parquet", "txt", "zip"];
$GLOBALS["conf"]["extensions_autorisees_img"]=["jpg", "png", "jpeg"];



?>
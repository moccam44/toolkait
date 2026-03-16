<?PHP
include_once ("php/util.php");
include_once ("php/init.php");
include_once ("php/lang.php");
?>

<html>
    <head>
        <title>Toolkait</title>
        <link rel="icon" type="image/png" href="IMG/icones/chart_organisation.png">
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">

        <link href="css/toolkait.css" rel="stylesheet">
        <link href="css/menu.css" rel="stylesheet">

        <script src="https://code.jquery.com/jquery-3.7.1.js"></script>
        <script src="https://code.jquery.com/ui/1.13.3/jquery-ui.js"></script>
        <script src="js/util.js"></script>
        <script>
            var glob_language="<?PHP print_language();  ?>";


        </script>

    </head>

    <body>

        <div id="wb_head">
                <!--<img src="IMG/bandeau/image3.png" id="img_logo"/>-->
                <img src="IMG/bandeau/titre.png" id="img_titre"/>
                <div id="bandeau_titre_1"><?PHP print_intitule("sous_titre");  ?></div>
            </div>
        <div id="bloc_menu_lateral">
                    <table><tr><td><div class="flag"><a href="help.php?lang=en"><img class="pointer" src="IMG/icones_grandes/flag_en.png" id="english_flag"  /></a></div></td>
                    <td><div class="flag"><a href="help.php?lang=fr"><img class="pointer" src="IMG/icones_grandes/flag_fr.png" id="french_flag" /></a></div></td></tr></table>
        </div>

        <?PHP
         $a_inclure="php/help_".$_SESSION["lang"].".php";
         include_once($a_inclure);

         ?>




    </body>
</html>

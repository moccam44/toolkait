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
            window.onload=function(e) {
                init();
            }

            function init() {

            }




        </script>
    <?PHP
        if ($_SESSION["lang"] === "fr") {
    ?>
        <meta name="title" content="Toolkait">
        <meta name="description" content="Toolkait est une application libre et gratuite, accessible depuis le navigateur (rien à télécharger ni à installer)Elle vous permet de créer et entrainer vos propres réseaux de neurones avec vos propres données ou des données disponibles sur Internet, afin de vous initier à l'intelligence artificielle">
        <meta name="keywords" content="neural networks, deep learning, toolkait, artificial intelligence, AI, réseaux de neurones, intelligence artificielle, IA">
        <meta name="robots" content="index, follow">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="language" content="French">

    <?PHP
        } else {
    ?>
        <meta name="title" content="Toolkait">
        <meta name="description" content="Toolkait is a free and open-source application, accessible from the browser (nothing to download or install).It allows you to create and train your own neural networks with your own data or data available on the internet, to introduce you to artificial intelligence">
        <meta name="keywords" content="neural networks, deep learning, toolkait, artificial intelligence, AI">
        <meta name="robots" content="index, follow">
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
        <meta name="language" content="English">
    <?PHP
        }
    ?>

    </head>

    <body>
        <div id="wb_head">
            <!--<img src="IMG/bandeau/image3.png" id="img_logo"/>-->
            <img src="IMG/bandeau/titre.png" id="img_titre"/>
            <div id="bandeau_titre_1"><?PHP print_intitule("sous_titre");  ?></div>
        </div>


        <div id="bloc_menu_lateral">
            <table><tr><td><div class="flag"><a href="index.php?lang=en"><img class="pointer" src="IMG/icones_grandes/flag_en.png" id="english_flag" /></a></div></td>
            <td><div class="flag"><a href="index.php?lang=fr"><img class="pointer" src="IMG/icones_grandes/flag_fr.png" id="french_flag" /></a></div></td></tr></table>

            <div><a href="toolkait.php?lang=<?PHP print_language();  ?>" target="_blank"> <button> <?PHP print_intitule("button_acces_toolkait");  ?> </button></a></div>
            <div><a href="help.php?lang=<?PHP print_language();  ?>" target="_blank"> <button> <?PHP print_intitule("button_get_help");  ?> </button></a></div>

            <div><a href="https://theresanaiforthat.com/ai/toolkait/?ref=featured&v=9177857" target="_blank" rel="nofollow"><img width="300" src="https://media.theresanaiforthat.com/featured-on-taaft.png?width=600"></a></div>

        </div>

        <div id="bloc_carousel">
                <!--<img id="carousel_img" src="IMG/carousel/img_0.png">-->
                <video src="
                <?PHP

                if ($_SESSION["lang"] === "fr") {
                    print("videos/fr_pitch_5.mp4");
                } else {
                    print("videos/en_pitch_5.mp4"); // anglais par défaut
                }


                ?>
                " width="1000px" poster="IMG/carousel/img_6.png" autoplay="true" loop="true" muted="true" disablepictureinpicture="true">

                </video>
            </div>

        <div id="bloc_presentation">
            <?PHP print_intitule("text_presentation_toolkait");  ?>
        </div>





    </body>


</html>
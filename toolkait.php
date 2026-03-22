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
        <link href="css/table_organizer.css" rel="stylesheet">
		<link href="css/data_organizer.css" rel="stylesheet">
        <link href="css/layers_organizer.css" rel="stylesheet">
		<link href="css/model_organizer.css" rel="stylesheet">
		<link href="css/lnk_data_model.css" rel="stylesheet">
		<link href="css/training_organizer.css" rel="stylesheet">
		<link href="css/predictions_organizer.css" rel="stylesheet">
        <link href="css/toolkait.css" rel="stylesheet">
		<link href="css/drawings.css" rel="stylesheet">
        <link href="css/menu.css" rel="stylesheet">
		<link href="css/user_organizer.css" rel="stylesheet">
        
        <link rel="stylesheet" href="https://code.jquery.com/ui/1.13.3/themes/base/jquery-ui.css">
        
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.20.0/dist/tf.min.js"></script> <!-- tf -->
        <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-vis@1.0.2/dist/tfjs-vis.umd.min.js"></script>
        <script src="https://cdn.jsdelivr.net/npm/danfojs@1.1.2/lib/bundle.min.js"></script> <!-- dfd -->
        <script src="https://code.jquery.com/jquery-3.7.1.js"></script>
        <script src="https://code.jquery.com/ui/1.13.3/jquery-ui.js"></script>
		<script src="js/jquery.connections.js"></script> <!-- pour relier des div -->
		

		<script src="js/util.js"></script>
		<script src="js/user_organizer.js"></script>
		<script src="js/tf_organizer.js"></script>
		<script src="js/data_organizer.js"></script>
		<script src="js/tfjs_add.js" type="module"></script>
		<script src="js/word_tokenizer.js"></script>
        <script src="js/table_organizer.js"></script>
        <script src="js/layers_organizer.js"></script>
		<script src="js/model_organizer.js"></script>
		<script src="js/lnk_data_model.js"></script>
		<script src="js/training_organizer.js"></script>
		<script src="js/predictions_organizer.js"></script>
		<script src="js/chef_orchestre.js"></script>
        <script src="js/menu.js"></script>
        <script src="js/toolkait.js"></script>
		<script src="js/drawings.js"></script>
        <script src="js/lang.js"></script>
        
        <script>
			// variables globales
			var wb_menu_main;
			var layers_organizer;
			var model_organizer;
			var table_organizer;
			var lnk_data_model;
			var training_organizer;
			var predictions_organizer;
			var chef_orchestre;
			var tokenizers={}; // tokenizers utilisés (généralement 1 seul)
			var glob_tokenizer;
			var tf_organizer;
			var data_organizer;
			var user_organizer;
			
			var glob_url_csv_generator="php/csv_generator.php";
			var glob_url_manage_files="php/manage_files.php";
			var glob_url_manage_users="php/manage_users.php";
			var glob_server_php="<?PHP print ($GLOBALS["conf"]["toolkait_racine"]);  ?>";
			var glob_saved_models_path="saved_models";
			var glob_language="<?PHP print_language();  ?>";
            var glob_default_language="en";
            var glob_diffusion_nb_steps=4; // nb d'étapes de débruitage pour la diffusion : à rendre paramétrable
            var glob_diffusion_ema_decay=0.999;
            var glob_diffusion_ema_n_batch=1;
            var glob_diffusion_ema_bool_active=false;
            var glob_number_field_min=-3.0;
            var glob_number_field_max=3.0;
            var glob_word_tokenizer_shuffle=false;
            var glob_text_prediction_nb_words=5;
			
			
			
			async function init() {

				// menu principal
				wb_menu_main=new wb_menu("wb_menu_main", "wb_menu_main_div"); // menu main
				wb_menu_main.clique('wb_table_edit'); // on se met sur le menu 1
                                
                // onglets secondaires
				$("#zone_data_organizer").tabs();
				$("#zone_compile").tabs();
				$("#zone_explore_modele").tabs();
				$("#zone_tableau_meta").accordion({heightStyle:"content", active:0, collapsible:true});
				$("#zone_info_modele_load_accordion").accordion({heightStyle:"content", active:0, collapsible:true});
				$("#menu_model").tabs();
				$("#zone_tf").tabs();
				$("#zone_tab_tokenizers").tabs();

				// checkbox
				$("#bool_load_weights").checkboxradio({icon: false});
				$("#bool_load_ema").checkboxradio({icon: false});
				$("#bool_save_ema").checkboxradio({icon: false});
				$("#bool_one_hot_embeddings").checkboxradio({icon: false});

				
				// chef_orchestre
				chef_orchestre=new chef_orchestre();

				// user
				user_organizer=new user_organizer();
				
				// gestionnaire de layers
				//layers_organizer=new layers_organizer ({zone_layers : "zone_layers", formulaire_layer:"wb_dialog"}); 
				//layers_organizer.init_layers();

				// gestionnaire de data
				data_organizer=new data_organizer ({});
				
				// gestionnaire de modèle
				model_organizer=new model_organizer ({zone_model : "zone_model", formulaire_layer:"wb_dialog"}); 
				model_organizer.init();
				
				// gestionnaire de tableau
                table_organizer=new table_organizer({zone_tableau : 'zone_tableau', zone_tableau_meta : 'zone_load_data', id : 'tableau1', formulaire_tableau : 'wb_dialog', zone_load_array : 'zone_load_array',});
                table_organizer.init_meta();
				
				// lnk_data_model
				lnk_data_model=new lnk_data_model ({zone_lnk : "wb_lnk_data_model", formulaire_layer:"wb_dialog", obj_model:model_organizer, obj_data:table_organizer}); 
				lnk_data_model.init();
				
				// gestionnairee entrainement
				training_organizer = new training_organizer ({zone_training:"zone_training", obj_lnk:lnk_data_model});
				training_organizer.raz_form();
				
				// gestionnaire predictions
				predictions_organizer = new predictions_organizer ({zone_predictions_form:"zone_predictions_form", zone_predictions_resultat:"zone_predictions_resultat"});
				predictions_organizer.init();
				
				// drawings
				drawings = new drawings ({});

				// gestionnaire de tf
				tf_organizer = new tf_organizer({});

				user_organizer.touch(); // on regarde si user déjà connecté

				// Gestionnaire d'erreurs globales
                window.onerror = function(message, source, lineno, colno, error) {
                  console.error("Erreur non capturée :", message);
                  alert(glob_get_intitule("alert_unhandled_error", {"%message":message}));
                  return true;
                };

                // Gestionnaire de rejets de promesses non gérés
                window.addEventListener('unhandledrejection', (event) => {
                  console.error("Promesse non gérée :", event.reason);
                  alert(glob_get_intitule("alert_unhandled_error", {"%message":event.reason}));
                  return true;
                });

                
            }
            window.onload=function(e) {
                init();
            }
        </script>
		
		<script type="module">
			// Import du Tokenizer Huggingface
			import { pipeline, env, AutoTokenizer  } from "https://cdn.jsdelivr.net/npm/@huggingface/transformers";
			glob_tokenizer=AutoTokenizer;
		</script>
    </head>
    <body>
	
        
        <div id="wb_head">
		<!--<img src="IMG/bandeau/image3.png" id="img_logo"/>-->
            <img src="IMG/bandeau/titre.png" id="img_titre"/>
			<div id="bandeau_titre_1"><?PHP print_intitule("sous_titre");  ?></div>
			<div id="icone_lang"><img src="IMG/icones_grandes/flag_<?PHP print_language();  ?>.png" class="pointer" title="<?PHP print_intitule("label_change_language");  ?>" onclick="change_langue2();"/></div>
			<div id="icone_user"><img src="IMG/icones_grandes/user_big.png" class="pointer" title="<?PHP print_intitule("tip_identification");  ?>" onclick="user_organizer.clique_user();"/></div>
			<div id="user_name"></div>


        </div>
		
		<!------------------------------------- MENU ------------------------------------------------------------------>
        <div id="wb_menu">
            <div class="wb_menu_main" name="wb_database" onclick="wb_menu_main.clique('wb_database')"  title="<?PHP print_intitule("menu_database");  ?>"><img src="IMG/icones_grandes/database.png"  ></div>
            <div class="wb_menu_main"  name="wb_table_edit" onclick="wb_menu_main.clique('wb_table_edit')" title="<?PHP print_intitule("menu_table_edit");  ?>"><img src="IMG/icones_grandes/table_edit.png" ></div>
            <div class="wb_menu_main"  name="wb_tenseurs" onclick="wb_menu_main.clique('wb_tenseurs')" title="<?PHP print_intitule("menu_tenseurs");  ?>"><img src="IMG/icones_grandes/matrice_white.png" style="height:32px;width:32px"></div>
            <!--<div class="wb_menu_main"  name="wb_layers" onclick="wb_menu_main.clique('wb_layers')" title="<?PHP print_intitule("menu_xxx");  ?>"><img src="IMG/icones_grandes/layers.png"></div>-->
			<div class="wb_menu_main"  name="wb_model" onclick="wb_menu_main.clique('wb_model')" title="<?PHP print_intitule("menu_model");  ?>"><img src="IMG/icones_grandes/layers.png"></div>
			<div class="wb_menu_main"  name="wb_lnk_data_model" onclick="wb_menu_main.clique('wb_lnk_data_model')" title="<?PHP print_intitule("menu_lnk_data_model");  ?>"><img src="IMG/icones_grandes/arrow_switch.png"></div>
			<!--<div class="wb_menu_main"  name="wb_layers_map" onclick="wb_menu_main.clique('wb_layers_map')" title="<?PHP print_intitule("menu_xxx");  ?>"><img src="IMG/icones_grandes/layers_map.png"></div>-->
            <div class="wb_menu_main"  name="wb_cog_go" onclick="wb_menu_main.clique('wb_cog_go')" title="<?PHP print_intitule("menu_train");  ?>"><img src="IMG/icones_grandes/cog_go.png"></div>
            <div class="wb_menu_main"  name="wb_horoscope" onclick="wb_menu_main.clique('wb_horoscope')" title="<?PHP print_intitule("menu_predict");  ?>"><img src="IMG/icones_grandes/horoscopes.png"></div>
			<div class="wb_menu_main"  name="wb_node" onclick="wb_menu_main.clique('wb_node')" title="<?PHP print_intitule("menu_visu");  ?>"><img src="IMG/icones_grandes/eye.png"></div>
			<div class="wb_menu_main"  name="wb_tokenizers" onclick="wb_menu_main.clique('wb_tokenizers')" title="<?PHP print_intitule("menu_tokenizers");  ?>"><img style="width:32px" src="IMG/icones_grandes/tokenizer.png"></div>
			<div class="wb_menu_main"  name="wb_tf" onclick="wb_menu_main.clique('wb_tf')" title="<?PHP print_intitule("menu_tf");  ?>"><img src="IMG/icones_grandes/tf.png"></div>
			<div class="wb_menu_main"  name="wb_help" onclick="window.open('help.php', '_blank')" title="<?PHP print_intitule("menu_help");  ?>"><img src="IMG/icones_grandes/help.png"></div>

        </div>

		
		
			<div id="wb_main">
				
		<!------------------------------------- DONNEES BRUTES ------------------------------------------------------------------>
            <div id="zone_data_organizer" class="wb_menu_main_div" name="wb_database">

				<ul>
					<li><a href="#zone_DO_data"><?PHP print_intitule("tab_training_data");  ?></a></li>
					<li><a href="#zone_DO_models"><?PHP print_intitule("tab_models");  ?></a></li>

				</ul>



				<!-- données ------------------------------------->
				<div id="zone_DO_data">
					<div id="zone_DO_data_form" class="console">
						<form id="form_DO_data" enctype="multipart/form-data">
							<table>
								<tr><td><?PHP print_intitule("label_file");  ?> : </td><td><input type="file" id="zone_DO_data_form_fichier" name="fichier1"  accept=".parquet,.csv,.json,.txt,.zip" /></td></tr>
								<tr><td><?PHP print_intitule("label_description");  ?></td><td><textarea id="zone_DO_data_form_texte" name="texte" placeholder="<?PHP print_intitule("tip_data_description");  ?>"></textarea></td></tr>

							</table>
							<table class="barre_icones"><tr><td class="icone"><img src="IMG/icones_grandes/upload.png" title="<?PHP print_intitule("button_send_file");  ?>" class="pointer icone" onclick="data_organizer.upload_data()" /> </td><td class="icone"><img src="IMG/icones_grandes/arrow_refresh.png" class="pointer icone" title="<?PHP print_intitule("button_refresh_list");  ?>" onclick="data_organizer.list_data();"/></td><td>&nbsp;</td><td><div id="progressbar_data_upload"></div></div></td></tr></table>
						</form>
					</div>

					<div id="zone_DO_data_liste">

					</div>
				</div>
				<!-- models ----------------------------------->
				<div id="zone_DO_models">
					<div id="zone_DO_model_form" class="console">
					<form id="form_DO_model" enctype="multipart/form-data">
						<table>
							<tr><td><?PHP print_intitule("label_model_name");  ?></td><td><input id="zone_DO_model_form_name" name="name" placeholder="<?PHP print_intitule("tip_model_name");  ?>"></input></td></tr>
							<tr><td><?PHP print_intitule("label_json_file");  ?>: </td><td><input type="file" id="zone_DO_model_form_json" name="fichier_json"  accept=".json" /></td></tr>
							<tr><td><?PHP print_intitule("label_bin_file");  ?> : </td><td><input type="file" id="zone_DO_model_form_weights" name="fichier_weights"  accept=".bin"/></td></tr>
							<tr><td><?PHP print_intitule("label_description");  ?></td><td><textarea id="zone_DO_model_form_texte" name="texte" placeholder="<?PHP print_intitule("tip_model_description");  ?>"></textarea></td></tr>
						</table>

					</form>
					<table class="barre_icones"><tr><td class="icone"><img src="IMG/icones_grandes/upload.png" title="<?PHP print_intitule("button_senf_files");  ?>" class="pointer icone" onclick="data_organizer.upload_model()" /> </td><td class="icone"><img src="IMG/icones_grandes/arrow_refresh.png" class="pointer icone" title="<?PHP print_intitule("button_refresh_list");  ?>" onclick="data_organizer.list_models();"/></td><td>&nbsp;</td><td><div id="progressbar_model_upload"></div></tr></table>
					</div>
					<div id="zone_DO_model_liste">

					</div>
				</div>

                <!-- espace storage--------------------------->
                <div id="progressbar_storage"><div class="progress-label"></div></div>

                <div id="zone_data_commentaire">
                    <input type="hidden" value="" name="nom">
                    <input type="hidden" value="" name="type">
                    <textarea name="commentaire"></textarea>
                    <button onclick="data_organizer.set_commentaire();"><?PHP print_intitule("button_update_comment");  ?></button>

                </div>



			</div>
		
		<!------------------------------------- GESTION DES DATA ------------------------------------------------------------------>
            <div class="wb_menu_main_div" name="wb_table_edit" id="menu_data"> 

				
				<!------------------------------------- CHARGEMENT DES DATA ------------------------------------------------------------------>
				<div id="zone_load_data">
					<div id="zone_tableau_meta">

						<h3><?PHP print_intitule("tab_load_data_perso");  ?></h3>
						<div>

							<table class="barre_icones"><tr><td class="icone"><img src="IMG/icones_grandes/download2.png" class="pointer icone" title="uploader des données" onclick="table_organizer.affiche_fin_chargement(); wb_menu_main.clique('wb_database');"/></td><td class="icone"><img src="IMG/icones_grandes/arrow_refresh.png" class="pointer icone" title="rafraichir la liste" onclick="table_organizer.affiche_data_perso()"/></td><td>&nbsp;</td></tr></table>
							<div id="zone_load_data_perso">

							</div>

						</div>

						<h3><?PHP print_intitule("tab_load_data_exemples");  ?></h3>

						<div id="zone_load_saved">
							<h4><?PHP print_intitule("label_classification_regression");  ?></h4>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/osanseviero/titanic/resolve/main/train.csv')"><?PHP print_intitule("text_exemple_titanic");  ?></p>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/hitorilabs/iris/resolve/main/data/train-00000-of-00001-e6f8777399c691a5.parquet')"><?PHP print_intitule("text_exemple_iris");  ?></p>
                            <p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/vaibhavsw/Boston_housing/resolve/main/Housing.csv')"><?PHP print_intitule("text_exemple_boston_housing");  ?></p>

							<hr />
							<h4><?PHP print_intitule("label_images_processing");  ?></h4>

                            <p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/ylecun/mnist/resolve/main/mnist/train-00000-of-00001.parquet')"><?PHP print_intitule("text_exemple_mnist");  ?></p>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/zalando-datasets/fashion_mnist/resolve/main/fashion_mnist/test-00000-of-00001.parquet')"><?PHP print_intitule("text_exemple_fashionmnist");  ?></p>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/nielsr/CelebA-faces/resolve/main/data/train-00000-of-00003.parquet')"><?PHP print_intitule("text_exemple_celeba");  ?></p>
                            <p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/uoft-cs/cifar10/resolve/main/plain_text/test-00000-of-00001.parquet')"><?PHP print_intitule("text_exemple_cifar10");  ?></p>
                            <p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/jxie/flickr8k/resolve/main/data/train-00000-of-00002-2f8f6bfa852eac4b.parquet')"><?PHP print_intitule("text_exemple_flickr8k");  ?></p>


							<hr />
							<h4><?PHP print_intitule("label_text_processing");  ?></h4>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/Puch/children-stories-final/resolve/main/combined_df_cleaned.csv')"><?PHP print_intitule("text_exemple_children_stories");  ?></p>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/razmanitra/recettes-dataset/resolve/main/data/train-00000-of-00001.parquet')"><?PHP print_intitule("text_exemple_recipe");  ?></p>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/shahules786/PoetryFoundationData/resolve/main/data/train-00000-of-00001-486832872ed96d17.parquet')"><?PHP print_intitule("text_exemple_poems");  ?></p>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/gustavecortal/diverse_french_news/resolve/main/summarization_test.csv')"><?PHP print_intitule("text_exemple_french_news");  ?></p>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/jahjinx/IMDb_movie_reviews/resolve/main/IMDB_test.csv')"><?PHP print_intitule("text_exemple_critics");  ?></p>
							<p class="pointer" onclick="table_organizer.select_url('https://huggingface.co/datasets/fancyzhx/ag_news/resolve/main/data/train-00000-of-00001.parquet')"><?PHP print_intitule("text_exemple_news");  ?></p>



						</div>

						<h3><?PHP print_intitule("tab_load_external_data");  ?></h3>


						<div id="zone_load_url">
							<div class='wbto_meta'>
								<table>
									<tr><td><label>url : </label></td>
									<td><input name='wbto_url' placeholder=".csv .parquet"> &nbsp
									<button name='wbto_meta_upload' value='valider' onclick='table_organizer.clique_switch();'><?PHP print_intitule("button_validate");  ?> </button></td></tr>
								</table>
							</div>
						</div>

					</div>

				</div>

                <!-- POPUPS dessine formulaire et split taleau-->
                <div id="zone_load_array">
                    <div class='wbto_meta'>
                        <table>
                            <tr><td><label><?PHP print_intitule("label_nb_col");  ?> : </label></td><td><input name='wbto_array_nb_col' value='10'></tr>
                            <tr><td><label><?PHP print_intitule("label_nb_lines");  ?> : </label></td><td><input name='wbto_array_nb_rows' value='10'></tr>
                            <tr><td><label><?PHP print_intitule("label_type");  ?> : </label></td><td><select name='wbto_array_type' ><?PHP print_liste ("column_types", "num")  ?></select></tr>
                            <tr><td><label><?PHP print_intitule("label_normalize");  ?> : </label></td><td><select name='wbto_array_normalize' > <?PHP print_liste ("oui_non", "false")  ?>  </select></tr>
                            <tr><td><label><?PHP print_intitule("label_normalization_range");  ?>: </label></td><td><input name='wbto_array_normalization_range' value='0:1'></tr>
                            <tr><td colspan='2'><button name='wbto_meta_upload_pq' value='valider' onclick='table_organizer.clique_upload_array();'><?PHP print_intitule("button_validate");  ?> </button></td></tr>
                        </table>
                    </div>
                </div>

                <div id="zone_split_tableau">
                    <?PHP print_intitule("text_split_tableau");  ?><br><br>
                    <input id="split_tableau" value="" title="diviser les données en plusieurs tenseurs" placeholder="ex. 1/2 or */10"><br><br>
                    <button onclick="table_organizer.popup_split_tableau.dialog('close');">OK</button>
                </div>
				
				<!------------------------------------- TRAITEMENT DES DATA ------------------------------------------------------------------>
				<div id="zone_traite_data" class="console">

					<div id="zone_generation">


						<table class="barre_icones"><tr>
							<td><img  src="IMG/icones_grandes/download2.png" class="pointer icone" style="height:32px;width:32px" title="<?PHP print_intitule("button_load_data");  ?>" onclick="table_organizer.ouvre_popup_load();"/></td>
							<td><img  src="IMG/icones_grandes/matrice.png" class="pointer icone" style="height:32px;width:32px" title="<?PHP print_intitule("button_generate_tensors");  ?>" onclick="table_organizer.clique_generer_tenseurs();"/></td>
							<td><img  src="IMG/icones_grandes/cut.png" class="pointer icone" style="height:32px;width:32px" title="<?PHP print_intitule("button_split_tableau");  ?>" onclick="table_organizer.ouvre_popup_split_tableau();"/></td>
							<td><img src="IMG/icones_grandes/table_design.png" onclick="table_organizer.ouvre_popup_table_design()" title="<?PHP print_intitule("button_generate_form_data");  ?>" class="pointer icone"/></td>

						</tr></table>
						<br>
					</div>

					<div id="progression_x">
						<div id="progression_x_bar"></div>
						<div class="progress-label"></div>
					</div>

					<div id="affiche_log"><img class="pointer icone" src="IMG/icones_grandes/arrow_down.png" onclick="table_organizer.toogle_log()" title="<?PHP print_intitule("button_details");  ?>"/></div>

					<div id="log_charge_x"></div>
					
					<div id="zone_charge_image_x" >
						<img src="" onload="table_organizer.img_2_tensor_onload(this);">
					</div>
				</div>

				<div id="zone_tableau"></div>

				
			</div>

		<!------------------------------------- TENSEURS GéNéRéS ------------------------------------------------------------------>
			<div class="wb_menu_main_div" name="wb_tenseurs" id="menu_tenseurs">
				<div id="zone_visualise_data">

					<div id="zone_compile">
						<ul>
							<li><a href="#zone_x_y"><?PHP print_intitule("tab_tensors_synthesis");  ?></a></li>
							<li><a href="#zone_x_y_img"><?PHP print_intitule("tab_tensors_details");  ?></a></li>
						</ul>
						<div id="zone_x_y"></div>
						<div id="zone_x_y_img">
							<div id="zone_x_y_img_form">
								<?PHP print_intitule("label_show");  ?> <input value='10' name='nb'> <?PHP print_intitule("label_records_from");  ?> <input value='0' name='start'>
								<button onclick='table_organizer.affiche_elem_tenseurs(null,null)'><?PHP print_intitule("button_refresh_list");  ?></button>
							</div>
							<div id="zone_x_y_img_container" class='wbto_x_y_visualiseur'>


							</div>

						</div>
					</div>

				</div>

			</div>


		<!------------------------------------- MODEL ORGANIZER (model) ------------------------------------------------------------------>
			<div class="wb_menu_main_div" name="wb_model" id="menu_model"> 
				 <ul>
					<li><a href="#zone_model"><?PHP print_intitule("tab_model_design");  ?></a></li>
					<li><a href="#zone_info_modele"><?PHP print_intitule("tab_model_details");  ?></a></li>
				</ul>
				
				
				
				
			<!------------------------------------- Conception du modèle ------------------------------------------------------------------>	
			
			<div id="zone_model" > gestion modele</div>
			
			<!------------------------------------- Charger  un modèle ------------------------------------------------------------------>
			
			<div id="zone_info_modele_load">
                <table class="barre_icones"><tr>
                    <td class="icone"><img src="IMG/icones_grandes/download2.png" class="pointer icone" title="<?PHP print_intitule("button_upload_models");  ?>" onclick="model_organizer.ferme_popup_load(); wb_menu_main.clique('wb_database');"/></td>
                    <td class="icone"><img src="IMG/icones_grandes/arrow_refresh.png" class="pointer icone" title="<?PHP print_intitule("button_refresh_list");  ?>" onclick="model_organizer.refresh_models();"/></td>
                    <td><p class="loading">&nbsp;</p></td>
                    <td><label for="bool_load_weights"><?PHP print_intitule("label_load_weights");  ?></label> <input type="checkbox" checked id="bool_load_weights"/></td>
                    <td><label for="bool_load_ema"><?PHP print_intitule("label_load_ema");  ?></label> <input type="checkbox" id="bool_load_ema"/></td>
                    <td>&nbsp;</td>
                </tr></table>

                <div id="zone_info_modele_load_accordion">

				<h3><?PHP print_intitule("tab_load_saved_models");  ?></h3>
				<div id="zone_load_models_perso">

					<div class="list_models">

					</div>
				</div>

				<h3><?PHP print_intitule("tab_load_models_exemples");  ?></h3>
				<div id="zone_load_models_exemples">
                    <h4><?PHP print_intitule("label_classification_regression");  ?></h4>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/titanic/model.json')"><?PHP print_intitule("text_exemple_titanic_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/boston_housing/model.json')"><?PHP print_intitule("text_exemple_boston_housing_model");  ?></p>


                    <hr />
                    <h4><?PHP print_intitule("label_images_processing");  ?></h4>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/classification_fashionmnist/model.json')"><?PHP print_intitule("text_exemple_classification_fashionmnist_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/autoencoder_fashionmnist/model.json')"><?PHP print_intitule("text_exemple_autoencoder_fashionmnist_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/autoencoder_celeba/model.json')"><?PHP print_intitule("text_exemple_autoencoder_celeba_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/vae_fashionmnist/model.json')"><?PHP print_intitule("text_exemple_vae_fashionmnist_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/vae_celeba/model.json')"><?PHP print_intitule("text_exemple_vae_celeba_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/vae_gen_fashionmnist/model.json')"><?PHP print_intitule("text_exemple_vae_gen_fashionmnist_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/vae_gen_celeba/model.json')"><?PHP print_intitule("text_exemple_vae_gen_celeba_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/diffusion_fashionmnist/model.json')"><?PHP print_intitule("text_exemple_diffusion_fashionmnist_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/diffusion_celeba/model.json')"><?PHP print_intitule("text_exemple_diffusion_celeba_model");  ?></p>


                    <hr />
                    <h4><?PHP print_intitule("label_text_processing");  ?></h4>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/classification_rnn_news/model.json')"><?PHP print_intitule("text_exemple_classification_rnn_news_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/lstm_generation_storytales/model.json')"><?PHP print_intitule("text_exemple_lstm_generation_storytales_model");  ?></p>
                    <p class="pointer" onclick="model_organizer.load_model('exemple_models/transformer_2_4_storytales/model.json')"><?PHP print_intitule("text_exemple_transformer_2_4_storytales_model");  ?></p>


				</div>

				<h3><?PHP print_intitule("tab_load_external_models");  ?></h3>
				<div id="zone_load_models_ext">
					<table></table><tr><td><label> <?PHP print_intitule("label_url");  ?> : </label></td><td> <input id="file_load_model" value=""></input></td><td> <button onclick="model_organizer.load_model('');"><?PHP print_intitule("button_validate");  ?> </button></td></tr></table>
				</div>

                </div>
			</div>

			<!------------------------------------- sauvegarder un modèle ------------------------------------------------------------------>

			<div id="zone_info_modele_sauv">
				<table><tr><td><label> <?PHP print_intitule("button_model_name");  ?> : </label></td><td><input id="file_save_model" value="nom_de_votre_modele"></input></td><td><button onclick="model_organizer.save_model();"><?PHP print_intitule("button_validate");  ?></button></td><td><p class="loading">&nbsp;</p></td></tr>
				<tr><td><label for="bool_save_ema"><?PHP print_intitule("label_save_ema");  ?></label><input type="checkbox" id="bool_save_ema"/></td> <td>&nbsp;</td> <td>&nbsp;</td>   </tr>
				</table>
				<div class="list_models">

				</div>

			</div>

			<!------------------------------------- Détails du modèle généré ------------------------------------------------------------------>
            <div id="zone_info_modele"> 

                   	<h2><?PHP print_intitule("label_model_synthesis");  ?></h2>
                    <pre id="zone_info_modele_synthese" style="font-family: monospace;"> </pre>
					<h2><?PHP print_intitule("label_model_settings");  ?></h2>
                    <div id="zone_info_modele_parametres"> </div>

            </div>
			
			</div>
			

			<!------------------------------------- LIENS MODELE - DATA ------------------------------------------------------------------>
			 <div class="wb_menu_main_div" name="wb_lnk_data_model" id="wb_lnk_data_model"> 
				<div id="zone_lnk_formulaire">

				</div>
				<div id="zone_lnk_inputs" class="wblnk_in_out"></div>
				<div id="zone_lnk_outputs" class="wblnk_in_out"></div>
			
			</div>
			
			<!------------------------------------- TRAINING ------------------------------------------------------------------>
            <div id="zone_training_main" class="wb_menu_main_div console" name="wb_cog_go">
				<table style="width: 100%"><tr>
					<td style="width:45%">
                    <div id="zone_training"></div>
					</td><td>
                    <div id='zone_training_progression'> 
						<div id="training_progressbar">
							<div class="progress-label"></div>
						</div>
						<div id="training_progressbar_batch">
							<div class="progress-label"></div> 
						</div>
					</div>

				</td>
				</tr></table>
				<div id='zone_training_monitoring'> </div>
            </div>     

			<!------------------------------------- PREDICT ------------------------------------------------------------------>
            <div class="wb_menu_main_div" name="wb_horoscope"> 
				<div id="zone_predictions_form"></div>
				<div id="zone_predictions_resultat"></div>
			
			</div>
			
			<!------------------------------------- VISUALISATION ------------------------------------------------------------------>
			<div class="wb_menu_main_div" name="wb_node">
				<div id="zone_explore_modele"> 
                    <ul>
                        <li><a href="#zone_explore_modele_poids"><?PHP print_intitule("tab_weights");  ?></a></li>
						<!--<li><a href="#zone_explore_modele_modif_poids"><?PHP print_intitule("tab_weights_modifications");  ?></a></li> -->
                        <li><a href="#zone_explore_modele_sorties"><?PHP print_intitule("tab_layers_outputs");  ?></a></li>
                    </ul>
                   
                    <div id="zone_explore_modele_poids">
						<button onclick="drawings.draw_weights ($('#canvas_weights').get(0), model_organizer.get_weights(), {});"><?PHP print_intitule("button_weights");  ?></button> &nbsp;
						<button onclick="drawings.affiche_form_select_layers ();"  ><?PHP print_intitule("button_affiche_form_select_layers");  ?></button>
						<!--
						<button onclick="drawings.draw_weights_history ($('#canvas_weights').get(0), 0);"><?PHP print_intitule("button_weights_history");  ?> </button>
						<button onclick="chef_orchestre.weights_history_pause();"><?PHP print_intitule("button_pause");  ?> </button>
						-->
						<canvas id="canvas_weights" width="1500" height="10000"></canvas>
						<br><br><br>
					</div>
                    <!--
					<div id="zone_explore_modele_modif_poids">
						<button onclick="drawings.draw_weights_modif_history ($('#canvas_modif_weights').get(0),[], 0);"><?PHP print_intitule("button_weights_modifications");  ?> </button>
						<canvas id="canvas_modif_weights" width="1500" height="3000"></canvas>
					</div>
                    -->
					
                    <div id="zone_explore_modele_sorties">
						<button onclick="drawings.draw_outputs ($('#canvas_outputs').get(0), $('#div_outputs').get(0), {});"><?PHP print_intitule("button_layers_outputs");  ?> </button>&nbsp;
						<button onclick="drawings.affiche_form_select_layers ();"  ><?PHP print_intitule("button_affiche_form_select_layers");  ?></button>
						<!--<canvas id="canvas_outputs" width="1500" height="3000"></canvas>-->
						<div id="div_outputs" width="1500" height="3000"></div>

					</div>
					
                </div>

			</div>

            <!------------------------------------- TOKENIZERS------------------------------------------------------------------>
            <div class="wb_menu_main_div" name="wb_tokenizers">
            <div id="zone_tab_tokenizers">

                <ul>
                    <li><a href="#zone_tk_tokenizer"><?PHP print_intitule("tab_tk_tokenizers");  ?></a></li>
                    <li><a href="#zone_tk_embeddings"><?PHP print_intitule("tab_tk_embeddings");  ?></a></li>
                </ul>

                <div id="zone_tk_tokenizer">

                    <button onclick="affiche_tokenizers()"><?PHP print_intitule("button_tokenizers");  ?></button><br>
                    <div id="zone_tokenizers">

                    </div>
                    <br/>

                    <textarea id="tokenizer_query"></textarea>
                    <br/>
                    <select id="tokenizer_type_query"><option value="encode">encode</option><option value="decode">decode</option></select>
                    <select id="select_tokenizer"></select>
                    <button onclick="query_tokenizer()"><?PHP print_intitule("button_tokenizer_query");  ?></button>
                    <br/>

                    <div id="tokenizer_reponse">

                    </div>
                </div>

                <div id="zone_tk_embeddings">

                    <div id="zone_tk_embeddings_form">
                        tokenizer : <select id="select_tokenizer_embeddings"></select>
                        <button onclick="affiche_tokenizers();"><?PHP print_intitule("button_refresh_list");  ?></button><br>
                        embedding layer : <select id="select_embeddings_layer"></select>
                        <button onclick="refresh_embeddings_form();"><?PHP print_intitule("button_refresh_list");  ?></button><br>
                        from token <input id="from_token"> to <input id="to_token">
                        <label for="bool_one_hot_embeddings">one hot</label><input type="checkbox" id="bool_one_hot_embeddings"><br>
                        <button onclick="clique_genere_embeddings();"><?PHP print_intitule("button_refresh_list");  ?></button>
                        <div id="progression_embeddings"></div>


                    </div>
                    <div id="zone_tk_embeddings_result">

                    </div>

                </div>
            </div>
            </div>

			<!------------------------------------- TFJS ------------------------------------------------------------------>
			<div class="wb_menu_main_div" name="wb_tf">
				<div id="zone_tf">
					<ul>
						<li><a href="#zone_tf_memory"><?PHP print_intitule("tab_memory_usage");  ?></a></li>
						<li><a href="#zone_tf_env"><?PHP print_intitule("tab_environment");  ?></a></li>
						<li><a href="#zone_tf_var"><?PHP print_intitule("tab_variables");  ?></a></li>
					</ul>

					<div id="zone_tf_memory">
						<button onclick="tf_organizer.memory({})"><?PHP print_intitule("button_refresh_list");  ?></button>
						<div id="zone_tf_memory_result">

						</div>
					</div>

					<div id="zone_tf_env">
						<button onclick="tf_organizer.affiche_env()"><?PHP print_intitule("button_refresh_list");  ?></button>
						<div id="zone_tf_env_result">

						</div>
					</div>

                    <div id="zone_tf_var">
                        <button onclick="tf_organizer.affiche_var()"><?PHP print_intitule("button_refresh_list");  ?></button>
                        <div id="zone_tf_var_result">

                        </div>
                    </div>

				</div>

			</div>
			<!------------------------------------- fin des menus ------------------------------------------------------------------>


        </div>



        <div id="wb_foot">


        </div>

        <div id="wb_dialog">


        </div>

		<div id="popup_user">


		</div>
            

    </body>
</html>

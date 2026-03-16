
var glob_listes={};
var glob_intitules={};


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// INTITULES

//glob_get_intitule("alert_file_exists", {"%nom_fichier":nom_fichier})
//glob_get_intitule("alert_file_exists")
// généralités
glob_intitules["alert_change_langue"]={fr : "Attention, vous allez perdre les données non enregistrées. Voulez-vous continuer ? ", en : "You will lose unsaved data. Do you want to continue ? "}
glob_intitules["alert_please_connect_model"]={fr : "<a href='%url'>connectez-vous</a> pour charger ou sauvegarder vos propres modèles", en : "<a href='%url'>please connect</a> to load or save your own models"}
glob_intitules["alert_please_connect_data"]={fr : "<a href='%url'>connectez-vous</a> pour charger ou uploader vos données d'entrainement personnelles", en : "<a href='%url'>please connect</a> to load or upload your personnal training data"}
glob_intitules["alert_unhandled_error"]={fr : "Une erreur inattendue est survenue : %message", en : "an unhandled error occured : %message"}





// data_organizer
glob_intitules["alert_file_exists"]={fr : "%nom_fichier existe déjà. Voulez-vous le remplacer ? ", en : "%nom_fichier already exists. Do you want to replace it ?"}
glob_intitules["alert_file_upload_impossible"]={fr : "impossible d'uploader le fichier : %erreur", en : "file upload impossible : %erreur"}
glob_intitules["alert_impossible_load_datalist"]={fr : "impossible de charger la liste des données", en : "impossible to load the data list"}
glob_intitules["alert_impossible_load_user_size"]={fr : "impossible de charger l'espace occupé", en : "impossible to load remaining space"}
glob_intitules["label_edit"]={fr : "éditer", en : "edit"}
glob_intitules["label_delete"]={fr : "supprimer", en : "delete"}
glob_intitules["label_download_json"]={fr : "télécharger le fichier .json", en : "download the .json file"}
glob_intitules["label_download_bin"]={fr : "télécharger le fichier .bin", en : "download the .bin file"}
glob_intitules["alert_confirm_delete_file"]={fr : "voulez-vous vraiment supprimer %nom ?", en : "do you realy want to delete %nom ?"}
glob_intitules["alert_error_connexion"]={fr : "impossible de se connecter à %url", en : "impossible to connect to %url"}
glob_intitules["alert_file_already_exists"]={fr : "%nom existe déjà", en : "%nom already exists"}
glob_intitules["label_new_name"]={fr : "nouveau nom : ", en : "new name : "}
glob_intitules["label_commentaire_edit"]={fr : "voir ou modifier le commentaire", en : "see or edit comment"}
glob_intitules["xxx"]={fr : "", en : ""}


// lnk_data_model
glob_intitules["button_refresh_links"]={fr : "actualiser les entrées et sorties", en : "refresh inputs/outputs"}
glob_intitules["button_create_links"]={fr : "associer les données aux entrées et sorties", en : "link data to inputs and outputs"}
glob_intitules["text_links_done"]={fr : "les données ont été associées aux entrées et sorties du modèle", en : "data were linked to inputs and outputs of the model"}
glob_intitules["button_start_training"]={fr : "commencer l'entrainement", en : "start training"}
glob_intitules["button_test_model"]={fr : "tester le modèle", en : "test the model"}
glob_intitules["alert_no_data_linked"]={fr : "aucune donnée n'est associée à l'entrée/sortie", en : "no data lonked to input/output"}
glob_intitules["label_layer"]={fr : "couche", en : "layer"}
glob_intitules["label_add_one_data"]={fr : "ajouter un tenseur", en : "add one tensor"}
glob_intitules["label_add_several_data"]={fr : "ajouter plusieurs tenseurs", en : "add several tensors"}

// model_organizer
glob_intitules["button_load_model"]={fr : "charger un modèle", en : "load a model"}
glob_intitules["button_save_model"]={fr : "enregistrer le modèle actuel", en : "record actual model"}
glob_intitules["button_fix_weights_layers"]={fr : "gérer les poids des couches", en : "manage layers weights"}
glob_intitules["button_generate_model"]={fr : "générer le modèle", en : "build model"}
glob_intitules["button_infos"]={fr : "infos", en : "information"}
glob_intitules["button_add_layer"]={fr : "ajouter une couche", en : "add layer"}
glob_intitules["button_mode_down_layers"]={fr : "descendre tout", en : "move down everything"}
glob_intitules["button_move_up_layers"]={fr : "monter tout", en : "move up everything"}
glob_intitules["label_optimizer"]={fr : "optimiseur", en : "optimizer"}
glob_intitules["label_learning_rate"]={fr : "learning rate (taux d'apprentissage)", en : "learning rate"}
glob_intitules["label_metric"]={fr : "métrique", en : "metric"}
glob_intitules["label_activation"]={fr : "activation", en : "activation"}
glob_intitules["label_filters"]={fr : "filtres", en : "filters"}
glob_intitules["label_size"]={fr : "taille", en : "size"}
glob_intitules["label_units"]={fr : "neurones", en : "units"}
glob_intitules["label_loss"]={fr : "perte", en : "loss"}
glob_intitules["label_type"]={fr : "type", en : "type"}
glob_intitules["label_nb_units"]={fr : "nb. de neurones", en : "nb. units"}
glob_intitules["label_nb_convolution"]={fr : "nb. de filtres de convolution", en : "nb. convolution filters"}
glob_intitules["label_kernel_size"]={fr : "taille du kernel", en : "kernel_size"}
glob_intitules["label_strides_size"]={fr : "taille des strides", en : "strides size"}
glob_intitules["label_nb_categories"]={fr : "nb. de catégories", en : "nb. of categories"}
glob_intitules["label_use_bias"]={fr : "utiliser un biais", en : "use bias"}
glob_intitules["label_trainable_layer"]={fr : "couche entrainable", en : "trainable layer"}
glob_intitules["label_reload_weights"]={fr : "recharger les poids", en : "reload weights"}
glob_intitules["label_output_layer"]={fr : "couche de sortie", en : "output layer"}
glob_intitules["button_validate"]={fr : "valider", en : "validate"}
glob_intitules["alert_create_layer"]={fr : "impossible de créer la couche %idx. le type %type est inconnu", en : "unable to create layer %idx. type %type unknown"}
glob_intitules["label_build_done"]={fr : "le modèle a été compilé avec succès", en : "model was successfully built"}
glob_intitules["button_update_model"]={fr : "modifier le modèle", en : "update model"}
glob_intitules["button_show_details"]={fr : "afficher les détails", en : "show details"}
glob_intitules["alert_delete_layer"]={fr : "voulez-vous supprimer cette couche et les liens associés ?", en : "do you want to delete this layer and the related links ?"}
glob_intitules["alert_model_recorded"]={fr : "modèle sauvegardé", en : "model recorded"}
glob_intitules["alert_url_unreachable"]={fr : "impossible de télécharger %url", en : "%url unreachable"}
glob_intitules["alert_load_model_error"]={fr : "la métode load() a retourné %nb_layers couches mais seules %nb_layers_displayed peuvent être affichées", en : "method load() returned %nb_layers layers but only %nb_layers_displayed can be displayed"}
glob_intitules["alert_unable_load_weights"]={fr : "impossible de recharcher les poids de la couche %idx_layer", en : "unable to reloads weights of layer %idx_layer"}
glob_intitules["text_note_poids"]={fr : "En fixant le poids des couches, vous avez la possibilité de conserver les poids de tout ou partie des couches du modèle, même après l'avoir modifié et recompilé..<br><br>Lorsque vous compilez un modèle, les poids (weights) des différentes couches (layers) sont normalement réinitialisé.<br><br>En fixant les poids des couches d'un modèle (après l'avoir entrainé), vous enregistrez les poids au niveau de chaque couche. Vous pouvez ensuite supprimer / ajouter / modifier des couches du modèle, puis le recompiler, les poids pourront être conservés.<br><br>Au niveau de chaque couche dont vous voulez conserver les poids, vous devrez ensuite mettre l'option 'recharger les poids' sur 'oui'.<br><br>Cela ne fonctionne pas si vous avez changé le nombre de paramètres d'une couche.<br><br>\n", en : "By fixing the weights of the layers, you have the ability to retain the weights of all or part of the model's layers, even after modifying and recompiling it.<br><br>When you compile a model, the weights of the different layers are normally reset.<br><br>By fixing the weights of a model's layers (after training it), you save the weights at each layer. You can then delete/add/modify layers of the model and recompile it, and the weights can be reloaded.<br><br>For each layer whose wheigts you want to fix, you will then need to set the 'reload weights' option to 'yes'.<br><br>This does not work if you have changed the number of parameters in a layer.<br><br>"}
glob_intitules["text_waiting_model_compile"]={fr : "<P>Le réseau est en train d'être généré. Cela peut prendre un peu de temps et utiliser beaucoup de ressources.</p> <P>Il est possible que votre navigateur vous signale qu'un script ralentit le système. <b><u>Ne l'interrompez pas</u></b></p>", en : "<p>The network is being generated. This may take some time and use a lot of resources.</p>\n <p>Your browser might alert you that a script is slowing down the system. <b><u>Do not interrupt it</u></b></p>\n"}
glob_intitules["alert_unable_fix_weights"]={fr : "impossible de fixer le poids de la couche %idx_layer : %error", en : "unable to fix weights of layer %idx_layer : %error"}
glob_intitules["alert_fix_weights_done"]={fr : "OK", en : "OK"}
glob_intitules["alert_model_layer_mismatch"]={fr : "impossible de faire correspondre la couche %layer_name", en : "can't match layer %layer_name"}
glob_intitules["label_without_weights"]={fr : "sans poids", en : "no weights"}
glob_intitules["button_lot_affiche_form"]={fr : "modifier en une fois les propriétés de plusieurs couches", en : "change once the properties of several layers"}
glob_intitules["label_working_model"]={fr : "modèle de travail", en : "working model"}
glob_intitules["label_model_copy"]={fr : "copie", en : "copy"}
glob_intitules["label_working_2_copy"]={fr : "faire une copie des poids du modèle de travail", en : "copy working model's weights"}
glob_intitules["label_copy_2_working"]={fr : "restaurer les poids copiés dans le modèle de travail", en : "restore copied weights into working model"}
glob_intitules["label_switch_weights"]={fr : "interverir les poids du modèle de travail et les poids copiés", en : "switch working models's weights and copied weights"}
glob_intitules["alert_confirm_copy_weights"]={fr : "les poids seront écrasés. Confirmez-vous ?", en : "weights will be overwritten. Do you confirm ?"}
glob_intitules["label_weights_explanation"]={fr : "Vous pouvez effectuer une copie des poids du modèle actuel.<br> Cette copie peut être utilisée pour un <a href='https://en.wikipedia.org/wiki/Moving_average' target='_blank'>EMA</a> ou pour réutiliser les poids d'un modèle déjà entrainé après l'avoir modifié.<br> Vous pouvez à l'inverse restaurer les poids copiés dans le modèle actuel. ATTENTION si vous souhaitez ne modifier que les poids de certaines couches, vous devez recompiler le modèle en utilisant l'option 'recharger les poids' pour les couches en question.<br> Enfin vous pouvez intervertir les poids du modèle et les poids copiés", en : "You can make a copy of the weights of the current model.<br> This copy can be used for an <a href='https://en.wikipedia.org/wiki/Moving_average' target='_blank'>EMA</a> or to reuse the weights of a model that has already been trained after modification.<br> Conversely, you can restore the copied weights to the current model. WARNING: If you only want to modify the weights of certain layers, you must recompile the model using the 'reload weights' option for those layers.<br> Finally, you can switch the model's weights with the copied weights."}
glob_intitules["xxx"]={fr : "", en : ""}
glob_intitules["xxx"]={fr : "", en : ""}
glob_intitules["xxx"]={fr : "", en : ""}

// predictions_organizer
glob_intitules["button_refresh_form"]={fr : "actualiser le formulaire", en : "refesh form"}
glob_intitules["button_make_prediction"]={fr : "faire une prédiction", en : "make a prediction"}
glob_intitules["alert_no_such_layer"]={fr : "auvune couche avec le nom %nom", en : "no layer with name %nom"}
glob_intitules["alert_format_not_handled1"]={fr : "format non géré (plusieurs tokens avec one hot)", en : "unmanaged format (multiple tokens with one hot)"}
glob_intitules["alert_format_not_handled2"]={fr : "format non géré (plusieurs tokens sans one hot)", en : "unmanaged format (multiple tokens without one hot)"}
glob_intitules["alert_format_not_handled3"]={fr : "format non géré (un seul token sans one hot)", en : "unmanaged format (one token without one hot)"}
glob_intitules["label_predict_on_change"]={fr : "actualiser la prédiction à chaque modification", en : "update prediction on form change"}
glob_intitules["button_genere_tenseur_image_bruitee"]={fr : "Générer du bruit", en : "create noise"}


// table_organizer
glob_intitules["label_select_data"]={fr : "sélectionnez vos données", en : "select data"}
glob_intitules["label_download"]={fr : "téléchargement", en : "download"}
glob_intitules["label_rows_downloaded"]={fr : "%nb_rows lignes téléchargées", en : "%nb_rows rows downloaded"}
glob_intitules["label_create_buffer"]={fr : "création du buffer...", en : "creating buffer..."}
glob_intitules["label_get_metadata"]={fr : "récupération des métadonnées", en : "getting metadata"}
glob_intitules["label_download_data"]={fr : "téléchargement des données", en : "downloading data"}
glob_intitules["label_processing_data"]={fr : "traitement", en : "processing"}
glob_intitules["label_done"]={fr : "terminé", en : "done"}
glob_intitules["label_dataframe_generation"]={fr : "génération du DataFrame", en : "DataFrame generation"}
glob_intitules["label_edit_column_properties"]={fr : "éditer les propriétés de cette colonne", en : "edit column properties"}
glob_intitules["label_min"]={fr : "minimum", en : "minimum"}
glob_intitules["label_max"]={fr : "maximum", en : "maximum"}
glob_intitules["label_mean"]={fr : "moyenne", en : "mean"}
glob_intitules["label_median"]={fr : "médiane", en : "median"}
glob_intitules["label_distinct"]={fr : "valeur distinctes", en : "distinct values"}
glob_intitules["label_name"]={fr : "nom", en : "name"}
glob_intitules["label_normalize"]={fr : "normalise", en : "normalize"}
glob_intitules["label_normalization_range"]={fr : "plage de normalisation (min:max)", en : "normalization range (min:max)"}
glob_intitules["label_default_value"]={fr : "valeur par défaut", en : "default value"}
glob_intitules["label_image_height"]={fr : "hauteur de l'image", en : "image height"}
glob_intitules["label_image_width"]={fr : "largeur de l'image", en : "image width"}
glob_intitules["label_image_channels"]={fr : "canaux", en : "channels"}
glob_intitules["label_image_format"]={fr : "format", en : "format"}
glob_intitules["label_generation_type"]={fr : "type de génération", en : "generation type"}
glob_intitules["label_tokenizer"]={fr : "tokenizer", en : "tokenizer"}
glob_intitules["label_vocabulary_size"]={fr : "taille maximale du vocabulaire", en : "maximum vocabulary size"}
glob_intitules["label_nb_tokens"]={fr : "taille du tenseur généré", en : "size of generated tensor"}
glob_intitules["label_convert_lowercase"]={fr : "convertir en minuscules", en : "convert to lowercase"}
glob_intitules["label_convert_one_hot"]={fr : "convertir en one hot", en : "convert to one hot"}
glob_intitules["label_convert_one_hot_a"]={fr : "convertir le 1er élément en one hot", en : "convert 1st element to one hot"}
glob_intitules["label_convert_one_hot_b"]={fr : "convertir le 2nd élement en one hot", en : "convert 2nd element to one hot"}
glob_intitules["label_nb_tokens_around"]={fr : "nb de tokens avant et après", en : "nb tokens before and after"}
glob_intitules["label_tokenizer_generation"]={fr : "génération du tokenizer (word tokenizer)", en : "tokenizer generation (word tokenizer)"}
glob_intitules["label_vocabulary_generation"]={fr : "génération du vocabulaire", en : "vocabulary generation"}
glob_intitules["label_data_preparation"]={fr : "préparation des données", en : "data preparation"}
glob_intitules["label_data_shuffle"]={fr : "mélange des données", en : "data shuffling"}
glob_intitules["label_column_deleted"]={fr : "colonne %nom_colonne supprimée", en : "column + %nom_colonne deleted"}
glob_intitules["label_default_value_set"]={fr : "colonne %nom_colonne : metre valeur défaut %defaut", en : "column %nom_colonne set default value %defaut"}
glob_intitules["alert_only_one_multitensors_text"]={fr : "vous ne pouvez pas avoir pluseiurs colonnes qui génèrent plusieurs tenseurs", en : "you can't have more than one column that generates multiple tensors"}
glob_intitules["label_empty_rows_deleted"]={fr : "suppression des lignes vides", en : "deleting empty rows"}
glob_intitules["label_data_generation_end"]={fr : "fin de la génération des données", en : "end of data generation"}
glob_intitules["label_processing_column"]={fr : "traitement de la colonne %nom_colonne", en : "processing column + %nom_colonne"}
glob_intitules["label_end_data_processing"]={fr : "les données ont été générées avec succès", en : "data were successfully processed"}
glob_intitules["button_show_result"]={fr : "voir le résultat", en : "show result"}
glob_intitules["text_note_tensors"]={fr : "Pour entrainer votre modèle, vous pouvez soit convertir vos données en <b>tenseurs</b> soit en <b>datasets</b>.<br><br> les <b>tenseurs</b> sont générés en une fois avant l'entrainement. Cela permet un entrainement plus rapide, mais occupe beaucoup plus de place en mémoire.<br><br> les <b>datasets</b> sont générés au fure et à mesure de l'entrainement. Ils occupent donc peu de place en mémoire. Mais comme ils doivent être générs à nouveau à chaque epoch, l'entrainement sera plus long.<br><br> utilisez des tenseurs si vos données sont de petite taille, et des datasets pour des données plus importantes. La limite entre les 2 dépendra de la mémoire disponible sur votre ordinateur.<br><br>", en : "To train your model, you can either convert your data into <b>tensors</b> or <b>datasets</b>.<br><br> <b>tensors</b> are generated all at once before training. This allows for faster training, but takes up much more memory space.<br><br> <b>datasets</b> are generated as training progresses. They therefore take up little memory space. But since they must be regenerated at each epoch, training will take longer.<br><br> Use tensors if your data is small, and datasets for larger data. The limit between the two will depend on the memory available on your computer.<br><br>"}
glob_intitules["label_show_less_details"]={fr : "afficher moins de détails", en : "show less details"}
glob_intitules["label_show_more_details"]={fr : "afficher plus de détails", en : "show more details"}
glob_intitules["label_tensors_details"]={fr : "tenseur %name de type %type de forme %shape de taille %size et de type %dtype", en : "tensor %name of type %type of shape %shape size %size and type %dtype"}
glob_intitules["label_cat_def_categories"]={fr : "définition des catégories (option)", en : "categories definition (option)"}
glob_intitules["label_image_url_base"]={fr : "url de base", en : "base url"}
glob_intitules["label_nb_tokens_generated"]={fr : "taille du tenseur généré (mots devinés)", en : "size of generated tensor (guessed words)"}
glob_intitules["label_text_limite_size"]={fr : "couper le texte à N tokens à partir du début", en : "cut text at N tokens from the start"}
glob_intitules["alert_max_affichage"]={fr : "vous ne pouvez afficher plus de %max éléments", en : "you can't display more than %max elements"}
glob_intitules["label_text_stride"]={fr : "stride (décalage)", en : "stride"}
glob_intitules["label_diffusion_nb_etapes"]={fr : "nb étapes de bruitage", en : "nb steps adding noise"}
glob_intitules["label_diffusion_nb_noise_per_img"]={fr : "nb d'images bruitées par image", en : "nb noisy images per image"}
glob_intitules["label_img_type_generation"]={fr : "type de génération", en : "generation type"}
glob_intitules["label_traitements"]={fr : "traitements...", en : "processing..."}
glob_intitules["xxx"]={fr : "", en : ""}
glob_intitules["xxx"]={fr : "", en : ""}
glob_intitules["xxx"]={fr : "", en : ""}


//glob_get_intitule("alert_file_exists", {"%nom_fichier":nom_fichier})
//glob_get_intitule("label_xxx")
//"+glob_get_intitule("label_xxx")+"
// training_organizer
glob_intitules["label_nb_epochs"]={fr : "nb. epochs", en : "nb. epochs"}
glob_intitules["label_batch_size"]={fr : "taille du batch", en : "batch size"}
glob_intitules["label_validation_split"]={fr : "part de validation", en : "validation split"}
glob_intitules["label_record_train_history"]={fr : "enregistrer l'évolution du modèle", en : "record model history"}
glob_intitules["label_training_done"]={fr : "entrainement terminé", en : "training done"}
glob_intitules["alert_training_already_running"]={fr : "l'entrainement est en cours et ne peut être interrompu", en : "training is already running and cannot be interrupted"}
glob_intitules["button_start_training"]={fr : "démarrer l'entrainement", en : "start training"}
glob_intitules["button_raz_training"]={fr : "réinitialiser le formulaire", en : "reset form"}
glob_intitules["xxx"]={fr : "", en : ""}
glob_intitules["xxx"]={fr : "", en : ""}

// user_organizer
glob_intitules["label_connexion"]={fr : "connexion", en : "log in"}
glob_intitules["label_mail"]={fr : "mail", en : "mail"}
glob_intitules["label_password"]={fr : "mot de passe", en : "password"}
glob_intitules["label_password_forgotten"]={fr : "mot de passe oublié", en : "password forgotten"}
glob_intitules["label_inscription"]={fr : "inscription", en : "registration"}
glob_intitules["label_update_informations"]={fr : "mettre à jour les informations", en : "update informations"}
glob_intitules["button_update"]={fr : "mettre à jour", en : "update"}
glob_intitules["button_deconnect"]={fr : "déconnexion", en : "log out"}
glob_intitules["label_delete_account"]={fr : "supprimer le compte", en : "delete account"}
glob_intitules["alert_connection_failed"]={fr : "la connexion a échoué", en : "connection failed"}
glob_intitules["alert_registration_successfull"]={fr : "Votre inscription a bien été prise en compte :-) Maintenant, connectez-vous avec vos identifiants", en : "Your registration was successfull ;-) Now, please log in with your new credentials"}
glob_intitules["alert_delete_account"]={fr : "voulez-vous supprimer ce compte et toutes les données associées", en : "do you realy want to delete this account and all associated data"}
glob_intitules["alert_account_deleted"]={fr : "la compte a été supprimé", en : "account deleted"}
glob_intitules["alert_prompt_mail"]={fr : "veuillez indiquer votre adresse mail", en : "please enter your mail address"}
glob_intitules["alert_mail_sent"]={fr : "un mail a été envoyé à %mail. Vérifiez bien les spams", en : "a mail was sent to %mail. Please check your spam folder"}
glob_intitules["xxx"]={fr : "", en : ""}
glob_intitules["xxx"]={fr : "", en : ""}
glob_intitules["xxx"]={fr : "", en : ""}
glob_intitules["xxx"]={fr : "", en : ""}

// tokenizers
glob_intitules["label_vocab_size"]={fr : "taille du vocabulaire", en : "vocabulary size"}
glob_intitules["label_no_tokenizer"]={fr : "aucun tokenizer utilisé", en : "no tokenizer used"}
glob_intitules["xxx"]={fr : "", en : ""}






///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// LISTES


/**
glob_listes["type_layer"]={
   dense : {fr : "couche dense", en : "dense layer"},
   conv2d :  {fr : "couche de convolution 2D", en : "2D convolution layer"},
   conv2dTranspose :  {fr : "couche de convolution 2D transposée", en : "2D tarnspose convolution layer"},
   maxPooling2d : {fr : "couche maxPool 2D", en : "2D maxPool layer"},
   softmax : {fr : "couche softmax", en : "softmax layer"},
   flatten : {fr : "couche flatten", en : "flatten layer"},
   reshape : {fr : "couche reshape", en : "reshape layer"},
   concatenate : {fr : "couche de concaténation", en : "concatenate layer"},
   wbSampling : {fr : "couche de sampling (VAE)", en : "sampling layer (VAE)"},
   input : {fr : "couche d'entrée", en : "input layer"},
};
**/

glob_listes["type_layer"]={
	input : {
		_label : {fr : "Entrée", en : "Input"},
		input : {fr : "couche d'entrée", en : "input layer"}
	},
	Basic : {
		_label : {fr : "Basique", en : "Basic"},
		dense : {fr : "dense", en : "dense"},
		activation : {fr : "activation", en : "activation"},
		dropout : {fr : "dropout", en : "dropout"},
		embedding : {fr : "embedding", en : "embedding"},
		flatten : {fr : "flatten (aplatir)", en : "flatten"},
		repeatVector : {fr : "repeatVector (répéter l'entrée)", en : "repeatVector"},
		permute : {fr : "permute", en : "permute"},
		reshape : {fr : "reshape (reformater)", en : "reshape"},
		spatialDropout1d : {fr : "spatialDropout1d", en : "spatialDropout1d"},
	},
	Activation : {
		_label : {fr : "Activation avancée", en : "Advanced activation"},
		elu : {fr : "elu", en : "elu"},
		leakyReLU : {fr : "leakyReLU", en : "leakyReLU"},
		prelu : {fr : "prelu", en : "prelu"},
		reLU : {fr : "reLU", en : "reLU"},
		softmax : {fr : "softmax", en : "softmax"},
		thresholdedReLU : {fr : "thresholdedReLU", en : "thresholdedReLU"},
		wbSwishLayer : {fr : "swich (toolkait)", en : "swich (toolkait)"}
	},
	Convolution : {
		_label : {fr : "Convolution", en : "Convolution"},
		conv1d : {fr : "conv1d", en : "conv1d"},
		conv2d : {fr : "conv2d", en : "conv2d"},
		conv2dTranspose : {fr : "conv2dTranspose", en : "conv2dTranspose"},
		conv3d : {fr : "conv3d", en : "conv3d"},
		cropping2D : {fr : "cropping2D", en : "cropping2D"},
		separableConv2d : {fr : "separableConv2d", en : "separableConv2d"},
		depthwiseConv2d : {fr : "depthwiseConv2d", en : "depthwiseConv2d"},
		upSampling2d : {fr : "upSampling2d", en : "upSampling2d"},
	},
	Merge : {
		_label : {fr : "Merge (fusionner)", en : "Merge"},
		add : {fr : "add", en : "add"},
		average : {fr : "average", en : "average"},
		concatenate : {fr : "concatenate", en : "concatenate"},
		dot : {fr : "dot", en : "dot"},
		maximum : {fr : "maximum", en : "maximum"},
		minimum : {fr : "minimum", en : "minimum"},
		multiply : {fr : "multiply", en : "multiply"},
	},
	Normalization : {
		_label : {fr : "Normalisation", en : "Normalization"},
		batchNormalization : {fr : "batchNormalization", en : "batchNormalization"},
		layerNormalization : {fr : "layerNormalization", en : "layerNormalization"},
	},
	Pooling : {
		_label : {fr : "Pooling (regroupement)", en : "Pooling"},
		averagePooling1d : {fr : "averagePooling1d", en : "averagePooling1d"},
		averagePooling2d : {fr : "averagePooling2d", en : "averagePooling2d"},
		averagePooling3d : {fr : "averagePooling3d", en : "averagePooling3d"},
		globalAveragePooling1d : {fr : "globalAveragePooling1d", en : "globalAveragePooling1d"},
		globalAveragePooling2d : {fr : "globalAveragePooling2d", en : "globalAveragePooling2d"},
		globalMaxPooling1d : {fr : "globalMaxPooling1d", en : "globalMaxPooling1d"},
		globalMaxPooling2d : {fr : "globalMaxPooling2d", en : "globalMaxPooling2d"},
		maxPooling1d : {fr : "maxPooling1d", en : "maxPooling1d"},
		maxPooling2d : {fr : "maxPooling2d", en : "maxPooling2d"},
		maxPooling3d : {fr : "maxPooling3d", en : "maxPooling3d"},
	},
	Recurrent : {
		_label : {fr : "Récurrent", en : "Recurrent"},
		convLstm2d : {fr : "convLstm2d", en : "convLstm2d"},
		convLstm2dCell : {fr : "convLstm2dCell", en : "convLstm2dCell"},
		gru : {fr : "gru", en : "gru"},
		gruCell : {fr : "gruCell", en : "gruCell"},
		lstm : {fr : "lstm", en : "lstm"},
		lstmCell : {fr : "lstmCell", en : "lstmCell"},
		rnn : {fr : "rnn", en : "rnn"},
		simpleRNN : {fr : "simpleRNN", en : "simpleRNN"},
		simpleRNNCell : {fr : "simpleRNNCell", en : "simpleRNNCell"},
		stackedRNNCells : {fr : "stackedRNNCells", en : "stackedRNNCells"},
	},
	Wrapper : {
		_label : {fr : "Wrapper", en : "Wrapper"},
		bidirectional : {fr : "bidirectional", en : "bidirectional"},
		timeDistributed : {fr : "timeDistributed", en : "timeDistributed"},
	},
	Noise : {
		_label : {fr : "Noise (bruit)", en : "Noise"},
		alphaDropout : {fr : "alphaDropout", en : "alphaDropout"},
		gaussianDropout : {fr : "gaussianDropout", en : "gaussianDropout"},
		gaussianNoise : {fr : "gaussianNoise", en : "gaussianNoise"},
	},
	Misc : {
		_label : {fr : "Divers", en : "Misc"},
		zeroPadding2d : {fr : "zeroPadding2d", en : "zeroPadding2d"},
		masking : {fr : "masking", en : "masking"},
		rescaling : {fr : "rescaling", en : "rescaling"},
		centerCrop : {fr : "centerCrop", en : "centerCrop"},
		resizing : {fr : "resizing", en : "resizing"},
		categoryEncoding : {fr : "categoryEncoding", en : "categoryEncoding"},
		randomWidth : {fr : "randomWidth", en : "randomWidth"},
	},
	Toolkait : {
		_label : {fr : "Toolkait", en : "Toolkait"},
		wbSampling : {fr : "couche de sampling (VAE)", en : "sampling layer (VAE)"},
		wbNumber2OneHot : {fr : "entiers vers one hot", en : "integer to one hot"},
		wbAttentionWeights : {fr : "calcul des poids d'attention (transformer)", en : "attention weights (transformer)"},
		wbPositionalEncodingLayer : {fr : "encodage de position (transformer)", en : "positional encoding (transformer)"}, //wbSliceLayer
		//wbSliceLayer : {fr : "slice (trancher)", en : "slice"}, // => marche pas :(
		wbLastTokenLayer : {fr : "récupérer le dernier token (transformer)", en : "get last token (transformer)"},
		wbTimeEmbedding : {fr : "encodage temporel (diffusion)", en : "temporal encoding (diffusion)"},
	},
	
	
};




glob_listes["padding"]={
    valid : {fr : "valid"},
    same :  {fr : "same"},
    causal : {fr : "causal"},
};

glob_listes["activation_function"]={
    elu : {fr : "elu"},
    hardSigmoid : {fr : "hardSigmoid"},
    linear : {fr : "linear"},
    relu : {fr : "relu"},
    relu6 : {fr : "relu6"},
    selu : {fr : "selu"},
    sigmoid : {fr : "sigmoid"},
    softmax : {fr : "softmax"},
    softplus : {fr : "softplus"},
    softsign : {fr : "softsign"},
    tanh : {fr : "tanh"},
    swish : {fr : "swish"},
    mish : {fr : "mish"},
    gelu : {fr : "gelu"},
    gelu_new : {fr : "gelu_new"},

};

glob_listes["booleen"]={
    true : {fr : "oui", en : "yes"},
    false : {fr : "non", en : "no"},

};

glob_listes["optimizer"]={
    sgd : {fr : "sgd"},
    momentum : {fr : "momentum"},
    adagrad : {fr : "adagrad"},
    adadelta : {fr : "adadelta"},
    adam : {fr : "adam"},
    adamax : {fr : "adamax"},
    rmsprop : {fr : "rmsprop"},
};	
/**
glob_listes["loss"]={
	absoluteDifference : {fr : "absoluteDifference"},
	computeWeightedLoss : {fr : "computeWeightedLoss"},
	cosineDistance : {fr : "cosineDistance"},
	hingeLoss : {fr : "hingeLoss"},
	huberLoss : {fr : "huberLoss"},
	logLoss : {fr : "logLoss"},
	sigmoidCrossEntropy : {fr : "sigmoidCrossEntropy"},
	softmaxCrossEntropy : {fr : "softmaxCrossEntropy"},
    categoricalCrossentropy : {fr : "categoricalCrossentropy"},
    meanSquaredError : {fr : "meanSquaredError"},
    binaryAccuracy : {fr : "binaryAccuracy"},
    binaryCrossentropy : {fr : "binaryCrossentropy"},
    categoricalAccuracy : {fr : "categoricalAccuracy"},
    cosineProximity : {fr : "cosineProximity"},
    meanAbsoluteError : {fr : "meanAbsoluteError"},
    meanAbsolutePercentageError : {fr : "meanAbsolutePercentageError"},
    precision : {fr : "precision"},
    recall : {fr : "recall"},
    sparseCategoricalAccuracy : {fr : "sparseCategoricalAccuracy"},
};
**/

glob_listes["loss"]={
	meanSquaredError : {fr : "meanSquaredError"},
	meanAbsoluteError : {fr : "meanAbsoluteError"},
	meanAbsolutePercentageError : {fr : "meanAbsolutePercentageError"},
	meanSquaredLogarithmicError : {fr : "meanSquaredLogarithmicError"},
	squaredHinge : {fr : "squaredHinge"},
	hinge : {fr : "hinge"},
	categoricalHinge : {fr : "categoricalHinge"},
	logcosh : {fr : "meanSquaredError"},
	categoricalCrossentropy : {fr : "categoricalCrossentropy"},
	sparseCategoricalCrossentropy : {fr : "sparseCategoricalCrossentropy"},
	binaryCrossentropy : {fr : "binaryCrossentropy"},
	kullbackLeiblerDivergence : {fr : "kullbackLeiblerDivergence"},
	poisson : {fr : "poisson"},
	cosineProximity : {fr : "cosineProximity"},
	wb_weightedSigmoidCrossentropy : {fr : "sigmoidCrossentropy avec pondération"}
	
}

glob_listes["metrics"]={
    accuracy : {fr : "accuracy"},
	categoricalAccuracy : {fr : "categoricalAccuracy"},
	sparseCategoricalAccuracy : {fr : "sparseCategoricalAccuracy"},
	binaryAccuracy : {fr : "binaryAccuracy"},
	topkCategoricalAccuracy : {fr : "topkCategoricalAccuracy"},
	mse : {fr : "meanSquaredError", en : "meanSquaredError"},
	mae : {fr : "meanAbsoluteError", en : "meanAbsoluteError"},
	mape : {fr : "meanAbsolutePercentageError", en : "meanAbsolutePercentageError"},
	accuracy : {fr : "accuracy"},
	accuracy : {fr : "accuracy"},
	accuracy : {fr : "accuracy"},
	accuracy : {fr : "accuracy"},
	accuracy : {fr : "accuracy"},
};

glob_listes["Initializer"]={
    constant : {fr : "constant"},
	glorotNormal : {fr : "glorotNormal"},
	glorotUniform : {fr : "glorotUniform"},
	heNormal : {fr : "heNormal"},
	heUniform : {fr : "heUniform"},
	identity : {fr : "identity"},
	leCunNormal : {fr : "leCunNormal"},
	leCunUniform : {fr : "leCunUniform"},
	ones : {fr : "ones"},
	orthogonal : {fr : "orthogonal"},
	randomNormal : {fr : "randomNormal"},
	randomUniform : {fr : "randomUniform"},
	truncatedNormal : {fr : "truncatedNormal"},
	varianceScaling : {fr : "varianceScaling"},
	zeros : {fr : "zeros"},
};

glob_listes["Regularizer"]={
    l1l2 : {fr : "l1l2"},
};

glob_listes["Constraint"]={
    maxNorm : {fr : "maxNorm"},
	minMaxNorm : {fr : "minMaxNorm"},
	nonNeg : {fr : "nonNeg"},
	unitNorm : {fr : "unitNorm"},
};

glob_listes["dataFormat"]={
    channelsFirst : {fr : "channelsFirst"},
	channelsLast : {fr : "channelsLast"},
};

glob_listes["cell"]={
    todo : {fr : "non encore supporté"},
};

glob_listes["mergeMode"]={
    sum : {fr : "sum"},
	mul : {fr : "mul"},
	concat : {fr : "concat"},
	ave : {fr : "ave"},
};

glob_listes["interpolation"]={
    nearest : {fr : "nearest"},
	bilinear : {fr : "bilinear"},
};

glob_listes["outputMode"]={
    multiHot : {fr : "multiHot"},
	oneHot : {fr : "oneHot"},
	count : {fr : "count"},
};

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Liste table_organizer

glob_listes["column_type"]={
    void : {fr : "non utilisé", en : "not used"},
	num : {fr : "numérique", en : "numerical"},
	cat : {fr : "catégories", en : "categories"},
	img : {fr : "url d'une image", en : "image url"},
	img_bytes : {fr : "image", en : "image"},
	text : {fr : "texte", en : "text"},
};

glob_listes["img_channels"]={
    "1" : {fr : "nuance de gris", en:"greyscale"},
	"3" : {fr : "RGB", en:"RGB"},
	"4" : {fr : "RGBA", en:"RGBA"},
};

glob_listes["text_type_generation"]={
	"1_tensor" : {fr : "un seul tenseur", en:"one tensor only"},
	"guess_next" : {fr : "2 tenseurs (devinner le mot suivant - 1 seul mot)", en:"2 tensors (guess next word - 1 word)"},
	"guess_next_multi" : {fr : "2 tenseurs (deviner le mot suivant - pluseiurs mots)", en:"2 tensors (guess next word - several words)"},
	"guess_around" : {fr : "2 tenseurs (deviner les mots adjacents)", en:"2 tensors (guess around words)"},

};

glob_listes["img_type_generation"]={
	"1_tensor" : {fr : "un seul tenseur", en:"one tensor only"},
	"noise" : {fr : "3 tenseurs (image bruitée + bruit + étape)", en:"3 tensors (image with noise + noise + step)"},

};

glob_listes["record_model_history"]={
	never : {fr : "jamais", en:"never"},
	epoch : {fr : "à chaque epoch", en:"each epoch"},
	batch : {fr : "à chaque batch", en:"each batch"},

};

glob_listes["XXX"]={
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
};

glob_listes["XXX"]={
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
};

glob_listes["XXX"]={
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
};

glob_listes["XXX"]={
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
};

glob_listes["XXX"]={
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
};

glob_listes["XXX"]={
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
	XXX : {fr : "XXX", en:"XXX"},
};




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// FONCTIONS

function glob_get_intitule (code, variables={}) {
	let valeurs=glob_intitules[code];
	if (valeurs === undefined) {
		return(code);
	}
	let intitule=valeurs[glob_language];
	if (intitule === undefined || intitule === "") {
		intitule=valeurs[glob_default_language];
	}
	if (intitule === undefined || intitule === "") {
		intitule=code;
	}
	for (let nom_var in variables) {
		let val_var=variables[nom_var];
		intitule=intitule.replace(nom_var, val_var);
	}
	return(intitule);

}


function glob_get_liste_html (liste, selected, options={add_empty : true}) {
    let l=glob_listes[liste];
    let retour="<option value=''>-</option>"; // valeur vide
    if (liste === undefined) {
        return (retour);
    }
    if (options["add_empty"] == false) {
        retour="";
    }

    for (intitule in l) {
        let tmp=l[intitule];
        let str_selected="";
        if (intitule === selected) {
            str_selected=" selected ";
        }
        let valeur="";
        if (tmp[glob_language] !== undefined) {
            valeur=tmp[glob_language];
        } else if (tmp[glob_default_language] !== undefined) {
            valeur=tmp[glob_default_language];
        } else {
            valeur=intitule;
        }
        retour+="<option value='"+intitule+"' "+str_selected+" >"+valeur+"</option>";
    }
    return (retour);
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function glob_get_liste_html_groupe (liste, selected, options={add_empty : true}) {
	let l=glob_listes[liste];
	let retour="<option value=''>-</option>"; // valeur vide
	if (liste === undefined) {
		return (retour);
	}
	if (options["add_empty"] == false) {
		retour="";
	}
	
	for (let i in  l) { // pour chaque groupe
		let groupe=l[i];
		for (let j in groupe) { // pour chaque élément du groupe
			let tmp=groupe[j];
			let valeur="";
			if (tmp[glob_language] !== undefined) {
				valeur=tmp[glob_language];
			} else if (tmp[glob_default_language] !== undefined) {
				valeur=tmp[glob_default_language];
			} else {
				valeur=j;
			}
			if (j == "_label") {
				retour+="<optgroup label=\""+valeur+"\">";
			} else {
				let str_selected="";
				if (j === selected) {
					str_selected=" selected ";
				}
				retour+="<option value='"+j+"' "+str_selected+" >"+valeur+"</option>";
			}
		} // fin du pour chaque élément
		retour+="</optgroup>";
	} // fin du pour chaque groupe
	return (retour);
	
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function glob_get_intitule_liste (liste, valeur, options={}) {
	// on gère les liste avec groupes
	if (liste == "type_layer") { // liste des listes avec des groupes. Pour l'instant seulement type_layer
		return (glob_get_intitule_liste_groupe (liste, valeur, options));
	}
	
	
    let l=glob_listes[liste][valeur];
    if (l === undefined) {
        return ("");
    }
    if (l[glob_language] !== undefined) {
        return (l[glob_language]);
    } else if (l[glob_default_language] !== undefined) {
        return (l[glob_default_language]);
    } else {
        return (valeur);
    }
}

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
function glob_get_intitule_liste_groupe (liste, valeur, options={}) {
	for (let i in glob_listes[liste]) {
		let groupe=glob_listes[liste][i];
		if (groupe[valeur]!==undefined) {
			let l=groupe[valeur];
			if (l[glob_language] !== undefined) {
				return (l[glob_language]);
			} else if (l[glob_default_language] !== undefined) {
				return (l[glob_default_language]);
			} else {
				return (valeur);
			}
		}
	}
	return ("");
}

/**

ATTENTION : la méthode add_layer() quand on veut rendre le div draggable et resizable est obligée de faire appel au nom de l'objet
(model_organizer) de manière littérale quand on veut associer la méthode refresh_links() aux événements de resize et de drag
je n'ai pas réussi à utiliser this ou d'autres méthodes :/
Si un jour on veut utiliser plusieurs instances de model_organizer il faudra traouver un contournement...

**/


function model_organizer (params) {
	//this.toolkait_url="https://migration.moccam-en-ligne.fr/AI/"
	this.zone_model=params["zone_model"];
	this.menu_model="menu_model";
    this.formulaire_layer=params["formulaire_layer"];
    this.nom_model_organizer="model_organizer";
	this.layers={};
	this.idx_last_layer=0;
	this.meta={optimizer:"adam", metrics : "accuracy", input: 10};
    this.formulaire;
	this.model;
	this.inputs=[]; // idx des couches qui sont des inputs (généré dans build_model) permet de fixer l'ordre des inputs
	this.outputs=[]; // idx des couches qui sont des outputs (généré dans build_model) permet de fixer l'ordre des outputs
	this.losses=[];// fonctions de perte et paramètres associés
	this.last_click={idx:0, sens:""};
	this.decallage_bas=160; // décallage vers le bas quand on clique sur la flèche
	this.popup; // popup qui s'ouvre pour charger des modèles
	this.popup_sauv; // popup pour sauvegarder le modèle
	this.ema
	
	this.proprietes_layers=["type", "units", "activation", "loss", "filters", "kernelSize", "strides", "padding", "poolSize", "targetShape", "inputShape", "axis", 
		"klWeight", "useBias", "trainable", "set_weights",  "output", "rate", "noiseShape", "seed", "inputDim", "outputDim", "inputLength", "dims", "n", "dilationRate", 
		"cropping", "depthMultiplier", "momentum", "epsilon", "dropout", "recurrentDropout", "stddev", "maskValue", "scale", "offset", "height", "width", "numTokens", 
		"factor", "alpha", "sharedAxes", "maxValue", "theta", "kernelInitializer", "biasInitializer", "kernelConstraint", "biasConstraint", "kernelRegularizer", 
		"biasRegularizer", "activityRegularizer", "embeddingsInitializer", "embeddingsRegularizer", "embeddingsConstraint", "maskZero", "dataFormat", "depthwiseInitializer", 
		"pointwiseInitializer", "depthwiseRegularizer", "depthwiseConstraint", "pointwiseConstraint", "normalize", "center", "betaInitializer", "gammaInitializer", 
		"movingMeanInitializer", "movingVarianceInitializer", "betaConstraint", "gammaConstraint", "betaRegularizer", "gammaRegularizer", "recurrentInitializer", 
		"recurrentRegularizer", "recurrentConstraint", "recurrentActivation", "unitForgetBias", "returnSequences", "returnState", "goBackwards", "stateful", "unroll", "cell", 
		"mergeMode", "interpolation", "cropToAspectRatio", "outputMode", "autoVectorize", "alphaInitializer", "alphaRegularizer", "alphaConstraint", "nbCat", "layer", "boolMaskFutur",
		"begin", "size", "dim", "steps"];

	////////////////////////////////////////////////////////////////////////////
    // init ()  - affichage initial du modèle
    this.init = function () {
        let html="";
        html+="<div class='wbmo_meta console' >"; // début meta

		// icônes de gestion des layers
		html+="<table class='barre_icones'><tr>";
		html+="<td><img src=\"IMG/icones_grandes/download2.png\" title=\""+glob_get_intitule("button_load_model")+"\" class=\"pointer icone\" onclick=\""+this.nom_model_organizer+".ouvre_popup_load();\"/></td>";
		html+="<td><img src=\"IMG/icones_grandes/disk.png\" title=\""+glob_get_intitule("button_save_model")+"\" class=\"pointer icone\" onclick=\""+this.nom_model_organizer+".ouvre_popup_save();\"/></td>";
		html+="<td><img src=\"IMG/icones_grandes/balance_unbalance.png\" title=\""+glob_get_intitule("button_fix_weights_layers")+"\" class=\"pointer icone\" onclick=\""+this.nom_model_organizer+".ouvre_popup_weights();\"/></td>";
		html+="<td><img src=\"IMG/icones_grandes/copying_and_distribution.png\" title=\""+glob_get_intitule("button_lot_affiche_form")+"\" class=\"pointer icone\" onclick=\""+this.nom_model_organizer+".lot_affiche_form();\"/></td>";
		html+="<td><img src=\"IMG/icones_grandes/lightning.png\" title=\""+glob_get_intitule("button_generate_model")+"\" class=\"pointer icone\" onclick=\""+this.nom_model_organizer+".clique_genere_model();\"/></td>";
		html+="<td> &nbsp; </td><td> &nbsp; </td>";
		html+="<td><img class='wbmo_add_layer pointer icone' title=\""+glob_get_intitule("button_add_layer")+"\"  src='IMG/icones_grandes/add.png' onclick='"+this.nom_model_organizer+".add_layer();'/></td>";
		html+="<td><img class='wbmo_layers_down pointer icone' title=\""+glob_get_intitule("button_mode_down_layers")+"\"  src='IMG/icones_grandes/arrow_down.png' onclick='"+this.nom_model_organizer+".layers_down();'/></td>";
		html+="<td><img class='wbmo_layers_down pointer icone' title=\""+glob_get_intitule("button_move_up_layers")+"\"  src='IMG/icones_grandes/arrow_up.png' onclick='"+this.nom_model_organizer+".layers_up();'/></td>";
		html+="</tr></table>";

		// petit formulaire optimizer et metrics
		html+="<table>";
		html+="<tr><td><label for='wbmo_optimizer'>"+glob_get_intitule("label_optimizer")+" : </label> </td><td> <select name='wbmo_optimizer' >"+glob_get_liste_html("optimizer", this.meta["optimizer"])+"</select></td></tr>";
		html+="<tr><td><label for='wbmo_learning_rate'>"+glob_get_intitule("label_learning_rate")+" : </label> </td><td> <input name='wbmo_learning_rate' value=''></td></tr>";
		html+="<tr><td><label for='wbmo_metrics'>"+glob_get_intitule("label_metric")+" : </label> </td><td> <select name='wbmo_metrics' >"+glob_get_liste_html("metrics", this.meta["metrics"])+"</select></td></tr>";

		html+="</table><br>";
		html+="</div>";// fin méta
        html+="<div class='wbmo_layers' id='layers_canva'>";

        html+="</div>";

        $("#"+this.zone_model).html(html);
		$("#layers_canva").on("click", function(e) {if (e.target === this) {model_organizer.layers_espace(e);}})

        this.add_layer();
    };
	
	 ////////////////////////////////////////////////////////////////////////////
    // get_idx_layer ()  - récupère idx layer
    this.get_idx_layer = function () {
        this.idx_last_layer++;
        return (this.idx_last_layer);
    };
	
	////////////////////////////////////////////////////////////////////////////
    // get_layer_vierge ()  - génère le html d'une layer
    this.get_layer_vierge = function (infos) {
        let retour="";
        let idx_layer=infos["idx_layer"];
        retour="<div class='wbmo_layer ' name='layer_"+idx_layer+"'>"; // div englobant le tout
		retour+="<img class='wbmo_update_layer' src='IMG/icones/pencil.png' onclick='"+this.nom_model_organizer+".edit_layer("+idx_layer+");'/>"; // icone edit layer
		retour+="<img class='wbmo_delete_layer' src='IMG/icones/cross.png' onclick='"+this.nom_model_organizer+".delete_layer("+idx_layer+");'/>"; // icone delete layer
		retour+="<img class='wbmo_click_highlight' src='IMG/icones/lightbulb_off.png' onclick='"+this.nom_model_organizer+".click_highlight("+idx_layer+");'/>"; // icone highlight
		retour+="<div name='nom_layer' class='wbmo_nom_layer'>layer "+idx_layer+"</div>"; // nom du layer

		retour+="<img class='wbmo_input_icone' src='IMG/icones_grandes/control_eject.png' onclick='"+this.nom_model_organizer+".click_input("+idx_layer+");'/>"; // pôle input
		retour+="<img class='wbmo_output_icone' src='IMG/icones_grandes/control_eject.png' onclick='"+this.nom_model_organizer+".click_output("+idx_layer+");'/>"; // pôle output
		retour+="<div name='definition_layer' class='wbmo_definition_layer'>définition du layer</div>"; // définition du layer
		retour+="</div>"; // fin du div englobant tout
        return(retour);
    }

	////////////////////////////////////////////////////////////////////////////
    // add_layer ()  - ajoute un layer
	// c'est ici qu'on définit toutes les valeurs par défaut d'un layer et ses propriétés TF
    this.add_layer = function() {
        let idx_layer=this.get_idx_layer();
        let layer = this.get_layer_vierge({idx_layer : idx_layer});
		let div_layer=$(layer);
        $("#"+this.zone_model+" div.wbmo_layers").append(div_layer);
		let pos_y=window.scrollY;
		pos_y+=230;
		div_layer.css({"top" : pos_y, "left" : 500});
		div_layer.draggable({scroll:false, grid: [ 20, 20 ], drag:function() {model_organizer.refresh_links();}}).resizable({grid:20,  resize: function( event, ui ) {model_organizer.refresh_links();}});
        
		// Défintion des valeurs par défaut des paramètres du layer
		this.layers[idx_layer]={jq: div_layer, bool_highlight: false, inputs : [], outputs : [], tf_layer : null, tf_output : null, type : 'dense', units : 10, activation : 'relu',
		useBias: true, trainable :true, filters : '10', kernelSize : '5', strides : '1', padding : '1', poolSize : '5', targetShape : '28/28/1', inputShape : '10', 
		axis : '0', weights:[], set_weights: false, loss: 'meanSquaredError', output: false, klWeight: '0.0005',
		rate: "", noiseShape: "", seed: "", inputDim: "", outputDim: "", inputLength: "", dims: "", n: "", dilationRate: "", cropping: "", depthMultiplier: "", momentum: "", 
		epsilon: "", dropout: "", recurrentDropout: "", stddev: "", maskValue: "", scale: "", offset: "", height: "", width: "", numTokens: "", factor: "", alpha: "", 
		sharedAxes: "", maxValue: "", theta: "", kernelInitializer: "", biasInitializer: "", kernelConstraint: "", biasConstraint: "", kernelRegularizer: "", biasRegularizer: "", 
		activityRegularizer: "", embeddingsInitializer: "", embeddingsRegularizer: "", embeddingsConstraint: "", maskZero: "", dataFormat: "", depthwiseInitializer: "", 
		pointwiseInitializer: "", depthwiseRegularizer: "", depthwiseConstraint: "", pointwiseConstraint: "", normalize: "", center: "", betaInitializer: "", gammaInitializer: "", 
		movingMeanInitializer: "", movingVarianceInitializer: "", betaConstraint: "", gammaConstraint: "", betaRegularizer: "", gammaRegularizer: "", recurrentInitializer: "", 
		recurrentRegularizer: "", recurrentConstraint: "", recurrentActivation: "", unitForgetBias: "", returnSequences: "", returnState: "", goBackwards: "", stateful: "", unroll: "", 
		cell: "", mergeMode: "", interpolation: "", cropToAspectRatio: "", outputMode: "", autoVectorize: "", alphaInitializer: "", alphaRegularizer: "", alphaConstraint: "",
		nbCat: "1000", layer: "",boolMaskFutur: "true", begin: "0", size: "0", dim: "128", steps: "100"

		};
        this.update_layer (String(idx_layer));
		return(idx_layer);
    };
	
	////////////////////////////////////////////////////////////////////////////
    // update_layer
	// Met à jour visuellement le div de la layer (texte descriptif, couleur...)
    this.update_layer = function (id_layer) {
        let texte="";
        for (let idx in this.layers) {
            if (id_layer !== "" && id_layer !== idx) {
                continue;
            }
            let type=this.layers[idx]["type"];
            let units=this.layers[idx]["units"];
            let activation=this.layers[idx]["activation"];
            let trainable=Boolean(this.layers[idx]["trainable"]);
			let set_weights=Boolean(this.layers[idx]["set_weights"]);
            let filters=this.layers[idx]["filters"];
            let kernelSize=this.layers[idx]["kernelSize"];
            let strides=this.layers[idx]["strides"];
            let poolSize=this.layers[idx]["poolSize"];
			let targetShape=this.layers[idx]["targetShape"];
			let inputShape=this.layers[idx]["inputShape"];
			let axis=this.layers[idx]["axis"];
			let output=Boolean(this.layers[idx]["output"]);
			let inputDim=this.layers[idx]["inputDim"];
			let outputDim=this.layers[idx]["outputDim"];
			let loss=this.layers[idx]["loss"];
			let klWeight=this.layers[idx]["klWeight"];
			let rate=this.layers[idx]["rate"];
			let begin=this.layers[idx]["begin"];
			let size=this.layers[idx]["size"];
			let dim=this.layers[idx]["dim"];
			let steps=this.layers[idx]["steps"];
            if (trainable === true) {
                texte=" T ";
            }
			if (set_weights === true) {
                texte+=" SW ";
            }

            if (type === "conv1d" || type === "conv2d" || type === "conv3d" || type === "conv2dTranspose" || type === "depthwiseConv2d" || type === "separableConv2d") {
                texte += glob_get_intitule_liste ("type_layer", type)+" "+glob_get_intitule("label_activation")+" = "+glob_get_intitule_liste ("activation_function", activation)+" ("+filters+" "+glob_get_intitule("label_filters")+", "+glob_get_intitule("label_size")+" "+kernelSize+", strides "+strides+")";
            } else if (type === "conv2dTranspose") {
                texte += glob_get_intitule_liste ("type_layer", type)+" "+glob_get_intitule("label_activation")+" = "+glob_get_intitule_liste ("activation_function", activation)+" ("+filters+" "+glob_get_intitule("label_filters")+", "+glob_get_intitule("label_size")+" "+kernelSize+", strides "+strides+")";
            } else if (type==="maxPooling1d" || type==="maxPooling2d" || type==="maxPooling3d" || type==="averagePooling1d" || type==="averagePooling2d" || type==="averagePooling3d") {
                texte += glob_get_intitule_liste ("type_layer", type)+" (poolSize = "+poolSize+", strides "+strides+")";
            } else if (type==="reshape") {
                texte += glob_get_intitule_liste ("type_layer", type)+" (targetShape = "+targetShape+")";
			} else if (type==="input") {
                texte += glob_get_intitule_liste ("type_layer", type)+" (inputShape = "+inputShape+")";
			} else if (type==="concatenate") {
                texte += glob_get_intitule_liste ("type_layer", type)+" (axis = "+axis+")";
			} else if (type==="wbSampling") {
                texte += glob_get_intitule_liste ("type_layer", type)+" (KL weight = "+klWeight+")";
			} else if (type==="dense") { // par défaut dense
                texte += glob_get_intitule_liste ("type_layer", type)+" "+glob_get_intitule("label_activation")+" = "+glob_get_intitule_liste ("activation_function", activation)+" ("+units+" "+glob_get_intitule("label_units")+")";
            } else if (type==="activation") {
                texte += glob_get_intitule_liste ("type_layer", type)+" "+glob_get_intitule("label_activation")+" = "+glob_get_intitule_liste ("activation_function", activation);
            } else if (type==="dropout") {
                texte += glob_get_intitule_liste ("type_layer", type)+" rate = "+rate;
            } else if (type==="simpleRNN" ||type==="lstm" ||type==="gru") {
				texte += glob_get_intitule_liste ("type_layer", type)+" "+glob_get_intitule("label_activation")+" = "+glob_get_intitule_liste ("activation_function", activation)+" ("+units+" "+glob_get_intitule("label_units")+")";
			} else if (type==="embedding") {
				texte += glob_get_intitule_liste ("type_layer", type)+" (inputDim = "+inputDim+" - outputDim = "+outputDim+")";
			} else if (type==="wbSliceLayer") {
				texte += glob_get_intitule_liste ("type_layer", type)+" begin = "+begin+" - size = "+size;
			} else if (type==="wbTimeEmbedding") {
				texte += glob_get_intitule_liste ("type_layer", type)+" dim = "+dim+", steps = "+steps;
			} else { // par défaut, juste affichage du type
				 texte += glob_get_intitule_liste ("type_layer", type);
			}
			
			if (output === true) {
				texte+= " "+glob_get_intitule("label_loss")+" : "+loss;
			}
			
            let classe=this.get_classe_layer(type); // la classe associée à ce type
            let classes=this.get_classe_layer(); // toutes les classes (pour effacer)
            let layer=$("#"+this.zone_model+" div.wbmo_layers div[name='layer_"+idx+"']");
            layer.removeClass(classes).addClass(classe);
            
            layer.children().filter("div[name='definition_layer']").html(texte);

        }
    };

	////////////////////////////////////////////////////////////////////////////
	// set_real_name_layer (idx)
	// affiche le name de tf_layer à la place de "couche 7"
	this.set_real_name_layer = function (idx) {
		let tf_layer=this.layers[idx].tf_layer;
		let layer=$("#"+this.zone_model+" div.wbmo_layers div[name='layer_"+idx+"']");
		if (tf_layer !== undefined) {
			let real_name=tf_layer.name;
			layer.children().filter("div[name='nom_layer']").html(real_name);
		}
	}

	////////////////////////////////////////////////////////////////////////////
	// set_real_names_layers ()
	// raz les noms de tous les layers
	this.set_real_names_layers = function () {
		for (let idx in this.layers) {
			this.set_real_name_layer(idx);
		}
	}

	
	////////////////////////////////////////////////////////////////////////////
    // get_classe_layer
	// retourne une classe liée à au type de layer (dense, conv2d...) liée à une couleur
    this.get_classe_layer = function (type) {
        let liste={
		dense:"wbmo_dense", activation:"wbmo_dense", 
		conv2d:"wbmo_convolution", conv2dTranspose:"wbmo_convolution",  conv1d:"wbmo_convolution", conv3d:"wbmo_convolution", cropping2D:"wbmo_convolution", depthwiseConv2d:"wbmo_convolution", separableConv2d:"wbmo_convolution", upSampling2d:"wbmo_convolution",
		maxPooling1d: "wbmo_pooling", maxPooling2d: "wbmo_pooling", maxPooling3d: "wbmo_pooling", averagePooling1d: "wbmo_pooling", averagePooling2d: "wbmo_pooling", averagePooling3d: "wbmo_pooling", globalAveragePooling1d: "wbmo_pooling", globalAveragePooling2d: "wbmo_pooling", globalMaxPooling1d: "wbmo_pooling", globalMaxPooling2d: "wbmo_pooling", 
		input: "wbmo_input", 
		};
        if (type !== undefined) {
            if (liste[type] !== undefined) {
                return (liste[type]);
            } else {
                return ("wbmo_util");
            }
        } else {
            let retour="wbmo_util ";
            for (let idx in liste) {
                retour+=liste[idx]+" ";
            }
            return (retour);            
        }
        
    };
	
	 ////////////////////////////////////////////////////////////////////////////
    // éditer les propriéts d'une colonne
	// Affiche le formulaire
    this.edit_layer = function(idx) {
        var layer=this.layers[idx];
        let html="";
        html+="<input type='hidden' name='wblo_form_id_layer' value='"+idx+"'>";
        html+="<table class='wblo_formulaire'>";
        html+="<tr><td><label for='wblo_form_type'>"+glob_get_intitule("label_type")+" : </label> </td><td> <select name='wblo_form_type' onchange='"+this.nom_model_organizer+".masque_formulaire();"+"'>"+glob_get_liste_html_groupe("type_layer", layer["type"])+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_units'>"+glob_get_intitule("label_nb_units")+" : </label> </td><td> <input name='wblo_form_units' value='"+layer["units"]+"'></td></tr>";
        html+="<tr><td><label for='wblo_form_activation'>"+glob_get_intitule("label_activation")+" : </label> </td><td> <select name='wblo_form_activation'>"+glob_get_liste_html("activation_function", layer["activation"])+"</select></td></tr>";
        		
		
		html+="<tr><td><label for='wblo_form_filters'>"+glob_get_intitule("label_nb_convolution")+" : </label> </td><td> <input name='wblo_form_filters' value='"+layer["filters"]+"'></td></tr>";
        html+="<tr><td><label for='wblo_form_kernelSize'>"+glob_get_intitule("label_kernel_size")+" : </label> </td><td> <input name='wblo_form_kernelSize' value='"+layer["kernelSize"]+"'></td></tr>";
        html+="<tr><td><label for='wblo_form_strides'>"+glob_get_intitule("label_strides_size")+": </label> </td><td> <input name='wblo_form_strides' value='"+layer["strides"]+"'></td></tr>";
        html+="<tr><td><label for='wblo_form_padding'>Padding: </label> </td><td> <select name='wblo_form_padding' >"+glob_get_liste_html("padding", layer["padding"])+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_poolSize'>Poolsize: </label> </td><td> <input name='wblo_form_poolSize' value='"+layer["poolSize"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_targetShape'>TargetShape: </label> </td><td> <input name='wblo_form_targetShape' value='"+layer["targetShape"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_inputShape'>InputShape: </label> </td><td> <input name='wblo_form_inputShape' value='"+layer["inputShape"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_axis'>Axis : </label> </td><td> <input name='wblo_form_axis' value='"+layer["axis"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_klWeight'>KL weight : </label> </td><td> <input name='wblo_form_klWeight' value='"+layer["klWeight"]+"'></td></tr>";
		
		html+="<tr><td><label for='wblo_form_rate'>Rate : </label> </td><td> <input name='wblo_form_rate' value='"+layer["rate"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_noiseShape'>noiseShape : </label> </td><td> <input name='wblo_form_noiseShape' value='"+layer["noiseShape"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_seed'>seed : </label> </td><td> <input name='wblo_form_seed' value='"+layer["seed"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_inputDim'>inputDim : </label> </td><td> <input name='wblo_form_inputDim' value='"+layer["inputDim"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_outputDim'>outputDim : </label> </td><td> <input name='wblo_form_outputDim' value='"+layer["outputDim"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_inputLength'>inputLength : </label> </td><td> <input name='wblo_form_inputLength' value='"+layer["inputLength"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_dims'>dims : </label> </td><td> <input name='wblo_form_dims' value='"+layer["dims"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_n'>n : </label> </td><td> <input name='wblo_form_n' value='"+layer["n"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_dilationRate'>dilationRate : </label> </td><td> <input name='wblo_form_dilationRate' value='"+layer["dilationRate"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_cropping'>cropping : </label> </td><td> <input name='wblo_form_cropping' value='"+layer["cropping"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_depthMultiplier'>depthMultiplier : </label> </td><td> <input name='wblo_form_depthMultiplier' value='"+layer["depthMultiplier"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_size'>size : </label> </td><td> <input name='wblo_form_size' value='"+layer["size"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_begin'>begin : </label> </td><td> <input name='wblo_form_begin' value='"+layer["begin"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_momentum'>momentum : </label> </td><td> <input name='wblo_form_momentum' value='"+layer["momentum"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_epsilon'>epsilon : </label> </td><td> <input name='wblo_form_epsilon' value='"+layer["epsilon"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_dropout'>dropout : </label> </td><td> <input name='wblo_form_dropout' value='"+layer["dropout"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_recurrentDropout'>recurrentDropout : </label> </td><td> <input name='wblo_form_recurrentDropout' value='"+layer["recurrentDropout"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_stddev'>stddev : </label> </td><td> <input name='wblo_form_stddev' value='"+layer["stddev"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_maskValue'>maskValue : </label> </td><td> <input name='wblo_form_maskValue' value='"+layer["maskValue"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_scale_number'>scale : </label> </td><td> <input name='wblo_form_scale_number' value='"+layer["scale_number"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_offset'>offset : </label> </td><td> <input name='wblo_form_offset' value='"+layer["offset"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_height'>height : </label> </td><td> <input name='wblo_form_height' value='"+layer["height"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_width'>width : </label> </td><td> <input name='wblo_form_width' value='"+layer["width"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_numTokens'>numTokens : </label> </td><td> <input name='wblo_form_numTokens' value='"+layer["numTokens"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_factor'>factor : </label> </td><td> <input name='wblo_form_factor' value='"+layer["factor"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_alpha'>alpha : </label> </td><td> <input name='wblo_form_alpha' value='"+layer["alpha"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_sharedAxes'>sharedAxes : </label> </td><td> <input name='wblo_form_sharedAxes' value='"+layer["sharedAxes"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_maxValue'>maxValue : </label> </td><td> <input name='wblo_form_maxValue' value='"+layer["maxValue"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_theta'>theta : </label> </td><td> <input name='wblo_form_theta' value='"+layer["theta"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_nbCat'>"+glob_get_intitule("label_nb_categories")+" : </label> </td><td> <input name='wblo_form_nbCat' value='"+layer["nbCat"]+"'></td></tr>";
		//html+="<tr><td><label for='wblo_form_XXX'>XXX : </label> </td><td> <input name='wblo_form_XXX' value='"+layer["XXX"]+"'></td></tr>";

		html+="<tr><td><label for='wblo_form_kernelInitializer'>kernelInitializer </label> </td><td> <select name='wblo_form_kernelInitializer'>"+glob_get_liste_html("Initializer", String(layer["kernelInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_biasInitializer'>biasInitializer </label> </td><td> <select name='wblo_form_biasInitializer'>"+glob_get_liste_html("Initializer", String(layer["biasInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_kernelConstraint'>kernelConstraint </label> </td><td> <select name='wblo_form_kernelConstraint'>"+glob_get_liste_html("Constraint", String(layer["kernelConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_biasConstraint'>biasConstraint </label> </td><td> <select name='wblo_form_biasConstraint'>"+glob_get_liste_html("Constraint", String(layer["biasConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_kernelRegularizer'>kernelRegularizer </label> </td><td> <select name='wblo_form_kernelRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["kernelRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_biasRegularizer'>biasRegularizer </label> </td><td> <select name='wblo_form_biasRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["biasRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_activityRegularizer'>activityRegularizer </label> </td><td> <select name='wblo_form_activityRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["activityRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_embeddingsInitializer'>embeddingsInitializer </label> </td><td> <select name='wblo_form_embeddingsInitializer'>"+glob_get_liste_html("Initializer", String(layer["embeddingsInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_embeddingsRegularizer'>embeddingsRegularizer </label> </td><td> <select name='wblo_form_embeddingsRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["embeddingsRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_embeddingsConstraint'>embeddingsConstraint </label> </td><td> <select name='wblo_form_embeddingsConstraint'>"+glob_get_liste_html("Constraint", String(layer["embeddingsConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_maskZero'>maskZero </label> </td><td> <select name='wblo_form_maskZero'>"+glob_get_liste_html("booleen", String(layer["maskZero"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_dataFormat'>dataFormat </label> </td><td> <select name='wblo_form_dataFormat'>"+glob_get_liste_html("dataFormat", String(layer["dataFormat"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_depthwiseInitializer'>depthwiseInitializer </label> </td><td> <select name='wblo_form_depthwiseInitializer'>"+glob_get_liste_html("Initializer", String(layer["depthwiseInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_pointwiseInitializer'>pointwiseInitializer </label> </td><td> <select name='wblo_form_pointwiseInitializer'>"+glob_get_liste_html("Initializer", String(layer["pointwiseInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_depthwiseRegularizer'>depthwiseRegularizer </label> </td><td> <select name='wblo_form_depthwiseRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["depthwiseRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_depthwiseConstraint'>depthwiseConstraint </label> </td><td> <select name='wblo_form_depthwiseConstraint'>"+glob_get_liste_html("Constraint", String(layer["depthwiseConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_pointwiseConstraint'>pointwiseConstraint </label> </td><td> <select name='wblo_form_pointwiseConstraint'>"+glob_get_liste_html("Constraint", String(layer["pointwiseConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_normalize'>normalize </label> </td><td> <select name='wblo_form_normalize'>"+glob_get_liste_html("booleen", String(layer["normalize"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_center'>center </label> </td><td> <select name='wblo_form_center'>"+glob_get_liste_html("booleen", String(layer["center"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_scale'>scale </label> </td><td> <select name='wblo_form_scale'>"+glob_get_liste_html("booleen", String(layer["scale"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_betaInitializer'>betaInitializer </label> </td><td> <select name='wblo_form_betaInitializer'>"+glob_get_liste_html("Initializer", String(layer["betaInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_gammaInitializer'>gammaInitializer </label> </td><td> <select name='wblo_form_gammaInitializer'>"+glob_get_liste_html("Initializer", String(layer["gammaInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_movingMeanInitializer'>movingMeanInitializer </label> </td><td> <select name='wblo_form_movingMeanInitializer'>"+glob_get_liste_html("Initializer", String(layer["movingMeanInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_movingVarianceInitializer'>movingVarianceInitializer </label> </td><td> <select name='wblo_form_movingVarianceInitializer'>"+glob_get_liste_html("Initializer", String(layer["movingVarianceInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_betaConstraint'>betaConstraint </label> </td><td> <select name='wblo_form_betaConstraint'>"+glob_get_liste_html("Constraint", String(layer["betaConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_gammaConstraint'>gammaConstraint </label> </td><td> <select name='wblo_form_gammaConstraint'>"+glob_get_liste_html("Constraint", String(layer["gammaConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_betaRegularizer'>betaRegularizer </label> </td><td> <select name='wblo_form_betaRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["betaRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_gammaRegularizer'>gammaRegularizer </label> </td><td> <select name='wblo_form_gammaRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["gammaRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_recurrentInitializer'>recurrentInitializer </label> </td><td> <select name='wblo_form_recurrentInitializer'>"+glob_get_liste_html("Initializer", String(layer["recurrentInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_recurrentRegularizer'>recurrentRegularizer </label> </td><td> <select name='wblo_form_recurrentRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["recurrentRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_recurrentConstraint'>recurrentConstraint </label> </td><td> <select name='wblo_form_recurrentConstraint'>"+glob_get_liste_html("Constraint", String(layer["recurrentConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_recurrentActivation'>recurrentActivation </label> </td><td> <select name='wblo_form_recurrentActivation'>"+glob_get_liste_html("activation_function", String(layer["recurrentActivation"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_unitForgetBias'>unitForgetBias </label> </td><td> <select name='wblo_form_unitForgetBias'>"+glob_get_liste_html("booleen", String(layer["unitForgetBias"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_returnSequences'>returnSequences </label> </td><td> <select name='wblo_form_returnSequences'>"+glob_get_liste_html("booleen", String(layer["returnSequences"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_returnState'>returnState </label> </td><td> <select name='wblo_form_returnState'>"+glob_get_liste_html("booleen", String(layer["returnState"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_goBackwards'>goBackwards </label> </td><td> <select name='wblo_form_goBackwards'>"+glob_get_liste_html("booleen", String(layer["goBackwards"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_stateful'>stateful </label> </td><td> <select name='wblo_form_stateful'>"+glob_get_liste_html("booleen", String(layer["stateful"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_unroll'>unroll </label> </td><td> <select name='wblo_form_unroll'>"+glob_get_liste_html("booleen", String(layer["unroll"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_cell'>cell </label> </td><td> <textarea name='wblo_form_cell' placeholder='[{\"type\":\"lstmCell\", \"def\":{\"units\":\"30\", ...}}, ...]'>"+String(layer["cell"])+"</textarea></td></tr>";
		html+="<tr><td><label for='wblo_form_resetAfter'>resetAfter </label> </td><td> <select name='wblo_form_resetAfter'>"+glob_get_liste_html("booleen", String(layer["resetAfter"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_mergeMode'>mergeMode </label> </td><td> <select name='wblo_form_mergeMode'>"+glob_get_liste_html("mergeMode", String(layer["mergeMode"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_interpolation'>interpolation </label> </td><td> <select name='wblo_form_interpolation'>"+glob_get_liste_html("interpolation", String(layer["interpolation"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_cropToAspectRatio'>cropToAspectRatio </label> </td><td> <select name='wblo_form_cropToAspectRatio'>"+glob_get_liste_html("booleen", String(layer["cropToAspectRatio"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_outputMode'>outputMode </label> </td><td> <select name='wblo_form_outputMode'>"+glob_get_liste_html("outputMode", String(layer["outputMode"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_autoVectorize'>autoVectorize </label> </td><td> <select name='wblo_form_autoVectorize'>"+glob_get_liste_html("booleen", String(layer["autoVectorize"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_alphaInitializer'>alphaInitializer </label> </td><td> <select name='wblo_form_alphaInitializer'>"+glob_get_liste_html("Initializer", String(layer["alphaInitializer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_alphaRegularizer'>alphaRegularizer </label> </td><td> <select name='wblo_form_alphaRegularizer'>"+glob_get_liste_html("Regularizer", String(layer["alphaRegularizer"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_alphaConstraint'>alphaConstraint </label> </td><td> <select name='wblo_form_alphaConstraint'>"+glob_get_liste_html("Constraint", String(layer["alphaConstraint"]))+"</select></td></tr>";
		html+="<tr><td><label for='wblo_form_scale'>scale </label> </td><td> <select name='wblo_form_scale'>"+glob_get_liste_html("booleen", String(layer["scale"]))+"</select></td></tr>";

		html+="<tr><td><label for='wblo_form_layer'>layer </label> </td><td> <textarea name='wblo_form_layer' placeholder='{\"type\":\"dense\", \"def\":{\"units\":\"30\", ...}}'>"+String(layer["layer"])+"</textarea></td></tr>";
		html+="<tr><td><label for='wblo_form_boolMaskFutur'>mask futur </label> </td><td> <select name='wblo_form_boolMaskFutur'>"+glob_get_liste_html("booleen", String(layer["boolMaskFutur"]))+"</select></td></tr>";

		html+="<tr><td><label for='wblo_form_dim'>dim </label> </td><td> <input name='wblo_form_dim' value='"+layer["dim"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_steps'>steps </label> </td><td> <input name='wblo_form_steps' value='"+layer["steps"]+"'></td></tr>";
		//html+="<tr><td><label for='wblo_form_XXX'>XXX </label> </td><td> <select name='wblo_form_XXX'>"+glob_get_liste_html("XXX", String(layer["XXX"]))+"</select></td></tr>";
		//html+="<tr><td><label for='wblo_form_XXX'>XXX </label> </td><td> <select name='wblo_form_XXX'>"+glob_get_liste_html("XXX", String(layer["XXX"]))+"</select></td></tr>";
		//html+="<tr><td><label for='wblo_form_XXX'>XXX </label> </td><td> <select name='wblo_form_XXX'>"+glob_get_liste_html("XXX", String(layer["XXX"]))+"</select></td></tr>";
		//html+="<tr><td><label for='wblo_form_XXX'>XXX </label> </td><td> <select name='wblo_form_XXX'>"+glob_get_liste_html("XXX", String(layer["XXX"]))+"</select></td></tr>";
		
		html+="<tr><td colspan='2'><hr></td></tr>";
		html+="<tr><td><label for='wblo_form_useBias'>"+glob_get_intitule("label_use_bias")+" ? </label> </td><td> <select name='wblo_form_useBias'>"+glob_get_liste_html("booleen", String(layer["useBias"]))+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_trainable'>"+glob_get_intitule("label_trainable_layer")+" ? </label> </td><td> <select name='wblo_form_trainable'>"+glob_get_liste_html("booleen", String(layer["trainable"]))+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_set_weights'>"+glob_get_intitule("label_reload_weights")+" ? </label> </td><td> <select name='wblo_form_set_weights'>"+glob_get_liste_html("booleen", String(layer["set_weights"]))+"</select></td></tr>";

		html+="<tr><td colspan='2'><hr></td></tr>";
		html+="<tr><td><label for='wblo_form_output' >"+glob_get_intitule("label_output_layer")+" ? </label> </td><td> <select name='wblo_form_output' onchange='"+this.nom_model_organizer+".masque_formulaire();"+"'>"+glob_get_liste_html("booleen", String(layer["output"]))+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_loss'>"+glob_get_intitule("label_loss")+" : </label> </td><td> <select name='wblo_form_loss'>"+glob_get_liste_html("loss", String(layer["loss"]))+"</select></td></tr>";
        
        html+="<tr><td colspan='2'><button name='wblo_form_valider' value='valider' onclick='"+this.nom_model_organizer+".valide_formulaire();"+"'>"+glob_get_intitule("button_validate")+"</button></td></tr>";
        html+="</table>";
        
        $("#"+this.formulaire_layer).html(html);
        this.formulaire = $("#"+this.formulaire_layer).dialog({autoOpen: false, height: 700, width: 600, modal: true, position: { my: "center top", at: "top+100", of: window } });
        this.masque_formulaire(); // on applique le masque
        this.formulaire.dialog("open");
    };
	
	////////////////////////////////////////////////////////////////////////////
    // masque
	// masque les champs du  formulaire qui ne sont pas adaptés à un type de layer donné
    this.masque_formulaire = function () {
        let type=$("#"+this.formulaire_layer+" [name='wblo_form_type']").val();

		let visible={};
		visible["wblo_form_units"]=['dense', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'lstmCell'];
		visible["wblo_form_activation"]=['dense', 'conv2d', 'conv2dTranspose', 'activation', 'conv1d', 'conv3d', 'separableConv2d', 'depthwiseConv2d', 'convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_filters"]=['conv2d', 'conv2dTranspose', 'conv1d', 'conv3d', 'convLstm2dCell', 'convLstm2d'];
		visible["wblo_form_kernelSize"]=['conv2d', 'conv2dTranspose', 'conv1d', 'conv3d', 'separableConv2d', 'depthwiseConv2d', 'convLstm2dCell', 'convLstm2d'];
		visible["wblo_form_strides"]=['conv2d', 'conv2dTranspose', 'maxPooling2d', 'conv1d', 'conv3d', 'separableConv2d', 'averagePooling1d', 'averagePooling2d', 'averagePooling3d', 'maxPooling1d', 'maxPooling3d', 'convLstm2dCell', 'convLstm2d'];
		visible["wblo_form_padding"]=['conv2d', 'conv2dTranspose', 'maxPooling2d', 'conv1d', 'conv3d', 'separableConv2d', 'depthwiseConv2d', 'averagePooling1d', 'averagePooling2d', 'averagePooling3d', 'maxPooling1d', 'maxPooling3d', 'convLstm2dCell', 'zeroPadding2d', 'convLstm2d'];
		visible["wblo_form_poolSize"]=['maxPooling2d', 'averagePooling1d', 'averagePooling2d', 'averagePooling3d', 'maxPooling1d', 'maxPooling3d'];
		visible["wblo_form_useBias"]=['_all'];
		visible["wblo_form_targetShape"]=['reshape'];
		visible["wblo_form_inputShape"]=['input'];
		visible["wblo_form_axis"]=['softmax', 'concatenate', 'dot', 'batchNormalization', 'layerNormalization'];
		visible["wblo_form_set_weights"]=['_all'];
		visible["wblo_form_output"]=['_all'];
		visible["wblo_form_trainable"]=['_all'];
		visible["wblo_form_klWeight"]=['wbSampling'];
		
		visible["wblo_form_rate"]=['dropout', 'spatialDropout1d', 'alphaDropout', 'gaussianDropout'];
		visible["wblo_form_noiseShape"]=['dropout', 'alphaDropout'];
		visible["wblo_form_seed"]=['dropout', 'spatialDropout1d', 'randomWidth'];
		visible["wblo_form_inputDim"]=['embedding', 'convLstm2dCell', 'gru', 'lstm', 'rnn', 'simpleRNN', 'convLstm2d'];
		visible["wblo_form_outputDim"]=['embedding'];
		visible["wblo_form_inputLength"]=['embedding', 'convLstm2dCell', 'gru', 'lstm', 'rnn', 'simpleRNN', 'convLstm2d'];
		visible["wblo_form_dims"]=['permute'];
		visible["wblo_form_n"]=['repeatVector'];
		visible["wblo_form_dilationRate"]=['conv1d', 'conv2d', 'separableConv2d', 'depthwiseConv2d', 'convLstm2dCell', 'convLstm2d'];
		visible["wblo_form_cropping"]=['cropping2D'];
		visible["wblo_form_depthMultiplier"]=['separableConv2d', 'depthwiseConv2d'];
		visible["wblo_form_size"]=['upSampling2d', 'wbSliceLayer'];
		visible["wblo_form_begin"]=['wbSliceLayer'];
		visible["wblo_form_momentum"]=['batchNormalization'];
		visible["wblo_form_epsilon"]=['batchNormalization', 'layerNormalization'];
		visible["wblo_form_dropout"]=['convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_recurrentDropout"]=['convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_stddev"]=['gaussianNoise'];
		visible["wblo_form_maskValue"]=['masking'];
		visible["wblo_form_scale_number"]=['rescaling'];
		visible["wblo_form_offset"]=['rescaling'];
		visible["wblo_form_height"]=['centerCrop', 'resizing'];
		visible["wblo_form_width"]=['centerCrop', 'resizing'];
		visible["wblo_form_numTokens"]=['categoryEncoding'];
		visible["wblo_form_factor"]=['randomWidth'];
		visible["wblo_form_alpha"]=['elu', 'leakyReLU'];
		visible["wblo_form_sharedAxes"]=['prelu'];
		visible["wblo_form_maxValue"]=['reLU'];
		visible["wblo_form_theta"]=['thresholdedReLU'];
		
		
		visible["wblo_form_kernelInitializer"]=['dense', 'conv1d', 'conv2d', 'conv3d', 'conv2dTranspose', 'depthwiseConv2d', 'separableConv2d', 'convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_biasInitializer"]=['dense', 'conv1d', 'conv2d', 'conv3d', 'conv2dTranspose', 'depthwiseConv2d', 'separableConv2d', 'convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_kernelConstraint"]=['dense', 'conv1d', 'conv2d', 'conv3d', 'conv2dTranspose', 'depthwiseConv2d', 'separableConv2d', 'convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_biasConstraint"]=['dense', 'conv1d', 'conv2d', 'conv3d', 'conv2dTranspose', 'depthwiseConv2d', 'separableConv2d', 'convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_kernelRegularizer"]=['dense', 'conv1d', 'conv2d', 'conv3d', 'conv2dTranspose', 'depthwiseConv2d', 'separableConv2d', 'convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_biasRegularizer"]=['dense', 'conv1d', 'conv2d', 'conv3d', 'conv2dTranspose', 'depthwiseConv2d', 'separableConv2d', 'convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_activityRegularizer"]=['dense', 'embedding', 'conv1d', 'conv2d', 'conv3d', 'conv2dTranspose', 'depthwiseConv2d', 'separableConv2d'];
		visible["wblo_form_embeddingsInitializer"]=['embedding'];
		visible["wblo_form_embeddingsRegularizer"]=['embedding'];
		visible["wblo_form_embeddingsConstraint"]=['embedding'];
		visible["wblo_form_maskZero"]=['embedding'];
		visible["wblo_form_dataFormat"]=['flatten', 'conv1d', 'conv2d', 'conv3d', 'conv2dTranspose', 'depthwiseConv2d', 'separableConv2d', 'cropping2D', 'upSampling2d', 'averagePooling2d', 'averagePooling3d', 'globalAveragePooling2d', 'globalMaxPooling2d', 'maxPooling2d', 'maxPooling3d', 'convLstm2dCell', 'zeroPadding2d', 'convLstm2d'];
		visible["wblo_form_depthwiseInitializer"]=['separableConv2d', 'depthwiseConv2d'];
		visible["wblo_form_pointwiseInitializer"]=[];
		visible["wblo_form_depthwiseRegularizer"]=['separableConv2d', 'depthwiseConv2d'];
		visible["wblo_form_depthwiseConstraint"]=['separableConv2d', 'depthwiseConv2d'];
		visible["wblo_form_pointwiseConstraint"]=[];
		visible["wblo_form_normalize"]=['dot'];
		visible["wblo_form_center"]=['batchNormalization', 'layerNormalization'];
		visible["wblo_form_scale"]=['batchNormalization', 'layerNormalization'];
		visible["wblo_form_betaInitializer"]=['batchNormalization', 'layerNormalization'];
		visible["wblo_form_gammaInitializer"]=['batchNormalization', 'layerNormalization'];
		visible["wblo_form_movingMeanInitializer"]=['batchNormalization'];
		visible["wblo_form_movingVarianceInitializer"]=['batchNormalization'];
		visible["wblo_form_betaConstraint"]=['batchNormalization'];
		visible["wblo_form_gammaConstraint"]=['batchNormalization'];
		visible["wblo_form_betaRegularizer"]=['batchNormalization', 'layerNormalization'];
		visible["wblo_form_gammaRegularizer"]=['batchNormalization', 'layerNormalization'];
		visible["wblo_form_recurrentInitializer"]=['convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_recurrentRegularizer"]=['convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_recurrentConstraint"]=['convLstm2dCell', 'gru', 'gruCell', 'lstm', 'simpleRNN', 'simpleRNNCell', 'convLstm2d', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_recurrentActivation"]=['convLstm2dCell', 'gru', 'gruCell', 'lstm', 'lstmCell'];
		visible["wblo_form_unitForgetBias"]=['convLstm2dCell', 'lstm', 'convLstm2d', 'lstmCell'];
		visible["wblo_form_returnSequences"]=['convLstm2dCell', 'gru', 'lstm', 'rnn', 'simpleRNN', 'convLstm2d'];
		visible["wblo_form_returnState"]=['convLstm2dCell', 'gru', 'lstm', 'rnn', 'simpleRNN', 'convLstm2d'];
		visible["wblo_form_goBackwards"]=['convLstm2dCell', 'gru', 'lstm', 'rnn', 'simpleRNN', 'convLstm2d'];
		visible["wblo_form_stateful"]=['convLstm2dCell', 'gru', 'lstm', 'rnn', 'simpleRNN', 'convLstm2d'];
		visible["wblo_form_unroll"]=['convLstm2dCell', 'gru', 'lstm', 'rnn', 'simpleRNN', 'convLstm2d'];
		visible["wblo_form_cell"]=['convLstm2dCell', 'gru', 'lstm', 'rnn', 'simpleRNN', 'convLstm2d'];
		visible["wblo_form_resetAfter"]=['gruCell'];
		visible["wblo_form_mergeMode"]=['bidirectional'];
		visible["wblo_form_interpolation"]=['upSampling2d', 'resizing', 'randomWidth'];
		visible["wblo_form_cropToAspectRatio"]=['resizing'];
		visible["wblo_form_outputMode"]=['categoryEncoding'];
		visible["wblo_form_autoVectorize"]=['randomWidth'];
		visible["wblo_form_alphaInitializer"]=['prelu'];
		visible["wblo_form_alphaRegularizer"]=['prelu'];
		visible["wblo_form_alphaConstraint"]=['prelu'];
		visible["wblo_form_nbCat"]=['wbNumber2OneHot'];

		visible["wblo_form_layer"]=['bidirectional', 'timeDistributed'];
		visible["wblo_form_boolMaskFutur"]=['wbAttentionWeights'];
		visible["wblo_form_dim"]=['wbTimeEmbedding'];
		visible["wblo_form_steps"]=['wbTimeEmbedding'];

		for (let idx_champ in visible) {
			let types_visibles=visible[idx_champ];
			if (types_visibles.indexOf(type) != -1 || types_visibles.indexOf("_all") != -1) {
				$("#"+this.formulaire_layer+" [name='"+idx_champ+"']").parent().parent().removeClass("wblo_hidden");
			} else {
				$("#"+this.formulaire_layer+" [name='"+idx_champ+"']").parent().parent().addClass("wblo_hidden");
			}
		}
		
		// affichage de la fonction de perte et paramètres associés uniquement sur les couches de sortie
		let output=$("#"+this.formulaire_layer+" [name='wblo_form_output']").val();

		if (output === "true") {
			$("#"+this.formulaire_layer+" [name='wblo_form_loss']").parent().parent().removeClass("wblo_hidden");
		} else {
			$("#"+this.formulaire_layer+" [name='wblo_form_loss']").parent().parent().addClass("wblo_hidden");
		}
		
    };
	
	////////////////////////////////////////////////////////////////////////////
    // valide_formulaire
	// validation du formulaire pour modifier une layer
    this.valide_formulaire = function () {
        let id_layer=$("#"+this.formulaire_layer+" [name='wblo_form_id_layer']").val();

		for (let i in this.proprietes_layers) { // pour chaque propriété des layers
			let element=this.proprietes_layers[i];
			let valeur=$("#"+this.formulaire_layer+" [name='wblo_form_"+element+"']").val();
			
			// conversion des chaines en booléens
			if (valeur === "true") {
				valeur=true;
			}
			
			if (valeur === "false") {
				valeur=false;
			}
			
			this.layers[id_layer][element]=valeur;
		}
		this.update_layer (id_layer);
        this.formulaire.dialog("close");

    };
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// GENERATION DU MODELE : gestion des Links (liens entre layers
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	

	////////////////////////////////////////////////////////////////////////////
    // clique_genere_model ()  - génère le modèle de manière asynchrone avec affichage du waiting
	this.clique_genere_model = function () {
		this.affiche_waiting_compile();
		this.genere_model();

	}
	
	
	////////////////////////////////////////////////////////////////////////////
    // genere_model ()  - génère le modèle
    this.genere_model = function () {
		return new Promise((resolve) => {
			setTimeout(() => {
				try {
					// 0) on dispose les layers et output existants
					this.dispose_all();

					// 1) on génère les input layers et on récupère les layers enfants
					let idx_layers=this.genere_input_layers();

					// 2) on génère les layers de manière récursive
					this.genere_layers(idx_layers); // ==> peut être très long

					// 3) on construit le modele
					this.build_model();

					// 4) on compile
					this.compile_model();

					// 5) on maj chef_orchestre
					chef_orchestre.set_model(this.model);
					
					// 6) on affiche
					this.affiche_model();
					this.affiche_fin();
				} catch (e) {
					alert ("model_organize::genere_model()"+e.message);
				}
				//this.waiting (false);
				resolve (true);
			}, 1000); // Le délai de 1 seconde permet d'afficher le message d'attente avant de générer le modèle
		}); // fin de la promise
	}
	
	////////////////////////////////////////////////////////////////////////////
    // genere_input_layers ()  - crée les tf.layers des inputs
	// renseigne tf_layer et tf_output de chaque layer de this.layers
	// retourne les idx_layer des layers enfants
    this.genere_input_layers = function () {
		let retour=[];
		for (let idx_layer in this.layers) {
			let layer=this.layers[idx_layer];
			if (layer["type"] == "input") {
				// on récupère inputShape
				let inputShape=layer["inputShape"];
				let input_array=this.str_2_shape(inputShape);
				
				// on récupère batchInpuShape (dans le cas d'un load de modèle)
				let batch_input_array=undefined;
				if (Array.isArray(layer["batchInputShape"])) {
					batch_input_array=this.str_2_shape(layer["batchInputShape"]);
				}
				// On génère l'input layer
				layer["tf_layer"]=tf.input({shape:input_array, batchShape: batch_input_array});
				layer["tf_output"]=layer["tf_layer"]; // pour la couche d'input tf_output est identique à tf_layer
				// on récupère les layers enfants (en les dédoublonnant)
				for (let idx_output in layer["outputs"]) {
					let output=layer["outputs"][idx_output];
					if (retour.indexOf(output)== -1) {
						retour.push(output);
					}
				}
			}
		}
		return (retour);
		
	}
	
	////////////////////////////////////////////////////////////////////////////
	// Génère les tf.layers de manière récursive (récursivité vers le haut)
    this.genere_layers = function (idx_layers) {

		let enfants=[];
		for (idx in idx_layers) { // pour chaque layer
			idx_layer=idx_layers[idx];
			let layer=this.layers[idx_layer];
			// 1) si la tf.layer a déjà été générée, on passe
			if (layer["tf_layer"] != null) {
				continue;
			}
			// 2) on génère la tf.layer et on récupère les enfants
			let idx_enfants=this.genere_layer(idx_layer);
			for (let idx_enfant in idx_enfants) {
				enfants.push(idx_enfants[idx_enfant]);
			}
			
		} // fin du pour chaque layer
		
		// 3) on génère de manière récursive les enfants s'il y en a
		if (enfants.length > 0) {
			this.genere_layers(enfants);
		}

	}
	
	////////////////////////////////////////////////////////////////////////////
	// Génère 1 tf.layer
	// vérifie que toutes les layers mères ont bien été générées, sinon, les crée (récurdivité vers le bas)
	// crée le layer puis fait apply() pour générer tf_layer et tf_output
    this.genere_layer = function (idx_layer) {
		let layer=this.layers[idx_layer];
		
		// 1) on vérifie que tous les inputs ont bien été générés si ce n'est pas le cas on les crée de manière récusrive
		//    et on récupère tf_inputs (ensemble des outputs de toutes les couches mères)
		let inputs=layer["inputs"];
		let outputs=layer["outputs"];
		let tf_inputs=[];
		for (let idx in inputs) {
			let idx_input=inputs[idx];
			let input=this.layers[idx_input];
			let input_shape=[];
			if (input["tf_output"] == null) {
				this.genere_layer(idx_input);
			}
			tf_inputs.push(input["tf_output"]);
		}
		
		// 2) on crée le tf.layer
		try {
			layer["tf_layer"]=this.genere_layer_standalone(idx_layer);
			if (tf_inputs.length==1) {
				layer["tf_output"]=layer["tf_layer"].apply(tf_inputs[0]);
			} else {
				layer["tf_output"]=layer["tf_layer"].apply(tf_inputs);
			}
		} catch (e) {
			alert ("model_organize::genere_layer()"+e.message);
			console.log(e);
			return ([]);
		}
		
		// on retourne les idx des enfants (outputs)
		return (outputs);
		
	}

	////////////////////////////////////////////////////////////////////////////
	// pour les layers qui regroupent plusieurs sous-layers comme RNN...
	this.genere_wrapper = function(propriete) {
		let json;
		let retour=[];
		try {
			json=JSON.parse(propriete);
		} catch (e) {
			console.log("model_organizer::genere_wrapper()")
			alert ("model_organize::genere_wrapper()"+e.message);
			return(retour);
		}
		for (let idx in json) {
			let layer = json[idx];
			let type = layer["type"];
			let def = layer["def"];
			def["type"] = type;
			let tf_layer=this.def_2_layer(def);
			retour.push(tf_layer);
		}
		return (retour);

	}

	////////////////////////////////////////////////////////////////////////////
	// Génère 1 tf.layer
	// Crée uniquement l'objet tf.layer en fonction de sa dénition (dense, conv2d...)
	// mais ne le lie pas avec les autres layers
	this.genere_layer_standalone = function (idx_layer) {
		let layer;
		let infos=this.layers[idx_layer];
		layer=this.def_2_layer(infos);
		return(layer);

	}
	
	////////////////////////////////////////////////////////////////////////////
	// Génère 1 tf.layer
	// Crée uniquement l'objet tf.layer en fonction de sa dénition (dense, conv2d...)
	// mais ne le lie pas avec les autres layers
    this.def_2_layer = function (infos) {
		let layer;
		let def_layer={};

		for (let i in this.proprietes_layers) {
			let nom_propriete=this.proprietes_layers[i];
			let propriete=infos[nom_propriete];

			// cas des booléens
			if (propriete === true || propriete === "true") {
				propriete=true;
			} else if (propriete === false || propriete === "false") {
				propriete=false;
			} else if (typeof(propriete) === "string") {
				if (propriete.indexOf ("/") !== -1) {
					propriete=this.str_2_shape(propriete);
				} else if (propriete === "undefined") {
					propriete=undefined;
				} else if (propriete === "null") {
					propriete=null;
				} else if (propriete === "") {
					// on ne fait rien
				} else if (!isNaN(Number(propriete))) { // si format numérique
					propriete=Number(propriete);
				}
			} else if (propriete === undefined || propriete === null) {
				// on ne fait rien => doit être testé avant les nombres, sinon ces types seront convertis en 0
			} else {
				// dans tous les autres cas de figure on ne fait rien
			}

			// gestion des wrappers
			if (nom_propriete === "cell") { // un tableau de layers
				if (propriete !== "" && propriete !== null && propriete !== undefined) {
					let wrapper = this.genere_wrapper(propriete);
					propriete = wrapper;
				}
			}
			if (nom_propriete === "layer") { // une seule layer
				if (propriete !== "" && propriete !== null && propriete !== undefined) {
					let wrapper = this.genere_wrapper("["+propriete+"]"); // on utilise la même fonction que pour rnn mais on ne gère qu'une seule couche
					propriete = wrapper[0];
				}
			}
			// on supprime la propriété inputShape (réservée aux inputs et génère des warning quand on load un modèle avec cette propriété dans les autres layers)
			if (nom_propriete === "inputShape") {
				propriete = "";
			}

			// on ne définit pas de propriétés vides
			if (propriete !== "") {
				def_layer[nom_propriete]=propriete;
			}
		}
		

		try {

			if (infos["type"]==="dense") {
					layer=tf.layers.dense(def_layer);
			} else if (infos["type"]==="conv2d") {
					layer=tf.layers.conv2d(def_layer);
			} else if (infos["type"]==="conv2dTranspose") {
					layer=tf.layers.conv2dTranspose(def_layer);
			} else if (infos["type"]==="maxPooling2d") {
					layer=tf.layers.maxPooling2d(def_layer);
			} else if (infos["type"]==="softmax") {
					layer=tf.layers.softmax(def_layer);
			} else if (infos["type"]==="flatten") {
					layer=tf.layers.flatten(def_layer);
			} else if (infos["type"]==="reshape") {
					layer=tf.layers.reshape(def_layer);
			} else if (infos["type"]==="concatenate") {
					layer=tf.layers.concatenate(def_layer);
			} else if (infos["type"]==="wbSampling") {
					layer=new wbSampling(def_layer);
			} else if (infos["type"]==="activation") {
					layer=tf.layers.activation(def_layer);
			} else if (infos["type"]==="dropout") {
					layer=tf.layers.dropout(def_layer);
			} else if (infos["type"]==="embedding") {
					layer=tf.layers.embedding(def_layer);
			} else if (infos["type"]==="repeatVector") {
					layer=tf.layers.repeatVector(def_layer);
			} else if (infos["type"]==="permute") {
					layer=tf.layers.permute(def_layer);
			} else if (infos["type"]==="spatialDropout1d") {
					layer=tf.layers.spatialDropout1d(def_layer);
			} else if (infos["type"]==="elu") {
					layer=tf.layers.elu(def_layer);
			} else if (infos["type"]==="leakyReLU") {
					layer=tf.layers.leakyReLU(def_layer);
			} else if (infos["type"]==="prelu") {
					layer=tf.layers.prelu(def_layer);
			} else if (infos["type"]==="reLU") {
					layer=tf.layers.reLU(def_layer);
			} else if (infos["type"]==="thresholdReLU") {
					layer=tf.layers.thresholdReLU(def_layer);
			} else if (infos["type"]==="conv1d") {
					layer=tf.layers.conv1d(def_layer);
			} else if (infos["type"]==="conv3d") {
					layer=tf.layers.conv3d(def_layer);
			} else if (infos["type"]==="cropping2d") {
					layer=tf.layers.cropping2d(def_layer);
			} else if (infos["type"]==="separableConv2d") {
					layer=tf.layers.separableConv2d(def_layer);
			} else if (infos["type"]==="depthwiseConv2d") {
					layer=tf.layers.depthwiseConv2d(def_layer);
			} else if (infos["type"]==="upSampling2d") {
					layer=tf.layers.upSampling2d(def_layer);
			} else if (infos["type"]==="add") {
					layer=tf.layers.add(def_layer);
			} else if (infos["type"]==="average") {
					layer=tf.layers.average(def_layer);
			} else if (infos["type"]==="dot") {
					layer=tf.layers.dot(def_layer);
			} else if (infos["type"]==="maximum") {
					layer=tf.layers.maximum(def_layer);
			} else if (infos["type"]==="minimum") {
					layer=tf.layers.minimum(def_layer);
			} else if (infos["type"]==="multiply") {
					layer=tf.layers.multiply(def_layer);
			} else if (infos["type"]==="batchNormalization") {
					layer=tf.layers.batchNormalization(def_layer);
			} else if (infos["type"]==="layerNormalization") {
					layer=tf.layers.layerNormalization(def_layer);
			} else if (infos["type"]==="averagePooling1d") {
					layer=tf.layers.averagePooling1d(def_layer);
			} else if (infos["type"]==="averagePooling2d") {
					layer=tf.layers.averagePooling2d(def_layer);
			} else if (infos["type"]==="averagePooling3d") {
					layer=tf.layers.averagePooling3d(def_layer);
			} else if (infos["type"]==="globalAveragePooling1d") {
					layer=tf.layers.globalAveragePooling1d(def_layer);
			} else if (infos["type"]==="globalAveragePooling2d") {
					layer=tf.layers.globalAveragePooling2d(def_layer);
			} else if (infos["type"]==="globalMaxPooling1d") {
					layer=tf.layers.globalMaxPooling1d(def_layer);
			} else if (infos["type"]==="globalMaxPooling2d") {
					layer=tf.layers.globalMaxPooling2d(def_layer);
			} else if (infos["type"]==="maxPooling1d") {
					layer=tf.layers.maxPooling1d(def_layer);
			} else if (infos["type"]==="maxPooling3d") {
					layer=tf.layers.maxPooling3d(def_layer);
			} else if (infos["type"]==="convLstm2d") {
					layer=tf.layers.convLstm2d(def_layer);
			} else if (infos["type"]==="convLstm2dCell") {
					layer=tf.layers.convLstm2dCell(def_layer);
			} else if (infos["type"]==="gru") {
					layer=tf.layers.gru(def_layer);
			} else if (infos["type"]==="gruCell") {
					layer=tf.layers.gruCell(def_layer);
			} else if (infos["type"]==="lstm") {
					layer=tf.layers.lstm(def_layer);
			} else if (infos["type"]==="lstmCell") {
					layer=tf.layers.lstmCell(def_layer);
			} else if (infos["type"]==="rnn") {
					layer=tf.layers.rnn(def_layer);
			} else if (infos["type"]==="simpleRNN") {
					layer=tf.layers.simpleRNN(def_layer);
			} else if (infos["type"]==="simpleRNNCell") {
					layer=tf.layers.simpleRNNCell(def_layer);
			} else if (infos["type"]==="stackedRNNCells") {
					layer=tf.layers.stackedRNNCells(def_layer);
			} else if (infos["type"]==="bidirectional") {
					layer=tf.layers.bidirectional(def_layer);
			} else if (infos["type"]==="timeDistributed") {
					layer=tf.layers.timeDistributed(def_layer);
			} else if (infos["type"]==="alphaDropout") {
					layer=tf.layers.alphaDropout(def_layer);
			} else if (infos["type"]==="gaussianDropout") {
					layer=tf.layers.gaussianDropout(def_layer);
			} else if (infos["type"]==="gaussianNoise") {
					layer=tf.layers.gaussianNoise(def_layer);
			} else if (infos["type"]==="zeroPadding2d") {
					layer=tf.layers.zeroPadding2d(def_layer);
			} else if (infos["type"]==="masking") {
					layer=tf.layers.masking(def_layer);
			} else if (infos["type"]==="rescaling") {
					layer=tf.layers.rescaling(def_layer);
			} else if (infos["type"]==="centerCrop") {
					layer=tf.layers.centerCrop(def_layer);
			} else if (infos["type"]==="resizing") {
					layer=tf.layers.resizing(def_layer);
			} else if (infos["type"]==="categoryEncoding") {
					layer=tf.layers.categoryEncoding(def_layer);
			} else if (infos["type"]==="randomWidth") {
					layer=tf.layers.randomWidth(def_layer);
			} else if (infos["type"]==="wbNumber2OneHot") {
					layer=new wbNumber2OneHot(def_layer);
			}  else if (infos["type"]==="wbAttentionWeights") {
					layer=new wbAttentionWeights(def_layer);
			} else if (infos["type"]==="wbPositionalEncodingLayer") {
				layer=new wbPositionalEncodingLayer(def_layer);
			} else if (infos["type"]==="wbSliceLayer") {
				layer=new wbSliceLayer(def_layer); // => marche pas :(
			} else if (infos["type"]==="wbLastTokenLayer") {
				layer=new wbLastTokenLayer(def_layer);
			} else if (infos["type"]==="wbTimeEmbedding") {
				layer=new wbTimeEmbedding(def_layer);
			} else if (infos["type"]==="wbSwishLayer") {
				layer=new wbSwishLayer(def_layer);
			} else {
				alert ("model_organizer.genere_layer_standalone() :"+glob_get_intitule("alert_create_layer", {"%idx":idx_layer, "%type":type}));
				return ("");
			}
		} catch (e) {
			alert ("model_organize::genere_layer_standalone()"+e.message);
			console.log(e.message);
			return ("");
		}
		return (layer);
		
	};
	
	////////////////////////////////////////////////////////////////////////////
	// build_model - crée le modèle à partir des layers inputs et outputs
	// alimente this.inputs et this.outputs qui serviront à retenir l'ordre des inputs et des outputs
	
	this.build_model = function () {
		let inputs=[];
		let outputs=[];
		let input;
		let output;
		// on raz this.inputs et this.outputs et losses
		this.inputs=[];
		this.outputs=[];
		this.losses=[];
		
		
		for (idx_layer in this.layers) {
			let layer=this.layers[idx_layer];
			// un input est un layer de type input
			if (layer["type"]=="input") {
				inputs.push(layer["tf_output"]);
				this.inputs.push(idx_layer);
			}
			// un output est un layer avec aucun outputs définis
			if (layer["outputs"].length==0) {
				outputs.push(layer["tf_output"]);
				this.outputs.push(idx_layer);
				this.losses.push({loss: layer["loss"]}); // fonction de perte de cette sortie
			}
		}
		if (inputs.length==1) {
			input=inputs[0];
		} else {
			input=inputs;
		}
		if (outputs.length==1) {
			output=outputs[0];
		} else {
			output=outputs;
		}

		try {
			this.model=tf.model({inputs: input, outputs: output});
		} catch (e) {
			alert ("model_organize::build_model()"+e.message);
			console.log(e);
		}
	};
	
	////////////////////////////////////////////////////////////////////////////
	// genre_loss() : récupère et génère les fonctions de perte pour chaque sortie
	// avec éventuellement des paramètres
	// 
	this.genere_loss = function () {
		let retour=[];
		for (let idx in this.losses) {
			let loss=this.losses[idx]["loss"];
			retour.push(loss);
		}
		if (retour.length == 1) {
			return (retour[0]); // si une seule sortie on renvoie une chaine
		} else {
			return (retour); // sinon une array
		}
		
	}

	////////////////////////////////////////////////////////////////////////////
	// genere_optimizer : créer un objet optimizer avec paramètre comme learninRate...
	//
	this.genere_optimizer = function (nom, params={}) {
		let optimizer;
		let learningRate=params["learningRate"];
		if (learningRate === "") {
			learningRate=undefined;
		} else {
			learningRate=Number(learningRate);
		}
		if (nom === "adam") {
			optimizer=tf.train.adam(learningRate);
		} else if (nom === "sgd") {
			optimizer=tf.train.sgd(learningRate);
		} else if (nom === "momentum") {
			optimizer=tf.train.momentum(learningRate);
		} else if (nom === "adagrad") {
			optimizer=tf.train.adagrad(learningRate);
		} else if (nom === "adadelta") {
			optimizer=tf.train.adadelta(learningRate);
		} else if (nom === "adamax") {
			optimizer=tf.train.adamax(learningRate);
		} else if (nom === "rmsprop") {
			optimizer=tf.train.rmsprop(learningRate);
		}

		return (optimizer);
	};
	
	////////////////////////////////////////////////////////////////////////////
	// compile_model - compile le modèle avec la fonction d'activation, de perte et la métrique
	// 

	this.compile_model = function () {
		let optimizer=$("#"+this.zone_model+" select[name='wbmo_optimizer']").val();
		let metrics=$("#"+this.zone_model+" select[name='wbmo_metrics']").val();
		let learning_rate=$("#"+this.zone_model+" input[name='wbmo_learning_rate']").val();
		try {

			let loss=this.genere_loss();
			let obj_optimizer=this.genere_optimizer (optimizer, {learningRate:learning_rate});
			this.model.compile({optimizer: obj_optimizer, loss: loss, metrics: metrics});
			this.set_weights(); // recharge les poids pour les couches qui le demandent
		} catch (e) {
			alert ("model_organize::compile_model()"+e.message);
			console.log(e);
			return ("");
		}
	};
	
	////////////////////////////////////////////////////////////////////////////
	// dispose_all - dispose() tous les layers et output
	this.dispose_all = function () {
		for (idx_layer in this.layers) {
			this.dispose_layer(idx_layer);
		}
		try {

			tf.dispose(this.model);

		} catch(e) {

		}
	};
	
	////////////////////////////////////////////////////////////////////////////
	// dispose_layer - dispose() les tensoeurs (tf_layer et tf_output) d'une layer et remet les variables à null
	this.dispose_layer = function (idx_layer) {
		try {
			this.layers[idx_layer]["tf_layer"].dispose();
		} catch (e) {
			
		}
		try {
			this.layers[idx_layer]["tf_output"].dispose();
		} catch (e) {
			
		}
		this.layers[idx_layer]["tf_layer"]=null;
		this.layers[idx_layer]["tf_output"]=null;

	};
	
	////////////////////////////////////////////////////////////////////////////
	// Affichage du modèle dans un autre onglet
	this.affiche_model = function () {

		if (this.model === undefined) {
			return (false);
		}
		
		// 1) affichage du model summary
		$("#zone_info_modele_synthese").html(""); // on RAZ
		this.model.summary(null, null, x => {$("#zone_info_modele_synthese").html($("#zone_info_modele_synthese").html()+"\n"+x)}); // chaque layer est ajouté à la suite

		// 2) affichage des paramètres de chaque layer
        let infos_layers="";
        infos_layers+="<table class='wblo_modele_synthese'>";
        for (let idx=0 ; idx < 9999 ; idx++) {
			try {
				let tmp=this.model.getLayer(idx).getConfig();
				infos_layers+="<tr><td>"+idx+"</td><td><pre>";
				infos_layers+=(JSON.stringify(tmp, null, 2));
				infos_layers+="</pre></td></tr>";
			} catch (e) {
				break;
			}
        }
        infos_layers+="</table>";
        $("#zone_info_modele_parametres").html(infos_layers);

		// 3) on raz le nom des couches avec le vrai nom des tf_layers
		this.set_real_names_layers();

	};
	
	////////////////////////////////////////////////////////////////////////////
    // affiche message de validation de fin
	this.affiche_fin = function () {
		let html="";
		html+=glob_get_intitule("label_build_done")+"<br><br>";
		html+="<button onclick=\"$( '#"+this.menu_model+"' ).tabs( 'option', 'active', 0 );model_organizer.formulaire.dialog('close');\">"+glob_get_intitule("button_update_model")+"</button> ";
		html+="<button onclick=\"$( '#"+this.menu_model+"' ).tabs( 'option', 'active', 1 );model_organizer.formulaire.dialog('close');\">"+glob_get_intitule("button_show_details")+"</button> <br>";
		$("#"+this.formulaire_layer).html(html);
        this.formulaire = $("#"+this.formulaire_layer).dialog({autoOpen: false, height: 400, width: 350, modal: true, position: { my: "center top", at: "top+100", of: window } });
        this.formulaire.dialog("open");
		
	};
	
	////////////////////////////////////////////////////////////////////////////
	// str_2_shape - convertit une chaine du type 28/28/3 en array [28][28][3]
    this.str_2_shape = function (input) {
		if (typeof input === 'string' || input instanceof String) {
			//si chaine on ne fait rien
		} else {
			return (input); // sinon on renvoie le paramètre
		}
		let input_array=input.split("/");
		for (idx_input in input_array) {
			input_array[idx_input]=Number(input_array[idx_input]);
		}
		return (input_array);
	};
	
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// INTERFACE GRAPHIQUE : gestion des Links (liens entre layers
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	
	
	////////////////////////////////////////////////////////////////////////////
    // RAZ last_click
	this.raz_last_click = function () {
		this.last_click["idx"]=0;
		this.last_click["sens"]="";
	};
	
	////////////////////////////////////////////////////////////////////////////
    // click_input
	this.click_input = function (idx_layer) {
		if (this.last_click["sens"] == "input") { // RAZ
			this.raz_last_click();
			this.fleches_off();
		} else if (this.last_click["sens"] == "output") { // 2e clic
			this.link_layers (idx_layer, this.last_click["idx"]);
			this.fleches_off();
		} else if (this.last_click["sens"] == "") { // 1er clic
			this.last_click["idx"]=idx_layer;
			this.last_click["sens"]="input";
			let name="layer_"+idx_layer;
			$("div.wbmo_layer[name='"+name+"'] img.wbmo_input_icone").attr("src", "IMG/icones_grandes/control_eject_blue.png");
			$("div.wbmo_layer[name='"+name+"'] img.wbmo_input_icone").css("width", "40px");
		}
		
	};
	
	////////////////////////////////////////////////////////////////////////////
    // click_output
	this.click_output = function (idx_layer) {
		if (this.last_click["sens"] == "output") { // RAZ
			this.raz_last_click();
			this.fleches_off();
		} else if (this.last_click["sens"] == "input") { // 2e clic
			this.link_layers (this.last_click["idx"], idx_layer);
			this.fleches_off();
		} else if (this.last_click["sens"] == "") { // 1er clic
			this.last_click["idx"]=idx_layer;
			this.last_click["sens"]="output";
			let name="layer_"+idx_layer;
			$("div.wbmo_layer[name='"+name+"'] img.wbmo_output_icone").attr("src", "IMG/icones_grandes/control_eject_blue.png");
			$("div.wbmo_layer[name='"+name+"'] img.wbmo_output_icone").css("width", "40px");
		}
	};

	////////////////////////////////////////////////////////////////////////////
	// remet les flèches des layers en gris
	this.fleches_off = function () {
		$("div.wbmo_layer img.wbmo_output_icone").attr("src", "IMG/icones_grandes/control_eject.png");
		$("div.wbmo_layer img.wbmo_input_icone").attr("src", "IMG/icones_grandes/control_eject.png");
		$("div.wbmo_layer img.wbmo_output_icone").css("width", "32px");
		$("div.wbmo_layer img.wbmo_input_icone").css("width", "32px");
	}
	
	////////////////////////////////////////////////////////////////////////////
    // link_layers
	// crée ou supprime un lien entre 2 layers après avoir vérifié s'il existe déjà
	this.link_layers = function (idx_input, idx_output) {
		let output=this.layers[idx_output];
		let input=this.layers[idx_input];
		
		// on regarde si un lien entre ces 2 éléments existe déjà
		let pos_output=input["outputs"].indexOf(idx_output); // position de idx_output dans input["outputs"] ou -1 si n'y figure pas
		let pos_input=output["inputs"].indexOf(idx_input); // position de idx_input dans output["inputs"] ou -1 si n'y figure pas
		if (pos_output != -1) { // si lien existe déjà on le supprime
			input["outputs"].splice(pos_output, 1);
			output["inputs"].splice(pos_input, 1);
			this.refresh_links();
			this.raz_last_click();
		} else { // sinon on le crée
			input["outputs"].push(idx_output);
			output["inputs"].push(idx_input);
			this.draw_link_layers (idx_input, idx_output);
		}
		
		// puis raz last_click
		this.raz_last_click();
		
	};
			
	////////////////////////////////////////////////////////////////////////////
	// draw_link_layers
	// on trace le trait
	this.draw_link_layers = function (idx_input, idx_output) {
		let origine=this.layers[idx_output]["jq"];
		let destination=this.layers[idx_input]["jq"];
		let classe="wbmo_connection";
		if (this.layers[idx_output]["bool_highlight"] === true || this.layers[idx_input]["bool_highlight"] === true) {
			classe="wbmo_connection_highlight";
		}
		origine.children('.wbmo_output_icone').connections({ to: destination.children('.wbmo_input_icone'), class: classe, within: "#"+this.zone_model+" div.wbmo_layers"});

	};
	
	////////////////////////////////////////////////////////////////////////////
    // refresh_links
	this.refresh_links = function () {
		// 1) on supprime tous les liens
		$("#"+this.zone_model+" div.wbmo_layers connection.wbmo_connection").connections('remove');
		$("#"+this.zone_model+" div.wbmo_layers connection.wbmo_connection_highlight").connections('remove');
		
		// 2) on recrée tous les liens
		for (idx_output in this.layers) {
			for (idx in this.layers[idx_output]["inputs"]) {
				let idx_input=this.layers[idx_output]["inputs"][idx];
				this.draw_link_layers (idx_input, idx_output);
			}
		}
	};
	
	////////////////////////////////////////////////////////////////////////////
    // layers_down
	this.layers_down = function (decallage=undefined) {
		if (decallage===undefined) {
			decallage=this.decallage_bas;
		}
		for (idx_layer in this.layers) {
			let jq=this.layers[idx_layer]["jq"];
			let top=this.top_str_2_int($(jq).css("top"));

			top+=decallage;
			$(jq).css('top', String(top)+"px");
		}
		this.refresh_links();

	};
	
	////////////////////////////////////////////////////////////////////////////
    // layers_up
	this.layers_up = function () {
		for (idx_layer in this.layers) {
			let jq=this.layers[idx_layer]["jq"];
			let top=this.top_str_2_int($(jq).css("top"));
			top-=this.decallage_bas;
			$(jq).css('top', String(top)+"px");
		}
		this.refresh_links();
	};

	////////////////////////////////////////////////////////////////////////////
	// layers_espace
	this.layers_espace = function(e) {
		console.log(e);
	}
	
	////////////////////////////////////////////////////////////////////////////
    // delete_layer
	this.delete_layer = function (idx_layer, force=false) {
		
		if (force == false) {
			let conf=confirm (glob_get_intitule("alert_delete_layer"));
			if (conf === false) {
				return ("");
			}
		}
		
		// 1. supprimer les tenseurs
		this.dispose_layer(idx_layer);
		
		// 2. supprimer la div
		$(this.layers[idx_layer]["jq"]).remove();
		
		// 3. supprimer dans this.layers
		delete this.layers[idx_layer];
		
		// 4. supprimer tous les liens
		for (idx in this.layers) {
			let layer=this.layers[idx];
			layer["inputs"]=layer["inputs"].filter((elem) => elem != idx_layer);
			layer["outputs"]=layer["outputs"].filter((elem) => elem != idx_layer);
		}
		
		// 5. on rafraichit l'affichage
		this.refresh_links();
		
	};
	
	////////////////////////////////////////////////////////////////////////////
    // delete_all_layers : supprime tous les layers
	this.delete_all_layers = function () {
		for (idx in this.layers) {
			console.log ("delete layer "+idx);
			this.delete_layer(idx, true);
		}
		
	}

	////////////////////////////////////////////////////////////////////////////
	// click_highlight : affiche en rouge les liens d'une layer donnée
	this.click_highlight = function (idx_layer) {
		let bool_highlight=this.layers[idx_layer]["bool_highlight"];
		let jq=this.layers[idx_layer]["jq"];
		if (bool_highlight == false) {
			this.layers[idx_layer]["bool_highlight"]=true;
			jq.children("img.wbmo_click_highlight").attr("src", "IMG/icones/lightbulb.png");
			jq.css("border-color", "red");
		} else {
			this.layers[idx_layer]["bool_highlight"]=false;
			jq.children("img.wbmo_click_highlight").attr("src", "IMG/icones/lightbulb_off.png");
			jq.css("border-color", "blue");
		}
		this.refresh_links();

	}
	
	////////////////////////////////////////////////////////////////////////////
    // retourne les poids du modèle pour affichage dans drawings
	this.get_weights = function () {
		let weights=[];
		for (let idx in this.model.layers) {
			try {
				let layer=this.model.getLayer(Number(idx));
				let infos=layer.getConfig();
				let weights_layer=layer.getWeights();
				// Dans la suite, on part du principe qu'on peut déterminer la répartition des poids (poids, biais, récurrent...) juste par le nombre d'élements dans layer.getWeigts()
				// sans prendre en compte le type de layer, mais ce n'est peut-être pas possible.
				if (weights_layer.length == 0) { // si ce layer n'a pas de poids
					weights[idx]={infos:infos, weights:[], biais:[], recurrent:[]};
					idx++;
					continue;
				} else if (weights_layer.length == 1) { // pas de biais (ex. embedding)
					weights[idx]={infos:infos, weights:weights_layer[0].arraySync(), biais:[], recurrent:[]};
				} else if (weights_layer.length == 2) { // cas général poids + biais (ex. dense)
					weights[idx]={infos:infos, weights:weights_layer[0].arraySync(), biais:weights_layer[1].arraySync(), recurrent:[]};
				} else if (weights_layer.length == 3) { // ex. simpleRnn ou lstm
					weights[idx]={infos:infos, weights:weights_layer[0].arraySync(), biais:weights_layer[2].arraySync(), recurrent:weights_layer[1].arraySync()};
				} else { // non géré
					weights[idx]={infos:infos, weights:[], biais:[], recurrent:[]};
				}

			} catch (e) {
				console.log ("impossible de récupérer la couche model.layers["+idx+"]");
				console.log(e);
			}

		}

		return (weights);

	};
	

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// SAUVEGARDE / CHARGEMENT
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	
	////////////////////////////////////////////////////////////////////////////
    // save_model()
	this.save_model = async function() {

		let nom=$("#file_save_model").val();
		let bool_save_ema=$("#bool_save_ema").prop("checked");

		let verif=await data_organizer.check_model(nom);
		if (verif === true) {
			if (! window.confirm(glob_get_intitule("alert_file_exists", {"%nom_fichier":nom}))) {
				return;
			}
		}
		$("#zone_info_modele_sauv p.loading").html("saving...");
		
		const saveResults = await this.model.save(glob_server_php+glob_url_manage_files+'?action=save_model&nom='+encodeURI(nom));

		// sauvegarde de la copie de la DB (EMA)
		if (bool_save_ema === true) {
			$("#zone_info_modele_sauv p.loading").html("saving EMA...");
			this.switch_weights();
			let nom2=nom+"__ema";
			const saveResults = await this.model.save(glob_server_php+glob_url_manage_files+'?action=save_model&nom='+encodeURI(nom2));
			this.switch_weights();
		}

		$("#zone_info_modele_sauv p.loading").html("&nbsp;");
		this.refresh_models();
		this.refresh_models_save();
		alert (glob_get_intitule("alert_model_recorded"));

	};

	////////////////////////////////////////////////////////////////////////////
	// load_model_ema()
	// cette fonction charge un modèle depuis une url, récupère ses poids associés à un nom de layer (dense_dense3...)
	// fait une hard copy de ces poids et les enregistre dans this.layers (l(attribut name de this.layers doit correspondre à l'attribut name des couches du modèle
	this.load_model_ema = async function(url) {
		// affichage pour patienter
		$("#zone_info_modele_load p.loading").html("loading ema...");
		let elems=url.split("/"); // on doit transformer une chaine du type https://xxxx/toto/model.json en https://xxxx/toto__ema/model.json
		let nb=elems.length;
		elems[nb-2]+="__ema";
		let url2=elems.join("/");
		let model;
		try {
			model = await tf.loadLayersModel(url2);
		} catch (error) {
			alert(glob_get_intitule("alert_url_unreachable", {"%url":url2}));
			console.log(error);
			return false;
		}
		for (let idx_layer in model.layers) {
			let name=model.layers[idx_layer].name;
			let weights=model.layers[idx_layer].getWeights();
			let weights2=[];
			for (let idx_weight in weights) {
				weights2.push(tf.tensor(weights[idx_weight].arraySync())); // on fait une hard copy des poids pour éviter les multiples bugs :/
			}
			for (let idx_layer2 in this.layers) {
				if (this.layers[idx_layer2].name === name) {
					this.layers[idx_layer2].weights=weights2;
				}
			}


		}
		tf.dispose(model);

	}

	
	////////////////////////////////////////////////////////////////////////////
    // load_model()
	// le 2e paramètre n'est plus utilisé
	this.load_model = async function(url, bool_load=true) {
		bool_load=$("#bool_load_weights").prop("checked"); // écrase la valeur passée en paramètre
		let bool_load_ema=$("#bool_load_ema").prop("checked");
		// affichage pour patienter
		$("#zone_info_modele_load p.loading").html("loading...");

		if (url === "") {
			url=$("#file_load_model").val();
		}
		let json;
		let name_2_idx={};
		
		// récupération du fichier json
		try {
			const response = await fetch(url);
			if (!response.ok) {
				alert(glob_get_intitule("alert_url_unreachable", {"%url":url}));
				$("#zone_info_modele_load p.loading").html("&nbsp;");
				return;
			}
			json = await response.json();

		} catch (error) {
			alert("model_organize::load_model()"+error.message);
			$("#zone_info_modele_load p.loading").html("&nbsp;");
			return;
		}

		// 1. On raz et on récupère les données json

		this.delete_all_layers(); // on raz l'affichage actuel
		this.dispose_all(); // on supprime le modèle existant
		let json_layers=json["modelTopology"]["config"]["layers"];
		let input_layers=json["modelTopology"]["config"]["input_layers"];

		// 2. on récupère le modèle complet (doit être fait avant l'affichage afin de mettre le tf_layer en propriété de chaque layer
		//bool_load=false; // TMP !!!
		if (bool_load === true) {
			const model = await tf.loadLayersModel(url);
			this.model = model;
			chef_orchestre.set_model(this.model);
		}

		// 3) on affiche les layers et on récupère toutes les infos à partir du fichier json
		// on met aussi l'objet tf_layer en propriété de chaque layer
		let toto=this.affiche_layers_loaded (json_layers,{name_2_idx:{}, parents:[]});
		name_2_idx=toto["name_2_idx"];
		// à la fin on remonte tout de 2 crans
		this.layers_up();
		this.layers_up();
		
		// 4. on maj les liens
		// a = idx de la couche output, b = idx de la couche input
		for (let idx in json_layers) { // pour chaque couche (couche input)
			let json_layer=json_layers[idx];
			let inputs=json_layers[idx]["inbound_nodes"];
			let name=json_layer["name"]; // nom du layer input
			
			let b=name_2_idx[name]; // idx de l'input

			if (inputs[0] != undefined) {
				for (let idx_input in inputs[0]) { // pour chaque input de cette couche
					let input_name=inputs[0][idx_input][0];
					let a=name_2_idx[input_name]; // idx de l'output dans this.layers

					if (this.layers[b]["inputs"].indexOf(a) == -1) {
						this.layers[b]["inputs"].push(a);
					}
					if (this.layers[a]["outputs"].indexOf(b) == -1) {
						this.layers[a]["outputs"].push(b);
					}
					
				}
			}
		}

		this.update_layer(""); // on maj l'affichage
		this.refresh_links();

		// 5) on maj this.inputs et this.outputs
		this.inputs=[];
		this.outputs=[];
		for (let idx_layer in this.layers) {
			let layer=this.layers[idx_layer];
			// un input est un layer de type input
			if (layer["type"]=="input") {
				this.inputs.push(idx_layer);
			}
			// un output est un layer avec aucun outputs définis
			if (layer["outputs"].length==0) {
				this.outputs.push(idx_layer);
				this.losses.push({loss: layer["loss"]}); // fonction de perte de cette sortie
			}
		}
		// 6) on récupère les poids ema
		if (bool_load_ema === true) {
			this.load_model_ema(url);
		}

		// on ferme le popup
		$("#zone_info_modele_load p.loading").html("&nbsp;");
		$("#zone_info_modele_load").dialog("close");

		// 7) affichage
		this.affiche_model();
		this.affiche_fin();
	};
	
	////////////////////////////////////////////////////////////////////////////
    // affiche_layers_loaded()
	// affiche les layers après avoir chargé un modèle en essaynt de les représenter correctement
	// affichage récursif : on affiche que les layers dont tous les parents ont déjà été affichés (ou les inputs au premier passage) sur la même ligne
	// puis on décalle vers le bas et on rappelle la fonction
	this.affiche_layers_loaded = function(json_layers, config) {
		let name_2_idx=config["name_2_idx"];
		let parents=config["parents"];
		let idx_level=config["idx_level"];
		if (idx_level === undefined) {
			idx_level=0;
		}

		let left=0; // nb de décallage à droite. Sert aussi à vérifier qu'au moins un des layers a été traité
		let tmp_parents=[];
		let decallage_bas=this.decallage_bas;
		for (let idx in json_layers) { // pour chaque layer
			let json_layer=json_layers[idx];
			let name=json_layer["name"];
			let type=json_layer["class_name"];
			let config=json_layer["config"];
			let inputs=json_layer["inbound_nodes"];
			
			// si layer déjà affiché on passe
			if (parents.indexOf(name) != -1) {
				continue;
			}
			
			// si au moins un des inputs du layer ne figure PAS dans les parents, on passe
			let passe=false;
			for (let idx_input in inputs[0]) {
				let input_name=inputs[0][idx_input][0];

				if (parents.indexOf(input_name) == -1) {
					passe=true;
				} else {
					// on ne fait rien
				}
			}
			if (passe == true) {
				continue;
			}
			
			// on affiche en décallant vers la droite
			let idx_layer=this.add_layer(); // on ajoute le layer au dom
			name_2_idx[name]=idx_layer;
			tmp_parents.push(name);
			this.set_infos_layer (idx_layer, type, config); // on maj les infos
			try {
				this.layers[idx_layer]["tf_layer"] = this.model.layers[idx]; // on met l'objet layer dans la définition de la couche [on part du présupposé que l'ordre des layers dans le fichier json sera le même que dans l'objet tf.model]
			} catch (e) {
				// on ne fait rien : cas où on ne souhaite pas récupérer les poids
			}
			this.layers[idx_layer].jq.css("left", String((350*left)+(300+(idx_level*15))+"px")); // chaque couche du même niveau est séparée de 350px. La première couche de chaque niveau se décale de 30px à chaque niveau (pour que tout ne soit pas aligné)
			let top=this.top_str_2_int($(this.layers[idx_layer].jq).css("top"));
			top-=left*10;
			this.layers[idx_layer].jq.css('top', String(top)+"px"); // on décalle légèrement les couches d'un même niveau pour qu'ils ne soient pas alignés
			left++;
			decallage_bas+=10;
			
		} // fin du pour chaque layer
		this.layers_down(decallage_bas);// on descend tout d'un cran
		
		// on ajoute les parents à la liste
		for (let idx_tmp_parents in tmp_parents) {
			parents.push(tmp_parents[idx_tmp_parents]);
		}
		
		if (left == 0) { // si aucun layer n'a été traité
			if (parents.length != json_layers.length) {
				console.log ("La méthode load() a retourné "+json_layers.length+" layers mais seules "+parents.length+" peuvent être affichées");
				console.log ("parents");
				console.log (parents);
				console.log ("layers renvoyés par load()");
				console.log (json_layers);
				alert (glob_get_intitule("alert_load_model_error", {"%nb_layers":json_layers.length, "%nb_layers_displayed":parents.length}));
			} 
			return ({name_2_idx:name_2_idx, parents:parents});

		} else { // sinon récusrive
			let retour=this.affiche_layers_loaded (json_layers, {name_2_idx:name_2_idx, parents:parents, idx_level:idx_level+1});
			return (retour);
		}

	};
	

	////////////////////////////////////////////////////////////////////////////
    // load_model()
	this.set_infos_layer = function(idx_layer, type, config) {
		// Corrige les différences de terminologie dans le nom des couches
		let correspondances={conv2D:"conv2d", conv2DTranspose:"conv2dTranspose", maxPooling2D:"maxPooling2d", inputLayer:"input", lSTM:"lstm"};
		type=type.charAt(0).toLowerCase()+type.slice(1); // 1er caractère en minuscules
		if (correspondances[type] !== undefined) {
			type=correspondances[type];
		}
		//console.log ("type corrigé : "+type);
		this.layers[idx_layer]["type"]=type;
		

		for (let idx_config in config) {
			let prop=config[idx_config];
			// différence de terminologie dans le nom des propriétés
			let nom_propriete=this.change_style_variable(idx_config);
			
			// on convertit les array en string
			if (Array.isArray(prop)) {
				// on transforme batchInputShape en inputShape en enlevant la 1ere dimension
				if (nom_propriete == "batchInputShape") {
					nom_propriete = "inputShape";
					prop.shift();
				}
				prop=prop.join("/");
			}
			
			
			if (typeof(prop) === "string") {
				if (nom_propriete === "name") { // propriétés pour lesquelles il ne faut pas appliquer change_style_vatiable (name...)
					// on ne fait rien
				} else {
					prop = this.change_style_variable(prop);
				}
			} else if (prop === null) {
				// on ne fait rien
			} else if (typeof(prop) === "object") { // cas des intializer... qui quand ils sont générés prennent la forme d'un objet {class_name : "xxx", config {xx,xx,xx}} on retransforme en string 
				if (prop["class_name"] != undefined && typeof(prop["class_name"]) === "string") {
					//prop=prop["class_name"];
					prop=prop["class_name"].charAt(0).toLowerCase()+prop["class_name"].slice(1); // on met le 1er car en minuscule
				}
			}
			this.layers[idx_layer][nom_propriete]=prop;
			
		}
		
	};
	
	////////////////////////////////////////////////////////////////////////////
    // change_style_variable()
	// transforme une variable de type "kernel_size" en "kernelSize"
	this.change_style_variable = function (chaine) {
		let retour="";
		let longueur=chaine.length;
		let bool_underscore=false;
		for (idx=0 ; idx <longueur ; idx++) {
			let char=chaine.charAt(idx);
			if (char == "_") {
				bool_underscore=true;
				continue;
			}
			if (bool_underscore === true) {
				char=char.toUpperCase();
				bool_underscore=false;
			}
			retour+=char;
		}
		return (retour);
	};
	
	////////////////////////////////////////////////////////////////////////////
    // refresh_models ()
	this.refresh_models = async function () {
		let url=glob_url_manage_files+"?action=list_models";
		let dir=user_organizer.user["dir"];
		if (dir === undefined || dir === "") {
			return;
		}
		const response = await fetch(url);
		if (!response.ok) {
			alert(glob_get_intitule("alert_url_unreachable", {"%url":url}));
		}
		json = await response.json();
		let a_afficher="";
		for (let id in json) {
			let elem=json[id]["url"];
			let name=json[id]["name"];
			a_afficher+="<a href='#' onclick=\""+this.nom_model_organizer+".load_model('"+glob_saved_models_path+"/"+dir+"/"+elem+"/model.json', true);\">"+name+"</a>";
			a_afficher+="<br>";
		}
		$("#zone_info_modele_load div.list_models").html(a_afficher);
		
	};
	
	////////////////////////////////////////////////////////////////////////////
    // fix_weights ()
	// enregistre les poids (poids + biais) dans la définition des layers
	this.fix_weights = function() {
		for (let idx_layer in this.layers) {
			let layer=this.layers[idx_layer];
			let tf_layer=layer["tf_layer"];
			// certains inputlayers n'ont pas la méthode getWeights()
			if (Array.isArray(tf_layer._trainableWeights) === false && Array.isArray(tf_layer._nonTrainableWeights) === false) {
				layer["weights"]=[];
				continue;
			}
			try {
				tf.dispose(layer["weights"]);
				let tmp=[];
				let weights=tf_layer.getWeights();
				for (let idx in weights) {
					tmp.push(tf.tensor(weights[idx].arraySync())); // on convertit en array puis on crée un nouveau tenseur plutôt que de le cloner (cf bug ci-dessus)
				}

				layer["weights"]=tmp;
			} catch (e) {
				console.log (e);
				alert(glob_get_intitule("alert_unable_fix_weights", {"%idx_layer":idx_layer, "%error":e}));
				//return;

			}

		}

		
	}
	
	////////////////////////////////////////////////////////////////////////////
    // set_weights ()
	// remet les poids enregistrés /!\ ne peut être fait qu'après que le modèle a été compilé
	// si bool_verif_set_weights === true on ne copie les poids que si le paramètre setw_weights du layer vaut true
	// sinon, on copie les poids quoi qu'il arrive

	this.set_weights = function(bool_verif_set_weights=true) {
		for (let idx_layer in this.layers) {
			let infos=this.layers[idx_layer];
			let layer=infos["tf_layer"];
			let set_weights=Boolean(infos["set_weights"]);
			let weights=infos["weights"];
			// certains inputlayers n'ont pas la méthode getWeights()
			if (Array.isArray(layer._trainableWeights) === false && Array.isArray(layer._nonTrainableWeights) === false) {
				continue;
			}
			// On réinjecte les poids si set_weights == true (ou so on a désactivé la vérification)
			if (set_weights === true || bool_verif_set_weights === false) {
				try {
					let tmp=[];
					for (let idx in weights) {
						tmp.push(tf.clone(weights[idx]));
						//tmp.push(tf.tensor(weights[idx]));
					}
					layer.setWeights(tmp);
				} catch (e) {
					console.log ("impossible de recharger les poids de la couche "+idx_layer);
					console.log ("weights");
					console.log (weights);
					console.log(e);
					alert (glob_get_intitule("alert_unable_load_weights", {"%idx_layer":idx_layer}));
				}
			}
		
		}
	}

	////////////////////////////////////////////////////////////////////////////
	// maj_weights_ema ()
	this.maj_weights_ema = function () {
		let decay=glob_diffusion_ema_decay; // 0.999 par défaut
		for (let idx_layer in this.layers) {
			let ema_weights=this.layers[idx_layer]["weights"];
			let layer=this.layers[idx_layer]["tf_layer"];
			// certains inputlayers n'ont pas la méthode getWeights()
			if (Array.isArray(layer._trainableWeights) === false && Array.isArray(layer._nonTrainableWeights) === false) {
				continue;
			}
			let training_weigthts=layer.getWeights();
			for (let idx_weight in ema_weights) {
				let ema_weight=ema_weights[idx_weight];
				let training_weight=training_weigthts[idx_weight];
				let new_ema_weight=tf.tidy(() => {
					return (tf.add(ema_weight.mul(decay), training_weight.mul(1 - decay)));
				});
				tf.dispose(ema_weight);
				this.layers[idx_layer]["weights"][idx_weight]=new_ema_weight;
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////
	// switch_weights ()
	// inverse les poids du modèle (this.layers[xx]["tf_layer"].getWeights() et les poids sauvegardés (this.layers[xx]["weights"]
	this.switch_weights = function () {
		for (let idx_layer in this.layers) { // pour chaque couche

			let layer=this.layers[idx_layer]["tf_layer"];
			// certains inputlayers n'ont pas la méthode getWeights()
			if (Array.isArray(layer._trainableWeights) === false && Array.isArray(layer._nonTrainableWeights) === false) {
				continue;
			}
			let ema_weights=[];
			// on fait une copie des ema_weights et on dispose() l'original
			for (let idx in this.layers[idx_layer]["weights"]) {
				ema_weights[idx]=this.layers[idx_layer]["weights"][idx].clone();
				this.layers[idx_layer]["weights"][idx].dispose();
			}

			// on fait une copie des training_weights
			let training_weights=layer.getWeights();
			let tmp=[];
			for (let idx in training_weights) {
				tmp.push(tf.tensor(training_weights[idx].arraySync())); // on convertit en array puis on crée un nouveau tenseur plutôt que de le cloner (cf bug ci-dessus)
			}

			// on intervertit
			layer.setWeights(ema_weights);
			this.layers[idx_layer]["weights"]=tmp;

		} // fin de pour chaque couche

	}
	
	////////////////////////////////////////////////////////////////////////////
	this.top_str_2_int = function (chaine) {
		// Supprimer tous les caractères qui ne sont pas des chiffres
		let chiffres = chaine.replace(/[^0-9.]/g, ''); // enlève tout sauf les chiffres et le point
		// Convertir en entier et retourner le résultat
		return parseInt(chiffres, 10) || 0;
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.affiche_note_poids = function() {
		let html=glob_get_intitule("text_note_poids");

		html+="<button onclick=\"model_organizer.formulaire.dialog('close');\">OK</a>";
		
		$("#"+this.formulaire_layer).html(html);
        this.formulaire = $("#"+this.formulaire_layer).dialog({autoOpen: false, height: 600, width: 450, modal: true, position: { my: "center top", at: "top+100", of: window } });
        this.formulaire.dialog("open");
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.affiche_waiting_compile = function() {
		let html="";
		html+="<P style='text-align:center'><img style='height:128px;width:128px'src='IMG/icones/network_waiting.gif'/></p>";
		html+=glob_get_intitule("text_waiting_model_compile");

		$("#"+this.formulaire_layer).html(html);
        this.formulaire = $("#"+this.formulaire_layer).dialog({autoOpen: false, height: 600, width: 450, modal: true, position: { my: "center top", at: "top+100", of: window } });
        this.formulaire.dialog("open");
	}

	////////////////////////////////////////////////////////////////////////////
	this.ouvre_popup_load = function() {
		this.popup=$("#zone_info_modele_load");
		this.popup.dialog({modal:true, height:700, width:1100, position: { my: "center top", at: "top+100", of: window }});

	}

	////////////////////////////////////////////////////////////////////////////
	this.ferme_popup_load = function() {
		$("#zone_info_modele_load p.loading").html("&nbsp;");
		this.popup.dialog("close");

	}

	////////////////////////////////////////////////////////////////////////////
	this.ouvre_popup_save = function() {
		this.popup_sauv=$("#zone_info_modele_sauv");
		this.popup_sauv.dialog({modal:true, height:700, width:1100, position: { my: "center top", at: "top+100", of: window }});
		this.refresh_models_save();
	}

	////////////////////////////////////////////////////////////////////////////
	this.ferme_popup_save = function() {
		$("#zone_info_modele_sauv p.loading").html("&nbsp;");
		this.popup_sauv.dialog("close");

	}

	////////////////////////////////////////////////////////////////////////////
	// refresh_models_save () liste des modèles du popup de sauvegarde
	this.refresh_models_save = async function () {
		let url=glob_url_manage_files+"?action=list_models";
		const response = await fetch(url);
		if (!response.ok) {
			alert(glob_get_intitule("url_unreachable", {"%url":url}));
		}
		json = await response.json();
		let a_afficher="";
		for (let id in json) {
			let elem=json[id]["url"];
			let name=json[id]["name"];
			a_afficher+="<a href='#' class='pointer' title='select' onclick=\""+this.nom_model_organizer+".select_model('"+name+"');\">"+name+"</a><br/>";
		}
		$("#zone_info_modele_sauv div.list_models").html(a_afficher);

	};

	////////////////////////////////////////////////////////////////////////////
	// select_model () place le nom du modèle dans le champ de sauvegarde
	this.select_model = function (name) {
		$("#file_save_model").val(name);
	}

	////////////////////////////////////////////////////////////////////////////
	// affiche formulaire pour traitements par lot
	// appelé par un event donc n'a pas accès à this :/
	this.lot_affiche_form = function () {

		let html="";
		// check all / uncheck all
		let html_check="<input id='lot_check_all' type='checkbox' onchange='model_organizer.lot_check_all()' checked></input>";

		// liste des couches
		let html_layers="<div id='lot_select_layers'><table><tr><td>select</td><td>#couche</td><td>nom</td></tr>";
		for (let idx_layer in model_organizer.layers) {
			let layer=model_organizer.layers[idx_layer];
			let name=layer["name"];
			let type=layer["type"];
			if (name === undefined) {
				name=type;
			}
			html_layers+="<tr><td><input type='checkbox' idx_layer='"+idx_layer+"' checked></input></td><td>"+idx_layer+"</td><td>"+name+"</td></tr>";
		}
		html_layers+="</table>";

		// actions
		html_actions="<table>";
		html_actions+="<tr><td>"+glob_get_intitule("label_reload_weights")+"</td><td><select id='lot_action_set_weights'>"+glob_get_liste_html ("booleen", "true")+"</select></td><td><button value='OK' onclick=\"model_organizer.lot_action('set_weights')\">OK</button></td></tr>";
		html_actions+="</table>";

		html=html_check+"<br>"+html_layers+"<br>"+html_actions;

		$("#"+model_organizer.formulaire_layer).html(html);
		model_organizer.formulaire = $("#"+this.formulaire_layer).dialog({autoOpen: false, height: 600, width: 450, modal: true, position: { my: "center top", at: "top+100", of: window } });
		model_organizer.formulaire.dialog("open");

	}

	////////////////////////////////////////////////////////////////////////////
	// coche toutes les cases du formulaire de traitement par lot
	// appelé par un event donc n'a pas accès à this :/
	this.lot_check_all = function () {
		let check=$("#lot_check_all");
		let action="";
		if (check.prop("checked") === true) {
			action="check";
		}
		for (let idx_layer in model_organizer.layers) {
			let checkbox=$("#lot_select_layers input[idx_layer='"+idx_layer+"']");
			if (action=="check") {
				checkbox.prop("checked", true);
			} else {
				checkbox.prop("checked", false);
			}
		}

	}

	////////////////////////////////////////////////////////////////////////////
	// applique une action sur les couches sélectionnées
	// appelé par un event donc n'a pas accès à this :/
	this.lot_action = function (action) {

		let valeur="";
		// récupérer la valeur
		if (action === "set_weights") {
			valeur=$("#lot_action_set_weights").val();
			if (valeur==="true") {
				valeur=true;
			} else {
				valeur=false;
			}
		} else {
			alert ("action "+action+" inconnue");
			return;
		}

		// maj les couches sélectionnées
		for (let idx_layer in model_organizer.layers) {
			let checkbox=$("#lot_select_layers input[idx_layer='"+idx_layer+"']");
			if (checkbox.prop("checked") === true) {
				model_organizer.layers[idx_layer][action]=valeur;
				model_organizer.update_layer(String(idx_layer));

			}
		}

		alert ("OK");
	}

	////////////////////////////////////////////////////////////////////////////
	// ouvre le popup permettant de copier les poids du modèle dans un sens, l'autre ou les 2
	this.ouvre_popup_weights = function () {
		let html="";
		html+="<p>"+glob_get_intitule("label_weights_explanation")+"</p><br>";
		html+="<table id='weights_copy'>";
		html+="<tr><td width='40%'>&nbsp;</td><td width='10%'><img class=\"pointer icone\" src='IMG/icones_grandes/arrow_right.png' title='"+glob_get_intitule("label_working_2_copy")+"' onclick='model_organizer.copy_weights(\"working_2_copy\")' /></td><td width='40%'>&nbsp;</td></tr>";
		html+="<tr><td>"+glob_get_intitule("label_working_model")+"</td><td><img class=\"pointer icone\" src='IMG/icones_grandes/arrow_left.png' title='"+glob_get_intitule("label_copy_2_working")+"' onclick='model_organizer.copy_weights(\"copy_2_working\")' /></td><td>"+glob_get_intitule("label_model_copy")+"</td></tr>";
		html+="<tr><td>&nbsp;</td><td><img class=\"pointer icone\" src='IMG/icones_grandes/arrow_switch.png' title='"+glob_get_intitule("label_switch_weights")+"' onclick='model_organizer.copy_weights(\"switch\")' /></td><td>&nbsp;</td></tr>";
		html+="</table>";
		$("#"+model_organizer.formulaire_layer).html(html);
		model_organizer.formulaire = $("#"+model_organizer.formulaire_layer).dialog({autoOpen: true, height: 600, width: 450, modal: true, position: { my: "center top", at: "top+100", of: window } });

	}

	////////////////////////////////////////////////////////////////////////////
	// copie les poids du modèle dans un sens, l'autre ou les 2
	// sens == working_2_copy, copy_2_working ou switch
	this.copy_weights = function (sens) {
		if (confirm(glob_get_intitule("alert_confirm_copy_weights")) === false) {
			//model_organizer.formulaire.dialog("close"); => message d'erreur avec firefox (pas chrome) : je comprends pas pourquoi :(
			return;
		}

		if (sens === "working_2_copy") {
			model_organizer.fix_weights();
		} else if (sens === "copy_2_working") {
			model_organizer.set_weights(false);
		} else if (sens === "switch") {
			model_organizer.switch_weights();
		}
		alert(glob_get_intitule("alert_fix_weights_done"));
		//model_organizer.formulaire.dialog("close"); => message d'erreur avec firefox (pas chrome) : je comprends pas pourquoi :(
		return;
	}


} // fin de la classe




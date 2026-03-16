// DEPRECATED ? //////////////


function layers_organizer (params) {
    this.zone_layers=params["zone_layers"];
    this.formulaire_layer=params["formulaire_layer"];
    this.nom_layers_organizer="layers_organizer";
    this.idx_last_layer=0;
    this.definition=[];
	this.meta={optimizer:"adam", loss: "meanSquaredError", metrics : "categoricalAccuracy", input: 10};
    this.formulaire;
	this.model;
    
    ////////////////////////////////////////////////////////////////////////////
    // init_layers ()  - affichage initial des layers
    this.init_layers = function () {
        let html="";
        html+="<div class='wblo_meta'>"; // début meta
        
		html+="<table>";
		html+="<tr><td><label for='wblo_meta_optimizer'>Optimizer : </label> </td><td> <select name='wblo_meta_optimizer' >"+glob_get_liste_html("optimizer", this.meta["optimizer"])+"</select></td></tr>";
		html+="<tr><td><label for='wblo_meta_loss'>Loss : </label> </td><td> <select name='wblo_meta_loss' >"+glob_get_liste_html("loss", this.meta["loss"])+"</select></td></tr>";
        html+="<tr><td><label for='wblo_meta_metrics'>Metrics : </label> </td><td> <select name='wblo_meta_metrics' >"+glob_get_liste_html("loss", this.meta["metrics"])+"</select></td></tr>";
		
		html+="<tr><td><button name='wbto_meta_valider' value='valider' onclick='"+this.nom_layers_organizer+".genere_modele();"+"'>Générer le modèle</button></td>";
		html+="<td><img class='wblo_add_layer' src='IMG/icones_grandes/add.png' onclick='"+this.nom_layers_organizer+".add_layer();'/></tr>";
        html+="</table></div>"; // fin méta
        
        html+="<ul class='wblo_layers'>";
        


        html+="<li class='layer non_sortable layer_input' name='layer_input'><div name='nom_layer'>couche d'entrée</div><div name='form_input'><label for='wblo_meta_input'>Format d'entrée : </label><input name='wblo_meta_input' value='"+this.meta["input"]+"'></div></li>";
        
        html+="</ul>";
        
        
        $("#"+this.zone_layers).html(html);
        $("#"+this.zone_layers+" ul.wblo_layers").sortable({items: "li:not(.non_sortable)"});
        
        this.definition["input"]={nb_neurones : 1};
        this.add_layer();
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // add_layer ()  - ajoute un layer
    this.add_layer = function() {
        let idx_layer=this.get_idx_layer();
        let layer = this.get_layer_vierge({idx_layer : idx_layer});
        $("#"+this.zone_layers+" ul.wblo_layers").prepend(layer);
        this.definition[idx_layer]={type : 'dense', units : 10, activation : 'relu', useBias: true, trainable :true, filters : '10', kernelSize : '5', strides : '1', padding : '1', poolSize : '5', targetShape : '28/28/1'};
        this.update_layer (String(idx_layer));
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
        retour="<li class='layer ' name='layer_"+idx_layer+"'><div name='nom_layer'>layer "+idx_layer+"</div> <div name='definition_layer'></div><img class='wblo_update_layer' src='IMG/icones_grandes/pencil.png' onclick='"+this.nom_layers_organizer+".edit_layer("+idx_layer+");'/>  <img class='wblo_delete_layer' src='IMG/icones_grandes/cross.png' onclick='"+this.nom_layers_organizer+".delete_layer("+idx_layer+");'/> </li>";
        return(retour);
    }
    
    ////////////////////////////////////////////////////////////////////////////
    // get_layers_ordered ()  - retourne les names des layers dans le bon ordre
    this.layers_ordered = function () {
        var retour=[];
        $("#"+this.zone_layers+" ul.wblo_layers li").each(function(i) {
            retour.unshift($(this).attr("name"));

        });

        return (retour);
        
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // delete_layer ()  - supprime un layer
    this.delete_layer = function (idx) {
        let nom_layer="layer_"+idx;
        $("#"+this.zone_layers+" ul.wblo_layers li[name="+nom_layer+"]").remove();
        delete this.definition[idx];
        console.log(this.definition);
        
    };
    

    
    ////////////////////////////////////////////////////////////////////////////
    // éditer les propriéts d'une colonne
    this.edit_layer = function(idx) {
        var layer=this.definition[idx];
        let html="";
        html+="<input type='hidden' name='wblo_form_id_layer' value='"+idx+"'>";
        html+="<table class='wblo_formulaire'>";
        html+="<tr><td><label for='wblo_form_type'>Type : </label> </td><td> <select name='wblo_form_type' onchange='"+this.nom_layers_organizer+".masque_formulaire();"+"'>"+glob_get_liste_html("type_layer", layer["type"])+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_units'>Nb. neurones : </label> </td><td> <input name='wblo_form_units' value='"+layer["units"]+"'></td></tr>";
        html+="<tr><td><label for='wblo_form_activation'>Fonction d'activation : </label> </td><td> <select name='wblo_form_activation'>"+glob_get_liste_html("activation_function", layer["activation"])+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_useBias'>Utiliser un biais : </label> </td><td> <select name='wblo_form_useBias'>"+glob_get_liste_html("booleen", String(layer["useBias"]))+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_trainable'>Couche entrainable : </label> </td><td> <select name='wblo_form_trainable'>"+glob_get_liste_html("booleen", String(layer["trainable"]))+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_filters'>Nb. de filtres de convolution : </label> </td><td> <input name='wblo_form_filters' value='"+layer["filters"]+"'></td></tr>";
        html+="<tr><td><label for='wblo_form_kernelSize'>Taille du kernel : </label> </td><td> <input name='wblo_form_kernelSize' value='"+layer["kernelSize"]+"'></td></tr>";
        html+="<tr><td><label for='wblo_form_strides'>Taille des strides: </label> </td><td> <input name='wblo_form_strides' value='"+layer["strides"]+"'></td></tr>";
        html+="<tr><td><label for='wblo_form_padding'>Padding: </label> </td><td> <select name='wblo_form_padding' >"+glob_get_liste_html("padding", layer["padding"])+"</select></td></tr>";
        html+="<tr><td><label for='wblo_form_poolSize'>Poolsize: </label> </td><td> <input name='wblo_form_poolSize' value='"+layer["poolSize"]+"'></td></tr>";
		html+="<tr><td><label for='wblo_form_targetShape'>TargetShape: </label> </td><td> <input name='wblo_form_targetShape' value='"+layer["targetShape"]+"'></td></tr>";
        
        
        html+="<tr><td colspan='2'><button name='wblo_form_valider' value='valider' onclick='"+this.nom_layers_organizer+".valide_formulaire();"+"'>valider</button></td></tr>";
        html+="</table>";
        
        $("#"+this.formulaire_layer).html(html);
        this.formulaire = $("#"+this.formulaire_layer).dialog({autoOpen: false, height: 500, width: 450, modal: true });
        //$("#"+this.formulaire_layer+" [name='wbto_form_sens'] option[value='"+colonne.sens+"']").prop('selected', true); // on met la valeur de sens
        //$("#"+this.formulaire_tableau+" [name='wbto_form_type'] option[value='"+colonne.type+"']").prop('selected', true); // on met la valeur de type
        this.masque_formulaire(); // on applique le masque
        this.formulaire.dialog("open");
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // masque
    this.masque_formulaire = function () {
        let type=$("#"+this.formulaire_layer+" [name='wblo_form_type']").val();
        let liste_champs={
			wblo_form_units:{conv2d:'wblo_hidden', conv2dTranspose:'wblo_hidden', maxPooling2d:'wblo_hidden', softmax:'wblo_hidden', flatten:'wblo_hidden', reshape:'wblo_hidden'}, 
			wblo_form_activation:{maxPooling2d:'wblo_hidden', softmax:'wblo_hidden', flatten:'wblo_hidden', reshape:'wblo_hidden'}, 
			wblo_form_filters:{dense:'wblo_hidden', softmax:'wblo_hidden', maxPooling2d:'wblo_hidden', flatten:'wblo_hidden', reshape:'wblo_hidden'}, 
			wblo_form_kernelSize:{dense:'wblo_hidden', softmax:'wblo_hidden', maxPooling2d:'wblo_hidden', flatten:'wblo_hidden', reshape:'wblo_hidden'}, 
			wblo_form_strides:{dense:'wblo_hidden', softmax:'wblo_hidden', flatten:'wblo_hidden', reshape:'wblo_hidden'}, 
			wblo_form_padding:{dense:'wblo_hidden', softmax:'wblo_hidden', flatten:'wblo_hidden', reshape:'wblo_hidden'}, 
			wblo_form_poolSize:{dense:'wblo_hidden', softmax:'wblo_hidden', conv2d:'wblo_hidden', conv2dTranspose:'wblo_hidden', flatten:'wblo_hidden', reshape:'wblo_hidden'}, 
			wblo_form_useBias:{softmax:'wblo_hidden', maxPooling2d:'wblo_hidden', flatten:'wblo_hidden', reshape:'wblo_hidden'}, 
			wblo_form_targetShape:{conv2d:'wblo_hidden', conv2dTranspose:'wblo_hidden', maxPooling2d:'wblo_hidden', softmax:'wblo_hidden', flatten:'wblo_hidden', dense:'wblo_hidden'}};
        for (let idx_champ in liste_champs) {
            let attribut=liste_champs[idx_champ][type];
            if (attribut === undefined) {
                attribut="wblo_visible";
            }
            if (attribut === "wblo_visible") {
                $("#"+this.formulaire_layer+" [name='"+idx_champ+"']").parent().parent().removeClass("wblo_hidden");
            } else {
                $("#"+this.formulaire_layer+" [name='"+idx_champ+"']").parent().parent().addClass("wblo_hidden");
            }
            
        }
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // valide_formulaire
    this.valide_formulaire = function () {
        let id_layer=$("#"+this.formulaire_layer+" [name='wblo_form_id_layer']").val();
        this.definition[id_layer]["type"]=$("#"+this.formulaire_layer+" [name='wblo_form_type']").val();
        this.definition[id_layer]["units"]=Number($("#"+this.formulaire_layer+" [name='wblo_form_units']").val());
        this.definition[id_layer]["activation"]=$("#"+this.formulaire_layer+" [name='wblo_form_activation']").val();
        this.definition[id_layer]["filters"]=Number($("#"+this.formulaire_layer+" [name='wblo_form_filters']").val());
        this.definition[id_layer]["kernelSize"]=Number($("#"+this.formulaire_layer+" [name='wblo_form_kernelSize']").val());
        this.definition[id_layer]["strides"]=Number($("#"+this.formulaire_layer+" [name='wblo_form_strides']").val());
        this.definition[id_layer]["padding"]=$("#"+this.formulaire_layer+" [name='wblo_form_padding']").val();
        this.definition[id_layer]["poolSize"]=Number($("#"+this.formulaire_layer+" [name='wblo_form_poolSize']").val());
		this.definition[id_layer]["targetShape"]=$("#"+this.formulaire_layer+" [name='wblo_form_targetShape']").val();
        
        if ($("#"+this.formulaire_layer+" [name='wblo_form_useBias']").val() === "true") {
            this.definition[id_layer]["useBias"]=true;
        } else {
            this.definition[id_layer]["useBias"]=false;
        }
        
        if ($("#"+this.formulaire_layer+" [name='wblo_form_trainable']").val() === "true") {
            this.definition[id_layer]["trainable"]=true;
        } else {
            this.definition[id_layer]["trainable"]=false;
        }
        
       
        
        //let sens=$("#"+this.formulaire_tableau+" [name='wbto_form_sens'] option:selected").attr('value');

        this.update_layer (id_layer);
        this.formulaire.dialog("close");

    };
    
    ////////////////////////////////////////////////////////////////////////////
    // update_layer
    this.update_layer = function (id_layer) {
        let texte="";
        for (let idx in this.definition) {
            if (id_layer !== "" && id_layer !== idx) {
                continue;
            }
            let type=this.definition[idx]["type"];
            let units=this.definition[idx]["units"];
            let activation=this.definition[idx]["activation"];
            let trainable=Boolean(this.definition[idx]["trainable"]);
            let filters=this.definition[idx]["filters"];
            let kernelSize=this.definition[idx]["kernelSize"];
            let strides=this.definition[idx]["strides"];
            let poolSize=this.definition[idx]["poolSize"];
			let targetShape=this.definition[idx]["targetShape"];
            if (trainable === true) {
                texte=" T ";
            }
            if (type === "conv2d") {
                texte += glob_get_intitule_liste ("type_layer", type)+" activation = "+glob_get_intitule_liste ("activation_function", activation)+" ("+filters+" filtres de taille "+kernelSize+" et de strides "+strides+")";
            } else if (type === "conv2dTranspose") {
                texte += glob_get_intitule_liste ("type_layer", type)+" activation = "+glob_get_intitule_liste ("activation_function", activation)+" ("+filters+" filtres de taille "+kernelSize+" et de strides "+strides+")";
            } else if (type==="maxPooling2d") {
                texte += glob_get_intitule_liste ("type_layer", type)+" (poolSize = "+poolSize+" et de strides "+strides+")";
            } else if (type==="softmax") {
                texte += glob_get_intitule_liste ("type_layer", type);
            } else if (type==="flatten") {
                texte += glob_get_intitule_liste ("type_layer", type);
            } else if (type==="reshape") {
                texte += glob_get_intitule_liste ("type_layer", type)+" (targetShape = "+targetShape;
			} else { // par défaut dense
                texte += glob_get_intitule_liste ("type_layer", type)+" activation = "+glob_get_intitule_liste ("activation_function", activation)+" ("+units+" neurones)";
            }
            let classe=this.get_classe_layer(type); // la classe associée à ce type
            let classes=this.get_classe_layer(); // toutes les classes (pour effacer)
            let layer=$("#"+this.zone_layers+" ul.wblo_layers li[name='layer_"+idx+"']");
            layer.removeClass(classes).addClass(classe);
            
            layer.children().filter("div[name='definition_layer']").html(texte);
            
            //$(".wblo_layers .col_"+idx).removeClass("wbto_void wbto_in wbto_out").addClass(classe);
        }
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // get_classe_layer
    this.get_classe_layer = function (type) {
        let liste={dense:"wblo_dense", conv2d:"wblo_convolution", maxPooling2d: "wblo_pooling"};
        if (type !== undefined) {
            if (liste[type] !== undefined) {
                return (liste[type]);
            } else {
                return ("wblo_util");
            }
        } else {
            let retour="wblo_util ";
            for (let idx in liste) {
                retour+=liste[idx]+" ";
            }
            return (retour);            
        }
        
    };
    
    
    ////////////////////////////////////////////////////////////////////////////
    // genere_modele ()  - génère le modèle
    this.genere_modele = function () {
        let layers_ordered=this.layers_ordered();
        let nb_layers=layers_ordered.length;
        nb_layers--; // on enlève la couche d'entrée
		let optimizer=$("#"+this.zone_layers+" div.wblo_meta select[name='wblo_meta_optimizer']").val();
		let loss=$("#"+this.zone_layers+" div.wblo_meta select[name='wblo_meta_loss']").val();
		let metrics=$("#"+this.zone_layers+" div.wblo_meta select[name='wblo_meta_metrics']").val();
		let input=$("#"+this.zone_layers+" li[name='layer_input'] input[name='wblo_meta_input']").val();
		let input_array=input.split("/");
		for (idx_input in input_array) {
			input_array[idx_input]=Number(input_array[idx_input]);
		}
		
		// on récupère la fonction de perte.
		if (loss === "absoluteDifference") {
			loss=tf.losses.absoluteDifference;
		} else if (loss === "computeWeightedLoss") {
			loss=tf.losses.computeWeightedLoss;
		} else if (loss === "cosineDistance") {
			loss=tf.losses.cosineDistance;
		} else if (loss === "hingeLoss") {
			loss=tf.losses.hingeLoss;
		} else if (loss === "huberLoss") {
			loss=tf.losses.huberLoss;
		} else if (loss === "logLoss") {
			loss=tf.losses.logLoss;
		} else if (loss === "meanSquaredError") {
			loss=tf.losses.meanSquaredError;
		} else if (loss === "sigmoidCrossEntropy") {
			loss=tf.losses.sigmoidCrossEntropy;
		} else if (loss === "softmaxCrossEntropy") {
			loss=tf.losses.softmaxCrossEntropy;
		} else if (loss === "binaryAccuracy") {
			loss=tf.losses.binaryAccuracy;
		} else if (loss === "binaryCrossentropy") {
			loss=tf.losses.binaryCrossentropy;
		} else if (loss === "categoricalAccuracy") {
			loss=tf.losses.categoricalAccuracy;
		} else if (loss === "categoricalCrossentropy") {
			loss=tf.losses.categoricalCrossentropy;
		} else if (loss === "cosineProximity") {
			loss=tf.losses.cosineProximity;
		} else if (loss === "meanAbsoluteError") {
			loss=tf.losses.meanAbsoluteError;
		} else if (loss === "meanAbsolutePercentageError") {
			loss=tf.losses.meanAbsolutePercentageError;
		} else if (loss === "precision") {
			loss=tf.losses.precision;
		} else if (loss === "recall") {
			loss=tf.losses.recall;
		} else if (loss === "sparseCategoricalAccuracy") {
			loss=tf.losses.sparseCategoricalAccuracy;
		} else {
			alert ("la fonctionde perte "+loss+"n'est pas reconnue");
		} 
		
		
		console.log (loss);
		
		// 1. on RAZ le modèle
		try {
			this.model.dispose();
		} catch (e) {
			// on ne fait rien
		}
		
		// 2 on crée le modèle
		this.model=tf.sequential();
		
		// 3. on ajoute les couches
		
		for (let idx in layers_ordered) { // pour chaque layer
			if (idx==0) {
				continue; // couche d'entrée non prise en compte
			}
			let nom_layer=layers_ordered[idx]; // de la forme layer_4, layer_10...
			let tmp=nom_layer.split("_");
			let id_layer=Number(tmp[1]); // de la forme 4, 10 ...

			
			let infos=this.definition[id_layer];
			let units=Number(infos["units"]);
			let activation=infos["activation"];
			let useBias=infos["useBias"];
			let trainable=Boolean(infos["trainable"]);
			let filters=Number(infos["filters"]);
			let kernelSize=Number(infos["kernelSize"]);
			let strides=Number(infos["strides"]);
			let poolSize=Number(infos["poolSize"]);
			let padding=infos["padding"];
			if (padding === "") {
				padding=undefined;
			}
			
			let targetShape=infos["targetShape"].split("/");
			for (idx_dim in targetShape) {
				targetShape[idx_dim]=Number(targetShape[idx_dim]);
			}
			
			
			let def_layer;
			def_layer={infos:infos, units:units, activation:activation, useBias:useBias, trainable:trainable, filters:filters, kernelSize:kernelSize, strides:strides, poolSize:poolSize, padding:padding, targetShape:targetShape};
			if (idx == 1) {
				def_layer.inputShape=input_array;
			}
			console.log(def_layer);
			
			
			try {
				if (infos["type"]==="dense") {
						this.model.add(tf.layers.dense(def_layer));
				} else if (infos["type"]==="conv2d") {
						this.model.add(tf.layers.conv2d(def_layer));
				} else if (infos["type"]==="conv2dTranspose") {
						this.model.add(tf.layers.conv2dTranspose(def_layer));
				} else if (infos["type"]==="maxPooling2d") {
						this.model.add(tf.layers.maxPooling2d(def_layer));
				} else if (infos["type"]==="softmax") {
						this.model.add(tf.layers.softmax(def_layer));
				} else if (infos["type"]==="flatten") {
						this.model.add(tf.layers.flatten(def_layer));
				} else if (infos["type"]==="reshape") {
						this.model.add(tf.layers.reshape(def_layer));
				}
			} catch (e) {
				alert (e.message);
				return ("");
			}
			
		} // fin du pour chaque layer
		
		// 4. compilation du modèle
		try {
			this.model.compile({optimizer: optimizer, loss: loss, metrics: metrics});
		} catch (e) {
			alert (e.message);
			return ("");
		}
        
		// 5. affichage
		//const surface = { name: 'Résumé du modèle', tab: 'Modèle'};
        tfvis.show.modelSummary(document.getElementById("zone_info_modele_synthese"), this.model);
        //const surface2 = { name: 'Détail des couches', tab: 'Modèle'};
        //tfvis.show.layer(document.getElementById("zone_infos_modele"), this.model.getLayer(undefined, 1));
        let infos_layers="";
        infos_layers+="<table class='wblo_modele_synthese'>";
        for (let idx=0 ; idx < nb_layers ; idx++) {
            //infos_layers.push(this.model.getLayer(idx).getConfig());
            let tmp=this.model.getLayer(idx).getConfig();
            infos_layers+="<tr><td>"+idx+"</td><td><pre>";
            infos_layers+=(JSON.stringify(tmp, null, 2));
            infos_layers+="</pre></td></tr>";
        }
        infos_layers+="</table>";
        $("#zone_info_modele_parametres").html(infos_layers);
        console.log(infos_layers);
        
		chef_orchestre.set_model(this.model);
        //alert ("modèle compilé");
		this.affiche_fin();

        
    };
	
	////////////////////////////////////////////////////////////////////////////
    // affiche message de validation de fin
	this.affiche_fin = function () {
		let html="";
		html+="Le modèle a été généré avec succès.<br><br>";
		html+="<button onclick=\"wb_menu_main.clique('wb_layers_map');layers_organizer.formulaire.dialog('close');\">voir le résultat</a>";
		$("#"+this.formulaire_layer).html(html);
        this.formulaire = $("#"+this.formulaire_layer).dialog({autoOpen: false, height: 400, width: 350, modal: true });
        this.formulaire.dialog("open");
		
	};
	
	////////////////////////////////////////////////////////////////////////////
    // retourne les poids du modèle
	this.get_weights = function () {
		let weights=[];
		let idx=0;
		while (1==1) {
			try {
				let layer=this.model.getLayer(idx);
				let infos=layer.getConfig();
				let weights_layer=layer.getWeights();
				if (weights_layer.length == 0) { // si ce layer n'a pas de poids
					weights[idx]={infos:infos, weights:[], biais:[]};
					idx++;
					continue;
				}
				weights[idx]={infos:infos, weights:weights_layer[0].arraySync(), biais:weights_layer[1].arraySync()};
				//weights_layer[0].dispose(); /!\ ne pas dispose : passé par référence
				//weights_layer[1].dispose(); /!\ ne pas dispose : passé par référence
				idx++;
			} catch (e) {
				
				//drawings.draw_weights ($("#canvas_weights").get(0), weights);
				return (weights);
			}
		}
	}
    
    
    
    
    
    
} // fin de la classe



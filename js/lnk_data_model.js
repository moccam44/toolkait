function lnk_data_model (params) {
	// Variables
	this.obj_data=params["obj_data"]; // objet qui gère les data
	this.obj_model=params["obj_model"]; // objet qui gère le model
	
	this.zone_lnk=params["zone_lnk"];
	this.zone_inputs="zone_lnk_inputs";
	this.zone_outputs="zone_lnk_outputs";
	this.zone_lnk_formulaire="zone_lnk_formulaire";
	this.formulaire_layer=params["formulaire_layer"];
	this.prefixe_container="wblnk_container"; // préxide de chaque container auqyel on ajoute l'idx du layer
	this.nom_objet="lnk_data_model";
	this.meta={optimizer:"adam", loss: "meanSquaredError", metrics : "categoricalAccuracy"};
	this.formulaire;
	
	this.inputs;
	this.outputs;
	this.liste_tensors; // tenseurs de data générés par table_organizer
	this.links={}; // le tableau qui contiendra à la fin les liens entre les couches input/output et les data
				   // il a la forme [inputs|outputs]
				   // [0,1,2...]
				   // [idx_couche | name_couche | loss | data]
				   // pour data : [0,1,2...] => idx de la colonne dans this.obj_data.definition				   
	
	// lancé au démarrage du script
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.init = function (params) {
		// init formulaire
		let html="";
		html+="<table>";
		html+="<tr><td><button onclick='"+this.nom_objet+".reload_in_out();'>"+glob_get_intitule("button_refresh_links")+"</button></td>";
		html+="<td><button onclick='"+this.nom_objet+".compile_modele();'>"+glob_get_intitule("button_create_links")+"</button></td></tr>";
		html+="</table>";
		$("#"+this.zone_lnk_formulaire).html(html);
		
	}
	
	// Affiche les inputs et les outputs
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.reload_in_out = function () {
		this.inputs=this.obj_model["inputs"];
		this.outputs=this.obj_model["outputs"];
		this.links={};
		

		// on affiche les inputs
		let inputs=this.genere_in_out (this.inputs);
		$("#"+this.zone_inputs).html(inputs);
		
		// on affiche les outputs
		let outputs=this.genere_in_out (this.outputs);
		$("#"+this.zone_outputs).html(outputs);

		// on génère les infos de data
		this.liste_tensors=this.obj_data.get_liste_tensors();
		console.log (this.liste_tensors);
		
		// On rend les containers sortable
		$("#"+this.zone_inputs+" div.wblnk_container div.wblnk_body ul").sortable({scroll:false, scrollSensitivity: 1, scrollSpeed: 1, items: "li:not(.non_sortable)"});
		$("#"+this.zone_outputs+" div.wblnk_container div.wblnk_body ul").sortable({scroll:false, scrollSensitivity: 1, scrollSpeed: 1, items: "li:not(.non_sortable)"});
	}
	
	// génère l'affichage d'une rangée (inputs ou ouputs)
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.genere_in_out =function (data) {
		
		var retour="";
		for (idx in data) {
			idx_couche=Number(data[idx]);
			let container=this.genere_container(idx_couche);
			retour+=container;
		}
		return (retour);
	}
	
	// génère le html pour un container (correspondant à 1 input ou 1 output
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.genere_container = function (idx_couche) {
		let retour="";
		let couche=this.obj_model.layers[idx_couche];

		let name=couche.tf_layer["name"];
		let id=this.prefixe_container+"_"+idx_couche;
		retour+="<div class='wblnk_container' idx_couche='"+idx_couche+"' name_couche='"+name+"' id='"+id+"'>";
		retour+="<table class='wblnk_head'><tr><td> "+glob_get_intitule("label_layer")+" "+idx_couche+" ("+name+") </td></tr>";
		retour+="<tr><td><img class='wblnk_add_data pointer icone' src='IMG/icones_grandes/add.png' onclick='"+this.nom_objet+".add_data("+idx_couche+");' title=\""+glob_get_intitule("label_add_one_data")+"\" />";
		retour+="<img class='wblnk_add_data pointer icone' src='IMG/icones_grandes/folder_add.png' onclick='"+this.nom_objet+".affiche_form_add_multi("+idx_couche+");' title=\""+glob_get_intitule("label_add_several_data")+"\" /></td></tr>";
		retour+="</table>";
		retour+="<div class='wblnk_body'><ul></ul></div>";
		
		retour+="</div>"; // fin du container
		return (retour);
		
	}
	
	// ajoute 1 data dans le container passé dont l'idx est passé en paramètre
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.add_data = function (idx_couche, idx_data="") {
		let id_container=this.prefixe_container+"_"+idx_couche;
		let html_select=this.genere_select(idx_data);
		let html="<li>";
		html+=html_select;
		html+="<img src='IMG/icones/cross.png' onclick='"+this.nom_objet+".delete_data(this);'/>";
		html+="</li>";
		$("#"+id_container+" div.wblnk_body ul").append(html);
	}
	

	// supprime 1 data. le paramètre fourni est l'objet dom de l'img sur laquelle on clique pour supprimer le data
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.delete_data = function (dom_img) {
		let li=$(dom_img).parent();
		li.remove();
	}
	
	// génère le champ select pour ajouter les data
	// on peut spécifier un selected (sinon mettre vide) => non géré pour l'instant
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.genere_select = function (selected) {
		let html="<select><option value='-'>-</option>";
		for (idx in this.liste_tensors) {
			let name=this.liste_tensors[idx]["name"];
			let type=this.liste_tensors[idx]["type"]; // non utilisé
			let html_selected="";
			if (String(selected) === String(idx)) {
				html_selected="selected";
			}
			html+="<option value='"+idx+"' "+html_selected+">"+name+"</option>";
		}
		html+="</select>";
		return(html);

	}
	
	// Récupère les infos et génère les liens
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.genere_links_in_out = function () {
		// intitialisation des array
		this.links["inputs"]=[];
		this.links["outputs"]=[];
		// on récupère les containers
		let containers_input=$("#"+this.zone_inputs+" div.wblnk_container"); 
		let containers_output=$("#"+this.zone_outputs+" div.wblnk_container"); 
		// on génère les liens
		this.genere_links (containers_input, this.links["inputs"]);
		this.genere_links (containers_output, this.links["outputs"]);

	}
	
	// Récupère les infos et génère les liens - pour input ou output
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.genere_links = function (containers, tableau) {
		let containers2=containers.toArray();
		for (idx_container in containers2) {
			
			let infos={};
			let container=$(containers2[idx_container]);
			let idx_couche=container.attr("idx_couche");
			let name_couche=container.attr("name_couche");
			let selects=container.find("div.wblnk_body select").toArray(); // on récupère toutes les balises select de ce container
			let data=[];
			for (idx_select in selects) {
				let select=$(selects[idx_select]);
				let idx_col=select.val();
				data.push(idx_col);
			}
			infos["idx_couche"]=idx_couche;
			infos["name_couche"]=name_couche;
			infos["data"]=data;
			tableau.push(infos);
		}
	}
	
	// compile le modèle
	///////////////////////////////////////////////////////////////////////////////////////////////////
	this.compile_modele=function() {
		// 1. on récupère les liens input/output <-> data ainsi que la fonction de loss pour chaque output
		this.genere_links_in_out();
		this.affiche_fin();
	
		
	}
	
	////////////////////////////////////////////////////////////////////////////
    // affiche message de validation de fin
	this.affiche_fin = function () {
		let html="";
		html+=glob_get_intitule("text_links_done")+"<br><br>";
		html+="<button onclick=\"wb_menu_main.clique('wb_cog_go');model_organizer.formulaire.dialog('close');\">"+glob_get_intitule("button_start_training")+"</a>";
		html+="<button onclick=\"wb_menu_main.clique('wb_horoscope');model_organizer.formulaire.dialog('close');\">"+glob_get_intitule("button_test_model")+"</a><br>";
		$("#"+this.formulaire_layer).html(html);
        this.formulaire = $("#"+this.formulaire_layer).dialog({autoOpen: false, height: 400, width: 450, modal: true, position: { my: "center top", at: "top+100", of: window, collision: "none" } });
        this.formulaire.dialog("open");
		
	};
	
	////////////////////////////////////////////////////////////////////////////
    // retourne un tableau de tenseurs en input et outputs pour la fonction fit()
	// appelé par training_organizer
	this.get_in_out = function () {
		let retour={inputs:{}, outputs:{}};

		// 1. on récupère les outputs
		for (idx in this.links["outputs"]) {
			let name_couche=this.links["outputs"][idx]["name_couche"];
			let data=this.links["outputs"][idx]["data"];
			retour["outputs"][name_couche]=this.data_2_tensor(data);
		}
		
		// 2. on récupère les inputs
		for (idx in this.links["inputs"]) {
			let name_couche=this.links["inputs"][idx]["name_couche"];
			let data=this.links["inputs"][idx]["data"];
			retour["inputs"][name_couche]=this.data_2_tensor(data);
		}
		
		return (retour);
	}
	
	////////////////////////////////////////////////////////////////////////////
    // retourne un tenseur associé à un input ou un output pour fit()
	// si 1 seul data, retourne le tenseur de this.obj_data.defibnition
	// si plusieurs, on les concatène
	this.data_2_tensor= function (data) {
		if (data.length==0) { // si pas de data => erreur
			alert (glob_get_intitule("alert_no_data_linked"));
			return (false);
		}
		
		// si un seul data, on renvoie le tenseur associé
		if (data.length == 1) {
			let idx_col=data[0];
			return(this.obj_data["definition"][idx_col]["tensor"]);
		}
		
		// sinon, on concatène les tenseurs
		let tableau=[];
		for (let idx in data) {
			let idx_col=data[idx];
			if (this.obj_data["definition"][idx_col]["tensor"].rank == 1) { // si tenseur à 1 seule dimension on le passe à 2 dimensions (cas d'une colonne numérique pour qu'elle puisse être concaténée avec des tenseurs cat
				tableau.push(this.obj_data["definition"][idx_col]["tensor"].expandDims(1));
			} else {
				tableau.push(this.obj_data["definition"][idx_col]["tensor"]);
			}
		}
		return (tf.concat(tableau, 1));
	}

	////////////////////////////////////////////////////////////////////////////
	// Affiche le formulaire pour ajouter d'un coup plusieurs data à 1 input
	this.affiche_form_add_multi= function (idx_couche) {
		let html="";
		html+="<input id='add_multi_check_all' type='checkbox' onchange='lnk_data_model.add_multi_check_all()' checked></input>"
		html+="<table id='lnk_data_model_select_multi'><tr><td>&nbsp;</td><td>col.</td></tr>";
		for (let idx in lnk_data_model.liste_tensors) {
			let infos=lnk_data_model.liste_tensors[idx];
			html+="<tr><td><input type='checkbox' value='"+infos["idx_col"]+"' checked></td>";
			html+="<td>"+infos["name"]+"</td></tr>";
		}
		html+="</table>";
		html+="<button onclick='lnk_data_model.add_multi("+idx_couche+")'>OK</button>";
		$("#"+lnk_data_model.formulaire_layer).html(html);
		lnk_data_model.formulaire = $("#"+lnk_data_model.formulaire_layer).dialog({autoOpen: false, height: 600, width: 450, modal: true, position: { my: "center top", at: "top+100", of: window, collision: "none" } });
		lnk_data_model.formulaire.dialog("open");


	}

	////////////////////////////////////////////////////////////////////////////
	// coche toutes les cases du formulaire add multi
	// appelé par un event donc n'a pas accès à this :/
	this.add_multi_check_all = function () {
		let check=$("#add_multi_check_all");
		let action="";
		if (check.prop("checked") === true) {
			action="check";
		}
		$("#lnk_data_model_select_multi input").each(function(i){
			if (action=="check") {
				$(this).prop("checked", true);
			} else {
				$(this).prop("checked", false);
			}
		})

	}

	////////////////////////////////////////////////////////////////////////////
	// ajoute plusieurs data à 1 input
	this.add_multi=function (idx_couche) {
		$("#lnk_data_model_select_multi input:checked").each(function(i){
			let idx_data=$(this).val();
			lnk_data_model.add_data(idx_couche, idx_data);
		})
		lnk_data_model.formulaire.dialog("close");

	}

} // fin de la classe
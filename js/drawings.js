function drawings (params) {
	this.border=10;
	this.height=3000;
	this.width=1500;
	this.width_rect=10;
	this.espace_layers=220; // espace entre les layers
	this.lineWidth = 1; // épaisseur des lignes
	this.intensite_lignes = 254; // entre 0 et 255 (défaut 200) : plus ce chiffre est faible plus les lignes seront visibles
	this.intensite_lignes_compl = 254-this.intensite_lignes;
	this.couleur_input="rgb(100,100,255)";
	this.couleur_error="rgb(0,0,0)";
	this.conv_taille_neurone=5; // taille d'un neurone pour les couches conv2d
	this.conv_dist_neurones=2; // espace entre les neurones pour conv2d
	this.conv_dist_kernels=10; // distance entre les kernels pour conv2d
	this.conv_dist_layers=20; // écart avec la couche suivante
	this.empty_height=50; // hauteur d'un layer vide
	this.empty_couleur="rgb(200,200,255)";
	this.text_couleur="rgb(0,0,0)";
	this.predictions_organizer=predictions_organizer;
	this.model_organizer=model_organizer;
	this.layers_a_afficher=[];

	this.formulaire_layer="wb_dialog";
	this.formulaire;

	
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Dessine une représentation des poids sur le canvas fourni
	this.draw_weights = function (canvas, layers, params) {
		let label=params["label"];
		let ctx=canvas.getContext("2d");
		let points=[];
		this.raz_canvas(ctx);
		if (label != undefined) {
			this.affiche_label(ctx, label);
		}
		let base=this.border;
		let nb_layers=layers.length;
		for (idx_layer=nb_layers-1; idx_layer>=0 ; idx_layer--) { // pour chaque layer en partant de la fin
			idx_layer=Number(idx_layer);
			let layer=layers[idx_layer];
			let weights=layer["weights"];
			let biais=layer["biais"];
			let infos=layer["infos"];
			let name=infos["name"];
			if (this.is_layer_selected(name) === false) {
				continue;
			}
			if (weights[0]==undefined) { // couche sans poids
				let decalage=this.draw_empty(ctx, base, infos);
				base+=decalage;
			} else if (weights[0][0]==undefined) { // poids à une seule dimension : ne devrait pas exister :/
				let decalage=this.draw_empty(ctx, base, infos);
				base+=decalage;
			} else if (weights[0][0][0]==undefined) { // poids à 2 dimensions => affichage des points + des lignes
				let bool_input=true;
				if (idx_layer == 0) { // si 1ere couche => on affiche les input
					bool_input=true;
				}
				this.draw_couche_dense (ctx, base, weights, biais, {input:bool_input});
				base+=this.espace_layers;
			} else if (weights[0][0][0][0]==undefined) { // poids à 3 dimensions => affichage des points + des lignes
				let decalage=this.draw_empty(ctx, base, infos);
				base+=decalage;
			} else if (weights[0][0][0][0][0]==undefined) { // poids à 4 dimensions => type conv2d ou maxpool2d...
				let decalage=this.draw_conv2d (ctx, base, weights, {});
				base+=decalage;
			} else {
				let decalage=this.draw_empty(ctx, base, infos);
				base+=decalage;
			}
			
		} // fin du pour chaque layer
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// affiche de manière dynamique l'historique d'apprentissage
	// obligé de mettre 'drawings.xxx' au lieu de 'this.xxx' car on perd la référence à l'objet avec le settimeout :/
	this.draw_weights_history = function (canvas, idx) {
		let timeout=1000;
		let taille=chef_orchestre.weights_history.length;
		let weights=chef_orchestre.weights_history_get(idx);
		if (weights.length == 0) {
			return (true);
		}
		drawings.draw_weights(canvas, weights, {label:String(idx)+" / "+String(taille-1)});
		
		setTimeout (drawings.draw_weights_history, timeout, canvas, idx+1);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// affiche de manière dynamique l'évolution des poids
	// obligé de mettre 'drawings.xxx' au lieu de 'this.xxx' car on perd la référence à l'objet avec le settimeout :/
	this.draw_weights_modif_history = function (canvas, last_weights, idx) {
		let timeout=1000;
		let taille=chef_orchestre.weights_history.length;
		let weights=chef_orchestre.weights_history_get(idx);
		if (weights.length == 0) {
			return (true);
		}
		if (last_weights.length==0) { // si premier affichage
			//last_weights=weights.slice(); // les 2 tableaux seront identiques (le résultat sera nul)
			last_weights=JSON.parse(JSON.stringify(weights)); // seule manière de dupliquer plusieurs array imbriquées :/
		}
		
		let modif=JSON.parse(JSON.stringify(weights)); // on duplique les poids. On modifiera [weights] et [biais] pour chaque couche
		for (idx_couche in weights) {
			let diff_weights=drawings.calcule_diff_weights (last_weights[idx_couche]["weights"], weights[idx_couche]["weights"]);
			let diff_biais=drawings.calcule_diff_weights (last_weights[idx_couche]["biais"], weights[idx_couche]["biais"]);
			modif[idx_couche]["weights"]=diff_weights;
			modif[idx_couche]["biais"]=diff_biais;
		}

		drawings.draw_weights(canvas, modif, {label:String(idx)+" / "+String(taille-1)});
		
		setTimeout (drawings.draw_weights_modif_history, timeout, canvas, weights, idx+1);
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// calcule de manière récusrsive la différence entre 2 tableaux de poids
	// NOTE : j'aurais dû passer par denfo => non ! c'est de ma merde :/
	this.calcule_diff_weights = function (old_weights, weights) {
		let retour=[];
		for (idx_weight in weights) {
			let old_weight=old_weights[idx_weight];
			let weight=weights[idx_weight];
			if (weight.length != undefined) { // si tableau => récursivité
				console.log ("diff weight récursivité");
				retour[idx_weight]=this.calcule_diff_weights(old_weight, weight);
			} else {
				retour[idx_weight]=weight-old_weight;
			}
		}

		return(retour);

	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Trace des traits entre 2 couches de neurones
	// weights doit avoir 2 dimensions. La dimension [0] sert à déterminer les positions du base
	// [0][0] sert à déterminer les positions du haut
	// trace également les points du haut et ceux du bas uniquement si params[input]==true (couche d'entrée)
	this.draw_couche_dense = function (ctx, base, weights, biais, params) {
		let input=params["input"];
		let n_bas=weights[0];
		let n_haut=n_bas[0];

		let bas=this.calcule_points(base+this.espace_layers, weights.length);
		let haut=this.calcule_points(base, weights[0].length);
		
		let min_max=this.get_min_max(weights);
		
		// affichage des traits
		for (idx_bas in bas) { // pour chaque neurone de la couche basse
			for (idx_haut in haut) { // pour chaque neurone de la couche haute
				let weight=weights[idx_bas][idx_haut];
				let couleur=this.calcule_couleur(weight, min_max);
				this.draw_trait (ctx, bas[idx_bas], haut[idx_haut], couleur);
			} // fin du haut
		} // fin du bas
		
		// affichage des points
		this.draw_points (ctx, haut, biais);
		if (input==true) {
			this.draw_points (ctx, bas, []);
		}
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// trace un trait entre 2 points d'une couleur donnée
	this.draw_trait=function (ctx, a, b, couleur) {
		ctx.strokeStyle = couleur;
		ctx.lineWidth = this.lineWidth;
		ctx.beginPath();
		ctx.moveTo(a[0]+(this.width_rect/2), a[1]+(this.width_rect/2)); // on va sur le neurone du bas
		ctx.lineTo(b[0]+(this.width_rect/2), b[1]+(this.width_rect/2)); // on trace jusqu'au neurone du haut
		ctx.closePath();
		ctx.stroke();
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// trace des points sur une ligne 
	this.draw_points=function (ctx, points, weights) {
		ctx.fillStyle = "rgb(255, 165, 0)"; // temp
		let min_max=this.get_min_max(weights);
		for (idx_point in points) {
			let weight=weights[idx_point];
			let couleur=this.couleur_input; // couleur par défaut
			if (weight != undefined) {
				couleur=this.calcule_couleur(weight, min_max);
			}
			let point=points[idx_point];
			ctx.fillStyle = couleur;
			ctx.fillRect(point[0], point[1], this.width_rect, this.width_rect);
		}
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Calcule la couleur d'un trait ou d'un point en fonction du poids
	this.calcule_couleur = function (weight, params) {
		let retour="";
		let min_neg=params["min_neg"];
		let max_neg=params["max_neg"];
		let min_pos=params["min_pos"];
		let max_pos=params["max_pos"];
		
		let diff_neg=Math.abs(max_neg-min_neg);
		let diff_pos=Math.abs(max_pos-min_pos);

		let couleur_main;
		let couleur_compl;
		let max_compl=65;
		if (weight >= 0) {
			couleur_main=Math.round((this.intensite_lignes / diff_pos)*weight);
		} else {
			couleur_main=Math.round((this.intensite_lignes / diff_pos)*weight*-1);
		}
		if (couleur_main <= (this.intensite_lignes/2)) {
			couleur_compl=(max_compl / (this.intensite_lignes/2)) * couleur_main;
		} else {
			couleur_compl=(max_compl*2)-((max_compl / (this.intensite_lignes/2)) * couleur_main);
		}
		couleur_compl=Math.round(couleur_compl);

		if (weight < 0) {
			retour = "rgb("+couleur_main+", "+couleur_compl+", "+couleur_compl+")"; // si valeur négative => rouge
		} else if (weight => 0) {
			retour = "rgb("+couleur_compl+", "+couleur_main+", "+couleur_compl+")"; // si valeur négative => vert
		} else { // weight == 0
			retour = "rgb(150, 150, 150)"; // gris
		}
		return (retour);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// retourne les valeurs min et max en négatif et en positif
	// si weights est une array d'array (ou plus) le fait de manière récursive
	this.get_min_max = function (valeurs) {
		let retour={min_pos:Infinity, min_neg:-0.00000001, max_pos:0.00000001, max_neg:Infinity*-1};

		for (let idx=0; idx < valeurs.length; idx++) {
			let val=valeurs[idx];
			if (Array.isArray(val)) {
				let tmp=this.get_min_max(val);
				if (tmp["min_neg"] < retour["min_neg"]) {
				retour["min_neg"]=tmp["min_neg"];
				}
				if (tmp["max_neg"] > retour["max_neg"]) {
					retour["max_neg"]=tmp["max_neg"];
				}
				if (tmp["max_pos"] > retour["max_pos"]) {
					retour["max_pos"]=tmp["max_pos"];
				}
				if (tmp["min_pos"] < retour["min_pos"]) {
					retour["min_pos"]=tmp["min_pos"];
				}
			} else {
				if (val < 0) { // SI NEGATIF
					if (val < retour["min_neg"]) {
						retour["min_neg"]=val;
					}
					if (val > retour["max_neg"]) {
						retour["max_neg"]=val;
					}
				} else { // SI POSITIF OU 0
					if (val < retour["min_pos"]) {
						retour["min_pos"]=val;
					}
					if (val > retour["max_pos"]) {
						retour["max_pos"]=val;
					}
				}
			}
		}
		return (retour);
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// Calcule la position de points sur une même base
	this.calcule_points = function (base, nb_points) {
		let points=[];
		
		let espace=(this.width-(2*this.border))/(nb_points+1);
		for (idx=0 ; idx<nb_points ; idx++) {
			let x=this.border+((idx+1)*espace);
			points.push([x,base]);
		}
		return (points);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// RAZ le canvas
	this.raz_canvas = function (ctx) {
		ctx.clearRect(0, 0, this.width, this.height);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// dessine une couche de type conv2d avec des weigts ayant la forme [height][width][channels][kernels]
	// l'affichage se compose de kernels (ayant chacun une hauteur et uen largeur). ils sont regroupés sur la même ligne
	// avec une ligne par channel (donc 1, 3 ou 4 lignes) autant de colonne que de kernels et dans chaque case un kernel de height * width neurones ayant chacun une couleur liée à son poids 
	this.draw_conv2d = function (ctx, base, weights, params) {
		let height=weights.length;
		let width=weights[0].length;
		let channels=weights[0][0].length;
		let kernels=weights[0][0][0].length;
		let min_max=this.get_min_max(weights);
		
		base+=this.conv_dist_layers;

		let taille_kernel=(width*this.conv_taille_neurone)+((width-1)*this.conv_dist_neurones); // largeur d'un kernel en comptant la taille d'un neurone et celle des espaces
		let taille_kernels=(kernels*taille_kernel)+((kernels-1)*this.conv_dist_kernels); // largeur totale de tous les kernels (selon le nb de kernels)
		let hauteur_kernel=(height*this.conv_taille_neurone)+((height-1)*this.conv_dist_neurones); // hauteur d'un kernel en comptant la taille d'un neurone et celle des espaces
		let hauteur_kernels=(channels*hauteur_kernel)+((channels-1)*this.conv_dist_kernels); // hauteur totale de tous les kernels (selon le nb de channels)
		let gauche=(this.width-taille_kernels-(2*this.border))/2; // position à gauche des neurones
		
		let x=gauche;
		let y=base;
		for (idx_height=0 ; idx_height < height ; idx_height++) {
			for (idx_width=0 ; idx_width < width; idx_width++) {
				for (idx_channel=0 ;idx_channel < channels ; idx_channel++) {
					for (idx_kernel=0 ; idx_kernel<kernels ; idx_kernel++) {
						let weight=weights[idx_height][idx_width][idx_channel][idx_kernel];
						let couleur=this.calcule_couleur(weight, min_max);
						ctx.fillStyle = couleur;
						x=gauche+(idx_kernel*(taille_kernel+this.conv_dist_kernels))+(idx_width*(this.conv_taille_neurone+this.conv_dist_neurones));
						y=base+(idx_channel*(hauteur_kernel+this.conv_dist_kernels))+(idx_height*(this.conv_taille_neurone+this.conv_dist_neurones));
						ctx.fillRect(x, y, this.conv_taille_neurone, this.conv_taille_neurone);
					} // fin du pour chaque kernel
				} // fin du pour chaque channel
			} // fin du pour chaque width
		} // fin du pour chaque height

		return (hauteur_kernels+this.conv_dist_layers);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// dessine une couche sans poids
	this.draw_empty = function (ctx, base, infos) {
		let name=infos["name"]
		ctx.fillStyle = this.empty_couleur;
		ctx.fillRect(this.border, base+this.conv_dist_layers, this.width-(2*this.border), this.empty_height);
		ctx.fillStyle = this.text_couleur;
		ctx.font = "25px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(name, this.border+(this.width/2), base+this.conv_dist_layers+(this.empty_height/2));
		return (this.empty_height+this.conv_dist_layers);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// affiche du texte en haut à droite du canvas
	this.affiche_label = function(ctx, label) {
		ctx.fillStyle = this.text_couleur;
		ctx.font = "25px sans-serif";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		ctx.fillText(label, this.width-100, 100);
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// affiche les sorties des couches
	this.draw_outputs = function (canvas, div, params) {
		let affichage=params["affichage"]; // texte ou img
		let inputs=this.predictions_organizer.get_tenseurs();
		let outputs=this.get_outputs(inputs, []);
		let texte="";
		let intitules_attention=undefined;

		affichage="texte";
		
		for (idx_layer in outputs) {
			let name=outputs[idx_layer]["name"];
			if (this.is_layer_selected(name) === false) {
				continue;
			}
			let output=outputs[idx_layer]["array"][0];// le [0] correspond à la dimensiond e batch (toujours 1 seul élémetn qu'on ne représente pas)
			texte+="couche "+idx_layer+" : "+name+"  "+this.get_tableau(output)+"<br><br>";

			// pour les couches d'attention, affichage en + des poids d'attention
			if (outputs[idx_layer]["attention_weights_array"] != undefined) {
				if (intitules_attention==undefined) { // on ne récupère les intitulés que la 1ere fois... sera les mêmes pour toutes les couches d'attention
					intitules_attention=this.get_intitules_attention(inputs[0]); // on se base sur le 1er input. Si plusieurs inputs, trop compliqué...
				}
				texte+="couche "+idx_layer+" : "+name+" --- attention weights ---  "+this.get_tableau_attention(outputs[idx_layer]["attention_weights_array"][0], intitules_attention)+"<br><br>";
			}
		}

		if (affichage === "texte") {
			$(div).html(texte);
		}
		
		// dispose
		try {
			tf.dispose (inputs);
			tf.dispose (outputs);
		} catch (e) {
			console.log ("on essaye de dispose dans drawings.draw_outputs mais...");
			console.log(e);
		}
	}

	////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// récupère les mots passés en entrée (transformer) pour l'affichage des poids d'attention
	this.get_intitules_attention = function (input) {
		let tableau=input.cast("int32").arraySync();
		let codes=tableau[0]; // 1 seul élement (dimension du batch
		let tokenizer;
		let retour=[];
		for (let idx_tokenizer in tokenizers) {
			tokenizer = tokenizers[idx_tokenizer]; // on récupère le 1er tokenizer
			break;
		}
		for (let idx_codes in codes) {
			retour[idx_codes]=tokenizer.decode([codes[idx_codes]], {});
		}

		return (retour);

	}
	
	// Fonction récursive qui va générer les outputs de chaque couche du modèle en fonction des outputs déjà générés des couches précédentes
	// gère les modèles avcec plusieurs entrées, noeuds multiples...
	// lors du premier appel, inputs contient les tenseurs d'entrée modèle retournés par prediction_organizer.get_tenseurs();
	// parents [0,1,2][name | id | output = tenseur de sortie | array] les id et idx du tableau sont les mêmes. Ce sont des identifiants uniques dournis par TF. ça ne commence pas forcément à 0
	this.get_outputs = function(inputs, parents) {
		let model=this.model_organizer["model"];
		let input_layers=model["inputLayers"];
		let output_layers=model["outputLayers"];
		let layers=model["layers"];
		
		let bool_trouve=false; // est-ce qu'on a réussi à générer au moins 1 output lors de ce passage

		// si 1er appel de la fonction, on enregegistre les tenseurs d'entrée du modèle comme sortie des couches d'entrée
		if (inputs.length != 0) {
			for (let idx_input in input_layers) {
				let input_layer=input_layers[idx_input];
				let id=input_layer["id"];
				parents[id]=[];
				parents[id]["output"]=inputs[idx_input]; // tenseur d'entrée du modèle. les tenseurs de inputs sont dans le même ordre que les couche d'entrée de input_layers
				parents[id]["array"]=parents[id]["output"].arraySync();
				parents[id]["name"]=input_layer["name"];
				parents[id]["id"]=input_layer["id"];
			}
		}
		
		// on calcule les sorties de toutes les couches dont on connait déjà les inputs
		for (let idx_layer in layers) {
			let layer=layers[idx_layer];
			let id=layer["id"];
			let name=layer["name"];
			let inputs=[];
			
			// si nécessaire on crée parents[id]
			if (parents[id] == undefined) {
				parents[id]=[];
			}
			
			// on regarde si on a déja généré l'output de ce layer
			if (parents[id]["output"] != undefined) {
				continue; // on passe au layer suivante
			}
			
			// 1) on récupère les inputs du layer si on les a
			for (let a in layer["inboundNodes"]) {
				let bool_continue=true;
				for (let b in layer["inboundNodes"][a]["inboundLayers"]) { // je ne sais pas exactement à quoi correspondent ces 2 niveaux :/
					let input=layer["inboundNodes"][a]["inboundLayers"][b];
					let id_input=input["id"];
					let name_input=input["name"];
					if (parents[id_input]["output"] === undefined) {
						inputs=[];
						bool_continue=false; // pour sortir de la 2e boucle
						break;
					}
					inputs.push(parents[id_input]["output"]);

				}
				if (bool_continue === false) {
					break; // on est obligé de faire ça car en JS break ne sait pas sortir de boucles imbriquées :/
				}
			}
			
			// 2) si on a les inputs on génère l'output
			if (inputs.length > 0) {
				try {
					let tf_layer=model.getLayer(name);
					let output=tf_layer.apply(inputs);
					parents[id]["id"]=id;
					parents[id]["name"]=name;
					parents[id]["output"]=output;
					parents[id]["array"]=parents[id]["output"].arraySync();
					bool_trouve=true;

					// si couche d'attention on récupère aussi les poids d'attention en plus de la sortie
					if (tf_layer["iswbAttentionWeights"] === true) {
						let attention_weights=tf_layer.apply(inputs, {bool_return_weights: true});
						parents[id]["attention_weights"]=attention_weights;
						parents[id]["attention_weights_array"]=attention_weights.arraySync();
					}
				} catch (e) {
					console.log (e);
					alert ("erreur dans drawings.get_outputs() : "+e);
					return (false);
				}
			}
	
			
		} // fin du pour chaque layer
		
		// 3) on relance la fonction récursivement tant qu'on génère de nouveaux outputs
		if (bool_trouve===true) {
			parents=this.get_outputs([], parents);
		} 
		
		// retour
		return (parents);
		
		
		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// retourne un tableau en html
	this.get_tableau = function (output) {
		let texte="";
		if (output === undefined) {
			texte+="retour undefined";
		} else if (output[0] === undefined) { // retout à 0 dimension => ne devrait pas exister
			texte+=output;
		} else if (output[0][0] === undefined) { // retout à 1 dimension (p.e une liste de chiffres
			texte+=this.get_tableau_1d(output);
		} else if (output[0][0][0] === undefined) {	// retour à 2 dimensions => ne devrait pas exister 
				texte+=this.get_tableau_2d(output);
		} else if (output[0][0][0][0] === undefined) {	// retour à 3 dimensions => image 
			texte+=this.get_tableau_3d(output);
		} else {	// retour > 3 => pas affichable 
			texte+="Retour à plus de 3 dimensions";
		}
		return(texte);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// retourne un tableau 1d en html
	this.get_tableau_1d = function (tableau) {
		let min_max=this.get_min_max(tableau);
		
		let retour="<table class='drawings_outputs texte'><tr>";
		for (let idx in tableau) {
			let couleur=this.calcule_couleur(tableau[idx], min_max);
			//let str_short=String(tableau[idx]).substring(0,6);
			let str_short="&nbsp;";
			//retour+="<td title='"+String(tableau[idx])+"' style='background-color:"+couleur+"' class='drawings_value'><span >"+str_short+"</span></td>";
			retour+="<td title='"+String(tableau[idx])+"' style='background-color:"+couleur+"' class='drawings_value'> </td>";
		}
		retour+="</tr></table>";
		return (retour);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// retourne un tableau 2d en html
	this.get_tableau_2d = function (tableau) {
		let retour="<table class='drawings_outputs texte'>";
		let min_max=this.get_min_max(tableau);
		for (let idx1 in tableau) {
			retour+="<tr>";
			for (let idx2 in tableau[idx1]) {
				let couleur=this.calcule_couleur(tableau[idx1][idx2], min_max);
				//let str_short=String(tableau[idx1][idx2]).substring(0,6);
				let str_short="&nbsp;";
				//retour+="<td title='"+String(tableau[idx1][idx2])+"' style='background-color:"+couleur+"' class='drawings_value'><span >"+str_short+"</span></td>";
				retour+="<td title='"+String(tableau[idx1][idx2])+"' style='background-color:"+couleur+"' class='drawings_value'> </td>";
			}
			retour+="</tr> \n ";
		}
		retour+="</table>";
		return (retour);
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// retourne un tableau 2d avec intitulés des mots (pour transformers)
	this.get_tableau_attention = function (tableau, intitules) {

		if (intitules.length !== tableau[0].length || intitules.length !== tableau[1].length) { // ça ne marche que si le tableau est carré et a le même nombre d'éléments que les intitulés
			console.log ("impossible d'afficher l'attention : intitules="+intitules.length);
			console.log (intitules);
			return (this.get_tableau_2d(tableau));
		}

		let retour="<table class='drawings_outputs texte'>";
		let min_max=this.get_min_max(tableau);

		// affichage des intitules
		retour+="<tr><td>&nbsp;</td>";
		for (let idx1 in intitules) {
			retour+="<td style='writing-mode: sideways-lr;'>"+String(intitules[idx1])+"</td>";
		}
		retour+="</tr>";

		for (let idx1 in tableau) {
			retour+="<tr>";
			retour+="<td>"+String(intitules[idx1])+"</td>";
			for (let idx2 in tableau[idx1]) {
				let couleur=this.calcule_couleur(tableau[idx1][idx2], min_max);
				let str_short="&nbsp;";
				retour+="<td title='"+String(tableau[idx1][idx2])+"' style='background-color:"+couleur+"' class='drawings_value'> </td>";
			}
			retour+="</tr> \n ";
		}
		retour+="</table>";
		return (retour);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// retourne un tableau 3d en html (doit retourner soit 1, soit 3 soit 4 tableaux 2d
	this.get_tableau_3d = function (tableau) {
		let retour="";
		let tables=[];
		
		// on réorganise le tableau pour mettre la dernière dimension (channels) en premier pour générer 1,3 ou 4 tableaux de 2 dimenions (hauteur / largeur)
		for (let idx1 in tableau) {
			for (let idx2 in tableau[idx1]) {
				for (let idx3 in tableau[idx1][idx2]) {
					let elem=tableau[idx1][idx2][idx3];
					if (tables[idx3] === undefined) {
						tables[idx3]=[];
					}
					if (tables[idx3][idx1] === undefined) {
						tables[idx3][idx1]=[];
					}
					tables[idx3][idx1][idx2]=elem;
				}
			}
		}
		
		// pour chacun des tableaux on le génère en html et on les met en regard dans un grand tableau
		retour="<table class='drawings_output container_3d'><tr><td>";
		let html="";
		for (let idx in tables) {
			html=this.get_tableau_2d(tables[idx]);
			retour+="<td class='container_3d'>"+html+"</td>";
		}
		retour+="</td></tr></table>";
		return (retour);

	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// affiche le formulaire pour afficher les layers à afficher
	this.affiche_form_select_layers =function () {
		let html="";
		html+="<input id='drawings_layers_check_all' type='checkbox' onchange='drawings.drawings_layers_check_all()' checked></input>"
		html+="<table id='drawings_layers_select_multi'><tr><td>&nbsp;</td><td>col.</td></tr>";
		for (let idx in model_organizer.layers) {
			let name=model_organizer.layers[idx]["name"];
			let html_checked=" checked ";
			if (drawings.is_layer_selected(name) === false) {
				html_checked=" ";
			}
			html+="<tr><td><input type='checkbox' value='"+name+"' "+html_checked+"></td>";
			html+="<td>"+name+"</td></tr>";
		}
		html+="</table>";
		html+="<button onclick='drawings.select_layers()'>OK</button>";
		$("#"+drawings.formulaire_layer).html(html);
		drawings.formulaire = $("#"+drawings.formulaire_layer).dialog({autoOpen: false, height: 600, width: 450, modal: true, position: { my: "center top", at: "top+100", of: window } });
		drawings.formulaire.dialog("open");

	}

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// enregistre les layers à afficher
	this.select_layers =function () {
		drawings.layers_a_afficher=[];
		$("#drawings_layers_select_multi input:checked").each(function(i){
			let idx_data=$(this).val();
			drawings.layers_a_afficher.push(idx_data)
		})
		drawings.formulaire.dialog("close");
	}

	////////////////////////////////////////////////////////////////////////////
	// coche toutes les cases du formulaire select layers
	// appelé par un event donc n'a pas accès à this :/
	this.drawings_layers_check_all = function () {
		let check=$("#drawings_layers_check_all");
		let action="";
		if (check.prop("checked") === true) {
			action="check";
		}
		$("#drawings_layers_select_multi input").each(function(i){
			if (action=="check") {
				$(this).prop("checked", true);
			} else {
				$(this).prop("checked", false);
			}
		})
	}

	////////////////////////////////////////////////////////////////////////////
	// vérifie si un layer est sélectionné ou pas (return true|false)
	// si this.layers_a_afficher est vide retourne true
	this.is_layer_selected = function (name) {
		if (this.layers_a_afficher.length === 0) {
			return true;
		}

		if (this.layers_a_afficher.indexOf(name) === -1) {
			return false;
		} else {
			return true;
		}
	}
	
	
	
	
} // fin de la classe
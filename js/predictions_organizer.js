 function predictions_organizer (params) {
 
 this.zone_predictions_form=params["zone_predictions_form"];
 this.zone_predictions_resultat=params["zone_predictions_resultat"];
 this.nom_predictions_organizer="predictions_organizer";
 this.nb_head=3; // nombre de premiers résultats à afficher pour chaque résultat de type cat
 
 this.table_organizer=table_organizer;
 this.model_organizer=model_organizer;
 this.lnk_data_model=lnk_data_model;

 this.ids_col_texte=[]; // idx des colonnes de type texte (pour ajouter des mots dynamiquement)
 this.nb_tokens_query=0;
 this.tenseur_image_bruitee=undefined; // pour la diffusion
 this.id_col_image_bruitee=undefined;
 this.diffusion_history=[];
 
 ////////////////////////////////////////////////////////////////////////////
 this.init = function() {
	 let html="";
	 this.ids_col_texte=[];
	 html+="<button onclick='"+this.nom_predictions_organizer+".refresh_formulaire();'>"+glob_get_intitule("button_refresh_form")+"</button>";
	 $("#"+this.zone_predictions_form).html(html);
	 try {
		 tf.dispose(this.tenseur_image_bruitee);
		 this.tenseur_image_bruitee=undefined;
		 tf.dispose(this.diffusion_history);
		 this.diffusion_history=[];
	 } catch (e) {
		 // on en fait rien
	 }
 };
 
 ////////////////////////////////////////////////////////////////////////////
 // génère le formulaire pour toutes les couches d'entrées et pour chacune d'elles pour chaque data
 // champ différent selon le type de data (num, cat, img...)
 this.refresh_formulaire = function() {
	this.init();
	let a_afficher=[]
	let html="";
	let inputs=this.lnk_data_model["links"]["inputs"];
	html+="<table class='wbpo_formulaire'>";
	
	for (idx_input in inputs) { // pour chaque couche d'entrée...
		let input=inputs[idx_input];
		let idx_couche=input["idx_couche"];
		let name_couche=input["name_couche"];
		let data=input["data"];
		for (idx_data in data) { // pour chaque date associé à cette couche
			let id_col=data[idx_data];
			let type=this.table_organizer.definition[id_col]["type"];
			let name=this.table_organizer.definition[id_col]["name"];
			let one_hot=this.table_organizer.definition[id_col]["one_hot"];
			let encoder=this.table_organizer.definition[id_col]["encoder"];
			let labels=this.table_organizer.definition[id_col]["labels"];
			let img_height=this.table_organizer.definition[id_col]["img_height"];
			let img_width=this.table_organizer.definition[id_col]["img_width"];
			let img_channels=this.table_organizer.definition[id_col]["img_channels"];
			let diffusion_role=this.table_organizer.definition[id_col]["diffusion_role"]; // pour la diffusion : noise | step | noised_image
			let html_diffusion_role="";
			if (diffusion_role !== "" && diffusion_role !== undefined){
				html_diffusion_role=" diffusion_role='"+diffusion_role+"' ";
			}
		
			if (type == "num") {
				html+="<tr><td><label>"+name+" : </label></td><td><input idx_couche='"+idx_couche+"' name_couche='"+name_couche+"' id_col='"+id_col+"' "+html_diffusion_role+" value='0' ></td>";
				html+="<td class='slider'>&nbsp;&nbsp;<div class='slider' idx_couche='"+idx_couche+"' name_couche='"+name_couche+"' slider_id_col='"+id_col+"' ></div></td></tr>";
			} else if (type === "cat") {
				html+="<tr><td><label>"+name+" : </label></td><td><select idx_couche='"+idx_couche+"' name_couche='"+name_couche+"' id_col='"+id_col+"'  onchange='"+this.nom_predictions_organizer+".onchange_formulaire();'>";
				for (id_cat in encoder["$labels"]) {
					let code=encoder["$labels"][id_cat];
					if (labels[code] !== undefined) {
						code=labels[code];
					}
					html+="<option value='"+id_cat+"'>"+code+"</option>";
				}

				html+="</select></td><td>&nbsp;</td></tr>";
			} else if (type == "img" || type == "img_bytes" || type == "img_fille" || type == "img_bytes_fille") {
				let html_button_generate_noise="<td>&nbsp;</td>";
				if (diffusion_role === "noised_image") {
					html_button_generate_noise="<td><button onclick='"+this.nom_predictions_organizer+".genere_tenseur_image_bruitee("+img_height+","+img_width+","+img_channels+","+id_col+");'>"+glob_get_intitule("button_genere_tenseur_image_bruitee")+"</button> </td>";
				}
				html+="<tr><td><label>"+name+" : </label></td><td><input type='file'  idx_couche='"+idx_couche+"' name_couche='"+name_couche+"' id_col='"+id_col+"' onchange='"+this.nom_predictions_organizer+".onchange_img("+id_col+");'><canvas height='"+img_height+"' width='"+img_width+"' id_col='"+id_col+"'></canvas></td>"+html_button_generate_noise+"</tr>";
			} else if (type === "text" ||  type === "text_fille") {
				this.ids_col_texte.push(id_col);
				html+="<tr><td><label>"+name+" : </label></td><td><textarea idx_couche='"+idx_couche+"' name_couche='"+name_couche+"' id_col='"+id_col+"' > </textarea></td>";
			}
		}
		
	}
	html+="</table><br />";
	html+="<table><tr><td><button onclick='"+this.nom_predictions_organizer+".refresh_formulaire();'>"+glob_get_intitule("button_refresh_form")+"</button></td><td><button onclick='"+this.nom_predictions_organizer+".predict();'>"+glob_get_intitule("button_make_prediction")+"</button> </td><td> <label for=\"po_bool_predict_on_change\">"+glob_get_intitule("label_predict_on_change")+"</label> <input type=\"checkbox\" id=\"po_bool_predict_on_change\"/> </td></tr></table>";

	$("#"+this.zone_predictions_form).html(html);
    if (glob_number_field_max - glob_number_field_min > 0) {
        $("#" + this.zone_predictions_form + " div.slider").slider({
            value: 0,
            step: 0.001,
            min: glob_number_field_min,
            max: glob_number_field_max,
            slide: function (event, ui) {
                let valeur = ui.value;
                let id_col = $(event.target).attr("slider_id_col");
                let chaine = "#zone_predictions_form table.wbpo_formulaire [id_col='" + id_col + "']";
                $(chaine).first().val(valeur);
                predictions_organizer.onchange_formulaire();

            }
        });
    }
	$("#po_bool_predict_on_change").checkboxradio({icon: false});
 
 };
 
  ////////////////////////////////////////////////////////////////////////////
  // affiche l'image dans le canva
 this.onchange_img = async function (id_col) {
	 
	 let input=$("#"+this.zone_predictions_form+" input[id_col='"+id_col+"']").get(0);
	 let canvas=$("#"+this.zone_predictions_form+" canvas[id_col='"+id_col+"']").get(0);
	 let cx=canvas.getContext("2d");
	 if (this.table_organizer.definition[id_col]["diffusion_role"] == "noised_image") {
		 await tf.browser.toPixels (normalizeToRange(this.tenseur_image_bruitee, 0, 1), canvas);
		 return;
	 }

	 let file=input.files[0];
	 let blobUrl = URL.createObjectURL(file);
	 let img = document.createElement("img");
	 let height=this.table_organizer.definition[id_col]["img_height"];
	 let width=this.table_organizer.definition[id_col]["img_width"];
	 
	 //let img = new Image (28,28);
	 img.onload = () => {
        URL.revokeObjectURL(blobUrl);
        cx.drawImage(img, 0, 0, height, width);
     };
	 img.src = blobUrl;

 };
 
 ///////////////////////////////////////////////////////////////////////////////
 // prédiction
 // Attention : pour l'instant, on ne sait gérer qu'une image par entrée (si on met plusieurs images sur la même entrée, ça ne génèrerait pas juste une image plus grande : ça rajouterait une dimension)
 // si on veut mettre plusieurs images sur une entrée, il faudra trouver une solution pour fusionner les images (pas juste les empiler)
 // pas sûr que ce soit utile en vérité...
 
 this.predict = function () {
	
	let tenseurs=this.get_tenseurs();
	
	try {
		const tmp=chef_orchestre.model.predict(tenseurs);
		let resultat=[];
		if (chef_orchestre.model.outputNames.length == 1) {
			resultat.push(tmp); // dans tous les cas, on doit retourner une array de tenseurs, même s'il n'y a qu'une couche de sortie
		} else {
			resultat=tmp; // si plusieurs couches de sortie, tmp est déjà une array de tenseurs
		}

		tf.dispose(tenseurs);
		// affichage 
		this.affiche (resultat); // async
	} catch (e) {
		console.log(e);
		alert ("prediction_organizer::predict()"+e.message);
	}
 };
 
 ///////////////////////////////////////////////////////////////////////////////
 // Récupère les tenseurs
 this.get_tenseurs = function () {

	let requete={}; // les données du formulaire sous forme d'array
	let tenseurs=[];
	
	for (idx_named in chef_orchestre.model.inputNames) { // pour chaque couche d'entrée dans l'ordre défini par le modèle
		let name_couche=chef_orchestre.model.inputNames[idx_named];
		let input=this.get_couche_by_name(name_couche, this.lnk_data_model["links"]["inputs"]);
		let idx_couche=input["idx_couche"];
		let diffusion_role; // défini une seule fois par couche d'entrée

		requete[name_couche]=[];
		
		let data=input["data"];
		for (idx_data in data) { // pour chaque data associé à cette couche
			id_col=data[idx_data];
			let type=this.table_organizer.definition[id_col]["type"];
			let min=Number(this.table_organizer.definition[id_col]["min"]);
			let max=Number(this.table_organizer.definition[id_col]["max"]);
			let normalize=this.table_organizer.definition[id_col]["normalize"]; // string "true" ou "false"
			let normalization_range=this.table_organizer.definition[id_col]["normalization_range"].split(":");
			let min_range=Number(normalization_range[0]);
			let max_range=Number(normalization_range[1]);
			let delta_range=Number(max_range - min_range);
			let delta=Number(max - min);
			let text_tokenizer=this.table_organizer.definition[id_col]["text_tokenizer"];
			let text_size=Number(this.table_organizer.definition[id_col]["text_tokenizer_size"]);
			let text_bool_one_hot=this.table_organizer.definition[id_col]["text_bool_one_hot"];
			let text_type_generation=this.table_organizer.definition[id_col]["text_type_generation"];
			diffusion_role=this.table_organizer.definition[id_col]["diffusion_role"];
			let height=Number(this.table_organizer.definition[id_col]["img_height"]);
			let width=Number(this.table_organizer.definition[id_col]["img_width"]);
			let img_channels=Number(this.table_organizer.definition[id_col]["img_channels"]);
			let tokenizer=tokenizers[text_tokenizer];

			let val_normalize;

			let one_hot=this.table_organizer.definition[id_col]["one_hot"];
			let elem=$("#"+this.zone_predictions_form+" table.wbpo_formulaire [id_col='"+id_col+"']"); // on récupère l'élément de formulaire par son id_col (attention dans les cas des img il y en a 2 : input et canvas)
			if (type == "num") {
				let val=Number(elem.first().val());
				if (normalize == "true") {
					val_normalize=(val-min)*(delta_range / delta) + min_range;
				} else {
					val_normalize=val;
				}
				requete[name_couche].push(val_normalize);
			} else if (type == "cat") {
				let val=elem.first().val();
				for (let idx=0 ; idx < one_hot.length; idx++) {
					if (idx == val) {
						requete[name_couche].push(1);
					} else {
						requete[name_couche].push(0);
					}
				}
			} else if (type == "img" || type == "img_bytes" || type == "img_fille" || type == "img_bytes_fille") { // /!\ pour l'instant on ne gère qu'une seule image par entrée
				// si on est en cours de diffusion, on fournit une image bruitée ou du bruit pur /!\ pas normalisé
				if (diffusion_role === "noised_image" && this.tenseur_image_bruitee !== undefined && this.tenseur_image_bruitee !== "" ) { // si on a généré une image bruitée aléatoire
					requete[name_couche]=this.tenseur_image_bruitee.arraySync(); // sinon on récupère image étape précédente
				} else { // sinon on récupère l'image du formulaire
					let canvas = elem.get(1); // on prend le 2e élément, car le 1er correspond au <input>
					requete[name_couche] = tf.tidy(() => {
						if (normalize == "true") {
							return (tf.browser.fromPixels(canvas, img_channels).mul(delta_range / 255).add(min_range).arraySync()); // le tenseur image est converti en array pour être traité comme les autres types d'entrées. Il sera reconverti en tenseur plus loin
						} else {
							return (tf.browser.fromPixels(canvas, img_channels).arraySync());
						}
					});
				}

			} else if (type === "text" || type === "text_fille") {
				let val=elem.first().val();
				
				// 1. tokenize
				let tokens=tokenizer.encode(val, {}); // attention ajoute un caractère début et fin si word_tokenizer
				tokens.pop(); // on enlève le dernier élément qui est le token de fin ?????
				if (text_type_generation === "guess_around") {
					tokens=[tokens[1]]; // on ne garde que le 2e élément
				}

				this.nb_tokens_query=tokens.length;

				
				// 2. padding
				if (text_size != 0) {
					if (tokens.length > text_size) {
						tokens=tokens.slice (0, text_size);
					} else if (tokens.length < text_size) {
						let debut=tokens.length;
						for (let toto=debut; toto < text_size ; toto++) {
							tokens[toto]=0;
						}
					}
				}

				// 3. one hot
				if (text_bool_one_hot === "true") {
					let vocab_size=get_vocab_size(tokenizer);
					for (idx_token in tokens) {
						let token=tokens[idx_token];
						let one_hot=int_2_one_hot(token, vocab_size);
						tokens[idx_token] = one_hot;
					}
				}

				requete[name_couche]=tokens;
				
			}
		} // fin du pour chaque data
		//tenseurs[name_couche]=tf.tensor(requete[name_couche]).expandDims(0); // on génère le tenseur à partir du tableau et on rajoute la dimension du batch
		let tmp=tf.tidy(() => {
			return(tf.tensor(requete[name_couche]).expandDims(0)); // on génère le tenseur à partir du tableau et on rajoute la dimension du batch
		});
		tenseurs.push(tmp);

		if (diffusion_role === "noised_image") {
			//this.tenseur_image_bruitee=tmp.clone();
			this.tenseur_image_bruitee=tf.tensor(requete[name_couche]); // on enregistre sans dimension du batch
		}

	} // fin du pour chaque couche d'entrée

	return (tenseurs);
	 
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // Affichage
 // en paramètre, une array de tenseurs
  this.affiche = async function (tenseurs) {
	let a_afficher={}; // contiendra les données à afficher sous forme de tableau [name_couche][name_col];
  	let bool_onchange_formulaire=false; // si true on lance onchange_formulaire() ) la fin de l'affichage
	let html="";
	$("#"+this.zone_predictions_resultat).html(""); // on raz l'affichage
	
	// 1. Récupération des données
	for (idx_tenseur in tenseurs) { // pour chaque couche de sortie (et chaque tenseur)
		let tableau=tenseurs[idx_tenseur].arraySync()[0]; // on convertit le tenseur en tableau et on en récupère le premier élément (batch=0)
		let name_couche=chef_orchestre.model.outputNames[idx_tenseur];
		a_afficher[name_couche]={};
		let output=this.get_couche_by_name(name_couche, this.lnk_data_model["links"]["outputs"]);
		let idx_couche=output["idx_couche"];
		let data=output["data"];
		let compteur=0;
		
		for (idx_data in data) {
			let id_col=data[idx_data]; // id de la colonne dans table_organizer.definition
			let type=this.table_organizer.definition[id_col]["type"];
			let name_col=this.table_organizer.definition[id_col]["name"];
			let min=Number(this.table_organizer.definition[id_col]["min"]);
			let max=Number(this.table_organizer.definition[id_col]["max"]);
			let img_width=Number(this.table_organizer.definition[id_col]["img_width"]);
			let img_height=Number(this.table_organizer.definition[id_col]["img_height"]);
			let img_channels=Number(this.table_organizer.definition[id_col]["img_channels"]);
			let one_hot=this.table_organizer.definition[id_col]["one_hot"];
			let text_bool_one_hot=this.table_organizer.definition[id_col]["text_bool_one_hot"];
			let cat_bool_one_hot=this.table_organizer.definition[id_col]["cat_bool_one_hot"];
			let encoder=this.table_organizer.definition[id_col]["encoder"];
			let labels=this.table_organizer.definition[id_col]["labels"];
			let text_tokenizer=this.table_organizer.definition[id_col]["text_tokenizer"];
			let diffusion_role=this.table_organizer.definition[id_col]["diffusion_role"];
			let normalization_range=this.table_organizer.definition[id_col]["normalization_range"].split(":");
			text_bool_one_hot;
			a_afficher[name_couche][name_col]={};
			
			if (type==="num") {
				let valeur=Number(tableau[compteur]);
				let valeur_normalize=(valeur*(max-min))+min;
				a_afficher[name_couche][name_col]={name: name_col, type: type, valeur: valeur, valeur_normalize: valeur_normalize};
				compteur++;
			} else if (type==="cat") {
				let nb_cat=encoder["$labels"].length;
				let valeurs=tableau.slice(compteur, compteur+nb_cat);
				let intitules=[];
				for (let idx_intitule in encoder["$labels"]) {
					let intitule=encoder["$labels"][idx_intitule];
					if (labels[intitule] !== undefined) {
						intitule=labels[intitule];
					}
					intitules.push(intitule);
				}
				a_afficher[name_couche][name_col]={name: name_col, type: type, valeurs: valeurs, intitules: intitules};
			} else if (type == "img" || type == "img_bytes" || type == "img_fille" || type == "img_bytes_fille") {
				a_afficher[name_couche][name_col]={name: name_col, type: type, img: tableau, diffusion_role: diffusion_role, normalization_range: normalization_range}; // pour une image pour l'instant on ne gère qu'une seule par output (on ne découpe pas)
			} else if (type==="text" || type==="text_fille") {
				let infos=this.affiche_text(tableau, {text_tokenizer:text_tokenizer, text_bool_one_hot:text_bool_one_hot});
				a_afficher[name_couche][name_col]={name: name_col, type: type, mode_affichage: infos["mode_affichage"] ,top5:infos["top5"]};
			}

		} // fin du pour chaque data
	} // fin du pour chaque couche de sortie / tenseur

	// 2. Affichage
	for (idx_output in a_afficher) {
		let output=a_afficher[idx_output];
		for (idx_data in output) {
			html=""; // on raz à chaque donnée
			let data=output[idx_data];
			let type=data["type"];
			html += "<br><hr><br><p>"+idx_output+" : "+idx_data+"("+type+")</p>";
			if (type == "num") {
				html+=data["valeur"]+" => "+data["valeur_normalize"];
			} else if (type == "cat") {
				let valeurs=data["valeurs"];
				let intitules=data["intitules"];
				
				// affichage de tous les résultats
				let tr_intitules="";
				let tr_valeurs="";
				for (idx_valeur in valeurs) {
					let valeur=valeurs[idx_valeur];
					let intitule=intitules[idx_valeur];
					tr_intitules+="<td>"+intitule+"</td>";
					tr_valeurs+="<td>"+valeur+"</td>";
				}
				html+="<table><tr>"+tr_intitules+"</tr><tr>"+tr_valeurs+"</tr></table><br>";
				
				// affichage des meilleurs résultats
				let best_results=new dfd.DataFrame({"intitulés":intitules, "valeurs":valeurs});
				best_results.sortValues("valeurs", { ascending: false, inplace: true });
				let best_results_array=best_results.head(this.nb_head).values;
				for (idx_results in best_results_array) {
					html+=best_results_array[idx_results][0]+" : "+best_results_array[idx_results][1]+"<br>";
				}
			} else if ((type == "img" || type == "img_bytes" || type == "img_fille" || type == "img_bytes_fille") && data["diffusion_role"]==="noise") { // si on prédit du bruit
				let img=data["img"];
				let step=$("#"+this.zone_predictions_form+" input[diffusion_role=step]").val();
				if (step <=1) {
					return;
				}

				let image_bruitee=this.tenseur_image_bruitee;
				let bruit=tf.tensor(img).expandDims(); // on rajoute la dimension du batch
				let image_debruitee=this.diffusion_debruiter(image_bruitee, bruit, this.table_organizer.diffusion_schedule, step, glob_diffusion_nb_steps);

				// on enregistre image débruitée dans this.tenseur_image_bruitee pour la prochaine étape de denoising
				try {
					tf.dispose(this.tenseur_image_bruitee);
				} catch (e) {
					// on ne fait rien
				}
				let normalization_range=data["normalization_range"];
				this.tenseur_image_bruitee=image_debruitee.squeeze([0]);
				this.onchange_img(id_col);

				// on maj step
				let next_step=step-glob_diffusion_nb_steps;
				if (next_step <= 1) { // il ne faut pas aller en dessous de 2
					next_step=0;
				} else {
					bool_onchange_formulaire=true; // si demandé on relance automatiquement la prédiction
				}
				$("#"+this.zone_predictions_form+" input[diffusion_role=step]").val(next_step);

				this.diffusion_history.push({step:step, tensor_image:normalizeToRange(image_debruitee.squeeze([0]), 0, 1), tensor_bruit:normalizeToRange(tf.tensor(img), 0, 1)});

				// affichage
				$("#"+this.zone_predictions_resultat).append(html); // on affiche le titre puis on raz html
				html="";
				for (let idx_history in this.diffusion_history) {
					$("#"+this.zone_predictions_resultat).append("<table><tr><td>"+String(this.diffusion_history[idx_history]["step"]).padStart(5, "0")+"</td><td><canvas></canvas></td><td><canvas></canvas></td></tr></table>");
					let canvas_bruit=$("#"+this.zone_predictions_resultat+" canvas").get(-2); // et on la récupère en objet dom (-2 signifie l'avant-dernier des canvas) => bruit
					let canvas_image=$("#"+this.zone_predictions_resultat+" canvas").get(-1); // et on la récupère en objet dom (-1 signifie le dernier des canvas) => image débruitée
					await tf.browser.toPixels (this.diffusion_history[idx_history]["tensor_bruit"], canvas_bruit); //=> attention : le bruit n'est pas borné entre -1 et 1 : si on veut le représenter sous forme de bruit, il faudra le renormaliser
					await tf.browser.toPixels (this.diffusion_history[idx_history]["tensor_image"], canvas_image); // attention à renormaliser aussi
				}

			} else if (type == "img" || type == "img_bytes" || type == "img_fille" || type == "img_bytes_fille") {
				$("#"+this.zone_predictions_resultat).append(html); // on affiche le titre puis on raz html
				html="";
				let img=data["img"];
				$("#"+this.zone_predictions_resultat).append("<canvas></canvas>"); // on ajoute une balise canvas à la fin
				let canvas=$("#"+this.zone_predictions_resultat+" canvas").get(-1); // et on la récupère en objet dom (-1 signifie le dernier des canvas)
				await tf.browser.toPixels (tf.tensor(img), canvas);
			} else if (type == "text" || type == "text_fille") {
				let top5=data["top5"];
				if (data["mode_affichage"] === "one_one_hot") { // affichage pour un seul one hot (un seul mot prédit)
					html += "<table><tr><td>code</td><td>score</td><td>token</td></tr>";
					for (let idx_top5 in top5) {
						let code = top5[idx_top5]["idx"];
						let score = top5[idx_top5]["valeur"];
						let token = top5[idx_top5]["token"];
						html += "<tr><td>" + code + "</td><td>" + score + "</td><td><p class='text_token' onclick='predictions_organizer.add_texte(\"" + token + "\")'> " + token + "</p></td></tr>";
					}
					html += "</table>";
				} else if (data["mode_affichage"] === "multi_one_hot") { // pluseiurs mots prédits
					html+="<table><tr>";
					let nb_rows=top5[0].length;
					// affichage des intitules
					for (let idx_mot in top5) {
						html+="<td>word #"+idx_mot+"</td>";
					}
					html+="</tr>";

					// affichage de chaque cellule
					let html_surligne;
					for (let idx_row=0 ; idx_row < nb_rows ; idx_row++) { // pour chaque ligne
						html+="<tr>";
						let cpt_mot=0;
						for (let idx_mot in top5) { // pour chaque mot
							html_surligne="";
							if (cpt_mot === this.nb_tokens_query-1) {
								html_surligne=" surligne ";
							}
							let code = top5[idx_mot][idx_row]["idx"];
							let score = top5[idx_mot][idx_row]["valeur"];
							let token = top5[idx_mot][idx_row]["token"];
							html+="<td class='"+html_surligne+"'><p title='"+code+" - "+score+"' class='text_token' onclick='predictions_organizer.add_texte(\"" + token + "\")'>" + token+ "</p></td>";
							cpt_mot++;
						}
						html+="</tr>";
					}

					html+="</table>";

				}
				
			}
		} // fin du pour chaque data
		$("#"+this.zone_predictions_resultat).append(html);
		tf.dispose(tenseurs);
		if (bool_onchange_formulaire === true) {
			this.onchange_formulaire();
		}
	} // fin du pour chaque output
 }
 
 ///////////////////////////////////////////////////////////////////////////////
 // Retourne une couche input ou output à partir de son nom (
 // le paramètres couches contient soit [inputs] soit [outputs] de this.lnk_data_model.links
 // renvoie une des couches de this.lnk_data_model.links[inputs | outputs] 
 this.get_couche_by_name = function (name, couches) {
	 for (idx in couches) {
		 let name_couche=couches[idx]["name_couche"];
		 if (name_couche == name) {
			 return (couches[idx]);
		 }
	 }
	 alert (glob_get_intitule("alert_no_such_layer", {"%nom":name}));
 }

 ///////////////////////////////////////////////////////////////////////////////
 // Récupère les infos texte
 //
 this.affiche_text = function (tableau, params) {
	 let text_tokenizer=params["text_tokenizer"];
	 let text_bool_one_hot=params["text_bool_one_hot"];
	 let tokenizer=tokenizers[text_tokenizer];
	 let infos={};
	 infos["top5"]=[];
	 infos["mode_affichage"]="one_one_hot"; // par défaut un seul one haut

	 // peut-être un nombre ou un tableau de nombres (1 ou plusieurs tokens sans one hot) ou bien un tableau de nombre ou un tableau de tableaux (1 ou plusieurs tokens avec one hot)

	 // si tableau à 2 dimensions, mais que la première ne contient qu'un élément, on l'aplatit
	 //console.log ("tableau avant et après aplatissage");
	 //console.log(tableau);
	 if (Array.isArray(tableau) && tableau.length===1) {
		 tableau=tableau[0];
	 }

	 //if (text_bool_one_hot === "true") { ===> test désactivé. En fait avec ou sans one hot la sortie a toujours la même forme (one hot)
		 if (Array.isArray(tableau[0])) { // plusieurs tokens avec one hot
			 infos["mode_affichage"]="multi_one_hot";
			 for (let idx_token in tableau) { // pour chaque mot de la phrase
				 let top5=array_get_head (tableau[idx_token], glob_text_prediction_nb_words); // on récupère les 5 plus probables pour ce mot
				 for (let idx_top5 in top5) {
					 let code=top5[idx_top5]["idx"];
					 let token=tokenizer.decode([Number(code)]);
					 top5[idx_top5]["token"]=token;
				 }
				 infos["top5"][idx_token]=top5;
			 }
		 } else { // 1 seul token avec one hot
			 let top5=array_get_head (tableau, glob_text_prediction_nb_words);
			 for (let idx_top5 in top5) {
				 let code=top5[idx_top5]["idx"];
				 let token=tokenizer.decode([Number(code)]);
				 top5[idx_top5]["token"]=token;
			 }
			 infos["top5"]=top5;
		 }

	 return (infos);

 }

 ///////////////////////////////////////////////////////////////////////////////
 // ajouter un mot à la zone de texte
 //
 this.add_texte = function (texte) {
     let recherche="#"+this.zone_predictions_form+" table.wbpo_formulaire [id_col='"+this.ids_col_texte[0]+"']";
	 let elem=$(recherche); // on récupère le 1er champ texte (pourra changer à l'avenir)
	 let ancien=elem.first().val();
	 if (ancien !== "") {
		 //ancien += " "; // désactive (tmp ??) car dans word_tokenizer il y a un espace au début des tokens
	 }
	 let nouv=ancien+texte;
	 elem.first().val(nouv);
	 this.onchange_formulaire()

 }

 ///////////////////////////////////////////////////////////////////////////////
 // modification du formulaire
 //
 this.onchange_formulaire = function () {
	 let bool_refresh=$("#po_bool_predict_on_change").prop("checked");
	 if (bool_refresh == true) {
		 this.predict();
	 }


 }

	 /**
	  * Débruite une image bruitée sur plusieurs étapes de diffusion (version déterministe, DDIM-like)
	  *
	  * @param {tf.Tensor4D} imageBruitee - Image bruitée à l'étape courante (x_t)
	  * @param {tf.Tensor4D} bruitPredit - Bruit prédit par le modèle (ε_θ(x_t, t))
	  * @param {Object} schedule - Planning du bruit, contenant schedule.alphaBar (array)
	  * @param {number} lastStep - Étape actuelle de débruitage (par ex. 200) => doit être >= 2
	  * @param {number} nbSteps - Nombre d’étapes à effectuer (par défaut 4)
	  * @returns {tf.Tensor4D} Image débruitée après nbSteps passages (x_{t - nbSteps})
	  */
	 this.diffusion_debruiter = function (imageBruitee, bruitPredit, schedule, lastStep, nbSteps = 4) {

		 return tf.tidy(() => {
			 // On évite de descendre sous l'étape 1
			 const tStart = lastStep;
			 const tEnd = Math.max(1, tStart - nbSteps);
			 const effectiveSteps = tStart - tEnd;

			 let x = imageBruitee;

			 for (let i = 0; i < effectiveSteps; i++) {
				 const t = tStart - i; // Étape courante (ex: 200, 199, 198, ...)
				 const alphaBar_t = Number(schedule.alphaBar[t]);
				 const alphaBar_prev = Number(schedule.alphaBar[t - 1]) ?? 1.0; // Pour t=1, alphaBar_prev = 1

				 const sqrt_alphaBar_t = Math.sqrt(alphaBar_t);
				 const sqrt_one_minus_alphaBar_t = Math.sqrt(1 - alphaBar_t);

				 // Bruit retiré de x_t pour estimer x_0
				 const x0_pred = tf.div(
					 tf.sub(x, tf.mul(sqrt_one_minus_alphaBar_t, bruitPredit)),
					 sqrt_alphaBar_t
				 );

				 // Formule DDIM déterministe : x_{t-1} = √ᾱ_{t-1}·x₀ + √(1-ᾱ_{t-1})·ε_θ
				 x = tf.add(
					 tf.mul(Math.sqrt(alphaBar_prev), x0_pred),
					 tf.mul(Math.sqrt(1 - alphaBar_prev), bruitPredit)
				 );

				 x.print();
			 }

			 return x;
		 });
	 }

	 ///////////////////////////////////////////////////////////////////////////////////////////////////////////////
	 // générer image bruitée comme point de départ de diffusion
	 this.genere_tenseur_image_bruitee = function (height, width, img_channels, id_col) {

		 try {
			 tf.dispose(this.tenseur_image_bruitee);
			 this.tenseur_image_bruitee=undefined;
		 } catch (e) {
			 // on en fait rien
		 }
		 this.tenseur_image_bruitee=tf.randomNormal([height, width, img_channels], 0, 1);
		 this.tenseur_image_bruitee.print();
		 this.id_col_image_bruitee=id_col;
		 this.onchange_img(id_col);
	 }

 } // fin de la classe
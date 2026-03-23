// fait un encodage one_hot à partir d'une valeur et d'une taille de vecteur
// par exemple int_2_one_hot(2, 5) donnera [0,0,1,0,0]
function int_2_one_hot(token, vocab_size) {
	let tableau=[];
	for (let idx=0;idx<vocab_size;idx++) {
		let val=0;
		if (idx == token) {
			val=1;
		}
		tableau[idx]=val;
	}
	return (tableau)
}

// transforme un one hot en int
// par exemple one_hot_2_int ([0,0,1,0,0]) donnera 2
function one_hot_2_int(one_hot) {
	for (let idx in one_hot) {
		let val=one_hot[idx];
		if (val == 1) {
			return(idx);
		}
	}
	return (0); // si que des 0 retourne 0
	
}


// retourne les nb plus grandes valeur de tableau
// tableau de la forme [1, 0.2, 8.3, 6...]
// retourne la valeur et l'index des nb plus grandes valeurs [{idx:53, valeur:9.75}, {idx:749, valeur:7.38}, ...]
function array_get_head (tableau, nb) {
	let retour=[];
	
	for (let idx in tableau) {
		let val=Number(tableau[idx]);
		let idx_insere=idx; // peut changer si on remplace une valeur
		let val_insere=val; // peut changer si on remplace une valeur
		
		// si premier élément de la liste, on peut ajouter direct
		if (idx === 0) {
			retour.push({idx:idx_insere, valeur:val_insere});
			continue;
		}
		
		// on insère (ou pas) l'élément dans retour
		for (let idx_retour in retour) {
			// si la valeur insérée est plus petite que les nb valeurs déjà trouvées on sort
			if (idx_retour >= nb) {
				break;
			}
			let val_test=retour[idx_retour]["valeur"];
			let idx_test=retour[idx_retour]["idx"];
			if (val_insere >= val_test) {
				retour[idx_retour]["valeur"]=val_insere;
				retour[idx_retour]["idx"]=idx_insere;
				val_insere=val_test;
				idx_insere=idx_test;
			}
		}
		
		// si on n'a pas encore nb éléments dans retour , on ajoute à la fin
		if (idx < nb) {
			retour.push({idx:idx_insere, valeur:val_insere});
		}
		
	} // fin du pour chaque valeur du tableau
	return (retour);
	
}

// récupère les infos d'un tenseur texte pouvant avoir différents formats
// plusieurs phrases ou 1 seule
// 1 mot par phrase ou plusieurs
// avec ou sans one_hot
// renvoie un tableau de la forme :
// retour[phrases][mots][token | mot | one_hot | one_hot_text] ou token est un nombre (ex. 512) mot est le mot décodé (ex. "recette"),
// one_hot est éventuellement le tableau one_hot et one_hot_text le même tableau sous forme de texte (ex "0,0,0,1,0,0")
function decode_tensor_text (tensor, tokenizer, params) {

	let type_affichage="";
	let retour=[];
	let bool_phrases=params["bool_phrases"]; // si vaut false, 1 seule phrase dans le tensor
	let text_bool_one_hot=params["text_bool_one_hot"];
	let tensor2;

	// Si 1 seule phrase on ajoute une dimension
	if (bool_phrases === false) {
		tensor2=tensor.expandDims(0);
	} else {
		tensor2=tensor;
	}

	let nb_dims=tensor2.rank;

	// on regarde quel type d'infos sont dans le tensor
	if (nb_dims === 1 && text_bool_one_hot === "false") { // 1 mot sans one hot
		type_affichage="1_mot_sans_one_hot";
	} else if (nb_dims === 2 && text_bool_one_hot === "false") { // liste de mots sans one_hot
		type_affichage="liste_mots_sans_one_hot";
	} else if (nb_dims === 2 && text_bool_one_hot === "true") { // 1 mot avec one hot
		type_affichage="1_mot_avec_one_hot";
	} else if (nb_dims === 3 && text_bool_one_hot === "true") { // liste de mots avec one hot
		type_affichage="liste_mots_avec_one_hot";
	} else if (nb_dims === 3 && text_bool_one_hot === "false" && tensor2.shape[2]===1) { // liste de mots sans one hot mais où on avit fait expandDims sur la dernière simension (bug tsjs pour le sparseCategoricalCrossEntropie)
		tensor2=tf.tidy(() => {
			let tensor3=tensor2.squeeze(-1);
			return (tensor3);
		});
		type_affichage="liste_mots_sans_one_hot";
	} else {
		// todo
		return (false);
	}

	let tableau=tensor2.arraySync(); // on convertit en array
	for (idx_phrase in tableau) { // pour chaque phrase
		retour[idx_phrase]=[];
		let phrase=tableau[idx_phrase];

		// on récupère un tableau de mots (1 ou plusieurs)
		let mots=[]
		if (type_affichage === "1_mot_sans_one_hot" || type_affichage === "1_mot_avec_one_hot") { // si un seul mots
			mots[0]=phrase;
		} else {
			mots=phrase;
		}
		for (idx_mot in mots) {
			let elem=mots[idx_mot];
			let token;
			let mot="";
			let one_hot="";
			let one_hot_text="";

			// si nécessaire on convertit le one hot
			if (type_affichage==="1_mot_avec_one_hot" || type_affichage==="liste_mots_avec_one_hot") {
				one_hot=elem;
				one_hot_text=one_hot.join(",");
				token=one_hot_2_int(one_hot);

			} else {
				token=elem;
			}

			// on récupère le mot
			mot=tokenizer.decode([Number(token)]);

			// retour
			retour[idx_phrase][idx_mot]={token:token, mot:mot, one_hot:one_hot, one_hot_text:one_hot_text};

		} // fin du pour chaque mot
	} // fin du pour chaque phrase


	// à la fin on dispose tensor2
	tensor2.dispose();
	return (retour);
}

function get_vocab_size(tokenizer) {
	let vocab_size;
	if (tokenizer.vocab !== undefined) {
		vocab_size = tokenizer.vocab.length;
	} else {
		vocab_size=tokenizer.model.tokens_to_ids.size;
	}
	return (vocab_size);

}

////////////////////////////////////////////////////////
// RAZ les listes de data et de modèles
function raz_listes () {
	$("#zone_info_modele_load div.list_models").html(glob_get_intitule("alert_please_connect_model", {"%url":'javascript:user_organizer.clique_user();'}));
	$("#zone_DO_data_liste").html(glob_get_intitule("alert_please_connect_data", {"%url":'javascript:user_organizer.clique_user();'}));
	$("#zone_DO_model_liste").html(glob_get_intitule("alert_please_connect_model", {"%url":'javascript:user_organizer.clique_user();'}));
	$("#zone_load_data_perso").html(glob_get_intitule("alert_please_connect_data", {"%url":'javascript:user_organizer.clique_user();'}));
}

////////////////////////////////////////////////////////
// refresh_listes
function refresh_listes () {
	// affichage initial de la liste des modèles sauvegardés
	model_organizer.refresh_models();
	data_organizer.list_data();
	data_organizer.list_models();
	table_organizer.affiche_data_perso();
}

////////////////////////////////////////////////////////
// anime le carousel
function carousel(idx=0) {
	let idx_max=7;
	if (idx > idx_max) {
		idx=0;
	}
	let img=$("#carousel_img");
	let url_img="IMG/carousel/img_"+idx+".png";
	img.attr("src", url_img);
	setTimeout(carousel, 5000, idx+1);
}

///////////////////////////////////////////////////////
// change_langue depuis index
function change_langue (langue) {
		window.location.href = "index.php?lang="+langue;
}

///////////////////////////////////////////////////////
// change_langue depuis toolkait
function change_langue2 () {
	let html="";
	html+=glob_get_intitule("alert_change_langue");
	html+="<br/><br/>";
	html+="<div id=\"bloc_acces\" style=\"width:100%; top:0px;\">\n" +
		"            <div class=\"flag\"><img class=\"pointer\" src=\"IMG/icones_grandes/flag_en.png\" id=\"english_flag\" onclick=\"window.location.href='toolkait.php?lang=en'\" /></div>\n" +
		"            <div class=\"flag\"><img class=\"pointer\" src=\"IMG/icones_grandes/flag_fr.png\" id=\"french_flag\" onclick=\"window.location.href='toolkait.php?lang=fr'\"/></div>\n" +
		"            </div>\n";
	$("#popup_user").html(html);
	$("#popup_user").dialog({autoOpen: false, height: 400, width: 900, modal: true, position: { my: "center top", at: "top+100", of: window } });
	$("#popup_user").dialog("open"); // vérif si utile

}

///////////////////////////////////////////////////////
// affiche les tokenizers
function affiche_tokenizers () {
	let affichage="";

	let cpt=0;
	let html_select_tokenizer="";
	for (let idx in tokenizers) {
		cpt++;
		affichage += "<h2>"+idx+"</h2>";
		html_select_tokenizer+="<option value='"+idx+"'>"+idx+"</option>";
		let length=0;
		let vocab;
		if (idx==="word_tokenizer") {
			vocab=tokenizers[idx].vocab;
		} else {
			vocab=tokenizers[idx].model.vocab;
		}
		length=vocab.length;
		let top_100="";
		let cpt2=0;
		for (let j in vocab) {
			cpt2++;
			if (cpt2 > 100) {
				continue;
			}
			top_100+=j+"="+vocab[j]+", ";

		}
		top_100+="...";
		affichage+="<p>"+glob_get_intitule("label_vocab_size")+" : "+length+"</p> "+top_100+"<br/>";
	}
	if (cpt === 0) {
		affichage=glob_get_intitule("label_no_tokenizer");
	}
	$("#zone_tokenizers").html(affichage);
	$("#select_tokenizer").html(html_select_tokenizer);
	$("#select_tokenizer_embeddings").html(html_select_tokenizer);
}

///////////////////////////////////////////////////////
// envoie une requête
function query_tokenizer () {
	let ref_tokenizer=$("#select_tokenizer").val();
	let action=$("#tokenizer_type_query").val();
	let query=$("#tokenizer_query").val();

	let tokenizer=tokenizers[ref_tokenizer];
	let reponse="";
	if (action === "encode") {
		reponse=tokenizer.encode(query).join(" ");

	} else if (action === "decode") {
		let tableau=query.split(" ");
		reponse=tokenizer.decode(tableau.map(Number));
	}
	$("#tokenizer_reponse").html(reponse);


}

///////////////////////////////////////////////////////
// count : compte le nombre d'éléments d'une array ou d'un objet (.length ne fonctionne pas pour les objets
function count (obj) {
	let nb=0;
	for (let idx in obj) {
		nb++;
	}
	return (nb);
}

///////////////////////////////////////////////////////
// get_labels retourne les labels associés aux valeurs
// colonne est une array 1d de codes (numériques) 0,1,2,3...
// labels est une array de labels chien, chat, lapin...
// le code de colonne correspond à l'index de labels
function get_labels (colonne, labels) {
	let retour=[];
	for (let idx in colonne) {
		let val=colonne[idx];
		let label=labels.indexOf(val);
		retour.push(label);
	}
	return (retour);

}

///////////////////////////////////////////////////////
// normalise un tenseur entre les valeurs a et b
// le clipByValue est normalement inutile, mais sur certains ordinateurs (?) les 0 deviennent 0,001...
// Bug TFJS X( on il transorme parfois un float32 valant 0 ou 1 en 0.00001 ou 1.0001...
function normalizeToRange(tensor, a, b) {
	const min = tensor.min();
	const max = tensor.max();
	return tf.tidy (() => {
		return (tensor.sub(min).div(max.sub(min)).mul(b - a).add(a).clipByValue(a+0.0001,b-0.0001)); //
	});
}

///////////////////////////////////////////////////////
// genere_embedding ()
// recherche les embeddings de tous les vocabs d'un tokenizer
// genere_embeddings ("word_tokenizer", 5, {bool_one_hot : true, max_tokenizer:100});
function genere_embeddings (tokenizer, idx_layer, params) {
	let bool_one_hot=params["bool_one_hot"];
	let min_tokenizer=params["min_tokenizer"];
	let max_tokenizer=params["max_tokenizer"];
	let div_progression=params["div_progression"];
	$(div_progression).html("generating embeddings... ");
	if (bool_one_hot === undefined) {
		bool_one_hot=false;
	}
	if (min_tokenizer === undefined) {
		min_tokenizer = 0;
	}
	if (max_tokenizer === undefined) {
		max_tokenizer = 0;
	}
	let vocab;
	let embeddings=[];
	let stacked_embeddings;
	if (tokenizer === "word_tokenizer") {
		vocab=tokenizers[tokenizer]["vocab"];
	} else {
		vocab=tokenizers[tokenizer]["model"]["vocab"];
	}
	let vocab_size=vocab.length;
	if (max_tokenizer === 0) {
		max_tokenizer=vocab_size;
	}

	let layer=model_organizer.layers[idx_layer]["tf_layer"];

	for (let idx=min_tokenizer; idx<max_tokenizer; idx++) {

		if (bool_one_hot === true) {
			input=int_2_one_hot(idx, vocab_size);
		} else {
			input=[idx];
		}
		embeddings[idx]=tf.tidy (() => {
			let output;
			output=layer.apply(tf.tensor2d([input]));
			return tf.squeeze(output);
		});
	}
	stacked_embeddings = tf.stack(embeddings);
	try {
		tf.dispose(tokenizers[tokenizer]["embeddings"]);
	} catch (e) {
		// on ne fait rien
	}
	tokenizers[tokenizer]["embeddings"] = stacked_embeddings;
	tokenizers[tokenizer]["embeddings_min"]=min_tokenizer;
	tokenizers[tokenizer]["embeddings_max"]=max_tokenizer;

	tf.dispose(embeddings);
	$(div_progression).html("OK ");

}

///////////////////////////////////////////////////////
// clique_genere_embeddings ()

function clique_genere_embeddings () {
	let idx_tokenizer=$("#select_tokenizer_embeddings").val();
	let idx_layer=$("#select_embeddings_layer").val();
	idx_layer=Number(idx_layer);
	let min=$("#from_token").val();
	let max=$("#to_token").val();
	let bool_one_hot=$("#bool_one_hot_embeddings").prop("checked");
	if (min == "") {
		min=undefined;
	} else {
		min=Number(min);
	}
	if (max == "") {
		max=undefined;
	} else {
		max=Number(max);
	}
	let params={min : min, max: max, div_progression: $("#progression_embeddings"), bool_one_hot: bool_one_hot};
	genere_embeddings (idx_tokenizer, idx_layer, params);
}

///////////////////////////////////////////////////////
// get_similar_embeddings ()
// genere_embeddings ("word_tokenizer", 5, {bool_one_hot : true, max_tokenizer:0});
// get_similar_embeddings ("word_tokenizer", 88, {})
function get_similar_embeddings (tokenizer, idx_token, params) {
	let nb_top=params["nb_top"];
	if (nb_top === undefined) {
		nb_top=5;
	}
	let embeddings=tokenizers[tokenizer]["embeddings"];
	let embeddings_min=tokenizers[tokenizer]["embeddings_min"];
	let embeddings_max=tokenizers[tokenizer]["embeddings_max"];
	if (embeddings === undefined) {
		alert ("you must generate embeddings first");
		return;
	}

	idx_token-=embeddings_min;
	if (idx_token > embeddings_max) {
		alert (idx_token+" out of bounds");
		return;
	}

	// proximité cosinus
	const targetEmbedding = embeddings.slice([idx_token, 0], [1, -1]); // on récupère l'embedding à tester

	// Normalisation
	const normalizedEmbeddings = tf.div(embeddings, tf.norm(embeddings, 'euclidean', 1, true));
	const normalizedTarget = tf.div(targetEmbedding, tf.norm(targetEmbedding));

	// Produit scalaire (similarité cosinus)
	const similarities = tf.matMul(normalizedTarget, normalizedEmbeddings, false, true); // [1, 6000]

	// Trouve les indices des tokens les plus proches
	const {values, indices} = tf.topk(similarities, nb_top, true); // Top 5

	return ({values:values.dataSync(), indices:indices.dataSync()});


}

///////////////////////////////////////////////////////
// clique_compare_embeddings ()
function clique_compare_embeddings () {
	let idx_tokenizer=$("#select_tokenizer_embeddings").val();
	let tokenizer=tokenizers[idx_tokenizer];
	let mot=$("#token_2_embeddings").val();
	let tokens=tokenizer.encode(mot);
	let token=tokens[1]; // on récupère le 2e token
console.log(tokens);
console.log(token);
	let similars=get_similar_embeddings (idx_tokenizer, token, {});
console.log(similars);
	let html="";
	for (let idx in similars.values) {
		let value=similars.values[idx];
		let indice=similars.indices[idx];
		let decode=tokenizer.decode([value]);
		html+=decode+" ("+value+") => "+indice+" <br>";
	}
	$("#zone_tk_embeddings_result").html(html);

}

///////////////////////////////////////////////////////
// refresh_embeddings_form ()
function refresh_embeddings_form() {
	let html="";
	for (let idx in model_organizer.layers) {
		let name = model_organizer.layers[idx]["name"];
		html+="<option value='"+idx+"'>"+name+"</option>";
	}
	$("#select_embeddings_layer").html(html);
}







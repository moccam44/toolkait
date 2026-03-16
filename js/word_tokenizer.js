function word_tokenizer (params) {
	
	// paramètres
	this.bool_minuscule=params["bool_minuscule"];
	this.vocab_size=params["vocab_size"];
	this.max_nb_words=params["max_nb_words"];
	this.bool_shuffle=glob_word_tokenizer_shuffle;
	this.seed=50; // fixe pour que le shuffle renvoie toujours le même tri


	if (this.max_nb_words !== undefined) {
		this.max_nb_words=Number(this.max_nb_words);
	}
	
	if (this.bool_minuscule === undefined) {
		this.bool_minuscule=true;
	}
	
	if (this.vocab_size === undefined) {
		this.vocab_size=5000;
	}

	// Variables globales
	this.ponctuation=[".", ",", ";", ":", "?", "!", "'", "\""];
	this.specials={0:"[EMP]", 1:"[BEG]", 2:"[END]", 3:"[UNK]"};
	this.separator=" "; // espace
	this.dictionnaire={};
	this.vocab=[];
	
	//////////////////////////////////////////////////////////////////////////////////////////
	// divise une chaine en mots
	this.tokenize = function (chaine) {
		chaine=String(chaine);
		// 1. passage en minsucules ?
		if (this.bool_minuscule === true) {
			chaine=chaine.toLowerCase();
		}
		
		// 2. ponctuation
		chaine=this.traite_ponctuation(chaine);
		
		// 3. split
		let tokens=this.split_chaine(chaine)
		
		// 4. enlève vides (arrive si 2 espaces consécutifs)
		let tokens2=[];
		for (let idx in tokens) {
			if (tokens[idx] !== "") {
				tokens2.push(tokens[idx]);
			}
		}
		
		return (tokens2);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	this.traite_ponctuation = function (chaine) {
		for (idx_ponctuation in this.ponctuation) {
			let ponct=this.ponctuation[idx_ponctuation];
			chaine=chaine.replaceAll(ponct, this.separator+ponct+this.separator);
		}
		return (chaine);		
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	this.split_chaine = function (chaine) {
		return (chaine.split(this.separator));
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	this.genere_dictionnaire = function(tokens) {
		let cpt_word=0;
		for (let idx in tokens) {
			let token=tokens[idx];
			if (token === "") {
				continue;
			}
			if (this.dictionnaire[token] === undefined) {
				this.dictionnaire[token]=1;
			} else {
				this.dictionnaire[token]++;
			}
			cpt_word++;
			if (this.max_nb_words !== undefined) {
				if (cpt_word > this.max_nb_words) {
					//console.log ("word_tokenizer : stop à "+cpt_word+" mots, on arrive au bout de la longueur max : "+this.max_nb_words+" mots")
					return (true);
				}
			}
		}
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	this.genere_vocab = function () {
		// 1. on trie le dictionnaire
		let entries=Object.entries(this.dictionnaire); // génère un tableau du type [[voiture, 7], [vélo,3], [table,8], ...]
		let sorted = entries.sort((a, b) => b[1] - a[1]); // trie le tableau précédent en se basant sur la colonne 1 du + au - utilisé => [[table, 8], [voiture, 7], [vélo,3]]

		// on shuffle le résultat
		if (this.bool_shuffle === true) {
			this.shuffle_vocab(entries);
		}

		let idx_token=0
		// 2. on commence par ajouter les éléments spécaiux 
		for (let idx in this.specials) {
			this.vocab[idx_token]=this.specials[idx];
			idx_token++;
		}
		
		// 3. on ajoute les tokens en commençant par les plus usités
		for (let idx in sorted) {
			if (idx_token > this.vocab_size) { // 4. on se limite à la taille du vocabulaire
				return(true);
			} else {
				this.vocab[idx_token]=sorted[idx][0];
				idx_token++;
			}
		}


	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	this.encode = function (chaine, params) {
		let tokens=this.tokenize(chaine);
		let encodage=this.encode_from_tokens(tokens, params);
		return (encodage);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	this.encode_from_tokens = function (tokens, params) {
		let retour=[];
		retour.push(1); // <BEG>
		for (let idx in tokens) {
			let token=tokens[idx];
			if (token==="") {
				continue;
			}
			let num=this.vocab.indexOf(token);
			if (num === -1) {
				num=3; //<UNK>
			}
			retour.push(num);
		}
		retour.push (2); // <END>
		return (retour);
	}
	
	//////////////////////////////////////////////////////////////////////////////////////////
	this.decode = function (tableau, params) {
		let retour="";
		for (let idx in tableau) {
			let num=Number(tableau[idx]);
			let token=this.vocab[num];
			if (token === undefined) {
				token="[UNK2]";
			}
			if (this.ponctuation.indexOf(token) != -1) {
				retour+=token;
			} else {
				retour+=this.separator+token;
			}
		}
		return (retour);
		
	}

	//////////////////////////////////////////////////////////////////////////////////////////
	// mélange this.vocab de manière déterministe (i.e si on applique la fonction sur la même array on obtient le même résultat
	// mélange directement le tableau fourni (ne retourne rien)
	this.shuffle_vocab = function (tableau) {
		let currentSeed = this.seed;
		// Fonction pour générer un nombre pseudo-aléatoire entre 0 et 1, basé sur la graîne
		function random() {
			const x = Math.sin(currentSeed++) * 10000;
			return x - Math.floor(x);
		}

		// Algorithme de Fisher-Yates
		for (let i = tableau.length - 1; i > 0; i--) {
			const j = Math.floor(random() * (i + 1));
			[tableau[i], tableau[j]] = [tableau[j], tableau[i]];
		}
	}
	



} // fin de la classe
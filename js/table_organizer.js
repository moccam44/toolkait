/* 
 * xxx
 */

function table_organizer (params) {
    
    // VARIABLES
	this.type_fichier="csv"; // csv|pq
    this.url_csv;
	this.url_pq;
	this.tableau_array; // utilisé pour stocker les données arrayBytes (images parquet)
    this.tableau;
	this.tableau_shuffled;
	this.tableau_sliced; // tranche du tableau de chaque batch (ou la totalité si gestion par tenseur)
	this.nb_rows_shuffled; // nb de lignes une fois les lignes vides supprimées
	
	// Parquet
	this.asyncBufferFromUrl;
	this.parquetRead;
	this.parquetMetadata;
	this.parquetMetadataAsync;
	this.pq_metadata;

    this.intitules_colonnes=[];
    this.nb_head=5; // nb de lignes du tableau à afficher
    this.definition=[];
    this.formulaire;
	this.popup_split_tableau;
    this.nom_table_organizer="table_organizer";
    
	this.menu_data="menu_data";
    this.zone_tableau=params["zone_tableau"];
	this.zone_tableau_meta=params["zone_tableau_meta"];
	this.zone_load_array=params["zone_load_array"];
	this.zone_charge_image="zone_charge_image_x";
    this.formulaire_tableau=params["formulaire_tableau"];
	this.zone_progression="progression_x";
	this.zone_x_y="zone_x_y"; // zone ou sera affiché la synthèse des tenseurs
	this.zone_x_y_img_form="zone_x_y_img_form"; // zone du formulaire pour navigeur dans l'affichage des tenseurs
	this.zone_x_y_img_container="zone_x_y_img_container";
	this.zone_load_data_perso="zone_load_data_perso"; // zone d'affichage de la liste des données persos
	this.zone_log="log_charge_x";
    this.id=params["id"];
	this.ol=lnk_data_model; // lnk_data_model
	
	this.i2t={}; // image 2 tensor => définition dans raz_variables();
	
	this.ds={}; // gestion des dataset => définition dans raz_variables();
	this.split_tableau={}; // gestion du découpage en plusieurs petits tenseurs => définition dans raz_variables()
	this.bool_data_prepared=false; // est-ce que la méthode prepare_data a été appelée
	
	this.on_genere_data=""; // ce qu'il faut faire une fois que genere_data() est terminé : "get_batch" pour renvoyer  | "affiche" (affiche_x_y...)

	this.diffusion_schedule={};
	this.diffusion_bool_regenere=false; // si true il faudra regénérer les tenseurs après les avoir tous générés pour introduire le bruit
	this.diffusion={}; // infos diverses nécessaires

	// on initialise la barre de progression
	$( "#"+this.zone_progression ).progressbar({value: 100});
	$( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_select_data"));
    
    ////////////////////////////////////////////////////////////////////////////
    this.set_url_csv = function (url) {
        this.url_csv=url;
    };
	
	////////////////////////////////////////////////////////////////////////////
    this.set_url_pq = function (url) {
        this.url_pq=url;
    };
	
	////////////////////////////////////////////////////////////////////////////
	this.raz_variables = function () {
		this.url_csv="";
		this.url_pq="";
		this.tableau=undefined;
		this.tableau_array={};
		this.pq_metadata=undefined;

		this.intitules_colonnes=[];
		this.definition=[];
		this.formulaire=undefined;
		
		this.bool_data_prepared=false; // est-ce que la méthode prepare_data a été appelée
		
		// conversion d'images en tenseur
		this.i2t["idx"]=0; // idx de la dernière image traitée
		this.i2t["size"]=0; // nb images à traiter
		this.i2t["idx_col"]=null; // idx de la colonne img à convertir en tenseur
		this.i2t["buffer"]=[]; // array à laquelle on ajoutera les images l'une après l'autre
		this.i2t["serie"]=null; // la colonne à traiter sour forme de df.serie
		this.i2t["type"]=""; // img ou img_bytes
		
		// gestion des dataset
		this.ds["idx"]=0;
		this.ds["batch_size"]=0; // nb éléments à envoyer pour chaque batch (à redéfinir)
		this.ds["bool_in_out"]=false;
		this.ds["done"]=false;

		// gestion de split_tableau
		this.split_tableau["bool"]=false;
		this.split_tableau["nb"]=1; // nombre de divisions à faire dans le tableau
		this.split_tableau["idx"]=0; // idx de la division à générer
		this.split_tableau["nb_rows_shuffled"]=0; // sauvegarde du nb total d'enregistrement du tableau (sera switché avec le nb d'éléments de la division puis remis pour générer la division suivante)
		this.split_tableau["auto_reload"]=false; // si on veut parcourir toutes les divisons (utilisation de *)

		
		// ce qu'on fait une fois que genere_data() a terminé
		this.on_genere_data="";

		// diffusion
		this.diffusion_schedule={};
		this.diffusion_bool_regenere=false;
		this.diffusion={};
		
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.set_dataset = function (params) {
		for (clef in params) {
			let val=params[clef];
			if (clef=="start") { // attention on remplace start par idx :/
				clef="idx";
			}
			this.ds[clef]=val;
			
		}
	}
    
    ////////////////////////////////////////////////////////////////////////////
    this.load_url = function () {
		this.affiche_fin_chargement();
		$( "#"+this.zone_progression ).progressbar({value: false});
		$( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_download"));
		this.log (glob_get_intitule("label_download"));
		var cpt=0;
		var that=this; // la sous-fonction n'a pas accès à this :/
		var df_retour=[];
		var colonnes=[];
		
		// Callback function
		///////////////////////////////////////////
		var csv_onchunk=function(dataframe) {
			if (cpt % 500 == 0) {
				// rien :( je n'arrive pas à mettre à jour la barre de progression. le navigateur bloque
			}
			
			// si dernière ligne on retourne et on affiche 
			if (dataframe.values[0][0] === null) {
				that.log ("OK");
				$( "#"+that.zone_progression ).progressbar({value: 100});
				$( "#"+that.zone_progression+" .progress-label").text(glob_get_intitule("label_rows_downloaded", {"%nb_rows":cpt}));

				that.tableau=new dfd.DataFrame(df_retour, {columns: colonnes});
				that.set_infos_init();
				that.affiche_tableau_init();
			}
			
			// si 1ere ligne on intitialise le tableau
			if (cpt===0) {
				colonnes=dataframe.columns;

			}
			
			// sinon on ajoute les dataframes
			for (let idx in dataframe.values) {
				df_retour.push(dataframe.values[idx]); // a priori cette boucle est inutile, car ça ne renvoie qu'une ligne à la fois, mais au cas où...
			}
			
			cpt++;
			

		}
		///////////////////////////////////////////
		
		try {
			dfd.streamCSV (this.url_csv, csv_onchunk, {download:true}); // en fait cette fonction renvoie les ligne 1 par 1 : l'option chunkSize ne fonctionne pas :(
		} catch (e) {
			alert ("table_organizer::load_url() : "+e.message);
		}
    };
	

	
	////////////////////////////////////////////////////////////////////////////
    this.load_url_array = function () {
		let nb_col=$("#"+this.zone_load_array+" input[name='wbto_array_nb_col']").val();
		let nb_rows=$("#"+this.zone_load_array+" input[name='wbto_array_nb_rows']").val();
		let type=$("#"+this.zone_load_array+" select[name='wbto_array_type']").val();

		let val=1;
		if (type === "num") {
			// on ne fait rien
		}
		let tableau={};
		for (let idx_col=0 ; idx_col < nb_col ; idx_col++) {
			tableau["col_"+idx_col]=[];
			for (let idx_rows=0 ; idx_rows < nb_rows ; idx_rows++) {
				tableau["col_"+idx_col][idx_rows]=val;
			}
		}

		$("#zone_load_array").dialog("close");
		this.tableau = new dfd.DataFrame(tableau);
	}
	
	////////////////////////////////////////////////////////////////////////////
    this.init_array = function () {
		let type=$("#"+this.zone_load_array+" select[name='wbto_array_type']").val();
		let normalize=$("#"+this.zone_load_array+" select[name='wbto_array_normalize']").val();
		let normalization_range=$("#"+this.zone_load_array+" input[name='wbto_array_normalization_range']").val();
		for (let idx in this.definition) {
			this.definition[idx]["type"]=type;
			this.definition[idx]["normalize"]=normalize;
			this.definition[idx]["normalization_range"]=normalization_range;
			this.definition[idx]["img_url_base"]="exemple_data/";
			this.definition[idx]["img_format"]="png";
		}
	}
	
	////////////////////////////////////////////////////////////////////////////
    this.load_url_pq = async function () {
		
		
		try {
			this.affiche_fin_chargement();
			// buffer
			let url=this.url_pq;
			this.log (glob_get_intitule("label_create_buffer"));
			let buffer=await this.asyncBufferFromUrl({url});
			this.log ("OK");
			
			// metadata
			this.log (glob_get_intitule("label_get_metadata"));
			this.pq_metadata=await this.parquetMetadataAsync(buffer);
			this.log ("OK");

			//données
			this.log (glob_get_intitule("label_download_data"));
			this.parquetRead({
				file: buffer,
				rowFormat: 'object',
				metadata: this.pq_metadata,
				utf8: false,
				onComplete: data => this.pq_onload(data),
				onChunk : chunk => this.pq_onchunk(chunk)
				//onPage : chunk => this.pq_onchunk(chunk)
			})
		} catch (e) {
			alert ("table_organizer::load_url_pq() : "+e.message);
		}
		$( "#"+this.zone_progression ).progressbar({value: 0});
        $( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_download"));

    };
	
	////////////////////////////////////////////////////////////////////////////
	this.pq_onchunk = function (chunk) {

		let size=Number(this.pq_metadata["num_rows"]);
		let last=chunk["rowEnd"];

		// progressbar
		let ratio2=last*100/size;
		let ratio=ratio2.toFixed(2);
		$( "#"+this.zone_progression ).progressbar({value: Number(ratio)});
        $( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_download")+" "+last+" / "+size);
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.pq_onload = function(data) {
		this.log ("OK");
		this.log (glob_get_intitule("label_processing_data"));
		
		// 1. on convertir le fichier parquet en tableu plat associatif
		// on va aplatir le fichier parquet et en faire un tableau associatif ordinaire {col1 : [a,b,c], col2 : [1,2,3], ...}
		let infos={}; // => données expurgées des données bytes pour conversion en danfo
		this.tableau_array={}; // données brutes (y compris bytes
		let size=data.length;

		for (let idx in data) { // pour chaque row
			let last=idx;
			
			if (last % 100 == 0) {
				let ratio2=last*100/size;
				let ratio=ratio2.toFixed(2);
				$( "#"+this.zone_progression ).progressbar({value: Number(ratio)});
				$( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_processing_data")+" "+last+" / "+size);
			}
			
			let row=data[idx];
			let aplat=this.pq_aplat(row, ""); // on met à plat
			for (let idx_aplat in aplat) { // pour chaque colonne (après mise à plat)
				
				let elem=aplat[idx_aplat];
				if (typeof(elem)=="bigint") {
						elem=Number(elem); // danfo ne gère pas le type bigint :/
					}
				if (Number(idx)==0) { // si première ligne, on crée les intitulés
					infos[idx_aplat]=[];
					this.tableau_array[idx_aplat]=[];
				}
				
				this.tableau_array[idx_aplat].push(elem);
				
				// on remplace les valeurs non gérées par danfo par "bytes"
				if (typeof(elem)=="object" && elem != null) {
					elem="bytes";
				}
				infos[idx_aplat].push(elem);
				
			}
		}
		this.log ("OK");
		$( "#"+this.zone_progression ).progressbar({value: 100});
		$( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_done"));

		// 2. On convertit le tableau en danfo
		this.log (glob_get_intitule("label_dataframe_generation"));
		this.tableau=new dfd.DataFrame(infos);
		this.log ("OK");

		// 3. On extrait les infos et on gère l'affichage
		this.set_infos_init();
		this.pq_get_class_labels (); // on génère les labels si nécessaire
        this.affiche_tableau_init();
		
		// 4. On efface les fichiers temporaires
		data=undefined;
		infos=undefined;

	}
	
	////////////////////////////////////////////////////////////////////////////
	// met à plat de manière récursive une ligne parquet
	this.pq_aplat = function(infos, prefixe) {
		
		let retour={};
		for (let idx in infos) {
			let elem=infos[idx];

			let prefixe2;
			if (prefixe != "") {
				prefixe2=prefixe+"_"+idx;
			} else {
				prefixe2=idx;
			}

			if (elem == null) {
				retour[prefixe2]=elem;
			} else if (typeof(elem)=="object" && String(elem.constructor).indexOf("Uint8Array") == -1) { // si object récursivité sauf si Uint8Array(données brutes comme des images)
				let recursif=this.pq_aplat(elem, prefixe2);
				for (idx_recursif in recursif) {
					retour[idx_recursif]=recursif[idx_recursif];
				}
			} else {
				retour[prefixe2]=elem;
			}
		}
		return (retour);
	}
	
	////////////////////////////////////////////////////////////////////////////
	// Récupère les labels des valeurs de type catégorie (ClassLabel)
	this.pq_get_class_labels = function () {
		if (this.pq_metadata["key_value_metadata"] == undefined) {
			return (true);
		}
		
		
		for (let idx in this.pq_metadata["key_value_metadata"][0]) {
			let def_json=this.pq_metadata["key_value_metadata"][0]["value"];
			let def;
			try {
				def=JSON.parse(def_json);
				let features=def["info"]["features"];
				for (let name_col in features) {
					let col=features[name_col];
					let type=col["_type"];
					let labels=col["names"];
					for (let idx_col in this.definition) {
						if (this.definition[idx_col]["name"]==name_col) {
							this.definition[idx_col]["labels"]=labels;
						}
					}

				}
				return (true); // si on a trouvé on arrête la recherche (à vérifier plus tard s'il ne peut pas y avoir plusieurs définitions en JSON)
			} catch (e) {
				console.log ("pas au format JSON"); // => cas de arrow qui est dans un format que je ne comprends pas
				//continue; // chaine pas au format JSON on essaye le suivant
			}
		}
	}

	////////////////////////////////////////////////////////////////////////////
	this.select_url = function (url) {
		$("#"+this.zone_tableau_meta+" input[name='wbto_url']").val(url);
		this.clique_switch();
	}

	////////////////////////////////////////////////////////////////////////////
	this.clique_switch = function () {
		let type="img";
		let url = $("#"+this.zone_tableau_meta+" input[name='wbto_url']").val();
		let elements=url.split(".");
		let extension=elements[elements.length-1];
		if (extension.toLowerCase() === "parquet") {
			type="parquet";
		} else if (extension.toLowerCase() === "csv") {
			type="csv";
		}

		if (type == "csv") {
			this.clique_upload();
		} else if (type == "parquet") {
			this.clique_upload_pq();
		} else if (type == "img") {
			this.clique_upload_img();
		}
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.clique_upload = async function () {
		this.raz_variables();
		this.type_fichier="csv";
		let url  = $("#"+this.zone_tableau_meta+" input[name='wbto_url']").val();
		this.set_url_csv (url);
		this.load_url();
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.clique_upload_array = function () {
		this.raz_variables();
		this.type_fichier="csv";
		this.load_url_array();
		this.set_infos_init();
		this.init_array();
        this.affiche_tableau_init();
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.clique_upload_pq = async function () {
		this.raz_variables();
		this.type_fichier="pq";
		let url  = $("#"+this.zone_tableau_meta+" input[name='wbto_url']").val();
		this.set_url_pq (url);
		await this.load_url_pq();
		// la suite (affichage) sera gérée dans this.pq_onload() car asynchrone
		
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.clique_upload_img = async function () {
		this.raz_variables();
		this.type_fichier="csv";
		let img_rep=$("#"+this.zone_tableau_meta+" input[name='wbto_url']").val();
		this.set_url_csv (glob_url_csv_generator+"?nom_rep="+img_rep);
		await this.load_url();
	}
    
    ////////////////////////////////////////////////////////////////////////////
    this.set_intitules_colonnes = function () {
		this.intitules_colonnes=this.tableau.axis.columns;
    };
	
	////////////////////////////////////////////////////////////////////////////
	// /!\ attention, on force la version 1.12 car à partir de la 1.13 les requêtes se font en parallèle ce qui rend le onchunk inopérant
	this.init_meta = async function () {
		// on importe les fonctions parquet
		const { asyncBufferFromUrl, parquetRead, parquetMetadata, parquetMetadataAsync } = await import('https://cdn.jsdelivr.net/npm/hyparquet@1.12.0/src/hyparquet.min.js');
		this.asyncBufferFromUrl=asyncBufferFromUrl;
		this.parquetRead=parquetRead;
		this.parquetMetadata=parquetMetadata;
		this.parquetMetadataAsync=parquetMetadataAsync;

	};
    
    ////////////////////////////////////////////////////////////////////////////
    this.set_infos_init = function () {
        this.set_intitules_colonnes();
        for (let idx_col in this.intitules_colonnes) {
            let nom_col=this.intitules_colonnes[idx_col];
            let col=this.tableau[nom_col];
            this.definition[idx_col]={};
            this.definition[idx_col]["name"]=nom_col;
			this.definition[idx_col]["tensor"]=null;
            this.definition[idx_col]["sens"]="void"; // in|out|void ==> plus utilisé
            this.definition[idx_col]["type"]="void"; // num|cat|img|void
			this.definition[idx_col]["one_hot"]=[];
			this.definition[idx_col]["labels"]=[];
			this.definition[idx_col]["img_height"]=28;
			this.definition[idx_col]["img_width"]=28;
			this.definition[idx_col]["img_channels"]=3;
			this.definition[idx_col]["normalize"]="true";
			this.definition[idx_col]["normalization_range"]="0:1";
			this.definition[idx_col]["diffusion_nb_etapes"]="100";
			this.definition[idx_col]["diffusion_nb_noise_per_img"]="5";
			this.definition[idx_col]["img_type_generation"]="1_tensor";

			this.definition[idx_col]["cat_bool_one_hot"]="true";
			this.definition[idx_col]["cat_def_categories"]="";
			this.definition[idx_col]["img_url_base"]="";
			
			this.definition[idx_col]["text_tokenizer"]="word_tokenizer";
			this.definition[idx_col]["text_vocab_size"]="10000";
			this.definition[idx_col]["text_bool_minuscule"]="true";
			this.definition[idx_col]["text_tokenizer_size"]="200";
			this.definition[idx_col]["text_nb_guess"]="2";
			this.definition[idx_col]["text_bool_one_hot"]="false";
			this.definition[idx_col]["text_bool_one_hot_A"]="false";
			this.definition[idx_col]["text_bool_one_hot_B"]="false";
			this.definition[idx_col]["text_type_generation"]="1_tensor";
			this.definition[idx_col]["text_nb_generated"]="1";
			this.definition[idx_col]["text_limite_size"]="";
			this.definition[idx_col]["text_stride"]="";
			
            try { // colonnes numériques
                this.definition[idx_col]["min"]=col.min();
                this.definition[idx_col]["max"]=col.max();
                this.definition[idx_col]["median"]=col.median();
                this.definition[idx_col]["mean"]=col.mean();
                //this.definition[idx_col]["type"]="num";
            } catch (e) { // colonnes non numériques
                this.definition[idx_col]["min"]="";
                this.definition[idx_col]["max"]="";
                this.definition[idx_col]["median"]="";
                this.definition[idx_col]["mean"]="";
                //this.definition[idx_col]["type"]="cat";
            }
            this.definition[idx_col]["distinct"]=col.nUnique();
            this.definition[idx_col]["size"]=col.size;
            this.definition[idx_col]["nb_cat"]=this.definition[idx_col]["distinct"];
            this.definition[idx_col]["defaut"]="";
            this.definition[idx_col]["head"]=col.head(this.nb_head).values;
			
        } // fin du pour chaque colonne
    };
    

    
    ////////////////////////////////////////////////////////////////////////////
    // affichage initial du tableau
    this.affiche_tableau_init = function () {
        var html="<br><table id='"+this.id+"' class='wbto_tableau'>";
        // en-tête
        html+="<tr class='wbto_header'>";
        html+="<th scope='col' class='col_init'>&nbsp;</th>";
        for (let idx in this.definition) { // pour chaque colonne
            let icone_type=this.type_2_icone(this.definition[idx]["type"]);
            html+="<th scope='col' class='col_"+idx+" '>"+this.definition[idx]["name"]+"<img class='wbto_type' src='IMG/icones/"+icone_type+"' title='"+this.definition[idx]["type"]+"'/> <img class='wbto_edit' src='IMG/icones/pencil.png' title='"+glob_get_intitule("label_edit_column_properties")+"' onclick='"+this.nom_table_organizer+".edit_colonne("+idx+")'/></th>";
        }
        html+="</tr>";
        
        // 5 1eres lignes
         for (idx_row=0 ; idx_row < this.nb_head ; idx_row++) { // pour chaque ligne de head
             html+="<tr class='wbto_row wbto_data'><th scope='row' class='col_init'>"+idx_row+"</th>"; // première colonne avec l'index
             for (let idx_col in this.definition) { // pour chaque colonne
                 html+="<td class='col_"+idx_col+"'>"+this.definition[idx_col].head[idx_row]+"</td>";
             };
             html+="</tr>";
         }
        
        // propriétés
        const proprietes={size:glob_get_intitule("label_size"), min:glob_get_intitule("label_min"), max:glob_get_intitule("label_max"), mean:glob_get_intitule("label_mean"), median:glob_get_intitule("label_median"), distinct:glob_get_intitule("label_distinct")};
        for (let propriete in proprietes) {
            let intitule=proprietes[propriete];
            if (propriete === "") {
                propriete="&nbsp;";
            }
            html+="<tr class='wbto_row wbto_propriete'><th scope='row' class='col_init'>"+intitule+"</th>"; 
            for (idx_col in this.definition) { // pour chaque colonne
                html+="<td class='col_"+idx_col+"'>"+this.definition[idx_col][propriete]+"</td>";
            };
            html+="</tr>";
        }
        
        // fin du tableau
        html+="</table>";
        
        //this.zone_tableau.innerHTML=html;
        $("#"+this.zone_tableau).html(html);
        this.update_colonnes("");
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // retourne l'icône liée au type de colonen (numérique, catégorie...)
    this.type_2_icone = function (type) {
        var retour="chart_curve.png";
        if (type==="cat") {
            retour="chart_organisation.png";
        } else if (type==="img" || type==="img_bytes") {
			retour="picture.png";
		} else if (type==="text") {
			retour="text_allcaps.png";
		} else if (type==="void") {
			retour="page_white.png";
		}
        return (retour);
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // maj les couleurs des colonnes en fonction du sens
    // également l'icône
    // si id_col est précisé on le fait pour une colonne donnée, sinon pour toutes les colonnes
    this.update_colonnes = function (id_col) {
        for (let idx in this.definition) {
            if (id_col !== "" && id_col !== idx) {
                continue;
            }
            
		
			let type=this.definition[idx]["type"];
			//couleur
			let classe="wbto_void";
            if (type !== "void") {
                classe="wbto_in";
            } 
            //let tmp=".wbto_tableau .col_"+idx;
            $(".wbto_tableau .col_"+idx).removeClass("wbto_void wbto_in wbto_out").addClass(classe);
            
            // icône liée au type
            
            let img="IMG/icones/"+this.type_2_icone(type);
            $(".wbto_tableau .col_"+idx+" img.wbto_type").attr({src : img, title : type});

        }
        
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // éditer les propriéts d'une colonne
    this.edit_colonne = function(idx_colonne) {
        var colonne=this.definition[idx_colonne];
        let html="";
        html+="<input type='hidden' name='wbto_form_id_colonne' value='"+idx_colonne+"'>";
        html+="<table class='wbto_formulaire'>";
        html+="<tr><td><label for='wbto_form_name'>"+glob_get_intitule("label_name")+" : </label> </td><td> <input name='wbto_form_name' value='"+colonne["name"]+"' disabled='true'></td></tr>";
        html+="<tr><td><label for='wbto_form_type'>"+glob_get_intitule("label_type")+" : </label> </td><td> <select name='wbto_form_type' onchange='"+this.nom_table_organizer+".masque_formulaire();"+"'>"+glob_get_liste_html("column_type", "")+"</select></td></tr>";
        html+="<tr><td><label for='wbto_form_min'>"+glob_get_intitule("label_min")+" : </label> </td><td> <input name='wbto_form_min' value='"+colonne["min"]+"'></td></tr>";
        html+="<tr><td><label for='wbto_form_max'>"+glob_get_intitule("label_max")+" : </label> </td><td> <input name='wbto_form_max' value='"+colonne["max"]+"'></td></tr>";
		html+="<tr><td><label for='wbto_form_normalize'>"+glob_get_intitule("label_normalize")+" : </label> </td><td> <select name='wbto_form_normalize'>"+glob_get_liste_html("booleen", "")+"</select></td></tr>";
        html+="<tr><td><label for='wbto_form_normalization_range'>"+glob_get_intitule("label_normalization_range")+" : </label> </td><td> <input name='wbto_form_normalization_range' value='"+colonne["normalization_range"]+"'></td></tr>";
		html+="<tr><td><label for='wbto_form_nb_cat'>"+glob_get_intitule("label_nb_categories")+" : </label> </td><td> <input name='wbto_form_nb_cat' value='"+colonne["nb_cat"]+"'></td></tr>";
        html+="<tr><td><label for='wbto_form_defaut'>"+glob_get_intitule("label_default_value")+" : </label> </td><td> <input name='wbto_form_defaut' value='"+colonne["defaut"]+"'></td></tr>";
		html+="<tr><td><label for='wbto_form_cat_bool_one_hot'>"+glob_get_intitule("label_convert_one_hot")+" : </label> </td><td> <select name='wbto_form_cat_bool_one_hot'>"+glob_get_liste_html("booleen", "")+"</select></td></tr>";
		html+="<tr><td><label for='wbto_form_cat_def_categories'>"+glob_get_intitule("label_cat_def_categories")+" : </label> </td><td> <textarea name='wbto_form_cat_def_categories' placeholder=\"[ex: {1:'cat1', 2:'cat2', ...}\">"+colonne["cat_def_categories"]+"</textarea></td></tr>";

		html+="<tr><td><label for='wbto_form_img_type_generation'>"+glob_get_intitule("label_img_type_generation")+" : </label> </td><td> <select name='wbto_form_img_type_generation'  onchange='"+this.nom_table_organizer+".masque_formulaire();"+"'>"+glob_get_liste_html("img_type_generation", "")+"</select></td></tr>";
		html+="<tr><td><label for='wbto_form_diffusion_nb_etapes'>"+glob_get_intitule("label_diffusion_nb_etapes")+" : </label> </td><td> <input name='wbto_form_diffusion_nb_etapes' value='"+colonne["diffusion_nb_etapes"]+"'></td></tr>";
		html+="<tr><td><label for='wbto_form_diffusion_nb_noise_per_img'>"+glob_get_intitule("label_diffusion_nb_noise_per_img")+" : </label> </td><td> <input name='wbto_form_diffusion_nb_noise_per_img' value='"+colonne["diffusion_nb_noise_per_img"]+"'></td></tr>";

		html+="<tr><td><label for='wbto_form_img_height'>"+glob_get_intitule("label_image_height")+" : </label> </td><td> <input name='wbto_form_img_height' value='"+colonne["img_height"]+"'></td></tr>";
        html+="<tr><td><label for='wbto_form_img_width'>"+glob_get_intitule("label_image_width")+" : </label> </td><td> <input name='wbto_form_img_width' value='"+colonne["img_width"]+"'></td></tr>";
        html+="<tr><td><label for='wbto_form_img_channels'>"+glob_get_intitule("label_image_channels")+" : </label> </td><td> <select name='wbto_form_img_channels'>"+glob_get_liste_html("img_channels", "")+"</select></td></tr>";
		html+="<tr><td><label for='wbto_form_img_format'>"+glob_get_intitule("label_image_format")+" : </label> </td><td> <select name='wbto_form_img_format'><option value='png'>PNG</option><option value='jpg'>JPG</option><option value='gif'>GIF</option></select></td></tr>";
		html+="<tr><td><label for='wbto_form_img_url_base'>"+glob_get_intitule("label_image_url_base")+" : </label> </td><td> <input name='wbto_form_img_url_base' value='"+colonne["img_url_base"]+"'></td></tr>";

		html+="<tr><td><label for='wbto_form_text_type_generation'>"+glob_get_intitule("label_generation_type")+" : </label> </td><td> <select name='wbto_form_text_type_generation'  onchange='"+this.nom_table_organizer+".masque_formulaire();"+"'>"+glob_get_liste_html("text_type_generation", "")+"</select></td></tr>";
		html+="<tr><td><label for='wbto_form_text_tokenizer'>"+glob_get_intitule("label_tokenizer")+" : </label> </td><td> <select name='wbto_form_text_tokenizer' onchange='"+this.nom_table_organizer+".masque_formulaire();"+"'><option value='Xenova/bert-base-uncased'>bert-base-uncased</option><option value='word_tokenizer'>word tokenizer</option></select></td></tr>";
		html+="<tr><td><label for='wbto_form_text_vocab_size'>"+glob_get_intitule("label_vocabulary_size")+" : </label> </td><td> <input name='wbto_form_text_vocab_size' value='"+colonne["text_vocab_size"]+"'></input></td></tr>";
		html+="<tr><td><label for='wbto_form_text_limite_size'>"+glob_get_intitule("label_text_limite_size")+" : </label> </td><td> <input name='wbto_form_text_limite_size' value='"+colonne["text_limite_size"]+"'></input></td></tr>";

		html+="<tr><td><label for='wbto_form_text_tokenizer_size'>"+glob_get_intitule("label_nb_tokens")+" : </label> </td><td> <input name='wbto_form_text_tokenizer_size' value='"+colonne["text_tokenizer_size"]+"'></input></td></tr>";
		html+="<tr><td><label for='wbto_form_text_nb_generated'>"+glob_get_intitule("label_nb_tokens_generated")+" : </label> </td><td> <input name='wbto_form_text_nb_generated' value='"+colonne["text_nb_generated"]+"'></input></td></tr>";
		html+="<tr><td><label for='wbto_form_text_nb_guess'>"+glob_get_intitule("label_nb_tokens_around")+" : </label> </td><td> <input name='wbto_form_text_nb_guess' value='"+colonne["text_nb_guess"]+"'></input></td></tr>";
		html+="<tr><td><label for='wbto_form_text_stride'>"+glob_get_intitule("label_text_stride")+" : </label> </td><td> <input name='wbto_form_text_stride' value='"+colonne["text_stride"]+"'></input></td></tr>";

		html+="<tr><td><label for='wbto_form_text_bool_minuscule'>"+glob_get_intitule("label_convert_lowercase")+" : </label> </td><td> <select name='wbto_form_text_bool_minuscule'>"+glob_get_liste_html("booleen", "")+"</select></td></tr>";
		html+="<tr><td><label for='wbto_form_text_bool_one_hot'>"+glob_get_intitule("label_convert_one_hot")+" : </label> </td><td> <select name='wbto_form_text_bool_one_hot'>"+glob_get_liste_html("booleen", "")+"</select></td></tr>";
		html+="<tr><td><label for='wbto_form_text_bool_one_hot_A'>"+glob_get_intitule("label_convert_one_hot_a")+" : </label> </td><td> <select name='wbto_form_text_bool_one_hot_A'>"+glob_get_liste_html("booleen", "")+"</select></td></tr>";
		html+="<tr><td><label for='wbto_form_text_bool_one_hot_B'>"+glob_get_intitule("label_convert_one_hot_b")+" : </label> </td><td> <select name='wbto_form_text_bool_one_hot_B'>"+glob_get_liste_html("booleen", "")+"</select></td></tr>";

		html+="<tr><td colspan='2'><button name='wbto_form_valider' value='valider' onclick='"+this.nom_table_organizer+".valide_formulaire();"+"'>"+glob_get_intitule("button_validate")+"</button></td></tr>";
        html+="</table>";
        
        $("#"+this.formulaire_tableau).html(html);
        this.formulaire = $("#"+this.formulaire_tableau).dialog({autoOpen: false, height: 700, width: 600, modal: true, position: { my: "center top", at: "top+100", of: window, collision: "none" } });
        $("#"+this.formulaire_tableau+" [name='wbto_form_type'] option[value='"+colonne.type+"']").prop('selected', true); // on met la valeur de type
		$("#"+this.formulaire_tableau+" [name='wbto_form_img_channels'] option[value='"+colonne.img_channels+"']").prop('selected', true); // on met la valeur de img_channels
		$("#"+this.formulaire_tableau+" [name='wbto_form_img_format'] option[value='"+colonne.img_format+"']").prop('selected', true); // on met la valeur de img_format
		$("#"+this.formulaire_tableau+" [name='wbto_form_normalize'] option[value='"+colonne.normalize+"']").prop('selected', true); // on met la valeur de normalize
		$("#"+this.formulaire_tableau+" [name='wbto_form_text_tokenizer'] option[value='"+colonne.text_tokenizer+"']").prop('selected', true); // on met la valeur de text tokenizer
		$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_minuscule'] option[value='"+colonne.text_bool_minuscule+"']").prop('selected', true); // on met la valeur de bool_minuscule
		$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot'] option[value='"+colonne.text_bool_one_hot+"']").prop('selected', true); // on met la valeur de bool_one_hot
		$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot_A'] option[value='"+colonne.text_bool_one_hot_A+"']").prop('selected', true); // on met la valeur de bool_one_hot_A
		$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot_B'] option[value='"+colonne.text_bool_one_hot_B+"']").prop('selected', true); // on met la valeur de bool_one_hot_B
		$("#"+this.formulaire_tableau+" [name='wbto_form_text_type_generation'] option[value='"+colonne.text_type_generation+"']").prop('selected', true); // on met la valeur de type_generation
		$("#"+this.formulaire_tableau+" [name='wbto_form_img_type_generation'] option[value='"+colonne.img_type_generation+"']").prop('selected', true); // on met la valeur de img_type_generation
		$("#"+this.formulaire_tableau+" [name='wbto_form_cat_bool_one_hot'] option[value='"+colonne.cat_bool_one_hot+"']").prop('selected', true); // on met la valeur de cat_bool_one_hot

		this.masque_formulaire(); // on applique le masque
        this.formulaire.dialog("open");
    };
    
    ////////////////////////////////////////////////////////////////////////////
    // valide_formulaire
    this.valide_formulaire = function () {
        let id_colonne=$("#"+this.formulaire_tableau+" [name='wbto_form_id_colonne']").val();
        let name=$("#"+this.formulaire_tableau+" [name='wbto_form_name']").val();
        let min=$("#"+this.formulaire_tableau+" [name='wbto_form_min']").val();
        let max=$("#"+this.formulaire_tableau+" [name='wbto_form_max']").val();
		let normalize=$("#"+this.formulaire_tableau+" [name='wbto_form_normalize']").val();
		let normalization_range=$("#"+this.formulaire_tableau+" [name='wbto_form_normalization_range']").val();
		
        let nb_cat=$("#"+this.formulaire_tableau+" [name='wbto_form_nb_cat']").val();
        let defaut=$("#"+this.formulaire_tableau+" [name='wbto_form_defaut']").val();
		let cat_bool_one_hot=$("#"+this.formulaire_tableau+" [name='wbto_form_cat_bool_one_hot']").val();
		let cat_def_categories=$("#"+this.formulaire_tableau+" [name='wbto_form_cat_def_categories']").val();

		let img_height=$("#"+this.formulaire_tableau+" [name='wbto_form_img_height']").val();
		let img_width=$("#"+this.formulaire_tableau+" [name='wbto_form_img_width']").val();
		let img_channels=$("#"+this.formulaire_tableau+" [name='wbto_form_img_channels']").val();
		let img_format=$("#"+this.formulaire_tableau+" [name='wbto_form_img_format']").val();
		let img_url_base=$("#"+this.formulaire_tableau+" [name='wbto_form_img_url_base']").val();
		let img_type_generation=$("#"+this.formulaire_tableau+" [name='wbto_form_img_type_generation']").val();
		let diffusion_nb_etapes=$("#"+this.formulaire_tableau+" [name='wbto_form_diffusion_nb_etapes']").val();
		let diffusion_nb_noise_per_img=$("#"+this.formulaire_tableau+" [name='wbto_form_diffusion_nb_noise_per_img']").val();
		
		let text_tokenizer=$("#"+this.formulaire_tableau+" [name='wbto_form_text_tokenizer']").val();
		let text_vocab_size=$("#"+this.formulaire_tableau+" [name='wbto_form_text_vocab_size']").val();
		let text_bool_minuscule=$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_minuscule']").val();
		let text_bool_one_hot=$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot']").val();
		let text_bool_one_hot_A=$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot_A']").val();
		let text_bool_one_hot_B=$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot_B']").val();
		let text_tokenizer_size=$("#"+this.formulaire_tableau+" [name='wbto_form_text_tokenizer_size']").val();
		let text_limite_size=$("#"+this.formulaire_tableau+" [name='wbto_form_text_limite_size']").val();
		let text_type_generation=$("#"+this.formulaire_tableau+" [name='wbto_form_text_type_generation']").val();
		let text_nb_guess=$("#"+this.formulaire_tableau+" [name='wbto_form_text_nb_guess']").val();
		let text_nb_generated=$("#"+this.formulaire_tableau+" [name='wbto_form_text_nb_generated']").val();
		let text_stride=$("#"+this.formulaire_tableau+" [name='wbto_form_text_stride']").val();


        let type=$("#"+this.formulaire_tableau+" [name='wbto_form_type']").val();
        

        this.definition[id_colonne]["type"]=type;
        this.definition[id_colonne]["min"]=min;
        this.definition[id_colonne]["max"]=max;
        this.definition[id_colonne]["nb_cat"]=nb_cat;
        this.definition[id_colonne]["defaut"]=defaut;
		this.definition[id_colonne]["img_height"]=img_height;
		this.definition[id_colonne]["img_width"]=img_width;
		this.definition[id_colonne]["img_channels"]=img_channels;
		this.definition[id_colonne]["img_format"]=img_format;
		this.definition[id_colonne]["normalize"]=normalize;
		this.definition[id_colonne]["normalization_range"]=normalization_range;
		this.definition[id_colonne]["cat_bool_one_hot"]=cat_bool_one_hot;
		this.definition[id_colonne]["cat_def_categories"]=cat_def_categories;
		this.definition[id_colonne]["img_url_base"]=img_url_base;
		this.definition[id_colonne]["img_type_generation"]=img_type_generation;
		this.definition[id_colonne]["diffusion_nb_etapes"]=diffusion_nb_etapes;
		this.definition[id_colonne]["diffusion_nb_noise_per_img"]=diffusion_nb_noise_per_img;

		this.definition[id_colonne]["text_tokenizer"]=text_tokenizer;
		this.definition[id_colonne]["text_vocab_size"]=text_vocab_size;
		this.definition[id_colonne]["text_bool_minuscule"]=text_bool_minuscule;
		this.definition[id_colonne]["text_bool_one_hot"]=text_bool_one_hot;
		this.definition[id_colonne]["text_bool_one_hot_A"]=text_bool_one_hot_A;
		this.definition[id_colonne]["text_bool_one_hot_B"]=text_bool_one_hot_B;
		this.definition[id_colonne]["text_tokenizer_size"]=text_tokenizer_size;
		this.definition[id_colonne]["text_type_generation"]=text_type_generation;
		this.definition[id_colonne]["text_nb_guess"]=text_nb_guess;
		this.definition[id_colonne]["text_nb_generated"]=text_nb_generated;
		this.definition[id_colonne]["text_limite_size"]=text_limite_size;
		this.definition[id_colonne]["text_stride"]=text_stride;
        
        this.update_colonnes (id_colonne);
        this.formulaire.dialog("close");

    };
    
    ////////////////////////////////////////////////////////////////////////////
    // masque_formulaire
    // masque / affiche certains champs en fonction du type
    this.masque_formulaire = function () {
        
        let type=$("#"+this.formulaire_tableau+" [name='wbto_form_type']").val();
		
		let visible={};
		visible["wbto_form_min"]=["num"];
		visible["wbto_form_max"]=["num"];
		visible["wbto_form_nb_cat"]=["cat"];
		visible["wbto_form_cat_bool_one_hot"]=["cat"];
		visible["wbto_form_cat_def_categories"]=["cat"];
		visible["wbto_form_defaut"]=["num", "cat"];
		visible["wbto_form_img_url_base"]=["img"];
		visible["wbto_form_img_height"]=["img", "img_bytes"];
		visible["wbto_form_img_width"]=["img", "img_bytes"];
		visible["wbto_form_img_format"]=["img", "img_bytes"];
		visible["wbto_form_img_channels"]=["img", "img_bytes"];
		visible["wbto_form_normalize"]=["num", "img", "img_bytes"];
		visible["wbto_form_normalization_range"]=["num", "img", "img_bytes"];
		visible["wbto_form_img_type_generation"]=["img", "img_bytes"];
		visible["wbto_form_diffusion_nb_etapes"]=["img", "img_bytes"];
		visible["wbto_form_diffusion_nb_noise_per_img"]=["img", "img_bytes"];

		visible["wbto_form_text_tokenizer"]=["text"];
		visible["wbto_form_text_vocab_size"]=["text"];
		visible["wbto_form_text_bool_minuscule"]=["text"];
		visible["wbto_form_text_bool_one_hot"]=["text"];
		visible["wbto_form_text_bool_one_hot_A"]=["text"];
		visible["wbto_form_text_bool_one_hot_B"]=["text"];
		visible["wbto_form_text_tokenizer_size"]=["text"];
		visible["wbto_form_text_type_generation"]=["text"];
		visible["wbto_form_text_nb_guess"]=["text"];
		visible["wbto_form_text_nb_generated"]=["text"];
		visible["wbto_form_text_limite_size"]=["text"];
		visible["wbto_form_text_stride"]=["text"];
		
        for (let nom_champ in visible) {
			let types_visibles=visible[nom_champ];
			let attribut="wbto_hidden";
			if (types_visibles.indexOf(type) != -1) {
				attribut="wbto_visible";
			} 

            if (attribut === "wbto_visible") {
                $("#"+this.formulaire_tableau+" [name='"+nom_champ+"']").parent().parent().removeClass("wbto_hidden");
            } else {
                $("#"+this.formulaire_tableau+" [name='"+nom_champ+"']").parent().parent().addClass("wbto_hidden");
            }
        }

		// gestion des sous-masques texte
		if (type === "text") {
			let type_generation=$("#"+this.formulaire_tableau+" [name='wbto_form_text_type_generation']").val();
			let text_tokenizer=$("#"+this.formulaire_tableau+" [name='wbto_form_text_tokenizer']").val();
			if (type_generation === "1_tensor") {
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot_A']").parent().parent().addClass("wbto_hidden");
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot_B']").parent().parent().addClass("wbto_hidden");
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_nb_guess']").parent().parent().addClass("wbto_hidden");
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_nb_generated']").parent().parent().addClass("wbto_hidden");
				$("#" + this.formulaire_tableau + " [name='wbto_form_text_stride']").parent().parent().addClass("wbto_hidden");
			} else if (type_generation === "guess_next") {
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot']").parent().parent().addClass("wbto_hidden");
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_nb_guess']").parent().parent().addClass("wbto_hidden");
				$("#" + this.formulaire_tableau + " [name='wbto_form_text_stride']").parent().parent().addClass("wbto_hidden");
			} else if (type_generation === "guess_around") {
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_bool_one_hot']").parent().parent().addClass("wbto_hidden");
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_nb_generated']").parent().parent().addClass("wbto_hidden");
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_tokenizer_size']").parent().parent().addClass("wbto_hidden");
				$("#" + this.formulaire_tableau + " [name='wbto_form_text_stride']").parent().parent().addClass("wbto_hidden");
			} else if (type_generation === "guess_next_multi") {
				$("#" + this.formulaire_tableau + " [name='wbto_form_text_bool_one_hot']").parent().parent().addClass("wbto_hidden");
				$("#" + this.formulaire_tableau + " [name='wbto_form_text_nb_guess']").parent().parent().addClass("wbto_hidden");
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_nb_generated']").parent().parent().addClass("wbto_hidden");
			}

			if (text_tokenizer !== "word_tokenizer") {
				$("#"+this.formulaire_tableau+" [name='wbto_form_text_vocab_size']").parent().parent().addClass("wbto_hidden");
			}

		}

		// gestion des sous-masques image
		if (type === "img" || type === "img_bytes") {
			let type_generation = $("#" + this.formulaire_tableau + " [name='wbto_form_img_type_generation']").val();
			if (type_generation === "1_tensor") {
				$("#"+this.formulaire_tableau+" [name='wbto_form_diffusion_nb_etapes']").parent().parent().addClass("wbto_hidden");
				$("#"+this.formulaire_tableau+" [name='wbto_form_diffusion_nb_noise_per_img']").parent().parent().addClass("wbto_hidden");
			}
		}

    };
	
	////////////////////////////////////////////////////////////////////////////
    // Si gestion par tenseurs, on prépare, on génère les tenseurs et on affiche
	this.clique_generer_tenseurs = async function () {
		this.on_genere_data="affiche"; // on dit qu'on veut afficher les tenseurs à la fin de genere_data

		// gestion du split_tableau
		let champ_split_tableau=$("#split_tableau").val();
		if (champ_split_tableau !== "") {
			let elems=champ_split_tableau.split("/");
			if (elems.length !== 2) {
				alert ("le champ de division des données doit contenir 2 éléments ou aucun par ex. 2/5 ou */10");
				return false;
			}

			// gestion de l'auto_reload
			let idx=elems[0];
			if (idx === "*") {
				idx=0;
				this.split_tableau["auto_reload"]=true;
				this.on_genere_data="get_split_tableau";
			} else {
				this.split_tableau["auto_reload"]=false;
			}
			idx=Number(idx);
			let nb=Number(elems[1]);

			if (idx===NaN || nb ===NaN) {
				alert ("les 2 parties du champ de division des données doivent être des nombre ou *");
				return false;
			}

			this.split_tableau["bool"]=true;
			this.split_tableau["nb"]=nb;
			this.split_tableau["idx"]=idx;

		} else {
			this.split_tableau["bool"]=false;
		}
		this.genere_data(0);
	}
	
	////////////////////////////////////////////////////////////////////////////
    // Si gestion par dataset, on prépare, on génère les 10 premiers qu'on affiche
	this.clique_generer_dataset = async function () {
		this.on_genere_data="affiche"; // on dit qu'on veut afficher les tenseurs à la fin de genere_data
		this.set_dataset ({start:0,batch_size:10, bool_in_out:false}); // bool_size=1 va permettre d'indiquer qu'on est en mode dataset
		await this.prepare_data();
		this.get_batch({start:0,batch_size:10, bool_in_out:false});
	}

	////////////////////////////////////////////////////////////////////////////
    // col_text_2_tensor : génère un tenseur à partir d'une colonne de type text
	this.col_text_2_tensor = function (nom_colonne, param_colonne, colonne) {
		
		return new Promise(async (resolve) => {
			let text_tokenizer=param_colonne["text_tokenizer"];
			let text_size=Number(param_colonne["text_tokenizer_size"]);
			let tokenizer=tokenizers[text_tokenizer];
			let vocab_size=get_vocab_size(tokenizer);
			let text_bool_tokenized=param_colonne["text_bool_tokenized"];
			let bool_one_hot=param_colonne["text_bool_one_hot"];
			let text_expand_dims=param_colonne["text_expand_dims"];

			let text_array=[];

			let array1=colonne.values;
			let nb_lignes=0; // nb de lignes
			let longueur=array1.length;
			for (let idx in array1) {
				
				if (nb_lignes%1000 === 0) {
					let ratio2=nb_lignes*100/longueur;
					let ratio=ratio2.toFixed(2);
					$( "#"+this.zone_progression ).progressbar({value: Number(ratio)});
					$( "#"+this.zone_progression+" .progress-label").text(nb_lignes+" / "+longueur);
					await new Promise(resolve => requestAnimationFrame(resolve)); // permet de libérer le thread principal pour rafraichir l'écran (merci Le Chat pour cette astuce)
				}
				
				let texte=array1[idx];

				let tokens;
				if (text_bool_tokenized !== "true") {
					tokens=tokenizer.encode(texte, {});
				} else {
					if (Number.isInteger(texte)) {
						tokens=[texte];
					} else if (typeof(texte)==="string") {
						tokens=texte.split(","); // danfo ne sait pas gérer le type array, donc il a tout concaténé les tokens :(
						for (let toto in tokens) {
							tokens[toto]=Number(tokens[toto]);
						}
					} else {
						tokens=texte; // si array peut-être :/
					}
				}
				
				// on standardise la taille de la chaine finale
				if (text_size !== 0) {
					if (tokens.length > text_size) {
						tokens=tokens.slice (0, text_size);
					} else if (tokens.length < text_size) {
						let debut=tokens.length;
						for (let toto=debut; toto < text_size ; toto++) {
							tokens[toto]=0;
						}
					}
				}
				
				// on réduit la dimension si 1 seul token
				if (tokens.length===1) {
					tokens=tokens[0];
				}
				
				text_array[idx]=tokens;
				nb_lignes++;
			}

			let tensor;
			if (bool_one_hot === "true") {
				for (let idx_ligne in text_array) {
					let ligne=text_array[idx_ligne];
					if (Array.isArray(ligne)) { // si ligne est une array (plusieurs tokens)
						for (let idx_token in ligne) {
							let token=ligne[idx_token];
							let one_hot=int_2_one_hot(Number(token), vocab_size);
							text_array[idx_ligne][idx_token]=one_hot;
						}
					} else { // sinon (1 seul token)
						let one_hot=int_2_one_hot(Number(ligne), vocab_size);
						text_array[idx_ligne]=one_hot;
					}
					
				}

				// TODO : est-ce qu'il faut distinguer les cas avec 1 seul ou plusieurs mots ?
				if (text_size > 1) { // si plusieurs tokens par ligne, génère tenseur à 3 dimensions (batch/tokens/one_hot)
					tensor=tf.tensor(text_array, [nb_lignes, text_size, vocab_size], 'int32');
				} else { // si 1 seul token par ligne, génère tenseur à 2 dimensions (batch/one_hot)
					// tensor=tf.tensor(text_array, [nb_lignes, vocab_size], 'int32'); // désactivé tempiorairement
					tensor=tf.tensor(text_array, [nb_lignes, text_size, vocab_size], 'int32');
				}
			} else {
				if (text_size > 1) { // si plusieurs tokens par ligne, génère tenseur à 2 dimensions (batch/tokens)
					tensor=tf.tensor(text_array, [nb_lignes, text_size], 'float32');
				} else { // si 1 seul token par ligne, génère tenseur à 1 dimensions (batch)
					// tensor=tf.tensor(text_array, [nb_lignes], 'int32'); // désactivé temporairement
					tensor=tf.tensor(text_array, [nb_lignes, text_size], 'float32');
				}
			}

			if (text_expand_dims === "true") {
				let tensor2=tensor.expandDims(-1);
				tf.dispose(tensor);
				resolve(tensor2);
			} else {
				resolve (tensor);
			}

		}); // fin de promise	
	}
	
	////////////////////////////////////////////////////////////////////////////
    // col_num_2_tensor : génère un tenseur à partir d'une colonne de type num
	this.col_num_2_tensor = function (nom_colonne, param_colonne, colonne) {
		// on force la conversion en float
		colonne.asType("float32", {inplace:true});

		let min = Number(param_colonne["min"]);
		let max = Number(param_colonne["max"]);
		let normalize = param_colonne["normalize"]; // string "true" ou "false"
		let normalization_range=param_colonne["normalization_range"].split(":");
		let min_range=Number(normalization_range[0]);
		let max_range=Number(normalization_range[1]);
		let delta_range=Number(max_range - min_range);
		let delta=Number(max - min);
		let col2;
		if (normalize == "true") {
			col2=colonne.sub(min).mul(delta_range / delta).add(min_range);
		} else {
			col2=colonne;
		}

		return (col2.tensor);
	}
	
	////////////////////////////////////////////////////////////////////////////
    // col_cat_2_tensor : génère un tenseur à partir d'une catégorie
	// retourne tensor et one_hot (tableau ordonné des catégories)
	this.col_cat_2_tensor = function (nom_colonne, param_colonne, colonne) {
		colonne.asType("string", {inplace:true});
		let encoder=param_colonne["encoder"];
		if (param_colonne["cat_bool_one_hot"] === "false") {
			let tableau=get_labels(colonne.values, encoder["$labels"]);
			return ({tensor: tf.tensor1d(tableau)});
		} else {
			let tableau_one_hot = encoder.transform(colonne);
			return ({tensor: tableau_one_hot.tensor.cast("int32")});
		}
	}

	////////////////////////////////////////////////////////////////////////////
    // col_img_2_tensor : génère un tenseur à partir d'urls d'images
	// appelée la première fois par genere_data() pour traiter la première image
	// modifie l'url de l'image ce qui déclenche le onlaod associé à cette image
	// qui appelle à son tour img_2_tensor_onload qui convertit l'image en array et l'ajoute à this.i2t.buffer
	// quand la dernière image est traitée cette fonction les convertit toutes en tenseur puis rappelle genere_data avec l'idx de la colonne suivante
	// toutes les variables sont stockées dans this.i2t 
	this.col_img_2_tensor = async function() {
		let idx_colonne=this.i2t["idx_col"];
		let nom_colonne=this.intitules_colonnes[idx_colonne];
		let param_colonne=this.definition[idx_colonne];
		let last=this.i2t["idx"];
		let size=this.i2t["size"]; // en fait l'idx du dernier élément à récupérer
		let type=this.i2t["type"];;
		let colonne=this.i2t["serie"];
		let buffer=this.i2t["buffer"];
		let height=param_colonne["img_height"];
		let width=param_colonne["img_width"];
		let channels=param_colonne["img_channels"];
		let format=param_colonne["format"];
		let img_url_base=param_colonne["img_url_base"];

		// progressbar
		let ratio2=last*100/size;
		let ratio=ratio2.toFixed(2);
		$( "#"+this.zone_progression ).progressbar({value: Number(ratio)});
        $( "#"+this.zone_progression+" .progress-label").text(ratio+" %");
		
		// si on est arrivé à la dernière image
		if (last >= size) {
			// on crée le tenseur et on appelle genere_data()
			this.log ("création du tenseur");
			// on raz la progressbar
			$( "#"+this.zone_progression ).progressbar({value: 0}); 
			$( "#"+this.zone_progression+" .progress-label").text("");

			// si mode tenseur on crée un tenseur avec tous les enregistrements.
			// si mode dataset on crée un tenseur de longueur batch_size
			let nb_enregistrements=this.nb_rows_shuffled;
			if (this.ds["batch_size"] !== 0) {
				nb_enregistrements=this.ds["batch_size"];
			}

			param_colonne["tensor"]=tf.tensor(buffer, [Number(nb_enregistrements),Number(height),Number(width),Number(channels)]);

			this.genere_data(idx_colonne+1);

		} else { // sinon on récupère l'image
			let url_img="";
			if (type === "img_bytes") { // si img_bytes on génère une url à partir d'un blob
				let idx_image=this.tableau_sliced.index[last]; // ATTENTION l'ordre de tableau_array ne correspond pas à celui de tableau_shuffled (le 1er n'est pas shuffled). On doit donc d'abord récupérer l'index (préservé via la propriété index de danfo)
				let bytes=this.tableau_array[nom_colonne][idx_image]; // les bytes sont stockées dans this.tableau_array car danfo ne peut pas gérer ce genre de données
				const blob = new Blob([bytes], {type:'image/'+format});
				url_img=URL.createObjectURL(blob);
			
			} else { // si img on récupère juste la chaine de caractères
				let tmp=colonne.iloc([last]).values; 
				url_img=tmp[0];
				url_img=img_url_base+url_img;
			}
			
			// on incrémente l'idx de l'image qui sera traitée au prochain appel de la fonction
			this.i2t["idx"]++
			
			// on modifie l'url de la baslise html
			$("#"+this.zone_charge_image+" img").attr("height", height);
			$("#"+this.zone_charge_image+" img").attr("width", width); 
			$("#"+this.zone_charge_image+" img").attr("src", url_img);
			
			let img=$("#"+this.zone_charge_image+" img").get(0);

			// la suite sera géré par le onload de la baslise image modifiée qui appellera la méthode img_2_tensor_onload()
		}
	}
	
	////////////////////////////////////////////////////////////////////////////
    // img_2_tensor_onload
	// appelé par le onload de la balise img quand l'image est chargée
	// le paramètre img est la balise elle-même (élement html)
	
	this.img_2_tensor_onload = function (img) {
		let idx_colonne=this.i2t["idx_col"];
		let param_colonne=this.definition[idx_colonne];
		let buffer=this.i2t["buffer"];
		let channels=param_colonne["img_channels"];
		let height=param_colonne["img_height"];
		let width=param_colonne["img_width"];
		let normalize=param_colonne["normalize"]; // string "true" ou "false"
		let normalization_range=param_colonne["normalization_range"].split(":");
		let min_range=Number(normalization_range[0]);
		let max_range=Number(normalization_range[1]);
		let delta_range=Number(max_range - min_range);

		// on récupère le tenseur image qu'on convertit en array et ajoute au buffer
		let img_tableau= tf.tidy (()=>{
			const img_tensor=tf.browser.fromPixels(img, Number(channels)); // A ce stade en 255
			let toto;
			if (normalize == "true") {
				toto=img_tensor.mul(delta_range / 255).add(min_range).reshape([Number(height)*Number(width)*Number(channels)]).arraySync(); // on convertit tensor en array car tensor.stack beugue et on passe en 0 - 1
			} else {
				toto=img_tensor.reshape([Number(height)*Number(width)*Number(channels)]).arraySync(); // on convertit tensor en array car tensor.stack beugu
			}

			return(toto);
		})



		buffer.push(img_tableau);
		img_tableau=undefined; // ça sert à rien :/
		let url=$(img).attr("src");
		//console.log ("on revoke "+url);
		URL.revokeObjectURL(url);

		// On rappelle col_img_2_tensor pour traiter l'image suivante
		this.col_img_2_tensor ();
	};

	////////////////////////////////////////////////////////////////////////////
	// genere_tokeinzers
	// crée le ou les tokeinzers

	this.genere_tokenizers = async function (tableau) {
		tokenizers={}; // on raz les tokenizers
		for (let idx in this.definition) { // pour chaque colonne
			let nom_colonne=this.intitules_colonnes[idx];
			let param_colonne=this.definition[idx];
			// Colonnes de type TEXT /////////////////////////////////////////////////
			if (param_colonne["type"]==="text") {
				// initialisation du Tokenizer
				let colonne=tableau.column(nom_colonne);
				let text_tokenizer=param_colonne["text_tokenizer"];
				let text_vocab_size=Number(param_colonne["text_vocab_size"]);
				let text_tokenizer_size=Number(param_colonne["text_tokenizer_size"]);
				let text_limite_size=Number(param_colonne["text_limite_size"]);
				let text_bool_minuscule=param_colonne["text_bool_minuscule"];
				if (text_bool_minuscule === "true") {
					text_bool_minuscule=true;
				} else {
					text_bool_minuscule=false;
				}
				if (text_tokenizer === "word_tokenizer") {
					this.log (glob_get_intitule("label_tokenizer_generation"));
					let max_nb_words=undefined;
					if (text_limite_size != "") {
						max_nb_words=text_limite_size;
					}
					tokenizers[text_tokenizer]=new word_tokenizer ({vocab_size:text_vocab_size, bool_minuscule:text_bool_minuscule, max_nb_words:max_nb_words});
					for (let idx_elem=0 ; idx_elem < colonne.size ; idx_elem++) {
						let elem=colonne.iloc([idx_elem]).values[0];
						tokenizers[text_tokenizer].genere_dictionnaire(tokenizers[text_tokenizer].tokenize(elem));
					}
					this.log (glob_get_intitule("label_vocabulary_generation"));
					tokenizers[text_tokenizer].genere_vocab();
					this.log (glob_get_intitule("label_done"));
				} else {
					tokenizers[text_tokenizer] = await glob_tokenizer.from_pretrained(text_tokenizer); // pour l'instant on ne gère que les tokenizers Huggingface
				}
			}
		}

	}

	////////////////////////////////////////////////////////////////////////////
	// genere_one_hot_encoder
	// génère un encodeur one hot à partir d'une Serie
	// retourne l'objet encodeur, ainsi que le vocabulaire sous forme d'array [cat1, cat2, cat3, ...]
	this.genere_one_hot_encoder = function (colonne) {
		colonne.asType("string", {inplace:true});
		let retour={};
		let encoder = new dfd.OneHotEncoder();
		encoder.fit(colonne);
		retour["encoder"]=encoder;
		retour["vocab"]=[...encoder["$labels"]]; // on retourne une copie du tableau
		return(retour);
	}

	////////////////////////////////////////////////////////////////////////////
	// change_definition_img
	// pour le cas de colonnes img ou img_bytes devant générer pluseiurs colonnes (diffusion)
	// on modifie this.definition
	this.change_defintion_img = function () {
		let idx_col_img;
		let nom_col_img;

		// 1) récupérer le nom de la colonne img à régénérer et les infos
		for (let idx_col in this.definition) {
			let nom_colonne = this.intitules_colonnes[idx_col];
			let param_colonne = this.definition[idx_col];
			if ((param_colonne["type"] === "img" || param_colonne["type"] === "img_bytes") && param_colonne["img_type_generation"] === "noise") {
				idx_col_img=idx_col;
				nom_col_img=nom_colonne;
				this.diffusion["diffusion_nb_etapes"]=Number(param_colonne["diffusion_nb_etapes"]);
				this.diffusion["diffusion_nb_noise_per_img"]=Number(param_colonne["diffusion_nb_noise_per_img"]);
			}
		}

		// 2) on ajoute 3 colonnes à this.definition et intitules_colonnes et à tableau_retour
		// + on change les types de colonne en text_mere et text_fille
		this.intitules_colonnes.push (nom_col_img+"_A");
		this.intitules_colonnes.push (nom_col_img+"_B");
		this.intitules_colonnes.push (nom_col_img+"_C");
		idx_col_img_A=this.definition.push(structuredClone(this.definition[idx_col_img]))-1;
		idx_col_img_B=this.definition.push(structuredClone(this.definition[idx_col_img]))-1;
		idx_col_img_C=this.definition.push(structuredClone(this.definition[idx_col_img]))-1;
		this.definition[idx_col_img_A]["type"]=this.definition[idx_col_img]["type"]+"_fille"; // img_fille ou img_bytes_fille
		this.definition[idx_col_img_B]["type"]=this.definition[idx_col_img]["type"]+"_fille"; // img_fille ou img_bytes_fille
		this.definition[idx_col_img_C]["type"]="void";
		this.definition[idx_col_img_C]["normalize"]="false";
		this.definition[idx_col_img_A]["name"]=nom_col_img+"_A";
		this.definition[idx_col_img_B]["name"]=nom_col_img+"_B";
		this.definition[idx_col_img_C]["name"]=nom_col_img+"_C";

		this.definition[idx_col_img_A]["bool_regenere_min_max"]="true";
		this.definition[idx_col_img_B]["bool_regenere_min_max"]="true";
		this.definition[idx_col_img_A]["diffusion_role"]="noised_image";
		this.definition[idx_col_img_B]["diffusion_role"]="noise";
		this.definition[idx_col_img_C]["diffusion_role"]="step";

		this.diffusion["idx_col_img_mere"]=idx_col_img;
		this.diffusion["idx_col_img_A"]=idx_col_img_A;
		this.diffusion["idx_col_img_B"]=idx_col_img_B;
		this.diffusion["idx_col_img_C"]=idx_col_img_C;

	}

	////////////////////////////////////////////////////////////////////////////
	// change_definition_text
	// pour le cas de colonnes texte devant générer pluseiurs colonnes (guess nexr, guess around)
	// on modifie this.definition
	this.change_defintion_text = function () {
		let idx_col_text;
		let nom_col_text;
		let text_type_generation;
		let text_tokenizer;
		let text_bool_one_hot_A;
		let text_bool_one_hot_B;
		let text_nb_generated;
		let text_limite_size;
		let idx_col_text_A;
		let idx_col_text_B;

		// 1) récupérer le nom de la colonne texte à régénérer et les infos
		for (let idx_col in this.definition) {
			let nom_colonne=this.intitules_colonnes[idx_col];
			let param_colonne=this.definition[idx_col];
			if (param_colonne["type"] === "text" && (param_colonne["text_type_generation"] === "guess_next" || param_colonne["text_type_generation"] === "guess_next_multi" || param_colonne["text_type_generation"] === "guess_around")) {
				idx_col_text=idx_col;
				nom_col_text=nom_colonne;
				text_type_generation=param_colonne["text_type_generation"];
				text_tokenizer=param_colonne["text_tokenizer"];
				text_bool_one_hot_A=param_colonne["text_bool_one_hot_A"];
				text_bool_one_hot_B=param_colonne["text_bool_one_hot_B"];
				text_nb_generated=param_colonne["text_nb_generated"];
				text_limite_size=param_colonne["text_limite_size"];
			}
		}

		// 2) on ajoute 2 colonnes à this.definition et intitules_colonnes et à tableau_retour
		// + on change les types de colonne en text_mere et text_fille
		this.intitules_colonnes.push (nom_col_text+"_A");
		this.intitules_colonnes.push (nom_col_text+"_B");
		idx_col_text_A=this.definition.push(structuredClone(this.definition[idx_col_text]))-1;
		idx_col_text_B=this.definition.push(structuredClone(this.definition[idx_col_text]))-1;
		this.definition[idx_col_text_A]["name"]=nom_col_text+"_A";
		this.definition[idx_col_text_B]["name"]=nom_col_text+"_B";
		this.definition[idx_col_text_A]["text_bool_tokenized"]="true";
		this.definition[idx_col_text_B]["text_bool_tokenized"]="true";
		this.definition[idx_col_text_A]["type"]="text_fille";
		this.definition[idx_col_text_B]["type"]="text_fille";
		this.definition[idx_col_text]["type"]="text_mere";

		// 3) On définit bool_one_hot pour les colonnes A et B
		if (text_bool_one_hot_A === "true") {
			this.definition[idx_col_text_A]["text_bool_one_hot"]="true";
		} else {
			this.definition[idx_col_text_A]["text_bool_one_hot"]="false";
		}
		if (text_bool_one_hot_B === "true") {
			this.definition[idx_col_text_B]["text_bool_one_hot"]="true";
		} else {
			this.definition[idx_col_text_B]["text_bool_one_hot"]="false";
		}

		// si guess_next, le tenseur de la colonne B doit avoir la longueur de texte_nb_generated
		if (text_type_generation === "guess_next") {
			this.definition[idx_col_text_B]["text_tokenizer_size"]=text_nb_generated;
		}

		// si guess_next_multi
		if (text_type_generation === "guess_next_multi") {
			this.definition[idx_col_text_B]["text_expand_dims"]="true"; // bug tfjs pour sparseCategoricalCrossEntropie : il attend en target un tenseur de la forme [batchSize, vocabSize, 1] au lieu de juste [batchSize, vocabSize]
			// on ne fait rien A et B doivent avoir la atille text_tokenizer_size qui est ce qui est paramétré pour la colonne mère
		}

		// si guess_around, les tenseurs des colonnes A et B ne doit avoir qu'une longueur de 1
		if (text_type_generation === "guess_around") {
			this.definition[idx_col_text_A]["text_tokenizer_size"]="1";
			this.definition[idx_col_text_B]["text_tokenizer_size"]="1";
		}
	}

	////////////////////////////////////////////////////////////////////////////
	// raz_definition_text
	// remet une colonne de type text_mere en text et supprime les colonnes de type text_fille
	// idem pour les colonnes img_fille et img_bytes_fille
	this.raz_definition_text = function () {
		let cols_a_supprimer=[];
		for (let idx_col in this.definition) {
			let param_colonne = this.definition[idx_col];
			let nom_colonne=param_colonne["name"];
			if (param_colonne["type"] === "text_fille" || param_colonne["type"] === "img_fille" || param_colonne["type"] === "img_bytes_fille") {
				cols_a_supprimer.push(nom_colonne);
			} else if (param_colonne["type"] === "text_mere") {
				param_colonne["type"]="text";
			}
		}

		// on supprime les colonnes dans un 2nd temps car si on le fait dans le premier for
		// le comptage des colonnes se décale
		for (let a_supprimer in cols_a_supprimer) {
			for (let idx_col in this.definition) {
				let nom_col_a_supprimer=cols_a_supprimer[a_supprimer];
				if (nom_col_a_supprimer === this.definition[idx_col]["name"]) {
					this.definition.splice(idx_col,1);
				}
			}
		}

		// on raz le booléen
		this.bool_data_prepared=false;

	}

	////////////////////////////////////////////////////////////////////////////
	// diffusion_genere_schedule
	// génère this.diffusion_schedule pour la diffusion
	this.diffusion_genere_schedule = function (T, min_signal_rate=0.001, max_signal_rate=0.999) {
		let start_angle=Math.acos(max_signal_rate);
		let end_angle=Math.acos(min_signal_rate);
		let signal_rates=[];
		let noise_rates=[];
		for (let t=0 ; t<T; t++) {
			let diffusion_time=t/T;
			let diffusion_angle=start_angle + diffusion_time * (end_angle - start_angle);
			signal_rates.push(Math.cos(diffusion_angle));
			noise_rates.push(Math.sin(diffusion_angle))
		}
		return {beta:noise_rates, alpha:[], alphaBar:signal_rates};
	}


	////////////////////////////////////////////////////////////////////////////
    // prepare_data
	// prépare les données avant la création du tenseur ou du dataset (genere_data)
	this.prepare_data = async function() {
		let idx;
		let nb_col=this.definition.length;
		let tableau_shuffled=null;
		let text_type_generation=0;
		let img_type_generation=0;
		let diffusion_nb_etapes=0;
		let diffusion_nb_noise_per_img=0;


		// on raz les colonnes text si nécessaire
		this.raz_definition_text();

		this.log (glob_get_intitule("label_data_preparation"));
		
		// 1) shuffle des données 
		this.log (glob_get_intitule("label_data_shuffle"));
		let size=this.tableau.shape[0];
		tableau_shuffled=await this.tableau.sample(size);
		
		// 2) Traitements effectués sur chaque colonne
		for (idx in this.definition) { // pour chaque colonne 
			let nom_colonne=this.intitules_colonnes[idx];
			let param_colonne=this.definition[idx];
			let colonne=tableau_shuffled.column(nom_colonne);
			
			// a. supprimer colonnes inutilisées
			if (param_colonne["type"]=="void") {
				//console.log ("suppr. colonne "+nom_colonne);
				this.log (glob_get_intitule("label_column_deleted", {"%nom_colonne":nom_colonne}));
				tableau_shuffled.drop({ columns: [nom_colonne], inplace: true });
			}
			
			// b. mettre les valeurs par défaut pour chaque colonne
			let defaut=param_colonne["defaut"];
			if (defaut !== "") {
				if (defaut === "mean") {
					defaut=param_colonne["mean"];
				} else if (defaut === "median") {
					defaut=param_colonne["median"];
				}
				this.log (glob_get_intitule("label_default_value_set", {"%nom_colonne":nom_colonne, "%defaut":defaut}));
				tableau_shuffled.fillNa(defaut, {columns:[nom_colonne], inplace:true});
			}
			
			// c. compter les colonnes de type texte qui doivent créer 2 tensors (on ne peut en gérer qu'une seule)
			if (param_colonne["type"]=="text" && (param_colonne["text_type_generation"]==="guess_next" || param_colonne["text_type_generation"]==="guess_next_multi" || param_colonne["text_type_generation"]==="guess_around")) {
				text_type_generation++;
			}

			// c bis. idem avec les colonnes images pour la diffusion
			if ((param_colonne["type"]=="img" || param_colonne["type"]=="img_bytes")&& param_colonne["img_type_generation"]==="noise") {
				img_type_generation++;
				diffusion_nb_etapes=Number(param_colonne["diffusion_nb_etapes"]);
				diffusion_nb_noise_per_img=Number(param_colonne["diffusion_nb_noise_per_img"]);
			}
		} // fin du pour chaque colonne

		// 3) on s'assure qu'il y a au plus 1 colonne text ou images devant générer plusieurs tenseurs
		if (text_type_generation + img_type_generation > 1) {
			alert (glob_get_intitule("alert_only_one_multitensors_text"));
			return (false);
		}

		// 4) On supprime les lignes vides
		this.log (glob_get_intitule("label_empty_rows_deleted"));
		tableau_shuffled.dropNa({axis:1, inplace:true});
		
		// 5) Pour les colonnes de type TEXT on prépare le tokenizer
		await this.genere_tokenizers(tableau_shuffled);

		// 6) Si colonnes texte générant plusieurs tenseurs, on rédéfinit this.definition pour ajouter colonne A & B
		if (text_type_generation == 1) {
			this.change_defintion_text ();
		}

		// 6 bibs) Si colonnes img générant plusieurs tenseurs, on rédéfinit this.definition pour ajouter colonne A & B & C + on génère le scheduler
		if (img_type_generation == 1) {
			this.diffusion_schedule=this.diffusion_genere_schedule (diffusion_nb_etapes);
			this.diffusion_bool_regenere=true;
			this.change_defintion_img ();
		}

		
		// 7) pour les colonnes de type cat, on prépare le one hot encoder il faut le faire APRES la suppression des lignes vides
		// /!\ doit être fait après la régénération text
		for (let idx in this.definition) { // pour chaque colonne 
			let nom_colonne=this.intitules_colonnes[idx];
			let param_colonne=this.definition[idx];
			// Colonnes de type CAT /////////////////////////////////////////////////
			if (param_colonne["type"]=="cat") {
				let colonne;
				if (param_colonne["cat_def_categories"] != "") {
					let a_encoder=[];
					let def_categories=JSON.parse(param_colonne["cat_def_categories"]);
					for (let code_cat in def_categories) {
						let intitule_cat=def_categories[code_cat];
						a_encoder.push(code_cat);
					}
					colonne = new dfd.Series(a_encoder);
					param_colonne["labels"]=def_categories;
				} else {
					colonne = tableau_shuffled.column(nom_colonne);
				}


				colonne.asType("string", {inplace: true});
				let tmp = this.genere_one_hot_encoder(colonne);
				param_colonne["encoder"] = tmp["encoder"];
				let nouv_noms_colonnes = tmp["vocab"];
				// si les intitulés des catégories sont fournis séparément (fichiers parquet)
				if (count(param_colonne["labels"]) > 0) {
					for (let idx_label in param_colonne["labels"]) {
						let intitule_one_hot = param_colonne["labels"][idx_label];
						for (idx_one_hot in nouv_noms_colonnes) {
							if (String(nouv_noms_colonnes[idx_one_hot]) === String(idx_label)) {
								nouv_noms_colonnes[idx_one_hot] = intitule_one_hot;
							}
						}
					}
				}
				if (param_colonne["cat_bool_one_hot"] === "true") {
					param_colonne["one_hot"] = nouv_noms_colonnes;
				} else {
					param_colonne["one_hot"]=[param_colonne["name"]];
				}

			}
		}
		
		// 8) on sauvegarde tableau_shuffled si la fonction est appelée de manière asynchrone
		this.tableau_shuffled=tableau_shuffled;
		this.nb_rows_shuffled=this.tableau_shuffled.shape[0];
		
		// 8) on maj this.bool_data_prepared
		this.bool_data_prepared=true;

		return (true);
	}
	
	////////////////////////////////////////////////////////////////////////////
    // genere_data
	// la fonction est asynchrone, car la gestion des images doit être faite en asynchrone.
	// dans ce cas, la fonction s'arrête et elle est rappelée quand les images ont fini d'être traitées
	// idx_col vaut 0 au premier appel. ensuite il indique la dernière colonne traitée + 1
	// l'affichage peut être traité au début ou à la fin selon que la dernière colonne traitée était image ou pas
	this.genere_data = async function(idx_col) {

		// Si les données n'ont pas encore été préparées on le fait
		if (this.bool_data_prepared===false) {
			await this.prepare_data();
		}

		let nb_col=this.definition.length;

		// Gestion batch : on récupère une tranche du tableau de taille batch_size (ou la totalité si gestion tenseur)
		// on ne le fait que lors du premier appel de la fonction pour un batch donné
		if (idx_col === 0) {
			this.tableau_sliced=this.get_slice_tableau(this.tableau_shuffled);

			// Gestion de la régénération du tableau en cas de colonne texte générant 2 tenseurs (texte)
			this.tableau_sliced=await this.regenere_tableau_text (this.tableau_sliced);

		}
		let tableau_sliced=this.tableau_sliced

		// gestion de la récursivité : si la dernière colonne a été traitée fin
		// sinon on reprend à la colonne où on s'était arrêté
		if (idx_col >= nb_col) {
			this.log (glob_get_intitule("label_generation_end"));
			$( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_traitements"));
			setTimeout(this.diffusion_regenere_tensors, 1000, {}, this);
			return (true);
			
		}
		
        //on génère le tenseur ou dataset pour chaque colonne
		for (idx in this.definition) { // pour chaque colonne 
			let nom_colonne=this.intitules_colonnes[idx];
            let param_colonne=this.definition[idx];
			
			// si récursivité : si la colonne a déjà été traitée on passe à la suite
			if (idx < idx_col) {
				continue;	
			}
			// si colonne non utilisée, on passe à la suite
			if (param_colonne["type"]==="void" || param_colonne["type"]==="text_mere" || param_colonne["type"]==="img_fille" || param_colonne["type"]==="img_bytes_fille") {
				continue;
			}
			if (param_colonne["type"]==="num" && param_colonne["diffusion_role"]==="step") {
				continue;
			}
			this.log (glob_get_intitule("label_processing_column", {"%nom_colonne":nom_colonne}));
			
			// on récupère la colonne sous forme de df.series
			let colonne=tableau_sliced.column(nom_colonne);
			
			// on dispose un éventuel tenseur existant
			try {
				tf.dispose(param_colonne["tensor"]);
				param_colonne["tensor"]=undefined;
			} catch (e) {
				console.log ("impossible de dispose le tenseur de la colonne "+nom_colonne);
			}
			
			// Traitements et conversion en tenseur selon le type de colonne
			if (param_colonne["type"]==="num") {
				param_colonne["tensor"]=this.col_num_2_tensor (nom_colonne, param_colonne, colonne);
			} else if (param_colonne["type"]==="cat") {
				let tmp=this.col_cat_2_tensor (nom_colonne, param_colonne, colonne);
				param_colonne["tensor"]=tmp["tensor"];
			} else if (param_colonne["type"]==="img" || param_colonne["type"]==="img_bytes") {
				// on enregistre toutes les infos dans this.definition. elles seront maj de manière récursive
				let debut=0;
				let fin=colonne.size;
				this.i2t["idx"]=debut; // prochaine image à traiter
				this.i2t["serie"]=colonne;
				this.i2t["buffer"]=[];
				this.i2t["type"]=param_colonne["type"];
				this.i2t["idx_col"]=idx;
				this.i2t["size"]=fin;
				this.col_img_2_tensor (); // asynchrone
				return(true); // on interrompt la fonction. Elle sera rappelée une fois que toutes les images auront été traitées
			} else if (param_colonne["type"]==="text" || param_colonne["type"]==="text_fille") {
				let tmp=await this.col_text_2_tensor (nom_colonne, param_colonne, colonne);
				param_colonne["tensor"]=tmp;
			}
		}
		
		// affichage
		this.log ("fin de la préparation des données");
		if (this.on_genere_data=="affiche") {
			$( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_traitements"));
			setTimeout(this.diffusion_regenere_tensors, 1000, {}, this);
		} else if (this.on_genere_data=="get_batch") {
			this.on_batch_ready();
		} else if (this.on_genere_data=="get_split_tableau") {
			if (this.split_tableau["idx"] === 0) { // si 1e split on affiche
				$( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_traitements"));
				setTimeout(this.diffusion_regenere_tensors, 1000, {}, this);
			} else { // splits suivants auto_reload
				$( "#"+this.zone_progression+" .progress-label").text(glob_get_intitule("label_traitements"));
				setTimeout(this.diffusion_regenere_tensors, 100, {action_fin:"fit"}, this);
			}
		}
		return (true);

    };

	////////////////////////////////////////////////////////////////////////////
	// get_slice_tableau
	// retourne une portion du dataframe tableau passé en paramètre si gestion par batch
	// ou la totalité si gestion par tenseur
	this.get_slice_tableau = function(tableau) {
		let tableau_sliced;
		// on raz split tableau
		if (this.split_tableau["nb_rows_shuffled"] > 0) { // si on adéjà utilisé split_tableau
			this.nb_rows_shuffled=this.split_tableau["nb_rows_shuffled"];
		}

		if (this.ds["batch_size"] != 0) { // si dataset on retourne une partie de la colonne
			let begin=this.ds["idx"];
			let end=begin+this.ds["batch_size"];
			if (end > this.nb_rows_shuffled) {
				end=this.nb_rows_shuffled;
			}
			let iloc_str=begin+":"+end;
			tableau_sliced=tableau.iloc({rows:[iloc_str]});
		} else if (this.split_tableau["bool"]===true) { // si split tableau
			let taille=Math.floor(this.nb_rows_shuffled / this.split_tableau["nb"]);
			let begin=taille*this.split_tableau["idx"];
			let end=begin+taille;
			if (end > this.nb_rows_shuffled) {
				end=this.nb_rows_shuffled;
			}
			let iloc_str=begin+":"+end;
			tableau_sliced=tableau.iloc({rows:[iloc_str]});
			this.split_tableau["nb_rows_shuffled"]=this.nb_rows_shuffled;
			this.nb_rows_shuffled=tableau_sliced.shape[0];

		} else { // si standard
			tableau_sliced=tableau;
		}
		return (tableau_sliced);
	}

	////////////////////////////////////////////////////////////////////////////
	// à partir d'une chaine, génère 1 tableau avec 2 colonnes avec la même chaine mais décalée d'un token
	// les valeurs retournées sont des tokens encodés (tableau d'entiers)
	// text_limite_size : on ne prend que n tokens à partir du début de la chaine (le reste est ignoré)
	// max_nb_words : longueur des tenseurs A et B
	// stride : décalage de la fenêtre si taille du teexte >
	this.text_2_guess_next_multi = function (chaine, tokenizer, text_limite_size, max_nb_words, stride) {
		let retour={A:[], B:[]};
		let tokens=tokenizer.encode(chaine);
		max_nb_words=Number(max_nb_words);
		stride=Number(stride);
		text_limite_size=Number(text_limite_size);

		if (text_limite_size !== 0) {
			tokens=tokens.slice(0, text_limite_size);
		}

		if (stride === undefined || stride === 0 || stride === null) {
			stride=Math.floor(max_nb_words/2); // par défaut on décale la fenêtre de la moitié de la taille
		}

		// on s'assure d'avoir au minimum max_nb_words+1 tokens (le +1 c'est pour le décalage)
		if (tokens.length < max_nb_words+1) {
			for (let idx=tokens.length ; idx<max_nb_words+1; idx++) {
				tokens[idx]=0;
			}
		}
		let tokens_length=tokens.length;

		let pos=0;
		bool_continue=true;
		while (bool_continue === true) {
			// si le nb de tokens restant est trop petit, on se cale à partir de la fin et on arrête
			if (pos + max_nb_words + 1 > tokens_length) {
				pos=tokens_length-(max_nb_words+1);
				bool_continue=false;
			}
			let A=tokens.slice(pos, pos+max_nb_words);
			let B=tokens.slice(pos+1, pos+max_nb_words+1);
			retour["A"].push(A);
			retour["B"].push(B);
			pos+=stride;
		}
		return (retour);
	}


	
	////////////////////////////////////////////////////////////////////////////
	// à partir d'une chaine, génère 1 tableau avec 2 colonnes avec le début de la chaine et le prochain mot à deviner
	// les valeurs retournées sont des tokens encodés (tableau d'entiers)
	// text_limite_size : on ne prend que n tokens à partir du début de la chaine (le reste est ignoré)
	// max_nb_words : longueur du tenseur A
	// nb_words : longeur tenseur B
	this.text_2_guess_next = function (chaine, tokenizer, text_limite_size, max_nb_words, nb_words=1) {
		let retour={A:[], B:[]};
		let tokens=tokenizer.encode(chaine);
		max_nb_words=Number(max_nb_words);
		nb_words=Number(nb_words);
		text_limite_size=Number(text_limite_size);

		//let cpt_word=0;
		let debut=0;
		let fin=0;
		if (text_limite_size !== 0) {
			tokens=tokens.slice(0, text_limite_size);
		}

		let nb_tokens=count(tokens);
		for (let idx_token in tokens) {
			idx_token=Number(idx_token);

			if (idx_token === 0) {
					continue;
			}
			debut=idx_token-max_nb_words;
			if (debut < 0) {
				debut=0;
			}
			let A=tokens.slice (debut, idx_token);
			let B;
			if (nb_words === 1) {
				B=tokens[idx_token];
			} else {
				fin=idx_token+nb_words;
				if (fin > nb_tokens) {
					fin=nb_tokens;
				}
				B=tokens.slice (idx_token, fin);
				if (B.length < nb_words) { // on s'assure que le tenseur B aura bien une longueur fixe
					for (let toto = B.length ; toto < nb_words ; toto++) {
						B[toto]=0;
					}
				}
			}

			retour["A"].push(A);
			retour["B"].push(B);

		}

		return (retour);
	}

	////////////////////////////////////////////////////////////////////////////
	// à partir d'une chaine, génère 1 tableau avec 2 colonnes avec un mot chacune les nb_mots avant et après
	// les valeurs retournées sont des tokens encodés (tableau d'entiers)
	this.text_2_guess_around = function (chaine, tokenizer, text_limite_size, nb_mots=1) {
		text_limite_size=Number(text_limite_size);
		let retour={A:[], B:[]};
		let tokens=tokenizer.encode(chaine);
		if (text_limite_size !== 0) {
			tokens=tokens.slice(0, text_limite_size);
		}
		let nb_tokens=tokens.length;
		for (let idx_token in tokens) { // pour chaque token

			let token=tokens[idx_token];

			// balayage des mots avant
			for (let avant = 1 ; avant <= nb_mots ; avant++) {
				let idx_avant=Number(idx_token)-avant;
				if (idx_avant >= 0) {
					let token_avant=tokens[idx_avant];
					retour["A"].push(token_avant);
					retour["B"].push(token);
				}
			}

			// balayage des mots après
			for (let apres = 1 ; apres <= nb_mots ; apres++) {
				let idx_apres=Number(idx_token)+apres;
				if (idx_apres < nb_tokens) {
					let token_apres=tokens[idx_apres];
					retour["A"].push(token_apres);
					retour["B"].push(token);
				}
			}
		} // fin du pour chaque token
		return (retour);

	}

	////////////////////////////////////////////////////////////////////////////
	//

	function diffusion_genere_bruit (schedule, batchImagesTensor, etapesAleatoiresTensor) {
		return tf.tidy(() => {
			// 1. Convertis les étapes en alphaBar_t (vectorisé)
			// le 1er tenseur contient les valeurs (entre 0 et 1) pour chaque étape
			// le 2e tenseur contient l'étape à appliquer pour chaque image
			// le résultat est une valeur entre 0 et 1 pour chaque image
			const A=tf.tensor1d(schedule.alphaBar);
			const B=etapesAleatoiresTensor.sub(1).cast("int32");
			B.print();
			const alphaBar = tf.gather(A, B);

			// 2. Redimensionne pour broadcast : [batchSize] → [batchSize, 1, 1, 1]
			const sqrtAlphaBar = tf.sqrt(alphaBar).reshape([-1, 1, 1, 1]);
			const sqrtUnMoinsAlphaBar = tf.sqrt(tf.sub(1, alphaBar)).reshape([-1, 1, 1, 1]);

			// 3. Génère le bruit pour tout le batch
			const bruit = tf.randomNormal(batchImagesTensor.shape); // [batchSize, H, W, C]

			// 4. Applique la formule en une seule opération vectorisée
			const batchBruite = tf.add(
				tf.mul(batchImagesTensor, sqrtAlphaBar),  // Broadcast automatique
				tf.mul(bruit, sqrtUnMoinsAlphaBar)
			);

			return { batchBruite, bruit };
		});
	}


	////////////////////////////////////////////////////////////////////////////
	// régénère les tenseurs générés pour ajouter le bruit dans le cas de la diffusion
	//
	this.diffusion_regenere_tensors = function (params, that) {

		let action_fin=params["action_fin"];

		// si pas de diffusion on retourne (après affichage) ou on lance l'entrainement (si split_data avec auto_load)
		if (that.diffusion_bool_regenere === false) {
			$( "#"+that.zone_progression+" .progress-label").text("OK");
			if (action_fin=="fit") { // on lance un entrainement : si split_data avec auto-reload
				let training = training_organizer;
				training.fit();
			} else {
				that.affiche_x_y();
				that.affiche_fin();

			}
			return (true);
		}

		idx_col_img_mere=that.diffusion["idx_col_img_mere"];
		idx_col_img_A=that.diffusion["idx_col_img_A"];
		idx_col_img_B=that.diffusion["idx_col_img_B"];
		idx_col_img_C=that.diffusion["idx_col_img_C"];
		diffusion_nb_noise_per_img=that.diffusion["diffusion_nb_noise_per_img"];
		diffusion_nb_etapes=that.diffusion["diffusion_nb_etapes"];

		let tensors={}; // tenseurs d'origine
		let tensors_tiled={}; // tenseurs qu'on a répétés
		let etapes=[];

		// 1) on récupère les tenseurs générés sous forme d'arrays
		for (let idx_col in that.definition) {
			if (that.definition[idx_col]["tensor"] !== undefined && that.definition[idx_col]["tensor"] !== null) {
				tensors[idx_col]=that.definition[idx_col]["tensor"];
			}
		}

		// 2) on augmente tous les tenseurs de diffusion_nb_noise_per_img
		for (let idx_col in tensors) {
			let rank=tensors[idx_col].rank; // nb dimensions du tenseur
			let reps=new Array(rank).fill(1);
			reps[0]=diffusion_nb_noise_per_img;

			tf.setBackend('cpu'); // Bug de tf.tile X( on est obligé de passer en mode cpu X(((
			//console.log ("génération du tenseur en mode cpu");
			tensors_tiled[idx_col]=tensors[idx_col].tile(reps);
			tf.setBackend('webgl');
			//console.log ("repassage en mode webgl");
			tensors_tiled[idx_col] = tf.tidy(() => tensors_tiled[idx_col]); // on reconvertit le tenseur en mode webgl
			//console.log ("passage en webgl terminé");

		}

		// 3) on dispose les tenseurs originaux
		tf.dispose (tensors);

		// 4) on génère l'array et le tenseur d'étapes
		let tensor_mere=tensors_tiled[idx_col_img_mere];
		let nb_elems=tensor_mere.shape[0];
		for (let idx_etape=0 ; idx_etape<nb_elems ; idx_etape++) {
			etapes[idx_etape]=Math.floor((Math.random() * diffusion_nb_etapes)+1);
		}
		tensors_tiled[idx_col_img_C]=tf.tensor1d(etapes, "int32");

		// 5) on génère le tenseur de bruit et les images bruitées
		const {batchBruite, bruit} = diffusion_genere_bruit(that.diffusion_schedule, tensor_mere, tensors_tiled[idx_col_img_C]);

		tensors_tiled[idx_col_img_A]=batchBruite;
		tensors_tiled[idx_col_img_B]=bruit;

		// 6) on remet les tenseurs dansthat.definition
		for (let idx_col in tensors_tiled) {
			that.definition[idx_col]["tensor"]=tensors_tiled[idx_col];
		}
		that.nb_rows_shuffled=nb_elems;
		that.definition[idx_col_img_C]["type"]="num"; // on remet type numérique sur la colonne des étapes pour affichage

		// 7) action fin
		if (action_fin=="fit") { // on lance un entrainement : si split_data avec auto-reload
			let training = training_organizer;
			training.fit();
		} else { // valeur par défaut : affichage
			that.affiche_x_y();
			that.affiche_fin();
		}

	}

	////////////////////////////////////////////////////////////////////////////
	// régénère le tableau (danfo) en dédoublant une colonne TEXT
	// soit pour générer un embedding (mots autour)
	// soit pour faire deviner le mot suivant
	this.regenere_tableau_text = async function (tableau) {
		let nom_col_text=undefined;
		let text_type_generation;
		let text_tokenizer;
		let text_tokenizer_size;
		let text_limite_size;
		let text_nb_guess;
		let text_nb_generated;
		let text_stride;
		let longueur_tableau1=tableau.shape[0];
		
		let tableau_retour={};
		// 1) premier scan des colonnes pour déterminer la colonne text_mere et les colonnes text_fille (A & B)
		// + préparer les colonnes de tableau_retour
		for (let idx_col in this.definition) {
			let nom_colonne=this.intitules_colonnes[idx_col];
			let param_colonne=this.definition[idx_col];
			if (param_colonne["type"]==="text_mere") {
				nom_col_text=nom_colonne;
				text_type_generation=param_colonne["text_type_generation"];
				text_tokenizer=param_colonne["text_tokenizer"];
				text_tokenizer_size=param_colonne["text_tokenizer_size"];
				text_nb_guess=param_colonne["text_nb_guess"];
				text_nb_generated=param_colonne["text_nb_generated"];
				text_limite_size=param_colonne["text_limite_size"];
				text_stride=param_colonne["text_stride"];
			} else if (param_colonne["type"]!=="void") {
				tableau_retour[nom_colonne]=[];
			}
		}

		// 1bis) si aucune colonne text_mere, on renvoie le tableau d'origine inchangé
		if (nom_col_text === undefined) {
			return (tableau);
		}

		// 2) Pour chaque ligne du tableau, on récupère la valeur de la colonne text_mere
		// on génère les différentes valeurs des colonnes text_fille A & B
		// et on génère autant de lignes que de valeurs en répétant les valeurs des autres colonnes
		for (let idx_row =0 ; idx_row < longueur_tableau1 ; idx_row++) { // pour chaque ligne du tableau d'origine
			let ligne_orig=tableau.iloc({rows:[idx_row]}); // on récupère toute la ligne comme une dataFrame de colonnes avec une seule ligne

			// On récupère toutes les nouvelles lignes de texte comme 2 arrays de lignes
			let chaine=ligne_orig.column(nom_col_text).values[0];
			let col_A_B={}; // contient 2 clefs : [A] et [B] qui chacune contient plusieurs lignes (même nb de lignes pour A et B), chaque ligne pouvant contenir plusieurs mots
			if (text_type_generation === "guess_next") {
				col_A_B=this.text_2_guess_next(chaine, tokenizers[text_tokenizer], text_limite_size, text_tokenizer_size, text_nb_generated);
			} else if (text_type_generation === "guess_around") {
				col_A_B=this.text_2_guess_around(chaine, tokenizers[text_tokenizer], text_limite_size, text_nb_guess);
			} else if (text_type_generation === "guess_next_multi") {
				col_A_B=this.text_2_guess_next_multi(chaine, tokenizers[text_tokenizer], text_limite_size, text_tokenizer_size, text_stride);
			}

			// pour chaque ligne de texte, on regénère une nouvelle ligne de Colonnes
			for (idx_text in col_A_B["A"]) {
				let A=col_A_B["A"][idx_text]; // par exemple [7, 3, 15] = "la solution est"
				let B=col_A_B["B"][idx_text]; // par exemple [21] = "simple"
				tableau_retour[nom_col_text+"_A"].push(A);
				tableau_retour[nom_col_text+"_B"].push(B);
				let idx=0
				// on remet dans la ligne les infos des autres colonnes (sauf la colonne texte d'origine)
				for (let idx_nom_col in ligne_orig.axis["columns"]) {
					let nom_col=ligne_orig.axis["columns"][idx_nom_col];
					if (nom_col !== nom_col_text) {
						let valeur=ligne_orig.column(nom_col).values[0];
						tableau_retour[nom_col].push(valeur)
					}
				}
			} // fin de pour chaque ligne de texte générée
		} // fin du pour chaque ligne du tableau d'origine

		// 3) on convertit en dataframe et on retourne
		let tmp = new dfd.DataFrame(tableau_retour);

		// 4) on shuffle le dataframe
		let retour=await tmp.sample(tmp.shape[0]);
		return (retour);
	};

    
    ////////////////////////////////////////////////////////////////////////////
	// affiche les tenseurs générés
    this.affiche_x_y = async function () {
		let affichage="";
		for (idx_col in this.definition) {
			
			// 1. on récupère les infos du tenseur
			let nom_col=this.intitules_colonnes[idx_col];
			let param_colonne=this.definition[idx_col];
			let tenseur=param_colonne["tensor"];
			if (tenseur == null || tenseur == undefined) {
				continue;
			}
			let shape=tenseur.shape;
			let shape_str=shape.toString();
			let size=tenseur.size;
			let dtype=tenseur.dtype;
			let type=param_colonne["type"];
			let infos_num="";
			if (type =="num") {
				let min=tenseur.min().arraySync();
				let max=tenseur.max().arraySync();
				let mean=tenseur.mean().arraySync();
				infos_num=" [min : "+min+" max : "+max+" mean : "+mean+"] ";
			}

			affichage+=glob_get_intitule("label_tensors_details", {"%name":nom_col, "%shape":shape_str, "%type":type, "%size":size+infos_num, "%dtype":dtype})+" <br>";

		} // fin du pour chaque colonne
		
		// on affiche le détail des tenseurs
		$("#"+this.zone_x_y).html(affichage);
		
		// on affiche les 10 1ers éléments de chaque tenseur
		$("#"+this.zone_x_y_img_form+" input[name='nb']").val("10");
		$("#"+this.zone_x_y_img_form+" input[name='start']").val("0");
		this.affiche_elem_tenseurs (0, 10);
        
    };
	
	////////////////////////////////////////////////////////////////////////////
	// affiche nb éléments des tenseurs depuis start
	this.affiche_elem_tenseurs = async function (start, nb) {
		// Si nb === null on récupère les données du formulaire
		if (nb === null) {
			nb=Number($("#"+this.zone_x_y_img_form+" input[name='nb']").val());
			start=Number($("#"+this.zone_x_y_img_form+" input[name='start']").val());
		}
		let container=$("#"+this.zone_x_y_img_container);
		container.html(""); // on raz l'affichage


		for (idx_col in this.definition) {
			let param_colonne=this.definition[idx_col];
			let name=param_colonne["name"]
			let tenseur=param_colonne["tensor"];
			let type=param_colonne["type"];
			if (tenseur == null || tenseur == undefined) {
				continue;
			}

			let max=tenseur.shape[0];
			if (start+nb > max || start > max) {
				alert (glob_get_intitule("alert_max_affichage", {"%max":max}));
				return
			}

			container.append("<hr><p>"+name+"</p>");
			
			if (type === "num") {
				await this.tv_num (container, param_colonne, start, nb);
			} else if (type === "cat") {
				await this.tv_cat (container, param_colonne, start, nb);
			} else if (type === "img" || type == "img_bytes" || type === "img_fille" || type == "img_bytes_fille") {
				await this.tv_img (container, param_colonne, start, nb);
			} else if (type === "text" || type === "text_fille") {
				await this.tv_text (container, param_colonne, start, nb);
			}
		}
	}
	
	////////////////////////////////////////////////////////////////////////////
	// affiche nb éléments des tenseurs depuis start pour un tenseur numérique
	this.tv_num = async function (container, param_colonne, start, nb) {
		let affichage="<table>";
		let tenseur=param_colonne["tensor"];
		for (idx=start ; idx < start+nb ; idx++) {
			let elem=tf.tidy(() => {
				let retour=tenseur.slice (idx, 1).squeeze([0]);
				return(retour);
			});
			let val=elem.arraySync();
			affichage+="<tr><td>"+idx+"</td><td>"+val+"</td></tr>";
			tf.dispose(elem);
		}
		affichage+="</table>";
		container.append(affichage);
	}
	
	////////////////////////////////////////////////////////////////////////////
	// affiche nb éléments des tenseurs depuis start pour un tenseur texte
	// peut avoir plusieurs formes : 1 seuk mot ou liste de mots. Avec ou sans encodage one hot
	// le tableau peut donc avoir de 1 à 3 dimensions
	// 1 mot sans one hot => 1
	// 1 mot avec one hot => 2
	// liste de mots sans one hot => 2
	// liste de mots avec one hot => 3
	this.tv_text = async function (container, param_colonne, start, nb) {
		let text_tokenizer=param_colonne["text_tokenizer"];
		let text_bool_one_hot=param_colonne["text_bool_one_hot"];
		let tokenizer=tokenizers[text_tokenizer];
		let affichage="<table>";
		let tenseur=param_colonne["tensor"];
		let tranche=tenseur.slice (start, nb).cast("int32"); // il faut caster en int32 car sur certains ordis (?) il rajoute des decimales :/
		let tableau=decode_tensor_text(tranche, tokenizer, {text_bool_one_hot:text_bool_one_hot, bool_phrases:true});

		for (idx_phrase in tableau) { // pour chaque phrase
			affichage+="<tr>";
			let phrase=tableau[idx_phrase];
			for (idx_mot in phrase) {
				let elem=phrase[idx_mot];
				let token=elem["token"];
				let mot=elem["mot"];
				let one_hot_text=elem["one_hot_text"];
				let html_one_hot="";
				if (one_hot_text !== "") {
					html_one_hot=" onclick=\"alert('"+one_hot_text+"');\"";
				} else {
					html_one_hot=" onclick=\"alert('"+token+"');\"";
				}
				affichage+="<td><p class='text_token' title='"+token+"' "+html_one_hot+" >"+mot+"</p></td>";
			}
			affichage+="</tr>";
		}
		affichage+="</table>";
		container.append(affichage);
		tf.dispose(tranche);
	}
	
	////////////////////////////////////////////////////////////////////////////
	// affiche nb éléments des tenseurs depuis start pour un tenseur catégorie (one hot)
	this.tv_cat = async function (container, param_colonne, start, nb) {
		let affichage="<table>";
		
		let tenseur=param_colonne["tensor"];
		let one_hot=param_colonne["one_hot"];
		let labels=param_colonne.encoder["$labels"]; // à utiliser si pas one hot
		let labels2=param_colonne["labels"]; // à utiliser si pas one-hot
		// head
		affichage+="<tr><td>idx</td>";
		for (idx=0 ; idx < one_hot.length ; idx++) {
			let intitule=one_hot[idx];
			affichage+="<td>"+idx+" - "+intitule+"</td>";
		}
		affichage+="</tr>";
		
		// body
		for (idx=start ; idx < start+nb ; idx++) {
			affichage+="<tr>";
			let elem=tf.tidy(() => {
				let retour=tenseur.slice (idx, 1).squeeze([0]);
				return(retour);
			});
			let val=elem.arraySync();
			let label=""; // utilisé si pas one hot
			if (Number(elem.rankType)===0) { // si une seule valeur (pas one hot)
				val=[val];
				label=labels[val[0]];
			}
			affichage+="<td>"+idx+"</td>";
			for (idx_elem=0 ; idx_elem < val.length ; idx_elem++) {
				let elem2=val[idx_elem];
				if (Number(elem.rankType)===0) { // si une seule valeur (pas one hot)
					if (labels2[Number(elem2)] !== undefined) {
						elem2=elem2+" - "+labels2[Number(elem2)];
					}
					affichage+="<td><p title='"+label+"' onclick=\"alert('"+label+"')\" class='text_token'>"+elem2+"</p></td>";
				} else {
					affichage+="<td><p>"+elem2+"</p></td>";
				}
			}
			
			affichage+="</tr>";
			tf.dispose(elem);
		}
				
		affichage+="</table>";
		container.append(affichage);
	}
	
	////////////////////////////////////////////////////////////////////////////
	// affiche nb éléments des tenseurs depuis start pour un tenseur image (img ou img_bytes
	this.tv_img = async function (container, param_colonne, start, nb) {
		let tenseur=param_colonne["tensor"];
		let name=param_colonne["name"];
		let normalize=param_colonne["normalize"];
		let bool_regenere_min_max=param_colonne["bool_regenere_min_max"]; // si vaut "true" on ne se base pas sur min et max pour la dénormaisation mais sur les valeurs réelles min et max
		let normalization_range=param_colonne["normalization_range"].split(":");
		let min_range=Number(normalization_range[0]);
		let max_range=Number(normalization_range[1]);
		if (bool_regenere_min_max === "true") {
			min_range=tenseur.min().dataSync()[0];
			max_range=tenseur.max().dataSync()[0];
		}
		let delta_range=Number(max_range - min_range);

		name="tv_"+name+"_";
		
		let affichage="<table>";
		// 1. On génère le tableau avec des images vides
		for (idx=start ; idx < start+nb ; idx++) { // pour chaque image
			affichage+="<tr><td>"+idx+"</td>";
			affichage+="<td><canvas id='"+name+idx+"'> </canvas></td></tr>";
		} 
		affichage+="</table>";
		container.append(affichage);
		
		// 2. on maj les images
		for (idx=start ; idx < start+nb ; idx++) { // pour chaque image
			let array_img=tf.tidy(() => {
				if (normalize == "true") {
					return(tenseur.slice (idx, 1).squeeze([0]).sub(min_range).mul(255 / delta_range).round().arraySync());
				} else {
					return(tenseur.slice (idx, 1).squeeze([0]).round().arraySync());
				}
			}); // fin du tidy()
			let canvas=$("#"+name+idx).get(0);
			await tf.browser.toPixels(array_img, canvas);
			tf.dispose(array_img);
		}
	}
	
    
    ////////////////////////////////////////////////////////////////////////////
    // log les infos
    this.log=function(texte) {
		let div="log_charge_x";
		let html=$("#"+div).html();
		html+="<br>"+texte;
		$("#"+div).html(html);
        
    }
	
	////////////////////////////////////////////////////////////////////////////
    // affiche message de validation à la fin du chargement
	this.affiche_fin_chargement = function () {
		$("#zone_load_data").dialog("close");

	}
	
	////////////////////////////////////////////////////////////////////////////
    // affiche message de validation à la fin de la génération des tenseurs
	this.affiche_fin = function (type) {
		let html="";
		html+=glob_get_intitule("label_end_data_processing")+".<br><br>";
		html+="<button onclick=\"wb_menu_main.clique('wb_tenseurs');table_organizer.formulaire.dialog('close');\">"+glob_get_intitule("button_show_result")+"</a>";
		$("#"+this.formulaire_tableau).html(html);
        this.formulaire = $("#"+this.formulaire_tableau).dialog({autoOpen: false, height: 400, width: 350, modal: true , position: { my: "center top", at: "top+100", of: window, collision: "none" }});
        this.formulaire.dialog("open");
	};
	
	////////////////////////////////////////////////////////////////////////////
    // retourne la liste des tenseurs (utilisé par lnk_data_model.js
	this.get_liste_tensors = function () {
		let retour={};
		for (idx_col in this.definition) {
			let param_colonne=this.definition[idx_col];
			let name=param_colonne["name"]
			let tenseur=param_colonne["tensor"];
			let type=param_colonne["type"];
			if (tenseur == null || tenseur == undefined) {
				continue;
			}
			retour[idx_col]={idx_col:idx_col, name:name, type:type};
		}
		return(retour);

	}
	
	////////////////////////////////////////////////////////////////////////////
    // Retourne un batch de batch_size enregistrements à partir de last 
	// asynchrone : appelle genere_data() qui lui-même appellera on_batch_ready() quand tout aura été récupéré si this.on_genere_data=="get_batch"
	this.get_batch = async function (params) {
		let last=this.ds["idx"];
		let batch_size=this.ds["batch_size"]; 
		let bool_in_out=this.ds["bool_in_out"]; // si true le retour se fait sous forme d'un tableau [inputs], [outputs] sinon un simple tableau de tenseurs
		if (params["start"] != undefined) {
				last=params["start"];
		}
		if (params["batch_size"] != undefined) {
				batch_size=params["batch_size"];
		}
		if (params["bool_in_out"] != undefined) {
				bool_in_out=params["bool_in_out"];
		}

		let size=this.nb_rows_shuffled; // on récupère le nb d'éléments
		
		// on regarde si on a fini de parcourir tous les enregistrements
		let done=false
		if (last+batch_size >= size) {
			done=true;
			batch_size=size-last;
		}

		this.set_dataset({start:last, batch_size:batch_size, bool_in_out:bool_in_out, done:done});
		this.genere_data(0); // asynchrone
	}
	
	////////////////////////////////////////////////////////////////////////////
    // appelé par genere_data() quand tous les tenseurs du batch ont été générés si this.on_genere_data=="get_batch"
	this.on_batch_ready = function () {
		let bool_in_out=this.ds["bool_in_out"];
		let batch_size=this.ds["batch_size"];
		let last=this.ds["idx"];
		let done=this.ds["done"];
		let retour;
		let ol=lnk_data_model; // hardcodé mais pourrait être fourni en paramètre si nécessaire

		if (bool_in_out === true) {
			let infos_in_out=ol.get_in_out(); // obj avec [inputs] et [outputs]
			last+=batch_size;
			retour={value: infos_in_out, done: done};
		} else {
			let liste_tensors=this.get_liste_tensors();
			for (idx_col in liste_tensors) {
				liste_tensors[idx_col]["tensor"]=this.definition[idx_col]["tensor"];
			}
			last+=batch_size;
			retour={value: liste_tensors, done: done};
		}
		this.set_dataset({start:last});
		
		// pour l'instant une seule action possible à la fin de la fonction, mais pourrait être rendu paramétrable par un paramètre supplémentaire this.ds["action"]
		let training=training_organizer;
		training.train_on_batch(retour);
	}
	
	////////////////////////////////////////////////////////////////////////////
	this.affiche_note_tenseurs = function() {
		let html=glob_get_intitule("text_note_tensors");
		html+="<button onclick=\"table_organizer.formulaire.dialog('close');\">OK</a>";
		
		$("#"+this.formulaire_tableau).html(html);
        this.formulaire = $("#"+this.formulaire_tableau).dialog({autoOpen: false, height: 600, width: 450, modal: true, position: { my: "center top", at: "top+100", of: window, collision: "none" } });
        this.formulaire.dialog("open");
	}

	////////////////////////////////////////////////////////////////////////////
	this.toogle_log = function() {
		let div_log=$("#"+this.zone_log);
		let img_log=$("#affiche_log img");

		let bool_display=div_log.css("display");
		if (bool_display == "none") {
			div_log.css("display", "block");
			img_log.attr("src", "IMG/icones_grandes/arrow_up.png");
			img_log.attr("title", glob_get_intitule("label_show_less_details"));
		} else {
			div_log.css("display", "none");
			img_log.attr("src", "IMG/icones_grandes/arrow_down.png");
			img_log.attr("title", glob_get_intitule("label_show_more_details"));
		}

	}

	////////////////////////////////////////////////////////////////////////////
	this.ouvre_popup_load = function() {
		let popup=$("#zone_load_data");
		popup.dialog({modal:true, height:700, width:1100, position: { my: "center top", at: "top+100", of: window }});

	}

	////////////////////////////////////////////////////////////////////////////
	this.ouvre_popup_split_tableau = function() {
		this.popup_split_tableau=$("#zone_split_tableau");
		this.popup_split_tableau.dialog({modal:true, height:700, width:1100, position: { my: "center top", at: "top+100", of: window }});

	}

	////////////////////////////////////////////////////////////////////////////
	this.affiche_data_perso = async function () {
		let dir=user_organizer.user["dir"];
		if (dir === undefined || dir === "") {
			return;
		}
		let url=glob_url_manage_files+"?action=list_data";
		const response = await fetch(url);
		if (!response.ok) {
			alert(glob_get_intitule("alert_impossible_load_datalist"));
		}
		let json = await response.json();
		let a_afficher="";
		for (let id in json) {
			let elem=json[id]["url"];
			let name=json[id]["name"];
			a_afficher+="<p class='pointer' onclick=\"table_organizer.select_url('saved_data/"+dir+"/"+elem+"')\">"+name+"</p>"; // TODO : modifier l'url en fonction du user
		}
		$("#"+this.zone_load_data_perso).html(a_afficher);
	}

	////////////////////////////////////////////////////////////////////////////
	this.ouvre_popup_table_design=function() {
		let popup=$("#zone_load_array");
		popup.dialog({modal:true, height:700, width:1100, position: { my: "center top", at: "top+100", of: window }});

	}

    
} // fin de la classe table_organizer






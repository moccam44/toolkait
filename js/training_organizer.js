function training_organizer (params) {
	this.zone_training=params["zone_training"];
	this.nom_training_organizer="training_organizer";
	this.obj_lnk=params["obj_lnk"];
	this.epochs;
	this.batch_size;
	this.validation_split;
	this.model;
	this.table_organizer=table_organizer; // peut être rendu paramétrable
    this.history=[];
	this.nb_items;
	this.nb_batch;

	this.src_pause="IMG/icones_grandes/control_play_blue.png";
	this.src_run="IMG/icones_grandes/control_pause_blue.png";

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.init_form = function () {
		let html="";
		html+="<div name='wbtr_form'><table>";
		html+="<tr><td><label for='wbtr_form_epochs'>"+glob_get_intitule("label_nb_epochs")+" : </label> </td><td> <input name='wbtr_form_epochs' value='20'></td></tr>";
		html+="<tr><td><label for='wbtr_form_batch_size'>"+glob_get_intitule("label_batch_size")+" : </label> </td><td> <input name='wbtr_form_batch_size' value='50'></td></tr>";
		html+="<tr><td><label for='wbtr_form_validation_split'>"+glob_get_intitule("label_validation_split")+" : </label> </td><td> <input name='wbtr_form_validation_split' value='0.15'></td></tr>";

		html+="<tr><td colspan='2'><img src='IMG/icones_grandes/control_play_blue.png' name ='wbtr_control_play' class='wbtr_control pointer icone' title=\""+glob_get_intitule("button_start_training")+"\" onclick='"+this.nom_training_organizer+".clique_bouton()'>";
		html+="<img src='IMG/icones_grandes/arrow_refresh.png' name ='wbtr_control_repeat' class='wbtr_control pointer icone'  title=\""+glob_get_intitule("button_raz_training")+"\" onclick='"+this.nom_training_organizer+".raz_form()'></td></tr>";
		html+="</table></div>";
		$("#"+this.zone_training).html(html);
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.raz_form = function () {

		this.init_form();
		$( "#training_progressbar").progressbar({value: 0});
		$( "#training_progressbar .progress-label").text("");
		$( "#training_progressbar_batch").progressbar({value: 0});
		$( "#training_progressbar_batch .progress-label").text("");
		chef_orchestre.history=[];
		this.history=[]; // utile ?
		this.to_log=[]; // les différentes catégories à afficher pour la progression (acc_ val_acc, loss, val_loss...)

		tfvis.show.history(document.getElementById("zone_training_monitoring"), [], this.to_log, {zoomToFit:true, width:500, height:400});
		// gestion par batch
		this.idx_batch=0;
		this.idx_epoch=0;

		this.total_loss=0;
		this.total_acc=0;
		this.total_loss_val=0;
		this.total_acc_val=0;
		this.compteur_batch=0;
		this.compteur_batch_val=0;
		this.first_batch_val=0; // idx du 1er batch de validation

		this.pause="init"; // init | paused | pause | run
		$("#"+this.zone_training+" img[name='wbtr_control_play']").attr("src", this.src_pause);

	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.clique_bouton = function () {
		// si entrainement standard, pas de possibilité de faire pause (pour l'instant)
		if (this.table_organizer.ds["batch_size"] == 0) {
			if (this.pause == "run") {
				alert(glob_get_intitule("alert_training_already_running"));
				return;
			}
			this.pause="run";
			this.fit();
			return (true);
		}
		
		let src_pause=this.src_pause;
		let src_run=this.src_run;
		
		if (this.pause == "pause") {
			return (true); // on ne fait rien : le bouton a déjà été cliqué, en attente d'état paused
		} else if (this.pause == "init") {
			$("#"+this.zone_training+" img[name='wbtr_control_play']").attr("src", src_run);
			this.pause="run";
			this.fit();
		} else if (this.pause == "paused") {
			$("#"+this.zone_training+" img[name='wbtr_control_play']").attr("src", src_run);
			this.pause="run";
			this.table_organizer.get_batch({});
		} else if (this.pause == "run") {
			$("#"+this.zone_training+" img[name='wbtr_control_play']").attr("src", src_pause);
			this.pause="pause";
		}
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	this.fit = async function () {
		this.epochs=Number($("#"+this.zone_training+" input[name='wbtr_form_epochs']").val());
		this.batch_size=Number($("#"+this.zone_training+" input[name='wbtr_form_batch_size']").val());
		this.validation_split=Number($("#"+this.zone_training+" input[name='wbtr_form_validation_split']").val());
		
		this.model=chef_orchestre.model;
		let infos_in_out=this.obj_lnk.get_in_out(); // obj avec [inputs] et [outputs]
		if (this.table_organizer.ds["batch_size"] != 0) { // si entrainement par batch
			this.nb_items=this.table_organizer.nb_rows_shuffled; // on récupère le nb d'éléments du départ (avant text_2_guess_next...)
		} else { // si entrainement classique
			this.nb_items = Object.entries(this.obj_lnk.get_in_out().inputs)[0][1].shape[0]; // on récupère la 1éré dimension du shape du tenseur du 1er input
		}

		this.first_batch_val=Math.round((this.nb_items*(1-this.validation_split))/this.batch_size);

		let txt_split_tableau="";
		if (table_organizer.split_tableau["bool"] === true && table_organizer.split_tableau["auto_reload"] === true) {
			let idx_split_tableau=table_organizer.split_tableau["idx"]+1;
			txt_split_tableau="split "+String(idx_split_tableau)+" / "+table_organizer.split_tableau["nb"]+" ";
		}

        chef_orchestre.epochs=this.epochs;
		chef_orchestre.nb_batch=this.nb_batch;
        $( "#training_progressbar" ).progressbar({value: 0});
        $( "#training_progressbar .progress-label").text(txt_split_tableau+"epoch 1 / "+this.epochs);
		$( "#training_progressbar_batch" ).progressbar({value: 0});
        $( "#training_progressbar_batch .progress-label").text("batch 1 / ");
		
		// weights history
		chef_orchestre.weights_log="never";
		chef_orchestre.weights_history_raz(); // on réinitialise l'historique en début d'entrainement
		if (chef_orchestre.weights_log !== "never") {
			chef_orchestre.weights_history_add(layers_organizer.get_weights()); // on ajoute le poids initial
		}
		
		// on fait un entrainement classique ou en Batch
		if (this.table_organizer.ds["batch_size"] != 0) { // Si entrainement par batch
			this.nb_batch=Math.round(this.nb_items/this.batch_size); // si entrainement par batch on se base sur la totalité des données
			this.table_organizer.on_genere_data="get_batch"; // indique que la fonction table_organizer.genere_data() devra appeler train_on_batch() quand elle aura récupéré un batch
			this.table_organizer.get_batch({start:0, batch_size:this.batch_size, bool_in_out:true, done:false});
		} else { // si entrainement classique
			this.nb_batch=this.first_batch_val; // si entrainement classique on se base uniquement sur les données d'entrainement
			try {
				await this.model.fit(infos_in_out["inputs"], infos_in_out["outputs"], {batchSize: this.batch_size, epochs: this.epochs, validationSplit: this.validation_split, callbacks:{onEpochEnd:this.end_epoch, onBatchEnd:this.end_batch}});
			} catch (e) {
				console.log(e);
				alert ("training_organizer.fit() : "+e.message);
			}
			// si split_tableau et auto_reload
			if (this.table_organizer.split_tableau["bool"] === true && this.table_organizer.split_tableau["auto_reload"] === true) {
				if (this.table_organizer.split_tableau["idx"] < this.table_organizer.split_tableau["nb"]-1) {
					this.table_organizer.split_tableau["idx"]++;
					$( "#training_progressbar_batch .progress-label").text("preparing tensors... ");
					this.table_organizer.genere_data(0);
					return (true);
				} else {
					this.table_organizer.split_tableau["idx"]=0;
				}
			}
			alert (glob_get_intitule("label_training_done"));
			$("#"+this.zone_training+" img[name='wbtr_control_play']").attr("src", this.src_pause);
			this.pause="init";
		}
	};

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// est appelé par table_organizer::on_batch_ready à chaque fois qu'un batch est généré 
	// 
	this.train_on_batch = async function (params) {
		let infos_in_out=params["value"];
		let done=params["done"];
		let compteur_ss_batch=0;
		let loss_ss_batch=0;
		let acc_ss_batch=0;
		
		// entrainement ou validation ?
		if (this.idx_batch <= this.first_batch_val) { // entrainement
			this.compteur_batch++;
		} else { // validation
			this.compteur_batch_val++;
		}

		let retour;
		let idx_sous_batch=0;

		while (idx_sous_batch!==false) { // les sous-batchs correspondent au cas où le batch réel a plus de lignes que batch_size (text_guess_next...).
			let tmp=this.get_sous_batch({infos_in_out:infos_in_out, idx:idx_sous_batch}); // Si pas de ss-batch ou arrivé à la fin des ss-batch, renvoie false
			let infos_in_out2=tmp["infos_in_out"];
			idx_sous_batch=tmp["idx"]; // idx du prochain élément à récupérer ou false si on a terminé


			try {

				if (this.idx_batch <= this.first_batch_val) { // entrainement
					retour = await this.model.trainOnBatch(infos_in_out2["inputs"], infos_in_out2["outputs"]);
					loss_ss_batch += retour[0];
					acc_ss_batch += retour[1];

				} else { // validation

					retour = this.model.evaluate(infos_in_out2["inputs"], infos_in_out2["outputs"], {});
					loss_ss_batch += retour[0].dataSync()[0];
					acc_ss_batch += retour[1].dataSync()[0];
					tf.dispose(retour); // /!\ avec tf.evaluate(), retour est un tf.scalar[]
				}

				tf.dispose(infos_in_out2);
			} catch (e) {
				alert("training_organizer.train_on_batch() : " + e.message);
				console.log(e);
				return (false);
			}

			this.end_batch(this.idx_batch, {loss:0, acc:0}, idx_sous_batch); // uniquement pour l'affichage de la progression
			compteur_ss_batch++;


		} // fin du pour chaque ss-batch

		// calcul de la moyenne loss et acc sur l'ensemble des ss-batchs pour ce batch
		if (this.idx_batch <= this.first_batch_val) { // entrainement
			this.total_loss+=loss_ss_batch / compteur_ss_batch;
			this.total_acc+=acc_ss_batch / compteur_ss_batch;
		} else { // validation
			this.total_loss_val+=loss_ss_batch / compteur_ss_batch;
			this.total_acc_val+=acc_ss_batch / compteur_ss_batch;
		}


		// si fin d'epoch
		if (done===true) {
			let h={val_loss:this.total_loss_val/this.compteur_batch_val, val_acc:this.total_acc_val/this.compteur_batch_val, loss:this.total_loss/this.compteur_batch, acc:this.total_acc/this.compteur_batch};
			this.end_epoch(this.idx_epoch, h);
			
			// raz les compteurs
			this.total_loss=0;
			this.total_acc=0;
			this.total_loss_val=0;
			this.total_acc_val=0;
			this.compteur_batch=0;
			this.compteur_batch_val=0;
			if (this.idx_epoch+1 >= this.epochs) {
				alert (glob_get_intitule("label_training_done"));
				$("#"+this.zone_training+" img[name='wbtr_control_play']").attr("src", this.src_pause);
				this.pause="init";
				return (true);
			}
			
			this.idx_epoch++;
			this.idx_batch=0;
			this.table_organizer.set_dataset({start:0, batch_size:this.batch_size, bool_in_out:true, done:false});
		}
		try {
			tf.dispose(infos_in_out);
		} catch (e) {
			// on ne fait rien
		}

		// gestion de la pause
		if (this.pause == "pause") {
			this.pause = "paused";
			return (true);
		}
		
		// on relance le batch suivant
		this.idx_batch++;
		this.table_organizer.get_batch({}); // ==> désactiver pour debuggage

	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// attention : appelé de manière asynchrone : n'a pas accès aux variables de this
	this.end_epoch=function(idx_epoch, h) {
        chef_orchestre.history.push(h);

		for (let elem in h) {
			training_organizer.to_log.push(elem);
		}
		let txt_split_tableau="";
		if (table_organizer.split_tableau["bool"] === true && table_organizer.split_tableau["auto_reload"] === true) {
			let idx_split_tableau=table_organizer.split_tableau["idx"]+1;
			txt_split_tableau="split "+String(idx_split_tableau)+" / "+table_organizer.split_tableau["nb"]+" ";
		}
        idx_epoch++; // pour affichage on part de 1 au lieu de 0
        let progress=idx_epoch*100/chef_orchestre.epochs;
        $( "#training_progressbar").progressbar({value: progress});
        $( "#training_progressbar .progress-label").text(txt_split_tableau+"epoch "+idx_epoch+" / "+chef_orchestre.epochs);
        tfvis.show.history(document.getElementById("zone_training_monitoring"), chef_orchestre.history, training_organizer.to_log, {zoomToFit:true, width:500, height:400});
		
		// log des poids
		if (chef_orchestre.weights_log == "epoch") {
			chef_orchestre.weights_history_add(model_organizer.get_weights()); 
		}
		
	};
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// attention : appelé de manière asynchrone : n'a pas accès aux variables de this
	this.end_batch=function(idx_batch,h, idx_ss_batch=0) {
		let txt_batch=""+idx_batch;
		if (idx_ss_batch !== 0 && idx_ss_batch !== false) {
			txt_batch+=" ("+idx_ss_batch+")";
		}
		let progress=Math.round(idx_batch*100/training_organizer.nb_batch);
		$( "#training_progressbar_batch").progressbar({value: progress});
        $( "#training_progressbar_batch .progress-label").text("batch "+txt_batch+" / "+training_organizer.nb_batch);
		
		// log des poids
		if (chef_orchestre.weights_log === "batch" && idx_ss_batch === 0) {
			chef_orchestre.weights_history_add(model_organizer.get_weights()); 
		}

		// ema
		if (glob_diffusion_ema_bool_active === true) {
			if (idx_batch % glob_diffusion_ema_n_batch === 0) {
				model_organizer.maj_weights_ema();
			}
		}
	}

	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// retourne une tranche des tenseurs fournis pour un batch
	// sous-batch utilisé lorsque les données sont transformées lors de chaque batch (utilisation de dataset + text_guess_next ou text_guess_around
	// retourne ["infos_in_out"] => tranche des tenseurs passés en paramètre
	//          ["idx"] => idx du prochain élément à récupérer ou false si on a fini

	this.get_sous_batch = function (params) {
		let infos_in_out=params["infos_in_out"];
		let idx=params["idx"];
		if (idx===undefined) {
			idx=0;
		}
		let nb_elems;
		let retour={};
		retour["idx"]=false;
		retour["infos_in_out"]={inputs:{}, outputs:{}};

		// on calcule le nb d'éléments du premier tenseur fourni
		for (let idx_input in infos_in_out["inputs"]) {
			let input=infos_in_out["inputs"][idx_input];
			nb_elems=input.shape[0];
			break;
		}

		// si nb_elems <= batch_size on retourne tel quel
		if (nb_elems <= this.batch_size) {
			retour["infos_in_out"]=infos_in_out;
			return (retour);
		}

		// sinon, on retourne une tranche de taille batch_size de chaque tenseur fourni en partant de idx
		let size;
		if (idx+this.batch_size < nb_elems) { // il restera au moins un élément
			size=this.batch_size;
			retour["idx"]=idx+this.batch_size;
		} else {
			size=-1;
		}

		// on slice les tenseurs
		for (let idx_io in infos_in_out) { // inputs ou outputs
			for (let idx_tensor in infos_in_out[idx_io]) {
				retour["infos_in_out"][idx_io][idx_tensor]=infos_in_out[idx_io][idx_tensor].slice(idx, size);
			}
		}
		return (retour);

	}

} // fin de la classe
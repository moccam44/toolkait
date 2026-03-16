function chef_orchestre () {
	// les tenseurs
	this.X_tensor;
	this.Y_tensor;
	this.bool_X_tensor=false;
	this.bool_Y_tensor=false;
	
	// nb dimensions (y compris batch)
	this.X_rank;
	this.Y_rank;
	
	// taille de chaque dimension (y compris batch). Par ex [3002, 35, 35, 3] pour 3002 images de 35x35 en RGB
	this.X_shape;
	this.Y_shape;
	
	// taille de chaque dimension (sans le batch). Par ex [35, 35, 3] pour des images de 35x35 en RGB
	this.X_shape_item;
	this.Y_shape_item;
	
	// format sans le batch séparé par des "/" : "35/35/3"
	this.X_shape_item_str=10;
	this.Y_shape_item_str=10;
	
	this.nb_items;
	
	// modèle
	this.model;
        
    // history : historique des entrainements
    this.history=[];
    this.epochs=1;
	this.nb_batch=1;
	
	// weights_history : historique de l'évolution des poids
	this.weights_history=[];
	this.weights_history_idx=0;
	this.weights_log="never"; // par défaut : modifié par le formulaire de training_organizer never|epoch|batch
	this.weights_pause=false;
	
	
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// stocke les tenseurs X & Y + fait qq stats
	this.set_x_ou_y = function (tenseur, axe) {
		if (axe==="X") {
			try {
				this.X_tensor.dispose();
				this.bool_X_tensor=false;
			} catch (e) {
				// on ne fait rien
			}
			this.X_tensor=tenseur;
			this.X_rank=this.X_tensor.rank;
			this.X_shape=this.X_tensor.shape;
			this.nb_items=this.X_shape[0].length;
			this.X_shape_item=this.X_shape.slice(); // expédient pour dupliquer une array
			this.X_shape_item.shift();
			this.X_shape_item_str=this.X_shape_item.join("/");
			this.bool_X_tensor=true;
		} else if (axe==="Y") {
			try {
				this.Y_tensor.dispose();
				this.bool_Y_tensor=false;
			} catch (e) {
				// on ne fait rien
			}
			this.Y_tensor=tenseur;
			this.Y_rank=this.Y_tensor.rank;
			this.Y_shape=this.Y_tensor.shape;
			this.Y_shape_item=this.Y_shape.slice(); // expédient pour dupliquer une array
			this.Y_shape_item.shift();
			this.Y_shape_item_str=this.Y_shape_item.join("/");
			this.bool_Y_tensor=true;
		}

		
	}
	

	
	this.set_model = function (model) {
		try {
			this.model.dispose();
		} catch (e) {
			console.log ("impossible de dispose() le modèle. peut-être pas encore créés ?");
		}
		this.model=model;
                this.history=[]; // RAZ historique
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// ajoute des poids à l'historique
	this.weights_history_add = function (weights) {
		if (weights.length === 0) {
			return(true);
		}
		this.weights_history.push(weights);
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// raz l'historique des poids
	this.weights_history_raz = function () {
		this.weights_history=[];
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// renvoie le poids suivant de l'historique
	this.weights_history_get = function (idx) {
		if (this.weights_pause == true) {
			this.weights_pause=false;
			return([]);
		}
		if (idx !== null) {
			this.weights_history_idx=idx;
		}
		if (this.weights_history[this.weights_history_idx] == undefined) {
			return ([]);
		} else {
			return (this.weights_history[this.weights_history_idx]);
		}
	}
	
	/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	// met l'affichage des poids sur pause
	this.weights_history_pause = function () {
		this.weights_pause=true;
		
	}
	



} // fin de la classe

// DEPRECATED ? ///////////////////////////////////////


function dataset_organizer(params) {
	let last=0;
	let batch_size=1; // par défaut renvoie un enregistrement
	let bool_in_out=true; // si true le retour se fait sous forme d'un tableau [inputs], [outputs] sinon un simple tableau de tenseurs
	if (params["last"] != undefined) {
			last=params["last"];
	}
	if (params["batch_size"] != undefined) {
			batch_size=params["batch_size"];
	}
	if (params["bool_in_out"] != undefined) {
			bool_in_out=params["bool_in_out"];
	}
	
	// hardcodé mais pourrait être fourni en paramètre si nécessaire
	let to=table_organizer;
	let ol=lnk_data_model;
	
	let size=to.nb_rows_shuffled; // on récupère le nb d'éléments
	console.log ("dataset_organizer::size "+size);
	
	to.on_genere_data=""; // on indique qu'on ne veut pas d'affichage des tenseurs et de message à chaque fois que genere_data() sera terminé
	
	/////////////////////////////////////////////////////////////
	// iterator
	const iterator = {
		
		/////////////////////////////////////////////////////////////
		// next ()
		next: async function () {
			let done=false
			if (last+batch_size >= size) {
				done=true;
				batch_size=size-last;
			}
			
			console.log ("next() last="+last+" - batch_size="+batch_size+" - done = "+done);
			
			to.set_dataset({start:last, batch_size:batch_size});
			await to.genere_data(0);
			console.log ("fin de genere_data() dans next()");
			
			if (bool_in_out === true) {
				let infos_in_out=ol.get_in_out(); // obj avec [inputs] et [outputs]
				last+=batch_size;
				return {value: infos_in_out, done: done};
			} else {
				let liste_tensors=to.get_liste_tensors();
				for (idx_col in liste_tensors) {
					liste_tensors[idx_col]["tensor"]=to.definition[idx_col]["tensor"];
					last+=batch_size;
					return {value: liste_tensors, done: done};
				}
			}
	
		} // Fin de next ()
		/////////////////////////////////////////////////////////////
	
	
	};// Fin de iterator
	/////////////////////////////////////////////////////////////

	
	return iterator;
}

function tf_organizer (params) {
    this.ID_div_affichage="zone_tf"; // attribut "ID" du div qui contiendra le tout
    this.ID_div_memory="zone_tf_memory"; // attribut "ID" du div qui contiendra l'affichage de tf.memory()
    this.ID_div_memory_result="zone_tf_memory_result"; // attribut "ID" du div qui contiendra le résultat l'affichage de tf.memory()
    this.ID_div_env="zone_tf_env"; // attribut "ID" du div qui contiendra la gestion des variables
    this.ID_div_env_result="zone_tf_env_result"; // attribut "ID" du div qui contiendra la liste des flags
    this.ID_div_var_result="zone_tf_var_result"; // attribut "ID" du div qui contiendra la liste des variables globales


    /////////////////////////////////////////////////////////////////////////////////////////
    this.init = function () {


    }

    /////////////////////////////////////////////////////////////////////////////////////////
    this.memory = function(params) {
        let infos=tf.memory();
        let html="<table>";
        for (let idx in infos) {
            let info = infos[idx];
            let info2=this.readable(info);
            html+="<tr><td>"+idx+"</td>";
            if (info2 === "") {
                info2=info;
            }
            html+="<td><span title=\""+info+"\">"+info2+"</span></td>";
            html+="</tr>";
        }
        html+="</table>";
        $("#"+this.ID_div_memory_result).html(html);

    }

    /////////////////////////////////////////////////////////////////////////////////////////
    this.readable = function(info) {
        let div=0.1;
        let around=0.1;
        if (typeof info !== "number") {
            return ("");
        }

        if (info < 1000) {
            return("");
        }

        if (info < 1000000) {
            div=info/1000;
            around=Number.parseFloat(div).toFixed(2);
            return (around+" K");
        }

        if (info < 1000000000) {
            div=info/1000000;
            around=Number.parseFloat(div).toFixed(2);
            return (around+" M");
        }

        if (info < 1000000000000) {
            div=info/1000000000;
            around=Number.parseFloat(div).toFixed(2);
            return (around+" G");
        }

        return ("");
    }

    /////////////////////////////////////////////////////////////////////////////////////////
    this.set_env=function (clef, valeur) {
        if (valeur === "false" || valeur === false) {
            valeur=false;
        } else if (valeur === "true" || valeur === true) {
            valeur=true;
        } else if (valeur === "undefined" || valeur === undefined) {
            valeur=undefined;
        } else if (valeur === "null" || valeur === null) {
            valeur=null;
        } else if (!isNaN(Number(valeur))) { // si format numérique
            valeur=Number(valeur);
        } else {
            // sinon, on ne fait rien
        }
        tf.env().set(clef, valeur);
    }

    /////////////////////////////////////////////////////////////////////////////////////////
    this.affiche_env = function(){
        let env=tf.env();
        let flags=env["flags"];
        let html="<table><tr><td>flag</td><td>valeur</td></tr>";
        for (let idx in flags) {
            let valeur=flags[idx];
            html+="<tr><td>"+idx+"</td>"+"<td><input class='tf_env_flag' name='"+idx+"' onchange='tf_organizer.update_env(\""+idx+"\")' value='"+valeur+"'></td>"
        }
        html+="</table>";
        $("#"+this.ID_div_env_result).html(html);
    }

    /////////////////////////////////////////////////////////////////////////////////////////
    this.update_env = function(flag){
        let valeur=$("input.tf_env_flag[name='"+flag+"']").val();
        try {
            this.set_env(flag, valeur);
        } catch(e) {
            console.log("erreur : "+e.message);
            this.affiche_env();
            return("");
        }
        alert ("OK");
        this.affiche_env();

    }

    /////////////////////////////////////////////////////////////////////////////////////////
    this.affiche_var = function(){
        let vars={glob_diffusion_nb_steps:glob_diffusion_nb_steps, glob_diffusion_ema_decay:glob_diffusion_ema_decay, glob_diffusion_ema_n_batch:glob_diffusion_ema_n_batch, glob_diffusion_ema_bool_active:glob_diffusion_ema_bool_active, glob_number_field_min:glob_number_field_min, glob_number_field_max:glob_number_field_max, glob_word_tokenizer_shuffle:glob_word_tokenizer_shuffle, glob_text_prediction_nb_words:glob_text_prediction_nb_words, glob_nb_embeddings_compare:glob_nb_embeddings_compare};
        let html="<table><tr><td>var</td><td>val</td></tr>";
        for (let idx in vars) {
            let valeur=vars[idx];
            html+="<tr><td>"+idx+"</td>"+"<td><input class='tf_var_flag' name='"+idx+"' onchange='tf_organizer.update_var(\""+idx+"\")' value='"+valeur+"'></td>"
        }
        html+="</table>";
        $("#"+this.ID_div_var_result).html(html);

    }

    /////////////////////////////////////////////////////////////////////////////////////////
    this.update_var = function(flag){
        let valeur=$("input.tf_var_flag[name='"+flag+"']").val();
        if (valeur === true || valeur === "true") {
            valeur=true;
        } else if (valeur === false || valeur === "false") {
            valeur=false;
        } else if (typeof(valeur) === "string") {
            if (valeur === "undefined") {
                valeur=undefined;
            } else if (valeur === "null") {
                valeur=null;
            } else if (valeur === "") {
                // on ne fait rien
            } else if (!isNaN(Number(valeur))) { // si format numérique
                valeur = Number(valeur);
            }
        }

        // maj on utilise l'objet window pour modifier les variables globales
        window[flag]=valeur;

        alert ("OK");
        this.affiche_var();

    }

} // fin de tf_organizer
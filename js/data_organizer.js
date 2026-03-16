function data_organizer (params) {
    this.url=glob_url_manage_files;
    // data
    this.id_file_selector="zone_DO_data_form_fichier";
    this.id_textarea="zone_DO_data_form_texte";
    this.id_div="zone_DO_data_liste";

    // models
    this.id_file_selector_json="zone_DO_model_form_json";
    this.id_file_selector_weights="zone_DO_model_form_weights";
    this.id_textarea_model="zone_DO_model_form_texte";
    this.id_name_model="zone_DO_model_form_name";
    this.id_div_model="zone_DO_model_liste";

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.upload_data = async function () {
        let fichier = $("#" + this.id_file_selector).get(0).files[0];
        let commentaire = $("#" + this.id_textarea).val();
        let nom_fichier=fichier.name;
        let verif=await this.check_data(nom_fichier);
        if (verif === true) {
            if (! window.confirm(glob_get_intitule("alert_file_exists", {"%nom_fichier":nom_fichier}))) {
                return;
            }
        }
        let formData = new FormData();
        formData.append("fichier", fichier);
        formData.append("commentaire", commentaire);
        formData.append("action", "upload_data");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    let reponse = xhr.responseText;
                    // Handle successful response from the server
                    //console.log('Files uploaded successfully!');
                    if (reponse !== "OK") {
                        alert(reponse);
                    }
                    data_organizer.list_data();
                } else {
                    // Handle error response from the server
                    console.error('Failed to upload files.');
                    alert(glob_get_intitule("alert_file_upload_impossible", {"%erreur":xhr.status}));
                }
            }
        };
        xhr.upload.addEventListener("progress", (event) => {
            let loaded=event.loaded;
            let total=event.total;
            let ratio=(loaded*100)/total;
            let ratio2=ratio.toFixed(2)
            //console.log(loaded+" - " + total);
            $( "#progressbar_data_upload").progressbar({value: Number(ratio)});
        });
        xhr.send(formData);

        // commentaire
        if (commentaire !== "") {
            let url=this.url+"?action=set_commentaire&nom="+nom_fichier+"&type=data&commentaire="+commentaire;
            const response = await fetch(url);
            let retour=await response.json();
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.upload_model = async function () {
        let fichier_json = $("#" + this.id_file_selector_json).get(0).files[0];
        let fichier_weights = $("#" + this.id_file_selector_weights).get(0).files[0];
        let commentaire = $("#" + this.id_textarea_model).val();
        let nom_fichier=$("#" + this.id_name_model).val();
        let verif=await this.check_model(nom_fichier);
        if (verif === true) {
            if (! window.confirm(glob_get_intitule("alert_file_exists", {"%nom_fichier":nom_fichier}))) {
                return;
            }
        }
        let formData = new FormData();
        formData.append("fichier_json", fichier_json);
        formData.append("fichier_weights", fichier_weights);
        formData.append("nom_fichier", nom_fichier);
        formData.append("action", "upload_model");

        const xhr = new XMLHttpRequest();
        xhr.open("POST", this.url, true);
        xhr.onreadystatechange = function () {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    let reponse = xhr.responseText;
                    if (reponse !== "OK") {
                        alert(reponse);
                    }
                    data_organizer.list_models();
                } else {
                    // Handle error response from the server
                    console.error('Failed to upload files.');
                    alert(glob_get_intitule("alert_file_upload_impossible", {"%nom_fichier":xhr.status}));
                }
            }
        };

        xhr.upload.addEventListener("progress", (event) => {
            let loaded=event.loaded;
            let total=event.total;
            let ratio=(loaded*100)/total;
            let ratio2=ratio.toFixed(2)
            $( "#progressbar_model_upload").progressbar({value: Number(ratio)});
        });

        xhr.send(formData);

        // commentaire
        if (commentaire !== "") {
            let url=this.url+"?action=set_commentaire&nom="+nom_fichier+"&type=model&commentaire="+commentaire;
            const response = await fetch(url);
            let retour=await response.json();
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.list_data = async function () {
        let url=this.url+"?action=list_data";
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_impossible_load_datalist"));
        }
        let json = await response.json();
        let a_afficher="<table>";
        for (let id in json) {
            let elem=json[id]["url"];
            let name=json[id]["name"];
            let commentaire=json[id]["commentaire"];
            a_afficher+="<tr><td>"+name+"</a></td>";
            a_afficher+="<td class='icone'><img src='IMG/icones/information.png' title=\""+commentaire+"\" class='icone pointer' onclick=\"data_organizer.get_commentaire('"+name+"', 'data');\"/></td>";
            a_afficher+="<td class='icone'><img src='IMG/icones/pencil.png' title='"+glob_get_intitule("label_edit")+"' class='icone pointer' onclick='data_organizer.update_data(\""+name+"\")'/></td><td class='icone'><img src='IMG/icones/cross.png' title='"+glob_get_intitule("label_delete")+"' class='icone pointer' onclick='data_organizer.delete_data(\""+name+"\")'/></td></tr>";
        }
        a_afficher+="</table>";
        $("#"+this.id_div).html(a_afficher);
        this.get_user_size();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.get_user_size = async function () {
        let url=this.url+"?action=get_user_size";
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_impossible_load_user_size"));
        }
        let json = await response.json();
        let used=Number(json["used"]);
        let max=Number(json["max"]);
        let ratio=Math.floor(used*100/max);
        let used_readable=tf_organizer.readable(used);
        let max_readable=tf_organizer.readable(max);

        $("#progressbar_storage").progressbar({value: ratio});
        $("#progressbar_storage .progress-label").text(used_readable+" / "+max_readable);

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.list_models = async function () {
        let url=this.url+"?action=list_models";
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_impossible_load_datalist"));
        }
        let json = await response.json();
        let a_afficher="<table>";
        for (let id in json) {
            let elem=json[id]["url"];
            let name=json[id]["name"];
            let commentaire=json[id]["commentaire"];
            a_afficher+="<tr><td>"+name+"</a></td>";
            a_afficher+="<td class='icone'><img src='IMG/icones/information.png' title='"+commentaire+"' class='icone pointer' onclick=\"data_organizer.get_commentaire('"+name+"', 'model');\" /></td>";
            a_afficher+="<td class='icone'><img src='IMG/icones/pencil.png' title='"+glob_get_intitule("label_edit")+"' class='icone pointer' onclick='data_organizer.update_model(\""+name+"\")'/></td><td class='icone'><img src='IMG/icones/cross.png' title='"+glob_get_intitule("label_delete")+"' class='icone pointer' onclick='data_organizer.delete_model(\""+name+"\")'/></td>";
            a_afficher+="<td class='icone'><img src='IMG/icones/page_code.png' title='"+glob_get_intitule("label_download_json")+"' class='icone pointer' onclick='data_organizer.download_model(\""+name+"\", \"json\")'/></td><td class='icone'><img src='IMG/icones/page_gear.png' title='"+glob_get_intitule("label_download_bin")+"' class='icone pointer' onclick='data_organizer.download_model(\""+name+"\", \"bin\")'/></td></tr>";
        }
        a_afficher+="</table>";
        $("#"+this.id_div_model).html(a_afficher);
        this.get_user_size();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.delete_data = async function (nom) {
        if (! window.confirm(glob_get_intitule("alert_confirm_delete_file", {"%nom":nom}))) {
            return;
        }
        nom=encodeURI(nom);
        let url=this.url+"?action=delete_data&nom="+nom;
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_error_connexion", {"%url":url}));
        }
        let retour=await response.text();
        if (retour !== "OK") {
            alert(retour);
        }

        this.list_data();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.delete_model = async function (nom) {
        if (! window.confirm(glob_get_intitule("alert_confirm_delete_file", {"%nom":nom}))) {
            return;
        }
        nom=encodeURI(nom);
        let url=this.url+"?action=delete_model&nom="+nom;
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_error_connexion", {"%url":url}));
        }
        let retour=await response.text();
        if (retour !== "OK") {
            alert(retour);
        }

        this.list_models();
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.update_data = async function (nom) {
        let nouv_nom=prompt("nouveau nom : ", nom);
        if (nouv_nom === null) {
            return;
        }

        let verif=await this.check_data(nouv_nom);
        if (verif === true) {
            alert (glob_get_intitule("alert_file_already_exists", {"%nom":nouv_nom}));
            return;
        }

        nom=encodeURI(nom);
        nouv_nom=encodeURI(nouv_nom);
        let url=this.url+"?action=update_data&nom="+nom+"&nouv_nom="+nouv_nom;
        const response = await fetch(url);
        let retour=await response.text();
        if (retour !== "OK") {
            alert(retour);
        }

        this.list_data();

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.update_model = async function (nom) {
        let nouv_nom=prompt(glob_get_intitule("label_new_name"), nom);
        if (nouv_nom === null) {
            return;
        }

        let verif=await this.check_model(nouv_nom);
        if (verif === true) {
            alert (glob_get_intitule("alert_file_already_exists", {"%nom":nouv_nom}));
            return;
        }

        nom=encodeURI(nom);
        nouv_nom=encodeURI(nouv_nom);
        let url=this.url+"?action=update_model&nom="+nom+"&nouv_nom="+nouv_nom;
        const response = await fetch(url);
        let retour=await response.text();
        if (retour !== "OK") {
            alert(retour);
        }

        this.list_models();

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.check_data = async function (nom) {
        nom=encodeURI(nom);
        let url=this.url+"?action=check_data&nom="+nom;
        const response = await fetch(url);
        let retour=await response.text();
        if (retour === "true") {
            return (true);
        } else {
            return (false);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.check_model = async function (nom) {
        nom=encodeURI(nom);
        let url=this.url+"?action=check_model&nom="+nom;
        const response = await fetch(url);
        let retour=await response.text();
        if (retour === "true") {
            return (true);
        } else {
            return (false);
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.download_model = async function (nom, type) {
        nom=encodeURI(nom);
        let url=this.url+"?action=download_model&nom="+nom+"&type="+type;
        const response = await fetch(url);
        let retour=await response.text();
        window.open(retour);

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.get_commentaire = async function (nom, type) {
        let nom2=encodeURI(nom);
        let url=this.url+"?action=get_commentaire&nom="+nom2+"&type="+type;
        const response = await fetch(url);
        let retour=await response.json();
        if (retour["succes"] == false) {
            alert (retour["message"]);
            return;
        }
        let commentaire=retour["commentaire"];
        this.affiche_commentaire (nom, type, commentaire);
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.affiche_commentaire = function (nom, type, commentaire) {
        let popup=$("#zone_data_commentaire");
        popup.dialog({modal:true, height:700, width:1100, position: { my: "center top", at: "top+100", of: window }});
        $("#zone_data_commentaire input[name='nom']").val(nom);
        $("#zone_data_commentaire input[name='type']").val(type);
        $("#zone_data_commentaire textarea[name='commentaire']").val(commentaire);

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    this.set_commentaire = async function () {
        let nom=$("#zone_data_commentaire input[name='nom']").val();
        let type=$("#zone_data_commentaire input[name='type']").val();
        let commentaire=$("#zone_data_commentaire textarea[name='commentaire']").val();
        commentaire=commentaire.replaceAll("\"", " ");
        commentaire=commentaire.replaceAll("\\", " ");
        commentaire=commentaire.replaceAll("\n", " ");
        nom=encodeURI(nom);
        type=encodeURI(type);
        commentaire=encodeURI(commentaire);
        let url=this.url+"?action=set_commentaire&nom="+nom+"&type="+type+"&commentaire="+commentaire;
        const response = await fetch(url);
        let retour=await response.json();
        if (retour["succes"] == false) {
            alert (retour["message"]);
            return;
        }
        let popup=$("#zone_data_commentaire");
        popup.dialog("close");


    }


} // FIN DE LA CLASSE
function user_organizer () {
    this.user={};
    this.popup=$("#popup_user");

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // clique_user
    this.clique_user = function () {
        if (this.user.name === undefined) {
            this.affiche_connexion();
        } else {
            this.affiche_infos_user();
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // affiche_connexion
    this.affiche_connexion = function () {
        let html="";
        html+="<div class='icone_user' ><img src='IMG/icones_grandes/user_big.png'/></div>";
        html+="<div id='connexion_user'>";
        html+="<table><tr><td colspan='2'><h3>"+glob_get_intitule("label_connexion")+"</h3></td></tr>";
        html+="<tr><td>"+glob_get_intitule("label_mail")+" : </td><td><input type='text'  name='mail_user'/></td></tr>";
        html+="<tr><td>"+glob_get_intitule("label_password")+" : </td><td><input type='password'  name='pwd_user'/></td></tr>";
        html+="<tr><td colspan='2' class='center'><button onclick='user_organizer.connexion()'>"+glob_get_intitule("label_connexion")+"</button></td></tr>";
        html+="<tr><td colspan='2' class='center'><a href='javascript:user_organizer.pwd_oublie()'>"+glob_get_intitule("label_password_forgotten")+"</a></td></tr>";
        html+="</table></div>";

        html+="<div id='inscription_user'>";
        html+="<table><tr><td colspan='2'><h3>"+glob_get_intitule("label_inscription")+"</h3></td></tr>";
        html+="<tr><td>"+glob_get_intitule("label_name")+" : </td><td><input type='text'  name='name_user'/></td></tr>";
        html+="<tr><td>"+glob_get_intitule("label_mail")+" : </td><td><input type='text'  name='mail_user'/></td></tr>";
        html+="<tr><td>"+glob_get_intitule("label_password")+" : </td><td><input type='password'  name='pwd_user'/></td></tr>";
        html+="<tr><td colspan='2' class='center'><button onclick='user_organizer.inscription()'>"+glob_get_intitule("label_inscription")+"</button></td></tr>";
        html+="</table></div>";

        this.popup.html(html);
        this.popup.dialog({autoOpen: false, height: 400, width: 900, modal: true, position: { my: "center top", at: "top+100", of: window, collision: "none" } });
        this.popup.dialog("open"); // vérif si utile
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // affiche_connexion
    this.affiche_infos_user = function () {
        let html="";
        html+="<div class='icone_user' ><img src='IMG/icones_grandes/user_big.png'/></div>";
        html+="<div id='inscription_user' style='width:100%'>";
        html+="<table><tr><td colspan='2'><h3>"+glob_get_intitule("label_update_informations")+"</h3></td></tr>";
        html+="<tr><td>"+glob_get_intitule("label_name")+" : </td><td><input type='text'  name='name_user' value=\""+this.user["name"]+"\"/></td></tr>";
        html+="<tr><td>"+glob_get_intitule("label_mail")+" : </td><td><input type='text'  name='mail_user' value=\""+this.user["mail"]+"\"/></td></tr>";
        html+="<tr><td>"+glob_get_intitule("label_password")+" : </td><td><input type='password'  name='pwd_user' value=''/></td></tr>";
        html+="<tr><td colspan='2' class='center'><button onclick='user_organizer.modification()'>"+glob_get_intitule("button_update")+"</button> &nbsp;&nbsp;&nbsp;&nbsp; <button onclick='user_organizer.deconnexion()'>"+glob_get_intitule("button_deconnect")+"</button></td></tr>";
        html+="<tr><td colspan='2' class='center'> &nbsp; </td></tr>";
        html+="<tr><td colspan='2' class='center'><a href='javascript:user_organizer.suppression()'>"+glob_get_intitule("label_delete_account")+"</a></td></tr>";
        html+="</table></div>";

        this.popup.html(html);
        this.popup.dialog({autoOpen: false, height: 500, width: 900, modal: true, position: { my: "center top", at: "top+100", of: window, collision: "none" } });
        this.popup.dialog("open"); // vérif si utile


    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // connexion
    this.connexion = async function () {
        let mail_user=$("#connexion_user input[name='mail_user']").val();
        let pwd_user=$("#connexion_user input[name='pwd_user']").val();
        let url=glob_url_manage_users+"?action=connexion&mail_user="+encodeURI(mail_user)+"&pwd_user="+encodeURI(pwd_user);
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_connection_failed"));
        }
        let json = await response.json();

        if (json.success === true) {
            this.user["name"]=json.name;
            this.user["mail"]=json.mail;
            this.user["dir"]=json.dir;

            $("#user_name").html(this.user["name"]);
            refresh_listes(); // affiche le contenu des listes persos
            this.popup.dialog("close");

        } else {
            let message=json.message;
            alert(message);
            return;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // touch
    this.touch = async function () {
        let url=glob_url_manage_users;
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_connection_failed"));
        }
        let json = await response.json();

        if (json.success === true) {
            this.user["name"]=json.name;
            this.user["mail"]=json.mail;
            this.user["dir"]=json.dir;

            $("#user_name").html(this.user["name"]);
            refresh_listes(); // affiche le contenu des listes persos
            try {
                this.popup.dialog("close");
            } catch (e) {
                // on ne fait rien
            }

        } else {
            $("#user_name").html("");
            raz_listes();
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // inscription
    this.inscription = async function () {
        let mail_user=$("#inscription_user input[name='mail_user']").val();
        let pwd_user=$("#inscription_user input[name='pwd_user']").val();
        let name_user=$("#inscription_user input[name='name_user']").val();
        let url=glob_url_manage_users+"?action=inscription&mail_user="+encodeURI(mail_user)+"&pwd_user="+encodeURI(pwd_user)+"&name_user="+encodeURI(name_user);
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_connection_failed"));
        }
        let json = await response.json();

        if (json.success === true) {
            alert (glob_get_intitule("alert_registration_successfull"));
            $("#inscription_user input[name='mail_user']").val("");
            $("#inscription_user input[name='pwd_user']").val("");
            $("#inscription_user input[name='name_user']").val("");

        } else {
            let message=json.message;
            alert(message);
            return;
        }
    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // modification
    this.modification = async function () {
        let mail_user=$("#inscription_user input[name='mail_user']").val();
        let pwd_user=$("#inscription_user input[name='pwd_user']").val();
        let name_user=$("#inscription_user input[name='name_user']").val();
        let url=glob_url_manage_users+"?action=modification&mail_user="+encodeURI(mail_user)+"&pwd_user="+encodeURI(pwd_user)+"&name_user="+encodeURI(name_user);
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_connection_failed"));
        }
        let json = await response.json();

        if (json.success === true) {
            alert ("mise à jour effectuée");
            this.user["name"]=json.name;
            this.user["mail"]=json.mail;
            this.user["pwd"]=json.pwd;

            $("#user_name").html(this.user["name"]);
            this.popup.dialog("close");

        } else {
            let message=json.message;
            alert(message);
            return;
        }


    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // suppression
    this.suppression = async function () {
        if (!confirm(glob_get_intitule("alert_delete_account"))) {
            return;
        }
        let url=glob_url_manage_users+"?action=suppression";
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_connection_failed"));
            return;
        }

        let json = await response.json();

        if (json.success === true) {
            alert (glob_get_intitule("alert_account_deleted"));
            this.user={};
            $("#user_name").html("");
            this.popup.dialog("close");
            raz_listes ();

        } else {
            let message=json.message;
            alert("échec : "+message);
            return;
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // deconnexion
    this.deconnexion = async function () {

        let url=glob_url_manage_users+"?action=deconnexion";
        const response = await fetch(url);
        if (!response.ok) {
            alert(glob_get_intitule("alert_connection_failed"));
            return;
        }

        let json = await response.json();

        if (json.success === true) {
            this.user={};
            $("#user_name").html("");
            this.popup.dialog("close");
            raz_listes ();

        } else {
            let message=json.message;
            alert(message);
            return;
        }

    }

    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // pwd oublié
    this.pwd_oublie = async function () {
        let mail=prompt (glob_get_intitule("alert_prompt_mail"));
        let url=glob_url_manage_users+"?action=pwd_oublie&mail_user="+mail;
        const response = await fetch(url);
        if (!response.ok) {
            alert("Echec de la connexion :");
            return;
        }

        let json = await response.json();

        if (json.success === true) {
            alert (glob_get_intitule("alert_mail_sent", {"%mail":mail}));

        } else {
            let message=json.message;
            alert(message);
            return;
        }

    }




} // fin de la classe
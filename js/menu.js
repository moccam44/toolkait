// les menus doivent avoir la classe class_menu
// les div doivent avoir la classe class_div
// chaque menu et div correspondante doit avoir le même attribut name
// les onclick doivent être intégrés directement en html


class wb_menu {

    constructor (class_menu, class_div) {
        this.class_menu=class_menu;
        this.class_div=class_div;
        
        
        
    }
    
    clique (name) {
        this.masque_tous_menus();
        this.masque_tous_div();
        this.affiche(name);
    }
    
    masque_tous_menus () {
        $("."+this.class_menu).removeClass("wb_menu_selected").addClass("wb_menu_not_selected");
    }
    
    masque_tous_div () {
        $("."+this.class_div).removeClass("wb_menu_div_selected").addClass("wb_menu_div_not_selected");
    }
    
    affiche (name) {
        $("."+this.class_menu+"[name='"+name+"']").removeClass("wb_menu_not_selected").addClass("wb_menu_selected");
        $("."+this.class_div+"[name='"+name+"']").removeClass("wb_menu_div_not_selected").addClass("wb_menu_div_selected");
    }
    
    
    
    
    
    
    
} // fin de la classe


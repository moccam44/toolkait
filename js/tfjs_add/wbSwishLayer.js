// DEPRECATED //

export class wbSwishLayer extends tf.layers.Layer {
    constructor(config) {
        super(config);
    }

    // Méthode d'activation Swish : x * sigmoid(x)
    call(inputs) {
        return tf.mul(inputs, tf.sigmoid(inputs));
    }

    // Méthode pour définir la forme de sortie
    computeOutputShape(inputShape) {
        return inputShape;
    }

    // Méthode pour s'assurer que la couche peut être sérialisée/désérialisée
    getConfig() {
        const config = super.getConfig();
        return config;
    }

    // Nom de la couche pour l'affichage
    static get className() {
        return 'wbSwishLayer';
    }
}

// Enregistrement de la couche pour pouvoir l'utiliser dans un modèle
tf.serialization.registerClass(wbSwishLayer);
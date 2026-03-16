// Prend en paramètre un tenseur à 1, 2 ou 3 dimensions composé d'entiers (tokens)
// retourne un tenseur avec une dimension supplémentaire où les entiers sont remplacés par un vecteur one hot
// le vecteur one hot a une longueur de nbCat (nombre le plus élevé possible pour un token. Dépend du tokenizer utilisé)
// toutes les valeurs du vecteur one hot valent 0 sauf celle correspondant à l'entier récupéré qui vaut 1
// Par exemple si nbCat vaut 5 et qu'on récupère la valeur 3, on retourne [0,0,0,1,0]

export class wbNumber2OneHot extends tf.layers.Layer {
    constructor(config) {
        super(config);
        this.nbCat = config.nbCat;
        this.forme_output;
    }

    ///////////////////////////////////////////////////////////////////////////////////
    // si inputShape est [null,200] et nbCatt vaut 10000, outputShape vaudra [null, 200, 10000]
    computeOutputShape(inputShape) {
        let tmp=[];
        for (let idx in inputShape) {
            tmp.push(inputShape[idx]);
        }
        tmp.push(this.nbCat);
        this.forme_output=tmp;

        return (this.forme_output);
    }

    ///////////////////////////////////////////////////////////////////////////////////
    call(inputs, training) {
        const tmp=inputs[0].cast('int32');
        const retour=tf.oneHot(tmp, this.nbCat);
        return (retour);

    }

    ///////////////////////////////////////////////////////////////////////////////////
    static get className() {
        return 'wbNumber2OneHot';
    }


    ///////////////////////////////////////////////////////////////////////////////////
    getConfig() {
        const baseConfig = super.getConfig();
        return {
            ...baseConfig,
            nbCat: this.nbCat
        };
    }

    ///////////////////////////////////////////////////////////////////////////////////
    static fromConfig(cls, config) {
        return new wbNumber2OneHot(config);
    }


} // fin de wbNumber2OneHot

tf.serialization.registerClass(wbNumber2OneHot, undefined, "wbNumber2OneHot");
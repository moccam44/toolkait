
export class wbLastTokenLayer extends tf.layers.Layer {
    constructor(config) {
        super(config);
    }

    static get className() {
        return 'wbLastTokenLayer';
    }

    computeOutputShape(inputShape) {
        // inputShape = [batchSize, nbTokens, qkvDimension]
        return [inputShape[0], inputShape[2]];
    }

    call(inputs) {
        const input = Array.isArray(inputs) ? inputs[0] : inputs;

        return tf.tidy(() => {
            const nbTokens = input.shape[1];
            // Récupère le dernier token (axe 1)

            const gathered=tf.gather(input, nbTokens - 1, 1);

            //return tf.squeeze(gathered, [1]);
            return (gathered);
        });
    }

    static fromConfig(cls, config) {
        return new wbLastTokenLayer(config);
    }
}

tf.serialization.registerClass(wbLastTokenLayer, undefined, "wbLastTokenLayer");

export class wbPositionalEncodingLayer extends tf.layers.Layer {
    constructor(config) {
        super(config);
    }

    getPositionalEncoding(maxLen, dModel) {
        // positions : [maxLen, 1]
        const position = tf.range(0, maxLen, 1, 'float32').expandDims(1);

        // dimensions : [1, dModel]
        const divTerm = tf.range(0, dModel, 1, 'float32')
            .div(dModel)
            .mul(-Math.log(10000.0))
            .expandDims(0);

        // [maxLen, dModel]
        const angleRates = tf.exp(divTerm).mul(position);

        // masque pair/impair : [dModel]
        const dimIndices = tf.range(0, dModel, 1, 'float32');
        const evenMask = dimIndices.mod(2).equal(tf.scalar(0)).toFloat(); // 1 pour pairs
        const oddMask  = tf.scalar(1.0).sub(evenMask);                    // 1 pour impairs

        // appliquer sin/cos selon masque
        const sinPart = tf.sin(angleRates).mul(evenMask);
        const cosPart = tf.cos(angleRates).mul(oddMask);

        return sinPart.add(cosPart); // [maxLen, dModel]
    }

    call(inputs, kwargs) {
        return tf.tidy(() => {
            let x = inputs;
            if (Array.isArray(x)) x = x[0];

            const [batch, seqLen, dModel] = x.shape;

            const pe = this.getPositionalEncoding(seqLen, dModel); // [seqLen, dModel]
            const peBatch = pe.expandDims(0); // [1, seqLen, dModel]

            return x.add(peBatch); // broadcast sur batch → [batch, seqLen, dModel]
        });
    }

    computeOutputShape(inputShape) {
        return inputShape;
    }

    static get className() {
        return 'wbPositionalEncodingLayer';
    }

    getConfig() {
        const baseConfig = super.getConfig();
        return {
            ...baseConfig,
        };
    }

    static fromConfig(cls, config) {
        return new wbPositionalEncodingLayer(config);
    }
}

tf.serialization.registerClass(wbPositionalEncodingLayer, undefined, "wbPositionalEncodingLayer");


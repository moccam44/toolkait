
export class wbTimeEmbedding extends tf.layers.Layer {
    constructor(config) {

        super(config);
        this.dim = config.dim;
        this.steps=config.steps;
        this.schedule=table_organizer.diffusion_genere_schedule(this.steps);
        this.genereEmbeddings();

    }

    static get className() {
        return 'wbTimeEmbedding';
    }

    // Méthode obligatoire pour les couches sans poids
    build(inputShape) {
        super.build(inputShape);
    }

    // génération de l'encodage sinusoidal pour l'ensemble des étapes (appelé une seule fois)
    genereEmbeddings() {
        if (this.embeddings !== undefined) {
            return;
        }
        let embeddings=[];
        for (let idx_step=0; idx_step<this.steps; idx_step++) { // pour chaque étape
            const alphaBarT = this.schedule.alphaBar[idx_step];
            const noiseVariance = 1.0 - alphaBarT; // quantité réelle de bruit à l’étape `step`

            const value = Math.log(noiseVariance + 1e-8); // évite log(0)
            const halfDim = Math.floor(this.dim / 2);
            const frequencies = Array.from({ length: halfDim }, (_, i) =>
                Math.exp(-Math.log(10000.0) * i / (halfDim - 1))
            );

            const sinPart = frequencies.map(f => Math.sin(value * f));
            const cosPart = frequencies.map(f => Math.cos(value * f));

            let embedding = sinPart.concat(cosPart);

            // Ajuste la taille si impair
            if (embedding.length < this.dim) {
                embedding = embedding.concat(new Array(embeddingSize - embedding.length).fill(0));
            }
            embeddings.push(embedding);

        }
        this.embeddings = tf.tensor2d(embeddings);
        //this.embeddings.print();

    }

    // Applique la transformation sinusoïdale
    call(inputs) {
        return tf.tidy(() => {
            let t = inputs[0].cast("int32"); // Tensor scalaire (étape t)
            if (t.rank >= 2) {
                t=t.squeeze([1]);
            }
            let embedding=tf.gather(this.embeddings, t);
            //t.print();
            //embedding.print();
            return (embedding);
        });
    }

    // Définis la forme de sortie
    computeOutputShape(inputShape) {
        return [inputShape[0], this.dim]; // [batchSize, dim]
    }

    // Pas de poids à sauvegarder
    getConfig() {
        const baseConfig = super.getConfig();
        return {
            ...baseConfig,
            dim: this.dim,
            steps: this.steps,
        };
    }

    static fromConfig(cls, config) {
        return new wbTimeEmbedding(config);
    }
}

tf.serialization.registerClass(wbTimeEmbedding, undefined, "wbTimeEmbedding");


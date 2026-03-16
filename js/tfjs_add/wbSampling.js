export class wbSampling extends tf.layers.Layer {
    constructor(config) {
        super(config);
        this.klWeight = config.klWeight; // weights the KL_loss compared to reconstruction loss. If klWeight==0, reconstruction loss is the only loss used
        if (this.klWeight === undefined) {
            this.klWeight=0.0001; // default
        }
        this.last_mu;
        this.last_logVar;

        // Adds KL loss
        this.addLoss(() => {
            const retour = tf.tidy(() => {
                let kl_loss;
                let z_log_var=this.last_logVar;
                let z_mean=this.last_mu;
                kl_loss = tf.scalar(1).add(z_log_var).sub(z_mean.square()).sub(z_log_var.exp());
                kl_loss = tf.sum(kl_loss, -1);
                kl_loss = kl_loss.mul(tf.scalar(-0.5 * this.klWeight));
                return (tf.mean(kl_loss));
            });
            return (retour);


        }); // end of addLoss
    } // end of constructor

    computeOutputShape(inputShape) {
        return inputShape[0]; // same shape as mu
    }

    call(inputs, training) {
        return tf.tidy(() => {
            const [mu, logVar] = inputs;

            // store mu and logVar values to be used by the KL loss function
            this.last_mu=mu; // zMean
            this.last_logVar=logVar; // zLogVar

            const z = tf.tidy(() => {
                const batch = mu.shape[0];
                const dim = mu.shape[1];
                const epsilon = tf.randomNormal([batch, dim]);
                const half = tf.scalar(0.5);
                const temp = logVar.mul(half).exp().mul(epsilon);
                const sample = mu.add(temp);
                return sample;
            });
            return z;
        });
    } // end of call()

    static get className() {
        return 'wbSampling';
    }

    // Méthode pour obtenir la configuration de la couche
    getConfig() {
        const baseConfig = super.getConfig();
        return {
            ...baseConfig,
            klWeight: this.klWeight
        };
    }

    // Méthode statique pour créer une couche à partir de la configuration
    static fromConfig(cls, config) {
        return new wbSampling(config);
    }
} // end of wbSampling layer

//tf.serialization.registerClass(wbSampling, undefined, "wbSampling");
tf.serialization.registerClass(wbSampling);
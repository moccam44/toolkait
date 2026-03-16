export class wbAttentionWeights extends tf.layers.Layer {
    /**
     * @param {Object} args - args.maskFuture (bool) indique masque causal.
     */
    constructor(args) {
        super(args || {});
        this.boolMaskFutur = args.boolMaskFutur;
        // valeur très négative pour masquer avant le softmax
        this._NEG_INF = -1e9;
        this.iswbAttentionWeights = true;
    }

    // supporte soit inputs = [q,k,v] soit {q,k,v}
    call(inputs, kwargs={}) {
        let bool_return_weights=kwargs["bool_return_weights"];
        return tf.tidy(() => {
            // Normalize input format
            let q, k, v;
            if (Array.isArray(inputs)) {
                [q, k, v] = inputs;
            } else if (inputs && typeof inputs === 'object') {
                q = inputs.q ?? inputs.Q;
                k = inputs.k ?? inputs.K;
                v = inputs.v ?? inputs.V;
            } else {
                throw new Error('AttentionLayer: inputs must be [q,k,v] or {q,k,v}');
            }

            if (!q || !k || !v) {
                throw new Error('AttentionLayer: q, k and v tensors are required.');
            }

            // Ensure rank 3 (batch, seq, depth). If rank 2, add batch dim = 1
            const ensure3 = t => {
                if (t.rank === 3) return t;
                if (t.rank === 2) return t.expandDims(0);
                throw new Error('AttentionLayer: inputs must be rank 2 or 3 tensors.');
            };
            q = ensure3(q);
            k = ensure3(k);
            v = ensure3(v);

            const batch = q.shape[0];
            const seqQ = q.shape[1];
            const depthQ = q.shape[2];
            const seqK = k.shape[1];
            const depthK = k.shape[2];
            const seqV = v.shape[1];
            const depthV = v.shape[2];

            if (depthQ !== depthK) {
                throw new Error(`AttentionLayer: q.depth (${depthQ}) != k.depth (${depthK})`);
            }
            if (seqK !== seqV) {
                throw new Error(`AttentionLayer: k.seq (${seqK}) != v.seq (${seqV})`);
            }

            // 1) scores = Q · K^T  -> shape [batch, seqQ, seqK]
            // tf.matMul supports batched matmul when both tensors are rank 3.
            const scores = tf.matMul(q, k, false, true); // [..., M, K] x [..., N, K]^T -> [..., M, N]

            // 2) scale by sqrt(depth)
            const scale = Math.sqrt(depthQ);
            let scaled = tf.div(scores, tf.scalar(scale));

            // 3) apply causal mask if requested
            if (this.boolMaskFutur) {
                // create lower-triangular mask of shape [seqQ, seqK]
                // We build mask only once per forward pass; it will broadcast on batch.
                // mask[i,j] = 1 if j <= i else 0  (allow current and past, mask future)
                const range = tf.range(0, seqK, 1, 'int32');            // [seqK]
                const i = tf.reshape(range, [seqK, 1]);                 // [seqK,1]
                const j = tf.reshape(range, [1, seqK]);                 // [1,seqK]
                // if seqQ !== seqK, we need mask shape [seqQ, seqK]
                // create indices for rows 0..seqQ-1 and cols 0..seqK-1
                const rows = tf.range(0, seqQ, 1, 'int32');             // [seqQ]
                const cols = tf.range(0, seqK, 1, 'int32');             // [seqK]
                const rows2 = tf.reshape(rows, [seqQ, 1]);              // [seqQ,1]
                const cols2 = tf.reshape(cols, [1, seqK]);              // [1,seqK]
                const mask2d = tf.lessEqual(cols2, rows2).toFloat();    // [seqQ, seqK] broadcasting makes rows vs cols

                // expand to [1, seqQ, seqK] so it broadcasts over batch
                const mask3d = mask2d.expandDims(0);
                // Where mask is 0 (future), set a big negative value before softmax
                const negInfTensor = tf.mul(tf.scalar(this._NEG_INF), tf.sub(tf.scalar(1.0), mask3d));
                scaled = tf.add(tf.mul(scaled, mask3d), negInfTensor);
                // note: scaled now has very negative at masked positions
            }

            // 4) softmax along last axis (over keys)
            const attWeights = tf.softmax(scaled, -1); // shape [batch, seqQ, seqK]

            // 5) output = attWeights · V  -> [batch, seqQ, depthV]
            const output = tf.matMul(attWeights, v); // [..., M, N] x [..., N, D] -> [..., M, D]

            // If original inputs were rank 2 (no batch), return rank 2 by squeezing batch dim
            // But since we forced rank 3 earlier, we should preserve batch semantics. If user passed rank2 we had expanded to [1,...]
            // We can't detect that now except checking original ranks; for clarity we always return same rank as q input originally.
            // Let's detect original q rank:
            // (We cannot access original q before ensure3 here, so to simplify: if user passed rank 2, they will usually expect rank 2 back.)
            // We decide: if any original input had rank 2, squeeze batch dim.
            const wasRank2 = (q.shape[0] === 1 && (arguments.length > 0 && false)); // no-op placeholder
            // Simpler: if user passed a rank-2 q originally, they still can call squeeze outside. We'll just return rank 3.

            // Pour affichage : on peut soit retourner la sortie de la couche soit les poids d'attention
            if (bool_return_weights === true) {
                return attWeights;
            } else {
                return output;
            }


        });
    }

    computeOutputShape(inputShape) {
        // inputShape may be array or object
        let shapeQ;
        if (Array.isArray(inputShape)) {
            shapeQ = inputShape[0];
        } else if (inputShape && typeof inputShape === 'object') {
            shapeQ = inputShape.q || inputShape.Q;
        } else {
            throw new Error('AttentionLayer: computeOutputShape expects input shape [q,k,v] or {q,k,v}.');
        }

        // If shapeQ was rank 2 [seq,depth], convert to [1,seq,depth] then output same
        if (shapeQ.length === 2) {
            return [1, shapeQ[0], shapeQ[1]];
        }
        return [shapeQ[0], shapeQ[1], shapeQ[2]];
    }

    getConfig() {
        const baseConfig = super.getConfig();
        return {
            ...baseConfig,
            boolMaskFutur: this.boolMaskFutur,
            iswbAttentionWeights: true,
            name: this.name,
        };
    }


    ///////////////////////////////////////////////////////////////////////////////////
    static fromConfig(cls, config) {
        return new wbAttentionWeights(config);
    }

    static get className() {
        return 'wbAttentionWeights';
    }
}

// Register the class so models using it can be serialized/deserialized
tf.serialization.registerClass(wbAttentionWeights);
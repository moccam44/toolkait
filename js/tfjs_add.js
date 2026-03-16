/**
 * Si ajout d'un nouveau type de layer, penser à ajouter dans
 * model_organizer::def_2_layer()
 * lang::glob_listes["type_layer"]
 *
 */


// import
import { wbAttentionWeights } from './tfjs_add/wbAttentionWeights.js';
import { wbLastTokenLayer } from './tfjs_add/wbLastTokenLayer.js';
import { wbNumber2OneHot } from './tfjs_add/wbNumber2OneHot.js';
import { wbPositionalEncodingLayer } from './tfjs_add/wbPositionalEncodingLayer.js';
import { wbSampling } from './tfjs_add/wbSampling.js';
import { wbTimeEmbedding } from './tfjs_add/wbTimeEmbedding.js';
import { wbSwishLayer } from './tfjs_add/wbSwishLayer.js';

// attacher les classes à window
window.wbAttentionWeights=wbAttentionWeights;
window.wbLastTokenLayer=wbLastTokenLayer;
window.wbNumber2OneHot=wbNumber2OneHot;
window.wbPositionalEncodingLayer=wbPositionalEncodingLayer;
window.wbSampling=wbSampling;
window.wbTimeEmbedding=wbTimeEmbedding;
window.wbSwishLayer=wbSwishLayer;
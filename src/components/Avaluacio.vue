<template>
  <canvas id="avaluacio_multicriteri_chart" width="700" height="700"></canvas>
</template>
<script>

import {fuzzifyMatrix,fuzzyTopsis} from "../utils/fuzzy_topsis";
import {DICT_CRI_BENEFICIOSOS} from "../utils/multicriteri";

export default {
  name: "Graph",
  props: ["trens_multicriteris","trens_info"],
  mounted() {
    let vm = this;      

    vm.$nextTick(function () {      
        // 1. Compute the fuzzy topsis.
        vm.computeFuzzyTopsis(vm.trens_multicriteris, vm.trens_info);
    });
  },
  methods:{
    computeFuzzyTopsis(trens_multicriteris, trens_info){
        // Es crea el diccionari de fuzzy topsis a partir de posar els criteris com a claus, i valor té una clau amb la alternativa (ID tren) 
        //  i valor el valor normalitzat.
        let fuzzy_dict = {};
        for(const criteri of Object.keys(trens_multicriteris[0]['criteris_norm'])){
            fuzzy_dict[criteri] = {};
            for(const tren of trens_multicriteris){
                fuzzy_dict[criteri][tren.id] = tren['criteris_norm'][criteri];
            }
        }
        // Fuzzifica els valors del diccionari (matriu) de criteris.
        fuzzy_dict = fuzzifyMatrix(fuzzy_dict);
        const pes_criteris = {
            eliminacio_quimics: 'M',
            eliminacio_microbiologics: 'M',
            cost_total: 'H',
            cons_ene_mitja: 'H',
            espai_ocupat: 'M',
            hc: 'M',
            hh: 'M'
        }
        // Aquest diccionari marca tots els criteris com a beneficiosos, ja que partim de la normalització que ja s'ha invertit els no beneficiosos.
        const dict_beneficiosos ={
            eliminacio_quimics: true,
            eliminacio_microbiologics: true,
            cons_ene_mitja: true,
            cost_total: true,
            espai_ocupat: true,
            hc: true,
            hh: true
        }
        // Aplica fuzzy topsis al diccionari (matriu) de criteris i alternatives creada, juntament amb la matriu de decisió.
		const cc_dict = fuzzyTopsis(fuzzy_dict, pes_criteris, dict_beneficiosos);
        
        // Ordenar els trens de 'trens_multicriteris' en funció del CC obtingut.
        const trens_multicriteris_avaluat = trens_multicriteris.map(tren => ({...tren, cc: cc_dict[tren.id]}));
        trens_multicriteris_avaluat.sort((tren_a, tren_b) => tren_b.cc - tren_a.cc);
    }
  }
};
</script>
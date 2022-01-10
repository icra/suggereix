<template>
    <div id="intro">
        <table border="1">
            <tr>
                <th>Criteri</th>
                <th>Prioritat Fuzzy</th>
            </tr>
            <template v-for="(cri,id) in DICT_CRI_NOMS">
                <tr :key="id+'_selec_weights'">
                    <td>{{cri}}</td>
                    <td class="doubletd">
                        <select v-model="pes_criteris[id]" style="max-width: 350px">
                            <option
                            v-for="(nom, key) in pes_criteris_info"
                            :value="key"
                            :key="key"
                            >
                            {{ nom }}
                            </option>
                        </select>
                    </td>
                </tr>
            </template>
        </table>
        <canvas id="avaluacio_multicriteri_chart" width="700" height="300"></canvas>
        <div :ref="'av_bottom'"></div>
    </div>
</template>

<script>

import Chart from 'chart.js/auto';
import {fuzzifyMatrix,fuzzyTopsis} from "../utils/fuzzy_topsis";
import {DICT_CRI_NOMS} from "../utils/multicriteri";

export default {
  name: "Avaluacio",
  props: ["trens_multicriteris","trens_info"],
  data: function(){
    return {
        DICT_CRI_NOMS: DICT_CRI_NOMS,
        pes_criteris: {
            eliminacio_quimics: 'M',
            eliminacio_microbiologics: 'M',
            cost_total: 'H',
            cons_ene_mitja: 'H',
            espai_ocupat: 'M',
            hc: 'M',
            hh: 'M'
        },
        pes_criteris_info: {
            'VL': 'Molt baixa (MB)',
            'L': 'Baixa (B)',
            'M': 'Mitjana (M)',
            'H': 'Alta (A)',
            'VH': 'Molt alta (MA)'
        },
        trens_avaluats: [],
        chart: undefined
    }
  },
  mounted() {
    let vm = this;      

    vm.$nextTick(function () {      
        // 1. Compute the fuzzy topsis.
        vm.computeFuzzyTopsis(vm.trens_multicriteris.filter(tren => tren.avaluar));
    });
  },
  methods:{
    computeFuzzyTopsis(trens_multicriteris){
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
		const cc_dict = fuzzyTopsis(fuzzy_dict, this.pes_criteris, dict_beneficiosos);
        
        // Ordenar els trens de 'trens_multicriteris' en funció del CC obtingut.
        const trens_multicriteris_avaluat = trens_multicriteris.map(tren => ({...tren, cc: cc_dict[tren.id]}));
        trens_multicriteris_avaluat.sort((tren_a, tren_b) => tren_b.cc - tren_a.cc);
        this.trens_avaluats = trens_multicriteris_avaluat;
    },
    obtenirDadesGraphTrens(){
        const _this = this;
        // Si hi ha més de 15 trens, afagar només els 15 primers.
        const trens = _this.trens_avaluats.length > 15 ? _this.trens_avaluats.slice(0, 15) : _this.trens_avaluats
        return {
            labels: trens.map(tren => tren.id + ': ' + _this.trens_info[tren.id].nom),
            datasets: [{
                label: 'Valor CC',
                data: trens.map(tren => tren.cc),
                backgroundColor: "rgb(136, 204, 238)",
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2
            }]
        };
    }
  },
  watch: {
    //cada vegada que s'actualitzin els pesos, es re-computa el fuzzy topsis.
    pes_criteris:{
        handler: function(newVal, oldVal) {
            this.computeFuzzyTopsis(this.trens_multicriteris.filter(tren => tren.avaluar));
        },
        deep: true
    },
    //cada vegada que canviin els trens avaluats, actualitza els gràfics.
    trens_avaluats:{
        handler: function(newVal, oldVal) {
            if(this.chart) this.chart.destroy();
            const ctx = document.getElementById('avaluacio_multicriteri_chart');
            if(ctx){
                const config = {
                    type: 'bar',
                    data: this.obtenirDadesGraphTrens(),
                    options: {
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        },
                        plugins:{
                            legend: {
                                onClick: null
                            }
                        }
                    },
                };
                this.chart = new Chart(ctx, config);
                const el = this.$refs['av_bottom'];
                if (el) {
                    el.scrollIntoView({behavior: 'smooth'});
                }
            }
        },
        deep: true
    }
  }
};
</script>
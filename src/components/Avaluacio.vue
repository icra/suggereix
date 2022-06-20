<template>
    <div id="intro">
        <p><b>Mètode de priorització: </b>
            <select v-model="metode" style="max-width: 200px">
                <option
                  v-for="obj of selector_metode"
                  :value="obj.codi"
                  :key="obj.codi"
                >
                  {{ obj.nom }}
                </option>
            </select>
        </p>
        <table border="1">
            <tr>
                <th>Criteri</th>
                <th>Prioritat <button v-on:click="reset_pes_criteris">Reset</button></th>
                <th>Avaluar <button v-on:click="reset_criteris_a_considerar">Reset</button></th>
            </tr>
            <template v-for="(cri,id) in filtrarCriteris(DICT_CRI_NOMS)">
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
                    <td class="doubletd" style="text-align: center; padding: 0px 10px 0px 10px;">
                        <input
                            type="checkbox"
                            v-model="criteris_a_considerar[id]"
                        />
                    </td>
                </tr>
            </template>
        </table>
        <br>
        <canvas id="avaluacio_multicriteri_chart" width="700" height="300"></canvas>
    </div>
</template>

<script>

import { BarWithErrorBarsChart } from 'chartjs-chart-error-bars';
import {fuzzifyMatrix,fuzzyTopsis} from "../utils/fuzzy_topsis";
import {DICT_CRI_NOMS, DICT_PES_CRITERIS, DICT_CRITERIS_A_CONSIDERAR, DICT_CRI_INTERVAL} from "../utils/multicriteri";

const pesos_dict = {
    'VL': 0,
    'L': 0.25,
    'M': 0.5,
    'H': 0.75,
    'VH': 1
};

const colors = [
    "#88CCEE",
    "#CC6677",
    "#DDCC77",
    "#117733",
    "#AA4499",
    "#44AA99",
    "#999933",
    "#882255",
    "#661100",
    "#6699CC",
    "#888888"
]

export default {
  name: "Avaluacio",
  props: ["trens_multicriteris","trens_info","prop_pes_criteris","prop_criteris_a_considerar","prop_metode"],
  data: function(){
    return {
        DICT_CRI_NOMS: DICT_CRI_NOMS,
        pes_criteris: this.prop_pes_criteris || JSON.parse(JSON.stringify(DICT_PES_CRITERIS)),
        pes_criteris_info: {
            'VL': 'Molt baixa (MB)',
            'L': 'Baixa (B)',
            'M': 'Mitjana (M)',
            'H': 'Alta (A)',
            'VH': 'Molt alta (MA)'
        },
        criteris_a_considerar: this.prop_criteris_a_considerar || JSON.parse(JSON.stringify(DICT_CRITERIS_A_CONSIDERAR)),
        trens_avaluats: [],
        metode: this.prop_metode || 'agregar',
        selector_metode: [{codi: 'agregar', nom: 'Agregació i normalització'},{codi: 'fuzzy', nom: 'IA: Lògica Fuzzy'}],
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
    filtrarCriteris(criteris){
        const new_criteris = {};
        for(const [key, value] of Object.entries(criteris)){
            if(key !== 'eliminacio_quimics' && key !== 'eliminacio_microbiologics') new_criteris[key] = value;
        }
        return new_criteris;
    },
    reset_criteris_a_considerar(){
        this.criteris_a_considerar = JSON.parse(JSON.stringify(DICT_CRITERIS_A_CONSIDERAR));
    },
    reset_pes_criteris(){
        this.pes_criteris = JSON.parse(JSON.stringify(DICT_PES_CRITERIS));
    },
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
        const dict_beneficiosos = Object.fromEntries(Object.keys(DICT_PES_CRITERIS).map((key) => [key, true]));

        // Aplica fuzzy topsis al diccionari (matriu) de criteris i alternatives creada, juntament amb la matriu de decisió.
		const cc_dict = fuzzyTopsis(fuzzy_dict, this.pes_criteris, dict_beneficiosos, this.criteris_a_considerar);

        // Comprovar si cal aplicar fuzzy amb mínims i màxims (criteris a considerar amb interval).
        let cc_dict_int = {min: cc_dict, max: cc_dict};
        const criteris_interval_a_considerar = Object.keys(DICT_CRI_INTERVAL).filter(criteri => this.criteris_a_considerar[criteri]);
        if(criteris_interval_a_considerar.length){
            const politiques = ["min","max"];
            for(const politica of politiques){
                fuzzy_dict = {};
                for(const criteri of Object.keys(trens_multicriteris[0]['criteris_norm'])){
                    fuzzy_dict[criteri] = {};
                    for(const tren of trens_multicriteris){
                        fuzzy_dict[criteri][tren.id] = criteris_interval_a_considerar.includes(criteri) ? tren['criteris_no_agregats_norm'][criteri+'_'+politica] : tren['criteris_norm'][criteri];
                    }
                }
                fuzzy_dict = fuzzifyMatrix(fuzzy_dict);
                cc_dict_int[politica] = fuzzyTopsis(fuzzy_dict, this.pes_criteris, dict_beneficiosos, this.criteris_a_considerar);
            }
        }
        
        // Ordenar els trens de 'trens_multicriteris' en funció del CC obtingut.
        const trens_multicriteris_avaluat = trens_multicriteris.map(tren => ({...tren, cc: cc_dict[tren.id], cc_min: Math.min(...[cc_dict_int.min[tren.id], cc_dict_int.max[tren.id]]), cc_max: Math.max(...[cc_dict_int.min[tren.id], cc_dict_int.max[tren.id]])}));
        trens_multicriteris_avaluat.sort((tren_a, tren_b) => tren_b.cc - tren_a.cc);
        this.trens_avaluats = trens_multicriteris_avaluat;
    },
    // obté les dades del graph fuzzy.
    obtenirDadesGraphTrens(){
        const _this = this;
        const trens = _this.trens_avaluats;

        _this.$emit('resultats', trens);

        const data = {
            labels: trens.map(tren => _this.trens_info[tren.id].nom),
            datasets: [{
                label: 'Valor Fuzzy',
                data: trens.map(tren => { return { y: tren.cc, yMin: Math.round((tren.cc_min + Number.EPSILON) * 1000) / 1000, yMax: Math.round((tren.cc_max + Number.EPSILON) * 1000) / 1000 }}),
                backgroundColor: "rgb(136, 204, 238)",
                borderColor: 'rgb(54, 162, 235)',
                borderWidth: 2
            }]
        }

        if(_this.chart) _this.chart.destroy();
        const ctx = document.getElementById('avaluacio_multicriteri_chart').getContext('2d');
        if(ctx){
            const config = {
                data: data,
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
            return new BarWithErrorBarsChart(ctx, config);
        }
    },
    // calcula i obté les dades per les contribucions fixes.
    obtenirDadesGraphTrens2(){
        const _this = this;

        // Llistat de trens a avaluar i els criteris amb intervals.
        let trens = _this.trens_avaluats;
        const pre_trens = JSON.parse(JSON.stringify(_this.trens_avaluats));
        const criteris_interval_a_considerar = Object.keys(DICT_CRI_INTERVAL).filter(criteri => _this.criteris_a_considerar[criteri]);
        
        // Aquí emmagatzemarem els datasets per chart.js.
        const datasets = [];

        // Aquest diccionari agregarà els valors mínim i màxim agregats de tots els criteris per cada tren.
        const tren_min_max_dict = {};

        // Aquest diccionari contindrà el tren i el valor agregat i normalitzat de tots els criteris.
        const tren_valors = {};

        // Per cada criteri que s'hagi de considerar.
        const criteris_a_considerar_filtered = Object.keys(_this.trens_multicriteris[0]['criteris_norm']).filter(criteri => _this.criteris_a_considerar[criteri]);
        const suma_criteris = criteris_a_considerar_filtered.map(criteri => pesos_dict[_this.pes_criteris[criteri]]).reduce((a, b) => a + b, 0);
        for(const criteri of criteris_a_considerar_filtered){
            // Anar tren per tren calculant el valor de cada criteri: criteri normalitzat * pes puzzy numeralitzat (pesos_dict).
            const data_values = [];
            for(const tren of trens){
                const criteri_value = tren['criteris_norm'][criteri] * pesos_dict[_this.pes_criteris[criteri]] / suma_criteris;
                if(!tren_min_max_dict[tren.id]) tren_min_max_dict[tren.id] = {min: 0, max: 0};
                // Ara si és un criteri interval cal calcular el seu màxim i mínim, en cas contrari tant el màxim com el mínim són el mateix que el valor del criteri. 
                if(criteris_interval_a_considerar.includes(criteri)){
                    tren_min_max_dict[tren.id].min += tren['criteris_no_agregats_norm'][criteri+'_min'] * pesos_dict[_this.pes_criteris[criteri]] / suma_criteris;
                    tren_min_max_dict[tren.id].max += tren['criteris_no_agregats_norm'][criteri+'_max'] * pesos_dict[_this.pes_criteris[criteri]] / suma_criteris;
                }
                else{
                    tren_min_max_dict[tren.id].min += criteri_value;
                    tren_min_max_dict[tren.id].max += criteri_value;
                }
                data_values.push({y: criteri_value});

                // Actualitzar valor tren.
                if(!tren_valors[tren.id]) tren_valors[tren.id] = 0;
                tren_valors[tren.id] += criteri_value;
            }
            // Crear la ED que requereix chart.js amb el color que toqui.
            datasets.push({
                label: DICT_CRI_NOMS[criteri],
                data: data_values,
                backgroundColor: colors[datasets.length]
            });
        }
        // Ara per cada tren cal modicar els valors de chart.js de l'ultim criteri perquè el graph mostri l'interval.
        let i = -1;
        trens = trens.map(tren => {
            i += 1;
            datasets[datasets.length-1].data[i] = {y: datasets[datasets.length-1].data[i].y, yMin: Math.round((tren_min_max_dict[tren.id].min + Number.EPSILON) * 1000) / 1000, yMax: Math.round((tren_min_max_dict[tren.id].max + Number.EPSILON) * 1000) / 1000}
            return {
                ...tren,
                cc: tren_valors[tren.id],
                cc_min: Math.round((tren_min_max_dict[tren.id].min + Number.EPSILON) * 1000) / 1000,
                cc_max: Math.round((tren_min_max_dict[tren.id].max + Number.EPSILON) * 1000) / 1000
            }
        });
        trens = trens.sort((tren_a, tren_b) => tren_b.cc - tren_a.cc);
        let index_1 = 0;
        for(const tren of trens){
            const index_2 = pre_trens.findIndex(tren_2 => tren_2.id === tren.id);
            if(index_1 < index_2){
                for(let i=0; i<datasets.length;i++){
                    [datasets[i].data[index_1], datasets[i].data[index_2]] = [datasets[i].data[index_2], datasets[i].data[index_1]]
                }
            }
            index_1 += 1; 
        }

        _this.$emit('resultats', trens);

        // Retorna la ED requerida per chart.js. 
        const data = {
            labels: trens.map(tren => _this.trens_info[tren.id].nom),
            datasets: datasets
        }

        if(_this.chart) _this.chart.destroy();
        const ctx = document.getElementById('avaluacio_multicriteri_chart').getContext('2d');
        if(ctx){
            return new BarWithErrorBarsChart(ctx, {
                data: data,
                options: {
                    plugins: {
                        legend: {
                            onClick: null
                        }
                    },
                    responsive: true,
                    scales: {
                        x: {
                            stacked: true
                        },
                        y: {
                            stacked: true,
                            beginAtZero: true
                        }
                    }
                }
            });
        }
    }
  },
  watch: {
    //cada vegada que canviin les props dels trens multicriteri, computar la priorització. 
    trens_multicriteris: function(newVal, oldVal) {
        this.computeFuzzyTopsis(newVal.filter(tren => tren.avaluar));
    },
    //cada vegada que canvii el mètode de càlcul, computar la priorització. 
    metode: function(newVal, oldVal) {
        this.$emit('changeData', 'av_metode', newVal);
        this.computeFuzzyTopsis(this.trens_multicriteris.filter(tren => tren.avaluar));
    },
    //cada vegada que s'actualitzin els pesos, es re-computa el fuzzy topsis.
    pes_criteris:{
        handler: function(newVal, oldVal) {
            this.$emit('changeData', 'av_pes_criteris', newVal);
            this.computeFuzzyTopsis(this.trens_multicriteris.filter(tren => tren.avaluar));
        },
        deep: true
    },
    //cada vegada que s'actualitzin els criteris a considerar, computar el fuzzy topsis.
    criteris_a_considerar:{
        handler: function(newVal, oldVal) {
            this.$emit('changeData', 'av_criteris_a_considerar', newVal);
            this.computeFuzzyTopsis(this.trens_multicriteris.filter(tren => tren.avaluar));
        },
        deep: true
    },
    //cada vegada que canviin els trens avaluats, actualitza els gràfics.
    trens_avaluats:{
        handler: function(newVal, oldVal) {
            // Mostra el graph de priorització.
            this.chart = this.metode === 'fuzzy' ? this.obtenirDadesGraphTrens() : this.obtenirDadesGraphTrens2();
        },
        deep: true
    }
  }
};
</script>
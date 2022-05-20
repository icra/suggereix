<template>
  <div>
      <br>
      <p>A continuació es mostra el diagrama del tren de tractaments a monitorar. Els cercles indiquen punts de monitoratge de cada tractament i els rombes indiquen els punts d'entrada a la planta, sortida del tractament secundari i sortida de la planta.</p>
      <br>
      <div id="graph" />
      <div 
          :id="'monitoratge_tractaments'"
          v-bind:class="visio_monitoratge === 0 ? 'click-chip-hover background-blue' : 'click-chip-hover outline-blue'"
          @click="canviVisio"
      >
          Monitoratge dels tractaments
      </div>
      <div 
          :id="'monitoratge_qualitats'"
          v-bind:class="visio_monitoratge === 1 ? 'click-chip-hover background-blue' : 'click-chip-hover outline-blue'"
          @click="canviVisio"
      >
          Monitoratge de la qualitat de l'aigua
      </div>
      <div v-if="this.visio_monitoratge === 0">
        <div class="sticky">
            <table class="sticky extraborder" border="1">
              <tr>
                <th rowspan="2" class="doubletd">Tractament</th>
                <th rowspan="2" class="doubletd">Paràmetre/Indicador</th>
                <th rowspan="2" class="doubletd">Punt Monitoratge</th>
                <th rowspan="2" class="doubletd">Freqüència</th>
                <th rowspan="2" class="doubletd3">
                    Mètode(s)
                </th>
              </tr>
              <tr />

              <template v-for="tractament of array_tractaments">
                <tr :key="((Math.random() + 1).toString(36).substring(7))+tractament+'_tab_mon_trac'">
                  <td :rowspan="Object.keys(info_monitoratge[tractament]).filter(key => info_monitoratge[tractament][key].llocs.length && (ind_to_code[key] ? indicadors_seleccionats[ind_to_code[key]] : true)).length+1" class="doubletd12"><div style="height:200px;overflow:hidden"><div :ref="tractament+'_ini_graph'" /></div></td>
                </tr>
                <tr v-for="parameter in Object.keys(info_monitoratge[tractament]).filter(key => info_monitoratge[tractament][key].llocs.length && (ind_to_code[key] ? indicadors_seleccionats[ind_to_code[key]] : true))" :key="((Math.random() + 1).toString(36).substring(7))+parameter+'_tab_rec_'+tractament" style="height: 40px;">
                  <td>
                    <div v-html="info_rich[parameter] || parameter" style="padding: 2px;" />
                    <div v-if="parameter === 'N-nitrosodimetilamina (NDMA)'" class="tooltip" :key="key+'_helper'">
                      <i class="fa-regular fa-circle-question"></i>
                      <span class="tooltiptext2">
                        La N-nitrosodimetilamina es pot formar en tractaments de desinfecció amb cloramines, amb clor si al medi també hi ha amoni, i en tractaments amb ozó.</span>
                    </div>
                    <div v-else-if="parameter === 'Triclorometà'" class="tooltip" :key="key+'_helper'">
                      <i class="fa-regular fa-circle-question"></i>
                      <span class="tooltiptext2">
                        El Triclorometà es pot formar en tractaments de desinfecció amb clor lliure.</span>
                    </div>
                  </td>
                  <td><div style="height:30px;overflow:hidden"><div :ref="'punts_'+tractament+'_'+parameter" /></div></td>
                  <td style="padding: 2px;"><div v-html="getFrequencia(tractament,parameter)"></div></td>
                  <td style="padding: 2px;">
                      <div v-for="metode, ind in metodes_info[tractament][parameter]" :key="'_'+parameter+'_'+tractament+'_freq_'+ind">
                        <div style="position: relative; display: inline-block;" v-html="getMetodeHtml(metode, ind+1)"></div>
                        <div v-if="mostrar_abreviacio(metode)" class="tooltip">
                            <i class="fa-regular fa-circle-question"></i>
                            <span :key="((Math.random() + 1).toString(36).substring(7))" class="tooltiptext">{{mostra_abreviacio(metode)}}</span>
                        </div>
                       </div>
                  </td>
                </tr>
              </template>
            </table>
        </div>
      </div>
      <div v-if="visio_monitoratge === 1 && usos_seleccionats.length">
          <p><b>Indicadors químics:</b> El quocient de risc (QR) i la freqüència de monitoratge es calculen en funció dels valors objectius de qualitat (VP) introduïts en la primera fase.</p>
          <div class='my-legend'>
            <div class='legend-scale'>
            <ul class='legend-labels'>
                <li>
                    <span class="color" style='background:#baffc9;'></span>
                    <span class="legend" style='width:65px;'>VP assolit</span>
                    <span class="color" style='background:#ffdfba;'></span>
                    <span class="legend">VP no assolit (no regulat)</span>
                    <span class="color" style='background:#ffb3ba;'></span>
                    <span class="legend">VP no assolit (regulat)</span>
                </li>
            </ul>
            </div>
          </div>
          <div class="sticky">
            <table class="sticky extraborder" border="1">
              <tr>
                <th rowspan="2" class="doubletd">Paràmetre/Indicador</th>
                <th rowspan="2" class="smalltd">Punt Monitoratge</th>
                <th rowspan="2" class="smalltd2">QR</th>
                <th rowspan="2" class="doubletd3">Freqüència</th>
                <th rowspan="2" class="doubletd3">
                    Mètode(s)
                </th>
              </tr>
              <tr />
              <template v-for="indicador in indicadors_qualitat">
                  <tr :key="indicador+'_q_aigua_1'" style="height: 14px;">
                      <td>
                          <div v-html="info_indicadors[indicador].name_rich" />
                      </td>
                      <td class="smalltd"><div style="height:30px;overflow:hidden" class="smalltd">
                          <div class="smalltd" :ref="'punts_qualitat_'+indicador" /></div>
                      </td>
                      <td :style="'text-align: center; background: '+getColor(indicador)+';'">{{indicador_punt_freq &&  indicador_punt_freq[indicador] ? indicador_punt_freq[indicador].qr || '--' : '--'}}</td>
                      <td><div v-html="indicador_punt_freq && indicador_punt_freq[indicador] ? indicador_punt_freq[indicador].freq : ''"></div></td>
                      <td>
                          <div v-for="metode, ind in metodes_qualitat[mon_code_to_ind[indicador]]" :key="'_'+ind+'_freq_qual'">
                            <div style="position: relative; display: inline-block;" v-html="getMetodeHtml(metode, ind+1)"></div>
                            <div v-if="mostrar_abreviacio(metode)" class="tooltip">
                                <i class="fa-regular fa-circle-question"></i>
                                <span :key="((Math.random() + 1).toString(36).substring(7))" class="tooltiptext">{{mostra_abreviacio(metode)}}</span>
                            </div>
                          </div>
                      </td>
                  </tr>
              </template>
            </table>
          </div>
      </div>
      <div v-else-if="visio_monitoratge === 1">
          <p><i style="color:red">Cal seleccionar primer els usos d'aigua regenerada per a poder veure la taula del monitoratge de la qualitat de l'aigua.</i></p>
      </div>
  </div>
</template>
<script>

import * as joint from 'jointjs';
window.joint = joint;

export default {
  name: "Monitoratge",
  props: ["tren_monitoratge","tractament_secundari","info_monitoratge",'info_rich','metodes_monitoratge','indicadors_seleccionats','ind_to_code','abreviacions_met_mon','info_indicadors','tractaments_info','user','usos_seleccionats','mon_per_ind_quim','capacitat','mon_code_to_ind'],
  data: function(){
    return {
      visio_monitoratge: 0,    //Variable que indica la visió activa de l'apartat monitoratge.
      array_tractaments: []    //Array dels tractaments.
    }
  },
  watch: {
    //cada vegada que canviin les props del tren, computar el graph. 
    tren_monitoratge: function(newVal, oldVal) {
        this.render_graph();
    },
    tractament_secundari: function(newVal, oldVal) {
        this.render_graph();
    },
    array_tractaments: function(newVal, oldVal) {
        const _this = this;
        _this.$nextTick(function () {
            if(_this.visio_monitoratge === 0) _this.render_diagrama_tractament();
            else if(_this.visio_monitoratge === 1) _this.render_diagrama_qualitat();
        })   
    },
    // crea l'usuari un cop es tingui informació dels indicadors.
    indicadors_seleccionats: {
        handler: function(newVal, oldVal) {
            const _this = this;
            _this.$nextTick(function () {
                if(_this.visio_monitoratge === 0) _this.render_diagrama_tractament();
                else if(_this.visio_monitoratge === 1) _this.render_diagrama_qualitat();
            });   
        },
        deep: true 
    },
    visio_monitoratge: {
        handler: function(newVal, oldVal) {
            const _this = this;
            _this.$nextTick(function () {
                if(_this.visio_monitoratge === 0) _this.render_diagrama_tractament();
                else if(_this.visio_monitoratge === 1) _this.render_diagrama_qualitat();
            });   
        },
        deep: true 
    },
  },
  mounted() {
    let vm = this;      

    vm.$nextTick(function () {      
        vm.render_graph();
    });
  },
  computed: {
    // Indicadors que cal monitorar la qualitat de l'aigua.
    indicadors_qualitat: function(){
        const _this = this;
        const indicadors = Object.keys(_this.info_indicadors).filter(indicador => indicador !== 'I4' && (indicador === 'I1' || (Object.keys(_this.indicadors_seleccionats).includes(indicador) ? _this.indicadors_seleccionats[indicador] : true))); 
        let triclorometa = false;
        let NDMA = false;
        for(let tractament of _this.tren_monitoratge.array_tractaments){
            if(tractament.includes("FAC_DS")) tractament = _this.tractament_secundari;
            if(tractament.includes("BRM")) tractament = _this.tractament_secundari;

            if(_this.info_monitoratge[tractament]['Triclorometà']) triclorometa = true;
            if(_this.info_monitoratge[tractament]['N-nitrosodimetilamina (NDMA)']) NDMA = true;
        }
        return indicadors.filter(indicador => {
            if(indicador === 'OT1' && !NDMA) return false;
            else if(indicador === 'OT2' && !triclorometa) return false;
            else return true;
        });
    },
    // Diccionari que conté la freqüència per a cada indicador i punt.
    indicador_punt_freq: function() {
        const _this = this;
        const dict_freq = {};
        const array_tractaments = _this.tren_monitoratge['array_tractaments'];
        const min_max = _this.user.corrent.aplica_tren_tractaments(_this.info_indicadors, array_tractaments, _this.tractaments_info, _this.tractament_secundari,_this.tren_monitoratge.codi);
        for(const indicador of _this.indicadors_qualitat){
            dict_freq[indicador] = {};
            const full_indicador = _this.info_indicadors[indicador];
            if(full_indicador.type.startsWith("1.1. ")){
                if(indicador === "I5") dict_freq[indicador].freq = "Continu o periòdic";
                else dict_freq[indicador].freq = "Continu";
                if(indicador !== "I1" && indicador !== "Cabal"){
                    const concentracio = min_max.max.qualitat[indicador];
                    const VP = _this.user.corrent_objectiu.qualitat[indicador];
                    const QRs = concentracio / VP;
                    const QR = QRs;
                    dict_freq[indicador].qr = isNaN(QR) ? '--' : QR.toExponential(1);
                    dict_freq[indicador].regulat = _this.user.corrent_objectiu.regulat[indicador];
                }
            }
            else if(full_indicador.type.startsWith("2.")){
                if(full_indicador.type.startsWith("2.4.")) dict_freq[indicador].freq = 'Periòdic en funció del QR';
                else{
                    const concentracio = min_max.max.qualitat[indicador];
                    const VP = _this.user.corrent_objectiu.qualitat[indicador];
                    const QRs = concentracio / VP;
                    //const QRe = QRs / (1-min_max.max.eliminacio[indicador]);
                    const QR = QRs;
                    dict_freq[indicador].qr = isNaN(QR) ? '--' : QR.toExponential(1);
                    const tipus_vp = Number(_this.user.corrent_objectiu.tipus_vp[indicador]);
                    dict_freq[indicador].regulat = _this.user.corrent_objectiu.regulat[indicador];

                    // Depenent del rang i del QR obtingut, es posa el resultat que toca.
                    for(const rang of _this.mon_per_ind_quim[tipus_vp]){
                        if(rang.mes_gran && !rang.mes_petit){
                            if(QR > rang.mes_gran){
                                dict_freq[indicador].freq = full_indicador.type.startsWith("2.1.") ? rang.text_nutrients : rang.text;
                                dict_freq[indicador].ref = rang.ref;
                            }
                        }
                        else if(rang.mes_gran && rang.mes_petit){
                            if(QR > rang.mes_gran && QR < rang.mes_petit){
                                dict_freq[indicador].freq = full_indicador.type.startsWith("2.1.") ? rang.text_nutrients : rang.text;
                                dict_freq[indicador].ref = rang.ref;
                            }
                        }
                        else{
                            if(QR < rang.mes_petit){
                                dict_freq[indicador].freq = full_indicador.type.startsWith("2.1.") ? rang.text_nutrients : rang.text;
                                dict_freq[indicador].ref = rang.ref;
                            }
                        }
                    }
                    // En el cas de no trobar coincidència.
                    if(!dict_freq[indicador].freq) dict_freq[indicador].freq = '<i style="color:red">No definida</i>';
                    // Afegir la referència (si té).
                    else if(dict_freq[indicador].ref) dict_freq[indicador].freq += " (<i><u>" + dict_freq[indicador].ref + "</u></i>)";

                    // En cas que sigui en funció de l'aigua produïda.
                    if(dict_freq[indicador].freq.includes("segons el volum d'aigua produïda")){
                        let extra_info = ". Nombre anual de mostres requerides: ";
                        if(_this.capacitat < 10) extra_info += "1.";
                        else if(_this.capacitat <= 100) extra_info += "2.";
                        else if(_this.capacitat <= 1000) extra_info += "4.";
                        else{
                            // Equació 12 (veure taula C4).
                            const n = 4 + (3*Math.ceil((_this.capacitat-1000)/1000));
                            extra_info += n.toString()+".";
                        }
                        dict_freq[indicador].freq += extra_info;
                    }
                }

            }
            else dict_freq[indicador].freq = '<i style="color:red">No definida</i>';
        }
        return dict_freq;
    },
    // Variable que conté el nombre de punts de mostreig necessaris per a cada indicador.
    punts_qualitat: function() {
        const _this = this;
        const qualitat = {}
        for(const indicador of _this.indicadors_qualitat){
            const type = _this.info_indicadors[indicador].type;
            if(indicador === 'Cabal') qualitat[indicador] = ['entrada1','entrada2','sortida'];
            else if(type.includes("1.1. ") || type.includes("2.1. ") || type.includes("2.2. ") || type.includes("2.3. ")){
                // Monitoratge continu, Nutrients, Metalls, Compostos orgànics.
                qualitat[indicador] = ['entrada2','sortida'];
            }
            else if(type.includes("2.4. ")){
                // Productes d'oxidació.
                qualitat[indicador] = ['sortida'];
            }
            else if(type.includes("3. ")){
                // Indicadors microbiològics.
                qualitat[indicador] = ['entrada1','sortida'];
            }
            else qualitat[indicador] = [];
        }
        return qualitat;
    },
    // Variable que indica el llistat de mètodes per a la qualitat de l'aigua per a cada indicador.
    metodes_qualitat: function(){
        const _this = this;
        const metodes_qualitat = {};
        for(const [parametre,metodes] of Object.entries(_this.metodes_monitoratge)){
            const metodes_array = [];
            for(const metodes_freq_array of Object.values(metodes)){
                for(const metode of metodes_freq_array){
                    metodes_array.push(metode);
                }
            }
            metodes_qualitat[parametre] = metodes_array;
        }
        return metodes_qualitat;
    },
    // Variable que conté la informació dels mètodes per cada indicador de cada tractament.
    metodes_info: function () {
        const _this = this;
        const metodes = {};
        for(const tractament of _this.array_tractaments){
            metodes[tractament] = {};
            for(const parameter of Object.keys(_this.info_monitoratge[tractament]).filter(key => _this.info_monitoratge[tractament][key].llocs.length && (_this.ind_to_code[key] ? _this.indicadors_seleccionats[_this.ind_to_code[key]] : true))){
                console.log(parameter)
                metodes[tractament][parameter] = [];
                let frequencia = _this.info_monitoratge[tractament][parameter].frequencia;
                if(frequencia && _this.metodes_monitoratge[parameter]){
                    frequencia = frequencia.replace(/ *\([^)]*\) */g, "");
                    const values = _this.metodes_monitoratge[parameter][frequencia];
                    if(values){
                        for(const value of values){
                            metodes[tractament][parameter].push(value);
                        }
                    }
                    else if(frequencia === 'Continu o periòdic'){
                        const alt_values = _this.metodes_monitoratge[parameter]['Continu'] || _this.metodes_monitoratge[parameter]['Periòdic']
                        if(alt_values){
                            for(const value of alt_values){
                                metodes[tractament][parameter].push(value);
                            }
                        }
                        else metodes[tractament][parameter].push(undefined);
                    }
                    else metodes[tractament][parameter].push(undefined);
                }
                else metodes[tractament][parameter].push(undefined);
            }
        }
        return metodes;
    }
  },
  methods: {
    canviVisio(event){
        let _this = this;
		    if(event.target.id === 'monitoratge_tractaments') _this.visio_monitoratge = 0;
        else if(event.target.id === 'monitoratge_qualitats') _this.visio_monitoratge = 1;
    },
    getColor(indicador){
        const _this = this;
        if(_this.indicador_punt_freq && _this.indicador_punt_freq[indicador] && _this.indicador_punt_freq[indicador].qr){
            if(_this.indicador_punt_freq[indicador].qr === '--') return '#ffffff';
            if(_this.indicador_punt_freq[indicador].qr > 1){
                if(_this.indicador_punt_freq[indicador].regulat) return '#ffb3ba';
                else return '#ffdfba';
            }
            else return '#baffc9';
        }
        else return '#ffffff';
    },
    render_graph() {
        // Dibuixa el diagrama.
        const vm = this; 

        // Calcula l'array de tractaments complet.
        const array_tractaments = ['DP'];
        if (vm.tractament_secundari !== 'DP') array_tractaments.push(vm.tractament_secundari);
        for(const tractament of vm.tren_monitoratge.array_tractaments){
            if(!vm.tractament_secundari.includes('BRM') || tractament !== "BRM") array_tractaments.push(tractament)
        }
        vm.array_tractaments = array_tractaments.map(tractament => tractament === 'BRM' ? 'BRM1' : tractament);

        const namespace = joint.shapes;

        const graph = new joint.dia.Graph({}, { cellNamespace: namespace });

        const paper = new joint.dia.Paper({
            el: document.getElementById('graph'),
            model: graph,
            gridSize: 1,
            width: 1500,
            height: 130,
            interactive: false,
            cellViewNamespace: namespace
        });

        // Crea un rectangle de referència
        const rect = new joint.shapes.standard.Rectangle();
        rect.position(0, 30);
        rect.resize(100, 40);
        rect.attr({
            body: {
                fill: '#4472c4'
            },
            label: {
                fill: 'white'
            }
        });

        // Crea el primer rectangle (buit).
        const rect_inicial = rect.clone();
        rect_inicial.resize(10,40);
        rect_inicial.attr('label/text', '');
        rect_inicial.attr('body/strokeWidth', 0);
        rect_inicial.attr('body/fill', '#eff5fb');
        rect_inicial.addTo(graph);

        // Crea el primer punt de monitoratge.
        let circle_count = 1;
        const primer_circle = new joint.shapes.standard.Circle();
        primer_circle.position(17,60);
        primer_circle.resize(25,25);
        primer_circle.attr('label/text', circle_count);
        primer_circle.attr('label/fill', 'white');
        primer_circle.attr('body/strokeWidth', 1);
        primer_circle.attr('body/fill', '#4472c4');
        primer_circle.addTo(graph);
        circle_count += 1;

        // Crea el primer punt de monitoratge d'entrades/sortides.
        let rombe_count = 1;
        let rombe_offset = 0;
        const primer_rombe = new joint.shapes.standard.Polygon();
        primer_rombe.position(14,15);
        primer_rombe.resize(30,30);
        primer_rombe.attr('body/refPoints', '0,10 10,0 20,10 10,20');
        primer_rombe.attr('label/text', rombe_count);
        primer_rombe.attr('label/fill', 'white');
        primer_rombe.attr('body/strokeWidth', 1);
        primer_rombe.attr('body/fill', '#6e95db');
        primer_rombe.addTo(graph);
        rombe_count += 1;

        // Si hi ha tractament secundari o no, posa el segon rombe on toqui.
        const segon_rombe = primer_rombe.clone();
        segon_rombe.attr('label/text', rombe_count);
        segon_rombe.translate(vm.tractament_secundari === 'DP' ? 130 : 260, 0)
        segon_rombe.addTo(graph);
        rombe_count += 1;

        // Crea la cadena de rectangles.
        let pre_rect = rect_inicial;
        let pre_circle = primer_circle;
        let primer = true;
        for(const tractament of array_tractaments){
          // Circle de monitoratge.
          const new_circle = pre_circle.clone();
          new_circle.translate(130, 0);
          new_circle.attr('label/text', circle_count);
          new_circle.addTo(graph);
          circle_count += 1;
          pre_circle = new_circle;

          // Següent tractament.
          const new_rect = pre_rect.clone();
          new_rect.attr('label/text', tractament);
          new_rect.resize(90,40);
          new_rect.attr('body/strokeWidth', 2);
          new_rect.attr('body/fill', '#4472c4');
          new_rect.translate(primer ? 50 : 130, 0);
          new_rect.addTo(graph);
          const link = new joint.shapes.standard.Link();
          link.source(pre_rect);
          link.target(new_rect);
          link.addTo(graph);
          primer = false;
          pre_rect = new_rect;
          rombe_offset += 130;
        }

        // Crea punt monitoratge sortida.
        const last_rombe = primer_rombe.clone();
        last_rombe.attr('label/text', rombe_count);
        last_rombe.translate(rombe_offset <= 260 ? rombe_offset+32 : rombe_offset, 0)
        last_rombe.addTo(graph);

        // Crea últim rectangle (buit).
        const last_rect = pre_rect.clone();
        last_rect.attr('label/text', '');
        last_rect.attr('body/strokeWidth', 0);
        last_rect.attr('body/fill', '#eff5fb');
        last_rect.translate(130, 0);
        last_rect.addTo(graph);
        const link = new joint.shapes.standard.Link();
        link.source(pre_rect);
        link.target(last_rect);
        link.addTo(graph);
        pre_rect = last_rect;

    },
    getFrequencia: function(tractament,parameter) {
        return this.info_monitoratge[tractament][parameter].frequencia || '<i style="color:red">No definida</i>'
    },
    getMetodeHtml: function(metode, ind){
        if(!metode) return '<i style="color:red">No definit</i>';
        let value_res = metode.desc_enriquit;
        if(metode.ref_enriquit !== "nd"){
            value_res += " ("+metode.ref_enriquit;
            if(metode.type === 2) value_res += "; <i><u>Mètode estàndard</u></i>)";
            else if(metode.type === 1) value_res += "; <i><u>Mètode desenvolupat no estàndard</u></i>)";
            else value_res += ")";
        }
        return '<b>'+ind+'.</b> '+value_res;
    },
    mostrar_abreviacio: function(metode) {
      if(!metode || !metode.desc_enriquit) return false; 
        for(const [abreviacio,desc] of Object.entries(this.abreviacions_met_mon)){
          if(metode.desc_enriquit.includes(abreviacio)) return true;
        }
        return false;
    },
    mostra_abreviacio: function(metode) {
        for(const [abreviacio,desc] of Object.entries(this.abreviacions_met_mon)){
          if(metode.desc_enriquit.includes(abreviacio)){
            return abreviacio+': '+desc;
          }
        }
        return '';
    },
    render_diagrama_qualitat: function(){
        const _this = this;
        for(const indicador of _this.indicadors_qualitat){
            
            const doc = _this.$refs['punts_qualitat_'+indicador];
            const namespace = joint.shapes;
            const graph = new joint.dia.Graph({}, { cellNamespace: namespace });
            const paper = new joint.dia.Paper({
                el: doc,
                model: graph,
                gridSize: 1,
                width: 150,
                heigth: 30,
                interactive: false,
                restrictTranslate: true,
                cellViewNamespace: namespace
            });

            // Crea el primer rombe de referència.
            let translate = 0;
            const rombe = new joint.shapes.standard.Polygon();
            const n_punts = _this.punts_qualitat[indicador].length;
            rombe.position(n_punts === 3 ? 12 : n_punts === 2 ? 26 : 40, 2);
            rombe.resize(25,25);
            rombe.attr('body/refPoints', '0,10 10,0 20,10 10,20');
            rombe.attr('label/text', _this.punts_qualitat[indicador][0] === "entrada1" ? '1' : _this.punts_qualitat[indicador][0] === "entrada2" ? '2' : '3');
            rombe.attr('label/fill', 'white');
            rombe.attr('body/strokeWidth', 1);
            rombe.attr('body/fill', '#6e95db');
            for(const punt of _this.punts_qualitat[indicador]){
                const rombe_to_add = rombe.clone(rombe);
                rombe_to_add.attr('label/text', punt === "entrada1" ? '1' : punt === "entrada2" ? '2' : '3');
                rombe_to_add.translate(translate,0);
                rombe_to_add.addTo(graph);
                translate += 30;
            }
            
        }
    },
    render_diagrama_tractament: function(){
      const _this = this;
      // Dibuixar graph per cada tractament.
      let monitor_counter = 1;
      for(const tractament of _this.array_tractaments){
          
          const doc = _this.$refs[tractament+'_ini_graph'];
          const namespace = joint.shapes;
          const graph = new joint.dia.Graph({}, { cellNamespace: namespace });
          const paper = new joint.dia.Paper({
              el: doc,
              model: graph,
              gridSize: 1,
              width: 200,
              heigth: 60,
              interactive: false,
              restrictTranslate: true,
              cellViewNamespace: namespace
          });

          // Crea el primer link.
          const rect_init = new joint.shapes.standard.Rectangle();
          rect_init.position(0, 5);
          rect_init.resize(10,40);
          rect_init.attr('label/text', '');
          rect_init.attr('body/strokeWidth', 0);
          rect_init.attr('body/fill', '#eff5fb');
          rect_init.addTo(graph);

          const rect = new joint.shapes.standard.Rectangle();
          rect.position(50, 5);
          rect.resize(100, 40);
          rect.attr({
              body: {
                  fill: '#4472c4'
              },
              label: {
                  fill: 'white'
              }
          });
          rect.attr('label/text', _this.info_rich[tractament]);
          rect.addTo(graph);

          let link = new joint.shapes.standard.Link();
          link.source(rect_init);
          link.target(rect);
          link.addTo(graph);

          const rect_final = rect_init.clone();
          rect_final.translate(190,0);
          rect_final.addTo(graph);
          link = new joint.shapes.standard.Link();
          link.source(rect);
          link.target(rect_final);
          link.addTo(graph);

          const primer_circle = new joint.shapes.standard.Circle();
          primer_circle.position(15,35);
          primer_circle.resize(25,25);
          primer_circle.attr('label/text', monitor_counter);
          primer_circle.attr('label/fill', 'white');
          primer_circle.attr('body/strokeWidth', 1);
          primer_circle.attr('body/fill', '#4472c4');
          primer_circle.addTo(graph);

          const segon_circle = primer_circle.clone();
          segon_circle.translate(145,0);
          segon_circle.attr('label/text', monitor_counter+1);
          segon_circle.addTo(graph);

          monitor_counter += 1;

          // Per a cada indicador renderitza els punts de mostreig.
          for(const indicador of Object.keys(_this.info_monitoratge[tractament])){
            if(_this.ind_to_code[indicador] ? _this.indicadors_seleccionats[_this.ind_to_code[indicador]] : true) _this.render_punt(indicador, tractament);
          }
      }
    },
    render_punt: function(indicador, tractament){
      const _this = this;

      // Primer crea el diagrama.
      const doc = _this.$refs['punts_'+tractament+'_'+indicador];
      const namespace = joint.shapes;
      const graph = new joint.dia.Graph({}, { cellNamespace: namespace });
      const paper = new joint.dia.Paper({
          el: doc,
          model: graph,
          gridSize: 1,
          width: 150,
          heigth: 30,
          interactive: false,
          restrictTranslate: true,
          cellViewNamespace: namespace
      });

      // Ara mirar quins elements cal afegir.
      let translate = 0;
      const pos_tractament = _this.array_tractaments.indexOf(tractament)+1;
      for(const element of _this.info_monitoratge[tractament][indicador].llocs){
        if(element === 'Entrada' || element === 'Sortida' ){
          // Crea bombolla d'entrada.
          const circle = new joint.shapes.standard.Circle();
          circle.position(2,2);
          circle.resize(25,25);
          circle.translate(translate,0);
          circle.attr('label/text', element === 'Entrada' ? pos_tractament : (pos_tractament+1));
          circle.attr('label/fill', 'white');
          circle.attr('body/strokeWidth', 1);
          circle.attr('body/fill', '#4472c4');
          circle.addTo(graph);

          // Detecta si cal dibuixar una creu.
          let duplicated = false;
          if(element === 'Entrada' && pos_tractament > 1){
            const tractament_previ = _this.array_tractaments[pos_tractament-2];
            if(_this.info_monitoratge[tractament_previ][indicador] && _this.info_monitoratge[tractament_previ][indicador].llocs.includes('Sortida')){
              duplicated = true;
            }
          }
          if(duplicated){
            const bar = new joint.shapes.standard.Rectangle();
            bar.position(2, 12.5);
            bar.resize(25, 1);
            bar.rotate(45);
            bar.addTo(graph);
            const bar2 = bar.clone();
            bar2.rotate(90);
            bar2.addTo(graph);
          }

          translate += 30;
        }
        else if(element === 'Tractament'){
          const rect = new joint.shapes.standard.Rectangle();
          rect.position(2, 2);
          rect.resize(70, 25);
          rect.translate(translate,0);
          rect.attr({
              body: {
                  fill: '#4472c4'
              },
              label: {
                  fill: 'white'
              }
          });
          rect.attr('label/text', _this.info_rich[tractament]);
          rect.addTo(graph);
          translate += 75;
        }
      }
    }
  }
};
</script>
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
          :id="'monitoratge_qualitat'"
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
                    <div class="tooltip">
                        <i class="fa-regular fa-circle-question"></i>
                        <span class="tooltiptext">Al passar el cursor per sobre dels mètodes, es mostrarà informació sobre si els mètodes són estàndard o desenvolupats.</span>
                    </div>
                </th>
              </tr>
              <tr />

              <template v-for="tractament of array_tractaments">
                <tr :key="((Math.random() + 1).toString(36).substring(7))+tractament+'_tab_mon_trac'">
                  <td :rowspan="Object.keys(info_monitoratge[tractament]).filter(key => info_monitoratge[tractament][key].llocs.length).length+1" class="doubletd12"><div style="height:200px;overflow:hidden"><div :ref="tractament+'_ini_graph'" /></div></td>
                </tr>
                <tr v-for="parameter in Object.keys(info_monitoratge[tractament]).filter(key => info_monitoratge[tractament][key].llocs.length)" :key="((Math.random() + 1).toString(36).substring(7))+parameter+'_tab_rec_'+tractament" style="height: 40px;">
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
                      <div class="tooltip" style="color:#2c3e50">
                        <div v-html="getMetodes(tractament,parameter)"></div>
                        <span v-if="mostrar_estandard(tractament,parameter)" :key="((Math.random() + 1).toString(36).substring(7))" class="tooltiptext">{{ mostra_estandard(tractament,parameter) }}</span>
                      </div>
                  </td>
                </tr>
              </template>
            </table>
        </div>
      </div>
      <div v-if="this.visio_monitoratge === 1">
      </div>
  </div>
</template>
<script>

import * as joint from 'jointjs';
window.joint = joint;

export default {
  name: "Monitoratge",
  props: ["tren_monitoratge","tractament_secundari","info_monitoratge",'info_rich','metodes_monitoratge'],
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
            _this.render_diagrama_tractament();
        })   
    }
  },
  mounted() {
    let vm = this;      

    vm.$nextTick(function () {      
        vm.render_graph();
    });
  },
  methods: {
    canviVisio(event){
        let _this = this;
		    if(event.target.id === 'monitoratge_tractaments') _this.visio_monitoratge = 0;
        else if(event.target.id === 'monitoratge_qualitats') _this.visio_monitoratge = 1;
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
        vm.array_tractaments = array_tractaments;

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
        last_rombe.translate(rombe_offset, 0)
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
    getMetodes: function(tractament,parameter) {
        let frequencia = this.info_monitoratge[tractament][parameter].frequencia;
        if(!frequencia || !this.metodes_monitoratge[parameter]) return '<i style="color:red">No definit</i>';
        frequencia = frequencia.replace(/ *\([^)]*\) */g, "");
        const values = this.metodes_monitoratge[parameter][frequencia];
        if(values){
          let i = 1;
          let res = "";
          for(const value of values){
            let value_res = value.desc_enriquit;
            if(value.ref_enriquit !== "nd") value_res += " ("+value.ref_enriquit+")";
            res += '<b>'+i+'.</b> '+value_res+'<br>';
            i+=1;
          }
          return res;
        }
        else if(frequencia === 'Continu o periòdic'){
          const alt_values = this.metodes_monitoratge[parameter]['Continu'] || this.metodes_monitoratge[parameter]['Periòdic']
          if(alt_values){
            let i = 1;
            let res = "";
            for(const value of alt_values){
              let value_res = value.desc_enriquit;
              if(value.ref_enriquit !== "nd") value_res += " ("+value.ref_enriquit+")";
              res += '<b>'+i+'.</b> '+value_res+'<br>';
              i+=1;
            }
            return res;
          }
        }
        return '<i style="color:red">No definit</i>';
    },
    mostrar_estandard: function(tractament,parameter) {
        let frequencia = this.info_monitoratge[tractament][parameter].frequencia;
        if(!frequencia || !this.metodes_monitoratge[parameter]) return false;
        frequencia = frequencia.replace(/ *\([^)]*\) */g, "");
        const values = this.metodes_monitoratge[parameter][frequencia];
        if(values){
          for(const value of values){
            if(value.type === 2 || value.type === 1) return true;
          }
        }
        return false;
    },
    mostra_estandard: function(tractament,parameter) {
        const frequencia = this.info_monitoratge[tractament][parameter].frequencia.replace(/ *\([^)]*\) */g, "");
        const values = this.metodes_monitoratge[parameter][frequencia];
        if(values){
          let i = 1;
          let res = "";
          for(const value of values){
            if(value.type === 2) res+= i+'. Mètode estàndard; ';
            else if(value.type === 1) res+= i+'. Mètode desenvolupat no estàndard; ';
            else res+= i+'. No definit; '
            i+=1;
          }
          return res;
        }
        return "";
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
            _this.render_punt(indicador, tractament);
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
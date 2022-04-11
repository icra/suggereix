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
        <div>
            <table border="1">
              <tr>
                <th rowspan="2" class="doubletd">Tractament</th>
                <th rowspan="2" class="doubletd">Paràmetre/Indicador</th>
                <th rowspan="2" class="doubletd">Punt Monitoratge</th>
                <th rowspan="2" class="doubletd">Freqüència</th>
                <th rowspan="2" class="doubletd">Mètode</th>
              </tr>
              <tr />

              <template v-for="tractament of array_tractaments">
                <tr :key="tractament+'_tab_mon_trac'">
                  <td>{{tractament}}</td>
                  <td>{{tractament}}</td>
                  <td>{{tractament}}</td>
                  <td>{{tractament}}</td>
                  <td>{{tractament}}</td>
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
  props: ["tren_monitoratge","tractament_secundari"],
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

    }
  }
};
</script>
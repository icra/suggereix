<template>
  <div>
      <br>
      <br>
      <div id="graph" style="width:100px" />
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
    render_graph() {
        // Dibuixa el diagrama.
        const vm = this; 

        // Calcula l'array de tractaments complet.
        const array_tractaments = ['DP'];
        if (vm.tractament_secundari !== 'DP') array_tractaments.push(vm.tractament_secundari);
        for(const tractament of vm.tren_monitoratge.array_tractaments){
            if(!vm.tractament_secundari.includes('BRM') || tractament !== "BRM") array_tractaments.push(tractament)
        }

        const namespace = joint.shapes;

        const graph = new joint.dia.Graph({}, { cellNamespace: namespace });

        const paper = new joint.dia.Paper({
            el: document.getElementById('graph'),
            model: graph,
            gridSize: 1,
            width: 1500,
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
        rect_inicial.attr('body/fill', 'rgba(255, 255, 255, .4)');
        rect_inicial.addTo(graph);

        // Crea la cadena de rectangles.
        let pre_rect = rect_inicial;
        let primer = true;
        for(const tractament of array_tractaments){
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
        }

        // Crea últim rectangle (buit).
        const last_rect = pre_rect.clone();
        last_rect.attr('label/text', '');
        last_rect.attr('body/strokeWidth', 0);
        last_rect.attr('body/fill', 'rgba(255, 255, 255, .4)');
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
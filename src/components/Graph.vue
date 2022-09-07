<template>
  <canvas id="multicriteri_chart" width="700" height="700"></canvas>
</template>
<script>

import Chart from 'chart.js/auto';
import {obtenirDadesGraphMulticriteri} from "../utils/multicriteri";

export default {
  name: "Graph",
  props: ["trens_multicriteris","trens_info"],
  data: function(){
    return {
        ctx_chart: undefined
    }
  },
  watch: { 
    trens_multicriteris: function(newVal, oldVal) { // watch it
        let vm = this;  
        vm.render_graph();
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
        let vm = this;    
        const ctx = document.getElementById('multicriteri_chart');
        if(ctx){
            const config = {
                type: 'radar',
                data: obtenirDadesGraphMulticriteri(vm.trens_multicriteris.filter(tren => tren.avaluar), vm.trens_info),
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    elements: {
                        line: {
                            borderWidth: 3
                        }
                    }
                },
            };
            if(vm.ctx_chart) vm.ctx_chart.destroy();
            vm.ctx_chart = new Chart(ctx, config);

            setTimeout(() => {
                vm.$emit('sendPng', document.getElementById('multicriteri_chart').toDataURL());
            }, 100);
        }
    }
  }
};
</script>
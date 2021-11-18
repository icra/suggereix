<template>
  <canvas id="multicriteri_chart" width="600" height="600"></canvas>
</template>
<script>

import Chart from 'chart.js/auto';
import {obtenirDadesGraphMulticriteri} from "../utils/multicriteri";

export default {
  name: "Graph",
  props: ["trens_multicriteris","trens_info"],
  mounted() {
    let vm = this;      

    vm.$nextTick(function () {      
        // Dibuixa el diagrama.
        const ctx = document.getElementById('multicriteri_chart');
        if(ctx){
            const config = {
                type: 'radar',
                data: obtenirDadesGraphMulticriteri(vm.trens_multicriteris, vm.trens_info),
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
            const myChart = new Chart(ctx, config);
        }
    });
  }
};
</script>
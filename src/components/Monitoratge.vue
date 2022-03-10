<template>
  <div id="graph" style="width:100px" />
</template>
<script>

import ForceGraph from 'force-graph';

export default {
  name: "Monitoratge",
  props: [],
  data: function(){
    return {
        
    }
  },
  watch: {
      
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
        const N = 10;
        const gData = {
        nodes: [{id:1},{id:2},{id:3},{id:4}],
        links: [{source:1,target:2},{source:2,target:3},{source:3,target:4}]
        };

        const Graph = ForceGraph()
        (document.getElementById('graph'))
            .linkDirectionalParticles(2)
            .graphData(gData)
        }
  }
};
</script>
<template>

  <div id='intro'>
    <details class=seccio open>
      <summary class=seccio>1. Definició aigua</summary>
      <div>
        <table border=1>
          <tr>
            <th colspan="2">Capacitat tractament (m3/d):
              <input type="number" v-model.number="user.corrent.Q" style="max-width:75px">
            </th>
            <th colspan=2>Descripció infraestructura existent</th>
            <th>Ús d'aigua regenerada</th>
            <th rowspan=3>Unitat</th>
          </tr>

          <tr>
            <th colspan=2 rowspan="2">Indicadors de qualitat</th>
            <td colspan=2>
              Selecciona la infraestructura existent:
              <br>
              <select v-model="tractament_secundari" style="max-width:350px">
                <option v-for="(obj, key) in Usuari.info_tractaments_secundaris" :value="key" :key="key">
                  {{obj.nom}}
                  [{{key}}]
                </option>
              </select>
            </td>

            <td>
              <b>Selecciona l'ús (o usos) d'aigua regenerada:</b>
              <br>
              <template v-for="(obj,key) in Usos_info">
                <input type="checkbox" :id="key" :value="key" v-model="usos_seleccionats">
                <label :for="key">{{obj.nom}}</label>
                <br>
              </template>
            </td>
          </tr>

          <tr>
            <td style="text-align: right; padding-right: 20px">min</td>
            <td style="text-align: right; padding-right: 20px">max</td>
            <td style="text-align: right; padding-right: 20px">valors objectius de qualitat</td>
          </tr>

          <tr v-for="(val, key) in user.corrent.qualitat" :key="key">
            <td style="text-align: right; padding: 0px 10px 0px 10px">
              {{Corrent.info_qualitat[key].nom}}
            </td>
            <td style="font-family:monospace">
              {{key}}
            </td>
            <td v-if="key !== 'I22' && key !== 'I23'">
              <input v-if="key !== 'I1' && selected_input !== key+'_min'" type="text" :value="show_sc_not(user.corrent.qualitat[key].min)" :ref="key+'_min'" :id="key+'_min'" class="nd" @focus="focusChanged">
			  <input v-else type="number" v-model.number="user.corrent.qualitat[key].min" v-on:blur="handleBlur" />
            </td>
            <td v-if="key !== 'I22' && key !== 'I23'">
              <input v-if="key !== 'I1' && selected_input !== key+'_max'" type="text" :value="show_sc_not(user.corrent.qualitat[key].max)" :ref="key+'_max'" :id="key+'_max'" class="nd" @focus="focusChanged">
			  <input v-else type="number" v-model.number="user.corrent.qualitat[key].max" v-on:blur="handleBlur" />
            </td>
            <td v-else-if="key === 'I22'" colspan="2" class="doubletd">
              L’I22 (N-nitrosodimetilamina) es pot formar en tractaments de desinfecció amb cloramines, amb clor si al medi també hi ha amoni, i en tractaments amb ozó.
            </td>
            <td v-else colspan="2" class="doubletd">
              L’I23 (triclorometà) es pot formar en tractaments de desinfecció amb clor lliure.
            </td>
            <td style="text-align: right">
              <div v-if="mostrar_nota_vp(key)" class="tooltip">*
                <span class="tooltiptext">{{nota_rang_vp(key)}}</span>
              </div>
			  <input v-if="isNaN(user.corrent_objectiu.qualitat[key])" placeholder="nd" class="nd" disabled>
              <input v-else-if="key !== 'I1' && selected_input !== key+'_vp'" type="text" :value="show_sc_not(user.corrent_objectiu.qualitat[key])" :ref="key+'_vp'" :id="key+'_vp'" class="nd" @focus="focusChanged">
			  <input v-else type="number" v-model.number="user.corrent_objectiu.qualitat[key]" v-on:blur="handleBlur">
            </td>
            <td>
              {{Corrent.info_qualitat[key].unitat}}
            </td>
          </tr>
        </table>
      </div>
    </details>

    <details class=seccio open>
      <summary class=seccio>2. Avaluació trens de tractament</summary>
      <div style="text-align: left">
        <button @click="avaluacio_trens">Avaluació trens</button>
        <button @click="eliminar_avaluacio">Esborrar avaluació</button>
      </div>
      <div>
        <div v-if="this.ranquing_trens.length !== 0">
          <table border=1>
            <tr>
              <th colspan="2" rowspan="2">Tren</th>
              <th rowspan="2">id</th>
              <th rowspan="2" colspan="2">Compliment (%)</th>
              <th colspan="21">Indicadors</th>
            </tr>

            <tr>
              <th v-for="(val, key) in Corrent.info_qualitat"
                  :key="key"
                  style="font-family:monospace; text-align: left; padding: 0px 5px 0px 3px"
                  v-if="key !== 'I1' && key !== 'I22' && key !== 'I23'">

                <div class="tooltip" style="color: inherit">{{key}}
                  <span class="tooltiptext_ind" style="font-size: 10px">{{val.nom}}</span>
                </div>
                <div style="font-size: 10px; font-family: monospace">({{val.unitat}})</div>
              </th>
            </tr>

            <template v-for="(tren,id) in this.ranquing_trens">
              <tr>
                <td rowspan="2" style="font-family:monospace">{{id + 1}}</td>
                <td rowspan="2" style="text-align: right; padding: 0px 10px 0px 10px">{{Trens_info[tren.id].nom}}</td>
                <td rowspan="2" style="text-align: left; padding: 0px 10px 0px 10px">{{tren.id}}</td>
                <td rowspan="2" style="text-align: center">{{tren.puntuacio}}</td>
                <td style="text-align: right; padding: 0px 5px 0px 5px">min:</td>
                <template v-for="(val, key) in user.corrent.qualitat" style="font-family:monospace" v-if="key !== 'I1' && key !== 'I22' && key !== 'I23'">
                  <td
                      :style="{background: tren.compliments.includes(key) ? 'lightgreen' : 'LightCoral'}"
                      style="font-size: small; text-align: left; padding: 0px 5px 0px 5px"
                  >
                    {{show_sc_not(tren.concentracio.min.qualitat[key])}}
                  </td>
                </template>
              </tr>
              <tr>
                <td style="text-align: right; padding: 0px 5px 0px 5px">max:</td>
                <template v-for="(val, key) in user.corrent.qualitat" style="font-family:monospace" v-if="key !== 'I1' && key !== 'I22' && key !== 'I23'">
                  <td
                      :style="{background: tren.compliments.includes(key) ? 'lightgreen' : 'LightCoral'}"
                      style="font-size: small; text-align: left; padding: 0px 5px 0px 5px"
                  >
                    {{show_sc_not(tren.concentracio.max.qualitat[key])}}
                  </td>
                </template>
              </tr>
            </template>
          </table>
        </div>
      </div>
    </details>

    <details class=seccio close>
      <summary class=seccio>Modificació dels tractaments (opcional)</summary>
      <div>
        <div>
          <table border=1>
            <tr>
              <th>Tractament</th>
              <th>Pretractament</th>
              <th>Editar tractament</th>
            </tr>
            <tbody v-for="(tra,nom_tra) in this.Tractaments_info" :key="nom_tra">
            <tr>
              <td :rowspan="1+Object.keys(tra).length">
                {{nom_tra}}
              </td>
            </tr>
            <tr v-for="(pre,nom_pre) in tra">
              <td>
                {{nom_pre}}
              </td>
              <td>
                <details>
                  <summary>editar</summary>
                  <div>
                    Edita els valors d'eliminació

                    <table border=1>
                      <tr>
                        <th colspan=2>id</th>
                        <th>min(%)</th>
                        <th>max(%)</th>
                      </tr>
                      <tr v-for="(obj,id) in pre">
                        <td style="font-family:monospace">{{id}}</td>
                        <td>{{Corrent.info_qualitat[id].nom.substring(0,20)}}</td>
                        <td><input type=number v-model.number="obj.min" min=0 max=100></td>
                        <td><input type=number v-model.number="obj.max" min=0 max=100></td>
                      </tr>
                    </table>
                  </div>
                </details>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>
    </details>

  </div>

</template>

<script>

import Corrent from '../utils/corrent';
import Usuari from '../utils/usuari';
import {llegir_vp_usos,llegir_trens,llegir_tractaments,llegir_tractaments_micro,llegir_caract_efluent_secundari} from "../utils/llegir_excels";

export default {
  name: 'Sad',
  data: function(){
    return {
      user: new Usuari(),       //objecte
      selected_input: "",
      tractament_secundari: "", //tractament secundari infraestructura
      ranquing_trens: [],       //array de trens ordenats per compliments
      usos_seleccionats: [],    //ús o usos seleccionats per l'usuari

      //backend
      Usuari,                   //classe
      Corrent,                  //classe
      Tractaments_info: {},     //diccionari tots els tractaments
	  Tractaments_m_info: {},   //diccionari tractaments amb punt de referència 1 (microbiològics).
      Trens_info: {},           //diccionari tots els trens
      Usos_info: {},            //diccionari tots els usos
      Efluents_info: {}         //diccionari efluents (primari/secundari) de l'infraestructura existent
    }
  },
  created: async function() {
    // llegir excel 'tractaments'
    this.read_file('/20210723_SUGGEREIX_PT4_Tractaments.xlsx', 'tractaments');

    // llegir excel 'tractaments' per a punt de referència 1 (indicadors microbiològics).
    this.read_file('/20211004_SUGGEREIX_Taula_B5.xlsx', 'tractaments_micro');

    // llegir excel 'trens'
    this.read_file('/20210723_SUGGEREIX_PT4_Trens.xlsx', 'trens');

    // llegir excel 'efluent secundari' (característiques infraestructura existent)
    //this.read_file('/SUGGEREIX_PT2_Taulest.xlsx', 'efluent');

    // llegir excel 'valors protectors usos'
    this.read_file('/20211103_SUGGEREIX_Taules_A7.0_A7.1.xlsx', 'usos');

  },
  methods:{
    focusChanged(event) {
		let _this = this;
		_this.selected_input = event.target.id;
    },
	handleBlur(event){
		let _this = this;
		_this.selected_input = "";
	},
	show_sc_not(value){
		if(value === undefined || isNaN(value)) return '';
		else return value.toExponential(1);
	},
    read_file(filename, type){

      let oReq = new XMLHttpRequest();
      let _this = this;

      oReq.open("GET", filename, true);
      oReq.send();
      oReq.responseType = "arraybuffer";
      oReq.onload = async function(){
        let buffer =  oReq.response;
        let binaryData = new Uint8Array(buffer);
        if (type === 'tractaments')
          _this.Tractaments_info = await llegir_tractaments(binaryData);
		else if (type === 'tractaments_micro')
          _this.Tractaments_m_info = await llegir_tractaments_micro(binaryData);
        else if (type === 'trens')
          _this.Trens_info = await llegir_trens(binaryData);
        else if (type === 'efluent')
          _this.Efluents_info = await llegir_caract_efluent_secundari(binaryData);
        else if (type === 'usos')
          _this.Usos_info = await llegir_vp_usos(binaryData);
      }

    },

    //actualitza  l'array amb el rànquing de trens, ordenats de més grau de compliment, a menys.
    avaluacio_trens: function (){

      let _this = this;
      let dict_tractaments = _this.Tractaments_info;
	  let dict_tractaments_m = _this.Tractaments_m_info;
      let efluent_secundari = _this.tractament_secundari;
      let dict_trens = _this.Trens_info;
      let avaluacio_trens = [];
	  console.log(dict_tractaments)
	  console.log(dict_tractaments_m)

      if(Object.keys(_this.Trens_info).length !== 0 && _this.usos_seleccionats.length !== 0 && _this.tractament_secundari !== ""){
        for (const [key, tren] of Object.entries(dict_trens)) {
          let array_tractaments = tren['array_tractaments'];
          let primer_tractament = array_tractaments[0];
          let tren_aplicable = (efluent_secundari.includes('FAC_DS') && primer_tractament !== 'BRM') ||
              (efluent_secundari.includes('BRM') && primer_tractament === 'BRM') ||
              (efluent_secundari.includes('DP') && primer_tractament === 'BRM');
          if(tren_aplicable){
            let min_max = _this.user.corrent.aplica_tren_tractaments(array_tractaments, dict_tractaments, dict_tractaments_m, efluent_secundari);

            //l'avaluació es fa en base als valors de concentració màxims comparats als valors protectors segons els usos.
            let avaluacio_compliments = min_max.max.n_compliments(_this.user.corrent_objectiu);
            let puntuacio = Math.round((((avaluacio_compliments.length / 20) * 100) + Number.EPSILON) * 100) / 100;
            // console.log('avaluacio ', tren,': ', avaluacio_compliments, min_max.max, puntuacio)
            // console.log(min_max);
            let new_train = {
              id: key,
              concentracio: min_max,
              compliments: avaluacio_compliments,
              puntuacio: puntuacio,
            }

            avaluacio_trens.push(new_train);
          }
        }
        avaluacio_trens.sort((a, b) => b.puntuacio - a.puntuacio);
        _this.ranquing_trens = avaluacio_trens;
      }
      else{
        alert("Falta definir l'efluent secundari o seleccionar l'ús (o usos) d'aigua regenerada.");
      }

    },

    //reseteja el ranquing de trens (array buit)
    eliminar_avaluacio(){
      this.ranquing_trens = [];
    },

    //retorna cert si cal mostrar nota de rang del valor protector amb 'id', fals altrament
    mostrar_nota_vp: function (id){
      let _this = this;
      // Es crea un diccionary per cada indicador quins usos han de mostrar rang.
      const ids_us_dict = {
        'I1': [1,2,3,5,6,7,8,11,12,13,14,15],
        'I6': [1,3,8],
        'I7': [1,3,8],
        'I8': [1,3,5,6,7,8,11,12,13,14,15],
        'I9': [1,3,5,6,7,8,11,12,13,14,15]
      };
      if(_this.usos_seleccionats.length !== 0 && ids_us_dict[id] && _this.user.corrent_objectiu.qualitat[id] !== 'nd'){
        // Es crea un array de numeros basat en l'array de 'DummyX' i es filtren els elements que coincideixen amb el diccionari.
        const usos_numeros = _this.usos_seleccionats.flatMap(us => ids_us_dict[id].includes(Number(us.substr(-1))) ? [us] : []);
        return usos_numeros.length !== 0;
      }
      else return false;
    },

    //retorna l'string amb el rang de valors a mostrar pel valor protector de l'indicador 'id'.
    nota_rang_vp: function (id){
      let _this = this;
      // Diccionari de rangs en funció de l'indicador 'id' (en el cas particular del I1 varia en funció de l'ús).
      const ids_us_dict = {
        'I1': _this.usos_seleccionats.includes('Dummy15') ? 'rang: 6,5-9,5' : 'rang: 6-9',
        'I6': 'rang: 2-31',
        'I7': 'rang: 2-3',
        'I8': 'rang: 30-500',
        'I9': 'rang: 4-20'
      };
      return ids_us_dict[id];
      
    }
  },
  computed: {

  },
  watch: {
    //actualitza la qualitat del corrent_objectiu (usuari), en funció dels vp mínims dels usos seleccionats.
    usos_seleccionats: function (newUse, oldUse){
      let _this = this;
      if (_this.usos_seleccionats.length > 0){

        //assignem a l'usuari la qualitat objectiva del primer ús seleccionat.
        //_this.user.corrent_objectiu.qualitat = _this.Usos_info[newUse[0]].qualitat;
        for (const [key, value] of Object.entries(_this.Usos_info[newUse[0]].qualitat)) {
          _this.user.corrent_objectiu.qualitat[key] = value.vp;
        }
        const n_usos = _this.usos_seleccionats.length;

        //si hi ha més d'un ús seleccionat, actualitzem els indicadors de qualitat amb els valors protectors mínims.
        for (let i=1; i<n_usos; i++){
          const us = _this.usos_seleccionats[i];
          let qualitat_us = _this.Usos_info[us].qualitat;

          // actualitzem qualitat final amb els valors més baixos protectors dels usos seleccionats, per cada indicador.
          for (const [key, value] of Object.entries(qualitat_us)) {
            if (value.vp !== 'nd'){
              const valor_actual = _this.user.corrent_objectiu.qualitat[key];
              if (valor_actual === 'nd' || value.vp < valor_actual)
                _this.user.corrent_objectiu.qualitat[key] = value.vp;
            }
          }
        }
      }
    },

    //actualitza els valors inicial de qualitat de l'aigua (usuari) en funció de l'efluent secundari seleccionat.
    tractament_secundari: function (newUse, oldUse){
      let _this = this;
      _this.user.corrent.qualitat = Usuari.info_tractaments_secundaris[newUse].qualitat;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

table{
  border-collapse:collapse;
}
table td {
  word-wrap:break-word;
}
.doubletd {
  width:120px;
}
.nd{
  text-align:right;
}
th{
  text-align:center;
}
details summary{
  text-align: left;
}
details summary:hover{
  cursor:pointer;
  text-decoration:underline;
}
details.seccio {
  margin-bottom:1em;
}
details.seccio > summary{
  font-weight:bold;
  font-size:larger;
}
details.seccio > div {
  padding:1em;
  background:#eff5fb;
}
input[type=number]{
  text-align:right;
}

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  color: maroon;
  padding: 0px 5px 0px 5px;
  //border-bottom: 1px dotted black; /* If you want dots under the hoverable text */
}

/* Tooltip text */
.tooltip .tooltiptext {
  visibility: hidden;
  width: 100px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}
.tooltip .tooltiptext_ind {
  visibility: hidden;
  width: auto;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 10px;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext, .tooltip:hover .tooltiptext_ind {
  visibility: visible;
}

</style>

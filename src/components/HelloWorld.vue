<template>

  <div id='intro'>
    <details class=seccio open>
      <summary class=seccio>1. Definició aigua</summary>
      <div>
        <table border=1>
          <tr>
            <th colspan="2">Capacitat tractament (m3):
              <input type="number" v-model.number="user.corrent.Q" style="max-width:75px">
            </th>
            <th colspan=2>Descripció infraestructura existent</th>
            <th>Ús d'aigua regenerada</th>
            <th rowspan=3>Unitat</th>
          </tr>

          <tr>
            <th colspan=2 rowspan="2">Indicadors de qualitat</th>
            <td colspan=2>
              Selecciona tractament secundari:
              <br>
              <select v-model="tractament_secundari" style="max-width:350px">
                <option v-for="(obj, key) in Usuari.info_tractaments" :value="key" :key="key">
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
            <td>
              <input type="number" v-model.number="user.corrent.qualitat[key].min">
            </td>
            <td>
              <input type="number" v-model.number="user.corrent.qualitat[key].max">
            </td>
            <td id="hola" style="text-align: right">
              <div v-if="mostrar_nota_vp(key)" class="tooltip">*
                <span class="tooltiptext">{{nota_rang_vp(key)}}</span>
              </div>
              <input type="number" v-model.number="user.corrent_objectiu.qualitat[key]">
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
                  v-if="key !== 'I1'">

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
                <template v-for="(val, key) in user.corrent.qualitat" style="font-family:monospace" v-if="key !== 'I1'">
                  <td
                      :style="{background: tren.compliments.includes(key) ? 'lightgreen' : 'LightCoral'}"
                      style="font-size: small; text-align: left; padding: 0px 5px 0px 5px"
                  >
                    {{tren.concentracio.min.qualitat[key]}}
                  </td>
                </template>
              </tr>
              <tr>
                <td style="text-align: right; padding: 0px 5px 0px 5px">max:</td>
                <template v-for="(val, key) in user.corrent.qualitat" style="font-family:monospace" v-if="key !== 'I1'">
                  <td
                      :style="{background: tren.compliments.includes(key) ? 'lightgreen' : 'LightCoral'}"
                      style="font-size: small; text-align: left; padding: 0px 5px 0px 5px"
                  >
                    {{tren.concentracio.max.qualitat[key]}}
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
import ExcelJS from 'exceljs';

export default {
  name: 'HelloWorld',
  props: {},
  data: function(){
    return {
      user: new Usuari(),       //objecte
      tractament_secundari: "", //tractament secundari infraestructura
      ranquing_trens: [],       //array de trens ordenats per compliments
      usos_seleccionats: [],    //ús o usos seleccionats per l'usuari

      //backend
      Usuari,                   //classe
      Corrent,                  //classe
      Tractaments_info: {},     //diccionari tots els tractaments
      Trens_info: {},           //diccionari tots els trens
      Usos_info: {},            //diccionari tots els usos
      Efluents_info: {}         //diccionari efluents (primari/secundari) de l'infraestructura existent
    }
  },
  created: async function() {
    // llegir excel 'tractaments'
    this.read_file('/20210723_SUGGEREIX_PT4_Tractaments.xlsx', 'tractaments');

    // llegir excel 'trens'
    this.read_file('/20210723_SUGGEREIX_PT4_Trens.xlsx', 'trens');

    // llegir excel 'efluent secundari' (característiques infraestructura existent)
    //this.read_file('/SUGGEREIX_PT2_Taulest.xlsx', 'efluent');

    // llegir excel 'valors protectors usos'
    this.read_file('/SUGGEREIX_PT3_Taulest.xlsx', 'usos');

  },
  methods:{
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
          await _this.llegir_tractaments(binaryData);
        else if (type === 'trens')
          await _this.llegir_trens(binaryData);
        else if (type === 'efluent')
          await _this.llegir_caract_efluent_secundari(binaryData);
        else if (type === 'usos')
          await _this.llegir_vp_usos(binaryData);
      }

    },
    // llegeix excel de valors de sortida dels diferents efluents secundaris (infraestructura existent).
    llegir_caract_efluent_secundari: function(binaryData){

    },
    // llegeix excel que conté els valors protectors (VP) dels diferents usos.
    // si per un ús hi ha més d'una tipologia de VP, es guarda el que té valor mínim (més restrictiu).
    llegir_vp_usos: function(binaryData){
      let _this = this;
      let workbook = new ExcelJS.Workbook();

      return workbook.xlsx.load(binaryData).then(wb => {
        //1a pestanya amb nom i codi dels usos
        let worksheet_codes = wb.worksheets[0];
        let startingRow = 4; //ignore first 3 columns (headers)
        let uses = {};

        worksheet_codes.eachRow({ includeEmpty: false }, function(rowData, rowNumber) {
          if(rowNumber >= startingRow){
            const row = rowData.values;
            let useId = row[2];
            let useName = row[1];

            uses[useId] = {
              nom: useName,
              codi: useId,
              qualitat: {} //valors protectors
            };
          }
        });

        //2a pestanya amb valors protectors (VP) per cada indicador i ús.
        let worksheet_vp = wb.worksheets[1];
        startingRow = 2; //ignore first 2 columns (headers)
        let maxRows = worksheet_vp.rowCount
        console.log('llegir usos:', maxRows)

        let i = 0;
        worksheet_vp.eachRow({ includeEmpty: false }, function(rowData, rowNumber) {
          //console.log(i);
          if(rowNumber >= startingRow){
            const row = rowData.values;
            let useId = row[2];   //codi d'ús: columna 'B'
            let indId = row[4];   //codi indicador: columna 'D'
            let tipusVp= row[5];  //tipus de valor protector (1,2 o 3): columna 'E'
            let refVp = row[8];   //referència del valor protector
            let valorVp = row[6]; //valor protector: columna 'F'
            if (typeof valorVp === 'object') { //de tipus formula (té result i formula, ens guardem només result).
              valorVp = Math.round((valorVp.result + Number.EPSILON) * 1000000) / 1000000; //arrodonit a 7 decimals
            }
            if (typeof valorVp === 'string' && valorVp !== 'nd') {
              valorVp = valorVp.replace(',','.'); //canviem la coma de l'string (per si és número decimal) per punt.
              valorVp = parseFloat(valorVp.replace(/[^\d.-]/g,'')); //eliminar tot el que no siguin números i separador decimal.
            }

            if (uses[useId].qualitat[indId] === undefined){ //no hi ha definit encara cap valor protector
              uses[useId].qualitat[indId] = {
                vp: valorVp,
                tipus: tipusVp,
                ref: refVp
              }
            }
            else{ //ja hi ha definit algun valor protector. Comprovem si el següent és inferior o 'nd', per actualitzar-lo
              if (uses[useId].qualitat[indId].vp === 'nd' || uses[useId].qualitat[indId].vp > valorVp)
                uses[useId].qualitat[indId] = {
                  vp: valorVp,
                  tipus: tipusVp,
                  ref: refVp
                }
            }
            i += 1;
          }

        });
        _this.Usos_info = uses;
      });
    },
    // llegeix excel de trens de tractament i guarda les dades.
    llegir_trens: function(binaryData){

      let _this = this;
      let workbook = new ExcelJS.Workbook();
      return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[0];

        let startingRow = 4; //ignore first 3 columns (headers)
        let maxRows = worksheet.rowCount
        console.log('llegir trens:', maxRows)
        let trains = {}

        worksheet.eachRow({ includeEmpty: false }, function(rowData, rowNumber) {
          if(rowNumber >= startingRow){
            const row = rowData.values;
            let trainId = row[3];
            let trainName = row[1];
            let trainTreatments = [];
            let references = [];

            //read treatments in order (from column D(4) to I(9) = 6 in total)
            for (let i=4; i<10; i++){
              if (row[i] !== undefined) trainTreatments.push(row[i].replaceAll(" ",""));
            }

            //read references in order (from column J(10) to W(23) = 14 in total)
            for (let i=10; i<24; i++){
              if (row[i] !== undefined) references.push(row[i]);
            }

            trains[trainId] = {
              nom: trainName,
              codi: trainId,
              array_tractaments: trainTreatments,
              referencies: references,
            };
          }
        });
        _this.Trens_info = trains;
      });
    },
    // llegeix excel de tractaments i guarda les dades.
    llegir_tractaments: function(binaryData){

      let _this = this;
      let workbook = new ExcelJS.Workbook();
      return workbook.xlsx.load(binaryData).then(wb => {

        let worksheet = wb.worksheets[0];
        let rowNumber = 2; //ignore first column (header)
        let maxRows = worksheet.rowCount;
        let treatments = {};
        console.log('llegir tractament:', maxRows)
        for (rowNumber; rowNumber < maxRows; rowNumber+=22){
          let i = rowNumber;
          let name = worksheet.getCell('A'+i.toString());
          let pretreatment =  worksheet.getCell('B'+i.toString());
          if (treatments[name] === undefined){
            treatments[name] = {};
          }
          treatments[name][pretreatment] = {};
          for (let j=1; j<=22; j++){
            let key = worksheet.getCell('D'+i.toString()).value;  //'I'+j.toString();
            let min = worksheet.getCell('E'+i.toString()).value;
            let max = worksheet.getCell('F'+i.toString()).value;
            //if (typeof min === 'object') min = min.result;  // formula in excel cell
            //if (min === 'ne' || min === 'na') min = 0;      // parse 'ne' or 'na' values to 0
            //if (typeof max === 'object') max = max.result;  // formula in excel cell
            //console.log(i, min, typeof min)
            if (typeof min === 'string' && typeof max === 'string'){ // parse 'ne' or 'na' values to 0
              min = 0;
              max = 0;
            }
            else if (typeof min === 'string' && typeof max !== 'string'){
              if (typeof max === 'object') max = max.result; // type object when cell contains a formula and result.
              min = max;
            }
            else if (typeof max === 'string' && typeof min !== 'string'){
              if (typeof min === 'object') min = min.result;
              max = min;
            }
            else {
              if (typeof max === 'object') max = max.result;
              if (typeof min === 'object') min = min.result;
            }
            //if (max === 'ne' || max === 'na') max = 0;      // parse 'ne' or 'na' values to 0
            treatments[name][pretreatment][key] = {
              'min': min,
              'max': max
            }
            i++;
          }
        }
        _this.Tractaments_info = treatments;
      });
    },
    //actualitza  l'array amb el rànquing de trens, ordenats de més grau de compliment, a menys.
    avaluacio_trens: function (){

      let _this = this;
      let dict_tractaments = _this.Tractaments_info;
      let efluent_secundari = _this.tractament_secundari;
      let dict_trens = _this.Trens_info;
      let avaluacio_trens = [];


      if(Object.keys(_this.Trens_info).length !== 0 && _this.usos_seleccionats.length !== 0 && _this.tractament_secundari !== ""){
        for (const [key, tren] of Object.entries(dict_trens)) {
          let array_tractaments = tren['array_tractaments'];
          let primer_tractament = array_tractaments[0];
          let tren_aplicable = (efluent_secundari.includes('FAC_DS') && primer_tractament !== 'BRM') ||
              (efluent_secundari.includes('BRM') && primer_tractament === 'BRM') ||
              (efluent_secundari.includes('DP') && primer_tractament === 'BRM');
          if(tren_aplicable){
            let min_max = _this.user.corrent.aplica_tren_tractaments(array_tractaments, dict_tractaments, efluent_secundari);

            //l'avaluació es fa en base als valors de concentració màxims comparats als valors protectors segons els usos.
            let avaluacio_compliments = min_max.max.n_compliments(_this.user.corrent_objectiu);
            let puntuacio = Math.round((((avaluacio_compliments.length / 21) * 100) + Number.EPSILON) * 100) / 100;
            console.log('avaluacio ', tren,': ', avaluacio_compliments, min_max.max, puntuacio)
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
        //console.log('abans',avaluacio_trens);
        avaluacio_trens.sort((a, b) => b.puntuacio - a.puntuacio);
        //console.log('després', avaluacio_trens);
        _this.ranquing_trens = avaluacio_trens;
      }
      else{
        alert("Falta definir l'efluent secundari o seleccionar l'ús (o usos) d'aigua regenerada.");
      }

    },
    eliminar_avaluacio(){
      this.ranquing_trens = [];
    },
    //retorna cert si cal mostrar nota de rang del valor protector amb 'id', fals altrament
    mostrar_nota_vp: function (id){
      let _this = this;
      //const usos_nota = ['D1', 'D3', 'D5', 'D6', 'D7', 'D8', 'D11', 'D12', 'D13', 'D14'];
      const ids_nota = ['I1', 'I8', 'I9'];
      return _this.usos_seleccionats.length !== 0 && ids_nota.includes(id) && _this.user.corrent_objectiu.qualitat[id] !== 'nd';
    },
    //retorna l'string amb el rang de valors a mostrar pel valor protector de l'indicador 'id'.
    nota_rang_vp: function (id){
      if (id === 'I1') //pH
        return 'rang: 6-9';

      else if (id === 'I8')
        return 'rang: 30-500';

      else if (id === 'I9')
        return 'rang: 4-20';
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
      _this.user.corrent.qualitat = Usuari.info_tractaments[newUse].qualitat;
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

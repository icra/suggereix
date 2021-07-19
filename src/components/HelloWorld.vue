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
              Selecciona tractament secundari<br>
              <select v-model="tractament_secundari" style="max-width:350px">
                <option v-for="(obj, key) in Usuari.info_tractaments" :value="key" :key="key">
                  {{obj.nom}}
                  [{{key}}]
                </option>
              </select>
            </td>

            <td>
              Selecciona l'ús d'aigua regenerada<br>
              <select v-model="us_seleccionat" style="max-width:250px">
                <option v-for="(obj,key) in Usuari.info_usos" :value="key" :key="key">
                  {{obj.nom}}
                  [{{key}}]
                </option>
              </select>
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
            <td style="text-align: right">
              <div v-if="key === 'I1' && mostrar_nota_ph" class="tooltip">*
                <span class="tooltiptext">rang: 6-9</span>
              </div>
              <div v-else-if="key === 'I8' && us_seleccionat !== ''" class="tooltip">*
                <span class="tooltiptext">rang: 30-500</span>
              </div>
              <div v-else-if="key === 'I9' && us_seleccionat !== ''" class="tooltip">*
                <span class="tooltiptext">rang: 4-20</span>
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

    <details class=seccio close>
      <summary class=seccio>2. Modificació dels tractaments</summary>
      <div>
        <div>
          <table border=1>
            <tr>
              <th>Tractament</th>
              <th>Pretractament</th>
              <th>Editar tractament</th>
            </tr>
            <tbody v-for="(tra,nom_tra) in this.Tractaments" :key="nom_tra">
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


    <details class=seccio open>
      <summary class=seccio>3. Avaluació trens</summary>
      <div>
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
                  style="font-family:monospace; text-align: left; padding: 0px 5px 0px 5px"
                  v-if="key !== 'I1'">

                <div class="tooltip" style="color: inherit">{{key}}
                  <span class="tooltiptext" style="font-size: 10px">{{mostrar_info_indicador(key)}}</span>
                </div>
                <!---<div style="font-family:monospace">{{key}}</div>
                <div style="font-size:10px">{{val.nom.substring(0,8)}}</div>
                <div style="font-size:8px">({{val.unitat}})</div>-->
              </th>
            </tr>

            <template v-for="(tren,id) in this.ranquing_trens">
              <tr>
                <td rowspan="2" style="font-family:monospace">{{id + 1}}</td>
                <td rowspan="2" style="text-align: right; padding: 0px 10px 0px 10px">{{Trens[tren.id].nom}}</td>
                <td rowspan="2" style="text-align: left; padding: 0px 10px 0px 10px">{{tren.id}}</td>
                <td rowspan="2">{{tren.puntuacio}}</td>
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
        <!--
        <div style="padding:10px 0">
          Eficàcia eliminació:
          <label> <input type=radio v-model="eficacia_tractament" value="min"> Mínima</label>
          <label> <input type=radio v-model="eficacia_tractament" value="max"> Màxima</label>
        </div>

        <div>
          <table border=1>
            <tr>
              <th>Tractament</th>
              <th>Pretractament</th>
              <th
                      v-for="obj,id in Corrent.info_qualitat"
                      :title="`${obj.nom} ${obj.unitat}`"
              >
                <div style="font-family:monospace">{{id}}</div>
                <div style="font-size:10px">{{obj.nom.substring(0,8)}}</div>
                <div style="font-size:8px">({{obj.unitat}})</div>
              </th>
            </tr>
            <tbody v-for="tra,nom_tra in Tractaments">
            <tr>
              <td :rowspan="1+Object.keys(tra).length">
                {{nom_tra}}
              </td>
            </tr>
            <tr v-for="pre,nom_pre in tra">
              <td>
                {{nom_pre}}
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
                      <tr v-for="obj,id in pre">
                        <td style="font-family:monospace">{{id}}</td>
                        <td>{{Corrent.info_qualitat[id].nom.substring(0,20)}}</td>
                        <td><input type=number v-model.number="obj.min" min=0 max=100></td>
                        <td><input type=number v-model.number="obj.max" min=0 max=100></td>
                      </tr>
                    </table>
                  </div>
                </details>
              </td>
              <td
                      v-for="valor,id in user.corrent.aplica_tren_tractaments([pre])[eficacia_tractament].qualitat"
                      :style="{background:valor<=user.corrent_objectiu.qualitat[id]?'lightgreen':'red'}"
              >
                <span v-if="valor==0 || valor>1000">{{ valor.toFixed(0) }}</span>
                <span v-else-if="valor>100" >{{ valor.toFixed(1) }}</span>
                <span v-else-if="valor>10"  >{{ valor.toFixed(2) }}</span>
                <span v-else-if="valor>1"   >{{ valor.toFixed(3) }}</span>
                <span v-else                >{{ valor.toFixed(4) }}</span>
              </td>
            </tr>
            </tbody>
          </table>
        </div>-->

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
  props: {
    msg: String
  },
  data: function(){
    return {
      user: new Usuari(),       //objecte
      us_seleccionat: "",       //ús seleccionat per l'usuari
      tractament_secundari: "", //tractament secundari infraestructura
      eficacia_tractament:"min",//min o max
      ranquing_trens: [],       //array de trens ordenats per compliments

      //backend
      Usuari,                   //classe
      Corrent,                  //classe
      Tractaments: {},          //diccionari tots els tractaments
      Trens: undefined,         //diccionari tots els trens
      Usos: {}                  //diccionari tots els usos
      /*Tractaments2: {//diccionari
        "BRM":{
          "DP":{
            I1 : {min : 7.5 , max : 8.5   },
            I3 : {min : 99  , max : 100   },
            I4 : {min : 99  , max : 100   },
            I5 : {min : 50  , max : 74    },
            I6 : {min : 90  , max : 96    },
            I8 : {min : 0   , max : 60.8  },
            I9 : {min : 0   , max : 55.2  },
            I10: {min : 2   , max : 32    },
            I11: {min : 53  , max : 91    },
            I12: {min : 6   , max : 94    },
            I13: {min : 15  , max : 25    },
            I14: {min : 0   , max : 20    },
            I15: {min : 0   , max : 20    },
            I16: {min : 85  , max : 100   },
            I18: {min : 0   , max : 10    },
            I19: {min : 0   , max : 99.99 },
            I20: {min : 0   , max : 96.84 },
            I21: {min : 0   , max : 99    },
          },
        },
        "FQ_D":{
          "FAC_DS":{
            I1 : {min : 7.5 , max : 8.5   },
            I3 : {min : 99  , max : 100   },
            I4 : {min : 99  , max : 100   },
            I5 : {min : 50  , max : 74    },
            I6 : {min : 90  , max : 96    },
            I8 : {min : 0   , max : 60.8  },
            I9 : {min : 0   , max : 55.2  },
            I10: {min : 2   , max : 32    },
            I11: {min : 53  , max : 91    },
            I12: {min : 6   , max : 94    },
            I13: {min : 15  , max : 25    },
            I14: {min : 0   , max : 20    },
            I15: {min : 0   , max : 20    },
            I16: {min : 85  , max : 100   },
            I18: {min : 0   , max : 10    },
            I19: {min : 0   , max : 99.99 },
            I20: {min : 0   , max : 96.84 },
            I21: {min : 0   , max : 99    },
          },
        },
        "FS":{
          "FAC_DS":{
            I3  :{min:30 , max:50   },
            I4  :{min:60 , max:80   },
            I5  :{min:0  , max:30.2 },
            I8  :{min:71 , max:87   },
            I9  :{min:18 , max:23   },
            I19 :{min:0  , max:90   },
            I20 :{min:45 , max:90   },
            I21 :{min:48 , max:93   },
          },
          "FQ_D":{
            I3  : {min:30 , max:50},
            I4  : {min:60 , max:80},
            I5  : {min:0  , max:30.2},
            I8  : {min:71 , max:87},
            I9  : {min:18 , max:23},
            I19 : {min:0  , max:90},
            I20 : {min:45 , max:90},
            I21 : {min:48 , max:93},
          },
        },
        "Cl2":{
          //Falta completar
        },
        "Cl2O":{
          //Falta completar
        },
        "Cloramines":{
          //Falta completar
        },
      },
      Trens2: {      //diccionari
        1 :{
          nom:"FQ_D_FS_Cl2",
          tractaments: ["FQ_D", "FS", "Cl2"]
        },
        2 : {
          nom:"FQ_D_FS_Cl2O",
          tractaments: ["FQ_D", "FS", "Cl2O"]
        },
        3 :{
          nom:"FQ_D_FS_Cloramines",
          tractaments: ["FQ_D", "FS", "Cloramines"]
        },
      },*/
    }
  },
  created: async function() {
    // read 'tractaments' excel
    this.read_file('/20210513_SUGGEREIX_PT4_Tractaments.xlsx', 'tractaments');

    // read 'trens' excel
    this.read_file('/20210513_SUGGEREIX_PT4_Trens.xlsx', 'trens');

    //this.trens_acceptats;

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
          await _this.read_treatments_sheet(binaryData);
        else if (type === 'trens')
          await _this.read_trains_sheet(binaryData);
      }

    },
    read_trains_sheet: function(binaryData){

      let _this = this;
      let workbook = new ExcelJS.Workbook();
      return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[0];

        let startingRow = 4; //ignore first 3 columns (headers)
        let maxRows = worksheet.rowCount
        let trains = {}
        const header = worksheet.getRow(3).values; //values of header (third row)

        worksheet.eachRow({ includeEmpty: false }, function(rowData, rowNumber) {
          if(rowNumber >= startingRow){
            const row = rowData.values;
            let trainId = row[3];
            let trainName = row[1];
            let trainTreatments = [];
            let trainUsosES = [];
            let trainUsosEU = [];

            //read treatments in order (from column D(4) to I(9) = 6 in total)
            for (let i=4; i<10; i++){
              if (row[i] !== undefined) trainTreatments.push(row[i].replaceAll(" ",""));
            }

            //read uses according to 'RD 1620/2007' in order (from column J(10) to V(22) = 13 in total)
            for (let i=10; i<23; i++){
              if (row[i] === 1) trainUsosES.push(header[i]);
            }

            //read uses according to 'EU 2020/741' in order (from column W(23) to Z(26) = 4 in total)
            for (let i=23; i<27; i++){
              if (row[i] === 1) trainUsosEU.push(header[i]);
            }

            trains[trainId] = {
              nom: trainName,
              codi: trainId,
              array_tractaments: trainTreatments,
              usos_es: trainUsosES,
              usos_eu: trainUsosEU
            };
          }
        });
        _this.Trens = trains;
      });
    },
    read_treatments_sheet: function(binaryData){

      let _this = this;
      let workbook = new ExcelJS.Workbook();
      return workbook.xlsx.load(binaryData).then(wb => {

        let worksheet = wb.worksheets[0];
        let rowNumber = 2; //ignore first column (header)
        let maxRows = worksheet.rowCount
        let treatments = {}

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
              if (typeof max === 'object') max = max.result;
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
        _this.Tractaments = treatments;
      });
    },
    //retorna un array amb els tots els trens ordenats de menys incompliment, a més incompliment.
    avaluacio_trens: function (){

      let _this = this;
      let dict_tractaments = _this.Tractaments;
      let efluent_secundari = _this.tractament_secundari;
      let dict_trens = _this.Trens;
      let avaluacio_trens = [];


      if(_this.Trens !== undefined && _this.us_seleccionat !== "" && _this.tractament_secundari !== ""){
        let i = 1;
        for (const [key, tren] of Object.entries(dict_trens)) {
          //console.log('dins for');
          let array_tractaments = tren['array_tractaments'];
          let min_max = _this.user.corrent.aplica_tren_tractaments(array_tractaments, dict_tractaments, efluent_secundari);

          //l'avaluació es fa en base als valors de concentració màxims comparats als valors protectors segons els usos.
          let avaluacio_compliments = min_max.max.n_compliments(_this.user.corrent_objectiu);
          let puntuacio = Math.round((((avaluacio_compliments.length / 21) * 100) + Number.EPSILON) * 100) / 100;
          console.log('avaluacio ', tren,': ', avaluacio_compliments.length, puntuacio)
          // console.log(min_max);
          let new_train = {
            id: key,
            concentracio: min_max,
            compliments: avaluacio_compliments,
            puntuacio: puntuacio,
          }

          //avaluacio_trens[key] = new_train;
          avaluacio_trens.push(new_train);
          //let min_max = _this.aplica_tren(array_tractaments);
          //console.log(i);
          i += 1;
        }
      }
      console.log('abans',avaluacio_trens);
      avaluacio_trens.sort((a, b) => b.puntuacio - a.puntuacio);
      console.log('després', avaluacio_trens);
      _this.ranquing_trens = avaluacio_trens;

      //return avaluacio_trens;
    },
    eliminar_avaluacio(){
      this.ranquing_trens = [];
    },
    mostrar_info_indicador(id){

      return Corrent.info_qualitat[id].nom + ' (' + Corrent.info_qualitat[id].unitat + ')';
    }
  },
  computed: {
    trens_acceptats: function (){
      let _this = this;
      if(_this.Trens !== undefined && _this.us_seleccionat !== "") {
        //console.log('trens', _this.user.filter_train_by_use(_this.us_seleccionat, _this.Trens));
        return _this.user.filter_train_by_use(_this.us_seleccionat, _this.Trens);
      }
    },
    mostrar_nota_ph: function (){
      let _this = this;
      const usos_nota = ['D1', 'D3', 'D5', 'D6', 'D7', 'D8', 'D11', 'D12', 'D13', 'D14'];
      if (_this.us_seleccionat !== ""){
        if (usos_nota.includes(_this.us_seleccionat)) {
          return true;
        }
        else return false;
      }
      else
        return false;
    }
  },
  watch: {
    us_seleccionat: function(newUse, oldUse) {
      let _this = this;
      _this.user.corrent_objectiu.qualitat = Usuari.info_usos[newUse].qualitat;
    },
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

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext {
  visibility: visible;
}

</style>

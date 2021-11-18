<template data-vuetify>
  <div id="intro">
    <details class="seccio" open>
      <summary class="seccio">1. Definició aigua</summary>
      <div>
        <table border="1">
          <tr>
            <th colspan="2">
              Capacitat tractament (m3/d):
              <input
                type="number"
                v-model.number="user.corrent.Q"
                min="1" step="1"
                style="max-width: 75px"
              />
            </th>
            <th colspan="2">Descripció infraestructura existent</th>
            <th>Ús d'aigua regenerada</th>
            <th rowspan="3">Unitat</th>
            <th rowspan="3">Referència</th>
          </tr>

          <tr>
            <th colspan="2" rowspan="2">Indicadors de qualitat</th>
            <td colspan="2">
              Selecciona la infraestructura existent:
              <br />
              <select v-model="tractament_secundari" style="max-width: 350px">
                <option
                  v-for="(obj, key) in Usuari.info_tractaments_secundaris"
                  :value="key"
                  :key="key"
                >
                  {{ obj.nom }}
                  [{{ key }}]
                </option>
              </select>
            </td>

            <td class="doubletd3">
              <b>Selecciona l'ús (o usos) d'aigua regenerada:</b>
              <br />
              <template v-for="(obj, key) in Usos_info">
                <input
                  type="checkbox"
                  :id="key"
                  :value="key"
                  :key="key"
                  v-model="usos_seleccionats"
                />
                <label :for="key" :key="key+'_'+obj.nom">{{ obj.nom }}</label>
                <div v-if="mostrar_nota_dummy(obj.codi)" class="tooltip" :key="key+'_'+obj.codi">
                  *
                  <span class="tooltiptext2">{{ nota_dummy(obj.codi) }}</span>
                </div>
                <br :key="key+'_'+obj.codi+obj.nom"/>
              </template>
            </td>
          </tr>

          <tr>
            <td style="text-align: right; padding-right: 20px">min</td>
            <td style="text-align: right; padding-right: 20px">max</td>
            <td style="text-align: right; padding-right: 20px">
              Valors objectius de qualitat (VP)
            </td>
          </tr>

          <tr v-for="(val, key) in user.corrent.qualitat" :key="key">
            <td style="text-align: right; padding: 0px 10px 0px 10px">
              {{ Corrent.info_qualitat[key].nom }}
            </td>
            <td style="font-family: monospace">
              {{ key }}
            </td>
            <td v-if="key !== 'I22' && key !== 'I23'">
              <input
                v-if="key !== 'I1' && selected_input !== key + '_min'"
                type="text"
                :value="show_sc_not(user.corrent.qualitat[key].min)"
                :ref="key + '_min'"
                :id="key + '_min'"
                class="nd"
                @focus="focusChanged"
              />
              <input
                v-else
                type="number"
                v-model.number="user.corrent.qualitat[key].min"
                v-on:blur="handleBlur"
              />
            </td>
            <td v-if="key !== 'I22' && key !== 'I23'">
              <input
                v-if="key !== 'I1' && selected_input !== key + '_max'"
                type="text"
                :value="show_sc_not(user.corrent.qualitat[key].max)"
                :ref="key + '_max'"
                :id="key + '_max'"
                class="nd"
                @focus="focusChanged"
              />
              <input
                v-else
                type="number"
                v-model.number="user.corrent.qualitat[key].max"
                v-on:blur="handleBlur"
              />
            </td>
            <td v-else-if="key === 'I22'" colspan="2" class="doubletd">
              L’I22 (N-nitrosodimetilamina) es pot formar en tractaments de
              desinfecció amb cloramines, amb clor si al medi també hi ha amoni,
              i en tractaments amb ozó.
            </td>
            <td v-else colspan="2" class="doubletd">
              L’I23 (triclorometà) es pot formar en tractaments de desinfecció
              amb clor lliure.
            </td>
            <td style="text-align: right">
              <div v-if="mostrar_nota_vp(key)" class="tooltip">
                *
                <span class="tooltiptext">{{ nota_rang_vp(key) }}</span>
              </div>
              <input
                v-if="isNaN(user.corrent_objectiu.qualitat[key])"
                placeholder="nd"
                class="nd"
                disabled
              />
              <input
                v-else-if="key !== 'I1' && selected_input !== key + '_vp'"
                type="text"
                :value="show_sc_not(user.corrent_objectiu.qualitat[key])"
                :ref="key + '_vp'"
                :id="key + '_vp'"
                class="nd"
                @focus="focusChanged"
              />
              <input
                v-else
                type="number"
                v-model.number="user.corrent_objectiu.qualitat[key]"
                v-on:blur="handleBlur"
              />
            </td>
            <td>
              {{ Corrent.info_qualitat[key].unitat }}
            </td>
            <td class="doubletd2">
              {{ user.corrent_objectiu.refs[key] }}
            </td>
          </tr>
          <tr>
            <td colspan="5" class="nd">
              <b>Grau d'informació sobre els VP</b>
            </td>
            <td>
              <b>{{ grau_informacio }} %</b>
            </td>
          </tr>
        </table>
      </div>
    </details>

    <details class="seccio" open>
      <summary class="seccio">2. Avaluació trens de tractament</summary>
      <div style="text-align: left">
        <button @click="avaluacio_trens">Avaluació trens</button>
        <button @click="eliminar_avaluacio">Esborrar avaluació</button>
      </div>
      <div>
        <div v-if="this.ranquing_trens.length !== 0">
          <table border="1">
            <tr>
              <th colspan="2" rowspan="2">Tren</th>
              <th rowspan="2">id</th>
              <th rowspan="2" colspan="2">Compliment (%)</th>
              <th colspan="21">Indicadors</th>
            </tr>

            <tr>
              <th
                v-for="(val, key) in info_qualitats"
                :key="key"
                style="
                  font-family: monospace;
                  text-align: left;
                  padding: 0px 5px 0px 3px;
                "
              >
                <div class="tooltip" style="color: inherit">
                  {{ key }}
                  <span class="tooltiptext_ind" style="font-size: 10px">{{
                    val.nom
                  }}</span>
                </div>
                <div style="font-size: 10px; font-family: monospace">
                  ({{ val.unitat }})
                </div>
              </th>
            </tr>

            <template v-for="(tren, id) in this.ranquing_trens">
              <tr :key="id+'_min'">
                <td rowspan="2" style="font-family: monospace">{{ id + 1 }}</td>
                <td
                  rowspan="2"
                  style="text-align: right; padding: 0px 10px 0px 10px"
                >
                  {{ Trens_info[tren.id].nom }}
                </td>
                <td
                  rowspan="2"
                  style="text-align: left; padding: 0px 10px 0px 10px"
                >
                  {{ tren.id }}
                </td>
                <td rowspan="2" style="text-align: center">
                  {{ tren.puntuacio }}
                </td>
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  min:
                </td>
                <template
                  v-for="(val, key) in info_qualitats"
                  style="font-family: monospace"
                >
                  <td
                    :key="key+'_aval_min'"
                    :style="{
                      background:
                        tren.compliments_min[key] === 0
                          ? 'lightgreen'
                          : tren.compliments_min[key] === 1
                          ? 'LightSalmon'
                          : 'LightCoral',
                    }"
                    style="
                      font-size: small;
                      text-align: left;
                      padding: 0px 5px 0px 5px;
                    "
                  >
                    {{ show_sc_not(tren.concentracio.min.qualitat[key]) }}
                  </td>
                </template>
              </tr>
              <tr :key="id+'_max'">
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  max:
                </td>
                <template
                  v-for="(val, key) in info_qualitats"
                  style="font-family: monospace"
                >
                  <td
                    :key="key+'_aval_max'"
                    :style="{
                      background:
                        tren.compliments_max[key] === 0
                          ? 'lightgreen'
                          : tren.compliments_min[key] === 1
                          ? 'LightSalmon'
                          : 'LightCoral',
                    }"
                    style="
                      font-size: small;
                      text-align: left;
                      padding: 0px 5px 0px 5px;
                    "
                  >
                    {{ show_sc_not(tren.concentracio.max.qualitat[key]) }}
                  </td>
                </template>
              </tr>
            </template>
          </table>
        </div>
      </div>
    </details>

    <details class="seccio" open>
      <summary class="seccio">3. Avaluació multicliteri dels trens viables</summary>
      <div style="text-align: left">
        <button @click="avaluacio_trens_multicriteri">Avaluació multicriteri</button>
        <button @click="eliminar_avaluacio_multicriteri">Esborrar avaluació</button>
      </div>
      <div>
        <div v-if="this.trens_multicriteris.length !== 0">
            <div class="click-chip-hover background-blue">Taula de criteris inicial</div>
            <div class="click-chip-hover outline-blue">Visualització de criteris normalitzats</div>
          <table border="1">
            <tr>
              <th rowspan="2">Tren</th>
              <th rowspan="2">id</th>
              <th colspan="2" rowspan="2" class="doubletd">Mitjana del % d'eliminació (I. químics)</th>
              <th colspan="2" rowspan="2" class="doubletd">Mitjana del % d'eliminació (I. microbiològics)</th>
              <th colspan="2" rowspan="2" class="doubletd">Cost Total (€)</th>
              <th rowspan="2" class="doubletd">Consum energètic mitjà (kWh/dia)</th>
              <th rowspan="2" class="doubletd">Petjada de carboni (kg CO2 eq./dia)</th>
              <th rowspan="2" class="doubletd">Petjada hídrica (L eq./dia)</th>
              <th rowspan="2" class="doubletd">Espai ocupat (m2)</th>
            </tr>
            <tr />

            <template v-for="(tren, id) in this.trens_multicriteris">
                
              <tr :key="id+'_min_multi'">
                <td
                  rowspan="2"
                  style="text-align: right; padding: 0px 10px 0px 10px"
                >
                  {{ Trens_info[tren.id].nom }}
                </td>
                <td
                  rowspan="2"
                  style="text-align: left; padding: 0px 10px 0px 10px"
                >
                  {{ tren.id }}
                </td>
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  min:
                </td>
                <td style="text-align: left; padding: 0px 10px 0px 10px">
                  {{ Math.round((tren.criteris.eliminacio_min_quimics + Number.EPSILON) * 100) / 100 }}
                </td>
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  min:
                </td>
                <td style="text-align: left; padding: 0px 10px 0px 10px">
                  {{ Math.round((tren.criteris.eliminacio_min_microbiologics + Number.EPSILON) * 100) / 100 }}
                </td>
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  min:
                </td>
                <td style="text-align: left; padding: 0px 10px 0px 10px">
                  {{ show_sc_not(tren.criteris.cost_total_min) }}
                </td>
                <td
                  rowspan="2"
                  style="text-align: left; padding: 0px 10px 0px 10px"
                >
                  {{ show_sc_not(tren.criteris.cons_ene_mitja) }}
                </td>
                <td
                  rowspan="2"
                  style="text-align: left; padding: 0px 10px 0px 10px"
                >
                  {{ show_sc_not(tren.criteris.hc) }}
                </td>
                <td
                  rowspan="2"
                  style="text-align: left; padding: 0px 10px 0px 10px"
                >
                  {{ show_sc_not(tren.criteris.hh) }}
                </td>
                <td
                  rowspan="2"
                  style="text-align: left; padding: 0px 10px 0px 10px"
                >
                  {{ show_sc_not(tren.criteris.espai_ocupat) }}
                </td>
              </tr>
              <tr :key="id+'_max_multi'">
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  max:
                </td>
                <td style="text-align: left; padding: 0px 10px 0px 10px">
                  {{ Math.round((tren.criteris.eliminacio_max_quimics + Number.EPSILON) * 100) / 100 }}
                </td>
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  max:
                </td>
                <td style="text-align: left; padding: 0px 10px 0px 10px">
                  {{ Math.round((tren.criteris.eliminacio_max_microbiologics + Number.EPSILON) * 100) / 100 }}
                </td>
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  max:
                </td>
                <td style="text-align: left; padding: 0px 10px 0px 10px">
                  {{ show_sc_not(tren.criteris.cost_total_max) }}
                </td>
              </tr>
            </template>
          </table>
        </div>
      </div>
    </details>

    <details class="seccio" close>
      <summary class="seccio">Modificació dels tractaments (opcional)</summary>
      <div>
        <div>
          <table border="1">
            <tr>
              <th>Tractament</th>
              <th>Pretractament</th>
              <th>Editar tractament</th>
            </tr>
            <tbody
              v-for="(tra, nom_tra) in this.Tractaments_info"
              :key="nom_tra"
            >
              <tr>
                <td :rowspan="1 + Object.keys(tra).length">
                  {{ nom_tra }}
                </td>
              </tr>
              <tr v-for="(pre, nom_pre) in tra" :key="nom_tra+'_'+nom_pre">
                <td>
                  {{ nom_pre }}
                </td>
                <td>
                  <details>
                    <summary>editar</summary>
                    <div>
                      Edita els valors d'eliminació

                      <table border="1">
                        <tr>
                          <th colspan="2">id</th>
                          <th>min(%)</th>
                          <th>max(%)</th>
                        </tr>
                        <tr v-for="(obj, id) in pre" :key="id+'_'+nom_tra+'_'+nom_pre">
                          <td style="font-family: monospace">{{ id }}</td>
                          <td>
                            {{ Corrent.info_qualitat[id].nom.substring(0, 20) }}
                          </td>
                          <td>
                            <input
                              type="number"
                              v-model.number="obj.min"
                              min="0"
                              max="100"
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              v-model.number="obj.max"
                              min="0"
                              max="100"
                            />
                          </td>
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

    <details class="seccio" close>
      <summary class="seccio">Modificació de la reducció acumulada mínima requerida al llarg d'un tren
        (opcional)
      </summary>
      <div>
        <div>
          <table border="1">
            <tr>
              <th colspan="2">Ús</th>
              <th colspan="2">Indicador</th>
              <th>Reducció logarítmica</th>
            </tr>
            <tbody v-for="(obj, id) in this.Qualitat_microbiologica" :key="id">
              <tr>
                <td :rowspan="4">
                  {{ id }}
                </td>
                <td :rowspan="4" class="doubletd2">
                  {{ Usos_info[id] ? Usos_info[id].nom : "" }}
                </td>
              </tr>
              <tr v-for="ind in Object.keys(obj)" :key="ind">
                <td style="font-family: monospace">{{ ind }}</td>
                <td>{{ Corrent.info_qualitat[ind].nom.substring(0, 20) }}</td>
                <td>
                  <input
                    type="number"
                    v-model.number="obj[ind][1]"
                    :ref="id + '_' + ind"
                    :id="id + '_' + ind"
                    class="nd"
                  />
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
import {llegir_vp_usos,llegir_trens,llegir_tractaments,llegir_tractaments_micro,llegir_caract_efluent_secundari,llegir_qualitat_micro,llegir_multicriteri} from "../utils/llegir_excels";
import {avaluar_multicriteris} from "../utils/multicriteri";

export default {
  name: 'Sad',
  data: function(){
    return {
      user: new Usuari(),       //objecte
      selected_input: "",
	  grau_informacio: 0,		// grau d'informació dels VP pels usos seleccionats.
      tractament_secundari: "", //tractament secundari infraestructura
      ranquing_trens: [],       //array de trens ordenats per compliments
      usos_seleccionats: [],    //ús o usos seleccionats per l'usuari
      trens_multicriteris: [],  //array de trans viables amb els seus multicriteris calculats.

      //backend
      Usuari,                   //classe
      Corrent,                  //classe
      Tractaments_info: {},     //diccionari tots els tractaments
	  Tractaments_m_info: {},   //diccionari tractaments amb punt de referència 1 (microbiològics).
      Trens_info: {},           //diccionari tots els trens
      Usos_info: {},              //diccionari tots els usos
      Efluents_info: {},          //diccionari efluents (primari/secundari) de l'infraestructura existent
	  Qualitat_microbiologica: {}, //diccionari amb qualitats microbiològiques.
      Multicriteri_info: {}        //diccionari amb la informació de l'avaluació multicriteri.

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
    this.read_file('/20211108_SUGGEREIX_Taules_A7.0_A7.1.xlsx', 'usos');

	// llegir excel 'monitoratge de la qualitat autobiològica', que mostra el % de reducció Rmin per a terns de tractament dels indicadors microbiològics.
	this.read_file('20211004_SUGGEREIX_Taula_A8.xlsx', 'qualitat_microbiologica');

    // llegir excel 'Avaluació multicriteri', que mostra els criteris a considerar amb cadascun dels tractaments.
	this.read_file('/20211111_SUGGEREIX_Criteris_add.xlsx', 'multicriteri');

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
		else if (type === 'qualitat_microbiologica')
		  _this.Qualitat_microbiologica = await llegir_qualitat_micro(binaryData);
        else if (type === 'multicriteri')
		  _this.Multicriteri_info = await llegir_multicriteri(binaryData);
          
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

      if(isNaN(_this.user.corrent.Q) || _this.user.corrent.Q < 1 || _this.user.corrent.Q >= 1000000 || !Number.isInteger(_this.user.corrent.Q)){
          alert("Capacitat de tractament invàlida");
          return;
      }

	  // Actualitza valors de la reducció microbiològica. 
	  for(const [id, obj] of Object.entries(_this.Qualitat_microbiologica)){
		  for(const ind of Object.keys(obj)){
			  _this.Qualitat_microbiologica[id][ind][0]= 1 - Math.pow(10, -_this.Qualitat_microbiologica[id][ind][1])
		  }
	  }

      if(Object.keys(_this.Trens_info).length !== 0 && _this.usos_seleccionats.length !== 0 && _this.tractament_secundari !== ""){
        for (const [key, tren] of Object.entries(dict_trens)) {
          let array_tractaments = tren['array_tractaments'];
          let primer_tractament = array_tractaments[0];
          let tren_aplicable = (efluent_secundari.includes('FAC_DS') && primer_tractament !== 'BRM') ||
              (efluent_secundari.includes('BRM') && primer_tractament === 'BRM') ||
              (efluent_secundari.includes('DP') && primer_tractament === 'BRM');
          if(tren_aplicable){
            let min_max = _this.user.corrent.aplica_tren_tractaments(array_tractaments, dict_tractaments, dict_tractaments_m, efluent_secundari,key);

            //l'avaluació es fa en base als valors de concentració màxims i mínims comparats als valors protectors segons els usos.
            const avaluacio_compliments_max = min_max.max.n_compliments('max',_this.user.corrent_objectiu, _this.Qualitat_microbiologica, _this.usos_seleccionats, _this.user.corrent.qualitat, _this.Usos_info);
			const avaluacio_compliments_min = min_max.min.n_compliments('min',_this.user.corrent_objectiu, _this.Qualitat_microbiologica, _this.usos_seleccionats, _this.user.corrent.qualitat, _this.Usos_info);
			const max_length = Object.values(avaluacio_compliments_max).filter(value => value === 0);
            const max_length_noref = Object.values(avaluacio_compliments_max).filter(value => value === 0 || value === 1);
            const puntuacio = Math.round((((max_length.length / 20) * 100) + Number.EPSILON) * 100) / 100;
            const puntuacio_noref = Math.round((((max_length_noref.length / 20) * 100) + Number.EPSILON) * 100) / 100;


            let new_train = {
              id: key,
              concentracio: min_max,
              compliments_max: avaluacio_compliments_max,
			  compliments_min: avaluacio_compliments_min,
              puntuacio: puntuacio,
              puntuacio_noref: puntuacio_noref
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

     //actualitza l'array de multicriteris dels trens viables, calculats amb fuzzy dels intervals dels tractaments de l'excel.
    avaluacio_trens_multicriteri: function (){

      const _this = this;
      const ranquing_trens = _this.ranquing_trens;

      // No es pot fer la valoració multicriteri si no s'ha fet abans l'avaluació de trens.
      if(!ranquing_trens.length){
          alert("Primer cal avaluar els trens de tractament.");
          return;
      }

      // S'obtenen els trens viables. Si no n'hi ha, no es pot fer la valoració multicriteri.
      const trens_viables = ranquing_trens.filter(tren => tren.puntuacio_noref === 100);
      if(!trens_viables.length){
          alert("No es poden avaluar els criteris ja que no s'ha obtingut cap tren de tractament viable.");
          return;
      }

      // Ara cal calcular el valor de cadascun dels 10 criteris per cada tren.
      const criteris_trens = [];
      for(const tren of trens_viables){
          const criteris = avaluar_multicriteris(tren, _this.Trens_info, _this.Multicriteri_info);
          criteris_trens.push({
              id: tren.id,
              criteris: criteris
          });
      }

      // Guardar el resultat.
      _this.trens_multicriteris = criteris_trens;

    },

    //reseteja el ranquing de trens (array buit)
    eliminar_avaluacio(){
      this.ranquing_trens = [];
    },

    //reseteja el ranquing d'avaluacions multicriteri (array buit)
    eliminar_avaluacio_multicriteri(){
      this.trens_multicriteris = [];
    },

	// retorna cert si cal mostrar nota en un ús.
	mostrar_nota_dummy: function (id){
		return id === 'Dummy9' || id === 'Dummy10' || id === 'Dummy11' || id === 'Dummy14';
	},

	// retorna l'etiqueta a mostrar en un ús.
	nota_dummy: function(id){
		if(id === 'Dummy9' || id === 'Dummy10') return 'Caldria fer una avaluació específica del risc microbiològic: estimació de l’exposició i definició de mesures de control. Els valors de reducció de patògens mínims (requerits per a un tren de tractament) definits per defecte en el SAD es basen en una estimació feta a partir dels valors legislats segons el Reial decret 1620/2007.';
		else if(id === 'Dummy11') return 'Caldria fer una avaluació específica del risc microbiològic. Seguint un criteri conservador, els valors de reducció de patògens definits per defecte en el SAD són els mateixos valors que els necessaris per tractar l’aigua per a l’ús de recàrrega d’aqüífers per injecció directa.';
		else if(id === 'Dummy14') return 'El SAD no defineix valors de reducció de patògens per defecte. Però, caldria assolir els valors de reducció de patògens necessaris per a l’ús 15 si l’aigua s’utilitzés amb aquesta finalitat més avall.';
		else return '';
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
    // Variable que conté la informació de qualitats filtrades sense 'I1', 'I22' i 'I23'
    info_qualitats: function () {
        return Object.fromEntries(Object.entries(this.Corrent.info_qualitat).filter(([key]) => key !== 'I1' && key !== 'I22' && key !== 'I23'));
    }
  },
  watch: {
    //actualitza la qualitat del corrent_objectiu (usuari), en funció dels vp mínims dels usos seleccionats.
    usos_seleccionats: function (newUse, oldUse){
      let _this = this;
	  let vp_assigned = new Set();
      if (_this.usos_seleccionats.length > 0){

        //assignem a l'usuari la qualitat objectiva del primer ús seleccionat.
        //_this.user.corrent_objectiu.qualitat = _this.Usos_info[newUse[0]].qualitat;
        for (const [key, value] of Object.entries(_this.Usos_info[newUse[0]].qualitat)) {
          _this.user.corrent_objectiu.qualitat[key] = value.vp;
          _this.user.corrent_objectiu.refs[key] = value.ref;
        }
        const n_usos = _this.usos_seleccionats.length;

        //si hi ha més d'un ús seleccionat, actualitzem els indicadors de qualitat amb els valors protectors mínims.
        for (let i=0; i<n_usos; i++){
          const us = _this.usos_seleccionats[i];
          let qualitat_us = _this.Usos_info[us].qualitat;

          // actualitzem qualitat final amb els valors més baixos protectors dels usos seleccionats, per cada indicador.
          for (const [key, value] of Object.entries(qualitat_us)) {
            if (value.vp !== 'nd'){
			  if(key !== 'I22' && key !== 'I23') vp_assigned.add(key);
              const valor_actual = _this.user.corrent_objectiu.qualitat[key];
              if (valor_actual === 'nd' || value.vp < valor_actual)
                _this.user.corrent_objectiu.qualitat[key] = value.vp;
                _this.user.corrent_objectiu.refs[key] = value.ref;
            }
          }
        }
      }
      else{
          // Posa els valors inicials.
          _this.user.reseteja_corrent_objectiu();
      }

	  // 2. Actualitzem el valor del grau d'informació sobre els VP.
	  _this.grau_informacio = Math.round(vp_assigned.size / 21 * 100 * 100)/100;

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

table {
  border-collapse: collapse;
}
table td {
  word-wrap: break-word;
}
.doubletd {
  width: 120px;
}
.doubletd2 {
  width: 240px;
}
.doubletd3 {
  width: 360px;
}
.nd {
  text-align: right;
}
th {
  text-align: center;
}
details summary {
  text-align: left;
}
details summary:hover {
  cursor: pointer;
  text-decoration: underline;
}
details.seccio {
  margin-bottom: 1em;
}
details.seccio > summary {
  font-weight: bold;
  font-size: larger;
}
details.seccio > div {
  padding: 1em;
  background: #eff5fb;
}
input[type="number"] {
  text-align: right;
}

/* Tooltip container */
.tooltip {
  position: relative;
  display: inline-block;
  color: maroon;
  padding: 0px 5px 0px 5px;
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

/* Tooltip text 2 */
.tooltip .tooltiptext2 {
  visibility: hidden;
  width: 400px;
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
.tooltip:hover .tooltiptext,
.tooltip:hover .tooltiptext_ind {
  visibility: visible;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext2,
.tooltip:hover .tooltiptext_ind {
  visibility: visible;
}

.outline-blue{
  border: 1.5px solid #0074c3;
  color: #0074c3;
  outline: none;
}

.background-blue{
  background: #0074c3;
  color: #ffffff;
}

.click-chip, .click-chip-hover{
  padding: 5px 10px;
  border-radius: 50px;
  display: inline-flex;
  margin: 5px;
  cursor: pointer;
}

.click-chip-hover:hover{
  filter: brightness(85%);
}

</style>

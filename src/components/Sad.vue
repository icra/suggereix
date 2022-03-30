<template data-vuetify>
  <div id="intro">
    <details class="seccio" open>
      <summary class="seccio">1. Definició del projecte de reutilització i requeriments de qualitat </summary>
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
            <th colspan="2">Ús d'aigua regenerada</th>
            <th rowspan="3">Unitat</th>
            <th rowspan="3">Referència</th>
          </tr>

          <tr>
            <th colspan="2" rowspan="2">Indicadors de qualitat</th>
            <td colspan="2" class="doubletd">
              Selecciona la infraestructura existent:
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
              <br>
              <div>
                <img src="/img/fase1.png" alt="Diagrama de la infraestructura existent" class="center" style="margin-top:1cm;"> 
              </div>
            </td>

            <td colspan="2" class="doubletd3">
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
            <td colspan="2" style="text-align: right; padding-right: 20px">
              Valors objectius de qualitat (VP)
              <div class="tooltip">
                <button class="btn" v-on:click="modificar_vps"><img src="/img/edit.png" width="20" height="20" /></button>
                <span class="tooltiptext">Modificar valors</span>
              </div>
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
            <td style="text-align: left" class="doubletd">
                <div v-if="key !== 'I22' && key !== 'I23' && key !== 'I1'">
                    <input
                        type="checkbox"
                        v-model="user.corrent.seleccionat[key]"
                    /> {{ user.corrent.seleccionat[key] ? 'Activat' : 'Desactivat' }}
                </div>
                <div v-else>
                    <input
                        type="checkbox"
                        disabled
                    /> Desactivat
                </div>
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

    <details ref="vp-details" class="seccio" close>
      <summary class="seccio">1.1. Consulta i/o modificació dels valors objectius de qualitat VP (opcional)</summary>
      <p>Un cop seleccionats els usos d'aigua regenerada desitjats, aquesta taula mostra i deixa modificar els VP per a tots els indicadors.</p>
      <p>Per defecte, el valor VP que es selecciona per a cada indicador és el valor menor diferent de 'nd'. Si es vol utilitzar un valor VP d'un tipus i ús concret, es pot seleccionar a partir de les caselles de selecció.</p>
      <div>
        <table border="1">
          <tr>
            <th colspan="2" rowspan="2">Indicadors de qualitat</th>
            <th colspan="3" class="doubletd12" v-for="us in usos_seleccionats" :key="us+'_modtable'">{{Usos_info[us].nom}}</th>
          </tr>
          <tr>
            <th v-for="index in usos_seleccionats.length * 3" :key="index+'_modtabletipus'" style="width: 100px">{{(((index+2) % 3)+1) === 1 ? 'VP qualitat ambiental' : (((index+2) % 3)+1) === 2 ? 'VP salut humana' : 'VP per a plantes'}}</th>
          </tr>
          <tr v-for="(val, ind) in user.corrent.qualitat" :key="ind+'_modVP'">
            <td class="doubletd" style="text-align: right; padding: 0px 10px 0px 10px">
              {{ Corrent.info_qualitat[ind].nom }}
            </td>
            <td style="font-family: monospace">
              {{ ind }}
            </td>
            <td v-for="index in (usos_seleccionats.length * 3)" :key="index+'_valueVP'" style='text-align:center; vertical-align:middle'>
                <input
                  type="checkbox"
                  :id="'vpcheck_' + ind + '_' + index + '_' + usos_seleccionats[Math.trunc((index-1)/3)]"
                  :value="'vpcheck_' + ind + '_' + index + '_' + usos_seleccionats[Math.trunc((index-1)/3)]"
                  :ref="'vpcheck_' + ind + '_' + index + '_' + usos_seleccionats[Math.trunc((index-1)/3)]"
                  v-on:click="checkboxVP"
                  :disabled="mod_ind_vps[ind] && ((mod_ind_vps[ind][2] !== (((index+2) % 3)+1) || mod_ind_vps[ind][3] !== usos_seleccionats[Math.trunc((index-1)/3)]))"
                />
                <input
                    v-if="isNaN(Usos_info[usos_seleccionats[Math.trunc((index-1)/3)]].qualitat[ind][(((index+2) % 3)+1)].vp) && selected_input !== ind + '_vpmod_'+index"
                    type="text"
                    :value="Usos_info[usos_seleccionats[Math.trunc((index-1)/3)]].qualitat[ind][(((index+2) % 3)+1)].vp"
                    :ref="ind + '_vpmod_'+index"
                    :id="ind + '_vpmod_'+index"
                    class="nd"
                    style="width: 66.66px"
                    @focus="focusChanged"
                />
                <input
                    v-else-if="ind !== 'I1' && selected_input !== ind + '_vpmod_'+index"
                    type="text"
                    :value="show_sc_not(Usos_info[usos_seleccionats[Math.trunc((index-1)/3)]].qualitat[ind][(((index+2) % 3)+1)].vp)"
                    :ref="ind + '_vpmod_'+index"
                    :id="ind + '_vpmod_'+index"
                    class="nd"
                    style="width: 66.66px"
                    @focus="focusChanged"
                />
                <input
                    v-else
                    type="number"
                    v-model.number="Usos_info[usos_seleccionats[Math.trunc((index-1)/3)]].qualitat[ind][(((index+2) % 3)+1)].vp"
                    style="width: 66.66px"
                    v-on:blur="handleBlur"
                />
                <div v-if="Usos_info[usos_seleccionats[Math.trunc((index-1)/3)]].qualitat[ind][(((index+2) % 3)+1)].regulat" style="color:#17245c;">
                    Regulat
                </div>
                <div v-else style="color:#17245c;">
                    No regulat
                </div>
            </td>
          </tr>
        </table>
      </div>
    </details>

    <details class="seccio" open>
      <summary class="seccio">2. Selecció dels trens de tractament viables (avaluant el compliment dels VPs per tots els contaminants)</summary>
      <div>
        <img src="/img/fase2.png" alt="Diagrama de la selecció dels trens de tractament viables" style="margin-top:1cm;"> 
      </div>
      <div style="text-align: left">
        <button @click="avaluacio_trens">Avaluació trens</button>
        <button @click="eliminar_avaluacio">Esborrar avaluació</button>
      </div>
      <div>
        <div v-if="this.ranquing_trens.length !== 0">
            <div class='my-legend'>
                <div class='legend-scale'>
                <ul class='legend-labels'>
                    <li>
                        <span class="color" style='background:#baffc9;'></span>
                        <span class="legend" style='width:65px;'>VP assolit</span>
                        <span class="color" style='background:#ffdfba;'></span>
                        <span class="legend">VP no assolit (no regulat)</span>
                        <span class="color" style='background:#ffb3ba;'></span>
                        <span class="legend">VP no assolit (regulat)</span>
                    </li>
                </ul>
                </div>
            </div>
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
                          ? '#baffc9' // green
                          : tren.compliments_min[key] === 1
                          ? '#ffdfba'  //orange
                          : '#ffb3ba', //red
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
                          ? '#baffc9' // green
                          : tren.compliments_max[key] === 1
                          ? '#ffdfba'  //orange
                          : '#ffb3ba', //red
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
          <div class='my-legend'>
            <div class='legend-scale'>
                <ul class='legend-labels'>
                    <li>
                        <span class="color" style='background:#baffc9;'></span>
                        <span class="legend" style='width:65px;'>VP assolit</span>
                        <span class="color" style='background:#ffdfba;'></span>
                        <span class="legend">VP no assolit (no regulat)</span>
                        <span class="color" style='background:#ffb3ba;'></span>
                        <span class="legend">VP no assolit (regulat)</span>
                    </li>
                </ul>
            </div>
          </div>
        </div>
      </div>
    </details>

    <details class="seccio" close>
      <summary class="seccio">2.1. Modificació dels tractaments (opcional)</summary>
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

    <details class="seccio" close >
      <summary class="seccio">2.2. Modificació de la reducció acumulada mínima requerida al llarg d'un tren
        (opcional)
      </summary>
      <p>Un cop seleccionats els usos d'aigua regenerada desitjats, aquesta taula mostra i permet modificar els valors de reducció logarítmica per als indicadors microbiològics, p. ex., si es disposa d'una avaluació específica del risc microbiològic.</p>
      <p>Per defecte, els valors de reducció logarítmica definits per a l'ús "recàrrega d'aqüífers per percolació" són els mateixos valors que els definits per a l’ús "recàrrega d'aqüífers per injecció directa" sense tenir en compte l'atenuació natural del medi. Amb una avaluació específica del risc microbiològic, es podria avaluar la capacitat d'atenuació del medi i reduir els valors definits per defecte.</p>
      <div>
        <div>
          <table border="1">
            <tr>
              <th>Ús</th>
              <th colspan="2">Indicador</th>
              <th>Reducció logarítmica</th>
            </tr>
            <tbody v-for="(obj, id) in this.Qualitat_microbiologica" :key="id">
              <tr>
                <td :rowspan="4" class="doubletd2">
                  {{ Usos_info[id] ? Usos_info[id].nom : id }}
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

    <details class="seccio" open>
      <summary class="seccio">3. Avaluació multicriteri dels trens viables</summary>
      <div style="text-align: left">
        <p><b>Considerar trens viables a partir de: </b>
            <input
                class="viables"
                type="number"
                v-model.number="treshold_viables"
                min="0"
                max="100"
                step="1"
            /> % ({{this.ranquing_trens.filter(tren => tren.puntuacio >= treshold_viables).length}} trens viables)
        </p>

        <button @click="avaluacio_trens_multicriteri">Avaluació multicriteri</button>
        <button @click="eliminar_avaluacio_multicriteri">Esborrar avaluació</button>
      </div>
      <div>
        <div v-if="this.trens_multicriteris.length !== 0">
            <div 
                :id="'taula_de_criteris_inicial'"
                v-bind:class="visio_multicriteri === 0 ? 'click-chip-hover background-blue' : 'click-chip-hover outline-blue'"
                @click="canviVisio"
            >
                Taula de criteris inicial
            </div>
            <div 
                :id="'visualitzacio_de_criteris_normalitzats'"
                v-bind:class="visio_multicriteri === 1 ? 'click-chip-hover background-blue' : 'click-chip-hover outline-blue'"
                @click="canviVisio"
            >
                Visualització de criteris normalitzats
            </div>
            <div 
                :id="'avaluacio_multicriteri'"
                v-bind:class="visio_multicriteri === 2 ? 'click-chip-hover background-blue' : 'click-chip-hover outline-blue'"
                @click="canviVisio"
            >
                Priorització dels trens viables
            </div>
          <div v-if="this.visio_multicriteri === 0">
            <table border="1">
                <tr>
                <th rowspan="2">Tren</th>
                <th rowspan="2">id</th>
                <th colspan="2" rowspan="2" class="doubletd">
                    Mitjana del % d'eliminació (I. químics) 
                    <div class="tooltip">
                        <button :id="'eliminacio_quimics'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext">Sort columns</span>
                    </div>
                    
                </th>
                <th colspan="2" rowspan="2" class="doubletd">
                    Mitjana del % d'eliminació (I. microbiològics)
                    <div class="tooltip">
                        <button :id="'eliminacio_microbiologics'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext">Sort columns</span>
                    </div>
                </th>
                <th colspan="2" rowspan="2" class="doubletd">
                    Cost total (€)
                    <div class="tooltip">
                        <button :id="'cost_total'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="doubletd">
                    Consum energètic mitjà (kWh/m3)
                    <div class="tooltip">
                        <button :id="'cons_ene_mitja'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="doubletd">
                    Petjada de carboni (kg CO2 eq./m3)
                    <div class="tooltip">
                        <button :id="'hc'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="doubletd">
                    Petjada hídrica (L eq./m3)
                    <div class="tooltip">
                        <button :id="'hh'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="doubletd">
                    Espai ocupat (m2)
                    <div class="tooltip">
                        <button :id="'espai_ocupat'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="td" style="padding: 10px">
                    Avaluar
                    <br>
                    <input
                        type="checkbox"
                        checked
                        v-on:click="avaluarClick"
                    />
                </th>
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
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_quimics',tren.criteris_agregats['eliminacio_quimics']))">
                    min:
                    </td>
                    <td v-bind:style="'text-align: left; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_quimics',tren.criteris_agregats['eliminacio_quimics']))">
                    {{ Math.round((tren.criteris.eliminacio_min_quimics + Number.EPSILON) * 100) / 100 }}
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_microbiologics',tren.criteris_agregats['eliminacio_microbiologics']))">
                    min:
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_microbiologics',tren.criteris_agregats['eliminacio_microbiologics']))">
                    {{ Math.round((tren.criteris.eliminacio_min_microbiologics + Number.EPSILON) * 100) / 100 }}
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(1-getCriteriPercentage('cost_total',tren.criteris_agregats['cost_total']))">
                    min:
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(1-getCriteriPercentage('cost_total',tren.criteris_agregats['cost_total']))">
                    {{ show_sc_not(tren.criteris.cost_total_min) }}
                    </td>
                    <td
                    rowspan="2"
                    v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(1-getCriteriPercentage('cons_ene_mitja',tren.criteris_agregats['cons_ene_mitja']))"
                    >
                    {{ show_sc_not(tren.criteris.cons_ene_mitja) }}
                    </td>
                    <td
                    rowspan="2"
                    v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(1-getCriteriPercentage('hc',tren.criteris_agregats['hc']))"
                    >
                    {{ show_sc_not(tren.criteris.hc) }}
                    </td>
                    <td
                    rowspan="2"
                    v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(1-getCriteriPercentage('hh',tren.criteris_agregats['hh']))"
                    >
                    {{ show_sc_not(tren.criteris.hh) }}
                    </td>
                    <td
                    rowspan="2"
                    v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(1-getCriteriPercentage('espai_ocupat',tren.criteris_agregats['espai_ocupat']))"
                    >
                    {{ show_sc_not(tren.criteris.espai_ocupat) }}
                    </td>
                    <td
                    rowspan="2"
                    style="text-align: center; padding: 0px 10px 0px 10px;"
                    >
                    <input
                        type="checkbox"
                        v-model="tren.avaluar"
                    />
                    </td>
                </tr>
                <tr :key="id+'_max_multi'">
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_quimics',tren.criteris_agregats['eliminacio_quimics']))">
                    max:
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_quimics',tren.criteris_agregats['eliminacio_quimics']))">
                    {{ Math.round((tren.criteris.eliminacio_max_quimics + Number.EPSILON) * 100) / 100 }}
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_microbiologics',tren.criteris_agregats['eliminacio_microbiologics']))">
                    max:
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_microbiologics',tren.criteris_agregats['eliminacio_microbiologics']))">
                    {{ Math.round((tren.criteris.eliminacio_max_microbiologics + Number.EPSILON) * 100) / 100 }}
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(1-getCriteriPercentage('cost_total',tren.criteris_agregats['cost_total']))">
                    max:
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(1-getCriteriPercentage('cost_total',tren.criteris_agregats['cost_total']))">
                    {{ show_sc_not(tren.criteris.cost_total_max) }}
                    </td>
                </tr>
                </template>
            </table>
          </div>
          <div v-else-if="this.visio_multicriteri === 1">
              <Graph v-bind:trens_multicriteris="trens_multicriteris" v-bind:trens_info="Trens_info"/>
          </div>
          <div v-else-if="this.visio_multicriteri === 2">
              <Avaluacio v-bind:trens_multicriteris="trens_multicriteris" v-bind:trens_info="Trens_info" @resultats="resultatAvaluacio"/>
          </div>
        </div>
      </div>
    </details>

    <details class="seccio" close >
      <summary class="seccio">3.1. Modificació dels rangs de consum i valors dels criteris de cada tractament
        (opcional)
      </summary>
      <p>Per cada tractament es disposa de 4 rangs qualitatius (Baix (B), Mitjà (M), Alt (A) i Molt Alt (MA)) de consum amb determinats valors de criteris. Els valors dels rangs de consum i els valors corresponents dels criteris es poden modificar en aquesta taula.</p>
      <p><b>S'assumeix un temps d'operació de la planta general de: </b>
            <input
                class="viables"
                type="number"
                v-model.number="anys_operacio"
                min="1"
                max="100"
                step="1"
            /> anys
      </p>
      <div>
        <div>
          <table border="1">
            <tr>
              <th>Tractament</th>
              <th>Rang qualitatiu</th>
              <th colspan="2">Rang de cabal (m3/d)</th>
              <th>Consum energètic mitjà (kWh/m3)</th>
              <th>Petjada de carboni (kg CO2 eq./m3)</th>
              <th>Petjada hídrica (L eq./m3)</th>
              <th>Espai ocupat (m2)</th>
              <th>OPEX (€/m3)</th>
              <th>CAPEX mínim (€/m3/d)</th>
              <th>CAPEX màxim (€/m3/d)</th>
            </tr>
            <tbody v-for="(obj, id) in this.Multicriteri_info" :key="id+'_multi'">
              <tr>
                <td :rowspan="5" class="doubletd">
                  {{ id }}
                </td>
              </tr>
              <tr v-for="ind in Object.keys(obj)" :key="ind+'_multi'">
                <td class="doubletd">{{ RangsQualitatius[ind] }}</td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].cap_min"
                    min="0"
                    class="smalltd"
                /></td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].cap_max"
                    min="0"
                    class="smalltd"
                /></td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].cons_ene_mitja"
                    min="0"
                    class="smalltd"
                /></td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].hc"
                    min="0"
                    class="smalltd"
                /></td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].hh"
                    min="0"
                    class="smalltd"
                /></td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].espai_ocupat"
                    min="0"
                    class="smalltd"
                /></td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].opex"
                    min="0"
                    class="smalltd"
                /></td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].capex_min_d"
                    min="0"
                    class="smalltd"
                /></td>
                <td class="smalltd"><input
                    type="number"
                    v-model.number="Multicriteri_info[id][ind].capex_max_d"
                    min="0"
                    class="smalltd"
                /></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </details>
    <details class="seccio" open>
      <summary class="seccio">4. Monitoratge d'un tren de tractaments</summary>
      <div>
          <p>Si s'ha computat la priorització de trens viables (fase 3), en aquest selector apareixeran els trens viables ponderats per puntuació.</p> 
          <p>En cas contrari, apareixeran tots els trens de tractaments considerant la infraestructura existent.</p>
          <p><b>Seleccionar tren de tractament a monitorar: </b>
            <select v-model="tren_monitoratge" style="max-width: 200px">
                <option
                  v-for="obj of selector_monitoratge"
                  :value="obj"
                  :key="obj.codi"
                >
                  {{ obj.selector || obj.nom }}
                </option>
              </select>
          </p>
          <div v-if="tren_monitoratge">
              <Monitoratge v-bind:tren_monitoratge="tren_monitoratge" v-bind:tractament_secundari="tractament_secundari" />
          </div>
      </div>
    </details>

  </div>
</template>

<script>

import Corrent from '../utils/corrent';
import Usuari from '../utils/usuari';
import {llegir_vp_usos,llegir_trens,llegir_tractaments,llegir_tractaments_micro,llegir_caract_efluent_secundari,llegir_qualitat_micro,llegir_multicriteri} from "../utils/llegir_excels";
import {avaluar_multicriteris, normalitzaCriteris, obtenirExtremCriteris, agregaCriteris} from "../utils/multicriteri";
import Graph from './Graph.vue';
import Avaluacio from './Avaluacio.vue';
import Monitoratge from './Monitoratge.vue';

export default {
  name: 'Sad',
  components: { Graph, Avaluacio, Monitoratge },
  data: function(){
    return {
      user: new Usuari(),       //objecte
      selected_input: "",
	  grau_informacio: 0,		// grau d'informació dels VP pels usos seleccionats.
      tractament_secundari: "", //tractament secundari infraestructura
      ranquing_trens: [],       //array de trens ordenats per compliments
      usos_seleccionats: [],    //ús o usos seleccionats per l'usuari
      trens_multicriteris: [],  //array de trans viables amb els seus multicriteris calculats.
      visio_multicriteri: 0,    //Variable que indica la visió activa de l'apartat multicriteri.
      modify_vp_open: false,    //Variable que indica si el panell de modificació dels VP està obert o no.
      mod_ind_vps: {},          //diccionari on hi haurà el valor VP de cada indicador que l'usuari hagi modificat.
      treshold_viables: 100,    //treshold a partir de quan considerem un tren com a viable.
      multicriteri_order: [],   //order of the multicriteri table.
      anys_operacio: 0,
      ind_seleccionats: {},     //indicadors seleccionats per valorar trens viables.
      selector_monitoratge: [], //selector del tren a monitorar.
      tren_monitoratge: "",     //tren del monitoratge seleccionat.
      llest_monitoratge: false, //variable per saber si el monitoratge està llest.

      //backend
      Usuari,                   //classe
      Corrent,                  //classe
      Tractaments_info: {},     //diccionari tots els tractaments
	  Tractaments_m_info: {},   //diccionari tractaments amb punt de referència 1 (microbiològics).
      Trens_info: {},           //diccionari tots els trens
      Usos_info: {},              //diccionari tots els usos
      Efluents_info: {},          //diccionari efluents (primari/secundari) de l'infraestructura existent
	  Qualitat_microbiologica: {}, //diccionari amb qualitats microbiològiques.
      Multicriteri_info: {},       //diccionari amb la informació de l'avaluació multicriteri.
      PercentColors: [
        { pct: 0.0, color: { r: 255, g: 199, b: 199 } },
        { pct: 0.5, color: { r: 236, g: 223, b: 202 } },
        { pct: 1.0, color: { r: 217, g: 247, b: 205 } } ],
      RangsQualitatius: {
        0: 'Baix (B)',
        1: 'Mitjà (M)',
        2: 'Alt (A)',
        3: 'Molt Alt (MA)'
      }
    }
  },
  created: async function() {
    // llegir excel 'tractaments'
    this.read_file('/20220309_SUGGEREIX_PT4_Tractaments.xlsx', 'tractaments');

    // llegir excel 'tractaments' per a punt de referència 1 (indicadors microbiològics).
    this.read_file('/20211004_SUGGEREIX_Taula_B5.xlsx', 'tractaments_micro');

    // llegir excel 'trens'
    this.read_file('/20220315_SUGGEREIX_Taula_Trens.xlsx', 'trens');

    // llegir excel 'efluent secundari' (característiques infraestructura existent)
    //this.read_file('/SUGGEREIX_PT2_Taulest.xlsx', 'efluent');

    // llegir excel 'valors protectors usos'
    this.read_file('/20211214_SUGGEREIX_Taules_A7.0_A7.1.xlsx', 'usos');

	// llegir excel 'monitoratge de la qualitat autobiològica', que mostra el % de reducció Rmin per a terns de tractament dels indicadors microbiològics.
	this.read_file('20211004_SUGGEREIX_Taula_A8.xlsx', 'qualitat_microbiologica');

    // llegir excel 'Avaluació multicriteri', que mostra els criteris a considerar amb cadascun dels tractaments.
	this.read_file('/20211111_SUGGEREIX_Criteris_add.xlsx', 'multicriteri');

  },
  methods:{
    sort_multicriteri(event) {
        let _this = this;
        const column = event.currentTarget.id;
        if(!_this.multicriteri_order.length || _this.multicriteri_order[0] !== column){
            _this.multicriteri_order = [column, 'asc'];
            _this.trens_multicriteris.sort((a, b) => b.criteris_agregats[column] < a.criteris_agregats[column]);
            return;
        }
        if(_this.multicriteri_order[1] === 'asc'){
            _this.multicriteri_order[1] = 'desc';
            _this.trens_multicriteris.sort((a, b) => a.criteris_agregats[column] < b.criteris_agregats[column]);
        }
        else{
            _this.multicriteri_order = [];
            _this.trens_multicriteris.sort((a, b) => Number(b.id) < Number(a.id));
        }
    },
    avaluarClick(event) {
		let _this = this;
        _this.trens_multicriteris = _this.trens_multicriteris.map(tren => ({...tren, avaluar: event.target.checked}));
    },
    checkboxVP(event) {
		let _this = this;
        const [,ind,index,us] = event.target.id.split("_");
        if(event.target.checked){
            const vp_object = _this.Usos_info[_this.usos_seleccionats[Math.trunc((index-1)/3)]].qualitat[ind][(((index+2) % 3)+1)];
            _this.mod_ind_vps = {
                ..._this.mod_ind_vps,
                [ind]: [vp_object.vp, vp_object.ref, (((index+2) % 3)+1), us, vp_object.regulat]
            };
        }
        else{
            _this.mod_ind_vps = {
                ..._this.mod_ind_vps,
                [ind]: undefined
            };
        }
    },
    focusChanged(event) {
		let _this = this;
		_this.selected_input = event.target.id;
    },
	handleBlur(event){
		let _this = this;
		_this.selected_input = "";
	},
    canviVisio(event){
        let _this = this;
		if(event.target.id === 'taula_de_criteris_inicial') _this.visio_multicriteri = 0;
        else if(event.target.id === 'visualitzacio_de_criteris_normalitzats') _this.visio_multicriteri = 1;
        else if(event.target.id === 'avaluacio_multicriteri') _this.visio_multicriteri = 2;
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
        else if (type === 'trens'){
            _this.Trens_info = await llegir_trens(binaryData);
        }
        else if (type === 'efluent')
          _this.Efluents_info = await llegir_caract_efluent_secundari(binaryData);
        else if (type === 'usos')
          _this.Usos_info = await llegir_vp_usos(binaryData);
		else if (type === 'qualitat_microbiologica')
		  _this.Qualitat_microbiologica = await llegir_qualitat_micro(binaryData);
        else if (type === 'multicriteri'){
          const res = await llegir_multicriteri(binaryData);
		  _this.Multicriteri_info = res[0];
          _this.anys_operacio = res[1];
        }
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
      let max_puntuacio = 0;
      _this.ind_seleccionats = JSON.parse(JSON.stringify(_this.user.corrent.seleccionat));

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
        _this.trens_multicriteris = [];
        _this.llest_monitoratge = false;
        for (const [key, tren] of Object.entries(dict_trens)) {
          let array_tractaments = tren['array_tractaments'];
          let primer_tractament = array_tractaments[0];
          let tren_aplicable = (efluent_secundari.includes('FAC_DS') && primer_tractament !== 'BRM') ||
              (efluent_secundari.includes('BRM') && primer_tractament === 'BRM') ||
              (efluent_secundari.includes('DP') && primer_tractament === 'BRM');
        
          if(tren_aplicable){
            let min_max = _this.user.corrent.aplica_tren_tractaments(array_tractaments, dict_tractaments, dict_tractaments_m, efluent_secundari,key);

            //l'avaluació es fa en base als valors de concentració màxims i mínims comparats als valors protectors segons els usos.
            const n_indicadors = Object.values(_this.ind_seleccionats).filter(selected => selected).length;
            const avaluacio_compliments_max = min_max.max.n_compliments('max',_this.ind_seleccionats,_this.user.corrent_objectiu, _this.Qualitat_microbiologica, _this.usos_seleccionats, _this.user.corrent.qualitat, _this.Usos_info);
			const avaluacio_compliments_min = min_max.min.n_compliments('min',_this.ind_seleccionats,_this.user.corrent_objectiu, _this.Qualitat_microbiologica, _this.usos_seleccionats, _this.user.corrent.qualitat, _this.Usos_info);
			const max_length = Object.values(avaluacio_compliments_max).filter(value => value === 0);
            const max_length_noref = Object.values(avaluacio_compliments_max).filter(value => value === 0 || value === 1);
            const puntuacio = Math.round((((max_length.length / n_indicadors) * 100) + Number.EPSILON) * 100) / 100;
            if(puntuacio > max_puntuacio) max_puntuacio = puntuacio;
            const puntuacio_noref = Math.round((((max_length_noref.length / n_indicadors) * 100) + Number.EPSILON) * 100) / 100;


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
        _this.treshold_viables = max_puntuacio;
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
      const treshold_viables = _this.treshold_viables;

      // No es pot fer la valoració multicriteri si no s'ha fet abans l'avaluació de trens.
      if(!ranquing_trens.length){
          alert("Primer cal avaluar els trens de tractament.");
          return;
      }

      // S'obtenen els trens viables. Si no n'hi ha, no es pot fer la valoració multicriteri.
      let trens_viables = ranquing_trens.filter(tren => tren.puntuacio >= treshold_viables);
      if(!trens_viables.length){
          alert("No es poden avaluar els criteris ja que no s'ha obtingut cap tren de tractament viable.");
          return;
      }

      _this.llest_monitoratge = false;

      // Es pot haver modificat els costos o el temps d'operació de planta, així que cal recalcular el 'capex_min' i 'capex_max'.
      Object.keys(_this.Multicriteri_info).map((key, index) => {
          Object.keys(_this.Multicriteri_info[key]).map((key2, index2) => {
              _this.Multicriteri_info[key][key2].capex_max = _this.Multicriteri_info[key][key2].capex_max_d / (_this.anys_operacio * 365)
              _this.Multicriteri_info[key][key2].capex_min = _this.Multicriteri_info[key][key2].capex_min_d / (_this.anys_operacio * 365)
          });
      });

      // Ara cal calcular el valor de cadascun dels 10 criteris per cada tren i agregar els seus valors en 7 criteris.
      const criteris_trens = [];
      for(const tren of trens_viables){
          const criteris = avaluar_multicriteris(tren, _this.Trens_info, _this.Multicriteri_info);
          const criteris_agregats = agregaCriteris(criteris);
          criteris_trens.push({
              id: tren.id,
              criteris: criteris,
              criteris_agregats: criteris_agregats
          });
      }

      // Agregació i normalització de criteris.
      const trens_criteris_norm = {};
      const extrem_criteris = obtenirExtremCriteris(criteris_trens);
      for(const criteri_tren of criteris_trens) {
          trens_criteris_norm[criteri_tren.id] = normalitzaCriteris(criteri_tren.criteris_agregats, extrem_criteris);
      }

      // Guardar el resultat.
      _this.trens_multicriteris = criteris_trens.map(tren => {
          tren.criteris_norm = trens_criteris_norm[tren.id];
          tren.avaluar = true;
          return tren;
      });

    },

    //funció que s'executa des del component avaluació per a transmetre els resultats.
    resultatAvaluacio(trens_cc){
        const _this = this;

        const trens_monitoratge = [];
        let counter = 1; 
        for(const tren of trens_cc){
            const cc = Math.round((tren.cc + Number.EPSILON) * 100) / 100
            const tren_obj = {
                ...tren, 
                codi: tren.id, 
                selector: counter+". "+_this.Trens_info[tren.id].nom+" ("+cc+")",
                array_tractaments: _this.Trens_info[tren.id].array_tractaments
            };
            trens_monitoratge.push(tren_obj);
            counter += 1;
        }
        _this.llest_monitoratge = true;
        _this.tren_monitoratge = "";
        _this.selector_monitoratge = trens_monitoratge;
    },

    //reseteja el ranquing de trens (array buit)
    eliminar_avaluacio(){
      this.ranquing_trens = [];
      this.trens_multicriteris = [];
      this.llest_monitoratge = false;
    },

    //reseteja el ranquing d'avaluacions multicriteri (array buit)
    eliminar_avaluacio_multicriteri(){
      this.trens_multicriteris = [];
      this.llest_monitoratge = false;
    },

    modificar_vps(){
        this.modify_vp_open = true;
        const el = this.$refs['vp-details'];
        if (el) {
            el.scrollIntoView({behavior: 'smooth'});
        }
    },

	// retorna cert si cal mostrar nota en un ús.
	mostrar_nota_dummy: function (id){
		return id === 'Dummy9' || id === 'Dummy10' || id === 'Dummy11' || id === 'Dummy14';
	},

	// retorna l'etiqueta a mostrar en un ús.
	nota_dummy: function(id){
		if(id === 'Dummy9' || id === 'Dummy10') return 'Caldria fer una avaluació específica del risc microbiològic: estimació de l’exposició i definició de mesures de control. Els valors de reducció de patògens mínims (requerits per a un tren de tractament) definits per defecte en el SAD es basen en una estimació feta a partir dels valors legislats segons el Reial decret 1620/2007.';
		else if(id === 'Dummy11') return 'Caldria fer una avaluació específica del risc microbiològic. Seguint un criteri conservador, els valors de reducció de patògens definits per defecte en el SAD són els mateixos valors que els necessaris per tractar l’aigua per a l’ús de recàrrega d’aqüífers per injecció directa.';
		else if(id === 'Dummy14') return 'El SAD no defineix valors de reducció de patògens per defecte. Però, caldria assolir els valors de reducció de patògens necessaris per a l’ús "Prepotable" si l’aigua s’utilitzés amb aquesta finalitat més avall.';
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
      else return isNaN(_this.user.corrent_objectiu.qualitat[id]);
    },

    //retorna l'string amb el rang de valors a mostrar pel valor protector de l'indicador 'id'.
    nota_rang_vp: function (id){
      let _this = this;
      // Primer es comprova si el valor VP és undefined.
      if(isNaN(_this.user.corrent_objectiu.qualitat[id])) return "Valor no definit";
      // Diccionari de rangs en funció de l'indicador 'id' (en el cas particular del I1 varia en funció de l'ús).
      const ids_us_dict = {
        'I1': _this.usos_seleccionats.includes('Dummy15') ? 'rang: 6,5-9,5' : 'rang: 6-9',
        'I6': 'rang: 2-31',
        'I7': 'rang: 2-3',
        'I8': 'rang: 30-500',
        'I9': 'rang: 4-20'
      };
      return ids_us_dict[id];
      
    },

    //Function that updated the VP values (due to use changes or to VP values change).
    update_vps: function(){
        let _this = this;
        let vp_assigned = new Set();
        if (_this.usos_seleccionats.length > 0){
            // Per a cada indicador, comprova si l'usuari ha preseleccionat valor o bé cal agafar el mínim.
            for(const ind in _this.user.corrent.qualitat){
                if(_this.mod_ind_vps[ind]){
                    _this.user.corrent_objectiu.qualitat[ind] = _this.mod_ind_vps[ind][0];
                    _this.user.corrent_objectiu.refs[ind] = _this.mod_ind_vps[ind][1];
                    _this.user.corrent_objectiu.regulat[ind] = _this.mod_ind_vps[ind][4];
                    if(_this.mod_ind_vps[ind][0] !== 'nd' && ind !== 'I22' && ind !== 'I23') vp_assigned.add(ind);
                }
                else{
                    // Cal agafar el valor mínim de tots els usos seleccionats. Buscar el el diccionari de usos.
                    let vp_value = 'nd';
                    let vp_ref = '';
                    let vp_regulat = false;
                    for(const us of _this.usos_seleccionats){
                        for (const [key, value] of Object.entries(_this.Usos_info[us].qualitat[ind])) {
                            if(value.vp !== 'nd'){
                                if(vp_value === 'nd' || value.vp < vp_value){
                                    if(ind !== 'I22' && ind !== 'I23') vp_assigned.add(ind);
                                    vp_value = value.vp;
                                    vp_ref = value.ref;
                                    vp_regulat = value.regulat;
                                }
                            }
                        }
                    }
                    _this.user.corrent_objectiu.qualitat[ind] = vp_value;
                    _this.user.corrent_objectiu.refs[ind] = vp_ref;
                    _this.user.corrent_objectiu.regulat[ind] = vp_regulat;
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

    getCriteriPercentage: function(criteri, valor) {
        const criteri_array = this.trens_multicriteris.map(tren => tren.criteris_agregats[criteri]);
        const criteri_min = Math.min(...criteri_array);
        const criteri_max = Math.max(...criteri_array);
        return((valor - criteri_min) / (criteri_max - criteri_min));
    },

    //aquesta funció retorna un color de vermell a verd depenent del percentatge especificat entre 0 i 1.
    getColorForPercentage: function(pct) {
        for (var i = 1; i < this.PercentColors.length - 1; i++) {
            if (pct < this.PercentColors[i].pct) {
                break;
            }
        }
        var lower = this.PercentColors[i - 1];
        var upper = this.PercentColors[i];
        var range = upper.pct - lower.pct;
        var rangePct = (pct - lower.pct) / range;
        var pctLower = 1 - rangePct;
        var pctUpper = rangePct;
        var color = {
            r: Math.floor(lower.color.r * pctLower + upper.color.r * pctUpper),
            g: Math.floor(lower.color.g * pctLower + upper.color.g * pctUpper),
            b: Math.floor(lower.color.b * pctLower + upper.color.b * pctUpper)
        };
        return 'rgb(' + [color.r, color.g, color.b].join(',') + ')';
        // or output as hex if preferred
    }  
  },
  computed: {
    // Variable que conté la informació de qualitats filtrades sense els indicadors desactivats.
    info_qualitats: function () {
        return Object.fromEntries(Object.entries(this.Corrent.info_qualitat).filter(([key]) => this.ind_seleccionats[key]));
    }
  },
  watch: {
    //actualitza la qualitat del corrent_objectiu (usuari), en funció de si es modifica un valor de la taula dels VP.
    Usos_info:{
        handler: function(newVal, oldVal) {
            this.update_vps();
        },
        deep: true
    },

    mod_ind_vps: function(newUse,oldUse) {
        this.update_vps();
    },

    //actualitza la qualitat del corrent_objectiu (usuari), en funció dels vp mínims dels usos seleccionats.
    usos_seleccionats: function (newUse, oldUse){
      const _this = this;
      //quan es canvia l'ús, s'ha de revisar que no hi hagi un VP modificat d'un ús que s'ha tret.
      if(oldUse.length > newUse.length){
        //cal treure els VP modificats de l'ús que s'ha tret.
        const us_eliminat = oldUse.filter(x => newUse.indexOf(x) === -1)[0];
        for (const ind of Object.keys(_this.mod_ind_vps)) {
          if(_this.mod_ind_vps[ind] && _this.mod_ind_vps[ind][3] === us_eliminat){
              //treure l'ús i desmarcar el checkbox de la taula.
              const tipus = _this.mod_ind_vps[ind][2];
              const index = (oldUse.indexOf(us_eliminat) * 3) + tipus;
              const ref = "vpcheck_" + ind + "_" + index + "_" + us_eliminat;
              const el = this.$refs[ref];
              if(el && el[0]) el[0].checked = false;
              _this.mod_ind_vps = {
                  ..._this.mod_ind_vps,
                  [ind]: undefined
              }
          }
        }
      }
      _this.update_vps();
    },

    //actualitza els valors inicial de qualitat de l'aigua (usuari) en funció de l'efluent secundari seleccionat.
    tractament_secundari: function (newUse, oldUse){
      let _this = this;
      _this.user.corrent.qualitat = Usuari.info_tractaments_secundaris[newUse].qualitat;
      if(!_this.llest_monitoratge){
        _this.tren_monitoratge = "";
        _this.selector_monitoratge = Object.values(_this.Trens_info).filter(tren => {
            return (newUse.includes('FAC_DS') && tren.array_tractaments[0] !== 'BRM') ||
                (newUse.includes('BRM') && tren.array_tractaments[0] === 'BRM') ||
                (newUse.includes('DP') && tren.array_tractaments[0] === 'BRM');
        });
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
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
.smalltd {
  width: 110px;
}
.doubletd {
  width: 120px;
}
.doubletd12 {
  width: 200px;
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
  width: 140px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 1;
}

.viables {
  width: 50px;
}

.center {
  display: block;
  margin-left: auto;
  margin-right: auto;
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

.my-legend .legend-title {
    text-align: left;
    margin-bottom: 5px;
    font-weight: bold;
    font-size: 90%;
}
.my-legend .legend-scale ul {
    margin: 0;
    margin-bottom: 5px;
    margin-top: 5px;
    padding: 0;
    float: left;
    list-style: none;
}
.my-legend .legend-scale ul li {
    display:inline;
    font-size: 80%;
    list-style: none;
    margin-left: 0;
    line-height: 18px;
    margin-bottom: 2px;
}
.my-legend ul.legend-labels li .color {
    display: block;
    float: left;
    height: 16px;
    width: 20px;
    margin-right: 5px;
    margin-left: 0;
    border: 1px solid #999;
}
.my-legend ul.legend-labels li  .legend {
    display: block;
    float: left;
    height: 16px;
    width: 150px;
    margin-right: 5px;
    margin-left: 0;
}

.my-legend a {
    color: #777;
}

</style>

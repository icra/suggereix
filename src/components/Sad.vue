<template data-vuetify>
  <div id="intro">
    <a id="downloadAnchorElem" style="display:none"></a>
    <details class="seccio">
        <summary class="seccio">0. Gestió de dades (descarregar, carregar, restaurar) </summary>
        <div>
            <p><b>A. Descarregar l'estat actual</b></p> 
            <button @click="descarregar_estat">Descarregar</button>
            <p>Descarrega l'estat actual de la pàgina per tal de poder-lo carregar en properes sessions.</p>
            <p><b>B. Carregar estat</b></p> 
            <input id="estat-file" type="file" />
            <button @click="carregar_estat">Carregar</button>
            <p>Carrega un estat previ de la pàgina a la sessió actual.</p>
        </div>
    </details>
    <details class="seccio" open>
      <summary class="seccio">1. Definició del projecte de reutilització i requeriments de qualitat </summary>
      <div>
        <table border="1">
          <tr>
            <th colspan="2">
              Capacitat tractament (m<sup>3</sup>/d):
              <input
                type="number"
                v-model.number="user.corrent.Q"
                min="0" step="1"
                style="max-width: 75px"
              />
              <br>
              Factor sobre el cabal màxim (%):
              <input
                type="number"
                v-model.number="user.corrent.F"
                min="0" step="1" max="100"
                style="max-width: 40px"
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
                <img src="/img/fase1.png" alt="Diagrama de la infraestructura existent" class="center" style="margin-top:10px;width: 400px;"> 
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
              <div v-html="Info_indicadors[key] ? Info_indicadors[key].name_rich : ''"></div>
            </td>
            <td style="font-family: monospace">
              {{ key }}
            </td>
            <td>
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
            <td>
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
            <td style="text-align: left" class="doubletd">
                <div v-if="key !== 'I1'">
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
                <i class="fa-regular fa-circle-question"></i>
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
              <div v-html="Info_indicadors[key] ? Info_indicadors[key].unitats_rich : ''"></div>
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
              <div v-html="Info_indicadors[ind] ? Info_indicadors[ind].name_rich : ''"></div>
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

    <details class="seccio" close >
      <summary class="seccio">1.2. Modificació de la reducció acumulada mínima requerida al llarg d'un tren
        (opcional)
      </summary>
      <p>Un cop seleccionats els usos d'aigua regenerada desitjats, aquesta taula mostra i permet modificar els valors de reducció logarítmica per als indicadors microbiològics, p. ex., si es disposa d'una avaluació específica del risc microbiològic.</p>
      <div>
        <div>
          <table border="1">
            <tr>
              <th>Ús</th>
              <th colspan="2">Indicador</th>
              <th>Reducció logarítmica</th>
              <th>Recomanació</th>
            </tr>
            <tbody v-for="(obj, id) in this.Qualitat_microbiologica" :key="id">
              <tr>
                <td :rowspan="4" class="doubletd2">
                  {{ Usos_info[id] ? Usos_info[id].nom : Usos_info[id.replace('Dummy','')] ? Usos_info[id.replace('Dummy','')].nom : id.replace('Dummy','SAD') }}
                </td>
              </tr>
              <tr v-for="ind in Object.keys(obj)" :key="ind">
                <td style="font-family: monospace">{{ ind }}</td>
                <td>
                    <div v-html="Info_indicadors[ind] ? Info_indicadors[ind].name_rich : ''"></div>
                </td>
                <td>
                  <input
                    type="number"
                    v-model.number="obj[ind][1]"
                    
                    :ref="id + '_' + ind"
                    :id="id + '_' + ind"
                    class="nd"
                  />
                </td>
                <td class="doubletd3" :rowspan="4" v-if="ind === Object.keys(obj)[0]">
                    <p style="padding-left: 5px;padding-right: 5px;" align="justify" v-if="id === 'Dummy11'">Els valors de reducció logarítmica definits per defecte són els mateixos valors que els definits per a l’ús recàrrega d'aqüífers per injecció directa sense tenir en compte l'atenuació natural del medi. Amb una avaluació específica del risc microbiològic, es podria avaluar la capacitat d'atenuació del medi i reduir els valors definits per defecte. </p>
                    <p style="padding-left: 5px;padding-right: 5px;" align="justify" v-else-if="id === 'Dummy14'">Manquen valors guia a la normativa, i el SAD conté valors de reducció logarítmica definits per defecte semblants als definits per a l'ús agrícola. Caldria assolir els valors de reducció necessaris per a l'ús prepotable si l’aigua s’utilitzés amb aquesta finalitat més avall.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </details>

    <details class="seccio" open>
      <summary class="seccio">2. Selecció dels trens de tractament viables (avaluant el compliment dels VPs per tots els contaminants)</summary>
      <div class="container">
          <div class="item1">
            <img src="/img/fase2.png" alt="Diagrama de la selecció dels trens de tractament viables" style="margin-top:1cm;"> 
          </div>
          <div class="item2">
            <table border="1">
                <tr style="background-color: #d4e9fd;">
                    <th>Tractament</th>
                    <th>Descripció</th>
                </tr>
                <tbody>
                    <tr v-for="abr in Object.keys(Abreviacions_tractament).slice(0, Math.ceil(Object.keys(Abreviacions_tractament).length / 2)-1)" :key="abr+'_abr'">
                        <td style="min-width: 90px;">
                            <div v-html="Tractaments_dict[abr] || abr"></div>
                        </td>
                        <td class="doubletd3">
                            <i>{{Abreviacions_tractament[abr]}}</i>
                        </td>
                    </tr>
                </tbody>
            </table>
          </div>
          <div class="item2">
            <table border="1">
                <tr style="background-color: #d4e9fd;">
                    <th>Tractament</th>
                    <th>Descripció</th>
                </tr>
                <tbody>
                    <tr v-for="abr in Object.keys(Abreviacions_tractament).slice(-(Math.ceil(Object.keys(Abreviacions_tractament).length / 2)+1))" :key="abr+'_abr'">
                        <td style="min-width: 90px;">
                            <div v-html="Tractaments_dict[abr] || abr"></div>
                        </td>
                        <td class="doubletd3">
                            <i>{{Abreviacions_tractament[abr]}}</i>
                        </td>
                    </tr>
                </tbody>
            </table>
          </div>
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
                        <span class="color" style='background:#bbbbbb;'></span>
                        <span class="legend">Inclou eficiències no definides</span>
                    </li>
                </ul>
                </div>
            </div>
          <div class="sticky">
          <table class="sticky evenodd" border="1">
            <tr>
              <th colspan="2" rowspan="2">Tren</th>
              <th rowspan="2">id</th>
              <th rowspan="2" colspan="2">Compliment (%)</th>
              <th colspan="21">Concentracions dels indicadors</th>
            </tr>

            <tr>
              <th
                v-for="val in info_qualitats"
                :key="val.code"
                class="sticky2 indlength"
                style="
                  font-family: monospace;
                  text-align: left;
                  padding: 0px 5px 0px 3px;
                "
              >
                <div class="tooltip" style="color: inherit">
                  {{ val.code }}
                  <span class="tooltiptext_ind" style="font-size: 10px; margin-top: 30px">
                    <div v-html="val.name_rich"></div>
                  </span>
                </div>
                <div class="tooltip" style="color: inherit">
                  <div v-html="'('+val.unitats_rich+')'" style="font-size: 10px; font-family: monospace; word-wrap: break-word;"></div>
                  <span class="tooltiptext_ind" style="font-size: 10px; margin-top: 15px">
                    <div v-html="val.name_rich"></div>
                  </span>
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
                    <div v-html="Trens_dict[Trens_info[tren.id].nom]"></div>
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
                  v-for="val in info_qualitats"
                  style="font-family: monospace"
                >
                  <td
                    :key="val.code+'_aval_min'"
                    :style="{
                      background:
                        tren.compliments_min[val.code] === 0
                          ? '#baffc9' // green
                          : tren.compliments_min[val.code] === 1 && ne_dict[tren.id] && ne_dict[tren.id][val.code].min
                          ? 'linear-gradient(to top right, #ffdfba 49.5%, #bbbbbb 50.5%)'  //orange
                          : tren.compliments_min[val.code] === 1 
                          ? '#ffdfba'  //orange
                          : tren.compliments_min[val.code] === 2 && ne_dict[tren.id] && ne_dict[tren.id][val.code].min
                          ? 'linear-gradient(to top right, #ffb3ba 49.5%, #bbbbbb 50.5%)' //red
                          : '#ffb3ba'
                    }"
                    style="
                      font-size: small;
                      text-align: left;
                      padding: 0px 5px 0px 5px;
                    "
                  >
                    {{ show_sc_not(tren.concentracio.min.qualitat[val.code]) }}
                  </td>
                </template>
              </tr>
              <tr :key="id+'_max'">
                <td style="text-align: right; padding: 0px 5px 0px 5px">
                  max:
                </td>
                <template
                  v-for="val in info_qualitats"
                  style="font-family: monospace"
                >
                  <td
                    :key="val.code+'_aval_max'"
                    :style="{
                      background:
                        tren.compliments_max[val.code] === 0
                          ? '#baffc9' // green
                          : tren.compliments_max[val.code] === 1 && ne_dict[tren.id] && ne_dict[tren.id][val.code].max
                          ? 'linear-gradient(to top right, #ffdfba 49.5%, #bbbbbb 50.5%)'  //orange
                          : tren.compliments_max[val.code] === 1 
                          ? '#ffdfba'  //orange
                          : tren.compliments_max[val.code] === 2 && ne_dict[tren.id] && ne_dict[tren.id][val.code].max
                          ? 'linear-gradient(to top right, #ffb3ba 49.5%, #bbbbbb 50.5%)' //red
                          : '#ffb3ba'
                    }"
                    style="
                      font-size: small;
                      text-align: left;
                      padding: 0px 5px 0px 5px;
                    "
                  >
                    {{ show_sc_not(tren.concentracio.max.qualitat[val.code]) }}
                  </td>
                </template>
              </tr>
            </template>
          </table>
          </div>
        </div>
      </div>
    </details>

    <details class="seccio" close>
      <summary class="seccio">2.1. Modificació dels tractaments (opcional)</summary>
      <div>
        <button style="margin-bottom: 10px;" @click="read_file('/20220518_SUGGEREIX_PT4_Tractaments.xlsx', 'tractaments');">Restaurar valors per defecte</button>
        <div>
          <table border="1">
            <tr style="background-color: #d4e9fd;">
              <th style="padding: 5px;">Tractament</th>
              <th style="padding: 5px;">Pretractament</th>
              <th style="padding: 5px;">Editar tractament</th>
            </tr>
            <tbody
              v-for="(tra, nom_tra) in this.Tractaments_info"
              :key="nom_tra"
            >
              <tr>
                <td :rowspan="1 + Object.keys(tra).length">
                    <div v-html="Tractaments_dict[nom_tra] || nom_tra"></div>
                </td>
              </tr>
              <tr v-for="(pre, nom_pre) in tra" :key="nom_tra+'_'+nom_pre">
                <td>
                    <div v-html="Tractaments_dict[nom_pre] || nom_pre"></div>
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
                            <div v-html="Info_indicadors[id] ? Info_indicadors[id].name_rich : ''"></div>
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
            <div class="sticky">
            <table class="sticky evenodd" border="1">
                <tr>
                <th rowspan="2">Tren</th>
                <th rowspan="2">id</th>
                <th rowspan="2" class="doubletd">Compliment (%)</th>
                <th colspan="2" rowspan="2" class="doubletd">
                    Mitjana del % d'eliminació (I. químics) 
                    <div class="tooltip">
                        <button :id="'eliminacio_quimics'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext" style="margin-top: 20px;">Sort columns</span>
                    </div>
                    
                </th>
                <th colspan="2" rowspan="2" class="doubletd">
                    Mitjana del % d'eliminació (I. microbiològics)
                    <div class="tooltip">
                        <button :id="'eliminacio_microbiologics'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext" style="margin-top: 20px;">Sort columns</span>
                    </div>
                </th>
                <th colspan="2" rowspan="2" class="doubletd">
                    Cost total (€/d)
                    <div class="tooltip">
                        <button :id="'cost_total'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext" style="margin-top: 20px;">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="doubletd">
                    Consum energètic mitjà (kWh/d)
                    <div class="tooltip">
                        <button :id="'cons_ene_mitja'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext" style="margin-top: 20px;">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="doubletd">
                    Petjada de carboni (kg CO<sub>2</sub> eq./d)
                    <div class="tooltip">
                        <button :id="'hc'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext" style="margin-top: 20px;">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="doubletd">
                    Petjada hídrica (L eq./d)
                    <div class="tooltip">
                        <button :id="'hh'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext" style="margin-top: 20px;">Sort columns</span>
                    </div>
                </th>
                <th rowspan="2" class="doubletd">
                    Espai ocupat (m<sup>2</sup>)
                    <div class="tooltip">
                        <button :id="'espai_ocupat'" v-on:click="sort_multicriteri"><img src="/img/sort.png" alt="Sort columns" class="center" style="width: 10px"></button>
                        <span class="tooltiptext" style="margin-top: 20px;">Sort columns</span>
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
                    <td
                    rowspan="2"
                    v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(getCriteriPercentage('puntuacio',tren.criteris_agregats['puntuacio']))">
                    {{ tren.criteris_agregats['puntuacio'] }}
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_quimics',tren.criteris_agregats['eliminacio_quimics']))">
                    min:
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_quimics',tren.criteris_agregats['eliminacio_quimics']))">
                    {{ Math.round((tren.criteris.eliminacio_quimics_min + Number.EPSILON) * 100) / 100 }}
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_microbiologics',tren.criteris_agregats['eliminacio_microbiologics']))">
                    min:
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_microbiologics',tren.criteris_agregats['eliminacio_microbiologics']))">
                    {{ Math.round((tren.criteris.eliminacio_microbiologics_min + Number.EPSILON) * 100) / 100 }}
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
                    {{ Math.round((tren.criteris.eliminacio_quimics_max + Number.EPSILON) * 100) / 100 }}
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 5px 0px 5px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_microbiologics',tren.criteris_agregats['eliminacio_microbiologics']))">
                    max:
                    </td>
                    <td v-bind:style="'text-align: right; padding: 0px 10px 0px 10px; background-color: '+getColorForPercentage(getCriteriPercentage('eliminacio_microbiologics',tren.criteris_agregats['eliminacio_microbiologics']))">
                    {{ Math.round((tren.criteris.eliminacio_microbiologics_max + Number.EPSILON) * 100) / 100 }}
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
          </div>
          <div v-else-if="this.visio_multicriteri === 1">
              <Graph v-bind:trens_multicriteris="trens_multicriteris" v-bind:trens_info="Trens_info"/>
          </div>
          <div v-else-if="this.visio_multicriteri === 2">
              <Avaluacio v-bind:trens_multicriteris="trens_multicriteris" v-bind:trens_info="Trens_info" @resultats="resultatAvaluacio" v-bind:prop_pes_criteris="av_pes_criteris" v-bind:prop_criteris_a_considerar="av_criteris_a_considerar" v-bind:prop_metode="av_metode" @changeData="avChangeData" />
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
              <th colspan="2">Rang de cabal (m<sup>3</sup>/d)</th>
              <th>Consum energètic mitjà (kWh/m<sup>3</sup>)</th>
              <th>Petjada de carboni (kg CO<sub>2</sub> eq./m<sup>3</sup>)</th>
              <th>Petjada hídrica (L eq./m<sup>3</sup>)</th>
              <th>Espai ocupat (m<sup>2</sup>)</th>
              <th>OPEX (€/m<sup>3</sup>)</th>
              <th>CAPEX mínim (€/m<sup>3</sup>/d)</th>
              <th>CAPEX màxim (€/m<sup>3</sup>/d)</th>
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
      <summary class="seccio">4. Monitoratge d'un tren de tractament</summary>
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
              <Monitoratge v-bind:tren_monitoratge="tren_monitoratge" v-bind:tractament_secundari="tractament_secundari" 
              v-bind:info_monitoratge="Info_monitoratge" v-bind:metodes_monitoratge="Metodes_monitoratge" v-bind:info_rich="Info_rich" v-bind:indicadors_seleccionats="user.corrent.seleccionat" v-bind:ind_to_code="Ind_to_code" v-bind:abreviacions_met_mon="Abrevicions_met_mon" v-bind:info_indicadors="Info_indicadors" v-bind:tractaments_info="Tractaments_info" v-bind:user="user" v-bind:usos_seleccionats="usos_seleccionats" v-bind:mon_per_ind_quim="Mon_per_ind_quim" v-bind:capacitat="user.corrent.Q * user.corrent.F / 100" v-bind:mon_code_to_ind="Mon_code_to_ind" v-bind:mon_per_ind_micro="Mon_per_ind_micro" v-bind:qualitat_microbiologica="Qualitat_microbiologica" v-bind:prop_visio_monitoratge="mon_visio_monitoratge" @changeData="avChangeData" />
          </div>
      </div>
    </details>
    <details class="seccio" open>
      <summary class="seccio">5. Casos similars</summary>
      <div>
          <p>Si s'ha computat la priorització de trens viables (fase 3), en aquest selector apareixeran els trens viables ponderats per puntuació.</p> 
          <p>En cas contrari, apareixeran tots els trens de tractaments considerant la infraestructura existent.</p>
          <p><b>Seleccionar tren de tractament a obtenir casos similars: </b>
            <select v-model="tren_casos" style="max-width: 200px">
                <option
                  v-for="obj of selector_monitoratge"
                  :value="obj"
                  :key="obj.codi"
                >
                  {{ obj.selector || obj.nom }}
                </option>
              </select>
          </p>
          <div v-if="tren_casos && tren_casos.referencies.length">
              <div class="sticky">
                <table class="sticky extraborder" border="1">
                <tr>
                    <th rowspan="2" class="doubletd2">Nom de la planta existent</th>
                    <th rowspan="2" class="doubletd2">Localització</th>
                    <th rowspan="2" class="doubletd">Entitat Gestora</th>
                    <th rowspan="2" class="doubletd">Any de posada en marxa</th>
                    <th rowspan="2" class="doubletd">Cabal de disseny (m<sup>3</sup>)</th>
                    <th rowspan="2" class="doubletd">Tren de tractament</th>
                </tr>
                <tr />
                <template v-for="ref in tren_casos.referencies">
                    <tr :key="ref+'_cas_'+tren_casos.nom" style="height: 14px;">
                        <td style="text-align: right; padding: 5px;">
                            <div v-html="Casos_us[ref].nom_planta" />
                        </td>
                        <td style="text-align: center; padding: 5px;">
                            {{obtenirEmplacament(Casos_us[ref])}}
                            <a target="_blank" class="btn" :href="'https://www.google.com/maps/place/'+Casos_us[ref].latitud+','+Casos_us[ref].longitud"><i class="fa-solid fa-map-location-dot"></i></a>
                        </td>
                        <td style="text-align: center; padding: 5px;">
                            <div v-html="Casos_us[ref].entitat_gestora" />
                        </td>
                        <td style="text-align: center; padding: 5px;">
                            <div v-html="(!Casos_us[ref].any_inici || Casos_us[ref].any_inici === 'n.a.' ? no_definit : Casos_us[ref].any_inici)" />
                        </td>
                        <td style="text-align: center; padding: 5px;">
                            <div v-html="(!Casos_us[ref].cabal || Casos_us[ref].cabal === 'n.a.') ? no_definit : Casos_us[ref].cabal" />
                        </td>
                        <td style="text-align: center; padding: 5px;">
                            <div v-html="Casos_us[ref].tecnologies" />
                        </td>
                    </tr>
                </template>
                </table>
            </div>
          </div>
          <div v-else-if="tren_casos">
              <p><i style="color:red">El tren seleccionat no disposa de casos similars.</i></p>
          </div>
      </div>
    </details>

  </div>
</template>

<script>

import Corrent from '../utils/corrent';
import Usuari from '../utils/usuari';
import {llegir_vp_usos,llegir_trens,llegir_tractaments,llegir_caract_efluent_secundari,llegir_qualitat_micro,llegir_multicriteri, llegir_indicadors, llegir_monitoratge, llegir_metodes_monitoratge, llegir_abreviacio_tractaments, llegir_mon_per_ind_quim, llegir_mon_per_ind_micro, llegir_casos_us} from "../utils/llegir_excels";
import {avaluar_multicriteris, normalitzaCriteris, obtenirExtremCriteris, agregaCriteris} from "../utils/multicriteri";
import Graph from './Graph.vue';
import Avaluacio from './Avaluacio.vue';
import Monitoratge from './Monitoratge.vue';

export default {
  name: 'Sad',
  components: { Graph, Avaluacio, Monitoratge },
  data: function(){
    return {
      user: new Usuari({}),       //objecte
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
      tren_casos: "",           //tren de casos similars seleccionat.
      llest_monitoratge: false, //variable per saber si el monitoratge està llest.
      no_definit: '<i style="color:red">No definit</i>',
      ne_dict: {},              //diccionari de trens i els seus indicadors per a saber si algun pot ser 'ne'.

      av_criteris_a_considerar: undefined,
      av_pes_criteris: undefined,
      av_metode: undefined,
      mon_visio_monitoratge: undefined,

      //backend
      Usuari,                   //classe
      Corrent,                  //classe
      Tractaments_info: {},     //diccionari tots els tractaments
      Trens_info: {},           //diccionari tots els trens,
      Trens_dict: {},           //diccionari dels rich names per trens.
      Tractaments_dict: {},     //diccionari dels rich names per tractaments.
      Abreviacions_tractament: {}, //diccionari de les abreviacions dels tractaments.
      Usos_info: {},              //diccionari tots els usos
      Efluents_info: {},          //diccionari efluents (primari/secundari) de l'infraestructura existent
	  Qualitat_microbiologica: {}, //diccionari amb qualitats microbiològiques.
      Multicriteri_info: {},       //diccionari amb la informació de l'avaluació multicriteri.
      Info_indicadors: {},         //diccionari amb informació sobre els indicadors.
      Info_indicadors_types: [],   //array amb informació sobre els tipus indicadors.
      Info_monitoratge: {},        //objecte amb informació sobre el monitoratge dels indicadors per determinats tractaments.
      Abrevicions_met_mon: {}, //objecte amb les abreviacions dels metodes de monitoratge
      Info_rich: {},           //objecte amb informació sobre els textos enriquits per mostrar amb sup sub o italic.
      Metodes_monitoratge: {},     //objecte que conté la informació dels mètodes que s'utilitzen per a cada parametre i tipus de freqüència.
      Ind_to_code: {},             //diccionari per passar de noms a codis d'indicadors.
      Mon_per_ind_quim: {},       //diccionari del monitoratge periòdic d'indicadors químics.
      Mon_code_to_ind: {},        //diccionari que converteix el codi del paràmetre de monitoratge a indicador.
      Mon_per_ind_micro: {},      //diccionari del monitoratge periòdic d'indicadors químics.
      Casos_us: {},                //diccionari de casos d'ús per a un tren del SAD.
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
    this.read_file('/20220526_SUGGEREIX_PT4_Tractaments.xlsx', 'tractaments');

    // llegir excel 'trens'
    this.read_file('/20220518_SUGGEREIX_Taula_Trens_v2.xlsx', 'trens');

    // llegir excel 'efluent secundari' (característiques infraestructura existent)
    //this.read_file('/SUGGEREIX_PT2_Taulest.xlsx', 'efluent');

    // llegir excel 'valors protectors usos'
    this.read_file('/20220526_SUGGEREIX_Taules_A7.0_A7.1.xlsx', 'usos');

	// llegir excel 'monitoratge de la qualitat autobiològica', que mostra el % de reducció Rmin per a terns de tractament dels indicadors microbiològics.
	this.read_file('20220605_SUGGEREIX_Taula_A8.xlsx', 'qualitat_microbiologica');

    // llegir excel 'Avaluació multicriteri', que mostra els criteris a considerar amb cadascun dels tractaments.
	this.read_file('/20211111_SUGGEREIX_Criteris_add.xlsx', 'multicriteri');

    // llegir excel 'descripcio_indicadors'
    this.read_file('/20220407_SUGGEREIX_Taula_C7.xlsx', 'descripcio_indicadors');

    // llegir excel 'monitoratge'.
    this.read_file('/20220524_SUGGEREIX_Taula_C1.xlsx', 'monitoratge');

    // llegir excel 'metodes_monitoratge'.
    this.read_file('/20220421_SUGGEREIX_Taula_A4.xlsx', 'metodes_monitoratge');

    // llegir excel 'abreviacions tractaments'.
    this.read_file('/20220419_SUGGEREIX_Taula_C8.xlsx', 'abreviacio_tractaments');

    // llegir excel 'monitoratge periòdic dels indicadors químics'.
    this.read_file('/20220323_SUGGEREIX_Taula_C3.xlsx', 'mon_per_ind_quim');

    // llegir excel 'monitoratge periòdic dels indicadors químics'.
    this.read_file('/20220120_SUGGEREIX_Taula_C5.xlsx', 'mon_per_ind_micro');

    // llegir excel 'casos d'ús'
    this.read_file('/20220420_SUGGEREIX_PT1_Casos.xlsx','casos_us')
    
  },
  methods:{
    obtenirEmplacament (cas_us){
        let text = cas_us.emplacament && cas_us.pais ? cas_us.emplacament+", "+cas_us.pais : cas_us.emplacament || cas_us.pais;
        text += " (Lat: " + Math.round((cas_us.latitud + Number.EPSILON) * 100) / 100 + ', Long: ' + Math.round((cas_us.longitud + Number.EPSILON) * 100) / 100 + ")";
        return text;
    },
    mostraUsos(usos){
        const _this = this;
        if(usos.length) return usos.map(us => _this.Usos_info[us] ? _this.Usos_info[us].nom : '<i style="color:red">No definit</i>').join('; ');
        else return '<i style="color:red">No definits</i>'
    },
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
        else if (type === 'trens'){
            const res = await llegir_trens(binaryData);
            _this.Trens_info = res[0];
            _this.Trens_dict = res[1];
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
        else if (type === 'descripcio_indicadors'){
          const res = await llegir_indicadors(binaryData);
          _this.Info_indicadors = res[0];
          _this.Info_indicadors['Cabal'] = {
            name: 'Cabal',
            name_rich: 'Cabal',
            type: "1.1. Paràmetres de monitoratge continu ",
            unitats: "m3/d",
            unitats_rich: "m<sup>3</sup>/d"
          }
          _this.Info_indicadors_types = res[1];
        }
        else if (type === 'monitoratge'){
          const res = await llegir_monitoratge(binaryData);
          _this.Info_monitoratge = res[0];
          _this.Info_rich = res[1];
          _this.Ind_to_code = res[2];
        }
        else if (type === 'metodes_monitoratge'){
            const res = await llegir_metodes_monitoratge(binaryData);
            _this.Metodes_monitoratge = res[0];
            _this.Mon_code_to_ind = res[1];
            _this.Mon_code_to_ind['Cabal'] = 'Cabal';
            _this.Mon_code_to_ind['OT1'] = 'N-nitrosodimetilamina (NDMA)';
            _this.Mon_code_to_ind['OT2'] = 'Triclorometà';
            _this.Mon_code_to_ind['OT3'] = 'Clorat';
            _this.Mon_code_to_ind['OT4'] = 'Clorit';
            _this.Mon_code_to_ind['OT5'] = 'Bromat';
            _this.Abrevicions_met_mon = res[2];
        }
        else if (type === 'abreviacio_tractaments'){
            const res = await llegir_abreviacio_tractaments(binaryData);
            _this.Tractaments_dict = res[1];
            _this.Abreviacions_tractament = res[0];
        }
        else if (type === 'mon_per_ind_quim'){
            _this.Mon_per_ind_quim = await llegir_mon_per_ind_quim(binaryData);
        }
        else if (type === "mon_per_ind_micro"){
            _this.Mon_per_ind_micro = await llegir_mon_per_ind_micro(binaryData);
        }
        else if (type === "casos_us"){
            _this.Casos_us = await llegir_casos_us(binaryData);
        }
      }

    },

    // funcio per a descarregar l'estat actual de la pàgina.
    descarregar_estat: function () {
        // 1. guardar les variables d'estat que ens interessen (les que estan a la llista).
        const to_save = ["grau_informacio", "tractament_secundari", "ranquing_trens", "usos_seleccionats", "trens_multicriteris", "visio_multicriteri", "modify_vp_open", "mod_ind_vps", "treshold_viables", "multicriteri_order", "anys_operacio", "ind_seleccionats", "selector_monitoratge", "tren_monitoratge", "tren_casos", "llest_monitoratge", "Usos_info", "Multicriteri_info", "user", "Tractaments_info", "Qualitat_microbiologica", "Multicriteri_info", "Info_indicadors", "Info_indicadors_types", "Info_monitoratge", "Info_rich", "Metodes_monitoratge","ne_dict","av_criteris_a_considerar","av_pes_criteris","mon_visio_monitoratge"];
        const data_to_save = {};
        for(const [key, value] of Object.entries(this._data)){
            if(to_save.includes(key)){
                data_to_save[key] = value;
            }
        }

        // 2. Crear el nom del fitxer a descarregar.
        let date = new Date();
        date = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toJSON().slice(0,16);
        date = date.replace(":","-");
        const nom_fitxer = "suggereix_"+date+".data";

        // Descarregar el fitxer.
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(data_to_save));
        const dlAnchorElem = document.getElementById('downloadAnchorElem');
        dlAnchorElem.setAttribute("href", dataStr);
        dlAnchorElem.setAttribute("download", nom_fitxer);
        dlAnchorElem.click();
    },

    // funcio per a carregar l'estat (es fa 2 vegades perquè funcioni).
    carregar_estat_intern: function(){
        const _this = this;
        const estat_file = document.getElementById("estat-file").files[0];
        if(!estat_file){
            alert("Primer cal seleccionar un fitxer d'estat del SAD Suggereix.");
            return;
        }
        const fr = new FileReader();
        fr.readAsText(estat_file, "UTF-8");
        fr.onload = async function (evt) {
            try{
                const data = JSON.parse(evt.target.result);
                for(const [key,value] of Object.entries(data)){
                    if(key !== "user") _this[key] = value;
                }
                await new Promise(r => setTimeout(r, 500));
                if(data.tren_monitoratge) _this.tren_monitoratge = data.tren_monitoratge;
                if(data.tren_casos) _this.tren_casos = data.tren_casos;
                // Processar usuari.
                const usuari = new Usuari(_this.Info_indicadors);
                for(const [key, value] of Object.entries(data.user.corrent)){
                    if(key === "I11") console.log(value);
                    usuari.corrent[key] = value;
                }
                for(const [key, value] of Object.entries(data.user.corrent_objectiu)){
                    if(key === "I11") console.log(value);
                    usuari.corrent_objectiu[key] = value;
                }
                _this.user = usuari;
            } catch(err){
                alert("Error al llegir el fitxer.");
                return;
            }
        }
        fr.onerror = function (evt) {
            alert("Error al llegir el fitxer.");
            return;
        }
    },

    // funcio per a carregar un estat de la pàgina a la sessió actual.
    carregar_estat: function () {
        this.carregar_estat_intern();
    },

    //actualitza  l'array amb el rànquing de trens, ordenats de més grau de compliment, a menys.
    avaluacio_trens: function (){

      let _this = this;
      let dict_tractaments = _this.Tractaments_info;
      let efluent_secundari = _this.tractament_secundari;
      let dict_trens = _this.Trens_info;
      let avaluacio_trens = [];
      let max_puntuacio = 0;
      _this.ind_seleccionats = JSON.parse(JSON.stringify(_this.user.corrent.seleccionat));

      if(isNaN(_this.user.corrent.Q) || _this.user.corrent.Q < 1 || _this.user.corrent.Q >= 1000000 || !Number.isInteger(_this.user.corrent.Q)){
          alert("Capacitat de tractament invàlida");
          return;
      }
      else if(isNaN(_this.user.corrent.F) || _this.user.corrent.F < 1 || _this.user.corrent.F > 100 || !Number.isInteger(_this.user.corrent.F)){
          alert("Factor de la capacitat de tractament invàlid");
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
            let min_max = undefined;
            try{  
                const res = _this.user.corrent.aplica_tren_tractaments(_this.Info_indicadors, array_tractaments, dict_tractaments, efluent_secundari,key);
                min_max = res[0];
                _this.ne_dict[key] = res[1];
            } catch(err){
                // prova re-llegirnt excel 'tractaments'
                alert("ERROR: És possible que la taula de tractaments estigui desactualitzada. No s'han pogut avaluar els trens, però s'han restaurat els nous valors per defecte de la taula de tractaments. Torni a provar l'avaluació per a veure si s'ha solucionat el problema.");
                _this.read_file('/20220518_SUGGEREIX_PT4_Tractaments.xlsx', 'tractaments');
                throw new Error(err);
            }
            //l'avaluació es fa en base als valors de concentració màxims i mínims comparats als valors protectors segons els usos.
            const n_indicadors = Object.values(_this.ind_seleccionats).filter(selected => selected).length;
            const avaluacio_compliments_max = min_max.max.n_compliments('max',_this.ind_seleccionats,_this.user.corrent_objectiu, _this.Qualitat_microbiologica, _this.usos_seleccionats, _this.user.corrent.qualitat, _this.Info_indicadors);
			const avaluacio_compliments_min = min_max.min.n_compliments('min',_this.ind_seleccionats,_this.user.corrent_objectiu, _this.Qualitat_microbiologica, _this.usos_seleccionats, _this.user.corrent.qualitat, _this.Info_indicadors);
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
          const capacitat = _this.user.corrent.Q * _this.user.corrent.F / 100
          const criteris = avaluar_multicriteris(tren, _this.Trens_info, _this.Multicriteri_info, _this.Info_indicadors, capacitat);
          const criteris_agregats = agregaCriteris(criteris);
          criteris_trens.push({
              id: tren.id,
              criteris: criteris,
              criteris_agregats: criteris_agregats
          });
      }

      // Agregació i normalització de criteris.
      const trens_criteris_norm = {};
      const trens_criteris_no_agregats_norm = {};
      const extrem_criteris = obtenirExtremCriteris(criteris_trens.map(criteris_tren => criteris_tren.criteris_agregats));
      const extrem_criteris_no_agregats = obtenirExtremCriteris(criteris_trens.map(criteris_tren => criteris_tren.criteris));
      for(const criteri_tren of criteris_trens) {
          trens_criteris_norm[criteri_tren.id] = normalitzaCriteris(criteri_tren.criteris_agregats, extrem_criteris);
          trens_criteris_no_agregats_norm[criteri_tren.id] = normalitzaCriteris(criteri_tren.criteris, extrem_criteris_no_agregats);
      }

      // Guardar el resultat.
      _this.trens_multicriteris = criteris_trens.map(tren => {
          tren.criteris_norm = trens_criteris_norm[tren.id];
          tren.criteris_no_agregats_norm = trens_criteris_no_agregats_norm[tren.id];
          tren.avaluar = true;
          return tren;
      });

    },

    avChangeData(param, data){
      this[param] = data;
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
                array_tractaments: _this.Trens_info[tren.id].array_tractaments,
                referencies: _this.Trens_info[tren.id].referencies
            };
            trens_monitoratge.push(tren_obj);
            counter += 1;
        }
        _this.llest_monitoratge = true;
        _this.tren_monitoratge = "";
        _this.tren_casos = "";
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
                    _this.user.corrent_objectiu.tipus_vp[ind] = _this.mod_ind_vps[ind][2];
                    _this.user.corrent_objectiu.regulat[ind] = _this.mod_ind_vps[ind][4];

                    if(_this.mod_ind_vps[ind][0] !== 'nd') vp_assigned.add(ind);
                }
                else{
                    // Cal agafar el valor mínim de tots els usos seleccionats. Buscar el el diccionari de usos.
                    let vp_value = 'nd';
                    let vp_ref = '';
                    let vp_regulat = false;
                    let vp_tipus = 1;
                    for(const us of _this.usos_seleccionats){
                        for (const [key, value] of Object.entries(_this.Usos_info[us].qualitat[ind])) {
                            if(value.vp !== 'nd'){
                                if(vp_value === 'nd' || value.vp < vp_value){
                                    vp_assigned.add(ind);
                                    vp_value = value.vp;
                                    vp_ref = value.ref;
                                    vp_regulat = value.regulat;
                                    vp_tipus = key;
                                }
                            }
                        }
                    }
                    _this.user.corrent_objectiu.qualitat[ind] = vp_value;
                    _this.user.corrent_objectiu.refs[ind] = vp_ref;
                    _this.user.corrent_objectiu.regulat[ind] = vp_regulat;
                    _this.user.corrent_objectiu.tipus_vp[ind] = vp_tipus;
                }
            }
        }
        else{
            // Posa els valors inicials.
            _this.user.reseteja_corrent_objectiu(_this.Info_indicadors);
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
        const info_qualitats_obj = Object.fromEntries(Object.entries(this.Info_indicadors).filter(([key]) => this.ind_seleccionats[key]));
        const info_qualitats = [];
        for(const [key,val] of Object.entries(info_qualitats_obj)){
            info_qualitats.push({...val, code: key});
        }
        return info_qualitats.sort((a,b) => a.code.substring(1) - b.code.substring(1));
    }
  },
  watch: {
    // crea l'usuari un cop es tingui informació dels indicadors.
    Info_indicadors:{
        handler: function(newVal, oldVal) {
            if(newVal && Object.keys(oldVal).length === 0){
              this.user = new Usuari(newVal);
            }
        },
        deep: true
    },
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
        _this.tren_casos = "";
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
.smalltd2 {
  width: 60px;
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
  cursor: help;
}

.tooltip2 {
  color: maroon;
  padding: 0px 5px 0px 5px;
  cursor: help;
}

/* Tooltip text */
.tooltip .tooltiptext,
.tooltip2 .tooltiptext {
  visibility: hidden;
  width: 140px;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 0;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 20;
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
  z-index: 20;
}

.tooltip .tooltiptext_ind {
  visibility: hidden;
  width: auto;
  background-color: black;
  color: #fff;
  text-align: center;
  padding: 5px 5px;
  border-radius: 6px;

  /* Position the tooltip text - see examples below! */
  position: absolute;
  z-index: 20;
}

/* Show the tooltip text when you mouse over the tooltip container */
.tooltip:hover .tooltiptext,
.tooltip:hover .tooltiptext_ind,
.tooltip:hover .tooltiptext2,
.tooltip2:hover .tooltiptext {
  visibility: visible;
  display: block;
  z-index: 20;
  cursor: help;
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
    width: 180px;
    margin-right: 5px;
    margin-left: 0;
}

.my-legend a {
    color: #777;
}

/* Sticky table style*/
div.sticky {
  display: inline-block;
  height: 600px;
  overflow: auto;
  width: 100%;
}

table.sticky {
    padding-left: 2px; padding-right: 2px; margin-left: 2px; margin-right: 2px;
}

table.sticky th {
  position: sticky;
  top: 0;
  z-index: 1;
  background-color: #d4e9fd;
}

th.indlength {
  width: 30px;
}

table.sticky th.sticky2 {
  position: sticky;
  top: 21px;
  z-index: 1;
  background-color: #d4e9fd;
}

table.evenodd tr:nth-child(odd) {
    border-bottom: 1px dashed black;
}

table.evenodd tr:nth-child(even) {
    border-bottom: 2px solid black;
}

table.evenodd tr:nth-child(2) {
    border-bottom: 4px solid black;
}

table.extraborder tr:nth-child(2) {
    border-bottom: 4px solid black;
}

.container {
  display: flex;
}

.item1 {
  flex-basis: 500px;
  margin: 5px;
}

.item2 {
  flex-basis: 700px;
  margin: 5px;
}

</style>

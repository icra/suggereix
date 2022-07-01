// Aquest fitxer conté funcions que executen la avaluació multicriteri sobre trens de tractament.

// Importa la llibreria que s'encarrega de la lògica fuzzy.
import {
    variable,
    triangle,
    defuzz,
    or
} from "@thi.ng/fuzzy";

// Diccionari constant amb el ID del criteri i si és beneficios o no.
const DICT_CRI_BENEFICIOSOS = {
    eliminacio_quimics: true,
    eliminacio_microbiologics: true,
    cons_ene_mitja: false,
    cost_total: false,
    espai_ocupat: false,
    hc: false,
    hh: false,
    puntuacio: true,
    cost_capex: false,
    cost_opex: false
}
const DICT_CRI_BENEFICIOSOS_NO_AGREGATS = {
    eliminacio_quimics_min: true,
    eliminacio_quimics_max: true,
    eliminacio_microbiologics_min: true,
    eliminacio_microbiologics_max: true,
    cost_total_min: false,
    cost_total_max: false,
    cost_capex_min: false,
    cost_capex_max: false
}

// Diccionari constant amb els criteris que poden ser intervals de màxims i mínims.
export const DICT_CRI_INTERVAL = {
    eliminacio_quimics: true,
    eliminacio_microbiologics: true,
    cost_total: true,
    cost_capex: true
}

// Diccionari constant amb el ID del criteri i el seu nom.
export const DICT_CRI_NOMS = {
    eliminacio_quimics: 'Mitjana % d\'eliminació (I. químics)',
    eliminacio_microbiologics: "Mitjana % d'eliminació (I. microbiològics)",
    cons_ene_mitja: "Consum energètic mitjà (kWh/d)",
    cost_total: "Mitjana del cost total (€/d)",
    espai_ocupat: "Espai ocupat (m2)",
    hc: "Petjada de carboni (kg CO2 eq./d)",
    hh: "Petjada hídrica (L eq./d)",
    puntuacio: "Compliment (%)",
    cost_capex: "Mitjana del cost CAPEX (€/d)",
    cost_opex: "Cost OPEX (€/d)"
}

// Diccionari de pesos.
export const DICT_PES_CRITERIS = {
    eliminacio_quimics: 'M',
    eliminacio_microbiologics: 'M',
    cost_total: 'H',
    cons_ene_mitja: 'H',
    espai_ocupat: 'M',
    hc: 'M',
    hh: 'M',
    puntuacio: 'M',
    cost_capex: 'M',
    cost_opex: 'M'
}

// Diccionari dels criteris a considerar.
export const DICT_CRITERIS_A_CONSIDERAR = {
    eliminacio_quimics: false,
    eliminacio_microbiologics: false,
    cost_total: true,
    cons_ene_mitja: true,
    espai_ocupat: true,
    hc: true,
    hh: true,
    puntuacio: true,
    cost_capex: false,
    cost_opex: false
}

// Variable constant amb la paleta de colors.
const COLOR_PALETTE_BORDER = [
    "rgb(136, 204, 238)",
    "rgb(204, 102, 119)",
    "rgb(221, 204, 119)",
    "rgb(17, 119, 51)",
    "rgb(170, 68, 153)",
    "rgb(68, 170, 153)",
    "rgb(153, 153, 51)",
    "rgb(136, 34, 85)",
    "rgb(102, 17, 0)",
    "rgb(102, 153, 204)",
    "rgb(136, 136, 136)"
];

const COLOR_PALETTE_BACKGROUND = [
    "rgba(136, 204, 238, 0.2)",
    "rgba(204, 102, 119, 0.2)",
    "rgba(221, 204, 119, 0.2)",
    "rgba(17, 119, 51, 0.2)",
    "rgba(170, 68, 153, 0.2)",
    "rgba(68, 170, 153, 0.2)",
    "rgba(153, 153, 51, 0.2)",
    "rgba(136, 34, 85, 0.2)",
    "rgba(102, 17, 0, 0.2)",
    "rgba(102, 153, 204, 0.2)",
    "rgba(136, 136, 136, 0.2)"
];

// Retorna la mitjana dels valors d'un array.
const mitjana = (array) => {
    const sum = array.reduce((a, b) => a + b, 0);
    const avg = ((sum / array.length) || 0)*100;
    return avg;
}

// Funció que calcula el percentatge d'eliminació mitjà.
const perElimMitja = (eliminacions, info_indicadors,tipus_ind) => {

    // Obtenir tots els % d'eliminació dels indicadors que ens interessa i calcular la mitjana.
    const array_eliminacions = [];
    for (const [indicador, eliminacio] of Object.entries(eliminacions)) {
        if(tipus_ind === 'quimics' && !info_indicadors[indicador].type.startsWith("3. ")){
            array_eliminacions.push(eliminacio);
        }
        else if(tipus_ind !== 'quimics' && info_indicadors[indicador].type.startsWith("3. ")) {
            array_eliminacions.push(eliminacio);
        }
    }
    return mitjana(array_eliminacions);
}

// Aquesta funció obté els criteris del tractament corresponent.
const obtenirCriterisTractament = (tractament, info_multicriteris) => {

    // Grups de tractament: PER REVISAR 'O3_UV'
    if(tractament === 'CAP' || tractament === 'CAG') tractament = 'CAP_CAG';
    else if(['Cl2','ClO2','NaClO','UV','Cloramines'].includes(tractament)) tractament = 'DES';
    else if(tractament === 'O3_UV') tractament = 'O3';

    // Retornar el valor.
    return info_multicriteris[tractament];
}

//I found this function here : https://www.tutorialspoint.com/decimal-count-of-a-number-in-javascript
const decimalCount = num => {
    // Convert to String
    const numStr = String(num);
    // String Contains Decimal
    if (numStr.includes('.')) {
       return numStr.split('.')[1].length;
    };
    // String Does Not Contain Decimal
    return 0;
}

// Obté la variable de capacitat com a input de la fuzzificació.
const getFuzzyInput = (tractament_criteris) => {
    return {
        capacity: variable([tractament_criteris[0].cap_min, tractament_criteris[3].cap_max], {
            low: triangle(tractament_criteris[0].cap_min, tractament_criteris[0].cap_min, tractament_criteris[0].cap_max),
            medium: triangle(tractament_criteris[0].cap_min, tractament_criteris[1].cap_min, tractament_criteris[1].cap_max),
            high: triangle(tractament_criteris[1].cap_min, tractament_criteris[2].cap_min, tractament_criteris[2].cap_max),
            very_high: triangle(tractament_criteris[2].cap_min, tractament_criteris[3].cap_min, tractament_criteris[3].cap_max)
        })
    }
}

// Aplica una fuzzificació en funció de la capacitat, rangs, i criteri a calcular.
const applyFuzzy = (capacitat, tractament_criteris, criteri) => {

    // Obtenir les variables d'entrada i la variable de sortida a partir del criteri.
    const inputs = getFuzzyInput(tractament_criteris);
    let criteri_3 = tractament_criteris[3][criteri];
    let criteri_2 = tractament_criteris[2][criteri];
    let criteri_1 = tractament_criteris[1][criteri];
    let criteri_0 = tractament_criteris[0][criteri];
    // La llibreria topsis dona problemes si el criteri_3 i 2 i el criteri_1 i 0 són iguals, cal incrementar artificialment un decimal si són iguals.
    if(criteri_3 === criteri_2){
        let count = decimalCount(criteri_2)+1;
        // Per alguna raó més 5 decimals no detecta el nombre com a diferent, així que màxim s'ha d'incrementar el decimal 5è, encara que el nombre sigui més gran.
        if(count > 5) count = 5;
        let criteri_2_new = criteri_2 + (10 ** -count)
        criteri_2 = criteri_2_new;
    }
    if(criteri_1 === criteri_0){
        let count = decimalCount(criteri_0)+1;
        // Per alguna raó més 5 decimals no detecta el nombre com a diferent, així que màxim s'ha d'incrementar el decimal 5è, encara que el nombre sigui més gran.
        if(count > 5) count = 5;
        let criteri_0_new = criteri_0 + (10 ** -count)
        criteri_0 = criteri_0_new;
    }


    const outputs = {
        [criteri]: variable([criteri_3, criteri_0], {
            low: triangle(criteri_3, criteri_3, criteri_2),
            medium: triangle(criteri_3, criteri_2, criteri_1),
            high: triangle(criteri_2, criteri_1, criteri_0),
            very_high: triangle(criteri_1, criteri_0, criteri_0)
        }),
    };

    // Ceració de les regles.
    const rules = [
        or ({
            capacity: "low"
        }, {
            [criteri]: "very_high"
        }),
        or ({
            capacity: "medium"
        }, {
            [criteri]: "high"
        }),
        or ({
            capacity: "high"
        }, {
            [criteri]: "medium"
        }),
        or ({
            capacity: "very_high"
        }, {
            [criteri]: "low"
        }),
    ];

    // Execució i retorn de la defuzzificació.
    const value = defuzz(
        inputs,
        outputs,
        rules,
        // input values
        { capacity: capacitat },
    )[criteri];
    return value;
}

// Aquesta funció calcula el cost total (mínim o màxim depenent de 'type') del tren.
const costTotal = (tren, info_trens, info_multicriteris, capacitat, type) => {

    // Creació de la variable que emmagatzema el cost total i s'anirà incrementant per a cada tractament del tren.
    let cost_total = 0;
    const tren_info = Object.values(info_trens).find(info_tren => Number(info_tren.codi) === Number(tren.id));

    for(const tractament of tren_info.array_tractaments){
        // Per cada tren obtenim els rangs de criteris en funció de la capacitat, a partir d'aquí executem la fuzzyficació.
        const tractament_criteris = obtenirCriterisTractament(tractament, info_multicriteris);
        const cost_opex = applyFuzzy(capacitat, tractament_criteris, 'opex');
        const cost_capex = applyFuzzy(capacitat, tractament_criteris, 'capex_'+type);
        // El cost total és el OPEX i el CAPEX (diaris) multiplicat per el temps de vida de la planta.
        cost_total += ((cost_opex + cost_capex)*capacitat);
    }
    return cost_total;
}

// Aquesta funció calcula el cost OPEX del tren.
const costOpex = (tren, info_trens, capacitat, info_multicriteris) => {

    // Creació de la variable que emmagatzema el cost total i s'anirà incrementant per a cada tractament del tren.
    let cost = 0;
    const tren_info = Object.values(info_trens).find(info_tren => Number(info_tren.codi) === Number(tren.id));

    for(const tractament of tren_info.array_tractaments){
        // Per cada tren obtenim els rangs de criteris en funció de la capacitat, a partir d'aquí executem la fuzzyficació.
        const tractament_criteris = obtenirCriterisTractament(tractament, info_multicriteris);
        const cost_opex = applyFuzzy(capacitat, tractament_criteris, 'opex');
        // El cost total és el OPEX i el CAPEX (diaris) multiplicat per el temps de vida de la planta.
        cost += (cost_opex*capacitat);
    }
    return cost;
}

// Aquesta funció calcula el cost CAPEX (mínim o màxim depenent de 'type') del tren.
const costCapex = (tren, info_trens, info_multicriteris, capacitat, type) => {

    // Creació de la variable que emmagatzema el cost total i s'anirà incrementant per a cada tractament del tren.
    let cost = 0;
    const tren_info = Object.values(info_trens).find(info_tren => Number(info_tren.codi) === Number(tren.id));

    for(const tractament of tren_info.array_tractaments){
        // Per cada tren obtenim els rangs de criteris en funció de la capacitat, a partir d'aquí executem la fuzzyficació.
        const tractament_criteris = obtenirCriterisTractament(tractament, info_multicriteris);
        const cost_capex = applyFuzzy(capacitat, tractament_criteris, 'capex_'+type);
        // El cost total és el OPEX i el CAPEX (diaris) multiplicat per el temps de vida de la planta.
        cost += (cost_capex*capacitat);
    }
    return cost;
}

// Aplica fuzzy en un array de tractaments per un criteri determinat.
const applyFuzzyTractaments = (tren, info_trens, info_multicriteris, capacitat, criteri) => {

    let valor_criteri_total = 0;
    const tren_info = Object.values(info_trens).find(info_tren => Number(info_tren.codi) === Number(tren.id));
    for(const tractament of tren_info.array_tractaments){
        // Per cada tren obtenim els rangs de criteris en funció de la capacitat, a partir d'aquí executem la fuzzyficació.
        const tractament_criteris = obtenirCriterisTractament(tractament, info_multicriteris);
        // Si hi ha valors repetits no es pot fuzzificar, agafa el valor del primer rang. En cas contrari fuzzifica.
        const valors_criteris = tractament_criteris.map(tractament_criteri => tractament_criteri[criteri]);
        const valor_criteri = new Set(valors_criteris).size !== valors_criteris.length ? tractament_criteris[0][criteri] : applyFuzzy(capacitat, tractament_criteris, criteri);
        // El cost total és el OPEX i el CAPEX (diaris) multiplicat per el temps de vida de la planta.
        valor_criteri_total += valor_criteri;
    }
    return valor_criteri_total*capacitat;
}


// Aquesta funció rep un tren de tractament, la informació dels trens, i la informació dels multicriteris per a retornar els seus multicriteris.
export const avaluar_multicriteris = (tren, info_trens, info_multicriteris, info_indicadors, capacitat) => {

    return{
        eliminacio_quimics_min: perElimMitja(tren.concentracio.min.eliminacio,info_indicadors,"quimics"),
        eliminacio_quimics_max: perElimMitja(tren.concentracio.max.eliminacio,info_indicadors,"quimics"),
        eliminacio_microbiologics_min: perElimMitja(tren.concentracio.min.eliminacio,info_indicadors,"microbiologics"),
        eliminacio_microbiologics_max: perElimMitja(tren.concentracio.max.eliminacio,info_indicadors,"microbiologics"),
        cost_total_min: costTotal(tren, info_trens, info_multicriteris, capacitat, "min"),
        cost_total_max: costTotal(tren, info_trens, info_multicriteris, capacitat, "max"),
        cons_ene_mitja: applyFuzzyTractaments(tren, info_trens, info_multicriteris, capacitat, 'cons_ene_mitja'),
        espai_ocupat: applyFuzzyTractaments(tren, info_trens, info_multicriteris, capacitat, 'espai_ocupat'),
        hc: applyFuzzyTractaments(tren, info_trens, info_multicriteris, capacitat, 'hc'),
        hh: applyFuzzyTractaments(tren, info_trens, info_multicriteris, capacitat, 'hh'),
        puntuacio: tren.puntuacio,
        cost_opex: costOpex(tren, info_trens, capacitat, info_multicriteris),
        cost_capex_min: costCapex(tren, info_trens, info_multicriteris, capacitat, "min"),
        cost_capex_max: costCapex(tren, info_trens, info_multicriteris, capacitat, "max")
    }

}

// Aquesta funció obté el màxim o mínim (extrem) de cada criteri per un array de trens, depenent de si el criteri és beneficiós o no.
export const obtenirExtremCriteris = (tren_criteris) => {
    const extrem_criteris = {};
    // Per cada criteri, si és beneficiós s'afegeix a 'extrem_criteris' amb el valor màxim, en cas de ser no beneficiós amb el valor mínim.
    for(const criteri of Object.keys(tren_criteris[0])){
        const es_beneficios = DICT_CRI_BENEFICIOSOS[criteri] !== undefined ? DICT_CRI_BENEFICIOSOS[criteri] : DICT_CRI_BENEFICIOSOS_NO_AGREGATS[criteri];
        if(es_beneficios) extrem_criteris[criteri] = Math.max(...tren_criteris.map(criteris => criteris[criteri]));
        else extrem_criteris[criteri] = Math.min(...tren_criteris.map(criteris => criteris[criteri]));
    }
    return extrem_criteris;
}

// Agregació de criteris.
export const agregaCriteris = (criteris) => {
    return {
        eliminacio_quimics: mitjana([criteris.eliminacio_quimics_min,criteris.eliminacio_quimics_max]),
        eliminacio_microbiologics: mitjana([criteris.eliminacio_microbiologics_min,criteris.eliminacio_microbiologics_max]),
        cost_total: mitjana([criteris.cost_total_min,criteris.cost_total_max]),
        cons_ene_mitja: criteris.cons_ene_mitja,
        espai_ocupat: criteris.espai_ocupat,
        hc: criteris.hc,
        hh: criteris.hh,
        puntuacio: criteris.puntuacio,
        cost_opex: criteris.cost_opex,
        cost_capex: mitjana([criteris.cost_capex_min,criteris.cost_capex_max])
    }
} 

// Aquesta funció rep els criteris ja calculats, i els normalitza 
//  a partir del diccionari d'extrems prèviament calculat per cada criteri.
export const normalitzaCriteris = (criteris, extrem_criteris) => {
    // Normalització.
    const criteris_normalitzats = {};
    for(const [criteri, valor] of Object.entries(criteris)){
        // Si és beneficiós: cal dividir cada valor per el valor màxim.
        const es_beneficios = DICT_CRI_BENEFICIOSOS[criteri] !== undefined ? DICT_CRI_BENEFICIOSOS[criteri] : DICT_CRI_BENEFICIOSOS_NO_AGREGATS[criteri];
        if(es_beneficios) criteris_normalitzats[criteri] = valor / extrem_criteris[criteri];
        // Si no és beneficiós: cal dividir el valor mínim per cada valor.
        else criteris_normalitzats[criteri] = extrem_criteris[criteri] / valor;
    }
    return criteris_normalitzats;
}

// Retorna la llista de criteris normalitzats i ordenats.
const obtenirLlistaCriterisGraph = (tren_multicriteris) => {
    const criteris = [];
    for(const criteri of Object.keys(DICT_CRI_BENEFICIOSOS)){
        criteris.push(tren_multicriteris.criteris_norm[criteri] * 100);
    }
    return criteris;
}

// Retorna els datasets necessaris per a mostrar el radi graph.
const obtenirDatasets = (trens_multicriteris, trens_info) => {
    const datasets = [];
    let color = 0;
    for(const tren_multicriteris of trens_multicriteris){
        const dataset = {
            label: tren_multicriteris.id + ': ' + trens_info[tren_multicriteris.id].nom,
            data: obtenirLlistaCriterisGraph(tren_multicriteris),
            fill: true,
            backgroundColor: COLOR_PALETTE_BACKGROUND[color],
            borderColor: COLOR_PALETTE_BORDER[color],
            pointBackgroundColor: COLOR_PALETTE_BORDER[color],
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: COLOR_PALETTE_BORDER[color]
        }
        datasets.push(dataset);
        color++;
        if(color >= COLOR_PALETTE_BORDER.length) color= 0;
    }
    return datasets;
}

// Retorna les dades en format que necessita la llibreria chart.js per a dibuizar un radar graph.
//  +info: https://www.chartjs.org/docs/latest/charts/radar.html
export const obtenirDadesGraphMulticriteri = (trens_multicriteris, trens_info) => {
    return {
        labels: Object.keys(DICT_CRI_BENEFICIOSOS).map(criteri => DICT_CRI_NOMS[criteri]),
        datasets: obtenirDatasets(trens_multicriteris, trens_info)
    }
}
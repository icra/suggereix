// Aquest fitxer conté funcions que executen la avaluació multicriteri sobre trens de tractament.

// Importa la llibreria que s'encarrega de la lògica fuzzy.
import {
    variable,
    triangle,
    defuzz,
    or
} from "@thi.ng/fuzzy";

// Variable constant amb els indicadors químics.
const IND_QUIMICS = ['I2','I3','I4','I5','I6','I7','I8','I9','I10','I11','I12','I13','I14','I15','I16','I17','I18']

// Variable constant amb els indicadors microbiològics.
const IND_MICRO = ['I19','I20','I21']

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
    cons_ene_mitja: "Consum energètic mitjà (kWh/dia)",
    cost_total: "Mitjana del cost total (€)",
    espai_ocupat: "Espai ocupat (m2)",
    hc: "Petjada de carboni (kg CO2 eq./dia)",
    hh: "Petjada hídrica (L eq./dia)",
    puntuacio: "Compliment (%)",
    cost_capex: "Mitjana del cost CAPEX (€)",
    cost_opex: "Cost OPEX (€)"
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
const perElimMitja = (eliminacions, tipus_ind) => {

    // Obtenir el tipus d'indicador corresponent depenent del paràmetre 'tipus_ind'.
    const indicadors = tipus_ind === 'quimics' ? IND_QUIMICS : IND_MICRO;

    // Obtenir tots els % d'eliminació dels indicadors que ens interessa i calcular la mitjana.
    const array_eliminacions = [];
    for (const [indicador, eliminacio] of Object.entries(eliminacions)) {
        if(indicadors.includes(indicador)) array_eliminacions.push(eliminacio);
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
    const outputs = {
        [criteri]: variable([tractament_criteris[3][criteri], tractament_criteris[0][criteri]], {
            low: triangle(tractament_criteris[3][criteri], tractament_criteris[3][criteri], tractament_criteris[2][criteri]),
            medium: triangle(tractament_criteris[3][criteri], tractament_criteris[2][criteri], tractament_criteris[1][criteri]),
            high: triangle(tractament_criteris[2][criteri], tractament_criteris[1][criteri], tractament_criteris[0][criteri]),
            very_high: triangle(tractament_criteris[1][criteri], tractament_criteris[0][criteri], tractament_criteris[0][criteri])
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
    return defuzz(
        inputs,
        outputs,
        rules,
        // input values
        { capacity: capacitat },
    )[criteri];
}

// Aquesta funció calcula el cost total (mínim o màxim depenent de 'type') del tren.
const costTotal = (tren, info_trens, info_multicriteris, type) => {

    // Creació de la variable que emmagatzema el cost total i s'anirà incrementant per a cada tractament del tren.
    let cost_total = 0;
    const capacitat = tren.concentracio.max.Q;
    const tren_info = Object.values(info_trens).find(info_tren => Number(info_tren.codi) === Number(tren.id));

    for(const tractament of tren_info.array_tractaments){
        // Per cada tren obtenim els rangs de criteris en funció de la capacitat, a partir d'aquí executem la fuzzyficació.
        const tractament_criteris = obtenirCriterisTractament(tractament, info_multicriteris);
        const cost_opex = applyFuzzy(capacitat, tractament_criteris, 'opex');
        const cost_capex = applyFuzzy(capacitat, tractament_criteris, 'capex_'+type);
        // El cost total és el OPEX i el CAPEX (diaris) multiplicat per el temps de vida de la planta.
        cost_total += ((cost_opex + cost_capex)*capacitat*365*30);
    }
    return cost_total;
}

// Aquesta funció calcula el cost OPEX del tren.
const costOpex = (tren, info_trens, info_multicriteris) => {

    // Creació de la variable que emmagatzema el cost total i s'anirà incrementant per a cada tractament del tren.
    let cost = 0;
    const capacitat = tren.concentracio.max.Q;
    const tren_info = Object.values(info_trens).find(info_tren => Number(info_tren.codi) === Number(tren.id));

    for(const tractament of tren_info.array_tractaments){
        // Per cada tren obtenim els rangs de criteris en funció de la capacitat, a partir d'aquí executem la fuzzyficació.
        const tractament_criteris = obtenirCriterisTractament(tractament, info_multicriteris);
        const cost_opex = applyFuzzy(capacitat, tractament_criteris, 'opex');
        // El cost total és el OPEX i el CAPEX (diaris) multiplicat per el temps de vida de la planta.
        cost += (cost_opex*capacitat*365*30);
    }
    return cost;
}

// Aquesta funció calcula el cost CAPEX (mínim o màxim depenent de 'type') del tren.
const costCapex = (tren, info_trens, info_multicriteris, type) => {

    // Creació de la variable que emmagatzema el cost total i s'anirà incrementant per a cada tractament del tren.
    let cost = 0;
    const capacitat = tren.concentracio.max.Q;
    const tren_info = Object.values(info_trens).find(info_tren => Number(info_tren.codi) === Number(tren.id));

    for(const tractament of tren_info.array_tractaments){
        // Per cada tren obtenim els rangs de criteris en funció de la capacitat, a partir d'aquí executem la fuzzyficació.
        const tractament_criteris = obtenirCriterisTractament(tractament, info_multicriteris);
        const cost_capex = applyFuzzy(capacitat, tractament_criteris, 'capex_'+type);
        // El cost total és el OPEX i el CAPEX (diaris) multiplicat per el temps de vida de la planta.
        cost += (cost_capex*capacitat*365*30);
    }
    return cost;
}

// Aplica fuzzy en un array de tractaments per un criteri determinat.
const applyFuzzyTractaments = (tren, info_trens, info_multicriteris, criteri) => {

    let valor_criteri_total = 0;
    const capacitat = tren.concentracio.max.Q;
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
export const avaluar_multicriteris = (tren, info_trens, info_multicriteris) => {

    return{
        eliminacio_quimics_min: perElimMitja(tren.concentracio.min.eliminacio,"quimics"),
        eliminacio_quimics_max: perElimMitja(tren.concentracio.max.eliminacio,"quimics"),
        eliminacio_microbiologics_min: perElimMitja(tren.concentracio.min.eliminacio,"microbiologics"),
        eliminacio_microbiologics_max: perElimMitja(tren.concentracio.max.eliminacio,"microbiologics"),
        cost_total_min: costTotal(tren, info_trens, info_multicriteris, "min"),
        cost_total_max: costTotal(tren, info_trens, info_multicriteris, "max"),
        cons_ene_mitja: applyFuzzyTractaments(tren, info_trens, info_multicriteris, 'cons_ene_mitja'),
        espai_ocupat: applyFuzzyTractaments(tren, info_trens, info_multicriteris, 'espai_ocupat'),
        hc: applyFuzzyTractaments(tren, info_trens, info_multicriteris, 'hc'),
        hh: applyFuzzyTractaments(tren, info_trens, info_multicriteris, 'hh'),
        puntuacio: tren.puntuacio,
        cost_opex: costOpex(tren, info_trens, info_multicriteris),
        cost_capex_min: costCapex(tren, info_trens, info_multicriteris, "min"),
        cost_capex_max: costCapex(tren, info_trens, info_multicriteris, "max")
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
// Aquest fitxer conté funcions que executen la avaluació multicriteri sobre trens de tractament.

// Importa la llibreria que s'encarrega de la lògica fuzzy.
import {
    variable,
    invRamp,
    gaussian,
    ramp,
    triangle,
    defuzz,
    or
} from "@thi.ng/fuzzy";

// Variable constant amb els indicadors químics.
const IND_QUIMICS = ['I2','I3','I4','I5','I6','I7','I8','I9','I10','I11','I12','I13','I14','I15','I16','I17','I18']

// Variable constant amb els indicadors microbiològics.
const IND_MICRO = ['I19','I20','I21']

// Funció que calcula el percentatge d'eliminació mitjà.
const perElimMitja = (eliminacions, tipus_ind) => {

    // Obtenir el tipus d'indicador corresponent depenent del paràmetre 'tipus_ind'.
    const indicadors = tipus_ind === 'quimics' ? IND_QUIMICS : IND_MICRO;

    // Obtenir tots els % d'eliminació dels indicadors que ens interessa i calcular la mitjana.
    const array_eliminacions = [];
    for (const [indicador, eliminacio] of Object.entries(eliminacions)) {
        if(indicadors.includes(indicador)) array_eliminacions.push(eliminacio);
    }
    const sum = array_eliminacions.reduce((a, b) => a + b, 0);
    const avg = ((sum / array_eliminacions.length) || 0)*100;
    return avg;
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
        eliminacio_min_quimics: perElimMitja(tren.concentracio.min.eliminacio,"quimics"),
        eliminacio_max_quimics: perElimMitja(tren.concentracio.max.eliminacio,"quimics"),
        eliminacio_min_microbiologics: perElimMitja(tren.concentracio.min.eliminacio,"microbiologics"),
        eliminacio_max_microbiologics: perElimMitja(tren.concentracio.max.eliminacio,"microbiologics"),
        cost_total_min: costTotal(tren, info_trens, info_multicriteris, "min"),
        cost_total_max: costTotal(tren, info_trens, info_multicriteris, "max"),
        cons_ene_mitja: applyFuzzyTractaments(tren, info_trens, info_multicriteris, 'cons_ene_mitja'),
        espai_ocupat: applyFuzzyTractaments(tren, info_trens, info_multicriteris, 'espai_ocupat'),
        hc: applyFuzzyTractaments(tren, info_trens, info_multicriteris, 'hc'),
        hh: applyFuzzyTractaments(tren, info_trens, info_multicriteris, 'hh')
    }

}
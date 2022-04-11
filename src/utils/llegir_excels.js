// llegeix excel de valors de sortida dels diferents efluents/tractaments secundaris de la infraestructura existent.
import ExcelJS from "exceljs";

function llegir_caract_efluent_secundari(binaryData) {

    /** TODO
     * Falta fer la funció de llegir l'excel amb els valors dels efluents/tractaments secundaris de la infraestructura
     * esxistent de l'usuari, i guardar-ho en el diccionari 'Efluents_info'.
     * Ara estan entrades les caracterísitques de sortida (valors min/max) de cada indicador manualment, en la classe
     * "usuari", en el getter 'info_tractaments_secundaris'.
     *
     * Si es vol, es pot deixar així, no sé si serà alguna cosa que hagi de canviar en un futur, i només hi ha 6
     * tipologies diferents entrades.
     * **/

}


// llegeix excel que conté els valors protectors (VP) dels diferents usos.
// si per un ús hi ha més d'una tipologia de VP, es guarda el que té valor mínim (més restrictiu).
function llegir_vp_usos(binaryData) {
    let _this = this;
    let workbook = new ExcelJS.Workbook();

    return workbook.xlsx.load(binaryData).then(wb => {
        //1a pestanya amb nom i codi dels usos
        let worksheet_codes = wb.worksheets[0];
        let startingRow = 4; //ignore first 3 columns (headers)
        let uses = {};

        worksheet_codes.eachRow({
            includeEmpty: false
        }, function (rowData, rowNumber) {
            if (rowNumber >= startingRow) {
                const row = rowData.values;
                let useId = row[2];
                let useName = row[1];

                uses[useId] = {
                    nom: useName,
                    codi: useId,
                    qualitat: {}, //valors protectors,
                };
            }
        });

        //2a pestanya amb valors protectors (VP) per cada indicador i ús.
        let worksheet_vp = wb.worksheets[1];
        startingRow = 4; //ignore first 4 rows (headers).

        worksheet_vp.eachRow({
            includeEmpty: false
        }, function (rowData, rowNumber) {
            if (rowNumber >= startingRow) {
                const row = rowData.values;
                let useId = row[2]; //codi d'ús: columna 'B'
                let indId = row[4]; //codi indicador: columna 'D'
                let tipusVp = row[5]; //tipus de valor protector (1,2 o 3): columna 'E'
                let valorVp = row[6]; //valor protector: columna 'F'
                let refVp = row[8]; //referència del valor protector
                let regulat = row[9]; //Indica si el VP es troba regulat per l'ús concret.
                if (refVp === undefined) //si no hi ha referència, guardem string buida.
                    refVp = "";

                if (typeof valorVp === 'object') { //de tipus formula (la cel·la té objectes 'result' i 'formula', ens guardem només 'result').
                    valorVp = valorVp.result
                }

                //valorVp tipus string, i no és 'nd'. exemple: '<1' (pels indicadors microbiològics I19, I20, I21)
                if (typeof valorVp === 'string' && valorVp !== 'nd') {
                    valorVp = valorVp.replace(',', '.'); //canviem la coma de l'string (per si és número decimal) per punt.
                    valorVp = parseFloat(valorVp.replace(/[^\d.-]/g, '')); //eliminar tot el que no siguin números i separador decimal.
                }

                //Posar el valor processat al diccionari de qualitat.
                if (uses[useId].qualitat[indId] === undefined){
                    uses[useId].qualitat[indId] = {
                        1: {ref: '', regulat: false, vp: 'nd'},
                        2: {ref: '', regulat: false, vp: 'nd'},
                        3: {ref: '', regulat: false, vp: 'nd'}
                    };
                }
                uses[useId].qualitat[indId][tipusVp] = {
                    vp: valorVp,
                    ref: refVp,
                    regulat: regulat ? true : false
                }
            }
        });

        return uses;
    });
}


// llegeix excel de trens de tractament i guarda les dades.
function llegir_trens(binaryData) {

    let _this = this;
    let workbook = new ExcelJS.Workbook();
    return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[1];

        let startingRow = 5; //ignore first 3 columns (headers)
        let maxRows = worksheet.rowCount
        let trains = {}

        worksheet.eachRow({
            includeEmpty: false
        }, function (rowData, rowNumber) {
            if (rowNumber >= startingRow) {
                const row = rowData.values;
                let trainId = row[3];
                let trainName = row[1];
                let trainTreatments = [];
                let references = [];

                //read treatments in order (from column D(4) to J(10) = 7 in total)
                for (let i = 4; i < 11; i++) {
                    if (row[i] !== undefined) trainTreatments.push(row[i].replaceAll(" ", ""));
                }

                //read references in order (from column K(11) to W(24) = 14 in total)
                for (let i = 11; i < 25; i++) {
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

        return trains;
    });
}


// llegeix excel de tractaments i guarda les dades.
function llegir_tractaments(binaryData) {

    let _this = this;
    let workbook = new ExcelJS.Workbook();
    return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[0];
        let rowNumber = 2; //ignore first column (header)
        let maxRows = worksheet.rowCount;
        let treatments = {};

        for (rowNumber; rowNumber < maxRows; rowNumber += 22) {
            let i = rowNumber;
            let name = worksheet.getCell('A' + i.toString());
            let pretreatment = worksheet.getCell('B' + i.toString());
            if (treatments[name] === undefined) {
                treatments[name] = {};
            }
            treatments[name][pretreatment] = {};
            for (let j = 1; j <= 22; j++) {
                let key = worksheet.getCell('D' + i.toString()).value; //'I'+j.toString();
                let min = worksheet.getCell('E' + i.toString()).value;
                let max = worksheet.getCell('F' + i.toString()).value;

                if (typeof min === 'string' && typeof max === 'string') { // parse 'ne' or 'na' values to 0
                    min = 0;
                    max = 0;
                } else if (typeof min === 'string' && typeof max !== 'string') {
                    if (typeof max === 'object') max = max.result; // type object when cell contains a formula and result.
                    min = max;
                } else if (typeof max === 'string' && typeof min !== 'string') {
                    if (typeof min === 'object') min = min.result;
                    max = min;
                } else {
                    if (typeof max === 'object') max = max.result;
                    if (typeof min === 'object') min = min.result;
                }

                treatments[name][pretreatment][key] = {
                    min: min,
                    max: max
                }
                i++;
            }
        }

        return treatments;
    });
}

function read_excel_value(value){
    if (typeof value === 'string') return 0;
    else if (typeof value === 'object') return value.result;
    else return value;
}

// llegeix excel d'avaluació multicriteri.
function llegir_multicriteri(binaryData) {

    let _this = this;
    let workbook = new ExcelJS.Workbook();
    return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[0];
        let rowNumber = 3; //ignore first column (header)
        let maxRows = 50;
        let multicriteris = {};

        for (rowNumber; rowNumber < maxRows; rowNumber += 4) {
            let i = rowNumber;
            let name = worksheet.getCell('A' + i.toString()).value;
            if (multicriteris[name] === undefined) {
                multicriteris[name] = [];
            }
            for (let j = 1; j <= 4; j++) {
                const multicriteri = {
                    cap_min: read_excel_value(worksheet.getCell('B' + i.toString()).value),
                    cap_max: read_excel_value(worksheet.getCell('C' + i.toString()).value),
                    cons_ene_mitja: read_excel_value(worksheet.getCell('D' + i.toString()).value),
                    hc: read_excel_value(worksheet.getCell('L' + i.toString()).value),
                    hh: read_excel_value(worksheet.getCell('M' + i.toString()).value),
                    espai_ocupat: read_excel_value(worksheet.getCell('N' + i.toString()).value),
                    opex: read_excel_value(worksheet.getCell('O' + i.toString()).value),
                    capex_min_d: read_excel_value(worksheet.getCell('P' + i.toString()).value),
                    capex_max_d: read_excel_value(worksheet.getCell('Q' + i.toString()).value),
                    capex_min: read_excel_value(worksheet.getCell('R' + i.toString()).value),
                    capex_max: read_excel_value(worksheet.getCell('S' + i.toString()).value),
                    ref: worksheet.getCell('U' + i.toString()).value
                }
                multicriteris[name].push(multicriteri);
                i++;
            }
        }

        // Obtenir el temps d'operació per defecte.
        const anys = wb.worksheets[1].getCell('B5').value;

        return [multicriteris,anys];
    });
}

// Retorna un nom que pot contenir sub o sup valors i cursives.
function valor_nom_enriquit(nom){
    if(nom === null) return "";
    if(typeof nom === 'object'){
        if(nom.richText){
            let string = "";
            for(const element of nom.richText){
                if(element.font){
                    if(element.font.vertAlign === "subscript"){
                        string += "<sub>"+element.text+"</sub>"
                    }
                    else if(element.font.vertAlign === "superscript"){
                        string += "<sup>"+element.text+"</sup>"
                    }
                    else if(element.font.italic === true){
                        string += "<i>"+element.text+"</i>"
                    }
                    else string += element.text;
                }
                else string += element.text;
            }
            return string;
        }
        else return "";
    }
    else return nom;
}

// Retorna un nom que pot contenir sub o sup valors i cursives (només text).
function valor_nom(nom){
    if(nom === null) return "";
    if(typeof nom === 'object'){
        if(nom.richText){
            let string = "";
            for(const element of nom.richText){
                string += element.text;
            }
            return string;
        }
        else return "";
    }
    else return nom;
}

// llegeix excel d'informació d'indicadors.
function llegir_indicadors(binaryData) {

    let _this = this;
    let workbook = new ExcelJS.Workbook();
    return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[0];
        let rowNumber = 3; //ignore first column (header)
        const type_indicadors = [];
        const desc_indicadors = {};

        let title = worksheet.getCell('A' + rowNumber.toString()).value;
        while(title){
            type_indicadors.push(title);
            rowNumber += 1;
            let indicador_id = worksheet.getCell('A' + rowNumber.toString()).value;
            let indicador_name = valor_nom(worksheet.getCell('B' + rowNumber.toString()).value);
            let indicador_name_rich = valor_nom_enriquit(worksheet.getCell('B' + rowNumber.toString()).value);
            let indicador_unitats = valor_nom(worksheet.getCell('C' + rowNumber.toString()).value);
            let indicador_unitats_rich = valor_nom_enriquit(worksheet.getCell('C' + rowNumber.toString()).value);
            while(indicador_id){
                desc_indicadors[indicador_id] = {name: indicador_name, name_rich: indicador_name_rich, type: title, unitats_rich: indicador_unitats_rich, unitats: indicador_unitats};
                rowNumber += 1;
                indicador_id = worksheet.getCell('A' + rowNumber.toString()).value;
                indicador_name = valor_nom(worksheet.getCell('B' + rowNumber.toString()).value);
                indicador_name_rich = valor_nom_enriquit(worksheet.getCell('B' + rowNumber.toString()).value);
                indicador_unitats = valor_nom(worksheet.getCell('C' + rowNumber.toString()).value);
                indicador_unitats_rich = valor_nom_enriquit(worksheet.getCell('C' + rowNumber.toString()).value);
            }
            rowNumber += 1;
            title = worksheet.getCell('A' + rowNumber.toString()).value;
        }

        return [desc_indicadors,type_indicadors];
    });
}

function llegir_monitoratge(binaryData) {

    let workbook = new ExcelJS.Workbook();
    return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[0];

        // Diccionari clau=tractament, valor=objecte{clau=parametre,valor={array_punts_a_moritorar}}.
        const monitoratge_tractaments = {};
        // Ens permetrà accedir a un text enriquit a partir del text normal.
        const dict_enriquit = {};

        // Comencem amb els headers.
        let header_column = 3;
        let indicador = valor_nom(worksheet.getRow(4).getCell(header_column).value);
        let indicador_rich = valor_nom_enriquit(worksheet.getRow(4).getCell(header_column).value);
        let unitats_indicador = valor_nom(worksheet.getRow(6).getCell(header_column).value);
        let unitats_rich_indicador = valor_nom_enriquit(worksheet.getRow(6).getCell(header_column).value);
        let group = valor_nom(worksheet.getRow(3).getCell(header_column).value);
        while(group !== "Eficiència"){
            dict_enriquit[indicador] = indicador_rich;
            dict_enriquit[unitats_indicador] = unitats_rich_indicador;

            // Mirar quins llocs podria ser que calguès monitorar.
            let start_column = header_column;
            const llocs_on_potser_cal_monitorar = [valor_nom(worksheet.getRow(7).getCell(start_column).value)];
            let next_indicador = valor_nom(worksheet.getRow(4).getCell(start_column+1).value);
            while(next_indicador === ""){
                start_column += 1;
                llocs_on_potser_cal_monitorar.push(valor_nom(worksheet.getRow(7).getCell(start_column).value));
                next_indicador = valor_nom(worksheet.getRow(4).getCell(start_column+1).value);
            }

            // Ara per a cada grup que calgui monitorar llegir els tractaments.
            let start_row = 9;
            let tractament = valor_nom(worksheet.getRow(start_row).getCell(1).value);
            let tractament_rich = valor_nom_enriquit(worksheet.getRow(start_row).getCell(1).value);
            while(tractament){
                dict_enriquit[tractament] = tractament_rich;

                // Si no existeix encara el tractament, crea'l.
                if(!monitoratge_tractaments[tractament]) monitoratge_tractaments[tractament] = {};

                // Crea una property per l'indicador i posa dins el codi.
                monitoratge_tractaments[tractament][indicador] = [];

                // Mira els llocs on cal monitorar.
                for(let i = 0; i < llocs_on_potser_cal_monitorar.length; i++){
                    const a_considerar = worksheet.getRow(start_row).getCell(header_column + i).value;
                    if(a_considerar) monitoratge_tractaments[tractament][indicador].push(llocs_on_potser_cal_monitorar[i]);
                }

                // Augmenta el comptador.
                start_row += 1;
                tractament = valor_nom(worksheet.getRow(start_row).getCell(1).value);
                tractament_rich = valor_nom_enriquit(worksheet.getRow(start_row).getCell(1).value);
            }

            // Incrementar comptador.
            header_column += llocs_on_potser_cal_monitorar.length;
            indicador = valor_nom(worksheet.getRow(4).getCell(header_column).value);
            indicador_rich = valor_nom_enriquit(worksheet.getRow(4).getCell(header_column).value);
            unitats_indicador = valor_nom(worksheet.getRow(6).getCell(header_column).value);
            unitats_rich_indicador = valor_nom_enriquit(worksheet.getRow(6).getCell(header_column).value);
            group = valor_nom(worksheet.getRow(3).getCell(header_column).value);
        }

        return [monitoratge_tractaments, dict_enriquit];


        /* let title = worksheet.getCell('A' + rowNumber.toString()).value;
        while(title){
            type_indicadors.push(title);
            rowNumber += 1;
            let indicador_id = worksheet.getCell('A' + rowNumber.toString()).value;
            let indicador_name = valor_nom(worksheet.getCell('B' + rowNumber.toString()).value);
            let indicador_name_rich = valor_nom_enriquit(worksheet.getCell('B' + rowNumber.toString()).value);
            let indicador_unitats = valor_nom(worksheet.getCell('C' + rowNumber.toString()).value);
            let indicador_unitats_rich = valor_nom_enriquit(worksheet.getCell('C' + rowNumber.toString()).value);
            while(indicador_id){
                desc_indicadors[indicador_id] = {name: indicador_name, name_rich: indicador_name_rich, type: title, unitats_rich: indicador_unitats_rich, unitats: indicador_unitats};
                rowNumber += 1;
                indicador_id = worksheet.getCell('A' + rowNumber.toString()).value;
                indicador_name = valor_nom(worksheet.getCell('B' + rowNumber.toString()).value);
                indicador_name_rich = valor_nom_enriquit(worksheet.getCell('B' + rowNumber.toString()).value);
                indicador_unitats = valor_nom(worksheet.getCell('C' + rowNumber.toString()).value);
                indicador_unitats_rich = valor_nom_enriquit(worksheet.getCell('C' + rowNumber.toString()).value);
            }
            rowNumber += 1;
            title = worksheet.getCell('A' + rowNumber.toString()).value;
        }

        return [desc_indicadors,type_indicadors]; */
    });
}

// llegeix excel de tractaments pel punt de referència 1 (microbiològics) i guarda les dades.
function llegir_tractaments_micro(binaryData) {

    let _this = this;
    let workbook = new ExcelJS.Workbook();
    return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[0];
        let rowNumber = 5; //ignore headers
        let maxRows = worksheet.rowCount;
        let treatments = {};

        for (rowNumber; rowNumber < maxRows; rowNumber += 3) {
            let i = rowNumber;
            let name = worksheet.getCell('A' + i.toString());
            let pretreatment = worksheet.getCell('B' + i.toString());
            if (treatments[name] === undefined) {
                treatments[name] = {};
            }
            treatments[name][pretreatment] = {};
            for (let j = 1; j <= 3; j++) {
                let key = worksheet.getCell('D' + i.toString()).value; //'I'+j.toString();
                let min = worksheet.getCell('E' + i.toString()).value;
                let max = worksheet.getCell('F' + i.toString()).value;

                if (typeof min === 'string' && typeof max === 'string') { // parse 'ne' or 'na' values to 0
                    min = 0;
                    max = 0;
                } else if (typeof min === 'string' && typeof max !== 'string') {
                    if (typeof max === 'object') max = max.result; // type object when cell contains a formula and result.
                    min = max;
                } else if (typeof max === 'string' && typeof min !== 'string') {
                    if (typeof min === 'object') min = min.result;
                    max = min;
                } else {
                    if (typeof max === 'object') max = max.result;
                    if (typeof min === 'object') min = min.result;
                }

                treatments[name][pretreatment][key] = {
                    min: min,
                    max: max
                }
                i++;
            }
        }

        return treatments;
    });
}

// llegeix excel de qualitat microbiològica (taula 8, on hi ha els valors de Rmin d'eliminació mínima requreida).
function llegir_qualitat_micro(binaryData) {

    let _this = this;
    let workbook = new ExcelJS.Workbook();
    return workbook.xlsx.load(binaryData).then(wb => {
        let worksheet = wb.worksheets[0];
        let rowNumber = 5; //ignore headers
        let maxRows = worksheet.rowCount;
        let quality_micro = {};

        for (rowNumber; rowNumber < maxRows; rowNumber += 3) {
            let i = rowNumber;
            let usage_name = worksheet.getCell('B' + i.toString()); // DummyX.
            if (quality_micro[usage_name] === undefined) {
                quality_micro[usage_name] = {};
            }
            for (let j = 1; j <= 3; j++) {
                let indicador = worksheet.getCell('E' + i.toString()).value;
                let percent_eliminacio = worksheet.getCell('G' + i.toString()).value;
                let lograritmic_eliminacio = worksheet.getCell('F' + i.toString()).value;
                if (typeof percent_eliminacio === 'string') percent_eliminacio = 0;
                else if (typeof percent_eliminacio === 'object') percent_eliminacio = percent_eliminacio.result;
                if (typeof lograritmic_eliminacio === 'string') lograritmic_eliminacio = 0;
                else if (typeof lograritmic_eliminacio === 'object') lograritmic_eliminacio = lograritmic_eliminacio.result;

                quality_micro[usage_name][indicador] = [percent_eliminacio, lograritmic_eliminacio]
                i++;
            }
        }

        return quality_micro;
    });
}

export {
    llegir_caract_efluent_secundari,
    llegir_tractaments,
    llegir_tractaments_micro,
    llegir_trens,
    llegir_vp_usos,
    llegir_qualitat_micro,
    llegir_multicriteri,
    llegir_indicadors,
    llegir_monitoratge
}
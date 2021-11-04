

// llegeix excel de valors de sortida dels diferents efluents/tractaments secundaris de la infraestructura existent.
import ExcelJS from "exceljs";

function llegir_caract_efluent_secundari(binaryData){

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
function llegir_vp_usos(binaryData){
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
    startingRow = 4; //ignore first 4 rows (headers).

    worksheet_vp.eachRow({ includeEmpty: false }, function(rowData, rowNumber) {
      if(rowNumber >= startingRow){
        const row = rowData.values;
        let useId = row[2];   //codi d'ús: columna 'B'
        let indId = row[4];   //codi indicador: columna 'D'
        let tipusVp= row[5];  //tipus de valor protector (1,2 o 3): columna 'E'
        let valorVp = row[6]; //valor protector: columna 'F'
        let refVp = row[8];   //referència del valor protector
        if (refVp === undefined)  //si no hi ha referència, guardem string buida.
          refVp = "";

        if (typeof valorVp === 'object') { //de tipus formula (la cel·la té objectes 'result' i 'formula', ens guardem només 'result').
          valorVp = Math.round((valorVp.result + Number.EPSILON) * 1000000) / 1000000; //arrodonit a 7 decimals
        }

        //valorVp tipus string, i no és 'nd'. exemple: '<1' (pels indicadors microbiològics I19, I20, I21)
        if (typeof valorVp === 'string' && valorVp !== 'nd') {
          valorVp = valorVp.replace(',','.'); //canviem la coma de l'string (per si és número decimal) per punt.
          valorVp = parseFloat(valorVp.replace(/[^\d.-]/g,'')); //eliminar tot el que no siguin números i separador decimal.
        }

        //no hi ha definit encara cap valor protector, guardem dades obtingudes
        if (uses[useId].qualitat[indId] === undefined){
          uses[useId].qualitat[indId] = {
            vp: valorVp,
            tipus: tipusVp,
            ref: refVp
          }
        }
        //ja hi ha definit algun valor protector. Comprovem si el següent és un vp inferior o 'nd' per actualitzar-lo
        else{
          if (uses[useId].qualitat[indId].vp === 'nd' || uses[useId].qualitat[indId].vp > valorVp)
            uses[useId].qualitat[indId] = {
              vp: valorVp,
              tipus: tipusVp,
              ref: refVp
            }
        }
      }
    });

    return uses;
  });
}


// llegeix excel de trens de tractament i guarda les dades.
function llegir_trens(binaryData){

  let _this = this;
  let workbook = new ExcelJS.Workbook();
  return workbook.xlsx.load(binaryData).then(wb => {
    let worksheet = wb.worksheets[0];

    let startingRow = 4; //ignore first 3 columns (headers)
    let maxRows = worksheet.rowCount
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

    return trains;
  });
}


// llegeix excel de tractaments i guarda les dades.
function llegir_tractaments(binaryData){

  let _this = this;
  let workbook = new ExcelJS.Workbook();
  return workbook.xlsx.load(binaryData).then(wb => {
    let worksheet = wb.worksheets[0];
    let rowNumber = 2; //ignore first column (header)
    let maxRows = worksheet.rowCount;
    let treatments = {};

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

export {
  llegir_caract_efluent_secundari,
  llegir_tractaments,
  llegir_trens,
  llegir_vp_usos
}
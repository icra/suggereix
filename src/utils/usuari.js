import Corrent from './corrent';

//infraestructura existent de l'usuari
const I19 = {min: 1548816.61891249, max: 85113803.8202378};
const I20 = {min: 2187761.62394955, max: 89125093.8133748};
const I21 = {min: 3019.95172040202, max: 5128613.83991366};

export default class Usuari{
  constructor(info_indicadors){
    this.corrent = new Corrent(info_indicadors); //qualitat actual
    this.corrent_objectiu = new Corrent(info_indicadors); //qualitat desitjada
  }

  reseteja_corrent_objectiu(info_indicadors){
    this.corrent_objectiu = new Corrent(info_indicadors);
  }

  static get info_tractaments_secundaris(){
    return{
      "FAC_DS1":{tipus:"secundari", nom:"Llots actius convencionals sense nitrificació",
        qualitat:{
          I1  : {min: 7,      max: 7.5},
          I2  : {min: 300,    max: 2000},
          I3  : {min: 2,      max: 15},
          I4  : {min: 5,      max: 25},
          I5  : {min: 20,     max: 40},
          I6  : {min: 18,     max: 34},
          I7  : {min: 0,      max: 0.9},
          I8  : {min: 5,      max: 700},
          I9  : {min: 5,      max: 100},
          I10 : {min: 0.05,   max: 20},
          I11 : {min: 0.3,    max: 10},
          I12 : {min: 0.196,  max: 15.8},
          I13 : {min: 0.2,    max: 6},
          I14 : {min: 0.3,    max: 3.5},
          I15 : {min: 0.376,  max: 2.6},
          I16 : {min: 0.03,   max: 23},
          I17 : {min: 0.0122, max: 2.101},
          I18 : {min: 0.3,    max: 81},
          I19 : I19,
          I20 : I20,
          I21 : I21
        },
      },
      "FAC_DS2":{tipus:"secundari", nom:"Llots actius convencionals amb nitrificació",
        qualitat:{
          I1  : {min: 7,      max: 7.5},
          I2  : {min: 300,    max: 2000},
          I3  : {min: 2,      max: 15},
          I4  : {min: 5,      max: 25},
          I5  : {min: 20,     max: 40},
          I6  : {min: 1,      max: 10},
          I7  : {min: 5,      max: 30},
          I8  : {min: 5,      max: 700},
          I9  : {min: 5,      max: 100},
          I10 : {min: 0.05,   max: 20},
          I11 : {min: 0.3,    max: 10},
          I12 : {min: 0.196,  max: 15.8},
          I13 : {min: 0.2,    max: 6},
          I14 : {min: 0.3,    max: 3.5},
          I15 : {min: 0.376,  max: 2.6},
          I16 : {min: 0.03,   max: 23},
          I17 : {min: 0.0122, max: 2.101},
          I18 : {min: 0.3,    max: 81},
          I19 : I19,
          I20 : I20,
          I21 : I21
        },
      },
      "FAC_DS3":{tipus:"secundari", nom:"Llots actius convencionals amb nitrificació, desnitrificació biològica i eliminació biològica de PO4",
        qualitat:{
          I1  : {min: 7,      max: 7.5},
          I2  : {min: 300,    max: 2000},
          I3  : {min: 1,      max: 5},
          I4  : {min: 5,      max: 20},
          I5  : {min: 15,     max: 20},
          I6  : {min: 0.4,    max: 4},
          I7  : {min: 2,      max: 12},
          I8  : {min: 5,      max: 700},
          I9  : {min: 5,      max: 100},
          I10 : {min: 0.05,   max: 20},
          I11 : {min: 0.3,    max: 10},
          I12 : {min: 0.196,  max: 15.8},
          I13 : {min: 0.2,    max: 6},
          I14 : {min: 0.3,    max: 3.5},
          I15 : {min: 0.376,  max: 2.6},
          I16 : {min: 0.03,   max: 23},
          I17 : {min: 0.0122, max: 2.101},
          I18 : {min: 0.3,    max: 81},
          I19 : I19,
          I20 : I20,
          I21 : I21
        },
      },
      "BRM1":{tipus:"secundari", nom:"Reactor biològic de membrana amb nitrificació",
        qualitat:{
          I1  : {min: 7,      max: 7.5},
          I2  : {min: 300,    max: 2000},
          I3  : {min: 0.3,    max: 2},
          I4  : {min: 1,      max: 5},
          I5  : {min: 0.5,    max: 5},
          I6  : {min: 0.4,    max: 5},
          I7  : {min: 2,      max: 12},
          I8  : {min: 5,      max: 700},
          I9  : {min: 5,      max: 100},
          I10 : {min: 0.05,   max: 20},
          I11 : {min: 0.3,    max: 10},
          I12 : {min: 0.196,  max: 15.8},
          I13 : {min: 0.2,    max: 6},
          I14 : {min: 0.3,    max: 3.5},
          I15 : {min: 0.376,  max: 2.6},
          I16 : {min: 0.03,   max: 23},
          I17 : {min: 0.0122, max: 2.101},
          I18 : {min: 0.3,    max: 81},
          I19 : I19,
          I20 : I20,
          I21 : I21
        },
      },
      "BRM2":{tipus:"secundari", nom:"Reactor biològic de membrana amb nitrificació, desnitrificació biològica i eliminació biològica de PO4",
        qualitat:{
          I1  : {min: 7,      max: 7.5},
          I2  : {min: 300,    max: 2000},
          I3  : {min: 0.3,    max: 2},
          I4  : {min: 1,      max: 5},
          I5  : {min: 0.5,    max: 5},
          I6  : {min: 0.4,    max: 1},
          I7  : {min: 2,      max: 12},
          I8  : {min: 5,      max: 700},
          I9  : {min: 5,      max: 100},
          I10 : {min: 0.05,   max: 20},
          I11 : {min: 0.3,    max: 10},
          I12 : {min: 0.196,  max: 15.8},
          I13 : {min: 0.2,    max: 6},
          I14 : {min: 0.3,    max: 3.5},
          I15 : {min: 0.376,  max: 2.6},
          I16 : {min: 0.03,   max: 23},
          I17 : {min: 0.0122, max: 2.101},
          I18 : {min: 0.3,    max: 81},
          I19 : I19,
          I20 : I20,
          I21 : I21
        },
      },
    };
  }
}
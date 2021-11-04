import Corrent from './corrent';

//infraestructura existent de l'usuari
export default class Usuari{
  constructor(){
    this.corrent = new Corrent(); //qualitat actual
    this.corrent_objectiu = new Corrent(); //qualitat desitjada
  }

  static get info_tractaments_secundaris(){
    return{
      "DP":{tipus:"primari", nom:"Només decantació primària. Sense tractament secundari",
        qualitat:{
          I1  : {min: 7,           max: 7.5},
          I2  : {min: 300,         max: 2000},
          I3  : {min: 80,          max: 150},
          I4  : {min: 130,         max: 389},
          I5  : {min: 109,         max: 328},
          I6  : {min: 14,          max: 41},
          I7  : {min: 0,           max: 0},
          I8  : {min: 150,         max: 700},
          I9  : {min: 7.5,         max: 600},
          I10 : {min: 65,          max: 81},
          I11 : {min: 431,         max: 715},
          I12 : {min: 0.196,       max: 15.8},
          I13 : {min: 0.2,         max: 6},
          I14 : {min: 0.3,         max: 3.5},
          I15 : {min: 159,         max: 272},
          I16 : {min: 0.058,       max: 61.638},
          I17 : {min: 0.0122,      max: 2.101},
          I18 : {min: 37.2,        max: 81},
          I19 : {min: 707945.784,  max: 39810717.055},
          I20 : {min: 1096478.196, max: 5623413.252},
          I21 : {min: 1513.561,    max: 2570395.783},
          I22 : {},
          I23 : {} 
        },
      },
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
          I19 : {min: 1e4,    max: 1e5},
          I20 : {min: 1e5,    max: 1e6},
          I21 : {min: 1e3,    max: 1e4},
          I22 : {},
          I23 : {} 
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
          I19 : {min: 1e4,    max: 1e5},
          I20 : {min: 1e5,    max: 1e6},
          I21 : {min: 1e3,    max: 1e4},
          I22 : {},
          I23 : {} 
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
          I19 : {min: 1e4,    max: 1e5},
          I20 : {min: 1e5,    max: 1e6},
          I21 : {min: 1e3,    max: 1e4},
          I22 : {},
          I23 : {} 
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
          I19 : {min: 1,      max: 1e2},
          I20 : {min: 10,     max: 1e3},
          I21 : {min: 1,      max: 1e2},
          I22 : {},
          I23 : {} 
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
          I19 : {min: 1,      max: 1e2},
          I20 : {min: 10,     max: 1e3},
          I21 : {min: 1,      max: 1e2},
          I22 : {},
          I23 : {} 
        },
      },
    };
  }
  /*static get info_usos(){
    return{
      // Valors protectors (tipus 1 o 2 o 3 segons indicador)
      "D1":{nom:"Urbà residencial: reg de jardins privats", codi:"Dummy1",
        qualitat:{
          I1  : 6,
          I2  : 1000,
          I3  : 2,
          I4  : 10,
          I5  : 'nd',
          I6  : 600,
          I7  : 10000,
          I8  : 30,
          I9  : 4,
          I10 : 0.05,
          I11 : 0.1,
          I12 : 88,
          I13 : 0.14,
          I14 : 29000,
          I15 : 0.038,
          I16 : 87,
          I17 : 0.00065,
          I18 : 1.3,
          I19 : 0,
          I20 : 'nd',
          I21 : 'nd',
          I22 : 43,
        },
        trens_acceptats:[1,2] //Cas inventat

      },
      "D2":{nom:"Urbà residencial: descàrrega cisternes vàter", codi:"Dummy2",
        qualitat:{
          I1  : 'nd',
          I2  : 'nd',
          I3  : 2,
          I4  : 10,
          I5  : 'nd',
          I6  : 27000,
          I7  : 'nd',
          I8  : 'nd',
          I9  : 'nd',
          I10 : 'nd',
          I11 : 'nd',
          I12 : 'nd',
          I13 : 'nd',
          I14 : 6700,
          I15 : 'nd',
          I16 : 'nd',
          I17 : 'nd',
          I18 : 'nd',
          I19 : 0,
          I20 : 'nd',
          I21 : 'nd',
          I22 : 5.7,
        },
        trens_acceptats:[1,2] //Cas inventat

      },
      // Valors protectors (tipus 1)
      "D14":{nom:"Ambiental: altres usos (manteniment aiguamolls, cabals mínims i similars)", codi:"Dummy14",
        qualitat:{
          I1  : 6,
          I2  : 1000,
          I3  : 0,
          I4  : 35,
          I5  : 0,
          I6  : 600,
          I7  : 25000,
          I8  : 30,
          I9  : 4,
          I10 : 0.05,
          I11 : 0.1,
          I12 : 88,
          I13 : 0.14,
          I14 : 58000,
          I15 : 0.038,
          I16 : 87,
          I17 : 0.00065,
          I18 : 1.3,
          I19 : 0,
          I20 : 0,
          I21 : 0,
          I22 : 43,
        },
        trens_acceptats:[1,2] //Cas inventat

      },
    };
  }*/
}
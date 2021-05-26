/* DEFINICIÓ DE CLASSES */

//la classe Corrent representa un corrent d'aigua (un cabal) amb les seves
//característiques de qualitat
class Corrent{
  //info items qualitat
  static get info_qualitat(){
    return {
      "I1" :{nom:"pH",                                  unitat:"∅"},
      "I2" :{nom:"Conductivitat elèctrica",             unitat:"μS/cm"},
      "I3" :{nom:"Terbolesa",                           unitat:"NTU"},
      "I4" :{nom:"SST",                                 unitat:"mg/L"},
      "I5" :{nom:"COT",                                 unitat:"mg/L"},
      "I6" :{nom:"NH4+",                                unitat:"mg/L"},
      "I7" :{nom:"NO3-",                                unitat:"mg/L"},
      "I8" :{nom:"Zn",                                  unitat:"μg/L"},
      "I9" :{nom:"Ni",                                  unitat:"μg/L"},
      "I10":{nom:"Carbamazepina",                       unitat:"μg/L"},
      "I11":{nom:"Diclofenac",                          unitat:"μg/L"},
      "I12":{nom:"N,N-Dietil-m-toluamida (DEET)",       unitat:"μg/L"},
      "I13":{nom:"Iopromida",                           unitat:"μg/L"},
      "I14":{nom:"1,4-Dioxà",                           unitat:"μg/L"},
      "I15":{nom:"Venlafaxina",                         unitat:"μg/L"},
      "I16":{nom:"Cafeïna",                             unitat:"μg/L"},
      "I17":{nom:"Àcid perfluorooctanosulfònic (PFOS)", unitat:"μg/L"},
      "I18":{nom:"Bis(2-etilhexil) ftalat (DEHP)",      unitat:"μg/L"},
      "I19":{nom:"E. coli",                             unitat:"CFU/mL"},
      "I20":{nom:"Colífags",                            unitat:"PFU/mL"},
      "I21":{nom:"Clostridium perfringens",             unitat:"espores/100mL"},
      "I22":{nom:"N-Nitrosodimetilamina (NDMA)",        unitat:"μg/L"},
    };
  }

  constructor(){
    //característiques corrent (diccionari)
    this.Q = 0; //m3

    this.qualitat={};
    Object.keys(Corrent.info_qualitat).forEach(id=>{
      this.qualitat[id]=0;
    });
  }

  //aplica un carro de tecnologies
  //genera 2 nous corrents "min" i "max"
  aplica_tren_tractaments(array_tractaments){
    //retorna dos corrents nous
    let min = new Corrent(); //eliminació mínima
    let max = new Corrent(); //eliminació màxima

    //copia el cabal actual al cabal dels nous corrents
    min.Q = this.Q;
    max.Q = this.Q;

    //calcula qualitat dels nous corrents aplicant eliminació
    Object.keys(this.qualitat).forEach(id=>{
      min.qualitat[id] = this.qualitat[id];
      max.qualitat[id] = this.qualitat[id];

      array_tractaments.forEach(tractament=>{
        if(!tractament[id]) return;
        min.qualitat[id] *= 1-tractament[id].min/100;
        max.qualitat[id] *= 1-tractament[id].max/100;
      });
    });

    return {min, max};
  }

  //detecta incompliments
  incompleix(corrent){
    return Object.keys(corrent.qualitat).filter(id=>{
      return this.qualitat[id] > corrent.qualitat[id];
    });
  }
}

//infraestructura existent de l'usuari
class Usuari{
  constructor(){
    this.corrent = new Corrent(); //qualitat actual
    this.corrent_objectiu = new Corrent(); //qualitat desitjada
  }
  static get info_tractaments(){
    return{
      "FAC_DS0":{tipus:"secundari", nom:"Origen no definit",
        qualitat:{
          I1  : 0,
          I2  : 0,
          I3  : 0,
          I4  : 0,
          I5  : 0,
          I6  : 0,
          I7  : 0,
          I8  : 0,
          I9  : 0,
          I10 : 0,
          I11 : 0,
          I12 : 0,
          I13 : 0,
          I14 : 0,
          I15 : 0,
          I16 : 0,
          I17 : 0,
          I18 : 0,
          I19 : 0,
          I20 : 0,
          I21 : 0,
        },
      },
      "FAC_DS1":{tipus:"secundari", nom:"Llots actius convencionals sense nitrificació",
        qualitat:{
          I1  : 7.5,
          I2  : 2000,
          I3  : 15,
          I4  : 25,
          I5  : 40,
          I6  : 43.8,
          I7  : 4,
          I8  : 700,
          I9  : 100,
          I10 : 20,
          I11 : 10,
          I12 : 15.8,
          I13 : 6,
          I14 : 3.5,
          I15 : 2.6,
          I16 : 23,
          I17 : 2.101,
          I18 : 81,
          I19 : 1e5,
          I20 : 1e6,
          I21 : 1e4,
        },
      },
      "FAC_DS2":{tipus:"secundari", nom:"Llots actius convencionals amb nitrificació",
        qualitat:{
          I1  : 7.5   ,
          I2  : 2000  ,
          I3  : 15    ,
          I4  : 25    ,
          I5  : 40    ,
          I6  : 12.9  ,
          I7  : 133   ,
          I8  : 700   ,
          I9  : 100   ,
          I10 : 20    ,
          I11 : 10    ,
          I12 : 15.8  ,
          I13 : 6     ,
          I14 : 3.5   ,
          I15 : 2.6   ,
          I16 : 23    ,
          I17 : 2.101 ,
          I18 : 81    ,
          I19 : 1e5   ,
          I20 : 1e6   ,
          I21 : 1e4   ,
        },
      },
      "FAC_DS3":{tipus:"secundari", nom:"Llots actius convencionals amb nitrificació, desnitrificació biològica i eliminació biològica de PO4",
        qualitat:{
          I1  : 7.5,
          I2  : 2000,
          I3  : 5,
          I4  : 20,
          I5  : 20,
          I6  : 5.1,
          I7  : 53,
          I8  : 700,
          I9  : 100,
          I10 : 20,
          I11 : 10,
          I12 : 15.8,
          I13 : 6,
          I14 : 3.5,
          I15 : 2.6,
          I16 : 23,
          I17 : 2.101,
          I18 : 81,
          I19 : 1e5,
          I20 : 1e6,
          I21 : 1e4,
        },
      },
      "BRM1":{tipus:"secundari", nom:"Reactor biològic de membrana amb nitrificació",
        qualitat:{
          I1  :7.5   ,
          I2  :2000  ,
          I3  :2     ,
          I4  :5     ,
          I5  :5     ,
          I6  :6.4   ,
          I7  :53    ,
          I8  :700   ,
          I9  :100   ,
          I10 :20    ,
          I11 :10    ,
          I12 :15.8  ,
          I13 :6     ,
          I14 :3.5   ,
          I15 :2.6   ,
          I16 :23    ,
          I17 :2.101 ,
          I18 :81    ,
          I19 :1e2   ,
          I20 :1e3   ,
          I21 :1e2   ,
        },
      },
      "BRM2":{tipus:"secundari", nom:"Reactor biològic de membrana amb nitrificació, desnitrificació biològica i eliminació biològica de PO4",
        qualitat:{
          I1  :7.5,
          I2  :2000,
          I3  :2,
          I4  :5,
          I5  :5,
          I6  :1.3,
          I7  :53,
          I8  :700,
          I9  :100,
          I10 :20,
          I11 :10,
          I12 :15.8,
          I13 :6,
          I14 :3.5,
          I15 :2.6,
          I16 :23,
          I17 :2.10,
          I18 :81,
          I19 :1e2,
          I20 :1e3,
          I21 :1e2,
        },
      },
    };
  }
  static get info_usos(){
    return{
      "L0":{nom:"Ús no definit",
        qualitat:{
          I1  : 0,
          I2  : 0,
          I3  : 0,
          I4  : 0,
          I5  : 0,
          I6  : 0,
          I7  : 0,
          I8  : 0,
          I9  : 0,
          I10 : 0,
          I11 : 0,
          I12 : 0,
          I13 : 0,
          I14 : 0,
          I15 : 0,
          I16 : 0,
          I17 : 0,
          I18 : 0,
          I19 : 0,
          I20 : 0,
          I21 : 0,
        },
      },
      "U1":{nom:"Ús inventat 1 (canviar per definició real)",
        qualitat:{
          I1  : 1,
          I2  : 1,
          I3  : 1,
          I4  : 1,
          I5  : 1,
          I6  : 1,
          I7  : 1,
          I8  : 1,
          I9  : 1,
          I10 : 1,
          I11 : 1,
          I12 : 1,
          I13 : 1,
          I14 : 1,
          I15 : 1,
          I16 : 1,
          I17 : 1,
          I18 : 1,
          I19 : 1,
          I20 : 1,
          I21 : 1,
        },
      },
      "U2":{nom:"Ús inventat 2 (canviar per definició real)",
        qualitat:{
          I1  : 10,
          I2  : 10,
          I3  : 10,
          I4  : 10,
          I5  : 10,
          I6  : 10,
          I7  : 10,
          I8  : 10,
          I9  : 10,
          I10 : 10,
          I11 : 10,
          I12 : 10,
          I13 : 10,
          I14 : 10,
          I15 : 10,
          I16 : 10,
          I17 : 10,
          I18 : 10,
          I19 : 10,
          I20 : 10,
          I21 : 10,
        },
      },
    };
  }
}

//percentatges d'eliminació
//sintaxi: Tractaments[tractament][pretractament][id]{min,max}
let Tractaments={
  "BRM":{
    "DP":{
      I1 : {min : 7.5 , max : 8.5   },
      I3 : {min : 99  , max : 100   },
      I4 : {min : 99  , max : 100   },
      I5 : {min : 50  , max : 74    },
      I6 : {min : 90  , max : 96    },
      I8 : {min : 0   , max : 60.8  },
      I9 : {min : 0   , max : 55.2  },
      I10: {min : 2   , max : 32    },
      I11: {min : 53  , max : 91    },
      I12: {min : 6   , max : 94    },
      I13: {min : 15  , max : 25    },
      I14: {min : 0   , max : 20    },
      I15: {min : 0   , max : 20    },
      I16: {min : 85  , max : 100   },
      I18: {min : 0   , max : 10    },
      I19: {min : 0   , max : 99.99 },
      I20: {min : 0   , max : 96.84 },
      I21: {min : 0   , max : 99    },
    },
  },
  "FQ_D":{
    "FAC_DS":{
      I1 : {min : 7.5 , max : 8.5   },
      I3 : {min : 99  , max : 100   },
      I4 : {min : 99  , max : 100   },
      I5 : {min : 50  , max : 74    },
      I6 : {min : 90  , max : 96    },
      I8 : {min : 0   , max : 60.8  },
      I9 : {min : 0   , max : 55.2  },
      I10: {min : 2   , max : 32    },
      I11: {min : 53  , max : 91    },
      I12: {min : 6   , max : 94    },
      I13: {min : 15  , max : 25    },
      I14: {min : 0   , max : 20    },
      I15: {min : 0   , max : 20    },
      I16: {min : 85  , max : 100   },
      I18: {min : 0   , max : 10    },
      I19: {min : 0   , max : 99.99 },
      I20: {min : 0   , max : 96.84 },
      I21: {min : 0   , max : 99    },
    },
  },
  "FS":{
    "FAC_DS":{
      I3  :{min:30 , max:50   },
      I4  :{min:60 , max:80   },
      I5  :{min:0  , max:30.2 },
      I8  :{min:71 , max:87   },
      I9  :{min:18 , max:23   },
      I19 :{min:0  , max:90   },
      I20 :{min:45 , max:90   },
      I21 :{min:48 , max:93   },
    },
    "FQ_D":{
      I3  : {min:30 , max:50},
      I4  : {min:60 , max:80},
      I5  : {min:0  , max:30.2},
      I8  : {min:71 , max:87},
      I9  : {min:18 , max:23},
      I19 : {min:0  , max:90},
      I20 : {min:45 , max:90},
      I21 : {min:48 , max:93},
    },
  },
};

/* DEFINICIÓ DE CLASSES */

//la classe Corrent representa un corrent d'aigua (un cabal) amb les seves
//característiques de qualitat
export default class Corrent{
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
      "I19":{nom:"E. coli",                             unitat:"CFU/100mL"},
      "I20":{nom:"Colífags",                            unitat:"PFU/100mL"},
      "I21":{nom:"Espores Clostridium perfringens",     unitat:"espores/100mL"},
      "I22":{nom:"N-nitrosodimethylamine (NDMA)",       unitat:"μg/L"}

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

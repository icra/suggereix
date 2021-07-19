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
      this.qualitat[id] = 0;
    });
  }

  //aplica un carro de tecnologies
  //genera 2 nous corrents "min" i "max"
  aplica_tren_tractaments2(array_tractaments){
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

  aplica_tren_tractaments(array_tractaments, tractaments_dict, tractament_secundari){

    //retorna dos corrents nous
    let _this = this;
    let min = new Corrent(); //eliminació mínima
    let max = new Corrent(); //eliminació màxima

    //copia el cabal actual al cabal dels nous corrents
    min.Q = _this.Q;
    max.Q = _this.Q;
    console.log(array_tractaments);

    let n = array_tractaments.length; // número de tractaments aplicats en el tren
    let efluent_secundari = tractament_secundari;

    // guardem els 'FAC_DS1/2/3' com a 'FAC_DS'
    if (efluent_secundari.includes("FAC_DS"))
      efluent_secundari = "FAC_DS";

    // si efluent secundari és 'BRM' i el primer tractament també, no s'ha de tenir en compte, l'eliminem
    if (efluent_secundari.includes('BRM') && array_tractaments[0] === 'BRM') {
      efluent_secundari = 'BRM';
      array_tractaments = array_tractaments.splice(0, 1);
      //console.log('modificat array', array_tractaments);
    }

    // si el primer tractament és 'BRM' i l'efluent secundari no és 'BRM', el guardem com a 'DP' perquè és l'únic
    // pretractament possible.
    if (!efluent_secundari.includes('BRM') && array_tractaments[0] === 'BRM')
      efluent_secundari = 'DP';

    //calcula qualitat dels nous corrents aplicant eliminació
    Object.keys(_this.qualitat).forEach(id=>{
      //calculem l'eliminació de tots els indicadors excepte del pH ('I1').
      if (id !== 'I1'){
        min.qualitat[id] = _this.qualitat[id];
        max.qualitat[id] = _this.qualitat[id];
        let pretractament = efluent_secundari;
        let r_min = 1;
        let r_max = 1;
        //console.log('dins for each:',id, pretractament);
        array_tractaments.forEach(tractament=>{
          //console.log('hola: ', tractament, pretractament, id, tractaments_dict)
          if(!tractaments_dict[tractament][pretractament][id]) {
            console.log('no existeix')
            return;
          }
          //console.log('dins array tractaments:', tractaments_dict[tractament][pretractament][id]);
          r_min = r_min * (100 - tractaments_dict[tractament][pretractament][id].min);
          r_max = r_max * (100 - tractaments_dict[tractament][pretractament][id].max);
          pretractament = tractament;
        });
        //r_min = Math.round(((1.0 - (r_min / Math.pow(100, n))) + Number.EPSILON) * 10000) / 10000;
        r_min = 1.0 - (r_min / Math.pow(100, n));
        r_max = 1.0 - (r_max / Math.pow(100, n));

        min.qualitat[id] = Math.round(((_this.qualitat[id].min * (1 - r_max)) + Number.EPSILON) * 10000) / 10000; //arrodonit a 5 decimals
        max.qualitat[id] = Math.round(((_this.qualitat[id].max * (1 - r_min)) + Number.EPSILON) * 10000) / 10000;

        //console.log(id, r_min, max.qualitat[id]);
      }
    });

    return {min, max};

  }

  //detecta els compliments
  n_compliments(corrent){
    return Object.keys(corrent.qualitat).filter(id=>{
      let indicadors_microbiologics = ['I19', 'I20', 'I21'];
      //mirar tots els indicadors excepte el pH ('I1')
      if (id !== 'I1'){

        //si el VP és 'nd', es considera que compleix (excepte els microbiològics) --- REPASSAR LO DELS INDICADORS MICROBIOLÒGICS AMB NOVES INDICACIONS MERCÈ...
        if (!indicadors_microbiologics.includes(id) && corrent.qualitat[id] === 'nd')
          return true;

        else {
          if (id === 'I8')
            return this.qualitat[id] < 500;
          else if (id === 'I9')
            return this.qualitat[id] < 20;
          else
            return this.qualitat[id] < corrent.qualitat[id];
        }
      }
    });
  }
}

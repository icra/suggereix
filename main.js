/* DEFINICIÓ DE CLASSES */

//la classe Corrent representa un corrent d'aigua (un cabal) amb les seves
//característiques de qualitat
class Corrent{
  //característiques del corrent "qualitat"
  //podem afegir-hi els valors per defecte TODO
  static get qualitat(){
    return [
      "pH", //unitats
      "Conductivitat", //unitats
      "Terbolesa", //unitats
      "TSS", //unitats
      "TOC", //unitats
      "NH4", //unitats
      "NO3", //unitats
      "Zn", //unitats
      "Ni", //unitats
      "Carbamazepine", //unitats
      "Diclofenac", //unitats
      "DEET", //unitats
      "Iopromide", //unitats
      "Dioxane", //unitats
      "NDMA", //unitats
      "Ecoli", //unitats
      "SomaticColiphages", //unitats
      "SporesClostridiumPerfringens", //unitats
    ];
  }

  //constructor
  constructor(){
    //cabal
    this.Q = 0; //m3/d

    //característiques del corrent (contaminants, etc)
    //itera mètode estàtic "Corrent.qualitat"
    this.qualitat={};
    Corrent.qualitat.forEach(key=>{
      this.qualitat[key]=0;
    });
  }

  //aplica un carro de tecnologies
  //genera 2 nous corrents "min" i "max"
  aplica_carro_tecnologies(array_tecnologies){
    //retorna dos corrents nous
    let corrent_min = new Corrent(); //corrent amb eliminació mínima
    let corrent_max = new Corrent(); //corrent amb eliminació màxima

    //copia el cabal actual al cabal dels nous corrents
    corrent_min.Q = this.Q;
    corrent_max.Q = this.Q;

    //calcula qualitat dels nous corrents aplicant eliminació
    Object.keys(this.qualitat).forEach(key=>{
      corrent_min.qualitat[key] = this.qualitat[key];
      corrent_max.qualitat[key] = this.qualitat[key];

      array_tecnologies.forEach(tecnologia=>{
        corrent_min.qualitat[key] *= 1-tecnologia.eliminacio[key].min/100;
        corrent_max.qualitat[key] *= 1-tecnologia.eliminacio[key].max/100;
      });
    });

    return {min:corrent_min, max:corrent_max};;
  }

  //detecta quins items de la normativa no compleix el corrent
  //retorna array de strings
  incompleix(normativa){
    return Object.keys(normativa).filter(key=>{
      return this.qualitat[key] > normativa[key];
    });
  }
}

//exemple de normativa:
//valors màxims de qualitat d'un corrent
let normativa={
  "Terbolesa": 50,
  "TSS"      : 40,
};

//tecnologia "abstracta" amb eliminació zero
class Tecnologia{
  constructor(){
    //defineix l'eliminació de les característiques del corrent
    //itera mètode estàtic "Corrent.qualitat"
    this.eliminacio={};
    Corrent.qualitat.forEach(key=>{
      this.eliminacio[key]={min:0,max:0};
    });
  }
}

//Totes les combinacions de etapa prèvia + tractament
//tecnologia real extends Tecnologia TODO
class DS_FQDF extends Tecnologia{
  constructor(){
    super();
    this.eliminacio.Terbolesa                    ={min:30,  max:50 };
    this.eliminacio.TSS                          ={min:50,  max:70 };
    this.eliminacio.TOC	                         ={min:50,  max:70 };
    this.eliminacio.NH4	                         ={min:0,   max:25 };
    this.eliminacio.Zn	                         ={min:50,  max:70 };
    this.eliminacio.Ni	                         ={min:0,   max:20 };
    this.eliminacio.Carbamazepine	               ={min:9,   max:15 };
    this.eliminacio.Diclofenac	                 ={min:0,   max:11 };
    this.eliminacio.DEET	                       ={min:0,   max:1  };
    this.eliminacio.Ecoli	                       ={min:1,   max:2  };
    this.eliminacio.SomaticColiphages	           ={min:2.6, max:3.4};
    this.eliminacio.SporesClostridiumPerfringens ={min:0,   max:2.4};
  }
}
class DS_MFUF   extends Tecnologia{/*TODO*/}
class FQDF_MFUF extends Tecnologia{/*TODO*/}

/*EXPORTAR CLASSES TODO*/
//module.export


/*CODI D'EXEMPLE*/

//crea un corrent que surt d'una depuradora ("efluent")
let efluent = new Corrent();
//defineix característiques de la seva qualitat
efluent.qualitat.Terbolesa                    =100;
efluent.qualitat.TSS                          =100;
efluent.qualitat.pH                           =100;
efluent.qualitat.Conductivitat                =100;
efluent.qualitat.Terbolesa                    =100;
efluent.qualitat.TSS                          =100;
efluent.qualitat.TOC                          =100;
efluent.qualitat.NH4                          =100;
efluent.qualitat.NO3                          =100;
efluent.qualitat.Zn                           =100;
efluent.qualitat.Ni                           =100;
efluent.qualitat.Carbamazepine                =100;
efluent.qualitat.Diclofenac                   =100;
efluent.qualitat.DEET                         =100;
efluent.qualitat.Iopromide                    =100;
efluent.qualitat.Dioxane                      =100;
efluent.qualitat.NDMA                         =100;
efluent.qualitat.Ecoli                        =100;
efluent.qualitat.SomaticColiphages            =100;
efluent.qualitat.SporesClostridiumPerfringens =100;

//aplica un carro de tecnologies
let corrents = efluent.aplica_carro_tecnologies([
  new DS_FQDF(),
  new FQDF_MFUF(),
]);

//mostra resultats i calcula incompliments
console.log('====efluent====');
console.log(efluent)
console.log(`Incompliments: `+efluent.incompleix(normativa));

console.log('====corrent min====');
console.log(corrents.min);
console.log(`Incompliments: `+corrents.min.incompleix(normativa));

console.log('====corrent max====');
console.log(corrents.max);
console.log(`Incompliments: `+corrents.max.incompleix(normativa));

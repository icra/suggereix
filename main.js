/* DEFINICIÓ DE CLASSES */

//la classe Corrent representa un corrent d'aigua (un cabal) amb les seves
//característiques de qualitat
class Corrent{
  constructor(){
    //cabal
    this.Q = 0; //m3/d

    //característiques del corrent (contaminants, etc)
    this.qualitat={};
    Corrent.qualitat.forEach(key=>{
      this.qualitat[key]=0;
    });
  }

  //aplica un carro de tecnologies
  aplica_carro_tecnologies(array_tecnologies){
    //retorna dos corrents nous
    let corrent_min = new Corrent();
    let corrent_max = new Corrent();

    //cabal dels nous corrents
    corrent_min.Q = this.Q;
    corrent_max.Q = this.Q;

    //copia qualitat corrent original
    Object.keys(this.qualitat).forEach(key=>{
      corrent_min.qualitat[key] = this.qualitat[key];
      corrent_max.qualitat[key] = this.qualitat[key];
    });

    //aplica tecnologia per cada contaminant
    Object.keys(this.qualitat).forEach(key=>{
      array_tecnologies.forEach(tecnologia=>{
        corrent_min.qualitat[key] *= (100-tecnologia.eliminacio[key].min)/100;
        corrent_max.qualitat[key] *= (100-tecnologia.eliminacio[key].max)/100;
      });
    });

    return {min:corrent_min, max:corrent_max};;
  }

  compleix(normativa){
    let compliments=[];

    //retorna array de strings que no compleixen amb la normativa
    Object.keys(normativa).forEach(key=>{
      if(this.qualitat[key] > normativa[key]){
        compliments.push(key);
      }
    }); //array de strings (que no compleixen)

    return compliments;
  }

  static get qualitat(){
    return [
      "pH"                           ,
      "Conductivitat"                ,
      "Terbolesa"                    ,
      "TSS"                          ,
      "TOC"                          ,
      "NH4"                          ,
      "NO3"                          ,
      "Zn"                           ,
      "Ni"                           ,
      "Carbamazepine"                ,
      "Diclofenac"                   ,
      "DEET"                         ,
      "Iopromide"                    ,
      "Dioxane"                      ,
      "NDMA"                         ,
      "ecoli"                        ,
      "SomaticColiphages"            ,
      "SporesClostridiumPerfringens" ,
    ];
  }
}

//normativa (valors màxims de qualitat d'un corrent)
let normativa={
  "Terbolesa" : 50,
  "TSS"       : 40,
};

//tecnologia "abstracta"
class Tecnologia{
  constructor(){
    this.eliminacio={};

    Corrent.qualitat.forEach(key=>{
      this.eliminacio[key]={min:0, max:0};
    });

  }
}

//tecnologia real exten la tecnolgia abstracta
class DS_FQDF extends Tecnologia{
  constructor(){
    super();
    this.eliminacio.Terbolesa={min:30,max:50};
    this.eliminacio.TSS      ={min:50,max:70};
    //this.eliminacio.TOC	50	70
    //this.eliminacio.NH4	0	25
    //this.eliminacio.NO3	0	0
    //this.eliminacio.Zn	50	70
    //this.eliminacio.Ni	0	20
    //this.eliminacio.Carbamazepine	9	15
    //this.eliminacio.Diclofenac	0	11
    //this.eliminacio.N,N-diethyl-m-toluamide (DEET)	0	1
    //this.eliminacio.E. coli**	1	2
    //this.eliminacio.Somatic coliphages**	2,6	3,4
    //this.eliminacio.Spores Clostridium perfringens**	N.A	2,4
  }
}

class DS_MFUF   extends Tecnologia{/*TODO*/}
class FQDF_MFUF extends Tecnologia{/*TODO*/}
//TODO totes les combinacions de etapa prèvia + tractament

//TODO
//exportar classes
//module.export

/* CODI D'EXEMPLE*/
//crea un corrent
let efluent = new Corrent();
efluent.qualitat.Terbolesa = 100; //mg/L
efluent.qualitat.TSS       = 100; //mg/L

//carro de tecnologies
let t1 = new DS_FQDF();
let t2 = new FQDF_MFUF();
let corrents = efluent.aplica_carro_tecnologies([t1,t2]);

console.log(efluent)

console.log('corrent min');
console.log(corrents.min);
console.log(corrents.min.compleix(normativa));

console.log('corrent max');
console.log(corrents.max);
console.log(corrents.max.compleix(normativa));

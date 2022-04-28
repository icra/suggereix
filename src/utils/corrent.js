/* DEFINICIÓ DE CLASSES */

//la classe Corrent representa un corrent d'aigua (un cabal) amb les seves
//característiques de qualitat
export default class Corrent {

    constructor(info_indicadors) {
        //característiques corrent (diccionari)
        this.Q = 2000; //m3
        this.F = 90;   //%

        this.qualitat = {};
        this.eliminacio = {};
        this.refs = {};
        this.regulat = {};
        this.seleccionat = {};
        for(const id of Object.keys(info_indicadors)){
            if(id !== 'OT1' && id !== 'OT2'){
                this.qualitat[id] = 0;
                this.refs[id] = "";
                this.eliminacio[id] = 0;
                this.seleccionat[id] = id !== 'I1' ? true : false;
            }
        }
    }

    //aplica un carro de tecnologies/tractaments
    //genera 2 nous corrents "min" i "max"
    aplica_tren_tractaments(info_indicadors, array_tractaments, tractaments_dict, dict_tractaments_m, tractament_secundari, key) {

        //retorna dos corrents nous
        let _this = this;
        let min = new Corrent(info_indicadors); //eliminació mínima
        let max = new Corrent(info_indicadors); //eliminació màxima

        //copia el cabal actual al cabal dels nous corrents
        min.Q = _this.Q;
        max.Q = _this.Q;

        let efluent_secundari = tractament_secundari;

        // guardem els 'FAC_DS1/2/3' com a 'FAC_DS'
        if (efluent_secundari.includes("FAC_DS"))
            efluent_secundari = "FAC_DS";

        // si efluent secundari és 'BRM' i el primer tractament també, no s'ha de tenir en compte, l'eliminem de l'array.
        if (efluent_secundari.includes('BRM') && array_tractaments[0] === 'BRM') {
            efluent_secundari = 'BRM';
            let array_modificat = [];

            for (let i = 1; i < array_tractaments.length; i++)
                array_modificat.push(array_tractaments[i]);

            array_tractaments = array_modificat;
        }

        //calcula qualitat dels nous corrents aplicant eliminació
        for (const [id, selected] of Object.entries(_this.seleccionat)) {
            //calculem l'eliminació de tots els indicadors excepte no seleccionats.
            if(selected){
                min.qualitat[id] = _this.qualitat[id];
                max.qualitat[id] = _this.qualitat[id];
                let r_min = 1;
                let r_max = 1;
                let pretractament = efluent_secundari;

                // En cas de tractar-se de indicadors microbiològics, aplicar primer els tractaments primari i secundari (si n'hi ha) fins a arribar al mateix punt de referència dels altres indicadors.
                let n = array_tractaments.length; // número de tractaments aplicats en el tren
                if (id === 'I19' || id === 'I20' || id === 'I21') {
                    pretractament = 'na';
                    const array_pretractaments = ['DP'];
                    if (tractament_secundari !== 'DP') {
                        array_pretractaments.push(tractament_secundari);
                    }
                    n += array_pretractaments.length;
                    array_pretractaments.forEach(tractament => {
                        if (!dict_tractaments_m[tractament][pretractament][id]) {
                            return;
                        }

                        r_min = r_min * (100 - dict_tractaments_m[tractament][pretractament][id].min);
                        r_max = r_max * (100 - dict_tractaments_m[tractament][pretractament][id].max);
                        pretractament = tractament;
                    });
                    pretractament = efluent_secundari;
                }

                array_tractaments.forEach(tractament => {
                    if(!tractaments_dict[tractament]){
                        console.log("Error: No s'ha trobat el tractament '"+tractament+"' del tren:");
                        console.log(array_tractaments);
                        throw new Error();
                    }
                    else if( !tractaments_dict[tractament][pretractament]){
                        console.log("Error: No s'ha trobat el pretractament '"+pretractament+"' en el tractament '"+tractament+"' del tren:");
                        console.log(array_tractaments);
                        throw new Error();
                    }
                    else if (!tractaments_dict[tractament][pretractament][id]){
                        console.log("Error: No s'ha trobat l'indicador '"+id+"' pel pretractament '"+pretractament+"' en el tractament '"+tractament+"' del tren:");
                        console.log(array_tractaments);
                        throw new Error();
                    }

                    r_min = r_min * (100 - tractaments_dict[tractament][pretractament][id].min);
                    r_max = r_max * (100 - tractaments_dict[tractament][pretractament][id].max);
                    pretractament = tractament;
                });
                r_min = 1.0 - (r_min / Math.pow(100, n));
                r_max = 1.0 - (r_max / Math.pow(100, n));
                min.eliminacio[id] = r_min;
                max.eliminacio[id] = r_max;

                min.qualitat[id] = _this.qualitat[id].min * (1 - r_max)
                max.qualitat[id] = _this.qualitat[id].max * (1 - r_min)
            }
        }

        return {
            min,
            max
        };

    }

    //detecta els compliments i retorna un array amb els ids dels indicadors que compleixen.
    n_compliments(type, ind_seleccionats, corrent, qualitat_micro, usos_seleccionats, qualitat_inicial, usos_info) {

        const indicadors_microbiologics = ['I19', 'I20', 'I21'];

        // 0: compleix. 1: incompleix però indicador no és regulat, 2: incompleix indicador regulat.
        const compliments = {};

        // First, get an array of evaluations.
        for (const [id, selected] of Object.entries(ind_seleccionats)) {
            //mirar tots els indicadors excepte els no seleccionats.
            if (selected) {
                //si el VP és 'nd', es considera que compleix (excepte els microbiològics).
                if (!indicadors_microbiologics.includes(id) && corrent.qualitat[id] === 'nd') {
                    compliments[id] = 0;
                } else if (indicadors_microbiologics.includes(id)) {
                    if (corrent.qualitat[id] === 'nd' || this.qualitat[id] <= corrent.qualitat[id]) {
                        // Ara cal comprovar que s'ha aconseguit un Rmin de, com a mínim, el que s'especifica en la Taula A8 per els usos seleccionats.
                        let reduccio_requerida = 0;
                        for (const usage of usos_seleccionats) {
                            if (qualitat_micro[usage][id][0] > reduccio_requerida) reduccio_requerida = qualitat_micro[usage][id][0];
                        }
                        if (this.qualitat[id] <= (1 - reduccio_requerida) * qualitat_inicial[id][type]) {
                            compliments[id] = 0;
                        } else {
                            compliments[id] = corrent.regulat[id] ? 2 : 1;
                        }
                    } else compliments[id] = corrent.regulat[id] ? 2 : 1;
                } else if (this.qualitat[id] <= corrent.qualitat[id]) {
                    compliments[id] = 0;
                } else {
                    compliments[id] = corrent.regulat[id] ? 2 : 1;
                }
            }
        }
        return compliments;
    }
}
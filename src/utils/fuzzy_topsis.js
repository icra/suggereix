// This file implements the logic for a fuzzy topsis multi criteria decision making.
// - ref: https://www.irjet.net/archives/V4/i5/IRJET-V4I5548.pdf

// Fuzzy logic library.
import {
    variable,
    triangle,
    classify
} from "@thi.ng/fuzzy";

// We assign letters to the position number of the arrays [0,1,2] corresponding with a fuzzy triangle (A,B,C).
const A = 0;
const B = 1;
const C = 2;

// This is the FUZZY RATINGS FOR LINGUISTIC VARIABLES default alternative assessment dictionary.
const alternativeAssessmentFuzzyRatings = {
    'VP': [0,0,0.25],
    'P': [0,0.25,0.5],
    'F': [0.25,0.5,0.75],
    'G': [0.5,0.75,1],
    'VG': [0.75,1,1]
};

// This is the FUZZY RATINGS FOR LINGUISTIC VARIABLES default QA weights dictionary.
const QAWeightsFuzzyRatings = {
    'VL': [0,0,0.25],
    'L': [0,0.25,0.5],
    'M': [0.25,0.5,0.75],
    'H': [0.5,0.75,1],
    'VH': [0.75,1,1]
}

// This assessment fuzzy variable will be used to classify normalized values to our fuzzy system.
const assessmentFuzzy = variable(
    // value domain
    [0, 1],
    {
        'VP': triangle(0,0,0.25),
        'P': triangle(0,0.25,0.5),
        'F': triangle(0.25,0.5,0.75),
        'G': triangle(0.5,0.75,1),
        'VG': triangle(0.75,1,1)
    }
);

// This function fuzzifies normalized values of a criterion dictionary (matrix).
export const fuzzifyMatrix = (fuzzy_dict) => {
    for(const criterion of Object.keys(fuzzy_dict)){
        for(const alternative of Object.keys(fuzzy_dict[criterion])){
            const assessmentKey = classify(assessmentFuzzy, fuzzy_dict[criterion][alternative])
            fuzzy_dict[criterion][alternative] = alternativeAssessmentFuzzyRatings[assessmentKey];
        }
    }
    return fuzzy_dict;
}

// This function returns the min and max value of a criterion for all the alternatives.
const getMinMax = (criterion_alternative_rating) => {
    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;
    for(const triangle_value of Object.values(criterion_alternative_rating)){
        if(Math.min(...triangle_value) < min) min = Math.min(...triangle_value);
        if(Math.max(...triangle_value) > max) max = Math.max(...triangle_value);
    }
    return [min, max];
}

// This function finds the distance between two fuzzy triangles.
const getDistance= (a,b) => {
    return Math.sqrt((1/3)*(Math.pow(a[A]-b[A],2)+Math.pow(a[B]-b[B],2)+Math.pow(a[C]-b[C],2)));
}

// This main method applies fuzzy topsis from an alternative rating matrix (dictionary), the criteria weightage 
//  and if the criteria is beneficial or not.
export const fuzzyTopsis = (alternative_rating, criteria_weightage, criteria_benefit_cost) => {

    // Step 1: FUZZY MULTI CRITERIA GROUP DECISION MAKING (GDM) AND PROCESS OF NORMALIZING.
    const normalized_alternative_rating = {};

    for(const criterion of Object.keys(alternative_rating)){
        normalized_alternative_rating[criterion] = {};
        const [w_a,w_b,w_c] = QAWeightsFuzzyRatings[criteria_weightage[criterion]];
        for(const alternative of Object.keys(alternative_rating[criterion])){
            // Apply different procedure depending if the criteria is beneficial or cost.
            const a = alternative_rating[criterion][alternative][A];
            const b = alternative_rating[criterion][alternative][B];
            const c = alternative_rating[criterion][alternative][C];
            const [min, max] = getMinMax(alternative_rating[criterion]);
            if(criteria_benefit_cost[criterion]){
                // Beneficial criteria.
                normalized_alternative_rating[criterion][alternative] = [(a/max)*w_a,(b/max)*w_b,(c/max)*w_c];
            }
            else{
                // Cost criteria.
                normalized_alternative_rating[criterion][alternative] = [(min/c)*w_a,(min/b)*w_b,(min/a)*w_c];
            }
        }
    }

    // Step 2: FPIS AND FNIS for each criteria.
    //  For each criteria we compute p+ and p- forming Z+(p+_1,...,p+_n) and Z-(p-_1,...,p-_n), where n is the number of criterion.
    const fpis_dict = {};
    const fnis_dict = {};

    for(const criterion of Object.keys(normalized_alternative_rating)){
        fpis_dict[criterion] = {};
        fnis_dict[criterion] = {};
        const [min, max] = getMinMax(normalized_alternative_rating[criterion]);
        const fpis = [max,max,max];
        const fnis = [min,min,min];
        for(const [alternative,triangle] of Object.entries(normalized_alternative_rating[criterion])){
            fpis_dict[criterion][alternative] = getDistance(triangle, fpis);
            fnis_dict[criterion][alternative] = getDistance(triangle, fnis);
        }
    }

    // Step 3: THE DISTANCE OF EACH WEIGHTED ALTERNATIVE.
    //  We store the fpis and fnis distances of each alternative.
    const distance_alternatives = {};

    for(const criterion of Object.keys(normalized_alternative_rating)){
        for(const alternative of Object.keys(normalized_alternative_rating[criterion])){
            if(!distance_alternatives[alternative]) distance_alternatives[alternative] = [0,0];
            const c_fpis = distance_alternatives[alternative][0];
            const c_fnis = distance_alternatives[alternative][1];
            const fpis = fpis_dict[criterion][alternative];
            const fnis = fnis_dict[criterion][alternative];
            distance_alternatives[alternative] = [c_fpis+fpis,c_fnis+fnis];
        }
    }

    // Step 4: CLOSENESS COEFFICIENT (CC) OF EACH ALTERNATIVE.
    //  From fpis and fnis distances we compute the CC value of each alternative. A larger CC means the better alternative.
    const cc_dict = {};

    for(const [alternative,fpis_fnis] of Object.entries(distance_alternatives)){
        cc_dict[alternative] = fpis_fnis[1] / (fpis_fnis[1] + fpis_fnis[0])
    }

    return cc_dict;
    
}

import {Pipe, PipeTransform} from '@angular/core';

@Pipe({name: 'orderBy'}) //, pure: true
export class OrderBy implements PipeTransform {

  static _orderByComparator(a:any, b:any):number{
    
    if((isNaN(parseFloat(a)) || !isFinite(a)) || (isNaN(parseFloat(b)) || !isFinite(b))){
      //Isn't a number so lowercase the string to properly compare
      let a_safe:string;
      let b_safe:string;
      //console.log('a='+a);
      //console.log('b='+b);
      a_safe=""+a;
      b_safe=""+b;
      if(a_safe.toLowerCase() < b_safe.toLowerCase()) return -1;
      if(a_safe.toLowerCase() > b_safe.toLowerCase()) return 1;
    }
    else{
      //Parse strings as numbers to compare properly
      if(parseFloat(a) < parseFloat(b)) return -1;
      if(parseFloat(a) > parseFloat(b)) return 1;
    }
    
    return 0; //equal each other
  }

  transform(input:any, [config = '+']): any{
    let parsed_config:any;
    if(config=='' || config=='none'){console.log('orderby.ts: empty! (no order) config='+config);return input;}
    if(!Array.isArray(input)) return input;
    if(!Array.isArray(config) && config.indexOf(" ")!=-1){
        parsed_config=config.split(" ");
    }else{
        parsed_config=config;
    }
    if(!Array.isArray(parsed_config) || (Array.isArray(parsed_config) && parsed_config.length == 1)){
      var propertyToCheck:string = !Array.isArray(parsed_config) ? parsed_config : parsed_config[0];
      var desc = propertyToCheck.substr(0, 1) == '-';
            
       //Basic array
       if(!propertyToCheck || propertyToCheck == '-' || propertyToCheck == '+'){
         return !desc ? input.sort() : input.sort().reverse();
       }
       else {
         var property:string = propertyToCheck.substr(0, 1) == '+' || propertyToCheck.substr(0, 1) == '-'
           ? propertyToCheck.substr(1)
           : propertyToCheck;

          return input.sort(function(a:any,b:any){
            return !desc ? OrderBy._orderByComparator(a[property], b[property])
            : -OrderBy._orderByComparator(a[property], b[property]);
          });
        }
      }
      else {
        //Loop over property of the array in order and sort
        return input.sort(function(a:any,b:any){
          for(var i:number = 0; i < parsed_config.length; i++){
            var desc = parsed_config[i].substr(0, 1) == '-';
            var property = parsed_config[i].substr(0, 1) == '+' || parsed_config[i].substr(0, 1) == '-'
              ? parsed_config[i].substr(1)
              : parsed_config[i];

            var comparison = !desc
                ? OrderBy._orderByComparator(a[property], b[property])
                : -OrderBy._orderByComparator(a[property], b[property]);
                    
            //Don't return 0 yet in case of needing to sort by next property
            if(comparison != 0) return comparison;
          }

        return 0; //equal each other
      });
    }
  }
}
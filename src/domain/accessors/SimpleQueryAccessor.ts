import Accessor from "./Accessor.ts";
import RootBuilder from "../builders/RootBuilder.ts";
import SimpleQueryField from "../builders/SimpleQueryField.ts"

export default class SimpleQueryAccessor extends Accessor {

  buildQuery(builder:RootBuilder, query){
    if(query){
      let simpleQueryField = new SimpleQueryField()
      simpleQueryField.set(query);
      builder.setQuery(simpleQueryField);
    }    
  }

}

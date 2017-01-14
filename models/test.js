
/**
 * Created by sunqi on 16/11/18.
 */
var ModelModel = require('./model.js');
console.log(ModelModel)

ModelModel.findModelsByModelIdArr(['582b9674df86f0202ed969aa']).then(models => {
    console.log(models)
})
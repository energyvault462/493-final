/* Written by Brent Johnson */
/* CS 493 */
/* Original skeleton of code taken from lecture: https://gist.github.com/wolfordj/e4aa4c936311110940b62feb54108989*/
/* also modified from my HW3 assignment and code from lecture 4 https://gist.github.com/wolfordj/3080eeec83bdc3bcc916c3c8fcd3b383 */
/* Final Project */



const express = require('express');
const app = express();



const bodyParser = require('body-parser');


const Datastore = require('@google-cloud/datastore');

const projectId = 'final-493';

datastore = new Datastore({projectId:projectId});
fromDatastore = function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}

const PET = "Pet";
const KENNEL = "Kennel";

const router = express.Router();

app.use(bodyParser.json());

/* ------------- Begin Model Functions ------------- */
function post_pet(name, breed, desc){
	//console.log("post_pet");
    var key = datastore.key(PET);
	const new_pet = {"name": name, "breed": breed, "desc": desc};
	return datastore.save({"key":key, "data":new_pet}).then(() => {return key});
}

function get_pets(req){
	// pretty much borrowed from https://gist.github.com/wolfordj/3080eeec83bdc3bcc916c3c8fcd3b383
    var q = datastore.createQuery(PET).limit(5);
    const results = {};
    var prev;
    if(Object.keys(req.query).includes("cursor")){
    		//console.log("get_pets: if includes cursor");
      	//console.log(req.query);
      	prev = req.protocol + "://" + req.get("host") + req.baseUrl + "/pets?cursor=" + req.query.cursor;
      	q = q.start(req.query.cursor);
    }
	return datastore.runQuery(q).then( (entities) => {
            //console.log(entities[0]);
            results.pets = entities[0].map(fromDatastore)
            if(typeof prev !== 'undefined'){
                results.previous = prev;
            }
            if(entities[1].moreResults !== Datastore.NO_MORE_RESULTS ){
            	//console.log("get_pets: entities[1].moreResults !== Datastore.NO_MORE_RESULTS");
                results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "/pets?cursor=" + entities[1].endCursor;
            }
          	//console.log("-----------");
          	//console.log(results);
	         results.pets.forEach(function (arrayItem) {
	         	arrayItem.self = req.protocol + "://" + req.get("host") + "/pets/" + arrayItem.id;
				}); 
			return results;
		});
}


function get_one_pet(req){
	const key = datastore.key([PET, parseInt(req.params.id,10)]);
	return datastore.get(key).then( (entities) => {
			results = entities.map(fromDatastore);
			results[0].self = req.protocol + "://" + req.get("host") + "/pets/" + results[0].id;
			return results;
		});
}


function put_pet(id, name, breed, desc){
   const key = datastore.key([PET, parseInt(id,10)]);
   let updated_pet;

	updated_pet = {"name": name, "breed": breed, "desc": desc}; 
	console.log(updated_pet);
   return datastore.save({"key":key, "data":updated_pet}).then(() => {return key});
}

function delete_pet(id){
	//console.log("delete_pet: " + id)
    const key = datastore.key([PET, parseInt(id,10)]);
    return datastore.delete(key);
}


// KENNELS

function post_kennel(number, size, desc){
	//console.log("post_kennel");
    var key = datastore.key(KENNEL);
	const new_kennel = {"number": number, "size": size, "desc": desc};
	return datastore.save({"key":key, "data":new_kennel}).then(() => {return key});
}

function get_kennels(req){
	// pretty much borrowed from https://gist.github.com/wolfordj/3080eeec83bdc3bcc916c3c8fcd3b383
    var q = datastore.createQuery(KENNEL).limit(5);
    const results = {};
    var prev;
    if(Object.keys(req.query).includes("cursor")){
    		//console.log("post_kennel: if includes cursor");
      	//console.log(req.query);
      	prev = req.protocol + "://" + req.get("host") + req.baseUrl + "/kennels?cursor=" + req.query.cursor;
      	q = q.start(req.query.cursor);
    }
	return datastore.runQuery(q).then( (entities) => {
            //console.log(entities[0]);
            results.kennels = entities[0].map(fromDatastore)
            if(typeof prev !== 'undefined'){
                results.previous = prev;
            }
            if(entities[1].moreResults !== Datastore.NO_MORE_RESULTS ){
            	//console.log("get_kennels: entities[1].moreResults !== Datastore.NO_MORE_RESULTS");
                results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "/kennels?cursor=" + entities[1].endCursor;
            }
          	//console.log("-----------");
          	//console.log(results);
	         results.kennels.forEach(function (arrayItem) {
	         	arrayItem.self = req.protocol + "://" + req.get("host") + "/kennels/" + arrayItem.id;
				}); 
			return results;
		});
}


function get_one_kennel(req){
	const key = datastore.key([KENNEL, parseInt(req.params.id,10)]);
	return datastore.get(key).then( (entities) => {
			results = entities.map(fromDatastore);
			results[0].self = req.protocol + "://" + req.get("host") + "/kennels/" + results[0].id;
			return results;
		});
}


function put_kennel(id, number, size, desc){
   const key = datastore.key([KENNEL, parseInt(id,10)]);
   let updated_kennel;

	updated_kennel = {"number": number, "size": size, "desc": desc}; 
	console.log(updated_kennel);
   return datastore.save({"key":key, "data":updated_kennel}).then(() => {return key});
}

function delete_kennel(id){
	//console.log("delete_kennel: " + id)
    const key = datastore.key([KENNEL, parseInt(id,10)]);
    return datastore.delete(key);
}

/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */

//   PETS
router.get('/pets', function(req, res){
	//console.log("/pets -- GET");
    const pets = get_pets(req)
	.then( (pets) => {
        const accepts = req.accepts(['application/json']);
        if(!accepts){
            res.status(406).send('Not Acceptable');
        } else if(accepts === 'application/json'){
            res.status(200).json(pets);
        } else { res.status(500).send('Content type got messed up!'); }
    });
});

router.get('/pets/:id', function(req, res){
	    const pets = get_one_pet(req)
	.then( (pets) => {
        const accepts = req.accepts(['application/json']);
        if(!accepts){
            res.status(406).send('Not Acceptable');
        } else if(accepts === 'application/json'){
            res.status(200).json(pets);
        } else { res.status(500).send('Content type got messed up!'); }
    });
});

router.post('/pets', function(req, res){
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send('Server only accepts application/json data.')
    }
    else
    {
    	post_pet(req.body.name, req.body.breed, req.body.desc)
    	.then( key => {
        res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/pets/' + key.id);
        res.status(201).send('{ "id": ' + key.id + ' }')
    	} );
    }

});

router.delete('/pets/:id', function(req, res){
	//console.log("delete pets " + req.params.id);
	var q = datastore.createQuery(KENNEL).filter('carrier', '=', req.params.id);
	var data = [];
	//console.log (q);
		return datastore.runQuery(q).then( (entities) => {
				kennel = entities[0].map(fromDatastore)
				kennel.forEach(function (arrayItem) {
					data.id = arrayItem.id;
					data.content = arrayItem.content;
					data.delivery_date = arrayItem.delivery_date;
					data.weight = arrayItem.weight;
					put_kennel(data);

				}); 
			//return entities[0].map(fromDatastore);
			return kennel;
		})
	.then(delete_pet(req.params.id).then(res.status(204).end()));
});

router.put('/pets/:id', function(req, res){
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send('Server only accepts application/json data.')
    }
    else
    {
        res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/pets/' + req.params.id);
        put_pet(req.params.id, req.body.name, req.body.breed, req.body.desc, "")
        .then(res.status(200).end());
    }

});

router.patch('/pets/:id', function(req, res){
	    const pets = get_one_pet(req)
		.then( (pets) => {
        //Get the data from this pet
        var name = pets[0].name;
        var breed = pets[0].breed;
        var desc = pets[0].desc;

        // if it's been changed, change it.
			if(typeof req.body.name !== "undefined")
			{
			  name=req.body.name;
			} 

			if(typeof req.body.breed !== "undefined")
			{
			  breed=req.body.breed;
			} 

			if(typeof req.body.desc !== "undefined")
			{
			  desc=req.body.desc;
			} 
			res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/pets/' + req.params.id);
	      put_pet(req.params.id, name, breed, desc)
	      .then(res.status(200).end());
    });
});


//   KENNELS
router.get('/kennels', function(req, res){
	//console.log("/kennels -- GET");
    const kennels = get_kennels(req)
	.then( (kennels) => {
        const accepts = req.accepts(['application/json']);
        if(!accepts){
            res.status(406).send('Not Acceptable');
        } else if(accepts === 'application/json'){
            res.status(200).json(kennels);
        } else { res.status(500).send('Content type got messed up!'); }
    });
});

router.get('/kennels/:id', function(req, res){
	    const kennels = get_one_kennel(req)
	.then( (kennels) => {
        const accepts = req.accepts(['application/json']);
        if(!accepts){
            res.status(406).send('Not Acceptable');
        } else if(accepts === 'application/json'){
            res.status(200).json(kennels);
        } else { res.status(500).send('Content type got messed up!'); }
    });
});

router.post('/kennels', function(req, res){
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send('Server only accepts application/json data.')
    }
    else
    {
    	post_kennel(req.body.number, req.body.size, req.body.desc)
    	.then( key => {
        res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/kennels/' + key.id);
        res.status(201).send('{ "id": ' + key.id + ' }')
    	} );
    }

});


router.delete('/kennels/:id', function(req, res){
	//console.log("delete kennels " + req.params.id);
	var q = datastore.createQuery(KENNEL).filter('carrier', '=', req.params.id);
	var data = [];
	//console.log (q);
		return datastore.runQuery(q).then( (entities) => {
				kennel = entities[0].map(fromDatastore)
				kennel.forEach(function (arrayItem) {
					data.id = arrayItem.id;
					data.content = arrayItem.content;
					data.delivery_date = arrayItem.delivery_date;
					data.weight = arrayItem.weight;
					put_kennel(data);

				}); 
			//return entities[0].map(fromDatastore);
			return kennel;
		})
	.then(delete_kennel(req.params.id).then(res.status(204).end()));
});


router.put('/kennels/:id', function(req, res){
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send('Server only accepts application/json data.')
    }
    else
    {
        res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/kennels/' + req.params.id);
        put_kennel(req.params.id, req.body.number, req.body.size, req.body.desc, "")
        .then(res.status(200).end());
    }

});

router.patch('/kennels/:id', function(req, res){
		console.log(req.body.number);
	    const kennels = get_one_kennel(req)
		.then( (kennels) => {
        //Get the data from this pet
        var number = kennels[0].number;
        var size = kennels[0].size;
        var desc = kennels[0].desc;

        // if it's been changed, change it.
			if(typeof req.body.number !== "undefined")
			{
			  number=req.body.number;
			} 

			if(typeof req.body.size !== "undefined")
			{
			  size=req.body.size;
			} 

			if(typeof req.body.desc !== "undefined")
			{
			  desc=req.body.desc;
			} 
			res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/kennels/' + req.params.id);
	      put_kennel(req.params.id, number, size, desc)
	      .then(res.status(200).end());
    });
});



router.delete('/pets', function(req, res){
	res.set('Accept', "GET, POST");
   res.status(405).end();
});

router.delete('/kennels', function(req, res){
	res.set('Accept', "GET, POST");
   res.status(405).end();
});

//   USERS
router.delete('/users', function(req, res){
	res.set('Accept', "GET, POST");
   res.status(405).end();
});




/*
router.get('/pets/:id/kennel', function(req, res){
    const kennel = get_kennel_in_pet(req, req.params.id)
	.then( (kennel) => {
        res.status(200).json(kennel);
    });
});
*/

/* ------------- End Controller Functions ------------- */

app.use('/', router);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

module.exports = app
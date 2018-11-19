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

const PET = "Pets";
const KENNEL = "Kennels";
const USER = "Users";

datastore = new Datastore({projectId:projectId});
fromDatastore = function fromDatastore(item){
    item.id = item[Datastore.KEY].id;
    return item;
}



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


function get_one_pet(req, id){
	const key = datastore.key([PET, parseInt(id,10)]);
	return datastore.get(key).then( (entities) => {
			results = entities.map(fromDatastore);
			results[0].self = req.protocol + "://" + req.get("host") + "/pets/" + results[0].id;
			results[0].base = req.protocol + "://" + req.get("host") + "/pets";
			return results;
		});
}


function put_pet(id, name, breed, desc, status){
   const key = datastore.key([PET, parseInt(id,10)]);
   let updated_pet;

   if(status && status !== "")
   {
   	updated_pet = {"name": name, "breed": breed, "desc": desc, "status": status}; 
   }
   else
   {
   	updated_pet = {"name": name, "breed": breed, "desc": desc}; 
   }
	//console.log(updated_pet);
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


function get_one_kennel(req, id){
	const key = datastore.key([KENNEL, parseInt(id,10)]);
	return datastore.get(key).then( (entities) => {
			results = entities.map(fromDatastore);
			results[0].self = req.protocol + "://" + req.get("host") + "/kennels/" + results[0].id;
			results[0].base = req.protocol + "://" + req.get("host") + "/kennels";
			return results;
		});
}


function put_kennel(req, id, number, size, desc, pet_id){
   const key = datastore.key([KENNEL, parseInt(id,10)]);
   let updated_kennel;

   if(!pet_id || pet_id === "")
   {
   	console.log("put_kennel - no pet id");
   	updated_kennel = {"number": number, "size": size, "desc": desc}; 
   }
   else
   {
   	console.log("put_kennel - HAS pet id");
   	var pet_link = req.protocol + "://" + req.get("host") + "/pets/" + pet_id;
   	updated_kennel = {"number": number, "size": size, "desc": desc, "pet_id": pet_id, "pet_link": pet_link}; 	
   }
   return datastore.save({"key":key, "data":updated_kennel}).then(() => {return key});
}

function delete_kennel(id){
	//console.log("delete_kennel: " + id)
    const key = datastore.key([KENNEL, parseInt(id,10)]);
    return datastore.delete(key);
}

function set_pet_status(req, id, status){
	//console.log("set_pet_status id: " + id);
    const key = datastore.key([PET, parseInt(id,10)]);
	 const pets = get_one_pet(req, id)
	.then( (pets) => {
			put_pet(id, pets[0].name, pets[0].breed, pets[0].desc, status)
	      .then(() => {return key});
	    });
    //return datastore.delete(key);
}

function post_user(email, first, last){
	//console.log("post_pet");
   var key = datastore.key(USER);
	const new_pet = {"email": email, "first": first, "last": last};
	return datastore.save({"key":key, "data":new_pet}).then(() => {return key});
}

function get_users(req){
	// pretty much borrowed from https://gist.github.com/wolfordj/3080eeec83bdc3bcc916c3c8fcd3b383
    var q = datastore.createQuery(USER).limit(5);
    const results = {};
    var prev;
    if(Object.keys(req.query).includes("cursor")){
    		//console.log("get_pets: if includes cursor");
      	//console.log(req.query);
      	prev = req.protocol + "://" + req.get("host") + req.baseUrl + "/users?cursor=" + req.query.cursor;
      	q = q.start(req.query.cursor);
    }
	return datastore.runQuery(q).then( (entities) => {
            //console.log(entities[0]);
            results.users = entities[0].map(fromDatastore)
            if(typeof prev !== 'undefined'){
                results.previous = prev;
            }
            if(entities[1].moreResults !== Datastore.NO_MORE_RESULTS ){
            	//console.log("get_pets: entities[1].moreResults !== Datastore.NO_MORE_RESULTS");
                results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "/users?cursor=" + entities[1].endCursor;
            }
          	//console.log("-----------");
          	//console.log(results);
	         results.users.forEach(function (arrayItem) {
	         	arrayItem.self = req.protocol + "://" + req.get("host") + "/users/" + arrayItem.id;
				}); 
			return results;
		});
}

function get_one_user(req, id){
	const key = datastore.key([USER, parseInt(id,10)]);
	return datastore.get(key).then( (entities) => {
			results = entities.map(fromDatastore);
			results[0].self = req.protocol + "://" + req.get("host") + "/users/" + results[0].id;
			results[0].base = req.protocol + "://" + req.get("host") + "/users";
			return results;
		});
}

function put_user(id, email, first, last, status){
   const key = datastore.key([USER, parseInt(id,10)]);
   let updated_user;

   if(status && status !== "")
   {
   	updated_user = {"email": email, "first": first, "last": last, "status": status}; 
   }
   else
   {
   	updated_user = {"email": email, "first": first, "last": last}; 
   }
	//console.log(updated_user);
   return datastore.save({"key":key, "data":updated_user}).then(() => {return key});
}

function delete_user(id){
	//console.log("delete_user: " + id)
    const key = datastore.key([USER, parseInt(id,10)]);
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
	const pets = get_one_pet(req, req.params.id)
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
	// TODO: FIX THIS part. it's not finding anything in filter and I have no idea why
	var q = datastore.createQuery(KENNEL).filter('pet_id', '=', req.params.id);
	var data = [];
	//console.log (q);
		return datastore.runQuery(q).then( (entities) => {
				kennel = entities[0].map(fromDatastore)
				kennel.forEach(function (arrayItem) {
					data.number = arrayItem.number;
					data.size = arrayItem.size;
					data.desc = arrayItem.desc;
					//put_kennel(req, req.params.id, req.body.number, req.body.size, req.body.desc, "")
					put_kennel(req, data.number, data.size, data.desc, "");

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
	    const pets = get_one_pet(req, req.params.id)
		.then( (pets) => {
        //Get the data from this pet
        var name = pets[0].name;
        var breed = pets[0].breed;
        var desc = pets[0].desc;
        if (typeof pets[0].status  !== "undefined" && pets[0].status !== "")
        {
        		var status = pets[0].status;
        }
        else
        {
        		var status = "";
        }

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
			if(typeof req.body.status !== "undefined")
			{
			  status=req.body.status;
			} 
			res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/pets/' + req.params.id);
	      put_pet(req.params.id, name, breed, desc, status)
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
	    const kennels = get_one_kennel(req, req.params.id)
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
	    const kennels = get_one_kennel(req, req.params.id)
		.then( (kennels) => {
        //Get the data from this ship
        var petid = kennels[0].pet_id;
        console.log(kennels);

        // check if docked or not, and act acordingly

			if(!petid || petid == "")
			{
				// slip is empty, delete it.
				//console.log("slip empty -- delete it");
			  	delete_kennel(req.params.id).then(res.status(204).end())
			}
			else
			{
				//Slip has a boat, set boat to at sea.
				//console.log("slip not empty, set boat to at sea: " + current_boat);
				//set_ship_status(current_boat, "")
				//console.log("delete /kenels/id - petid: " + petid);
				delete_kennel(req.params.id)
				.then(set_pet_status(req,petid, ""))
				.then(res.status(204).end());
			}
		});

});


router.put('/kennels/:id', function(req, res){
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send('Server only accepts application/json data.')
    }
    else
    {
        res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/kennels/' + req.params.id);
        put_kennel(req, req.params.id, req.body.number, req.body.size, req.body.desc, "")
        .then(res.status(200).end());
    }

});

router.patch('/kennels/:id', function(req, res){
	    const kennels = get_one_kennel(req, req.params.id)
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
	      put_kennel(req, req.params.id, number, size, desc, "")
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

router.put('/pets/:pet_id/kennels/:kennel_id', function(req, res){
	const pets = get_one_pet(req, req.params.pet_id)
	.then ( (pets) => {
		//console.log(pets);
	   const kennels = get_one_kennel(req, req.params.kennel_id)
		.then( (kennels) => {
			if(!kennels[0].petid || kennels[0].petid === "")
			{
		      put_kennel(req, req.params.kennel_id, kennels[0].number, kennels[0].size, kennels[0].desc, req.params.pet_id)
		      .then(set_pet_status(req, req.params.pet_id, kennels[0].number))
		      .then(res.status(200).end());
			}
			else
			{
				//console.log("put /pets/:pet_id/kennels/:kennel_id  -- else for kennels[0].petid === <double quotes>")
				res.status(403).end();
			}
    	});
   });
});

router.get('/kennels/:id/pets', function(req, res){
	const kennels = get_one_kennel(req, req.params.id)
	.then( (kennels) => {
		if (kennels[0].pet_id && kennels[0].pet_id !== "")
		{
			const pets = get_one_pet(req, kennels[0].pet_id)
			.then( (pets) => {
	        	const accepts = req.accepts(['application/json']);
	        	if(!accepts){
	            	res.status(406).send('Not Acceptable');
	        	} else if(accepts === 'application/json'){
	            	res.status(200).json(pets);
	        	} else { res.status(500).send('Content type got messed up!'); }
	    });
		}
		else
		{
			res.status(406).send('No Pet in Kennel');
		}

   });
});

//   USERS

router.get('/users', function(req, res){
	console.log("/users -- GET");
    const users = get_users(req)
	.then( (users) => {
        const accepts = req.accepts(['application/json']);
        if(!accepts){
            res.status(406).send('Not Acceptable');
        } else if(accepts === 'application/json'){
            res.status(200).json(users);
        } else { res.status(500).send('Content type got messed up!'); }
    });
});

router.post('/users', function(req, res){
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send('Server only accepts application/json data.')
    }
    else
    {
    	post_user(req.body.email, req.body.first, req.body.last)
    	.then( key => {
        res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/users/' + key.id);
        res.status(201).send('{ "id": ' + key.id + ' }')
    	} );
    }

});

router.get('/users/:id', function(req, res){
	    const users = get_one_user(req, req.params.id)
	.then( (users) => {
        const accepts = req.accepts(['application/json']);
        if(!accepts){
            res.status(406).send('Not Acceptable');
        } else if(accepts === 'application/json'){
            res.status(200).json(users);
        } else { res.status(500).send('Content type got messed up!'); }
    });
});

router.put('/users/:id', function(req, res){
    if(req.get('content-type') !== 'application/json'){
        res.status(415).send('Server only accepts application/json data.')
    }
    else
    {
        res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/users/' + req.params.id);
        put_user(req.params.id, req.body.email, req.body.first, req.body.last, "")
        .then(res.status(200).end());
    }

});

router.patch('/users/:id', function(req, res){
	    const users = get_one_user(req, req.params.id)
		.then( (users) => {
        //Get the data from this users
        var email = users[0].email;
        var first = users[0].first;
        var last = users[0].last;
        if (typeof users[0].status  !== "undefined" && users[0].status !== "")
        {
        		var status = users[0].status;
        }
        else
        {
        		var status = "";
        }

        // if it's been changed, change it.
			if(typeof req.body.email !== "undefined")
			{
			  email=req.body.email;
			} 

			if(typeof req.body.first !== "undefined")
			{
			  first=req.body.first;
			} 

			if(typeof req.body.last !== "undefined")
			{
			  last=req.body.last;
			} 
			if(typeof req.body.status !== "undefined")
			{
			  status=req.body.status;
			} 
			res.location(req.protocol + "://" + req.get('host') + req.baseUrl + '/users/' + req.params.id);
	      put_user(req.params.id, email, first, last, status)
	      .then(res.status(200).end());
    });
});

router.delete('/users/:id', function(req, res){
	//console.log("delete users " + req.params.id);
	var q = datastore.createQuery(PET).filter('owner', '=', req.params.id);
	var data = [];
	//console.log (q);
		return datastore.runQuery(q).then( (entities) => {
				pet = entities[0].map(fromDatastore)
				pet.forEach(function (arrayItem) {
					data.name = arrayItem.name;
					data.breed = arrayItem.breed;
					data.desc = arrayItem.desc;
					put_pet(req, data.name, data.breed, data.desc, "");
				}); 
			//return entities[0].map(fromDatastore);
			return pet;
		})
	.then(delete_user(req.params.id).then(res.status(204).end()));
});

router.delete('/users', function(req, res){
	res.set('Accept', "GET, POST");
   res.status(405).end();
});




/* ------------- End Controller Functions ------------- */

app.use('/', router);

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token...');
    }
});

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

module.exports = app
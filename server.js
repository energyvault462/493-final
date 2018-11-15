/* Written by Brent Johnson */
/* CS 493 HW 4*/
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
function post_pet(name, breed, color){
	//console.log("post_pet");
    var key = datastore.key(PET);
	const new_pet = {"name": name, "breed": breed, "color": color};
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
   return datastore.save({"key":key, "data":updated_pet}).then(() => {return key});
}





function delete_pet(id){
	//console.log("delete_pet: " + id)
    const key = datastore.key([PET, parseInt(id,10)]);
    return datastore.delete(key);
}

/*
function post_kennel(data){
   var key = datastore.key(KENNEL);
	const new_kennel = {"weight": parseInt(data.weight,10), "content": data.content, "delivery_date": data.delivery_date, "carrier": data.carrier};
	return datastore.save({"key":key, "data":new_kennel}).then(() => {return key});
}

function get_one_kennel(req, cid){
	const key = datastore.key([KENNEL, parseInt(cid,10)]);
	return datastore.get(key).then( (entities) => {
			results = entities.map(fromDatastore);
      	if(typeof results[0].carrier !== 'undefined')
      	{
      		results[0].carrier = req.protocol + "://" + req.get("host") + "/pets/" + results[0].carrier;
      	}
			results[0].self = req.protocol + "://" + req.get("host") + "/kennel/" + results[0].id;
			return results;
		});
}

function get_kennel(req){
	// pretty much borrowed from https://gist.github.com/wolfordj/3080eeec83bdc3bcc916c3c8fcd3b383
    var q = datastore.createQuery(KENNEL).limit(3);
    const results = {};
    var prev;
    if(Object.keys(req.query).includes("cursor")){
    	//console.log("get_kennel: if includes cursor");
      //console.log(req.query);
      prev = req.protocol + "://" + req.get("host") + req.baseUrl + "/kennel?cursor=" + req.query.cursor;
      q = q.start(req.query.cursor);
    }
	return datastore.runQuery(q).then( (entities) => {
            //console.log(entities[0]);
            results.kennel = entities[0].map(fromDatastore)
            if(typeof prev !== 'undefined'){
                results.previous = prev;
            }
            if(entities[1].moreResults !== Datastore.NO_MORE_RESULTS ){
            	//console.log("get_kennel: entities[1].moreResults !== Datastore.NO_MORE_RESULTS");
              results.next = req.protocol + "://" + req.get("host") + req.baseUrl + "/kennel?cursor=" + entities[1].endCursor;
            }
          	//console.log("-----------");
          	//console.log(results);
	         results.kennel.forEach(function (arrayItem) {
	         	if(typeof arrayItem.carrier !== 'undefined')
	         	{
	         		arrayItem.carrier = req.protocol + "://" + req.get("host") + "/pets/" + arrayItem.carrier;
	         	}
	         	arrayItem.self = req.protocol + "://" + req.get("host") + "/kennel/" + arrayItem.id;
				}); 
			return results;
		});
}


function put_kennel(data){
	//console.log(data);
    const key = datastore.key([KENNEL, parseInt(data.id,10)]);
    let updated_kennel;

    updated_kennel = {"weight": parseInt(data.weight,10), "content": data.content, "delivery_date": data.delivery_date, "carrier": data.carrier};
    
    return datastore.save({"key":key, "data":updated_kennel}).then(() => {return key});
}

function delete_kennel(id){
	//console.log("delete_pet: " + id)
    const key = datastore.key([KENNEL, parseInt(id,10)]);
    return datastore.delete(key);
}

function put_kennel_in_pet(sid, cid, res){
	//console.log("sid: " + sid);
	//console.log("cid: " + cid);
    const c_key = datastore.key([KENNEL, parseInt(cid,10)]);
    return datastore.get(c_key)
    .then( (kennel) => {
        if( typeof(kennel[0].carrier) === 'undefined'){
            kennel[0].carrier = sid;
            return datastore.save({"key":c_key, "data":kennel[0]});
        }
        else
        {
        	res.status(403).end();
        }
        
    });
}


function get_kennel_in_pet(req, id){
	//console.log("get_kennel_in_pet :" + id);
	var q = datastore.createQuery(KENNEL).filter('carrier', '=', id);

	//console.log (q);
		return datastore.runQuery(q).then( (entities) => {
				kennel = entities[0].map(fromDatastore)
				kennel.forEach(function (arrayItem) {
					//console.log(arrayItem);
	         	arrayItem.self = req.protocol + "://" + req.get("host") + "/kennel/" + arrayItem.id;
	         	arrayItem.carrier = req.protocol + "://" + req.get("host") + "/pets/" + arrayItem.carrier;
				}); 
			//return entities[0].map(fromDatastore);
			return kennel;
		});

}
*/

/* ------------- End Model Functions ------------- */

/* ------------- Begin Controller Functions ------------- */
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

router.delete('/pets', function(req, res){
	res.set('Accept', "GET, POST");
   res.status(405).end();
});

router.put('/pets/:id', function(req, res){
	//console.log("put pets")
    put_pet(req.params.id, req.body.name, req.body.type, req.body.length, "")
    .then(res.status(200).end());
});

router.patch('/pets/:id', function(req, res){
	    const pets = get_one_pet(req)
		.then( (pets) => {
        //Get the data from this pet
        var name = pets[0].name;
        var length = pets[0].length;
        var type = pets[0].type;

        // if it's been changed, change it.
			if(typeof req.body.name !== "undefined")
			{
			  name=req.body.name;
			} 

			if(typeof req.body.length !== "undefined")
			{
			  length=req.body.length;
			} 

			if(typeof req.body.type !== "undefined")
			{
			  type=req.body.type;
			} 

	      put_pet(req.params.id, name, type, length)
	      .then(res.status(200).end());
    });
});

router.get('/pets/:id/kennel', function(req, res){
    const kennel = get_kennel_in_pet(req, req.params.id)
	.then( (kennel) => {
        res.status(200).json(kennel);
    });
});

router.post('/kennel', function(req, res){
    post_kennel(req.body)
    .then( key => {res.status(200).send('{ "id": ' + key.id + ' }')} );
});

router.get('/kennel', function(req, res){
	//console.log("/kennel -- GET");
    const kennel = get_kennel(req)
	.then( (kennel) => {
        //console.log(kennel);
      res.status(200).json(kennel);
    });
});


router.get('/kennel/:id', function(req, res){
	    const kennel = get_one_kennel(req, req.params.id)
		.then( (kennel) => {
        res.status(200).json(kennel);
    });
});

router.delete('/kennel/:id', function(req, res){
	    const kennel = get_one_kennel(req, req.params.id)
		.then( (kennel) => {
      	//Get the data from this pet
			delete_kennel(req.params.id).then(res.status(200).end())
		});
});

router.put('/kennel/:id', function(req, res){
	//console.log("put kennel")
	let data = {};

	data.id = req.params.id;
	data.weight = req.body.weight;
	data.content = req.body.content;
	data.delivery_date = req.body.delivery_date;


	if(req.body.hasOwnProperty('carrier')){
		data.carrier = req.body.carrier
	}

    put_kennel(data)
    .then(res.status(200).end());
});

router.patch('/kennel/:id', function(req, res){
		var data = {};
	    const kennel = get_one_kennel(req, req.params.id)
		.then( (kennel) => {
        	//Get the data from this pet
        	data.weight = kennel[0].weight;
        	data.content = kennel[0].content;
        	data.delivery_date = kennel[0].delivery_date;

			if(typeof kennel[0].carrier !== "undefined")
			{
			  data.carrier=kennel[0].carrier;
			} 

			data.id = req.params.id;


        //var slip_id = "";

        // if it's been changed, change it.
			if(typeof req.body.weight !== "undefined")
			{
			  data.weight=req.body.weight;
			} 

			if(typeof req.body.content !== "undefined")
			{
			  data.content=req.body.content;
			} 

			if(typeof req.body.delivery_date !== "undefined")
			{
			  data.delivery_date=req.body.delivery_date;
			} 

			if(typeof req.body.carrier !== "carrier")
			{
			  data.carrier=req.body.carrier;
			} 

	      put_kennel(data)
	      .then(res.status(200).end());
    });
});

router.put('/pets/:sid/kennel/:cid', function(req, res){
	const kennel = get_one_kennel(req, req.params.cid)
	.then( (kennel) => {
			if (typeof kennel[0].carrier === "undefined" || kennel[0].carrier === "cid")
			{
   			put_kennel_in_pet(req.params.sid, req.params.cid, res)
   			.then(res.status(200).end());
			}
			else
			{
				res.status(403).end();
			}
    });
});

router.delete('/pets/:sid/kennel/:cid', function(req, res){
		var data = {};
	    const kennel = get_one_kennel(req, req.params.cid)
		.then( (kennel) => {
        	//Get the data from this pet
        	data.weight = kennel[0].weight;
        	data.content = kennel[0].content;
        	data.delivery_date = kennel[0].delivery_date;

        	// keep the carrier if the kennel's carrier isn't the same as this.
			if(typeof kennel[0].carrier !== "undefined" && kennel[0].carrier !== req.params.sid)
			{
			  data.carrier=kennel[0].carrier;
			} 
			data.id = req.params.cid;

	      put_kennel(data)
	      .then(res.status(200).end());
	});
});

router.delete('/kennels', function(req, res){
	res.set('Accept', "GET, POST");
   res.status(405).end();
});

router.delete('/users', function(req, res){
	res.set('Accept', "GET, POST");
   res.status(405).end();
});

/* ------------- End Controller Functions ------------- */

app.use('/', router);

// Listen to the App Engine-specified port, or 8080 otherwise
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}...`);
});

module.exports = app
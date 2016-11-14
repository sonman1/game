var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var ObjectID = mongodb.ObjectID;

var CONTACTS_COLLECTION = "games";

var dbConnection = process.env.MONGODB_URI || 'mongodb://user:password@ds045757.mlab.com:45757/heroku_zdz94r70';

var app = express();
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.json());


// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Connect to the database before starting the application server. 
mongodb.MongoClient.connect(dbConnection, function (err, database) {
  if (err) {
    console.log(err);
    process.exit(1);
  }

  // Save database object from the callback for reuse.
  db = database;
  console.log("Database connection ready");

// Initialize the app.git stat
  var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
  });

  var socketIO = require('socket.io');
  var io = socketIO(server);


  io.on('connection', function(socket) {
    console.log('Client connected');

    socket.on('time', function (msg) {
      console.log(msg)
      socket.emit('time', msg);
    });

    socket.on('disconnect', function() { console.log('Client disconnected')}
    )});

  setInterval(function() {
    io.emit('time', "SERVER: " + new Date().toTimeString())
  }, 10000);


});





// CONTACTS API ROUTES BELOW

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/games"
 *    GET: finds all games
 *    POST: creates a new game
 */

app.get("/games", function(req, res) {
  db.collection(CONTACTS_COLLECTION).find({}).toArray(function(err, docs) {
    if (err) {
      handleError(res, err.message, "Failed to get games.");
    } else {
      res.status(200).json(docs);
    }
  });
});

app.post("/games", function(req, res) {
  var newGame = req.body;
  newGame.createDate = new Date();

  if (!(req.body.gameName)) {
    handleError(res, "Invalid user input", "Must provide a game name.", 400);
  }

  db.collection(CONTACTS_COLLECTION).insertOne(newGame, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new game.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

/*  "/games/:id"
 *    GET: find game by id
 *    PUT: update game by id
 *    DELETE: deletes game by id
 */

app.get("/games/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).findOne({ _id: new ObjectID(req.params.id) }, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to get game");
    } else {
      res.status(200).json(doc);  
    }
  });
});

app.put("/games/:id", function(req, res) {
  var updateDoc = req.body;
  delete updateDoc._id;

  db.collection(CONTACTS_COLLECTION).updateOne({_id: new ObjectID(req.params.id)}, updateDoc, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to update game");
    } else {
      res.status(204).end();
    }
  });
});

app.delete("/games/:id", function(req, res) {
  db.collection(CONTACTS_COLLECTION).deleteOne({_id: new ObjectID(req.params.id)}, function(err, result) {
    if (err) {
      handleError(res, err.message, "Failed to delete game");
    } else {
      res.status(204).end();
    }
  });
});




///////////////////////////////////////////////
// WEBSOCKETS SECTION TO BE BROKEN OUT INTO ITS OWN FILE
///////////////////////////////////////////////

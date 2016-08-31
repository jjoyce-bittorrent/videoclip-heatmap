var express = require('express');
var router = express.Router();

var express = require('express');
var router = express.Router();
var pg = require('pg');
//var connectionString = require(path.join(__dirname, '../', '../', 'config'));
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/palooza';

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// jjoyce added
router.post('/api/v1/todos', function(req, res) {
    var results = [];

    // Grab data from http request
    var data = {text: req.body.text, complete: false};

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO items(text, complete) values($1, $2)", [data.text, data.complete]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM items ORDER BY id ASC");

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });


    });
});

// hash = 2a27386e64d5a0bc42966a490b0126aff248b7feeff34446eac6bba8177a3694
// file = Odyssey Pt. 1.mp3
// likes integer[101]

router.post('/api/v1/addclip', function(req, res) {
    var results = [];

    // Grab data from http request
    var data = {hash: req.body.hash, file: req.body.file, start: req.body.start, duration: req.body.duration};

    var likes = new Array(101).fill(0);;

    for (var i=data.start; i<Number(data.start) + Number(data.duration); i++) {
      likes[i]=1;
    }

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // see if there is an existing item
        var query = client.query("SELECT * FROM clips WHERE hash=($1) AND file=($2) ORDER BY hash ASC", [data.hash, data.file]);
        query.on('row', function(row) {
            //update the likes array
            for (var i=0; i<101; i++) {
              likes[i] += row.likes[i];
            }
            client.query("UPDATE clips SET likes=($1) WHERE hash=($2) AND file=($3)", [likes, row.hash, row.file]);
            results.push({hash: row.hash, file: row.file, likes: likes});
        });

        // After all data is returned, check to see if we need to insert
        query.on('end', function() {
            if (results.length == 0) {
              client.query("INSERT INTO clips(hash, file, likes) values($1, $2, $3)", [data.hash, data.file, likes]);
              results.push({hash: data.hash, file: data.file, likes: likes});
            }
            done();
            return res.json(results);
        });

    });
});

// read
// e.g. http://localhost:3000/api/v1/clips?id=1234567890
router.get('/api/v1/clips', function(req, res) {

    var results = [];

    var hash = req.query.hash || null;

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM clips ORDER BY hash ASC");
        if (hash) {
          var query = client.query("SELECT * FROM clips WHERE hash=($1) ORDER BY hash ASC", [hash]);
        }

        // Stream results back one row at a time
        query.on('row', function(row) {
            results.push(row);
        });

        // After all data is returned, close connection and return results
        query.on('end', function() {
            done();
            return res.json(results);
        });

    });

});

// // update - not ported
// router.put('/api/v1/todos/:todo_id', function(req, res) {
//
//     var results = [];
//
//     // Grab data from the URL parameters
//     var id = req.params.todo_id;
//
//     // Grab data from http request
//     var data = {text: req.body.text, complete: req.body.complete};
//
//     // Get a Postgres client from the connection pool
//     pg.connect(connectionString, function(err, client, done) {
//         // Handle connection errors
//         if(err) {
//           done();
//           console.log(err);
//           return res.status(500).send(json({ success: false, data: err}));
//         }
//
//         // SQL Query > Update Data
//         client.query("UPDATE items SET text=($1), complete=($2) WHERE id=($3)", [data.text, data.complete, id]);
//
//         // SQL Query > Select Data
//         var query = client.query("SELECT * FROM items ORDER BY id ASC");
//
//         // Stream results back one row at a time
//         query.on('row', function(row) {
//             results.push(row);
//         });
//
//         // After all data is returned, close connection and return results
//         query.on('end', function() {
//             done();
//             return res.json(results);
//         });
//     });
//
// });
//
// // delete - not ported
// router.delete('/api/v1/todos/:todo_id', function(req, res) {
//
//     var results = [];
//
//     // Grab data from the URL parameters
//     var id = req.params.todo_id;
//
//
//     // Get a Postgres client from the connection pool
//     pg.connect(connectionString, function(err, client, done) {
//         // Handle connection errors
//         if(err) {
//           done();
//           console.log(err);
//           return res.status(500).json({ success: false, data: err});
//         }
//
//         // SQL Query > Delete Data
//         client.query("DELETE FROM items WHERE id=($1)", [id]);
//
//         // SQL Query > Select Data
//         var query = client.query("SELECT * FROM items ORDER BY id ASC");
//
//         // Stream results back one row at a time
//         query.on('row', function(row) {
//             results.push(row);
//         });
//
//         // After all data is returned, close connection and return results
//         query.on('end', function() {
//             done();
//             return res.json(results);
//         });
//     });
//
// });

module.exports = router;

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
// offset_time_start
// offset_time_end

router.post('/api/v1/addclip', function(req, res) {
    var results = [];

    // Grab data from http request
    var data = {hash: req.body.hash, file: req.body.file, offset_time_start: req.body.offset_time_start, offset_time_end: req.body.offset_time_end};

    // Get a Postgres client from the connection pool
    pg.connect(connectionString, function(err, client, done) {
        // Handle connection errors
        if(err) {
          done();
          console.log(err);
          return res.status(500).json({ success: false, data: err});
        }

        // SQL Query > Insert Data
        client.query("INSERT INTO clips(hash, file, offset_time_start, offset_time_end) values($1, $2, $3, $4)", [data.hash, data.file, data.offset_time_start, data.offset_time_end]);

        // SQL Query > Select Data
        var query = client.query("SELECT * FROM clips ORDER BY hash ASC");

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

// read
router.get('/api/v1/clips', function(req, res) {

    var results = [];

    var id = req.query.id || null;

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
        if (id) {
          var query = client.query("SELECT * FROM clips WHERE hash=($1) ORDER BY hash ASC", [id]);
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

var fs = require('fs')
var path = require('path')
var express = require('express')
var sqlite3 = require('sqlite3')
var bodyParser = require('body-parser');
var port = 8000;

var db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3');

var db = new sqlite3.Database(db_filename, sqlite3, (err) => {
    if (err) {
        console.log('Error opening ' + db_filename);
    }
    else {
        console.log('Now connected to ' + db_filename);

    }
});



var app = express();
app.use(bodyParser.urlencoded({extended: true}));

app.get('/codes', (req, res) => {
    var codes = {};

    db.all("SELECT Codes.code AS Code, Codes.incident_type AS incident_type FROM Codes", (err,rows) =>{
    
           
        for (var i = 0; i < rows.length; i++)
        {
    
            var code = rows[i].Code;
            var incident = rows[i].incident_type;
            codes["C" + code] = incident;
        }
         
        res.type('json').send(codes);
    });
    
   

});



app.get('/neighborhoods', (req, res) => {
    var neighborhoods = {};

    db.all("SELECT Neighborhoods.neighborhood_number AS number, Neighborhoods.neighborhood_name AS name FROM Neighborhoods", (err,rows) =>{
    
           
        for (var i = 0; i < rows.length; i++)
        {
    
            var number = rows[i].number;
            var name = rows[i].name;
            neighborhoods["N" + number] = name;
        }
         
        res.type('json').send(neighborhoods);
    });
    
   

});


app.get('/incidents', (req, res) => {
    
    var incidents = {};
    
    db.all(`SELECT Incidents.case_number AS number, 
    Incidents.date_time AS date,
    Incidents.code AS code,
    Incidents.incident AS incident, 
    Incidents.police_grid AS grid,
    Incidents.neighborhood_number AS neighborhood,
    Incidents.block AS block
    FROM Incidents`, (err,rows) =>{
       
        for (var i = 0; i < rows.length; i++)
        {
            
            var date = rows[i].date.substring(0, rows[i].date.indexOf('T'));
            var time = rows[i].date.substring(rows[i].date.indexOf('T'));
            var code = rows[i].code;
            var incident = rows[i].incident;
            var police_grid = rows[i].grid;
            var neighborhood_number = rows[i].neighborhood;
            var block = rows[i].block;
            incidents["I" + rows[i].number] = {"date" : date, "time" : time, "code" : code, 
            "incident" : incident, "police_grid" : police_grid, "neighborhood_number" : neighborhood_number,
            "block" : block};
        }
         
        res.type('json').send(incidents);

    });
});

app.put('/new-incident', (req, res) => {
    var new_incident = {
        'case_number': req.body.case_number,
        'date': req.body.date,
        'time': req.body.time,
        'code': req.body.code,
        'incident': req.body.incident,
        'police_grid': req.body.police_grid,
        'neighborhood_number': req.body.neighborhood_number,
        'block': req.body.block
    };
    console.log(req.body);
    let has_num = false;
    db.all(`SELECT Incidents.case_number FROM Incidents`,  (err,rows) =>{
        for (var i = 0; i < rows.length; i++)
        {
            if (req.body.case_number == rows[i].case_number)
            {
                has_num = true;
            }
        }
        
        if (has_num) {
            res.status(500).send('Error: incident already exists');
        }

        db.run(`INSERT INTO Incidents VALUES(?, ?, ?, ?, ?, ?, ?)`,
        [new_incident['case_number'], 
        new_incident['date']+new_incident['time']+"T",
        new_incident['code'], 
        new_incident['incident'], 
        new_incident['police_grid'],
        new_incident['neighborhood_number'],
        new_incident['block']]);

        
    });

    

});


console.log('Now listening on port ' + port);
app.listen(port);
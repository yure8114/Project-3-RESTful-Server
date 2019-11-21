var fs = require('fs')
var path = require('path')
var express = require('express')
var sqlite3 = require('sqlite3')
var bodyParser = require('body-parser');

var xml = require('xml-js');
var js2xmlparser = require("js2xmlparser");

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
    

    if (req.query.format != null)
    {
        var format = req.query.format;
    }
    else {
        var format = 'json';
    }
    if (req.query.code != null)
    {
        var jQ = req.query.code;
        var ArrayjQ = jQ.split(',');
        var first = parseInt(ArrayjQ[0]);
        var second = parseInt(ArrayjQ[1]);

    }
    else {
        var first = 0;
        var second = 10000;   
     }



    db.all("SELECT Codes.code AS Code, Codes.incident_type AS incident_type FROM Codes WHERE Code BETWEEN ? AND ?", [first, second], (err,rows) =>{
    
        console.log(rows.length);       
        for (var i = 0; i < rows.length; i++)
        {
    
            var code = rows[i].Code;
            var incident = rows[i].incident_type;
            codes["C" + code] = incident;
        }
        
        if (format == 'xml')
        {
            xmlRes = js2xmlparser.parse("Codes", codes);
            res.type('xml').send(xmlRes);
        }
        else{
            res.type('json').send(codes);
        }
        
    });
    
   

});



app.get('/neighborhoods', (req, res) => {
    var neighborhoods = {};

    if (req.query.format != null)
    {
        var format = req.query.format;
    }
    else {
        var format = 'json';
    }
    if (req.query.id != null)
    {
        var jQ = req.query.id;
        var ArrayjQ = jQ.split(',');
        var first = parseInt(ArrayjQ[0]);
        var second = parseInt(ArrayjQ[1]);

    }
    else {
        var first = 0;
        var second = 10000;   
     }

    db.all(`SELECT Neighborhoods.neighborhood_number AS number, Neighborhoods.neighborhood_name AS name FROM Neighborhoods
     WHERE number BETWEEN ? AND ?`,[first, second], (err,rows) =>{
    
           
        for (var i = 0; i < rows.length; i++)
        {
    
            var number = rows[i].number;
            var name = rows[i].name;
            neighborhoods["N" + number] = name;
        }
         
        if (format == 'xml')
        {
            xmlRes = js2xmlparser.parse("IDs", neighborhoods);
            res.type('xml').send(xmlRes);
        }
        else{
            res.type('json').send(neighborhoods);
        }
    });
    
   

});


app.get('/incidents', (req, res) => {
    let incidents = {};
	if(req.url.includes('/incidents?start_date='))
	{
		var start_date = req.url.substring(req.url.indexOf('?start_date=') + 12);
		db.all(`SELECT *
				FROM Incidents
				WHERE Incidents.date_time >= ?
				ORDER BY Incidents.date_time ASC`,[start_date], (err, rows) => {
					for (var i = 0; i < rows.length; i++)
					{
						var date = rows[i].date_time.substring(0, rows[i].date_time.indexOf('T'));
						var time = rows[i].date_time.substring(rows[i].date_time.indexOf('T'));
						var code = rows[i].code;
						var incident = rows[i].incident;
						var police_grid = rows[i].police_grid;
						var neighborhood_number = rows[i].neighborhood_number;
						var block = rows[i].block;
						incidents["I" + rows[i].case_number] = {"date" : date, "time" : time, "code" : code, 
						"incident" : incident, "police_grid" : police_grid, "neighborhood_number" : neighborhood_number,
						"block" : block};
					}
					res.type('json').send(incidents);
				});
	}
	
	else if(req.url.includes('/incidents?end_date='))
	{
		var end_date = req.url.substring(req.url.indexOf('?end_date=') + 10);
		db.all(`SELECT *
				FROM Incidents
				WHERE Incidents.date_time <= ?
				ORDER BY Incidents.date_time ASC`,[end_date], (err, rows) => {
					for (var i = 0; i < rows.length; i++)
					{
						var date = rows[i].date_time.substring(0, rows[i].date_time.indexOf('T'));
						var time = rows[i].date_time.substring(rows[i].date_time.indexOf('T'));
						var code = rows[i].code;
						var incident = rows[i].incident;
						var police_grid = rows[i].police_grid;
						var neighborhood_number = rows[i].neighborhood_number;
						var block = rows[i].block;
						incidents["I" + rows[i].case_number] = {"date" : date, "time" : time, "code" : code, 
						"incident" : incident, "police_grid" : police_grid, "neighborhood_number" : neighborhood_number,
						"block" : block};
					}
					res.type('json').send(incidents);
				});
	}
	
	else if(req.url.includes('/incidents?code='))
	{
		var codes = req.url.substring(req.url.indexOf('?code=') + 6);
		var query = `SELECT *
				FROM Incidents
				WHERE Incidents.code IN (` + codes + `)
				ORDER BY Incidents.date_time DESC
				LIMIT 10000`;

		db.all(query, (err, rows) => {
					for (var i = 0; i < rows.length; i++)
					{
						var date = rows[i].date_time.substring(0, rows[i].date_time.indexOf('T'));
						var time = rows[i].date_time.substring(rows[i].date_time.indexOf('T'));
						var code = rows[i].code;
						var incident = rows[i].incident;
						var police_grid = rows[i].police_grid;
						var neighborhood_number = rows[i].neighborhood_number;
						var block = rows[i].block;
						incidents["I" + rows[i].case_number] = {"date" : date, "time" : time, "code" : code, 
						"incident" : incident, "police_grid" : police_grid, "neighborhood_number" : neighborhood_number,
						"block" : block};
					}
					res.type('json').send(incidents);
				});
		
	}
	
	else if(req.url.includes('/incidents?grid='))
	{
		var grids = req.url.substring(req.url.indexOf('?grid=') + 6);
		var query = `SELECT *
				FROM Incidents
				WHERE Incidents.police_grid IN (` + grids + `)
				ORDER BY Incidents.date_time DESC
				LIMIT 10000`;

		db.all(query, (err, rows) => {
					for (var i = 0; i < rows.length; i++)
					{
						var date = rows[i].date_time.substring(0, rows[i].date_time.indexOf('T'));
						var time = rows[i].date_time.substring(rows[i].date_time.indexOf('T'));
						var code = rows[i].code;
						var incident = rows[i].incident;
						var police_grid = rows[i].police_grid;
						var neighborhood_number = rows[i].neighborhood_number;
						var block = rows[i].block;
						incidents["I" + rows[i].case_number] = {"date" : date, "time" : time, "code" : code, 
						"incident" : incident, "police_grid" : police_grid, "neighborhood_number" : neighborhood_number,
						"block" : block};
					}
					res.type('json').send(incidents);
				});
		
	}
	
	else if(req.url.includes('/incidents?id='))
	{
		var neighborhoods = req.url.substring(req.url.indexOf('?id=') + 4);
		var query = `SELECT *
				FROM Incidents
				WHERE Incidents.neighborhood_number IN (` + neighborhoods + `)
				ORDER BY Incidents.date_time DESC
				LIMIT 10000`;

		db.all(query, (err, rows) => {
					for (var i = 0; i < rows.length; i++)
					{
						var date = rows[i].date_time.substring(0, rows[i].date_time.indexOf('T'));
						var time = rows[i].date_time.substring(rows[i].date_time.indexOf('T'));
						var code = rows[i].code;
						var incident = rows[i].incident;
						var police_grid = rows[i].police_grid;
						var neighborhood_number = rows[i].neighborhood_number;
						var block = rows[i].block;
						incidents["I" + rows[i].case_number] = {"date" : date, "time" : time, "code" : code, 
						"incident" : incident, "police_grid" : police_grid, "neighborhood_number" : neighborhood_number,
						"block" : block};
					}
					res.type('json').send(incidents);
				});
		
	}
	
	else if(req.url.includes('/incidents?limit='))
	{
		var limit = req.url.substring(req.url.indexOf('?limit=') + 7);
		if(limit.length == 0) limit = "10000";
		var query = `SELECT *
				FROM Incidents
				ORDER BY Incidents.date_time DESC
				LIMIT ` + limit;

		db.all(query, (err, rows) => {
					for (var i = 0; i < rows.length; i++)
					{
						var date = rows[i].date_time.substring(0, rows[i].date_time.indexOf('T'));
						var time = rows[i].date_time.substring(rows[i].date_time.indexOf('T'));
						var code = rows[i].code;
						var incident = rows[i].incident;
						var police_grid = rows[i].police_grid;
						var neighborhood_number = rows[i].neighborhood_number;
						var block = rows[i].block;
						incidents["I" + rows[i].case_number] = {"date" : date, "time" : time, "code" : code, 
						"incident" : incident, "police_grid" : police_grid, "neighborhood_number" : neighborhood_number,
						"block" : block};
					}
					res.type('json').send(incidents);
				});
		
	}
	
	else if(req.url.includes('/incidents?format='))
	{
		let format = req.url.substring(req.url.indexOf('?format=') + 8);
		var query = `SELECT *
				FROM Incidents
				ORDER BY Incidents.date_time DESC
				LIMIT 10000`;

		db.all(query, (err, rows) => {
					for (var i = 0; i < rows.length; i++)
					{
						var date = rows[i].date_time.substring(0, rows[i].date_time.indexOf('T'));
						var time = rows[i].date_time.substring(rows[i].date_time.indexOf('T'));
						var code = rows[i].code;
						var incident = rows[i].incident;
						var police_grid = rows[i].police_grid;
						var neighborhood_number = rows[i].neighborhood_number;
						var block = rows[i].block;
						incidents["I" + rows[i].case_number] = {"date" : date, "time" : time, "code" : code, 
						"incident" : incident, "police_grid" : police_grid, "neighborhood_number" : neighborhood_number,
						"block" : block};
					}
					if(format == 'xml')
					{
						xmlQuery = `<textarea style="border:none; width:100%; height:100%">` + 
						xml.json2xml(incidents, {compact: true, spaces: 4}) + `
						</textarea>`;
						res.writeHead(200, { 'Content-Type': 'text/html' });
						res.write(xmlQuery);
					}
					else
					{
						res.type('json').send(incidents);
					}
					
				});
		
	}
	
    else{
		db.all(`SELECT Incidents.case_number AS number, 
		Incidents.date_time AS date,
		Incidents.code AS code,
		Incidents.incident AS incident, 
		Incidents.police_grid AS grid,
		Incidents.neighborhood_number AS neighborhood,
		Incidents.block AS block
		FROM Incidents
		LIMIT 10000`, (err,rows) =>{
		   
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
	}
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
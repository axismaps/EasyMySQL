var http = require('http');
post = 18020;
host = 'eddore.cs.st-andrews.ac.uk';
//host = 'localhost';
//var express = require('express');
var database;
var express = require('express')
    , passport = require('passport')
    , LocalStrategy = require('passport-local').Strategy
    , path = require('path');
var Sync = require('sync');
var async = require('async');
var mysql      = require('mysql');
var db;
var databaseName;
var tables = new Array();
var oldtable = new Array();

var columnName = new Array();
var oldcolumnName = new Array();
var oldeasy_tableName = new Array();
var oldColunms = new Array();
var easy_tableName = new Array();
var modifiable = new Array();
var newcolunm = new Array();


var defaultvalue = new Array();
var nullable = new Array();


var undoArray = new Array();
var Imagepath;
var connectionState = 1;

var iffirttime;//0 first time; 1 not first time

//<database connection>
function db(req, res){

    db = mysql.createConnection({
        host     :  req.params.url,
        user     :  req.params.username,
        password :  req.params.pw,
        database :  req.params.dbname

    });
    databaseName = req.params.dbname



    getOldTables();
    creatEazyTables();
    getOldColumns()
    getEasyColumnRecord();



}
//get all tables' name in the easymysql_tables
function getOldTables() {
    oldtable = new Array();
    db.query(
        'SELECT name FROM easymysql_tables ',
        function selectCb(err, results, fields) {
            if(results == undefined){
                connectionState = 1;
            }
            else{
                connectionState = 0;
                for(var j = 0; j <results.length; j++ ){
                    oldtable[j] = results[j].name;
                }
            }


        }
    );
}
//get all tables'name in the database
function creatEazyTables(){
    tables = new Array();
    db.query(
        'select TABLE_NAME from information_schema.tables where TABLE_SCHEMA = "'+databaseName+'" ',
        //'select * from axis ',
        function selectCb(err, results, fields) {
            if(results == undefined){
                connectionState = 1;
            }
            else{
                connectionState = 0;
                var k = 0
                for(var j = 0; j <results.length; j++ ){
                    if(results[j].TABLE_NAME.indexOf("easymysql")<0){
                        tables[k] = results[j].TABLE_NAME;
                        k++;
                    }
                }
                console.log("tables.length"+tables.length);
            }
        }
    );
}
//get all tables' columns' name in the database
function getEasyColumnRecord() {
    columnName = new Array();
    easy_tableName = new Array();
    modifiable = new Array();
    newcolunm = new Array();
    defaultvalue = new Array();
    nullable = new Array();
    db.query(
        'select COLUMN_NAME, TABLE_NAME, DATA_TYPE, COLUMN_DEFAULT, IS_NULLABLE from information_schema.COLUMNS where TABLE_SCHEMA = "'+databaseName+'" ',

        function selectCb(err, results, fields) {
            if(results == undefined){
                connectionState = 1;
            }
            else{
                connectionState = 0;
                var k = 0
                for(var j = 0; j <results.length; j++ ){
                    if(results[j].TABLE_NAME.indexOf("easymysql")<0){
                        columnName[k] = results[j].COLUMN_NAME;
                        easy_tableName[k] = results[j].TABLE_NAME;
                        modifiable[k] = results[j].DATA_TYPE;
                        defaultvalue[k] = results[j].COLUMN_DEFAULT;
                        if(results[j].IS_NULLABLE =="YES")
                            nullable[k] = "NULL";
                        else nullable[k] = "required";
                        k++;
                        newcolunm[k] = results[j].COLUMN_NAME+":"+results[j].TABLE_NAME;
                    }
                }
            }
        });
}
//get all tables' columns' name in the easymysql_colunm
function getOldColumns() {
    oldcolumnName = new Array();
    oldeasy_tableName = new Array();
    oldColunms = new Array();
    db.query(
        'SELECT ColunmName, tableName FROM easymysql_colunm ',
        function selectCb(err, results, fields) {
            if(results == undefined){
                connectionState = 1;
            }
            else{
                connectionState = 0;
                for(var j = 0; j <results.length; j++ ){
                    oldcolumnName[j] = results[j].ColunmName;
                    var a = oldcolumnName[j];
                    oldeasy_tableName[j] = results[j].tableName;
                    var b = oldeasy_tableName[j]
                    oldColunms[j] = a+":"+b;
                }
            }
        }
    );
}

//configure four setting tables for this project
function configermysql(req, res) {
    db.query(
        'select TABLE_NAME from information_schema.tables where TABLE_SCHEMA = "'+databaseName+'" and TABLE_NAME = "easymysql_tables"',
        function selectCb(err, results, fields) {
            var tem = "TABLE_NAME"
            console.log(results.length);
            if(results.length == 0){
                iffirttime = 0;
            }
            else{
                iffirttime = 1;
            }

            console.log("firstlink"+iffirttime);
            if(iffirttime == 0){
                //create
                async.series([
                    function(callback){
                        // do some stuff ...
                        db.query(
                            'CREATE TABLE easymysql_tables'+
                                '(id INT(11) NOT NULL AUTO_INCREMENT, '+
                                'name VARCHAR(255) DEFAULT NULL, '+
                                'addrow int(4) DEFAULT NULL, '+
                                'project varchar(50) DEFAULT NULL, '+
                                'PRIMARY KEY (id))',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'one');
                    },
                    function(callback){
                        // do some stuff ...

                        db.query(
                            'CREATE TABLE easymysql_colunm'+
                                '(CID INT(11) NOT NULL AUTO_INCREMENT, '+
                                'ColunmName VARCHAR(255) DEFAULT NULL, '+
                                'tableName VARCHAR(255) DEFAULT NULL, '+
                                'modifiability  INT(11) DEFAULT NULL, '+
                                'motifiable VARCHAR(255) DEFAULT NULL, '+
                                'verification VARCHAR(255) DEFAULT NULL, '+
                                'defaultVa VARCHAR(255) DEFAULT NULL, '+
                                'tag_reference INT(11) DEFAULT NULL, '+
                                'reference_table VARCHAR(255) DEFAULT NULL, '+
                                'image_f INT(11) DEFAULT NULL, '+
                                'referent_col VARCHAR(255) DEFAULT NULL, '+
                                'PRIMARY KEY (CID))',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }


                        );
                        callback(null, 'two');
                    },
                    function(callback){
                        // do some more stuff .
                        for(var j = 0;  j<tables.length; j++ ){
                            ( function (j) {
                                if(oldtable.indexOf(tables[j])<0){
                                    var cmd = 'INSERT INTO easymysql_tables (name,project,addrow) VALUES("'+tables[j]+'","'+req.params.projectName+'",1) ';

                                    db.query(cmd, function(err, rows, fields){
                                            if (err) {
                                                throw err;
                                            }
                                        }
                                    );
                                }

                            })(j);

                        }
                        callback(null, 'three');
                    },
                    function(callback){
                        // do some more stuff .
                        for(var j = 0;  j<columnName.length; j++ ){
                            ( function (j) {
                                if(oldColunms.indexOf(columnName[j]+":"+easy_tableName[j])<0){
                                    console.log("UpdateColumnsUpdateColumnsUpdateColumnsUpdateColumnsUpdateColumnsUpdateColu")
                                    if(nullable[j]=="NULL"){
                                        if(defaultvalue[j]=="null"||defaultvalue[j]==null) {
                                            var cmd = 'INSERT INTO easymysql_colunm (ColunmName,tableName,modifiability,motifiable,defaultVa,verification,tag_reference,image_f) VALUES("'+columnName[j]+'","'+easy_tableName[j]+'",1,"'+modifiable[j]+'",NULL,NULL,0,0)  '
                                        }
                                        else{
                                            var cmd = 'INSERT INTO easymysql_colunm (ColunmName,tableName,modifiability,motifiable,defaultVa,verification,tag_reference,image_f) VALUES("'+columnName[j]+'","'+easy_tableName[j]+'",1,"'+modifiable[j]+'","'+defaultvalue[j]+'",NULL, 0,0)  ';
                                        }
                                    }
                                    else {
                                        if(defaultvalue[j]=="null"||defaultvalue[j]==null) {
                                            var cmd = 'INSERT INTO easymysql_colunm (ColunmName,tableName,modifiability,motifiable,defaultVa,verification,tag_reference,image_f) VALUES("'+columnName[j]+'","'+easy_tableName[j]+'",1,"'+modifiable[j]+'",NULL,"'+nullable[j]+'", 0,0)  ';//nullable
                                        }
                                        else{
                                            var cmd = 'INSERT INTO easymysql_colunm (ColunmName,tableName,modifiability,motifiable,defaultVa,verification,tag_reference,image_f) VALUES("'+columnName[j]+'","'+easy_tableName[j]+'",1,"'+modifiable[j]+'","'+defaultvalue[j]+'","'+nullable[j]+'", 0,0)  ';//nullable
                                        }
                                    }

                                    console.log(cmd);
                                    db.query(cmd, function(err, rows, fields){
                                            if (err) {
                                                throw err;
                                            }
                                        }
                                    );
                                }
                            })(j);
                        }
                        callback(null, 'four');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'CREATE TABLE easymysql_modifiable'+
                                '(id INT(11) NOT NULL AUTO_INCREMENT, '+
                                'name VARCHAR(255) DEFAULT NULL, '+

                                'PRIMARY KEY (id))',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'five');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'CREATE TABLE easymysql_varification'+
                                '(id INT(11) NOT NULL AUTO_INCREMENT, '+
                                'name VARCHAR(255) DEFAULT NULL, '+

                                'PRIMARY KEY (id))',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'six');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'INSERT INTO easymysql_varification VALUES (1, "required") ',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'seven');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'INSERT INTO easymysql_varification VALUES (3, "URL") ',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'eight');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'INSERT INTO easymysql_modifiable VALUES (1, "int") ',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'nigh');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'INSERT INTO easymysql_modifiable VALUES (2, "varchar") ',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'ten');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'INSERT INTO easymysql_modifiable VALUES (3, "date") ',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'eleven');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'INSERT INTO easymysql_modifiable VALUES (4, "float") ',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'twelve');
                    },
                    function(callback){
                        // do some more stuff .
                        db.query(
                            'INSERT INTO easymysql_modifiable VALUES (5, "longtext") ',function(err, rows, fields){
                                if (err) {
                                    throw err;
                                }

                            }
                        );
                        callback(null, 'thirteen');
                    }
                ],

                    // optional callback
                    function(err, results){
                        // results is now equal to ['one', 'two']
                        console.log(results)
                    });



            }else {
                var proname = req.params.projectName;

                async.series([
                    function(callback){
                        // do some stuff ...
                        for(var j = 0;  j<oldtable.length; j++ ){
                            ( function (j) {
                                if(tables.indexOf(oldtable[j])<0){
                                    var cmd = 'DELETE FROM easymysql_tables WHERE name = "'+oldtable[j]+'" ';

                                    db.query(cmd, function(err, rows, fields){
                                            if (err) {
                                                throw err;
                                            }
                                        }
                                    );
                                }

                            })(j);

                        }
                        callback(null, 'one');
                    },
                    function(callback){
                        // do some more stuff .
                        for(var j = 0;  j<tables.length; j++ ){
                            ( function (j) {
                                if(oldtable.indexOf(tables[j])<0){
                                    var cmd = 'INSERT INTO easymysql_tables (name,project,addrow) VALUES("'+tables[j]+'","'+req.params.projectName+'",1) ';

                                    db.query(cmd, function(err, rows, fields){
                                            if (err) {
                                                throw err;
                                            }
                                        }
                                    );
                                }

                            })(j);

                        }
                        callback(null, 'two');
                    },
                    function(callback){
                        // do some more stuff .
                        for(var j = 0;  j<columnName.length; j++ ){
                            ( function (j) {
                                if(oldColunms.indexOf(columnName[j]+":"+easy_tableName[j])<0){
                                    console.log("UpdateColumnsUpdateColumnsUpdateColumnsUpdateColumnsUpdateColumnsUpdateColu")
                                    if(nullable[j]=="NULL"){
                                        if(defaultvalue[j]=="null"||defaultvalue[j]==null) {
                                            var cmd = 'INSERT INTO easymysql_colunm (ColunmName,tableName,modifiability,motifiable,defaultVa,verification,tag_reference,image_f) VALUES("'+columnName[j]+'","'+easy_tableName[j]+'",1,"'+modifiable[j]+'",NULL,NULL,0,0)  '
                                        }
                                        else{
                                            var cmd = 'INSERT INTO easymysql_colunm (ColunmName,tableName,modifiability,motifiable,defaultVa,verification,tag_reference,image_f) VALUES("'+columnName[j]+'","'+easy_tableName[j]+'",1,"'+modifiable[j]+'","'+defaultvalue[j]+'",NULL, 0,0)  ';
                                        }
                                    }
                                    else {
                                        if(defaultvalue[j]=="null"||defaultvalue[j]==null) {
                                            var cmd = 'INSERT INTO easymysql_colunm (ColunmName,tableName,modifiability,motifiable,defaultVa,verification,tag_reference,image_f) VALUES("'+columnName[j]+'","'+easy_tableName[j]+'",1,"'+modifiable[j]+'",NULL,"'+nullable[j]+'", 0,0)  ';//nullable
                                        }
                                        else{
                                            var cmd = 'INSERT INTO easymysql_colunm (ColunmName,tableName,modifiability,motifiable,defaultVa,verification,tag_reference,image_f) VALUES("'+columnName[j]+'","'+easy_tableName[j]+'",1,"'+modifiable[j]+'","'+defaultvalue[j]+'","'+nullable[j]+'", 0,0)  ';//nullable
                                        }
                                    }

                                    console.log(cmd);
                                    db.query(cmd, function(err, rows, fields){
                                            if (err) {
                                                throw err;
                                            }
                                        }
                                    );
                                }
                            })(j);
                        }
                        callback(null, 'three');
                    },
                    function(callback){
                        // do some more stuff .
                        for(var j = 0;  j<oldColunms.length; j++ ){
                            ( function (j) {
                                if(newcolunm.indexOf(oldColunms[j])<0){

                                    var cmd = 'DELETE FROM easymysql_colunm  WHERE tableName = "'+oldeasy_tableName[j]+'" AND ColunmName = "'+oldcolumnName[j]+'" ';

                                    db.query(cmd, function(err, rows, fields){
                                            if (err) {
                                                throw err;
                                            }
                                        }
                                    );
                                }
                            })(j);
                        }
                        callback(null, 'four');
                    }
                ],
                    // optional callback
                    function(err, results){
                        // results is now equal to ['one', 'two']
                        console.log(results)
                    });
            }

        }

    );

}
//create project

function writeToJson(req, res) {
    var fs = require('fs');
    var file = __dirname +'/content/users.json';
    var myprojectjson;

    fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
            console.log('Error: ' + err);
            return;
        }

        data = JSON.parse(data);
        myprojectjson = data;

        console.log("data"+data[0].project);
        var myjson =  req.params.myjson;
        var uid = req.params.uid;
        var fs = require('fs');

        for(key in myprojectjson){
            if(myprojectjson[key].UID == uid)
            {
                myprojectjson[key].project = myjson;
            }
        }



        var outputFilename = __dirname +'/content/users.json';

        fs.writeFile(outputFilename, JSON.stringify(myprojectjson, null, 4), function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log("JSON saved to " + outputFilename);
            }
        });
    });

}
//<end>


//<login>
// verificate that there is a user with username as ":username" and password as ":password".
var users;
var fs = require('fs');

fs.readFile('content/users.json', 'utf8', function (err, data) {
    if (err) throw err;
    users = JSON.parse(data);

});

function findById(id, fn) {
            var idx = id - 1;
            if (users[idx]) {
                fn(null, users[idx]);
            } else {
                fn(new Error('User ' + id + ' does not exist'));
            }
}

function findByUsername(username, fn) {
            console.log("name"+users.length);
            for (var i = 0, len = users.length; i < len; i++) {
                var user = users[i];
                if (user.username === username) {

                    return fn(null, user);
                }
            }
            return fn(null, null);
}



// Passport session setup.
//   To support persistent login sessions, Passport needs to be able to
//   serialize users into and deserialize users out of the session.  Typically,
//   this will be as simple as storing the user ID when serializing, and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.UID);
});

passport.deserializeUser(function(id, done) {
    findById(id, function (err, user) {
        done(err, user);
    });
});


// Use the LocalStrategy within Passport.
//   Strategies in passport require a `verify` function, which accept
//   credentials (in this case, a username and password), and invoke a callback
//   with a user object.  In the real world, this would query a database;
//   however, in this example we are using a baked-in set of users.
passport.use(new LocalStrategy(
    function(username, password, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {

            // Find the user by username.  If there is no user with the given
            // username, or the password is not correct, set the user to `false` to
            // indicate failure and set a flash message.  Otherwise, return the
            // authenticated `user`.
            findByUsername(username, function(err, user) {
                if (err) { return done(err); }
                if (!user) { return done(null, false, { message: 'Unknown user ' + username }); }
                if (user.password != password) { return done(null, false, { message: 'Invalid password' }); }
                return done(null, user);
            })
        });
    }
));
//<end>


// main()

//record
//select
//get a column of table(para tablename) dependingon column Name(para columnName)
//app.get('/getrecords/:tablename&:columnName', getRecords);
function getRecords(req, res) {
    db.query(
        'SELECT '+req.params.columnName+' FROM '+  req.params.tablename ,
        function selectCb(err, results, fields) {


            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}

//list items in a table(para tablename)
function list(req, res) {
    db.query(
        'SELECT * FROM '+  req.params.tablename,
        function selectCb(err, results, fields) {


            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}
function getNations (req, res) {
    db.query(
        'SELECT '+req.params.colomnNmae+' FROM '+req.params.tablename,
        function selectCb(err, results, fields) {

            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}
//insert
//insert into a table by a column's value
//param field and value: field is the Column Name which is the only column will be valued when the new item added.
function insert(req, res) {

    var cmd = 'INSERT INTO '+req.params.table+' SET '+req.params.field+'="'+req.params.value+'"';
    console.log(cmd);
    db.query(cmd, function(err, rows, fields){
            console.log("sert"+rows)
            console.log(fields);
            if (err) {
                throw err;
            }
        }
    );
}

//insert into a table by some columns' value
function insertWhole(req, res) {



    var cmd = 'INSERT INTO '+req.params.table+' ('+req.params.field+') values ('+req.params.value+')';
    console.log(cmd);
    db.query(cmd, function(err, rows, fields){
            if (err) {
                throw err;
            }
        }
    );
}

function insertph (req, res) {


    Imagepath = Imagepath.split("\\").join("\\\\");

    if(req.params.field=="id"){

    }
    else{
        var cmd ='INSERT INTO ' + req.params.table + ' (' + req.params.field + ') VALUES("' +  Imagepath + '")'
        console.log(".............................................................................."+cmd);
        db.query(cmd, function(err, rows, fields){
            if (err) {
                throw err;
            }
        });
    }

}
//delete
//delete a certain item depending on id. /deletel/:id&:table&:columnNames&:values&:uid
function deletel(req, res) {
    var cmd = 'DELETE FROM '+req.params.table+'  WHERE id = ' +  req.params.id;
    console.log(cmd);
    var l = undoArray.length;
    undoArray[l] = {"uid": req.params.uid,"table":req.params.table, "cmd":"insert","column":req.params.columnNames,"oldValue":req.params.values, "newValue":"", "tid":"" }//uerID,oldvValue
    console.log(undoArray);
    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });

}

//delete a item depending on id without keep this into undo list
function deletelwithoutUndo(req, res) {

    db.query(
        'SELECT * FROM '+req.params.table+' WHERE id = ' +  req.params.id,
        function selectCb(err, results, fields) {


            if(results!=null){
                var cmd = 'DELETE FROM '+req.params.table+'  WHERE id = ' +  req.params.id;
                console.log(cmd);

                db.query(cmd, function(err, rows, fields){
                    if (err) {
                        throw err;
                    }
                });
            }
            else{
                console.log("not exist!!!!!");
            }
        }
    );



}

//update
//update a item in axis
//param field, value, and id. update the column named "filed" which is the item with id == "id", the new value is "value".
function update(req, res) {
    if(req.params.field=="id"){

    }
    else{
        var cmd = 'UPDATE ' + req.params.table + ' SET ' + req.params.field + ' = "' +  req.params.value + '" WHERE '+req.params.key+' = ' +  req.params.id;
        console.log(cmd);
        db.query(cmd, function(err, rows, fields){
            if (err) {
                throw err;
            }
        });
    }

}
function updateKey (req, res) {
    if(req.params.field=="id"){

    }
    else{

        var cmd = 'UPDATE ' + req.params.table + ' SET ' + req.params.field + ' = "' +  req.params.value + '" WHERE ' +  req.params.key + ' = ' +  req.params.id;
        console.log(cmd);
        db.query(cmd, function(err, rows, fields){
            if (err) {
                throw err;
            }
        });
    }

}

function updateRef (req, res) {
    if(req.params.field=="id"){

    }
    else{
        async.series([
            function(callback){
                // do some stuff ...
                var cmd = 'UPDATE ' + req.params.table + ' SET reference_table = "' +  req.params.value + '" WHERE ' +  req.params.key + ' = ' +  req.params.id;
                console.log(cmd);
                db.query(cmd, function(err, rows, fields){
                    if (err) {
                        throw err;
                    }
                });
                callback(null, 'one');
            },
            function(callback){
                // do some more stuff .
                var cmd = 'UPDATE ' + req.params.table + ' SET ' + req.params.altfield + ' = "' +  req.params.altvalue + '" WHERE ' +  req.params.key + ' = ' +  req.params.id;
                console.log(cmd);
                db.query(cmd, function(err, rows, fields){
                    if (err) {
                        throw err;
                    }
                });
                callback(null, 'two');
            }
        ],
            // optional callback
            function(err, results){
                // results is now equal to ['one', 'two']
                console.log(results)
            });
    }
}


//easymysql_modifiable
//get all tables owned by a certain user}
function getModification(req, res) {
    db.query(
        'SELECT name FROM easymysql_modifiable ',
        function selectCb(err, results, fields) {


            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}
//easymysql_varification
function getVerification(req, res){
    db.query(
        'SELECT name FROM easymysql_varification ',
        function selectCb(err, results, fields) {


            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}


//easymysql_colunm
//get
function getColunm(req, res){
    db.query(
        'SELECT * FROM easymysql_colunm where tableName ="'+req.params.name+'"',
        function selectCb(err, results, fields) {


            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}

function getColunmByCID(req, res){
    db.query(
        'SELECT * FROM easymysql_colunm where CID ="'+req.params.id+'"',
        function selectCb(err, results, fields) {


            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}

function getAllColunm (req, res){
    db.query(
        'SELECT * FROM easymysql_colunm',
        function selectCb(err, results, fields) {


            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}
//update modifiation
function updateColunm(req, res){
    var cmd = 'UPDATE easymysql_colunm SET motifiable = "' +  req.params.value + '" WHERE CID = ' +  req.params.id;
    console.log(cmd);
    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });
}
//update verification
function updateColunmVer (req, res){
    var value = req.params.value.trim();
    var cmd = 'UPDATE easymysql_colunm SET verification = "' +  value + '" WHERE CID = ' +  req.params.id;
    console.log(cmd);
    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });
}
function updateColunmMod(req, res){
    var value = parseInt(req.params.value.trim());
    var cmd = 'UPDATE easymysql_colunm SET modifiability = ' +  value + ' WHERE CID = ' +  req.params.id;
    console.log(cmd);
    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });
}
function updateColunmDef (req, res){
    var value = req.params.value;
    var id = parseInt(req.params.id);
    console.log(value+":"+id);

    var cmd = 'UPDATE easymysql_colunm SET defaultVa = "' +  value + '" WHERE CID = ' +  req.params.id;
    if(value=="null"){
        cmd = 'UPDATE easymysql_colunm SET defaultVa = NULL WHERE CID = ' +  req.params.id;
    }


    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });
}

function updateph(req, res) {


    Imagepath = Imagepath.split("\\").join("\\\\");

    if(req.params.field=="id"){

    }
    else{
        var cmd = 'UPDATE ' + req.params.table + ' SET ' + req.params.field + ' = "' +  Imagepath + '" WHERE '+req.params.key+' = ' +  req.params.id;
        console.log(".............................................................................."+cmd);
        db.query(cmd, function(err, rows, fields){
            if (err) {
                throw err;
            }
        });
    }

}

//alter original tables
function alter(req, res){
    async.series([
        function(callback){
            // do some stuff ...
            var value = req.params.value;
    var cmd = 'alter table ' +  req.params.tableName + ' alter column ' +  req.params.colunmName + ' set default "' +  value + '"';
	if(value=="null") {
	cmd = 'alter table ' +  req.params.tableName + ' alter column ' +  req.params.colunmName + ' set default NULL';
	}
    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });
            callback(null, 'one');
        },
        function(callback){
            // do some more stuff .
			var value = req.params.value;
    var id = parseInt(req.params.CID);
    console.log(value+":"+id);
	
    var cmd = 'UPDATE easymysql_colunm SET defaultVa = "' +  value + '" WHERE CID = ' +  req.params.CID;
	if(value=="null"){
	cmd = 'UPDATE easymysql_colunm SET defaultVa = NULL WHERE CID = ' +  req.params.CID;
	}
    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });
           
            callback(null, 'two');
        }
    ],
        // optional callback
        function(err, results){
            // results is now equal to ['one', 'two']
            console.log(results)
        });

    
	
}
function modifyColumnType(req, res){
    if(req.params.newType=="varchar"){
        var cmd = 'alter table ' +  req.params.tableName + ' MODIFY  ' +  req.params.columnName + ' varchar(500)';
    }
    else
    var cmd = 'alter table ' +  req.params.tableName + ' MODIFY  ' +  req.params.columnName + ' '+ req.params.newType;
    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });
}

//easymysql_tables
//table tables
function getAddable (req, res) {
    var name = req.params.name;
    db.query(
        'SELECT * FROM easymysql_tables WHERE name = "' +  name +'"',
        function selectCb(err, results, fields) {
            console.log(results.length);
            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}


function updateAddable (req, res) {
    var cmd = 'UPDATE easymysql_tables SET addrow = ' +  req.params.value + ' WHERE  name = "' + req.params.name +'"';
    console.log(cmd);
    db.query(cmd, function(err, rows, fields){
        if (err) {
            throw err;
        }
    });

}
function getTableByP(req, res) {
    var name = req.params.name;
    db.query(
        'SELECT * FROM easymysql_tables WHERE project = "' +  name +'"',
        function selectCb(err, results, fields) {
            console.log(results.length);
            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}



function undo (req, res) {

        var l = undoArray.length;
        undoArray[l] = {"uid": req.params.uerID,"table":req.params.table, "cmd":req.params.cmd,"column":req.params.column,"oldValue":req.params.oldValue, "newValue":req.params.newValue, "tid":req.params.tid }//uerID,oldvValue
        console.log(undoArray);

}

function getdo (req, res) {
    var ret;
    console.log(undoArray);
    for(var i = undoArray.length-1; i >= 0; i--){
        if(undoArray[i].uid == req.params.uerID){
            ret = undoArray[i];
            undoArray.splice(i,1);
            break;
        }
    }
    console.log(ret);
        res.json(ret);


}




function getDefault(req, res) {//:colN&:tableN
    db.query(
        'SELECT DEFAULT( ' +  req.params.colN +' ) as defval FROM ' +   req.params.tableN +' LIMIT 1',
        function selectCb(err, results, fields) {
            console.log(results.length);
            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}

function getTablesbyProject (req, res) {
    db.query(
        'SELECT name FROM easymysql_tables where project = '+req.params.proID,
        function selectCb(err, results, fields) {
            console.log(results.length);
            if('jsonp' in req.query) {
                res.jsonp(results)
            } else {
                res.json(results)
            }

        }
    );
}


var app = express()
app.configure(function() {

    app.set('view engine', 'ejs');
    app.engine('ejs', require('ejs-locals'));
	    app.use(express.favicon());
    app.use(express.logger('dev'));

    app.use(express.bodyParser({
        keepExtensions: true,
        uploadDir:__dirname + '/tmp',
        limit: '2mb'
    }));
    app.use(express.logger());
    app.use(express.cookieParser());
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(express.session({ secret: 'keyboard cat' }));
    // Initialize Passport!  Also use passport.session() middleware, to support
    // persistent login sessions (recommended).
    app.use(passport.initialize());
    app.use(passport.session());
    app.use(app.router);
    app.use(express.static(__dirname + '/../../public'));
    });
    app.configure('development', function(){
    app.use(express.errorHandler());
    });

    app.post('/', function(req, res) {
    Imagepath = req.files.myFile.path;
    console.log(req.files.myFile.path)
    //deleteAfterUpload(req.files.myFile.path);
    res.end();
    });
    var fs = require('fs');
    app.get('/', function(req, res){
        res.render('index', { user: req.user });
    });

    app.get('/account', ensureAuthenticated, function(req, res){
    res.render('account', { user: req.user });
    });

    app.get('/login', function(req, res){
    res.render('login', { user: req.user, message: req.session.messages });
    });


    app.post('/login', function(req, res, next) {
    passport.authenticate('local', function(err, user, info) {
        if (err) { return next(err) }
        if (!user) {
            req.session.messages =  [info.message];
            return res.redirect('/login')
        }
        req.logIn(user, function(err) {
            if (err) { return next(err); }
            if(user.ifadmin==0){
                //return res.redirect('/index.html?'+user.UID);
                return res.redirect('/configuration.html?'+user.UID);
                //return res.redirect('/');
            }
            else if(user.ifadmin==1){
                //return res.redirect('/admin.html');
                return res.redirect('/configuration.html?'+user.UID);
            }

            //return res.redirect('/');
        });
    })(req, res, next);
    });

    app.get('/logout', function(req, res){
        req.logout();
        res.redirect('/');
    });
function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) { return next(); }
    res.redirect('/login')
}

app.use(express.json());
app.use(express.query());


//database configuration
app.post('/db/:url&:username&:pw&:dbname', db);
app.post('/configermysql/:projectName', configermysql);
app.get('/getconnectionstate', function(req, res){
    res.send(""+connectionState);
});
//create Project
app.post('/writeToJson/:myjson&:uid',writeToJson);

//Record
app.get('/getrecords/:tablename&:columnName', getRecords);
app.get('/list/:tablename', list);
app.get('/getCountry/:tablename&:colomnNmae', getNations);

app.post('/insert/:field&:value&:table', insert);
app.post('/insertwhole/:field&:value&:table', insertWhole);
app.post('/insph/:field&:table', insertph);

app.post('/deletel/:id&:table&:columnNames&:values&:uid', deletel);
app.post('/delete/:id&:table', deletelwithoutUndo);

app.post('/update/:id&:field&:value&:table&:key', update);//uerID,oldvValue
app.post('/updatekey/:id&:field&:value&:table&:key', updateKey);
app.post('/updateRef/:id&:filed&:altfield&:value&:altvalue&:table&:key', updateRef); //updateRef

//easymysql_modifiable
app.get('/listmod', getModification);
//easymysql_varification
app.get('/listver', getVerification);

//easymysql_colunm
app.get('/getcolums/:name', getColunm);
app.get('/getallcolums/', getAllColunm);
app.get('/getcolumbyid/:id', getColunmByCID);

app.post('/updatemod/:id&:value', updateColunm);
app.post('/updatever/:id&:value', updateColunmVer);
app.post('/updatmodb/:id&:value', updateColunmMod);
app.post('/updatedef/:id&:value', updateColunmDef);
app.post('/updateph/:id&:field&:table&:key', updateph);



//alter original tables
app.post('/alter/:tableName&:value&:colunmName&:CID', alter);
app.post('/modifyColumnType/:tableName&:columnName&:newType', modifyColumnType);



//easymysql_tables
//app.get('/gettables/:proID', getTablesbyProject);
app.get('/getaddable/:name', getAddable);
app.post('/updateaddable/:name&:value', updateAddable);
app.get('/gettablesbyproject/:name', getTableByP);

//get table'columns' features
app.get('/getdefault/:colN&:tableN', getDefault);//:colN&:tableN

//undo req.params.uerID,"table":req.params.table, "cmd":req.params.cmd,"column":req.params.column,"oldValue":req.params.oldValue, "newValue":req.params.newValue }
app.post('/undo/:uerID&:table&:cmd&:column&:oldValue&:newValue&:tid', undo);
app.get('/getdo/:uerID', getdo);



// Start the app
app.use(express.static('content'));
app.listen(post,host);
console.log('Server running at http://'+host+':'+post+'/');

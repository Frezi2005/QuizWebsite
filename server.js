const express = require('express');
const app = express();
var bodyParser = require('body-parser')
var mysql = require('mysql');

//Body parser for post requests handling
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(express.json());
app.use(express.urlencoded());
/* --------------------------------*/

app.set('view engine', 'pug');
app.use(express.static(__dirname + '/public'));

//Creating database with MySQL
var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "Starwars2005",
    database: "quiz"
});

con.connect(function (err) {
    if(err) throw err;
}) 

app.get('/', (req, res) => {
    res.render('index', {
        title: "Homepage"
    })
});

app.post('/createQuizIndex', (req, res) => {
    res.render('createQuizIndex', {
        title: "Create Quiz"
    })
});

app.post('/playQuizIndex', (req, res) => {
    res.render("playQuizIndex", {
        title: "Type Quiz Code"
    })
});

app.post('/quiz', (req, res) => {
    res.render("quiz", {
        title: "Quiz",
        roundsNumber: req.body.roundsNumber,
        qForRound: req.body.qForRound,
        quizCode: req.body.quizCode
    })
});

app.post('/check', (req, res) => {
    res.render("check", {
        title: "Check"
    })
});

var quizInfo;
app.get('/play', (req, res) => {
    con.query("SELECT * FROM quiz WHERE code LIKE '"+req.query.quizCode+"'", function (err, result, fields) {
        if (err) throw err;
        quizInfo = result[0];
        res.render("play", {
            title: "Play Quiz",
            quizInfo: quizInfo
        })
    });
    
    
});

function makeID(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

app.post('/process', (req, res) => {
    quizCode = makeID(4);
    var quizInfo = {
        teamsNumber: req.body.teamsNumber,
        roundsNumber: req.body.roundsNumber,
        qForRound: req.body.qForRound,
        code: quizCode
    };
    res.render("process", {
        title: "Wpisz odpowiedzi",
        quizInfo: quizInfo
    });
    console.log("Connected!");
    var sql = "INSERT INTO quiz (id, code, teamsNumber, roundsNumber, qForRound, teams, teamsPoints) VALUES (null, '" + quizCode + "', " + req.body.teamsNumber + ", " + req.body.roundsNumber + ", " + req.body.qForRound + ", '', '')";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
    });

});

app.post('/createQuiz', (req, res) => {
    var questions = [];
    res.render('createQuiz', {
        title: 'Potwierdź',
        quizCode: req.body.quizCode
    });

    for(var question in req.body) {
        questions.push(question.replace('question', '').replace('quizCode', ''));
    }
    for(var i = 0; i < questions.length - 1; i++) {
        var sql = "INSERT INTO questions (id, quizCode, roundNumber, teamAnswer) VALUES (null, '" + req.body.quizCode + "', " + questions[i].charAt(2) + ", '')";
        con.query(sql, function (err, result) {
            if (err) throw err;
         });
    }
    var lastIndex = questions.length - 2;
    for(var j = 0; j < questions[lastIndex].charAt(2); j++) {
        var sql = "INSERT INTO rounds (id, quizCode, questionsNumber) VALUES (null, '" + req.body.quizCode + "', " + questions[lastIndex].charAt(0) + ")";
        con.query(sql, function (err, result) {
            if (err) throw err;
         });
    }
});

const server = app.listen(7000, () => {
    console.log(`Express running → PORT ${server.address().port}`);
});

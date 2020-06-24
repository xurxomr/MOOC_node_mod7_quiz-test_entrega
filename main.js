const express = require('express');
const app = express();

// Import MW for parsing POST params in BODY
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Import MW supporting Method Override with express
const methodOverride = require('method-override');
app.use(methodOverride('_method', { methods: ["POST", "GET"] }));

// ========== MODEL ==========

const Sequelize = require('sequelize');

const options = { logging: false, operatorsAliases: false };
const sequelize = new Sequelize("sqlite:db.sqlite", options);

const Quiz = sequelize.define( // define Quiz model (table quizzes)
    'quiz', {
        question: Sequelize.STRING,
        answer: Sequelize.STRING
    }
);

sequelize.sync() // Syncronize DB and seed if needed
    .then(() => Quiz.count())
    .then(count => {
        if (count === 0) {
            return Quiz.bulkCreate([
                    { question: "Capital of Italy", answer: "Rome" },
                    { question: "Capital of France", answer: "Paris" },
                    { question: "Capital of Spain", answer: "Madrid" },
                    { question: "Capital of Portugal", answer: "Lisbon" }
                ])
                .then(c => console.log(`DB filled with ${c.length} quizzes.`));
        } else {
            console.log(`DB exists & has ${count} quizzes.`);
        }
    })
    .catch((err) => console.log(err));


// ========== VIEWs ==========

const CSS_STYLE = `
        <style>
            .button { display: inline-block; text-decoration: none;
                padding: 2px 6px; margin: 2px;
                background: #4479BA; color: #FFF;
                border-radius: 4px; border: solid 1px #20538D; }
            .button:hover { background: #356094; }
        </style>`;

// Render all quizzes (quizzes: array of quiz)
const indexView = quizzes =>
    `<!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>P7: Quiz</title>
        ${CSS_STYLE}
    </head>
    <body>
        <h1>Quizzes</h1>` +
    quizzes.map(quiz =>
        `<div>
                <a href="/quizzes/${quiz.id}/play">${quiz.question}</a>
                <a href="/quizzes/${quiz.id}/edit"
                   class="button">Edit</a>
                <a href="/quizzes/${quiz.id}?_method=DELETE"
                   onClick="return confirm('Delete: ${quiz.question}')"
                   class="button">Delete</a>
             </div>`).join("\n") +
    `<a href="/quizzes/new" class="button">New Quiz</a>
    </body>
    </html>`;


// Render play view for quiz showing question 
// response: hidden param received from 'Try again'
//    with previous quiz response to initialize form input
const playView = (quiz, response) =>
    `<!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>P7: Quiz</title>
        ${CSS_STYLE}
    </head>
    <body>
        <h1>Play Quiz</h1>
        <form method="get" action="/quizzes/${quiz.id}/check">
            ${quiz.question}: <br />
            <input type="text" name="response" value="${response}" placeholder="Answer" />
            <input type="submit" class="button" value="Check" /> <br />
        </form>
        <a href="/quizzes" class="button">Go back</a>
    </body>
    </html>`;

// Render result view of quiz guess trial 
// id: DB id of quiz send by 'Try again'
// msg: result of trying to guess the quiz
// response: hidden param send by 'Try again' with previous response
const resultView = (id, msg, response) =>
    `<!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>P7: Quiz</title>
         ${CSS_STYLE}
   </head>
    <body>
        <h1>Result</h1>
        <div id="msg"><strong>${msg}</strong></div>
        <a href="/quizzes" class="button">Go back</a>
        <a href="/quizzes/${id}/play?response=${response}" class="button">Try again</a>
    </body>
    </html>`;


//Render form to create a new quiz
const newView = () => {
    return `<!doctype html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>P7: Quiz</title>
        ${CSS_STYLE}
    </head>
    <body>
        <h1>Create New Quiz</h1>
        <form method="POST" action="/quizzes">
            Question: <input type="text" name="question" value="" placeholder="Question" /> <br />
            Answer: <input type="text" name="answer"   value=""   placeholder="Answer" />
            <input type="submit" class="button" value="Create" /> <br />
        </form>
        <a href="/quizzes" class="button">Go back</a>
    </body>
    </html>`;
}


//Render form to edit quiz
// quiz: response and answer to initialize form input
const editView = (quiz) => {
    // .... introducir código
}


// ========== CONTROLLERs ==========

// GET /, GET /quizzes
const indexController = (req, res, next) => {
    Quiz.findAll()
        .then(quizzes => res.send(indexView(quizzes)))
        .catch(next);
}

//  GET  /quizzes/:id/play
const playController = (req, res, next) => {

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(new Error(`id "${req.params.id}" is not a number.`));

    const response = req.query.response || ""; // hidden param for 'Try again'

    Quiz.findByPk(id)
        .then(quiz => quiz ?
            res.send(playView(quiz, response)) :
            next(new Error(`Quiz ${id} not found.`)))
        .catch(next);
};

//  GET  /quizzes/:id/check
const checkController = (req, res, next) => {
    const response = (req.query.response).toLowerCase().trim();

    const id = Number(req.params.id);
    if (Number.isNaN(id)) return next(new Error(`id "${req.params.id}" is not a number.`));

    Quiz.findByPk(id)
        .then(quiz => {
            if (!quiz) return next(new Error(`Quiz ${id} not found.`));

            const msg = ((quiz.answer).toLowerCase().trim() === response) ?
                `Yes, "${response}" is the ${quiz.question}` :
                `No, "${response}" is not the ${quiz.question}`;
            res.send(resultView(id, msg, response));
        })
        .catch(next);
};

// GET /quizzes/new
const newController = (req, res, next) => {
    res.send(newView());
};

// POST /quizzes
const createController = (req, res, next) => {
    let { question, answer } = req.body;

    Quiz.create({ question, answer })
        .then(quiz => res.redirect('/quizzes'))
        .catch(next);
};

//  GET /quizzes/:id/edit
const editController = (req, res, next) => {
    // .... introducir código
};

//  PUT /quizzes/:id
const updateController = (req, res, next) => {
    // .... introducir código
};

// DELETE /quizzes/:id
const destroyController = (req, res, next) => {
    // .... introducir código
};


// ========== ROUTES ==========

app.get(['/', '/quizzes'], indexController);
app.get('/quizzes/:id/play', playController);
app.get('/quizzes/:id/check', checkController);
app.get('/quizzes/new', newController);
app.post('/quizzes', createController);

// ..... crear rutas e instalar los MWs para:
//   GET  /quizzes/:id/edit
//   PUT  /quizzes/:id
//   DELETE  /quizzes/:id


app.all('*', (req, res) =>
    res.status(404).send("Error: resource not found or method not supported.")
);


// Middleware to manage errors:
app.use((error, req, res, next) => {
    console.log("Error:", error.message || error);
    res.redirect("/");
});

// Server started at port 8000
app.listen(8000);
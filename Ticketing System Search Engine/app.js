/**
 * @author Matan Bardugo <matanew1@gmail.com>
 */

/*************************************************
instructions for running:
1. `npm install` to get node_modules folder
2. `nodemon app` or `node app` to run the server
**************************************************/

//import modules
const express = require('express');
const fs = require('fs');
const _ = require("lodash");
const path = require('path');  

//create app
const app = express();

app.set('view engine', 'ejs'); // set the view engine for the app
app.use('/static',express.static(path.join(__dirname,'public'))); // serve the static files in the public directory.
app.use(express.urlencoded({extended: true})); // parse the request body

//global variables
let matchArr;
let tickets;

fs.readFile('data.json', (err, data) => {
    if (err) throw err; // throw err if needed
    tickets = JSON.parse(data); //parse data to json format
});

//the server render index.ejs, when a GET request is called at '/'
app.get('/', (req, res) => { 
    res.render('index');
});

//the server render tickets.ejs, when a GET request is called at '/tickets'
app.get('/tickets', (req, res) => {
    if(matchArr !== undefined) { // prevent hacking to `/tickets` directly
        res.render('tickets', {results: matchArr, size: matchArr.length}); //send matchArr and its size to tickets.ejs
        matchArr.length = 0;
    }
    else {
        res.redirect('/'); // if trying to reach `/tickets` it leads to `/`
    }
});

//Server response to POST request
app.post('/tickets', (req, res) => {
    let {title, from, to, content, email} = req.body; // Get data from the POST request

    // get the size of the request body values (will be 0 if all values ' ')
    const numOfValues = Object.values(req.body).filter(value => value !== '').length;

    // if there is at least one value
    if(numOfValues > 0) {

        // find matches by `title`, `content` and `email` (include any combination)
        matchArr = tickets.filter(ticket => 
            ticket.title.toLowerCase().includes(title.toLowerCase()) &&
            ticket.content.toLowerCase().includes(content.toLowerCase()) &&
            ticket.userEmail.toLowerCase().includes(email.toLowerCase())
        );
        // find matches by `from`, `to` and both
        matchArr = matchArr.filter(ticket => {
            return (from === '' || from <= ticket.creationTime) &&
                   (to === '' || to >= ticket.creationTime);
        });
    }

    // redirect to '/tickets' to show result match 
    res.redirect('tickets');  
});

//Server response to POST Request
app.post('/', (req, res) => {  
    res.render('index'); //Go back to index.ejs (search page)
});


app.listen(3000, () => { //application listen for requests on 127.0.0.1:3000
    console.log('Server started on port 3000, Listening for reqeusts...');
    console.log('http://127.0.0.1:3000'); // direct link from console
});
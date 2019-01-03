const   express     = require('express'),
        controller  = require('./controller');

const   app     = express(),
        port    = (process.env.PORT || 3000);

app.use(express.urlencoded({extended: true}));
app.use(express.json());


app.get('/getAllTeams', controller.getAllTeams);

app.get('/getTeamBetweenYears', controller.getTeamBetweenYears);

app.post('/updateCoachName', controller.updateCoachName);

app.get('/api', (req, res) => {
    res.redirect("https://documenter.getpostman.com/view/5697633/RznCpz4V");
})

app.all('*', (req, res) => {
    res.status(404).send({"Status": "Failed", "Cause": "Wrong Route", "Details": "Must Select A Valid Route"});
    console.log("\n\tValid Route Must Be Select\n");
})

app.listen(port, () => {
    console.log(`\n*** Listening to port number: ${port} ***`);
})


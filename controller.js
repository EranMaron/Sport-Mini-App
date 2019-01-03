const   express     = require('express'),
        mongoose    = require('mongoose'),
        consts      = require('./consts.js'),
        Teams       = require('./newTeams');

const   {MLAB_URL, DB_USER, DB_PASS} = consts;

const   url     = MLAB_URL,
        options = {
            useNewUrlParser: true,
            useCreateIndex: true,
            user: DB_USER,
            pass: DB_PASS
        }

mongoose.connect(url, options)
    .then(
        () => {
            console.log("\n\nLogger:");
            console.log("\n\tno.\tStatus\t\tDetails");
            console.log("\t" + ++logCount + ")\tSucceed\t\tconnected to MongoDB.");
        },
        err => {
            console.log("\t" + ++logCount + `)"\t"Failed\t\tThere was a problem with the connection: ${err}`);
        }
    );

/* Logger Counter */
var logCount = 0;

/* Validations */
function checkValidNumbers (_req) {
    let from = {years: parseInt(_req.query.from)};
    let to   = {years: parseInt(_req.query.to)};

        /* Check if parameters are numbers */
        if(!/^\d*\.?\d+$/.test(_req.query.from)|| !/^\d*\.?\d+$/.test(_req.query.to)) { 
            console.log("\t" + ++logCount + ")\tInput Error\tThe parameters must be a Number.");
                return false;
        }
        else {
            /* Validate that the 'From' parameter is gt 'To' parameter */
            if (from.years > to.years) {
                console.log("\t" + ++logCount + ")\tInput Error\t'From' parameter must be lower then or equal to 'To' parameter.");
                    return false;
            }
            else 
                return true;
    }
}

function checkNames(_teamName, _newCoach) {

    if( /[^a-zA-Z._-\s]/g.test(_teamName.team_name) ||
        /[^a-zA-Z._-\s]/g.test(_newCoach.coach_name)) {
            console.log("\t" + ++logCount +
                ")\tInput Error\tThe Team Name and Coach Name must contain only letters, spaces '-', '_', '.'");
                return false;
    }
    else
        return true;
}

function toUppCase(string) {
    var splited = string.toLowerCase().split(" ");
    for (var i = 0; i < splited.length; i++) {
        splited[i] =
        splited[i].charAt(0).toUpperCase() + splited[i].substring(1);
    }
        return splited.join(" ");
}

function teamsExist(doc) {
    if(doc.length > 0)
        return true;
    else
        return false;
}

module.exports = {

    /* Return all Documents */
    getAllTeams: async (req, res) => {
        const result = await Teams.find({});
        /* Check if there are documents */
        if(teamsExist(result)) {
            res.json(result);
            console.log("\t" + ++logCount + ")\tSucceed\t\tGet All Teams.");
        }
        else
            res.status(404).send({"Status": "Failed", "Cause": "No Match", "Details": "There are no Teams in Class A."});
    },

    /* Return all teams in Class A between X to Y years */
    getTeamBetweenYears: async (req, res) => {
        const   yearsInClass = {
                    years: {$gte: parseInt(req.query.from), $lte: parseInt(req.query.to)}
                };
        /* Check If a valid numbers */
        if (checkValidNumbers(req)) {
            /* Check if number gt 1 */
            if(req.query.from < 1 || req.query.to < 1) {
                res.status(404).send({"Status": "Failed", "Cause": "Invalid Parameters", "Details": "You Must Choose years from 1 to infinit."});
                    
            } else { 
                let teams = await Teams.find(yearsInClass);
                /* Check if there are documents */
                if(teamsExist(teams)) {
                    res.json(teams);
                    console.log("\t" + ++logCount +
                                `)\tSucceed\t\tGet teams between ${req.query.from} to ${req.query.to} years in Class A.`);
                }
                else {
                    res.status(404).send(`{
                        "Status": "Failed", "Cause": "Input Error", "Details": "There are no teams between ${req.query.from} to ${req.query.to} years."
                    }`);

                    console.log("\t" + ++logCount +
                                `)\tSystem Massage\tThere are no teams between ${req.query.from} to ${req.query.to} years in Class A.`); 
                }
            }
        } else
            res.status(404).send({
                "Status": "Error", "Cause": "Input Error", "Details": "Both parameters must be Numbers. The 'From' Parameter Must Be Lower Then 'To' Parameter."
            });
    },

    /* Update name of coach for a specific team*/
    updateCoachName: async (req, res) => {
        var teamName = {team_name: req.body.team_name};
        var newCoach = {coach_name: req.body.coach_name};
        /* If names are valids */
        if(!(checkNames(teamName, newCoach))) {
            res.status(404).send({
                "Status": "Error", "Cause": "Input Error", "Details": "The Team Name and the Coach Name must include only letters."
            })
        }
        else {
            /* Change to UpperCase */
            let coachUpdt = toUppCase(req.body.coach_name);
            let teamUpdt = toUppCase(req.body.team_name);
                teamName = {team_name: teamUpdt};
            /* Set the changes and update in DB */
            let result = await Teams.updateOne(teamName, {
                $set: {
                    "team_name": teamUpdt, 
                    "coach_name": coachUpdt
                }
            });
            if(result.nModified < 1) {
               res.status(204).send(`{"Status": "Failed", "team": ${JSON.stringify(teamUpdt)}, "new_coach": ${JSON.stringify(coachUpdt)}, "details": "Team not found in documents"}`); 
               console.log("\t" + ++logCount + ")\tAttention\tThere was no updates.");
               return;
            }
            res.send(`{"Status": "Succeed", "team": ${JSON.stringify(teamUpdt)}, "new_coach": ${JSON.stringify(coachUpdt)}}`);
            console.log("\t" + ++logCount + ")\tSucceed\t\tThe Coach Was Updated.");
        }
    }
}
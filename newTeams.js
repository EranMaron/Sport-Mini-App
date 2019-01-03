const mongoose = require('mongoose');
let Schema = mongoose.Schema;

let schema = {
    id: {type: Number, required: true},
    team_name: {type: String, required: true},
    class: {type: String, required: true},
    coach_name: String,
    num_of_years: Number,
    details: {
        country: String,
        date: Date
    }
}

const newTeamSchema = new mongoose.Schema(schema);
const NewTeams = mongoose.model('new_teams', newTeamSchema);

module.exports = NewTeams;
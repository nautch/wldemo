'use strict';

let csv = require("csvtojson");

let wlDeck = "wavelength";
let defaultLanguage = "en";

/* https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array */
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// Store data in an object to keep the global namespace clean
function Data() {
  this.data = {};
  this.rooms = {};
}

Data.prototype.createDeck = function() {
  let deck = this.data[wlDeck];
  return shuffle(deck);
}

Data.prototype.getUILabels = function (lang) {
  var ui = require("./data/wavelength-" + (lang || defaultLanguage) + ".json");
  return ui;
};

/*
  Function to load initial data from CSV files into the object
*/
Data.prototype.initializeTable = function (table) {
  csv({checkType: true})
    .fromFile("./data/" + table + ".csv")
    .then((jsonObj) => {
      this.data[table] = jsonObj;
    });
};

Data.prototype.createRoom = function(roomId) {
  let room = {};
  room.players = [];
  room.deck = this.createDeck();
  room.playedMissions = [];
  this.rooms[roomId] = room;
}

Data.prototype.joinGame = function (roomId, playerId) {
  let room = this.rooms[roomId];
  if (typeof room !== 'undefined') {
    if (room.players.map(d => d.playerId).includes(playerId)) {
      return true;
    }
    else if (room.players.length <= room.playerCount) {
      room.players.push({playerId: playerId, hand: [], color: "gray", played: []});
      return true;
    } 
  }
  return false;
}

Data.prototype.getInfo = function (id) {
  let room = this.rooms[id]
  if (typeof room !== 'undefined') {
    return {playerCount: room.playerCount, cardsRemaining: room.deck.length}
  }
  else return {};
}

Data.prototype.getNewMission = function (roomId) {
  let room = this.rooms[roomId];
  if (typeof room !== 'undefined') {
    let mission = {card: room.deck.pop(), target: Math.random() };
    room.playedMissions.push(mission);
    return mission;
  }
}

Data.prototype.getCurrentMission = function (roomId) {
  let room = this.rooms[roomId];
  if (typeof room !== 'undefined') {
    if (room.playedMissions.length < 1) {
      return this.getNewMission(roomId);
    }
    else {
      return room.playedMissions[room.playedMissions.length - 1];
    }
  }
}


Data.prototype.initializeData = function() {
  console.log("Starting to build data tables");
  this.initializeTable(wlDeck);
}

module.exports = Data;




const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "cricketMatchDetails.db");

let database = null;

const initializerDBAndServer = async (dbObject) => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http//:localhost:3000");
    });
  } catch (e) {
    console.log(`DB error : ${e.message}`);
    no;
    process.exit(1);
  }
};

initializerDBAndServer();

const convertPlayerDetails = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
  };
};
const convertMatchDetails = (dbObject) => {
  return {
    matchId: dbObject.match_id,
    match: dbObject.match,
    year: dbObject.year,
  };
};


app.get("/players/", async (request, response) => {
  let getPlayers = `
    select 
    *
    from
    player_details
   `;
  let players = await database.all(getPlayers);
  response.send(players.map((eachPlayer) => convertPlayerDetails(eachPlayer)));
});

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;

  let getPlayer = `
    select
    *
    from
    player_details
    where
    player_id=${playerId}

    `;
  let player = await database.get(getPlayer);
  response.send(convertPlayerDetails(player));
});

app.put("/players/:playerId/",async(request,response)=>{
    let {playerId}=request.params
    let {playerName}=request.body

    let updatePlayer=`
    UPDATE 
    player_details
    SET
    playerName=${playerName},
    where 
    player_id=${playerId}
    `
    await database.run(updatePlayer)
    response.send("Player Details Updated")

})
app.get("/matchs/:matchId/",async(request,response)=>{
    let {matchId}=request.params
    let getMatch=`
    select
    *
    from
    match_details
    where
    match_id=${matchId}
    `
    let match=await database.get(getMatch)
    response.send(convertMatchDetails(match))

})
app.get("players/:playerId/matches",async(request,response)=>{
    let {playerId}=request.params
    let getDetails=`
    select
    *
    from 
    player_match_score natural join match_details
    
    where
    player_id=${playerId}
    `
    let details=await database.all(getDetails)
    response.send(
        details.map((eachMatch)=>convertMatchDetails(eachMatch))
    )

app.get("/matches/:matchId/players",async(request,response)=>{
    let {matchId}=request.params
    let getPlayers=`
    select
    *
    from
    player_match_score natural join match_details
    where
    match_id=${matchId}
    
    `
    let players=await database.all(getPlayers)
    response.send(players.map((eachPlayer)=>convertPlayerDetails(eachPlayer))

})
app.get("/players/:playerId/playerScores/", async (request, response) => {
  const { playerId } = request.params;
  const PlayersQuery = `
    SELECT
      player_id AS playerId,
      player_name AS playerName,
      SUM(score) AS totalScore,
      SUM(fours) AS totalFours,
      SUM(sixes) AS totalSixes
    FROM player_match_score
      NATURAL JOIN player_details
    WHERE
      player_id = ${playerId};`;
  const playersMatchDetails = await database.get(PlayersQuery);
  response.send(playersMatchDetails);
});



module.exports=app

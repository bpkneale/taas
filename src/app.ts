import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());

type Player = "p1" | "p2";

// Score map:
// 0 - 0,
// 1 - 15,
// 2 - 30,
// 3 - 40,
// 4 - game point
// 5 - won
type ScoreLutType = Record<number, string>;
const ScoreLut: ScoreLutType = {
    0: "0",
    1: "15",
    2: "30",
    3: "40",
    4: "game point",
    5: "won"
}

type GameCreate = {
    name: string;
    players: {
        p1: string;
        p2: string;
    }
}

type TennisSet = {
    p1: number;
    p2: number;
}

type ScoreRequest = {
    gameId: number;
    name: string;
    sets: TennisSet[];
    finished: boolean;
    winnerId: Player | null;
    winner: string | null;
    currentGame: {
        p1: string;
        p2: string;
    }
}

type Game = {
    p1Score: number;
    p2Score: number;
    tieBreaker: boolean;
}

type TennisGame = GameCreate & {
    gameId: number;
    current: Game;
    finished: boolean;
    winnerId: Player | null;
    winner: string | null;
    sets: TennisSet[];
}

var games: TennisGame[] = [];

const addSetOrMatchFinished = (game: TennisGame, winner: Player, bestOf: number = 5) => {
    if(game.sets.length === bestOf) {
        game.finished = true;
        game.winnerId = winner;
        game.winner = game.players[winner];
    } else {
        game.sets.push({
            p1: 0,
            p2: 0
        })
    }
}

const updateGame = (game: TennisGame) => {
    if(game.current.tieBreaker) {
        if((game.current.p1Score >= 7 || game.current.p2Score >= 7)
            && Math.abs(game.current.p1Score - game.current.p2Score) >= 2) {

            const winner: Player = game.current.p1Score > game.current.p2Score ? "p1" : "p2";
            const loser: Player = winner === "p1" ? "p2" : "p1";
            const set = game.sets[game.sets.length - 1]
            set[winner]++;
            addSetOrMatchFinished(game, winner);
        }

    } else {
        const finished = game.current.p1Score === 5 || game.current.p2Score === 5;
        if(finished) {
            const winner: Player = game.current.p1Score === 5 ? "p1" : "p2";
            const loser: Player = winner === "p1" ? "p2" : "p1";
            game.current.p1Score = 0;
            game.current.p2Score = 0;
            const set = game.sets[game.sets.length - 1]
            set[winner]++;
    
            if(set[winner] >= 6 && ((set[winner] - set[loser]) >= 2)) {
                addSetOrMatchFinished(game, winner);
            } else if(set[winner] === 6 && set[loser] === 6) {
                game.current.tieBreaker = true;
            }
        }
    }
}

app.get( "/", ( req, res ) => {
    res.send( "TaaS - please use my other routes" );
} );

app.post("/taas/game/create", (req, res) => {
    const body = req.body as GameCreate;
    const gameId = games.length
    const game: TennisGame = {
        gameId,
        name: body.name,
        players: body.players,
        current: {
            p1Score: 0,
            p2Score: 0,
            tieBreaker: false
        },
        finished: false,
        winnerId: null,
        winner: null,
        sets: [{
            p1: 0,
            p2: 0
        }]
    }
    games.push(game);
    res.json({gameId})
});

app.post("/taas/game/:gameId/point/:p", (req, res) => {
    const gid = parseInt(req.params.gameId);
    const player = req.params.p;
    const game = games[gid];
    if(game) {
        if(game.finished) {
            res.json({success: false, reason: `game already finished`})
        } else {
            switch(player)
            {
                case "p1":
                    if(game.current.tieBreaker) {
                        // Tie breaker - score increments until there is a two point lead
                        game.current.p1Score++;
                    } else {
                        // Normal game
                        if(game.current.p2Score === 4 && game.current.p1Score === 3) {
                            game.current.p2Score = 3;
                        } else {
                            game.current.p1Score++;
                        }
                    }
                    break;
                
                case "p2":
                    if(game.current.tieBreaker) {
                        game.current.p2Score++;
                    } else {
                        if(game.current.p1Score === 4 && game.current.p2Score === 3) {
                            game.current.p1Score = 3;
                        } else {
                            game.current.p2Score++;
                        }
                    }
                    break;
    
                default:
                    res.json({success: false, reason: `invalid player: ${player}`})
            }
            updateGame(game);
            res.json({success: true})
        }
    } else {
        res.json({success: false, reason: `invalid game ID: ${gid}`})
    }
})

app.get("/taas/game/:gameId", (req, res) => {
    const gid = parseInt(req.params.gameId);
    const game = games[gid];
    if(game) {
        const resp: ScoreRequest = {
            gameId: gid,
            name: game.name,
            sets: game.sets,
            finished: game.finished,
            winnerId: game.winnerId,
            winner: game.winner,
            currentGame: {
                p1: ScoreLut[game.current.p1Score],
                p2: ScoreLut[game.current.p2Score]
            }
        }
        res.json({success: true, game: resp})
    } else {
        res.json({success: false, reason: `invalid game ID: ${gid}`})
    }
})

export default app;

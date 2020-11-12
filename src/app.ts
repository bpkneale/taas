import express from 'express';
import bodyParser from 'body-parser';

const app = express();
app.use(bodyParser.json());
const port = 8080; // default port to listen

type Player = "p1" | "p2";

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

type Game = {
    p1Score: number;
    p2Score: number;
}

type TennisGame = GameCreate & {
    gameId: number;
    current: Game;
    finished: boolean;
    sets: TennisSet[];
}

var games: TennisGame[] = [];

const updateGame = (game: TennisGame) => {
    const finished = game.current.p1Score === 5 || game.current.p2Score === 5;
    if(finished) {
        const winner: Player = game.current.p1Score === 5 ? "p1" : "p2";
        const loser: Player = winner === "p1" ? "p2" : "p1";
        game.current.p1Score = 0;
        game.current.p2Score = 0;
        const set = game.sets[game.sets.length - 1]
        set[winner]++;

        if(set[winner] === 6) {
            game.sets.push({
                p1: 0,
                p2: 0
            })
        }
    }
}

// Score map:
// 0 - 0,
// 1 - 15,
// 2 - 30,
// 3 - 40,
// 4 - game point
// 5 - won

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
        },
        finished: false,
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
                    if(game.current.p2Score === 4 && game.current.p1Score === 3) {
                        game.current.p2Score = 3;
                    } else {
                        game.current.p1Score++;
                    }
                    break;
                
                case "p2":
                    if(game.current.p1Score === 4 && game.current.p2Score === 3) {
                        game.current.p1Score = 3;
                    } else {
                        game.current.p2Score++;
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
        res.json({success: true, game})
    } else {
        res.json({success: false, reason: `invalid game ID: ${gid}`})
    }
})

app.listen( port, () => {
    console.log(`Started on port ${port}`);
} );

export default app;

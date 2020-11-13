import request from 'supertest';
import app from '../src/app';

describe('Create game', () => {
  it('should create a new game', async () => {
    const res = await request(app)
      .post("/taas/game/create")
      .send({
        name: "test match kyrgios vs barty",
        players: {
            p1: "kyrgios",
            p2: "barty"
        }
      })
    expect(res.status).toEqual(200)
    expect(res.body).toHaveProperty("gameId")
    expect(res.body.gameId).toEqual(0);
  })
})

describe('Record a point', () => {
  it('should record a point against p1', async () => {
      const res = await request(app)
        .post("/taas/game/create")
        .send({
          name: "test match kyrgios vs barty",
          players: {
              p1: "kyrgios",
              p2: "barty"
          }
      })
      const gid = res.body.gameId
      const res2 = await request(app)
        .post(`/taas/game/${gid}/point/p1`);
      
      expect(res2.status).toEqual(200);
      expect(res2.body).toHaveProperty("success");
      expect(res2.body.success).toBe(true);

      const res3 = await request(app)
        .get(`/taas/game/${gid}`);
      
      expect(res3.status).toEqual(200);
      expect(res3.body).toHaveProperty("game")
      expect(res3.body.game.name).toEqual("test match kyrgios vs barty")
      expect(res3.body.game.finished).toBe(false);
      expect(res3.body.game.currentGame.p1).toEqual("15")
      expect(res3.body.game.currentGame.p2).toEqual("0")
  })
})

describe('Win a set', () => {
  it('should win a set after 5 points', async () => {
      const res = await request(app)
        .post("/taas/game/create")
        .send({
          name: "test match kyrgios vs barty",
          players: {
              p1: "kyrgios",
              p2: "barty"
          }
      })
      const gid = res.body.gameId

      for(let i = 0; i < 5; i++) {
        const res2 = await request(app)
          .post(`/taas/game/${gid}/point/p1`);
        
        expect(res2.status).toEqual(200);
        expect(res2.body).toHaveProperty("success");
        expect(res2.body.success).toBe(true);
      }
      
      const res3 = await request(app)
        .get(`/taas/game/${gid}`);

      expect(res3.status).toEqual(200);
      expect(res3.body).toHaveProperty("game")
      expect(res3.body.game.name).toEqual("test match kyrgios vs barty")
      expect(res3.body.game.sets.length).toEqual(1);
      expect(res3.body.game.sets[0].p1).toEqual(1);
      expect(res3.body.game.sets[0].p2).toEqual(0);
      expect(res3.body.game.finished).toBe(false);
      expect(res3.body.game.currentGame.p1).toEqual("0")
      expect(res3.body.game.currentGame.p2).toEqual("0")
  })
})

describe('Complete a set', () => {
  it('should complete a set after 5*6 points', async () => {
      const res = await request(app)
        .post("/taas/game/create")
        .send({
          name: "test match kyrgios vs barty",
          players: {
              p1: "kyrgios",
              p2: "barty"
          }
      })
      const gid = res.body.gameId

      for(let i = 0; i < (5 * 6); i++) {
        const res2 = await request(app)
          .post(`/taas/game/${gid}/point/p1`);
        
        expect(res2.status).toEqual(200);
        expect(res2.body).toHaveProperty("success");
        expect(res2.body.success).toBe(true);
      }
      
      const res3 = await request(app)
        .get(`/taas/game/${gid}`);

      expect(res3.status).toEqual(200);
      expect(res3.body).toHaveProperty("game")
      expect(res3.body.game.name).toEqual("test match kyrgios vs barty")
      expect(res3.body.game.sets.length).toEqual(2);
      expect(res3.body.game.sets[0].p1).toEqual(6);
      expect(res3.body.game.sets[0].p2).toEqual(0);
      expect(res3.body.game.sets[1].p1).toEqual(0);
      expect(res3.body.game.sets[1].p2).toEqual(0);
      expect(res3.body.game.finished).toBe(false);
      expect(res3.body.game.currentGame.p1).toEqual("0")
      expect(res3.body.game.currentGame.p2).toEqual("0")
  })
})

describe('Finished a game', () => {
  it('should finish a game after 5*5*6 points', async () => {
      const res = await request(app)
        .post("/taas/game/create")
        .send({
          name: "test match kyrgios vs barty",
          players: {
              p1: "kyrgios",
              p2: "barty"
          }
      })
      const gid = res.body.gameId

      for(let i = 0; i < (5 * 5 * 6); i++) {
        const res2 = await request(app)
          .post(`/taas/game/${gid}/point/p1`);
        
        expect(res2.status).toEqual(200);
        expect(res2.body).toHaveProperty("success");
        expect(res2.body.success).toBe(true);
      }
      
      const res3 = await request(app)
        .get(`/taas/game/${gid}`);

      console.log(res3.body);

      expect(res3.status).toEqual(200);
      expect(res3.body).toHaveProperty("game")
      expect(res3.body.game.name).toEqual("test match kyrgios vs barty")
      expect(res3.body.game.sets.length).toEqual(5);
      expect(res3.body.game.finished).toBe(true);
      expect(res3.body.game.winner).toEqual("kyrgios");
      expect(res3.body.game.winnerId).toEqual("p1");
      expect(res3.body.game.currentGame.p1).toEqual("0")
      expect(res3.body.game.currentGame.p2).toEqual("0")
  })
})


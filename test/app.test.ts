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

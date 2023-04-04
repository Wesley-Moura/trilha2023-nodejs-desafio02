import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../src/app'

describe('Users routes', () => {
  beforeAll(async () => {
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  beforeEach(async () => {
    execSync('npm run knex migrate:rollback --all')
    execSync('npm run knex migrate:latest')
  })

  it('Should be able to create a new user', async () => {
    await request(app.server)
      .post('/users')
      .send({
        name: "teste",
        email: "teste@teste.com.br"
      })
      .expect(201)
  })

  it('Should be able to get user metrics', async () => {
    await request(app.server)
    .post('/users')
    .send({
      name: "teste",
      email: "teste@teste.com.br"
    })

    const createSessionResponse = await request(app.server)
      .post('/sessions')
      .send({
        email: "teste@teste.com.br"
      })

    const cookies = createSessionResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: "TESTE 1",
        description: "TESTE 1",
        date: "01/03/2023",
        hour: "12:00",
        inside_diet: true
      })

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: "TESTE 2",
        description: "TESTE 2",
        date: "04/04/2023",
        hour: "12:00",
        inside_diet: true
      })

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: "TESTE 3",
        description: "TESTE 3",
        date: "04/04/2023",
        hour: "12:00",
        inside_diet: true
      })

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: "TESTE 4",
        description: "TESTE 4",
        date: "04/04/2023",
        hour: "12:00",
        inside_diet: false
      })

    const getUserMetricsResponse = await request(app.server)
      .get('/users/metrics')
      .set('Cookie', cookies)

    expect(getUserMetricsResponse.body.metrics).toEqual(
      expect.objectContaining({
        totalMeals: 4,
        totalMealsInsideDiet: 3,
        totalMealsOffDiet: 1,
        betterSequenceMealsInsideDiet: 2
      }),)
  })
})

import { it, expect, beforeAll, afterAll, describe, beforeEach } from 'vitest'
import { execSync } from 'node:child_process'
import request from 'supertest'

import { app } from '../src/app'

describe('Meals routes', () => {
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

  it('Should be able to create a new meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: "teste",
        email: "teste@teste.com.br"
      })

    const cookies = createUserResponse.get('Set-Cookie')

    await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: "TESTE 1",
        description: "TESTE 1",
        date: "01/03/2023",
        hour: "12:00",
        inside_diet: true
      }).expect(201)
  })

  it('Should be able to list all meals', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: "teste",
        email: "teste@teste.com.br"
      })

    const cookies = createUserResponse.get('Set-Cookie')

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
        inside_diet: false
      })
    
    const listMealsResponse = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(listMealsResponse.body.meals).toHaveLength(2)
    expect(listMealsResponse.body.meals).toEqual([
      expect.objectContaining({
        id: expect.any(String),
        name: "TESTE 1",
        description: "TESTE 1",
        date: "01/03/2023",
        hour: "12:00",
        inside_diet: 1,
        user_id: expect.any(String),
      }),
      expect.objectContaining({
        name: "TESTE 2",
        description: "TESTE 2",
        date: "04/04/2023",
        hour: "12:00",
        inside_diet: 0,
        user_id: expect.any(String),
      }),
    ])
  })

  it('Should be able to get a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: "teste",
        email: "teste@teste.com.br"
      })

    const cookies = createUserResponse.get('Set-Cookie')

    const meal = await request(app.server)
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
        inside_diet: false
      })
    
    const mealId = meal.body[0].id

    const getMealResponse = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(getMealResponse.body.meals).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "TESTE 1",
        description: "TESTE 1",
        date: "01/03/2023",
        hour: "12:00",
        inside_diet: 1,
        user_id: expect.any(String),
      })
    )
  })

  it('Should be able to update a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: "teste",
        email: "teste@teste.com.br"
      })

    const cookies = createUserResponse.get('Set-Cookie')

    const createdMeal = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: "TESTE 1",
        description: "TESTE 1",
        date: "01/03/2023",
        hour: "12:00",
        inside_diet: true
      })
    
    const mealId = createdMeal.body[0].id

    await request(app.server)
      .put(`/meals/${mealId}`)
      .set('Cookie', cookies)
      .send({
        name: "TESTE UPDATED",
        description: "TESTE UPDATED",
        date: "04/04/2023",
        hour: "18:00",
        inside_diet: false
      })
    
    const updatedMeal = await request(app.server)
      .get(`/meals/${mealId}`)
      .set('Cookie', cookies)

    expect(updatedMeal.body.meals).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: "TESTE UPDATED",
        description: "TESTE UPDATED",
        date: "04/04/2023",
        hour: "18:00",
        inside_diet: 0,
        user_id: expect.any(String),
      })
    )
  })

  it('Should be able to delete a specific meal', async () => {
    const createUserResponse = await request(app.server)
      .post('/users')
      .send({
        name: "teste",
        email: "teste@teste.com.br"
      })

    const cookies = createUserResponse.get('Set-Cookie')

    const createdMeal = await request(app.server)
      .post('/meals')
      .set('Cookie', cookies)
      .send({
        name: "TESTE 1",
        description: "TESTE 1",
        date: "01/03/2023",
        hour: "12:00",
        inside_diet: true
      })
    
    const mealId = createdMeal.body[0].id
    
    await request(app.server)
      .delete(`/meals/${mealId}`)
      .set('Cookie', cookies)

    const listMeals = await request(app.server)
      .get('/meals')
      .set('Cookie', cookies)

    expect(listMeals.body.meals).toHaveLength(0)
  })
})

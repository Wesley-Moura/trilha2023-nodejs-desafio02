import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/', async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.string().email(),
    })

    const { name, email } = createUserBodySchema.parse(request.body)

    const sessionId = randomUUID()

    reply.cookie('sessionId', sessionId, {
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    })

    await knex('users').insert({
      id: randomUUID(),
      name,
      email,
      session_id: sessionId
    })

    return reply.status(201).send()
  })

  app.get('/metrics', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const { user_id } = request

    const meals = await knex('meals').where({ user_id }).select().orderBy('date', 'first')

    const totalMeals = meals.length

    const fitlerInsideDiet = meals.filter((item) => item.inside_diet)
    const totalMealsInsideDiet = fitlerInsideDiet.length

    const totalMealsOffDiet = meals.reduce((accumulated, current) => {
      const quantity = !current.inside_diet ? 1 : 0
      return accumulated + quantity
    }, 0)

    const arrayAllDates = fitlerInsideDiet.map((item) => {
      return item.date
    })

    const arrayWithoutDuplicatedDate = [...new Set(arrayAllDates)]
    let countDates = []

    for (let date of arrayWithoutDuplicatedDate) {
      const quantitySameDate = fitlerInsideDiet.reduce((accumulated, current) => {
        const quantity = current.date === date ? 1 : 0
        return accumulated + quantity
      }, 0)

      countDates.push(quantitySameDate)
    }

    const betterSequenceMealsInsideDiet = Math.max(...countDates)

    return {
      metrics: {
        totalMeals,
        totalMealsInsideDiet,
        totalMealsOffDiet,
        betterSequenceMealsInsideDiet
      }
    }
  },
)
}
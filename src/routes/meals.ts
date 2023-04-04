import { FastifyInstance } from 'fastify'
import { z } from 'zod'
import { randomUUID } from 'node:crypto'
import { knex } from '../database'
import { checkSessionIdExists } from '../middlewares/check-session-id-exists'

export async function mealsRoutes(app: FastifyInstance) {
  app.get('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
      const { user_id } = request

      const meals = await knex('meals').where('user_id', user_id).select()

      return { meals }
    },
  )

  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { user_id } = request
    const { id } = updateMealParamsSchema.parse(request.params)

    const meals = await knex('meals').where({ id, user_id }).first()

    return { meals }
  },
)

  app.post('/', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      description: z.string(),
      date: z.string(),
      hour: z.string(),
      inside_diet: z.boolean(),
    })

    const { name, description, date, hour, inside_diet } = createUserBodySchema.parse(request.body)
    const { user_id } = request

    const meal = await knex('meals').insert({
      id: randomUUID(),
      user_id,
      name,
      description,
      date,
      hour,
      inside_diet,
    }, ['id'])
  
    return reply.status(201).send(meal)
  })

  app.put('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const updateMealBodySchema = z.object({
      name: z.optional(z.string()),
      description: z.optional(z.string()),
      date: z.optional(z.string()),
      hour: z.optional(z.string()),
      inside_diet: z.optional(z.boolean()),
    })
    const updateMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { name, description, date, hour, inside_diet } = updateMealBodySchema.parse(request.body)
    const { id } = updateMealParamsSchema.parse(request.params)
    const { user_id } = request

    await knex('meals').where({ id, user_id }).update({
      name,
      description,
      date,
      hour,
      inside_diet,
    })

    return reply.status(200).send()
  })

  app.delete('/:id', { preHandler: [checkSessionIdExists] }, async (request, reply) => {
    const deleteMealParamsSchema = z.object({
      id: z.string().uuid(),
    })

    const { id } = deleteMealParamsSchema.parse(request.params)
    const { user_id } = request

    await knex('meals').where({ id, user_id }).delete()

    return reply.status(200).send()
  })
}
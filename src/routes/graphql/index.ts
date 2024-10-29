import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema } from './schemas.js';
import { graphql, parse, validate } from 'graphql';
import depthLimit from 'graphql-depth-limit';
import { schema } from './schema.js';
import { addLoadersToContext } from './loaders.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { prisma } = fastify;

  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req) {
      const { query, variables } = req.body;

      try {

        const parsedQuery = parse(query);

        const depthErrors = validate(schema, parsedQuery, [depthLimit(5)]);
        if (depthErrors.length > 0) {
          return {
            errors: depthErrors.map((error) => ({
              message: error.message,
            })),
          };
        }

        const result = await graphql({
          schema,
          source: query,
          variableValues: variables,
          contextValue: addLoadersToContext(prisma),
        });

        if (result.errors) {
          return { errors: result.errors, prisma };
        }

        return result;
      } catch (error) {
        return { 
          errors: [{ message: 'Internal server error' }], 
          prisma 
        };
      }
    },
  });
};

export default plugin;

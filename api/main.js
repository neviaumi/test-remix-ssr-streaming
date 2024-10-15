import { createServer } from 'node:http';
import {
    createSchema,
    createYoga,Repeater
} from 'graphql-yoga';
import { useDeferStream } from '@graphql-yoga/plugin-defer-stream';
import pokemons from "./pokemon/pokemon.js"
import { setTimeout } from 'node:timers/promises';

function mapToGraphqlResponse(sequence, pokemon) {
    return {
        name: pokemon.Name,
        type: [pokemon['Type 1'],pokemon['Type 2']],
        total: pokemon.Total,
        hp: pokemon.HP,
        attack: pokemon.Attack,
        defense: pokemon.Defense,
        spAtk: pokemon.SpAtk,
        spDef: pokemon.SpDef,
        speed: pokemon.Speed,
        generation: pokemon.Generation,
        legendary: pokemon.Legendary === 'False' ? false : true,
        id: pokemon.id,
        sequence,
    }
}

const yoga = createYoga({
    plugins: [useDeferStream()],
    schema: createSchema({
        resolvers: {
            ListPokemonResult: {
                pokemons: async () => {
                    const gen1Pokemons = pokemons.map((pokemon,sequence) => Object.assign(pokemon, {
                        sequence
                    })).filter(pokemon => pokemon.Generation === "1");
                    return new Repeater(async (push, stop) => {
                        for (const pokemon of gen1Pokemons) {
                            await push(mapToGraphqlResponse(pokemon.sequence, pokemon));
                            await setTimeout(2000);
                        }
                        await stop();
                    })
                }
            },
            GetPokemonResult: {
                next: async ({sequence}) => {
                    await setTimeout(10000);
                    const pokemon = pokemons[sequence + 1];
                    if (!pokemon) {
                        return null;
                    }
                    return mapToGraphqlResponse(sequence+1,pokemon)
                },
                previous: async ({sequence}) => {
                    await setTimeout(10000);
                    const pokemon = pokemons[sequence - 1];
                    if (!pokemon) {
                        return null;
                    }
                    return mapToGraphqlResponse(sequence-1,pokemon)
                }
            },
            Query: {
                pokemon: async (_, { sequence }) => {
                    const pokemon = pokemons[sequence];
                    return {pokemon: mapToGraphqlResponse(sequence, pokemon), sequence};
                },
                pokemons: async () => {
                    const gen1Pokemons = pokemons.filter(pokemon => pokemon.Generation === "1");
                    return {
                        total: gen1Pokemons.length,
                    }

                }
            }
        },
        typeDefs: /* GraphQL */`
            type Pokemon {
                name: String
                type: [String]    
                total: Int
                hp: Int
                attack: Int
                defense: Int
                spAtk: Int
                spDef: Int
                speed: Int
                generation: Int
                legendary: Boolean
                id: ID
                sequence: Int
            }
            type GetPokemonResult {
                previous: Pokemon
                pokemon: Pokemon
                next: Pokemon
            }
            type ListPokemonResult {
                total: Int
                pokemons: [Pokemon]
            }
            type Query {
                pokemons: ListPokemonResult
                pokemon(sequence: Int!): GetPokemonResult
            }
        `
    })
})
const server = createServer(yoga);

server.listen(8080, () => {
    console.log('Server is running on http://localhost:8080/graphql');
})

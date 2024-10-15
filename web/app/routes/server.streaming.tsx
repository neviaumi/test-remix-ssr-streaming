import {gql} from "urql"
import {defer } from "@remix-run/node";
import {useLoaderData ,Await} from "@remix-run/react"
import {Duplex, Readable} from "node:stream";
import {createClient, fetchExchange} from "@urql/core";
import {Suspense} from "react";

const ListPokemons = gql`query ListPokemons {
    pokemons {
        total
        pokemons @stream {
            name
            type
            total
            hp
            attack
            defense
            spAtk
            spDef
            speed
            generation
            legendary
            id
            sequence
        }
    }
}`

export async function loader() {
    const responseStream = new Duplex({
        final() {
            this.push(null);
        },
        objectMode: true,
        read() {},
    });
    const {unsubscribe} = createClient({
        exchanges: [fetchExchange],
        url: 'http://localhost:8080/graphql',
    }).query(ListPokemons,{
    }).subscribe((result) => {
        responseStream.push(result);
        if (!result.hasNext) {
            responseStream.end()
        }
    })
    responseStream.on('end', () => unsubscribe())
    // Without toArray() defer wasn't working as expected
    // return defer({pokemons: Readable.from(responseStream)})
    return defer({pokemons: Readable.from(responseStream).toArray()})
}

export default function StreamingOnServer() {
    const loaderData = useLoaderData<typeof loader>()

    return <Suspense fallback={(<div>Loading...</div>)}>
        <Await resolve={
            loaderData.pokemons
        }>
            {({pokemons}) => {
                return <>
                    {pokemons.map((pokemon: any) => {
                        return <div key={pokemon.id}>
                            <h1>{pokemon.name}</h1>
                            <p>{pokemon.type}</p>
                            <p>{pokemon.total}</p>
                            <p>{pokemon.hp}</p>
                            <p>{pokemon.attack}</p>
                            <p>{pokemon.defense}</p>
                            <p>{pokemon.spAtk}</p>
                            <p>{pokemon.spDef}</p>
                            <p>{pokemon.speed}</p>
                            <p>{pokemon.generation}</p>
                            <p>{pokemon.legendary}</p>
                            <p>{pokemon.id}</p>
                            <p>{pokemon.sequence}</p>
                        </div>
                    })}
                </>
            }}
        </Await>
    </Suspense>

}
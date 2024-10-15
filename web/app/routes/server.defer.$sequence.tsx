import {useLoaderData, Await} from "@remix-run/react"
import {createClient,fetchExchange, gql} from "@urql/core"
import {LoaderFunctionArgs,  defer} from "@remix-run/node"
import {Duplex, Readable} from "node:stream"
import {Suspense} from "react";

const GetPokemon = gql`query GetPokemon($sequence: Int!) {
    pokemon(sequence: $sequence) {
        pokemon {
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
        }
        ... @defer {
            next{
                sequence
                name
            }
            previous {
                sequence
                name
            }
        }
    }
}`

export async function loader({params}: LoaderFunctionArgs) {
    const {sequence} = params
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
    }).query(GetPokemon,{
            sequence: parseInt(sequence!),
    }).subscribe((result) => {
        responseStream.push(result);
        if (!result.hasNext) {
            responseStream.end()
        }
    })
    responseStream.on('end', () => unsubscribe())
    const pokemon = await (new Promise((resolve) => {
        responseStream.once('data', (result) => {
            resolve(result.data.pokemon.pokemon)
        })
    }))
    const sibling = Readable.from(responseStream).toArray().then((result) => {
        const item = result[0]
        return {
            next: item.data.pokemon.next,
            previous: item.data.pokemon.previous
        }
    })
    return defer({data: {pokemon},sibling})
}

export default function ShowPokemons() {
    const loaderData = useLoaderData<typeof loader>()
    if (!loaderData?.data) return null
    const pokemon = loaderData.data.pokemon
    const sibling = loaderData.sibling
    return <div className={'flex gap-4 mx-auto'}>
        <Suspense fallback={(<div>Loading...</div>)}>
            <Await resolve={sibling}>
                {(sibling) => {
                    const previous = sibling.previous
                    if (!previous) return null;
                    return <a href={`/client/defer/${previous.sequence}`}>{previous.name}</a>
                }}
            </Await>
        </Suspense>
            <section>
                <h2>{pokemon.name}</h2>
                <p>Type: {pokemon.type}</p>
                <p>HP: {pokemon.hp}</p>
                <p>Attack: {pokemon.attack}</p>
                <p>Defense: {pokemon.defense}</p>
                <p>Sp. Atk: {pokemon.spAtk}</p>
                <p>Sp. Def: {pokemon.spDef}</p>
                <p>Speed: {pokemon.speed}</p>
                <p>Generation: {pokemon.generation}</p>
                <p>Legendary: {pokemon.legendary ? 'Yes' : 'No'}</p>
            </section>
        <Suspense fallback={(<div>Loading...</div>)}>
            <Await resolve={sibling}>
                {({next}) => {
                    if (!next) return null;
                    return <a href={`/client/defer/${next.sequence}`}>{next.name}</a>
                }}
            </Await>
        </Suspense>
        </div>

}
import {useParams} from "@remix-run/react"
import {useQuery, gql} from "urql"

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

export default function ShowPokemons() {
    const {sequence} = useParams()
    const [result] = useQuery<any, {
        sequence: unknown
    }>({
        query: GetPokemon,
        variables: {
            sequence: parseInt(sequence!),
        }}
    )
    const {data, fetching, error, hasNext} = result
    if (fetching) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>
    const isLoading = hasNext && !fetching

    return (
        <div>
            <div className={'flex gap-4 mx-auto'}>
                {isLoading ? (<div>Loading...</div>): (() => {
                    if (!data.pokemon.previous) return null;
                    return <a href={`/client/defer/${data.pokemon.previous.sequence}`}>{data.pokemon.previous.name}</a>
                })()}
                <section>
                <h2>{data.pokemon.pokemon.name}</h2>
                    <p>Type: {data.pokemon.pokemon.type}</p>
                    <p>HP: {data.pokemon.pokemon.hp}</p>
                    <p>Attack: {data.pokemon.pokemon.attack}</p>
                    <p>Defense: {data.pokemon.pokemon.defense}</p>
                    <p>Sp. Atk: {data.pokemon.pokemon.spAtk}</p>
                    <p>Sp. Def: {data.pokemon.pokemon.spDef}</p>
                    <p>Speed: {data.pokemon.pokemon.speed}</p>
                    <p>Generation: {data.pokemon.pokemon.generation}</p>
                    <p>Legendary: {data.pokemon.pokemon.legendary ? 'Yes' : 'No'}</p>
                </section>
                {isLoading ? (<div>Loading...</div>): (() => {
                    if (!data.pokemon.next) return null;
                    return <a href={`/client/defer/${data.pokemon.next.sequence}`}>{data.pokemon.next.name}</a>
                })()}            </div>

        </div>
    )
}
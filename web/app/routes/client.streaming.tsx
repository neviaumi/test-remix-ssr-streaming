import {gql, useQuery} from "urql"

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

export default function StreamingOnClient() {
    const [result] = useQuery({query: ListPokemons, variables: {}})
    const {data, fetching, error, hasNext} = result

    if (fetching) return <p>Loading...</p>
    if (error) return <p>Error: {error.message}</p>

    const remainingPokemon = hasNext && !fetching && data.pokemons &&data.pokemons.total ? (data.pokemons.total - data.pokemons.pokemons.length)  : 0
    return (
        <div>
            <h1>Pokemons</h1>
            <ul className={'grid grid-cols-4 gap-1'}>
                {data.pokemons.pokemons.map((pokemon) => (
                    <li key={pokemon.name}>
                        <a href={`/client/defer/${pokemon.sequence}`}>
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
                        </a>
                    </li>
                ))}
                {remainingPokemon > 0 && (Array.from({length: remainingPokemon}).map((_, index) => {
                    return <li key={index}>Loading...</li>
                }))}
            </ul>
        </div>
    )
}
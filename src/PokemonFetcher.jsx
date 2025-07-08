import React, { useEffect, useState } from 'react';
import './PokemonFetcher.css';

const PokemonFetcher = () => {
  const [team, setTeam] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState('');
  const [typePokemons, setTypePokemons] = useState([]);
  const [error, setError] = useState(null);

  // Cargar 6 Pokémon aleatorios al inicio
  useEffect(() => {
    const fetchRandomTeam = async () => {
      try {
        const promises = [];
        for (let i = 0; i < 6; i++) {
          const randomId = Math.floor(Math.random() * 151) + 1;
          promises.push(fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`).then(res => res.json()));
        }
        const results = await Promise.all(promises);
        setTeam(results);
      } catch (err) {
        setError('Error al cargar el equipo.');
      }
    };

    fetchRandomTeam();
    fetchTypes();
  }, []);

  // Cargar todos los tipos disponibles
  const fetchTypes = async () => {
    try {
      const response = await fetch('https://pokeapi.co/api/v2/type');
      const data = await response.json();
      const validTypes = data.results.filter(t => !['shadow', 'unknown'].includes(t.name));
      setTypes(validTypes);
    } catch (err) {
      setError('Error al cargar los tipos.');
    }
  };

  // Buscar por tipo cuando el usuario selecciona uno
  const handleTypeChange = async (e) => {
    const type = e.target.value;
    setSelectedType(type);

    if (!type) {
      setTypePokemons([]);
      return;
    }

    try {
      const res = await fetch(`https://pokeapi.co/api/v2/type/${type}`);
      const data = await res.json();
      const pokemons = data.pokemon; // Mostrar todos
      const detailed = await Promise.all(
        pokemons.map(p => fetch(p.pokemon.url).then(r => r.json()))
      );
      setTypePokemons(detailed);
    } catch (err) {
      setError('Error al buscar por tipo.');
    }
  };

  return (
    <div className="pokemon-container">
      <h2>Tu equipo Pokémon aleatorio</h2>
      {error && <div className="error">{error}</div>}
      <div className="pokemon-list">
        {team.map(pokemon => (
          <div className="pokemon-card" key={pokemon.id}>
            <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
            <img src={pokemon.sprites.front_default} alt={pokemon.name} />
            <p><strong>Tipo:</strong> {pokemon.types.map(t => t.type.name).join(', ')}</p>
          </div>
        ))}
      </div>

      <hr style={{ margin: '40px 0' }} />

      <h2>Buscar por tipo</h2>
      <select value={selectedType} onChange={handleTypeChange}>
        <option value="">-- Selecciona un tipo --</option>
        {types.map(t => (
          <option key={t.name} value={t.name}>
            {t.name.charAt(0).toUpperCase() + t.name.slice(1)}
          </option>
        ))}
      </select>

      {selectedType && (
        <>
          <h3>Pokémon de tipo {selectedType}</h3>
          <div className="pokemon-list">
            {typePokemons.map(pokemon => (
              <div className="pokemon-card" key={pokemon.id}>
                <h3>{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                <img src={pokemon.sprites.front_default} alt={pokemon.name} />
                <p><strong>Tipo:</strong> {pokemon.types.map(t => t.type.name).join(', ')}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PokemonFetcher;
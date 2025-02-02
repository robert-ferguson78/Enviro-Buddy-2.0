<script>
    import { ORSService } from '$lib/routeServices/orsService';
    import { orsConfig } from '$lib/routeServices/orsConfig';
    
    let searchText = '';
    let result = null;
    let error = null;
    let loading = false;

    const orsService = new ORSService(orsConfig.apiKey);

    async function handleSearch() {
        loading = true;
        error = null;
        result = null;

        try {
            result = await orsService.geocodeAddress(searchText);
            console.log('Geocoding result:', result);
        } catch (err) {
            error = err.message;
            console.error('Error:', err);
        } finally {
            loading = false;
        }
    }
</script>

<div class="container">
    <h2>Geocoding Test</h2>
    
    <div class="search-box">
        <input
            type="text"
            bind:value={searchText}
            placeholder="Enter location (e.g., Heidelberg, Germany)"
        />
        <button on:click={handleSearch} disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
        </button>
    </div>

    {#if error}
        <div class="error">
            Error: {error}
        </div>
    {/if}

    {#if result}
        <div class="result">
            <h3>Location Found:</h3>
            <p>Name: {result.properties.name}</p>
            <p>Country: {result.properties.country}</p>
            <p>Region: {result.properties.region}</p>
            <p>Coordinates: {result.coordinates[1]}, {result.coordinates[0]}</p>
            <p>Label: {result.properties.label}</p>
        </div>
    {/if}
</div>

<style>
    .container {
        max-width: 600px;
        margin: 2rem auto;
        padding: 1rem;
    }

    .search-box {
        display: flex;
        gap: 1rem;
        margin-bottom: 1rem;
    }

    input {
        flex: 1;
        padding: 0.5rem;
    }

    button {
        padding: 0.5rem 1rem;
    }

    .error {
        color: red;
        margin: 1rem 0;
    }

    .result {
        background: #f5f5f5;
        padding: 1rem;
        border-radius: 4px;
        margin-top: 1rem;
    }

    h3 {
        margin-top: 0;
    }
</style>
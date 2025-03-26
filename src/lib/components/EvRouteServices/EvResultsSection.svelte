<script>
    import { onMount } from 'svelte';
    import { routeStore } from '../../stores/routeStore.svelte.js';
    import { db } from '$lib/firebase/firebase.client';
    import { collection, getDocs, query, where } from 'firebase/firestore';
    
    // State variables
    let vehicles = $state([]);
    let filteredVehicles = $state({});
    let isLoading = $state(true);
    let error = $state(null);
    let activeTab = $state('all');
    let debugInfo = $state(false);
    
    // Get routes from store
    let routes = $derived(routeStore.routes);


    // Track if we've already processed the current routes as i got multiple loadings in console
    let lastProcessedRoutes = $state(null);

    // Fetch vehicles from Firestore
    async function fetchVehicles() {
        console.log('Fetching vehicles from Firestore...');
        isLoading = true;
        error = null;
        
        try {
            console.log('Getting vehicles collection reference');
            const vehiclesRef = collection(db, 'vehicles');
            console.log('Executing vehicles query');
            const vehiclesSnapshot = await getDocs(vehiclesRef);
            console.log(`Found ${vehiclesSnapshot.docs.length} vehicles`);
            
            vehicles = vehiclesSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            
            console.log('Vehicles data:', vehicles.slice(0, 3)); // Log first 3 vehicles to check data
            
            // If no vehicles found, create some dummy data for testing
            if (vehicles.length === 0) {
                console.log('No vehicles found, creating dummy data');
                vehicles = createDummyVehicles();
            }
            
            // Filter vehicles for each day
            console.log('Filtering vehicles for routes');
            filterVehiclesForRoutes();
            isLoading = false;
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            error = 'Failed to load vehicle data. Please try again.';
            isLoading = false;
            
            // Try to create dummy data as fallback
            console.log('Creating dummy vehicles as fallback');
            vehicles = createDummyVehicles();
            filterVehiclesForRoutes();
        }
    }
    
    // Dummy vehicle data for testing before database fetching
    function createDummyVehicles() {
        console.log('Creating dummy vehicles');
        return [
            {
                id: 'dummy1',
                brand: 'Tesla',
                model: 'Model 3',
                variant: 'Long Range',
                wltp_range_km: 560,
                usable_battery_size: 75,
                body_type: 'Sedan',
                release_year: 2023
            },
            {
                id: 'dummy2',
                brand: 'Volkswagen',
                model: 'ID.4',
                variant: 'Pro',
                wltp_range_km: 450,
                usable_battery_size: 77,
                body_type: 'SUV',
                release_year: 2022
            },
            {
                id: 'dummy3',
                brand: 'Hyundai',
                model: 'Ioniq 5',
                variant: 'Long Range AWD',
                wltp_range_km: 430,
                usable_battery_size: 72.6,
                body_type: 'Crossover',
                release_year: 2022
            },
            {
                id: 'dummy4',
                brand: 'Kia',
                model: 'EV6',
                variant: 'GT',
                wltp_range_km: 380,
                usable_battery_size: 77.4,
                body_type: 'Crossover',
                release_year: 2022
            },
            {
                id: 'dummy5',
                brand: 'Ford',
                model: 'Mustang Mach-E',
                variant: 'Extended Range',
                wltp_range_km: 490,
                usable_battery_size: 88,
                body_type: 'SUV',
                release_year: 2022
            }
        ];
    }

    // Calculate total weekly distance
    function calculateTotalWeeklyDistance() {
        return Object.values(routes)
            .filter(dayData => dayData.route)
            .reduce((total, dayData) => {
                return total + parseFloat(dayData.route.distanceKm || 0);
            }, 0)
            .toFixed(1); // Format to 1 decimal place
    }
    
    // Filter vehicles based on route distances
    function filterVehiclesForRoutes() {
        console.log('Starting to filter vehicles for routes');
        // Create a string representation of the current routes for comparison
        const routesSnapshot = JSON.stringify(
            Object.entries(routes)
                .filter(([_, dayData]) => dayData.route)
                .map(([day, data]) => ({
                    day,
                    distance: data.route?.distanceKm
                }))
        );
        
        // If we've already processed these exact routes, skip processing
        if (lastProcessedRoutes === routesSnapshot) {
            console.log('Routes unchanged, skipping re-filtering');
            return;
        }
        
        // Update the last processed routes
        lastProcessedRoutes = routesSnapshot;
        
        console.log('Routes data:', routes);
        
        // Initialize filtered vehicles object
        filteredVehicles = {};
        
        // For each day of the week
        Object.entries(routes).forEach(([day, dayData]) => {
            // Skip days without routes
            if (!dayData.route) {
                console.log(`Day ${day} has no route, skipping`);
                return;
            }
            
            console.log(`Filtering vehicles for ${day} with distance ${dayData.route.distanceKm}km`);
            
            // Get the day's distance
            const dayDistance = parseFloat(dayData.route.distanceKm);
            
            // Filter vehicles that can handle this day's distance
            filteredVehicles[day] = vehicles.filter(vehicle => {
                // Check if vehicle has wltp_range_km and it's greater than the day's distance
                const canHandle = vehicle.wltp_range_km && vehicle.wltp_range_km > dayDistance;
                return canHandle;
            }).sort((a, b) => {
                // Sort by range efficiency (range divided by battery size)
                const efficiencyA = a.wltp_range_km / (a.usable_battery_size || 1);
                const efficiencyB = b.wltp_range_km / (b.usable_battery_size || 1);
                return efficiencyB - efficiencyA;
            });
            
            console.log(`Found ${filteredVehicles[day].length} vehicles for ${day}`);
        });
        
        // Create an "all" category for vehicles that can handle the total weekly distance
        const daysWithRoutes = Object.entries(routes)
            .filter(([_, dayData]) => dayData.route)
            .map(([day, _]) => day);
        
        console.log(`Days with routes: ${daysWithRoutes.join(', ')}`);
        
        if (daysWithRoutes.length > 0) {
            // Calculate total weekly distance
            const totalWeeklyDistance = parseFloat(calculateTotalWeeklyDistance());
            console.log(`Total weekly distance: ${totalWeeklyDistance} km`);
            
            // Filter vehicles that can handle the total weekly distance
            filteredVehicles.all = vehicles.filter(vehicle => {
                return vehicle.wltp_range_km && vehicle.wltp_range_km > totalWeeklyDistance;
            }).sort((a, b) => {
                // Sort by range efficiency (range divided by battery size)
                const efficiencyA = a.wltp_range_km / (a.usable_battery_size || 1);
                const efficiencyB = b.wltp_range_km / (b.usable_battery_size || 1);
                return efficiencyB - efficiencyA;
            });
            
            console.log(`Found ${filteredVehicles.all.length} vehicles that can handle the total weekly distance of ${totalWeeklyDistance} km`);
        }
    }
    
    // Set active tab
    function setActiveTab(tab) {
        console.log(`Setting active tab to ${tab}`);
        activeTab = tab;
    }
    
    // Format range with 1 decimal place
    function formatRange(range) {
        return parseFloat(range).toFixed(1);
    }
    
    // Calculate and format efficiency (km per kWh)
    function calculateEfficiency(range, batterySize) {
        if (!range || !batterySize) return 'N/A';
        return (range / batterySize).toFixed(1);
    }
    
    // Toggle debug info
    function toggleDebugInfo() {
        debugInfo = !debugInfo;
    }
    
    // Load vehicles when component mounts
    onMount(() => {
        console.log('EvResultsSection component mounted');
        fetchVehicles();
    });
    
    // Re-filter vehicles when routes change
    $effect(() => {
        // Only re-filter when routes actually change
        const routesWithDistances = Object.entries(routes)
            .filter(([_, dayData]) => dayData.route)
            .map(([day, data]) => ({
                day,
                distance: data.route?.distanceKm
            }));
            
        console.log('Routes changed, re-filtering vehicles');
        if (vehicles.length > 0) {
            filterVehiclesForRoutes();
        }
    });
</script>
    
<div id="ev-results-section" class="ev-results-section">
    <h2>Electric Vehicles for Your Routes</h2>
    
    <button class="debug-button" onclick={toggleDebugInfo}>
        {debugInfo ? 'Hide Debug Info' : 'Show Debug Info'}
    </button>
    
    {#if debugInfo}
        <div class="debug-info">
            <h3>Debug Information</h3>
            <p>Vehicles loaded: {vehicles.length}</p>
            <p>Days with routes:</p>
            <ul>
                {#each Object.entries(routes) as [day, dayData]}
                    <li>
                        {day}: {dayData.route ? `${dayData.route.distanceKm} km` : 'No route'} 
                        ({dayData.waypoints.length} waypoints)
                    </li>
                {/each}
            </ul>
            <p>Filtered vehicles:</p>
            <ul>
                {#each Object.entries(filteredVehicles) as [day, dayVehicles]}
                    <li>{day}: {dayVehicles.length} vehicles</li>
                {/each}
            </ul>
        </div>
    {/if}
    
    {#if isLoading}
        <div class="loading">Loading vehicle data...</div>
    {:else if error}
        <div class="error">{error}</div>
    {:else}
        <div class="tabs">
            <button
                class:active={activeTab === 'all'}
                onclick={() => setActiveTab('all')}
            >
                All Routes
                <span class="day-distance">({calculateTotalWeeklyDistance()} km)</span>
            </button>
            {#each Object.entries(routes).filter(([_, dayData]) => dayData.route) as [day, dayData]}
                <button
                    class:active={activeTab === day}
                    onclick={() => setActiveTab(day)}
                    style="--day-color: {dayData.color}"
                >
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                    <span class="day-distance">({dayData.route.distanceKm} km)</span>
                </button>
            {/each}
        </div>
        <div class="results-container">
            {#if activeTab === 'all'}
                <h3>Vehicles Suitable for All Routes</h3>
                {#if filteredVehicles.all && filteredVehicles.all.length > 0}
                    <div class="vehicles-grid">
                        {#each filteredVehicles.all as vehicle}
                            <div class="vehicle-card">
                                <h4>{vehicle.brand} {vehicle.model} {vehicle.variant}</h4>
                                <div class="vehicle-details">
                                    <p><strong>Range:</strong> {formatRange(vehicle.wltp_range_km)} km</p>
                                    <p><strong>Battery:</strong> {vehicle.usable_battery_size} kWh</p>
                                    <p><strong>Efficiency:</strong> {calculateEfficiency(vehicle.wltp_range_km, vehicle.usable_battery_size)} km/kWh</p>
                                    <p><strong>Body Type:</strong> {vehicle.body_type}</p>
                                    <p><strong>Year:</strong> {vehicle.release_year}</p>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="no-results">No vehicles found that can handle all routes. Try viewing individual days.</p>
                {/if}
            {:else}
                <h3>Vehicles Suitable for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}'s Route ({routes[activeTab].route.distanceKm} km)</h3>
                {#if filteredVehicles[activeTab] && filteredVehicles[activeTab].length > 0}
                    <div class="vehicles-grid">
                        {#each filteredVehicles[activeTab] as vehicle}
                            <div class="vehicle-card">
                                <h4>{vehicle.brand} {vehicle.model} {vehicle.variant}</h4>
                                <div class="vehicle-details">
                                    <p><strong>Range:</strong> {formatRange(vehicle.wltp_range_km)} km</p>
                                    <p><strong>Battery:</strong> {vehicle.usable_battery_size} kWh</p>
                                    <p><strong>Efficiency:</strong> {calculateEfficiency(vehicle.wltp_range_km, vehicle.usable_battery_size)} km/kWh</p>
                                    <p><strong>Body Type:</strong> {vehicle.body_type}</p>
                                    <p><strong>Year:</strong> {vehicle.release_year}</p>
                                </div>
                            </div>
                        {/each}
                    </div>
                {:else}
                    <p class="no-results">No vehicles found for this route.</p>
                {/if}
            {/if}
        </div>
    {/if}
</div>
    
<style>
    .ev-results-section {
        margin-top: 2rem;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    
    h2 {
        margin-top: 0;
        margin-bottom: 1.5rem;
        color: #333;
        text-align: center;
    }
    
    h3 {
        margin-bottom: 1rem;
        color: #495057;
    }
    
    .loading, .error, .no-results {
        text-align: center;
        padding: 2rem;
        color: #6c757d;
    }
    
    .error {
        color: #dc3545;
    }
    
    .tabs {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1.5rem;
    }
    
    .tabs button {
        padding: 0.5rem 1rem;
        background: #e9ecef;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.9rem;
        border-left: 4px solid var(--day-color, #6c757d);
    }
    
    .tabs button.active {
        background: var(--day-color, #007bff);
        color: white;
    }
    
    .day-distance {
        font-size: 0.8rem;
        opacity: 0.8;
    }
    
    .vehicles-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 1rem;
    }
    
    .vehicle-card {
        background: white;
        border-radius: 8px;
        padding: 1rem;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        transition: transform 0.2s ease;
    }
    
    .vehicle-card:hover {
        transform: translateY(-3px);
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    }
        
        .vehicle-card h4 {
        margin-top:0;    
        margin-bottom: 0.75rem;
        color: #343a40;
        font-size: 1.1rem;
    }
    
    .vehicle-details {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0.5rem;
    }
    
    .vehicle-details p {
        margin: 0;
        font-size: 0.9rem;
        color: #495057;
    }
    
    .debug-button {
        position: absolute;
        top: 1rem;
        right: 1rem;
        padding: 0.3rem 0.6rem;
        background: #6c757d;
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 0.8rem;
        cursor: pointer;
    }
    
    .debug-info {
        background: #f1f1f1;
        padding: 1rem;
        margin-bottom: 1rem;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.9rem;
    }
    
    @media (max-width: 768px) {
        .vehicles-grid {
            grid-template-columns: 1fr;
        }
        
        .tabs {
            flex-direction: column;
        }
    }
</style>
<script>
	import { onMount } from 'svelte';
	import { routeStore } from '../../stores/routeStore.svelte.js';
	import { db } from '$lib/firebase/firebase.client';
	import { collection, getDocs, query, where } from 'firebase/firestore';
	import EvDetailView from './EvDetailView.svelte';

	// State variables
	let vehicles = $state([]);
	let filteredVehicles = $state({});
	let isLoading = $state(true);
	let error = $state(null);
	let activeTab = $state('all');
	let debugInfo = $state(false);
	let selectedVehicle = $state(null);

	// Filter state
	let selectedBodyTypes = $state([]);
	let availableBodyTypes = $state([]);

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

			vehicles = vehiclesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));

			console.log('Vehicles data:', vehicles.slice(0, 3)); // Log first 3 vehicles to check data

			// Extract unique body types
			availableBodyTypes = [...new Set(vehicles.map((v) => v.body_type).filter(Boolean))].sort();
			console.log('Available body types:', availableBodyTypes);

			// If no vehicles found, create some dummy data for testing
			if (vehicles.length === 0) {
				console.log('No vehicles found, creating dummy data');
				vehicles = createDummyVehicles();
				availableBodyTypes = [...new Set(vehicles.map((v) => v.body_type).filter(Boolean))].sort();
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
			availableBodyTypes = [...new Set(vehicles.map((v) => v.body_type).filter(Boolean))].sort();
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

	// Toggle body type selection
	function toggleBodyType(bodyType) {
		if (selectedBodyTypes.includes(bodyType)) {
			selectedBodyTypes = selectedBodyTypes.filter((type) => type !== bodyType);
		} else {
			selectedBodyTypes = [...selectedBodyTypes, bodyType];
		}
		// Re-filter vehicles when body type selection changes
		filterVehiclesForRoutes();
	}

	// Calculate total weekly distance
	function calculateTotalWeeklyDistance() {
		return Object.values(routes)
			.filter((dayData) => dayData.route)
			.reduce((total, dayData) => {
				return total + parseFloat(dayData.route.distanceKm || 0);
			}, 0)
			.toFixed(1); // Format to 1 decimal place
	}

	// Filter vehicles based on route distances and body types
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

		// If we've already processed these exact routes, skip processing, added boduy type also
		const bodyTypesSnapshot = JSON.stringify(selectedBodyTypes.sort());
		const currentSnapshot = routesSnapshot + bodyTypesSnapshot;

		if (lastProcessedRoutes === currentSnapshot) {
			console.log('Routes and filters unchanged, skipping re-filtering');
			return;
		}

		// Update the last processed routes and filters
		lastProcessedRoutes = currentSnapshot;
		console.log('Routes data:', routes);
		console.log('Selected body types:', selectedBodyTypes);

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

			// Filter vehicles that can handle this day's distance and match selected body types
			filteredVehicles[day] = vehicles
				.filter((vehicle) => {
					// Check if vehicle has wltp_range_km and it's greater than the day's distance
					const meetsRangeRequirement =
						vehicle.wltp_range_km && vehicle.wltp_range_km > dayDistance;

					// Check if vehicle matches body type filter (if any are selected)
					const meetsBodyTypeRequirement =
						selectedBodyTypes.length === 0 || selectedBodyTypes.includes(vehicle.body_type);

					return meetsRangeRequirement && meetsBodyTypeRequirement;
				})
				.sort((a, b) => {
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

			// Filter vehicles that can handle the total weekly distance and match body type
			filteredVehicles.all = vehicles
				.filter((vehicle) => {
					const meetsRangeRequirement =
						vehicle.wltp_range_km && vehicle.wltp_range_km > totalWeeklyDistance;
					const meetsBodyTypeRequirement =
						selectedBodyTypes.length === 0 || selectedBodyTypes.includes(vehicle.body_type);

					return meetsRangeRequirement && meetsBodyTypeRequirement;
				})
				.sort((a, b) => {
					// Sort by range efficiency (range divided by battery size)
					const efficiencyA = a.wltp_range_km / (a.usable_battery_size || 1);
					const efficiencyB = b.wltp_range_km / (b.usable_battery_size || 1);
					return efficiencyB - efficiencyA;
				});

			console.log(
				`Found ${filteredVehicles.all.length} vehicles that can handle the total weekly distance of ${totalWeeklyDistance} km`
			);
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

	// Clear all body type filters
	function clearBodyTypeFilters() {
		selectedBodyTypes = [];
		filterVehiclesForRoutes();
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

	// Show vehicle details
	function showVehicleDetails(vehicle) {
		selectedVehicle = vehicle;
	}

	// Hide vehicle details
	function closeVehicleDetails() {
		selectedVehicle = null;
	}

	// Assign body types to icon images
	function getBodyTypeImage(bodyType) {
	const bodyTypeMap = {
		'City Car': '/images/city-car.png',
		'Convertible': '/images/convertible.png',
		'Crossover': '/images/crossover.png',
		'Fastback': '/images/fastback.png',
		'Hatchback': '/images/hatchback.png',
		'Quadricycle': '/images/quadricycle.png',
		'SUV': '/images/suv.png',
		'SUV Coupe': '/images/suv-coupe.png',
		'Saloon': '/images/saloon.png',
		'Sedan': '/images/saloon.png', // Adding Sedan as an alias for Saloon
		'Van': '/images/van.png'
	};
	
	return bodyTypeMap[bodyType] || '/images/default-image-car.png'; // Default image if body type not found
	}

</script>

{#if selectedVehicle}
	<EvDetailView vehicle={selectedVehicle} onClose={closeVehicleDetails} />
{/if}

<div id="ev-results-section" class="ev-results-section">
	<h2>Electric Vehicles for Your Routes</h2>

	<!-- <button class="debug-button" onclick={toggleDebugInfo}>
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
			<p>Total weekly distance: {calculateTotalWeeklyDistance()} km</p>
			<p>Selected body types: {selectedBodyTypes.length ? selectedBodyTypes.join(', ') : 'None'}</p>
			<p>Filtered vehicles:</p>
			<ul>
				{#each Object.entries(filteredVehicles) as [day, dayVehicles]}
					<li>{day}: {dayVehicles.length} vehicles</li>
				{/each}
			</ul>
		</div>
	{/if} -->

	{#if isLoading}
		<div class="loading">Loading vehicle data...</div>
	{:else if error}
		<div class="error">{error}</div>
	{:else}
		<div class="filter-section">
			<h3>Filter by Body Type</h3>
			<div class="body-type-filters">
				{#each availableBodyTypes as bodyType}
					<button
						class:active={selectedBodyTypes.includes(bodyType)}
						onclick={() => toggleBodyType(bodyType)}
					>
						<div class="filter-image">
							<img src={getBodyTypeImage(bodyType)} alt={bodyType} />
						</div>
						<span>{bodyType}</span>
					</button>
				{/each}
				{#if selectedBodyTypes.length > 0}
					<button class="clear-filters" onclick={clearBodyTypeFilters}> Clear Filters </button>
				{/if}
			</div>
		</div>

		<div class="tabs">
			<button class:active={activeTab === 'all'} onclick={() => setActiveTab('all')}>
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
				<h3>
					Vehicles Suitable for All Routes (Total: {calculateTotalWeeklyDistance()} km)
					{#if selectedBodyTypes.length > 0}
						<span class="filter-tag">Filtered by: {selectedBodyTypes.join(', ')}</span>
					{/if}
				</h3>
				{#if filteredVehicles.all && filteredVehicles.all.length > 0}
					<div class="vehicles-grid">
						{#each filteredVehicles.all as vehicle}
							<div class="vehicle-card" onclick={() => showVehicleDetails(vehicle)}>
								<div class="card-header">
									<h4>{vehicle.brand} {vehicle.model} {vehicle.variant}</h4>
									<div class="body-type-image">
										<img src={getBodyTypeImage(vehicle.body_type)} alt={vehicle.body_type} />
									</div>
								</div>
								<div class="vehicle-details">
									<p><strong>Range:</strong> {formatRange(vehicle.wltp_range_km)} km</p>
									<p><strong>Battery:</strong> {vehicle.usable_battery_size} kWh</p>
									<p>
										<strong>Efficiency:</strong>
										{calculateEfficiency(vehicle.wltp_range_km, vehicle.usable_battery_size)} km/kWh
									</p>
									<p><strong>Body Type:</strong> {vehicle.body_type}</p>
									<p><strong>Year:</strong> {vehicle.release_year}</p>
								</div>
								<div class="view-details">View Details</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="no-results">
						No vehicles found that can handle the total weekly distance
						{#if selectedBodyTypes.length > 0}
							with the selected body type(s)
						{/if}. Try viewing individual days or adjusting your filters.
					</p>
				{/if}
			{:else}
				<h3>
					Vehicles Suitable for {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}'s Route ({routes[
						activeTab
					].route.distanceKm} km)
					{#if selectedBodyTypes.length > 0}
						<span class="filter-tag">Filtered by: {selectedBodyTypes.join(', ')}</span>
					{/if}
				</h3>
				{#if filteredVehicles[activeTab] && filteredVehicles[activeTab].length > 0}
					<div class="vehicles-grid">
						{#each filteredVehicles[activeTab] as vehicle}
							<div class="vehicle-card" onclick={() => showVehicleDetails(vehicle)}>
								<div class="card-header">
									<h4>{vehicle.brand} {vehicle.model} {vehicle.variant}</h4>
									<div class="body-type-image">
										<img src={getBodyTypeImage(vehicle.body_type)} alt={vehicle.body_type} />
									</div>
								</div>
								<div class="vehicle-details">
									<p><strong>Range:</strong> {formatRange(vehicle.wltp_range_km)} km</p>
									<p><strong>Battery:</strong> {vehicle.usable_battery_size} kWh</p>
									<p>
										<strong>Efficiency:</strong>
										{calculateEfficiency(vehicle.wltp_range_km, vehicle.usable_battery_size)} km/kWh
									</p>
									<p><strong>Body Type:</strong> {vehicle.body_type}</p>
									<p><strong>Year:</strong> {vehicle.release_year}</p>
								</div>
								<div class="view-details">View Details</div>
							</div>
						{/each}
					</div>
				{:else}
					<p class="no-results">
						No vehicles found for this route
						{#if selectedBodyTypes.length > 0}
							with the selected body type(s)
						{/if}. Try adjusting your filters.
					</p>
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
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.filter-tag {
		font-size: 0.8rem;
		font-weight: normal;
		background: #e9ecef;
		padding: 0.2rem 0.5rem;
		border-radius: 4px;
		color: #495057;
	}

	.loading,
	.error,
	.no-results {
		text-align: center;
		padding: 2rem;
		color: #6c757d;
	}

	.error {
		color: #dc3545;
	}

	.filter-section {
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: #e9ecef;
		border-radius: 8px;
	}

	.filter-section h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}

	.body-type-filters {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
	}

	.body-type-filters button {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 0.5rem;
		background: #f8f9fa;
		border: 1px solid #ced4da;
		border-radius: 8px;
		cursor: pointer;
		font-size: 0.9rem;
		transition: all 0.2s ease;
		min-width: 130px;
	}

	.body-type-filters button.active {
		background: #007bff;
		color: white;
		border-color: #0056b3;
	}

	.body-type-filters button:hover:not(.active) {
		background: #e2e6ea;
	}

	.filter-image {
		width: 130px;
		height: 60px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-bottom: 0.3rem;
	}

	.filter-image img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.body-type-filters button.active .filter-image img {
		/* Optional: Apply a filter to make the image white when button is active */
		filter: brightness(0) invert(1);
	}

	.clear-filters {
		background: #6c757d !important;
		color: white !important;
		/* Make the clear filters button different */
		flex-direction: row !important;
		min-width: 100px !important;
	}

	.tabs {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		margin-bottom: 1.5rem;
	}

	.tabs button {
		flex: 1 1 0; /* This makes all buttons grow equally */
		min-width: 120px; /* Minimum width to prevent too narrow buttons */
		padding: 0.5rem 1rem;
		background: #e9ecef;
		border: none;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
		border-left: 4px solid var(--day-color, #6c757d);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		text-align: center;
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
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
		transition: transform 0.2s ease;
	}

	.vehicle-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
	}

	.vehicle-card h4 {
		margin-top: 0;
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

	.card-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.75rem;
		border-bottom: 1px solid #eee;
		padding-bottom: 0;
	}

	.card-header h4 {
		margin: 0;
		flex: 1;
		font-size: 1.1rem;
		color: #343a40;
	}

	.body-type-image {
		width: 140px;
		height: 55px;
		display: flex;
		justify-content: center;
		align-items: center;
		margin-left: 10px;
	}

	.body-type-image img {
		max-width: 100%;
		max-height: 100%;
		object-fit: contain;
	}

	.vehicle-card {
		cursor: pointer;
		position: relative;
		overflow: hidden;
	}

	.vehicle-card:hover {
		transform: translateY(-3px);
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}

	.view-details {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: rgba(0, 123, 255, 0.8);
		color: white;
		text-align: center;
		padding: 0.5rem;
		transform: translateY(100%);
		transition: transform 0.3s ease;
	}

	.vehicle-card:hover .view-details {
		transform: translateY(0);
	}

	@media (max-width: 768px) {
		.tabs button {
			flex: 1 1 calc(50% - 0.5rem); /* Two buttons per row on smaller screens */
		}
		.vehicles-grid {
			grid-template-columns: 1fr;
		}

		.tabs {
			flex-direction: column;
		}

		.body-type-filters {
			flex-direction: column;
		}
	}
	@media (max-width: 480px) {
		.tabs button {
			flex: 1 1 100%; /* Full width on very small screens */
		}
	}
</style>

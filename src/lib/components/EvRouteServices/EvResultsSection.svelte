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
	let selectedWeatherRange = $state('wltp_range_km'); // Set default to WLTP Range

	// Filter state
	let selectedBodyTypes = $state([]);
	let availableBodyTypes = $state([]);

	// Get routes from store
	let routes = $derived(routeStore.routes);

	// Track if we've already processed the current routes as i got multiple loadings in console
	let lastProcessedRoutes = $state(null);

	// Weather range options
    const weatherRangeOptions = [
        { key: 'wltp_range_km', label: 'WLTP Range' },
        { key: 'cold', label: 'Cold Weather Range' },
        { key: 'mild', label: 'Mild Weather Range' },
        { key: 'warm', label: 'Warm Weather Range' }
    ];

	// Calculate remaining battery percentage
	function calculateRemainingBattery(vehicle, distance, weatherType, include15MinCharge) {
		// console.log(`--- Battery Calculation for ${vehicle.brand} ${vehicle.model} ---`);
		// console.log(`Distance: ${distance} km`);
		// console.log(`Weather Type: ${weatherType}`);
		// console.log(`Include 15-min Charge: ${include15MinCharge}`);
  
		// Get range based on weather conditions
		let effectiveRange = vehicle.wltp_range_km;
		
		if (weatherType === 'wltp_range_km') {
			effectiveRange = vehicle.wltp_range_km;
		} else {
			// Extract the actual weather type (cold, mild, warm)
			const actualWeatherType = weatherType.includes('.')
			? weatherType.split('.')[1]
			: weatherType;
			
			// Access the weather range through the weather_ranges object
			effectiveRange = vehicle.weather_ranges?.[actualWeatherType] || vehicle.wltp_range_km * 0.8;
		}
		
		// console.log(`Effective Range (without 15-min charge): ${effectiveRange} km`);
		
		// Calculate total range including 15-min charge if enabled
		let totalRange = effectiveRange;
		if (include15MinCharge) {
			// get15MinChargeRange
			const chargeRange = get15MinChargeRange(vehicle);
			// console.log(`15-min Charge Range: ${chargeRange} km`);
			totalRange = effectiveRange + chargeRange;
			// console.log(`Total Range (with 15-min charge): ${totalRange} km`);
		}
		
		// Calculate battery percentage based on the total range
		const batteryUsedPercent = (distance / totalRange) * 100;
		// console.log(`Battery Used %: ${batteryUsedPercent.toFixed(1)}%`);
		
		// Calculate remaining battery percentage
		let remainingBatteryPercent = 100 - batteryUsedPercent;
		// console.log(`Remaining Battery % (before clamping): ${remainingBatteryPercent.toFixed(1)}%`);
		
		// Ensure the percentage is between 0 and 100 to stop over 100% values eg 122%
		remainingBatteryPercent = Math.max(0, Math.min(100, remainingBatteryPercent));
		// console.log(`Final Remaining Battery % (after clamping): ${remainingBatteryPercent.toFixed(1)}%`);
		
		// Return formatted to 1 decimal place
		return remainingBatteryPercent.toFixed(1);
	}

	// Function to check if battery is unhealthy/low (below 20%)
	function isBatteryCritical(remainingPercent) {
		return parseFloat(remainingPercent) < 20;
	}

	// Fetch vehicles from Firestore
	async function fetchVehicles() {
		// console.log('Fetching vehicles from Firestore...');
		isLoading = true;
		error = null;

		try {
			// console.log('Getting vehicles collection reference');
			const vehiclesRef = collection(db, 'vehicles');
			// console.log('Executing vehicles query');
			const vehiclesSnapshot = await getDocs(vehiclesRef);
			// console.log(`Found ${vehiclesSnapshot.docs.length} vehicles`);

			vehicles = vehiclesSnapshot.docs.map((doc) => ({
				id: doc.id,
				...doc.data()
			}));

			// console.log('Vehicles data:', vehicles.slice(0, 3)); // Log first 3 vehicles to check data

			// Extract unique body types
			availableBodyTypes = [...new Set(vehicles.map((v) => v.body_type).filter(Boolean))].sort();
			// console.log('Available body types:', availableBodyTypes);

			// If no vehicles found, create some dummy data for testing
			if (vehicles.length === 0) {
				// console.log('No vehicles found, creating dummy data');
				vehicles = createDummyVehicles();
				availableBodyTypes = [...new Set(vehicles.map((v) => v.body_type).filter(Boolean))].sort();
			}

			// Filter vehicles for each day
			// console.log('Filtering vehicles for routes');
			filterVehiclesForRoutes();
			isLoading = false;
		} catch (err) {
			console.error('Error fetching vehicles:', err);
			error = 'Failed to load vehicle data. Please try again.';
			isLoading = false;

			// Try to create dummy data as fallback
			// console.log('Creating dummy vehicles as fallback');
			vehicles = createDummyVehicles();
			availableBodyTypes = [...new Set(vehicles.map((v) => v.body_type).filter(Boolean))].sort();
			filterVehiclesForRoutes();
		}
	}

	// Dummy vehicle data for testing before database fetching
	function createDummyVehicles() {
		// console.log('Creating dummy vehicles');
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

	// Add new state for 15-minute charge feature
	let include15MinCharge = $state(false);
	
	// Function to toggle 15-minute charge feature
	function toggle15MinCharge() {
		include15MinCharge = !include15MinCharge;
		filterVehiclesForRoutes();
	}
	
	// Get 15-minute charge range from vehicle data
	function get15MinChargeRange(vehicle) {
		// console.log(`Calculating 15-min charge range for ${vehicle.brand} ${vehicle.model}`);
		
		// Use the pre-calculated value if available
		if (vehicle.fast_charge_range_15min) {
			// console.log(`Using pre-calculated value: ${vehicle.fast_charge_range_15min} km`);
			return vehicle.fast_charge_range_15min;
		}
		
		// Fallback calculation if the pre-calculated value is not available
		const efficiency = vehicle.wltp_range_km / (vehicle.usable_battery_size || 1);
		// console.log(`Efficiency: ${efficiency.toFixed(2)} km/kWh`);
		
		const typicalChargingRate = Math.min(150, (vehicle.usable_battery_size || 60) * 2);
		// console.log(`Typical charging rate: ${typicalChargingRate} kW`);
		
		const chargeAdded = typicalChargingRate * 0.25 * 0.9; // kWh added in 15 minutes at 90% efficiency
		// console.log(`Charge added in 15 min: ${chargeAdded.toFixed(2)} kWh`);
		
		const rangeAdded = chargeAdded * efficiency;
		// console.log(`Range added in 15 min: ${rangeAdded.toFixed(2)} km`);
	
		return rangeAdded;
	}

	
	// Get total range including 15-minute charge
	function getTotalRange(vehicle, rangeType = 'wltp_range_km') {
		// console.log(`Getting total range for ${vehicle.brand} ${vehicle.model}`);
		// console.log(`Range type: ${rangeType}`);
		
		let baseRange;
		// Extract the actual range key
		const actualRangeType = rangeType.includes('.') ? rangeType.split('.')[1] : rangeType;
		// console.log(`Actual range type: ${actualRangeType}`);
		
		if (actualRangeType === 'wltp_range_km') {
			baseRange = vehicle.wltp_range_km;
		} else {
			baseRange = vehicle.weather_ranges?.[actualRangeType] || vehicle.wltp_range_km;
		}
		// console.log(`Base range: ${baseRange} km`);
		
		if (!include15MinCharge) {
			// console.log(`15-min charge not included, returning base range: ${baseRange} km`);
			return baseRange;
		}
		
		const chargeRange = get15MinChargeRange(vehicle);
		// console.log(`15-min charge range: ${chargeRange} km`);
		
		const totalRange = baseRange + chargeRange;
		// console.log(`Total range (with 15-min charge): ${totalRange} km`);
		
		return totalRange;
	}

	
	// Filter vehicles based on route distances and body types
	function filterVehiclesForRoutes() {
		// console.log('Starting to filter vehicles for routes');
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
		const weatherRangeSnapshot = selectedWeatherRange || 'default';
		const chargeSnapshot = include15MinCharge ? 'with15min' : 'no15min';
		const currentSnapshot = routesSnapshot + bodyTypesSnapshot + weatherRangeSnapshot + chargeSnapshot;

		if (lastProcessedRoutes === currentSnapshot) {
			// console.log('Routes and filters unchanged, skipping re-filtering');
			return;
		}

		// Update the last processed routes and filters
		lastProcessedRoutes = currentSnapshot;
		// console.log('Routes data:', routes);
		// console.log('Selected body types:', selectedBodyTypes);
		// console.log('Selected weather range:', selectedWeatherRange);
		// console.log('Include 15-min charge:', include15MinCharge);

		// Initialize filtered vehicles object
		filteredVehicles = {};

		// Determine which range to use for filtering
		const rangeKey = selectedWeatherRange && selectedWeatherRange !== 'wltp_range_km'
			? `weather_ranges.${selectedWeatherRange.toLowerCase()}`
			: 'wltp_range_km';
		
		// console.log('Range Key:', rangeKey);

		// Initialize filtered vehicles object
		filteredVehicles = {};

		// For each day of the week
		Object.entries(routes).forEach(([day, dayData]) => {
			// Skip days without routes
			if (!dayData.route) {
				// console.log(`Day ${day} has no route, skipping`);
				return;
			}

			// console.log(`Filtering for ${day}, Distance: ${dayData.route.distanceKm}km`);

			// Get the day's distance
			const dayDistance = parseFloat(dayData.route.distanceKm);

			// Filter vehicles that can handle this day's distance and match selected body types
			filteredVehicles[day] = vehicles
				.filter((vehicle) => {
					// Get the total range including potential 15-min charge
					const totalRange = getTotalRange(vehicle, rangeKey);

					// Check if vehicle has range and it's greater than the day's distance
					const meetsRangeRequirement = totalRange && totalRange > dayDistance;

					// Check if vehicle matches body type filter (if any are selected)
					const meetsBodyTypeRequirement =
						selectedBodyTypes.length === 0 || selectedBodyTypes.includes(vehicle.body_type);

					return meetsRangeRequirement && meetsBodyTypeRequirement;
				})
				.sort((a, b) => {
					// Sort by range efficiency (range divided by battery size)
					const getRangeEfficiency = (vehicle) => {
						const totalRange = getTotalRange(vehicle, rangeKey);
						return totalRange / (vehicle.usable_battery_size || 1);
					};

					return getRangeEfficiency(b) - getRangeEfficiency(a);
				});

			// console.log(`Found ${filteredVehicles[day].length} vehicles for ${day}`);
		});

		// Create an "all" category for vehicles that can handle the total weekly distance
		const daysWithRoutes = Object.entries(routes)
			.filter(([_, dayData]) => dayData.route)
			.map(([day, _]) => day);

		// console.log(`Days with routes: ${daysWithRoutes.join(', ')}`);

		if (daysWithRoutes.length > 0) {
			// Calculate total weekly distance
			const totalWeeklyDistance = parseFloat(calculateTotalWeeklyDistance());
			// console.log(`Total weekly distance: ${totalWeeklyDistance} km`);

			// Filter vehicles that can handle the total weekly distance and match body type
			filteredVehicles.all = vehicles.filter((vehicle) => {
				// Get the total range including potential 15-min charge
				const totalRange = getTotalRange(vehicle, rangeKey);
				
				// Check if vehicle has range and it's greater than the total weekly distance
				const meetsRangeRequirement = totalRange && totalRange > totalWeeklyDistance;
				
				// Check if vehicle matches body type filter (if any are selected)
				const meetsBodyTypeRequirement =
					selectedBodyTypes.length === 0 || selectedBodyTypes.includes(vehicle.body_type);
					
				return meetsRangeRequirement && meetsBodyTypeRequirement;
			}).sort((a, b) => {
				// Sort by range efficiency (range divided by battery size)
				const getRangeEfficiency = (vehicle) => {
					const totalRange = getTotalRange(vehicle, rangeKey);
					return totalRange / (vehicle.usable_battery_size || 1);
				};
				return getRangeEfficiency(b) - getRangeEfficiency(a);
			});

			// console.log(`Found ${filteredVehicles.all.length} vehicles that can handle the total weekly distance of ${totalWeeklyDistance} km`);
		}
	}

	// Set active tab
	function setActiveTab(tab) {
		// console.log(`Setting active tab to ${tab}`);
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
		// console.log('EvResultsSection component mounted');
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

		// console.log('Routes changed, re-filtering vehicles');
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

    // Function to toggle weather range selection
    function toggleWeatherRange(range) {
        // If the same range is selected, don't deselect it (since we always want a selection)
        selectedWeatherRange = selectedWeatherRange === range ? range : range;
        filterVehiclesForRoutes();
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

		<div class="weather-range-filters">
			<div class="filters-row">
			  <div class="filter-column weather-filters">
				<h3>Filter by Range Type</h3>
				<div class="body-type-filters">
				  {#each weatherRangeOptions as rangeOption}
					<button
					  class:active={selectedWeatherRange === rangeOption.key}
					  onclick={() => toggleWeatherRange(rangeOption.key)}>
					  <div class="filter-image weather-icons">
						{#if rangeOption.key === 'wltp_range_km'}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--!Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc.--><path d="M384 48c8.8 0 16 7.2 16 16l0 384c0 8.8-7.2 16-16 16L64 464c-8.8 0-16-7.2-16-16L48 64c0-8.8 7.2-16 16-16l320 0zM64 0C28.7 0 0 28.7 0 64L0 448c0 35.3 28.7 64 64 64l320 0c35.3 0 64-28.7 64-64l0-384c0-35.3-28.7-64-64-64L64 0zM96 400c0 8.8 7.2 16 16 16l224 0c8.8 0 16-7.2 16-16s-7.2-16-16-16l-224 0c-8.8 0-16 7.2-16 16zm33.3-176l39.1 0c1.6 30.4 7.7 53.8 14.6 70.8c-27.9-13.2-48.4-39.4-53.7-70.8zM224 304l-.3 0c-2.4-3.5-5.7-8.9-9.1-16.5c-6-13.6-12.4-34.3-14.2-63.5l47.1 0c-1.8 29.2-8.1 49.9-14.2 63.5c-3.4 7.6-6.7 13-9.1 16.5l-.3 0zm94.7-80c-5.3 31.4-25.8 57.6-53.7 70.8c6.8-17.1 12.9-40.4 14.6-70.8l39.1 0zm0-32l-39.1 0c-1.6-30.4-7.7-53.8-14.6-70.8c27.9 13.2 48.4 39.4 53.7 70.8zM224 112l.3 0c2.4 3.5 5.7 8.9 9.1 16.5c6 13.6 12.4 34.3 14.2 63.5l-47.1 0c1.8-29.2 8.1-49.9 14.2-63.5c3.4-7.6 6.7-13 9.1-16.5l.3 0zm-94.7 80c5.3-31.4 25.8-57.6 53.7-70.8c-6.8 17.1-12.9 40.4-14.6 70.8l-39.1 0zM224 336a128 128 0 1 0 0-256 128 128 0 1 0 0 256z"/></svg>
						{:else if rangeOption.key === 'cold'}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512"><!--!Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc.--><path d="M368 112c0-35.3 28.7-64 64-64s64 28.7 64 64l0 161.9c0 14.5 5.7 27.1 12.8 36.6c12 16 19.2 35.9 19.2 57.5c0 53-43 96-96 96s-96-43-96-96c0-21.6 7.1-41.5 19.2-57.5c7.1-9.5 12.8-22.1 12.8-36.6L368 112zM432 0C370.1 0 320 50.1 320 112l0 161.9c0 1.7-.7 4.4-3.2 7.8c-18.1 24.1-28.8 54-28.8 86.4c0 79.5 64.5 144 144 144s144-64.5 144-144c0-32.4-10.7-62.3-28.8-86.4c-2.5-3.4-3.2-6.1-3.2-7.8L544 112C544 50.1 493.9 0 432 0zm0 416c26.5 0 48-21.5 48-48c0-20.9-13.4-38.7-32-45.3l0-50.7c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 50.7c-18.6 6.6-32 24.4-32 45.3c0 26.5 21.5 48 48 48zM288 131.6l-88 50.8 0-55.8 35.3-35.3c6.2-6.2 6.2-16.4 0-22.6s-16.4-6.2-22.6 0L200 81.4 200 56c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 25.4L139.3 68.7c-6.2-6.2-16.4-6.2-22.6 0s-6.2 16.4 0 22.6L152 126.6l0 55.8-48.3-27.9L90.7 106.3C88.5 97.7 79.7 92.7 71.2 95s-13.6 11.1-11.3 19.6l4.6 17.3-22-12.7C31 112.6 16.3 116.5 9.7 128s-2.7 26.2 8.8 32.8l22 12.7-17.3 4.6c-8.5 2.3-13.6 11.1-11.3 19.6s11.1 13.6 19.6 11.3l48.2-12.9L128 224 79.7 251.9 31.4 239c-8.5-2.3-17.3 2.8-19.6 11.3s2.8 17.3 11.3 19.6l17.3 4.6-22 12.7C7 293.8 3.1 308.5 9.7 320s21.3 15.4 32.8 8.8l22-12.7-4.6 17.3c-2.3 8.5 2.8 17.3 11.3 19.6s17.3-2.8 19.6-11.3l12.9-48.2L152 265.6l0 55.8-35.3 35.3c-6.2 6.2-6.2 16.4 0 22.6s16.4 6.2 22.6 0L152 366.6l0 25.4c0 13.3 10.7 24 24 24s24-10.7 24-24l0-25.4 12.7 12.7c6.2 6.2 16.4 6.2 22.6 0s6.2-16.4 0-22.6L200 321.4l0-55.8 67.7 39.1c5.2-13.5 12-26.2 20.3-37.9l0-5.8-64-37 64-37 0-55.4z"/></svg>
						{:else if rangeOption.key === 'mild'}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--!Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc.--><path d="M96 112c0-26.5 21.5-48 48-48s48 21.5 48 48l0 164.5c0 17.3 7.1 31.9 15.3 42.5C217.8 332.6 224 349.5 224 368c0 44.2-35.8 80-80 80s-80-35.8-80-80c0-18.5 6.2-35.4 16.7-48.9C88.9 308.4 96 293.8 96 276.5L96 112zM144 0C82.1 0 32 50.2 32 112l0 164.4c0 .1-.1 .3-.2 .6c-.2 .6-.8 1.6-1.7 2.8C11.2 304.2 0 334.8 0 368c0 79.5 64.5 144 144 144s144-64.5 144-144c0-33.2-11.2-63.8-30.1-88.1c-.9-1.2-1.5-2.2-1.7-2.8c-.1-.3-.2-.5-.2-.6L256 112C256 50.2 205.9 0 144 0zm0 416c26.5 0 48-21.5 48-48c0-20.9-13.4-38.7-32-45.3L160 176c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 146.7c-18.6 6.6-32 24.4-32 45.3c0 26.5 21.5 48 48 48zM352 32c-17.7 0-32 14.3-32 32s14.3 32 32 32l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L352 32zM320 192c0 17.7 14.3 32 32 32l128 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-128 0c-17.7 0-32 14.3-32 32zm64 96c-17.7 0-32 14.3-32 32s14.3 32 32 32l96 0c17.7 0 32-14.3 32-32s-14.3-32-32-32l-96 0z"/></svg>
						{:else if rangeOption.key === 'warm'}
							<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc.--><path d="M320.6 98.5l-2.7-.5L303.8 13.4c-.9-5.4-4.5-10-9.6-12.1s-10.9-1.5-15.4 1.6L208 52.5 137.2 2.9c-4.5-3.2-10.3-3.8-15.4-1.6s-8.7 6.7-9.6 12.1L98.1 98.1 13.4 112.2c-5.4 .9-10 4.5-12.1 9.6s-1.5 10.9 1.6 15.4L52.5 208 2.9 278.8c-3.2 4.5-3.8 10.3-1.6 15.4s6.7 8.7 12.1 9.6l84.7 14.1 14.1 84.7c.9 5.4 4.5 10 9.6 12.1s10.9 1.5 15.4-1.6L208 363.5l70.8 49.6c4.5 3.1 10.3 3.8 15.4 1.6c.7-.3 1.5-.7 2.1-1.1c-5.4-16.9-8.3-35-8.3-53.7c0-37.7 11.8-72.6 32-101.2L320 112c0-4.5 .2-9 .6-13.5zM208 272a64 64 0 1 0 0-128 64 64 0 1 0 0 128zm0-160a96 96 0 1 1 0 192 96 96 0 1 1 0-192zm192 0c0-35.3 28.7-64 64-64s64 28.7 64 64l0 161.9c0 14.5 5.7 27.1 12.8 36.6c12 16 19.2 35.9 19.2 57.5c0 53-43 96-96 96s-96-43-96-96c0-21.6 7.1-41.5 19.2-57.5c7.1-9.5 12.8-22.1 12.8-36.6L400 112zM464 0C402.1 0 352 50.2 352 112l0 161.9c0 1.7-.7 4.4-3.2 7.8c-18.1 24.1-28.8 54-28.8 86.4c0 79.5 64.5 144 144 144s144-64.5 144-144c0-32.4-10.7-62.3-28.8-86.4c-2.5-3.4-3.2-6.1-3.2-7.8L576 112C576 50.2 525.9 0 464 0zm0 416c26.5 0 48-21.5 48-48c0-20.9-13.4-38.7-32-45.3L480 112c0-8.8-7.2-16-16-16s-16 7.2-16 16l0 210.7c-18.6 6.6-32 24.4-32 45.3c0 26.5 21.5 48 48 48z"/></svg>
						{/if}
					  </div>
					  <span>{rangeOption.label}</span>
					</button>
				  {/each}
				</div>
			  </div>
			  
			  <div class="filter-column charge-filter">
				<h3>Range Extension</h3>
				<div class="body-type-filters">
				  <button
					class:active={include15MinCharge}
					onclick={toggle15MinCharge}>
					<div class="filter-image">
					  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512"><!--!Font Awesome Pro 6.7.2 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2025 Fonticons, Inc.--><path d="M134.2 105.1L99.4 192l28.6 0 0 48-64 0c-8.8 0-16 7.2-16 16l0 96 21.5 0c13.2-37.3 48.7-64 90.5-64s77.4 26.7 90.5 64l138.9 0c13.2-37.3 48.7-64 90.5-64s77.4 26.7 90.5 64l21.5 0 0-32c0-44.2-35.8-80-80-80l-96 0 0-48 46.1 0L384.5 95c-7.6-9.5-19.1-15-31.2-15L171.3 80c-16.4 0-31.1 10-37.1 25.1zM46.8 194.3l42.8-107C103 53.9 135.3 32 171.3 32l181.9 0c26.7 0 52 12.2 68.7 33L524 192.6c65.1 6 116 60.8 116 127.4l0 48c0 17.7-14.3 32-32 32l-33.3 0c-7.6 45.4-47.1 80-94.7 80s-87.1-34.6-94.7-80l-130.7 0c-7.6 45.4-47.1 80-94.7 80s-87.1-34.6-94.7-80L32 400c-17.7 0-32-14.3-32-32L0 256c0-29.4 19.8-54.2 46.8-61.7zM434.7 400a48 48 0 1 0 90.5-32 48 48 0 1 0 -90.5 32zM208 384a48 48 0 1 0 -96 0 48 48 0 1 0 96 0zM331.2 100.6c5.3 5.2 6.3 13.3 2.5 19.6L300.3 176l51.7 0c7.1 0 13.4 4.7 15.4 11.6s-.8 14.2-6.9 18l-128 80c-6.3 3.9-14.4 3-19.7-2.2s-6.3-13.3-2.5-19.6L243.7 208 192 208c-7.1 0-13.4-4.7-15.4-11.6s.8-14.2 6.9-18l128-80c6.3-3.9 14.4-3 19.7 2.2z"/></svg>
					</div>
					<span>Include 15-min Fast Charge</span>
				  </button>
				</div>
				<p class="filter-description">Charge up for longer journeys.</p>
			  </div>
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
							<div class="vehicle-card {isBatteryCritical(calculateRemainingBattery(vehicle, parseFloat(calculateTotalWeeklyDistance()), selectedWeatherRange, include15MinCharge)) ? 'low-battery' : ''}" onclick={() => showVehicleDetails(vehicle)}>
								<div class="card-header">
									<h4>{vehicle.brand} {vehicle.model} {vehicle.variant}</h4>
									<div class="body-type-image">
										<img src={getBodyTypeImage(vehicle.body_type)} alt={vehicle.body_type} />
									</div>
								</div>
								{#if include15MinCharge}
									<p>
										<strong>Total Range</strong>
										{formatRange(getTotalRange(vehicle,
											selectedWeatherRange === 'wltp_range_km'
												? 'wltp_range_km'
												: `weather_ranges.${selectedWeatherRange.replace(' Weather Range', '').toLowerCase()}`
										))} km
									</p>
									<p><strong>15-min Charge</strong> +{formatRange(get15MinChargeRange(vehicle))} km</p>
								{/if}
								<div class="vehicle-details">
									<p>
										<strong>
											{#if selectedWeatherRange === 'wltp_range_km'}
												WLTP Range
											{:else if selectedWeatherRange}
												{selectedWeatherRange.replace('_', ' ').replace(' range', ' Range')}
											{/if}
										</strong>
										{formatRange(
											selectedWeatherRange === 'wltp_range_km' 
												? vehicle.wltp_range_km 
												: vehicle.weather_ranges?.[selectedWeatherRange.replace(' Weather Range', '').toLowerCase()] || 'N/A'
										)} km
									</p>
									<p><strong>Battery:</strong> {vehicle.usable_battery_size} kWh</p>
									<p>
										<strong>Efficiency:</strong>
										{calculateEfficiency(vehicle.wltp_range_km, vehicle.usable_battery_size)} km/kWh
									</p>
									<p><strong>Body Type:</strong> {vehicle.body_type}</p>
									<p><strong>Year:</strong> {vehicle.release_year}</p>
									<p class="battery-remaining {isBatteryCritical(calculateRemainingBattery(vehicle, parseFloat(calculateTotalWeeklyDistance()), selectedWeatherRange, include15MinCharge)) ? 'critical' : ''}">
										<strong>Remaining Battery:</strong> {calculateRemainingBattery(vehicle, parseFloat(calculateTotalWeeklyDistance()), selectedWeatherRange, include15MinCharge)}%
									</p>
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
							<div class="vehicle-card {isBatteryCritical(calculateRemainingBattery(vehicle, parseFloat(routes[activeTab].route.distanceKm), selectedWeatherRange, include15MinCharge)) ? 'low-battery' : ''}" onclick={() => showVehicleDetails(vehicle)}>
								<div class="card-header">
									<h4>{vehicle.brand} {vehicle.model} {vehicle.variant}</h4>
									<div class="body-type-image">
										<img src={getBodyTypeImage(vehicle.body_type)} alt={vehicle.body_type} />
									</div>
								</div>
								{#if include15MinCharge}
									<p>
										<strong>Total Range</strong>
										{formatRange(getTotalRange(vehicle,
											selectedWeatherRange === 'wltp_range_km'
												? 'wltp_range_km'
												: `weather_ranges.${selectedWeatherRange.replace(' Weather Range', '').toLowerCase()}`
										))} km
									</p>
									<p><strong>15-min Charge</strong> +{formatRange(get15MinChargeRange(vehicle))} km</p>
								{/if}
								<div class="vehicle-details">
									<p>
										<strong>
											{#if selectedWeatherRange === 'wltp_range_km'}
												WLTP Range
											{:else if selectedWeatherRange}
												{selectedWeatherRange.replace('_', ' ').replace(' range', ' Range')}
											{/if}
										</strong>
										{formatRange(
											selectedWeatherRange === 'wltp_range_km' 
												? vehicle.wltp_range_km 
												: vehicle.weather_ranges?.[selectedWeatherRange.replace(' Weather Range', '').toLowerCase()] || 'N/A'
										)} km
									</p>
									<p><strong>Battery:</strong> {vehicle.usable_battery_size} kWh</p>
									<p>
										<strong>Efficiency:</strong>
										{calculateEfficiency(vehicle.wltp_range_km, vehicle.usable_battery_size)} km/kWh
									</p>
									<p><strong>Body Type:</strong> {vehicle.body_type}</p>
									<p><strong>Year:</strong> {vehicle.release_year}</p>
									<p class="battery-remaining {isBatteryCritical(calculateRemainingBattery(vehicle, parseFloat(routes[activeTab].route.distanceKm), selectedWeatherRange, include15MinCharge)) ? 'critical' : ''}">
										<strong>Remaining Battery:</strong> {calculateRemainingBattery(vehicle, parseFloat(routes[activeTab].route.distanceKm), selectedWeatherRange, include15MinCharge)}%
									</p>
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

	.weather-filters .body-type-filters button {
		flex: 0 0 auto;
		min-width: 100px;
	}
	
	/* Make the charge filter button take full width of its container */
	.charge-filter .body-type-filters button {
		width: 100%;
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
	.active .filter-image.weather-icons svg path {
		fill: #ffffff;
	}

	.weather-icons {
		width: 40px;
		height: 40px;
	}
	
	.filter-image svg {
		width: 100%;
		height: 100%;
	}

	.body-type-filters button.active .filter-image svg {
		/* Make the SVG white when the button is active */
		fill: white;
	}

	.filter-description {
		font-size: 0.85rem;
		color: #6c757d;
		margin-top: 0.5rem;
		text-align: center;
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

    .weather-range-buttons {
        display: flex;
        gap: 0.5rem;
        flex-wrap: wrap;
    }

    .weather-range-buttons button {
        padding: 0.5rem;
        background: #f8f9fa;
        border: 1px solid #ced4da;
        border-radius: 4px;
        cursor: pointer;
    }

    .weather-range-buttons button.active {
        background: #007bff;
        color: white;
    }

	.weather-range-filters {
		margin-bottom: 1.5rem;
	}
	
	.filters-row {
		display: flex;
		flex-wrap: wrap;
		gap: 1rem;
	}
	
	.filter-column {
		padding: 1rem;
		background: #e9ecef;
		border-radius: 8px;
	}
	
	/* Weather filters column takes up more space but allows wrapping */
	.weather-filters {
		flex: 3;
		min-width: 300px;
	}
	
	/* Charge filter takes less space */
	.charge-filter {
		flex: 1;
		min-width: 200px;
	}
	
	.filter-column h3 {
		margin-top: 0;
		margin-bottom: 0.5rem;
		font-size: 1rem;
	}
	.filter-image.weather-icons {
			width: 30px;
			height: 30px;
	}

	.low-battery {
		border: 2px solid #dc3545;
		position: relative;
	}
	
	.low-battery::before {
		content: "Low Battery Warning";
		position: absolute;
		top: 0px;
		right: -4px;
		background: #dc3545;
		color: white;
		font-size: 0.7rem;
		padding: 2px 8px;
		border-radius: 4px;
		z-index: 1;
	}
	
	.battery-remaining {
		grid-column: 1 / -1;
		margin-top: 0.5rem;
		padding-top: 0.5rem;
		border-top: 1px dashed #dee2e6;
	}
	
	.battery-remaining.critical {
		color: #dc3545;
		font-weight: bold;
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


		.filters-row {
			flex-direction: column;
		}
		
		.filter-column {
			width: 100%;
		}
	}
	@media (max-width: 480px) {
		.tabs button {
			flex: 1 1 100%; /* Full width on very small screens */
		}
	}
</style>

<script>
    import { onMount } from 'svelte';
    import { getAuth, onAuthStateChanged } from 'firebase/auth';
    import authStore from '$lib/stores/auth.store';
    import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
    
    // Get data from the server
    export let data;
    
    let isLoading = true;
    let result = null;
    let error = null;
    let currentUser = null;
    let userType = null;
    let isAdmin = false;
    
    // Get the API key from environment variables
    const API_KEY = import.meta.env.VITE_IMPORT_API_KEY;
    
    onMount(() => {
        const auth = getAuth();
        
        // Use onAuthStateChanged to detect Firebase Auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            console.log("Auth state changed:", user ? `User ${user.uid} logged in` : "No user");
            
            if (user) {
                currentUser = user;
                console.log("Current user from Firebase:", currentUser.uid);
                console.log("Current user email:", currentUser.email);
                
                try {
                    // Get user data from Firestore
                    const userData = await userFirestoreStore.getUser(currentUser.uid);
                    console.log("Full user data from Firestore:", userData);
                    
                    if (userData) {
                        userType = userData.type;
                        isAdmin = userType === 'admin'; // Adjust based on your actual admin type value
                        console.log("User type from database:", userType);
                        console.log("Is user admin based on type?", isAdmin);
                    } else {
                        console.log("No user data found in Firestore");
                    }
                } catch (err) {
                    console.error("Error fetching user data:", err);
                }
            } else {
                console.log("No current user in Firebase");
                currentUser = null;
                userType = null;
                isAdmin = false;
            }
            
            isLoading = false;
        });
        
        // Clean up the subscription when the component is destroyed
        return unsubscribe;
    });
    
    // Subscribe to the authStore to see changes
    $: {
        console.log("Auth store updated:", $authStore);
        
        // If authStore shows logged in but we don't have currentUser yet
        if ($authStore.isLoggedIn && !currentUser && !isLoading) {
            console.log("Auth store shows logged in but currentUser not set yet");
        }
    }
    
    async function importVehicles() {
        isLoading = true;
        error = null;
        result = null;
        
        try {
            console.log("Starting import with API key:", API_KEY ? "API key exists" : "No API key");
            
            // Get current auth state
            const auth = getAuth();
            const user = auth.currentUser;
            console.log("Current Firebase user before import:", user ? user.uid : "No user");
            console.log("Auth store before import:", $authStore);
            
            // Include user ID in the request body
            const requestBody = {
                userId: user ? user.uid : ($authStore.userId || null)
            };
            
            console.log("Sending request with body:", requestBody);
            
            const response = await fetch('/api/import-vehicles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify(requestBody)
            });
            
            console.log("Import response status:", response.status);
            
            // Only try to parse JSON if the response has content
            let data;
            try {
                data = await response.json();
                console.log("Import response data:", data);
            } catch (jsonError) {
                console.error("Error parsing JSON response:", jsonError);
                throw new Error('Invalid response from server');
            }
            
            if (!response.ok) {
                throw new Error(data.error || `Server error: ${response.status}`);
            }
            
            result = data;
        } catch (err) {
            console.error("Import error:", err);
            error = err.message;
        } finally {
            isLoading = false;
        }
    }
</script>
    <h1 class="text-2xl font-bold mb-4">Import Vehicles Data</h1>
    
    {#if isLoading}
        <p>Loading authentication state...</p>
    {:else if !currentUser}
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p><strong>Note:</strong> You need to be logged in to access this page.</p>
            <a href="/login" class="underline">Go to login page</a>
        </div>
    {:else if !isAdmin && !data.isAdmin}
        <div class="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
            <p><strong>Note:</strong> You need admin privileges to import vehicles.</p>
            <p class="text-sm mt-2">Debug info: User type: {userType}, isAdmin: {isAdmin}, data.isAdmin: {data.isAdmin}</p>
        </div>
    {:else}
        <div class="mb-6">
            <p class="mb-2">This will import all vehicle data from the db-ev-data.json file into the Firestore database.</p>
            <p class="mb-4">Existing vehicles with the same ID will be updated.</p>
            
            <button 
                on:click={importVehicles} 
                disabled={isLoading}
                class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
            >
                {isLoading ? 'Importing...' : 'Import Vehicles'}
            </button>
        </div>
        
        {#if error}
            <div class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p><strong>Error:</strong> {error}</p>
            </div>
        {/if}
        
        {#if result}
            <div class="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p><strong>Success!</strong> {result.message}</p>
                <p>Imported {result.count} vehicles.</p>
            </div>
        {/if}
    {/if}
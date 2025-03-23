<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import AuthFormDealership from '$lib/components/Auth/AuthFormDealer.svelte';
  import { registerWithEmailandPassword } from '$lib/firebase/auth.client';
  import { afterLogin } from '$lib/helpers/route.helper';
  import { messageActions } from '$lib/stores/messages.store.svelte';
  import { page } from '$app/stores';
  import { setUserWithEmail } from '$lib/firebase/database.client';
  import { userFirestoreStore } from '$lib/firebase/models/user-firestore-store';
  import { getAuth } from 'firebase/auth';
  import { refreshUserData } from '$lib/stores/auth.store';

  // Add loading state with $state
  let isLoading = $state(false);
  
  async function register(e) {
    isLoading = true;
    try {
      const { name, brand, email, password } = e.detail;
      console.log({ name, brand, email, password });

      // Register the user with Firebase
      console.log("Registering user with Firebase Auth...");
      const userId = await registerWithEmailandPassword(email, password);
      console.log("User registered with Firebase Auth, userId:", userId);

      // Create a user object with brand type
      const user = {
        name,
        brand,
        type: 'brand', // Set type as 'brand' for dealerships
        user_id: userId,
        email: email
      };

      // Save the user to Firestore with more detailed logging
      console.log("Saving user to Firestore...");
      try {
        await setUserWithEmail(user);
        console.log("User saved to Firestore successfully");
      } catch (firestoreError) {
        console.error("Error saving user to Firestore:", firestoreError);
        throw firestoreError;
      }

      // Delay added so firebase has data written and availabe
      console.log("Waiting for Firestore to update...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      console.log("Continuing after delay");

      // Verify the user was created in Firestore
      let userData = null;
      let attempts = 0;
      const maxAttempts = 5;
      
      while (!userData && attempts < maxAttempts) {
        console.log(`Attempt ${attempts + 1} to verify user data in Firestore...`);
        try {
          userData = await userFirestoreStore.getUser(userId);
          console.log("Verification attempt result:", userData ? "User found" : "User not found");
        } catch (verifyError) {
          console.error(`Error during verification attempt ${attempts + 1}:`, verifyError);
        }
        
        if (!userData) {
          console.log(`Waiting before attempt ${attempts + 2}...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        attempts++;
      }

      if (userData) {
        console.log("User data verified in Firestore:", userData);

        // Get the current Firebase Auth instance and user
        const auth = getAuth();
        const currentUser = auth.currentUser;
        
        if (currentUser) {
        console.log("Triggering re-authentication to update auth store...");
        
        // Force a re-authentication by getting a new ID token
        // This will trigger the onAuthStateChanged listener in your auth store
        await currentUser.getIdToken(true);
        
        // Manually refresh the user data in the auth store
        console.log("Manually refreshing user data in auth store...");
        await refreshUserData();
        
        console.log("Auth store updated, redirecting...");
        await afterLogin($page.url);
      } else {
        console.error("Current user not found in Firebase Auth");
        await afterLogin($page.url);
      }
    } else {
      console.error("Failed to verify user data in Firestore after multiple attempts");
      messageActions.showWarning("Account created, but you may need to refresh to see all features");
      await afterLogin($page.url);
    }
  } catch (error) {
    console.error("Registration error:", error);
    console.log("Error code:", error.code);
    console.log("Error message:", error.message);

    // Handle specific errors
    if (error.code === 'auth/email-already-in-use') {
      messageActions.showError('Email has already been registered');
    } else {
      messageActions.showError('An error occurred during signup. Please try again.');
    }
  } finally {
    isLoading = false;
  }
}
</script>

<UpdateHead title="Brand Signup" description="Driving your Electric Dreams Today" />

<section class="section">
  <h1 class="title">Brand Dealership Sign up</h1>
  <AuthFormDealership on:submit={register} btnName={isLoading ? 'Signing up...' : 'Dealer Brand Sign up'} disabled={isLoading}/>
</section>
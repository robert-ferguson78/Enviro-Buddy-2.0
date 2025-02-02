<script>
  import UpdateHead from '$lib/UpdateHead.svelte';
  import LoginWithGoogle from '$lib/components/Auth/LoginWithGoogle.svelte';
  import AuthFormLogin from '$lib/components/Auth/AuthFormLogin.svelte';
  import { loginWithEmailandPassword } from '$lib/firebase/auth.client';
  import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';
  import { page } from '$app/stores';
  import { afterLogin } from '$lib/helpers/route.helper';

  let isLoading = $state(false); // stop mulitple login clicks

  async function onLogin(e) {
      isLoading = true;
      try {
          // console.log('Login form submitted'); // Log form submission
          const formdata = new FormData(e.target);
          const email = formdata.get('email');
          const password = formdata.get('password');

          // console.log('Email:', email); // Log the email
          // console.log('Password:', password); // Log the password

          const user = await loginWithEmailandPassword(email, password);
          // console.log('Login successful:', user); // Log successful login
          await afterLogin($page.url);
      } catch (error) {
          // console.error('Login error:', error); // Log the full error
          // console.error('Error code:', error.code); // Log the error code

          if (error.code === 'auth/invalid-credential') {
            messageActions.showError('Invalid email or password. Please check your credentials and try again.');
          } else {
            messageActions.showError('An error occurred during login. Please try again.');
          }
      } finally {
            isLoading = false; // Stop loading
        }
  }
</script>

<UpdateHead title="Login" description="Driving your Electric Dreams Today" />

<section class="section">
  <h1 class="title">Login / Signin with Google</h1>
  <AuthFormLogin onsubmit={onLogin} btnName={isLoading ? 'Logging in...' : 'Login'} disabled={isLoading} />
  <LoginWithGoogle />
  <a href="/forgot-password">
      <button class="button has-background-light mt-3">
          <span class="icon">
              <i class="fa-solid fa-lock"></i>
          </span>
          <span>Forgot Password</span>
      </button>
  </a>
  <p class="mt-3">Don't have an account? <a href="/signup">Sign up here</a>.</p>
</section>
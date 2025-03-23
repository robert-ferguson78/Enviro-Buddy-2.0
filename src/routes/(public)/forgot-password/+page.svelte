<script>
    import UpdateHead from '$lib/UpdateHead.svelte';
    import AuthForm from "$lib/components/Auth/AuthForm.svelte";
    import { mailResetPasswordEmail } from '$lib/firebase/auth.client';
    import { messageActions } from '$lib/stores/messages.store.svelte';

    // Add loading state with $state
    let isLoading = $state(false);

    async function onForgotPassword(e) {
        isLoading = true;
        try {
            // use e.detail.email to get the email from the form
            const email = e.detail.email;
            if (!email) {
                throw new Error('Email is required');
            }
            await mailResetPasswordEmail(email);
            // console.log('email sent');
            messageActions.showSuccess('Reset Password Email Sent');
        } catch (error) {
            // console.log((error as any).code);
            if ((error).code === 'auth/user-not-found') {
                messageActions.showError('Email not found, Please check the email and try again');
                return;
            }
            messageActions.showError(error.code || 'An error occurred');
        } finally {
        isLoading = false;
        }
    }
</script>

<UpdateHead title="Forgot Password" description="Driving your Electric Dreams Today" />

<div>
    <div class="column">
        <h1>Forgot Password</h1>
    </div>
</div>

<AuthForm on:submit={onForgotPassword} forgotPassword={true} btnName={isLoading ? 'Sending...' : 'Forgot Password'} disabled={isLoading}/>
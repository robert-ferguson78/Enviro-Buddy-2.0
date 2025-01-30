<script>
    import UpdateHead from '$lib/UpdateHead.svelte';
    import AuthForm from "$lib/components/Auth/AuthForm.svelte";
    import { mailResetPasswordEmail } from '$lib/firebase/auth.client';
    import { messagesStore, messageActions } from '$lib/stores/messages.store.svelte';

    async function onForgotPassword(e) {
        try {
            const formData = new FormData(e.target);
            const email = formData.get('email');
            if (email === null || typeof email !== 'string') {
                throw new Error('Email not found in form data');
            }
            await mailResetPasswordEmail(email);
            // console.log('email sent');
            showSuccess('Reset Password Email Sent');
        } catch (error) {
            // console.log((error as any).code);
            if ((error).code === 'auth/user-not-found') {
                showError('Email not found, Please check the email and try again');
                return;
            }
            showError((error).code);
        }
    }
</script>

<UpdateHead title="Forgot Password" description="Driving your Electric Dreams Today" />

<div>
    <div class="column">
        <h1>Forgot Password</h1>
    </div>
</div>

<AuthForm on:submit={onForgotPassword} forgotPassword={true} btnName="Forgot Password" />
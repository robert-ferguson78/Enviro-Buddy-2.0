<section class="section">
  <h1 class="title">Sign up</h1>
  <form action="/register" method="POST">
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field">
            <label class="label" for="firstName-input">First Name</label>
          <input class="input" type="text" placeholder="Enter first name" name="firstName">
        </div>
        <div class="field">
            <label class="label" for="lastName">Last Name</label>
          <input class="input" type="text" placeholder="Enter last name" name="lastName">
        </div>
      </div>
    </div>
    <div class="field">
    <label class="label" for="email-input">Email</label> <input class="input" type="text" placeholder="Enter email" id="email-input" name="email">
    </div>
    <div class="field">
    <label class="label" for="password-input">Password</label> <input class="input" type="password" placeholder="Enter Password" id="password-input" name="password">
    </div>
    <div class="field is-grouped">
      <button class="button is-link">Submit</button>
    </div>
  </form>
</section>

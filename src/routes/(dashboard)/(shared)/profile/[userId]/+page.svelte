<section class="section">
  <h1 class="title">Sign up</h1>
  <form action="/updateuser/user_id" method="POST">
    <label class="label" for="name-input">Name</label>
    <div class="field is-horizontal">
      <div class="field-body">
        <div class="field">
          <input class="input" type="text" placeholder="user_id" value="first name" name="firstName">
        </div>
        <div class="field">
          <input class="input" type="text" placeholder="Enter last name" value="last name" name="lastName">
        </div>
      </div>
    </div>
    <div class="field">
    <label class="label" for="email-input">Email (Can not be updated)</label> <input class="input" type="text" placeholder="Enter email" value="email" name="email" id="email-input" disabled>
    </div>
    <div class="field">
    <label class="label" for="password-input">Password</label> <input class="input" type="password" placeholder="Enter Password" value="password" name="password" id="password-input">
    </div>
    <div class="field is-grouped">
      <button class="button is-link">Submit</button>
    </div>
  </form>
</section>

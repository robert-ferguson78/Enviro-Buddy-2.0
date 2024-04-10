<h1 class="title">Upload Electric Vehicle</h1>
    <form data-cartypes-id="carType_id" id="update-form" action="/editcartype/cartype_id}}" method="post">
      <div class="columns">
        <div class="column is-two-third">
          <div class="control">
            <label class="label" for="carName">Enter Car Name</label>
            <input class="input is-normal" type="text" name="carName" value="car name">
          </div>
          <div class="control">
            <label class="label" for="carRange">Enter Car Range in KM</label>
            <input class="input is-normal" type="text" name="carRange" id="carRange" value="car range">
            <input class="input is-normal" type="text" name="carRange" value="car range">
          </div>
          <div class="control">
            <label class="label" for="carBodyType">Enter Car Body Type</label>
            <input class="input is-normal" type="text" name="carType" value="car type">
          </div>
          <div class="control pt-5">
            <div class="file has-name">
              <label class="file-label">
                <input class="file-input" type="file" name="image">
                <span class="file-cta">
                  <span class="file-icon">
                    <i class="fas fa-upload"></i>
                  </span>
                  <span class="file-label">
                    Choose a Vehicle Image…
                  </span>
                </span>
                <span class="file-name">
                  Image Name
                </span>
              </label>
            </div>
          </div>
        </div>
        <div class="column is-one-third">
          <div class="control">
            <label class="label" for="preview">Image Preview</label>
            <img id="preview" src="/favicon.png" alt="Preview Image" aria-hidden="true"/>
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-full">
          <input class="button is-link" type="submit" value="Upload Vehicle">
        </div>
      </div>
    </form>
<h1 class="title">Upload Electric Vehicle</h1>
    <form id="upload-form" action="/upload/userId" method="post">
      <div class="columns">
        <div class="column is-two-third">
          <div class="control">
            <label class="label" for="carName">Enter Car Name</label>
            <input class="input is-normal" type="text" name="carName" placeholder="Car Name">
          </div>
          <div class="control">
            <label class="label" for="carRange">Enter Car Range in KM</label>
            <input class="input is-normal" type="text" name="carRange" placeholder="Car Range">
          </div>
          <div class="control">
            <label class="label" for="carType">Select Car Body Type</label>
            <select class="input is-normal" name="carType">
              <option value="">Select Car Type</option>
              <option value="Hatchback">Hatchback</option>
              <option value="Saloon">Saloon</option>
              <option value="Estate">Estate</option>
              <option value="MPV">MPV</option>
              <option value="SUV">SUV</option>
              <option value="Coupe">Coupe</option>
              <option value="Convertible">Convertible</option>
            </select>
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
            <img id="preview" alt="Vehicle Preview" />
          </div>
        </div>
      </div>
      <div class="columns">
        <div class="column is-full">
          <input class="button is-link" type="submit" value="Upload Vehicle">
        </div>
      </div>
    </form>
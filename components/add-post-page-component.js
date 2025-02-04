export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";
  let description = "";

  const render = () => {
    const appHtml = `
      <div class="page-container">
          <div class="header-container">
              <h1>Добавить новый пост</h1>
          </div>
          <div class="form">
              <div class="form-row">
                  <label>URL картинки:</label>
                  <input type="text" id="image-url-input" class="input" value="${imageUrl}" />
              </div>
              <div class="form-row">
                  <label>Описание картинки:</label>
                  <textarea id="description-input" class="input" rows="4">${description}</textarea>
              </div>
              <div class="form-row">
                  <button class="button" id="add-button">Добавить</button>
              </div>
          </div>
      </div>
  `;

    appEl.innerHTML = appHtml;

    const imageUrlInput = document.getElementById("image-url-input");
    imageUrlInput.addEventListener("input", () => {
      imageUrl = imageUrlInput.value;
    });

    const descriptionInput = document.getElementById("description-input");
    descriptionInput.addEventListener("input", () => {
      description = descriptionInput.value;
    });

    document.getElementById("add-button").addEventListener("click", () => {
      if (!imageUrl) {
        alert("Пожалуйста, введите URL картинки.");
        return;
      }

      onAddPostClick({
        description: description,
        imageUrl: imageUrl,
      });
    });
  };

  render();
}

import { uploadImage } from "../api.js"; // Импортируем addPost

export function renderAddPostPageComponent({ appEl, onAddPostClick }) {
  let imageUrl = "";
  let description = "";

  const render = () => {
    const appHtml = `
      <div class="page-container">
          <div class="header-container">
          <div class="page-header">
      <h1 class="logo">instapro</h1>
      <button class="header-button add-or-login-button">
      <div title="Добавить пост" class="add-post-sign"></div>
      </button>
      <button title="nastya1" class="header-button logout-button">Выйти</button>  
  </div>
   </div>
              <h1>Добавить новый пост</h1>
          </div>
          <div class="form">
              <div class="form-row">
                  <label>URL картинки:</label>
                  <input type="text" id="image-url-input" class="input" value="${imageUrl}" />
              </div>
              <button class="button" id="upload-image">Загрузить</button>
              <div class="form-row">
                  <label>Описание картинки:</label>
                  <textarea id="description-input" class="input" >${description}</textarea>
              </div>
              <div class="form-row">
                  <button class="button" id="add-button">Добавить</button>
                  <input type="file" id="upload-button" style="display: none">
                  
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
    document.getElementById("upload-image").addEventListener("click", () => {
      document.getElementById("upload-button").click();
    });

    document
      .getElementById("upload-button")
      .addEventListener("change", (event) => {
        const file = event.target.files[0];
        if (!file) {
          return;
        }

        uploadImage({ file })
          .then((data) => {
            imageUrl = data.fileUrl;
            imageUrlInput.value = imageUrl;
            render(); // Обновляем страницу после загрузки изображения
          })
          .catch((error) => {
            console.error("Ошибка загрузки изображения:", error);
            alert("Произошла ошибка при загрузке изображения.");
          });
      });
  };

  render();
}

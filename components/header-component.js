/**
 * Компонент заголовка страницы.
 * Этот компонент отображает шапку страницы с логотипом, кнопкой добавления постов/входа и кнопкой выхода (если пользователь авторизован).
 *
 * @param {HTMLElement} params.element - HTML-элемент, в который будет рендериться заголовок.
 * @returns {HTMLElement} Возвращает элемент заголовка после рендеринга.
 */
import { goToPage } from "../index.js";
import { AUTH_PAGE } from "../routes.js";
import { ADD_POSTS_PAGE, POSTS_PAGE } from "../routes.js";
import { logout } from "../index.js";

export function renderHeaderComponent({ element, user }) {
  // Рендерит содержимое заголовка.
  element.innerHTML = `
<div class="page-header">
    <h1 class="logo">instapro</h1>
    <button class="header-button add-or-login-button">
    ${
      user ? `<div title="Добавить пост" class="add-post-sign"></div>` : "Войти"
    }
    </button>
    ${
      user
        ? `<button title="${user.name}" class="header-button logout-button">Выйти</button>`
        : ""
    }
</div>
`;

  element
    .querySelector(".add-or-login-button")
    .addEventListener("click", () => {
      if (user) {
        goToPage(ADD_POSTS_PAGE);
      } else {
        goToPage(AUTH_PAGE);
      }
    });

  element.querySelector(".logo").addEventListener("click", () => {
    goToPage(POSTS_PAGE);
  });

  element.querySelector(".logout-button")?.addEventListener("click", logout);

  return element;
}

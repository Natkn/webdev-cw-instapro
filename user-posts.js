import { getUserPosts } from "./api.js";
import { getToken } from "./index.js";

for (const userImage of document.querySelectorAll(".post-header__user-image")) {
  userImage.addEventListener("click", () => {
    if (user) {
      window.location.hash = `#/user-posts?userId=${userId}`;
    } else {
      goToPage(AUTH_PAGE);
    }
  });
}

export function renderUserPostsPage({ appEl, userId, user }) {
  console.log("renderUserPostsPage: userId =", userId);
  appEl.innerHTML = "Загружаю посты пользователя..."; // Отображаем сообщение о загрузке

  getUserPosts({ token: getToken(), userId })
    .then((posts) => {
      if (posts.length === 0) {
        appEl.innerHTML = "У этого пользователя пока нет постов";
      } else {
        renderPosts({ appEl, posts, user });
      }
    })
    .catch((error) => {
      console.error("Ошибка при загрузке постов пользователя:", error);
      appEl.innerHTML = "Произошла ошибка при загрузке постов пользователя.";
    });
}

export function renderPosts({ appEl, posts, user, userId }) {
  const postsHtml = posts
    .map((post) => {
      const isOwnPost = user && post.user && post.user.id === user.id;
      return `
            <li class="post">
              <div class="post-header" data-user-id="${post.user?.id}">
                <img src="" class="post-header__user-image">
                <p class="post-header__user-name">${post.user?.name}</p>
              </div>
              <div class="post-image-container">
                <img class="post-image" src="${post.imageUrl}">
              </div>
              <div class="post-likes">
                <button data-post-id="${post.id}" class="like-button ${
        post.isLiked ? "liked" : ""
      }"></button>
                <p class="post-likes-text">Нравится: <strong>${
                  post.likes.length
                }</strong></p>
              </div>
              <p class="post-text">
                <span class="user-name">${post.user?.name}</span>
                ${post.description}
              </p>
              <p class="post-date">19 минут назад</p>
              ${
                isOwnPost
                  ? `<button class="delete-button" data-post-id="${post.id}">Удалить</button>`
                  : ""
              }
            </li>
        `;
    })
    .join("");

  const appHtml = `
      <div class="page-container">
        <div class="header-container"></div>
        <ul class="posts">
          ${postsHtml}
        </ul>
      </div>`;

  appEl.innerHTML = appHtml;

  for (const userImage of document.querySelectorAll(
    ".post-header__user-image"
  )) {
    userImage.addEventListener("click", (event) => {
      const userId = userImage.closest(".post-header").dataset.userId;
      console.log("Click Handler: userId =", userId); // Проверяем userId
      if (userId) {
        goToPage(USER_POSTS_PAGE, { userId: userId });
      }
    });
  }
}

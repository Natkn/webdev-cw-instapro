import { getPosts, getUserPosts } from "./api.js";
import { renderAddPostPageComponent } from "./components/add-post-page-component.js";
import { renderAuthPageComponent } from "./components/auth-page-component.js";
import {
  ADD_POSTS_PAGE,
  AUTH_PAGE,
  LOADING_PAGE,
  POSTS_PAGE,
  USER_POSTS_PAGE,
} from "./routes.js";
import { renderPostsPageComponent } from "./components/posts-page-component.js";
import { renderLoadingPageComponent } from "./components/loading-page-component.js";
import {
  getUserFromLocalStorage,
  removeUserFromLocalStorage,
  saveUserToLocalStorage,
} from "./helpers.js";
import { addPost } from "./api.js";
import { renderHeaderComponent } from "./components/header-component.js";
import { renderUserPostsPageComponent } from "./user-posts.js";

export let user = getUserFromLocalStorage();
export let page = null;
export let posts = [];

export const getToken = () => {
  const token = user ? `Bearer ${user.token}` : undefined;
  return token;
};

export const logout = () => {
  user = null;
  removeUserFromLocalStorage();
  goToPage(POSTS_PAGE);
};

/**
 * Включает страницу приложения
 */
export const goToPage = (newPage, data) => {
  page = newPage;
  renderApp(data);
  if (
    [
      POSTS_PAGE,
      AUTH_PAGE,
      ADD_POSTS_PAGE,
      USER_POSTS_PAGE,
      LOADING_PAGE,
    ].includes(newPage)
  ) {
    if (newPage === ADD_POSTS_PAGE) {
      /* Если пользователь не авторизован, то отправляем его на страницу авторизации перед добавлением поста */
      page = user ? ADD_POSTS_PAGE : AUTH_PAGE;
      return;
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
    }

    if (newPage === USER_POSTS_PAGE) {
      page = USER_POSTS_PAGE;
      posts = [];
      renderApp();
      return;
    }

    return;
  }
};

const appEl = document.createElement("div"); // Первое и единственное объявление
appEl.id = "app";
const headerContainer = document.createElement("div");
headerContainer.className = "header-container";
appEl.appendChild(headerContainer); // Добавляем headerContainer внутрь appEl
document.body.appendChild(appEl); // Добавляем appEl в DOM (вместе с headerContainer)

const renderApp = (data) => {
  const appEl = document.getElementById("app");

  if (page === LOADING_PAGE) {
    renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
    return; // Добавлено для выхода из функции
  }

  if (page === AUTH_PAGE) {
    renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
    return; // Добавлено для выхода из функции
  }

  if (page === ADD_POSTS_PAGE) {
    renderAddPostPageComponent({
      appEl,
      onAddPostClick: (postData) => {
        addPost({
          token: getToken(),
          imageUrl: postData.imageUrl,
          description: postData.description,
        })
          .then(() => {
            goToPage(POSTS_PAGE);
          })
          .catch((error) => {
            alert("Произошла ошибка при добавлении поста.");
          });
      },
    });
    return; // Добавлено для выхода из функции
  }

  if (page === POSTS_PAGE) {
    renderPostsPageComponent({
      appEl,
      user,
      token: getToken(),
    });
    return; // Добавлено для выхода из функции
  }
  const userImages = document.querySelectorAll(".post-header__user-image");

  for (const userImage of userImages) {
    userImage.addEventListener("click", () => {
      const userId = userImage.dataset.userId;
      goToPage(USER_POSTS_PAGE, { userId });
    });
  }

  if (page === USER_POSTS_PAGE) {
    if (!data || !data.userId) {
      return;
    }

    const userId = data.userId;
    renderLoadingPageComponent({ appEl, user, goToPage });
    getUserPosts({
      token: getToken(),
      userId: userId,
    })
      .then((userPosts) => {
        renderUserPostsPageComponent({
          appEl,
          posts: userPosts,
          goToPage,
          userId,
          user: user,
        });
      })
      .catch((error) => {
        appEl.innerHTML = `<h1>Ошибка загрузки постов пользователя</h1><p>${error.message}</p>`;
      });
    return;
  }
};

goToPage(POSTS_PAGE);

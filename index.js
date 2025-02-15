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

export let user = null;
export let page = null;
export let posts = [];
const setUser = (newUser) => {
  user = newUser;
};
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
  console.log("goToPage вызвана с:", newPage, data);
  if (newPage === undefined) {
    console.error("Ошибка: goToPage вызвана без аргумента newPage!");
    return; // Или выбросьте ошибку, чтобы остановить выполнение
  }

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
      return renderApp();
    }

    if (newPage === POSTS_PAGE) {
      page = LOADING_PAGE;
      renderApp();

      return getPosts({ token: getToken() })
        .then((newPosts) => {
          page = POSTS_PAGE;
          posts = newPosts;
          renderApp();
        })
        .catch((error) => {
          console.error(error);
          goToPage(POSTS_PAGE);
        });
    }

    if (newPage === USER_POSTS_PAGE) {
      console.log("Передаю data в renderApp:", data); // Добавил логирование
      renderApp(data); // Явно передаем data в renderApp
      return; // Важно: выходим из функции после рендеринга
    }

    renderApp(data);
  }
};

const appEl = document.createElement("div"); // Первое и единственное объявление
appEl.id = "app";

const headerContainer = document.createElement("div");
headerContainer.className = "header-container";
appEl.appendChild(headerContainer); // Добавляем headerContainer внутрь appEl

document.body.appendChild(appEl); // Добавляем appEl в DOM (вместе с headerContainer)

const renderApp = async (data) => {
  // 2. Просто получаем ссылку на существующий элемент
  const appEl = document.getElementById("app");
  if (!appEl) {
    console.warn("Элемент с id='app' не найден!");
    return;
  }

  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  if (page === AUTH_PAGE) {
    return renderAuthPageComponent({
      appEl,
      setUser: (newUser) => {
        user = newUser;
        saveUserToLocalStorage(user);
        goToPage(POSTS_PAGE);
      },
      user,
      goToPage,
    });
  }

  if (page === ADD_POSTS_PAGE) {
    return renderAddPostPageComponent({
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
            console.error("Ошибка при добавлении поста:", error);
            alert("Произошла ошибка при добавлении поста.");
          });
      },
    });
  }

  if (page === POSTS_PAGE) {
    return renderPostsPageComponent({
      appEl,
    });
  }

  if (page === USER_POSTS_PAGE) {
    console.log("Data перед использованием:", data);
    let userIdToLoad = null;

    if (data && data.userId) {
      userIdToLoad = data.userId;
    } else if (user && user._id) {
      userIdToLoad = user._id;
    } else {
      // Пользователь не залогинен или нет ID
      goToPage(AUTH_PAGE); // Перенаправляем на страницу авторизации
      return;
    }

    renderLoadingPageComponent({ appEl, user, goToPage });

    try {
      const userPosts = await getUserPosts({
        token: getToken(),
        userId: userIdToLoad,
      });
      renderUserPostsPageComponent({
        appEl,
        posts: userPosts,
        goToPage,
        userId: userIdToLoad,
        user: user,
      });
    } catch (error) {
      console.error("Ошибка при загрузке постов пользователя:", error);
      while (appEl.firstChild) {
        appEl.removeChild(appEl.firstChild);
      }
      let errorMessage = `Ошибка загрузки постов пользователя: ${error.message}`;
      if (error.message.includes("404")) {
        errorMessage = "Посты пользователя не найдены."; // Явное сообщение для 404
      }
      const errorEl = document.createElement("h1");
      errorEl.textContent = `Ошибка загрузки постов пользователя: ${error.message}`;
      appEl.appendChild(errorEl);
      return;
    }
  }
};

goToPage(POSTS_PAGE);

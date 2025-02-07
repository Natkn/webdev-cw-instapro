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
  page = newPage; // Сначала установите новую страницу
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
      console.log("Открываю страницу пользователя: ", data.userId);
      page = USER_POSTS_PAGE;
      posts = [];
      return renderApp();
    }

    page = newPage;
    renderApp();

    return;
  }

  throw new Error("страницы не существует");
};

const renderApp = async (data) => {
  const appEl = document.getElementById("app");
  console.log("appEl:", appEl);

  if (page === LOADING_PAGE) {
    return renderLoadingPageComponent({
      appEl,
      user,
      goToPage,
    });
  }

  renderHeaderComponent({
    element: document.querySelector(".header-container"),
  });

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
  // После отрисовки постов (после appEl.innerHTML = appHtml;)
  const userImages = document.querySelectorAll(".post-header__user-image"); // Находим все аватарки

  for (const userImage of userImages) {
    // Перебираем их
    userImage.addEventListener("click", () => {
      const userId = userImage.dataset.userId; // Получаем userId из атрибута data-user-id
      goToPage(USER_POSTS_PAGE, { userId }); // Переходим на страницу пользователя
    });
  }

  if (page === USER_POSTS_PAGE) {
    console.log("Data перед использованием:", data);
    if (!data || !data.userId) {
      console.error("Ошибка: data или data.userId не определены!");
      appEl.innerHTML =
        "<h1>Ошибка: Невозможно отобразить страницу пользователя</h1>";
      return; // Прерываем выполнение функции
    }

    const userId = data.userId;
    renderLoadingPageComponent({ appEl, user, goToPage });
    try {
      const userPosts = await getUserPosts({
        token: user.token,
        userId: userId,
      }); // <--- Правильный вызов getUserPosts
      renderUserPostsPageComponent({
        appEl,
        posts: userPosts,
        goToPage,
        userId,
      });
    } catch (error) {
      console.error("Ошибка при загрузке постов пользователя:", error);
      appEl.innerHTML = `<h1>Ошибка загрузки постов пользователя</h1><p>${error.message}</p>`;
    }
    return;
  }
};

goToPage(POSTS_PAGE);

import {
  getPosts,
  getUserPosts,
  likePost,
  dislikePost,
  deletePost,
} from "../api.js";
import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage, getToken, user } from "../index.js";
import * as dateFns from "date-fns";
import { ru } from "date-fns/locale";
import { parseISO, isValid } from "date-fns"; //  Импортируем parseISO и isValid

function escapeHtml(text) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, function (m) {
    return map[m];
  });
}

export function renderPostsPageComponent({ appEl, userId }) {
  let postsData = [];
  const render = () => {
    const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                 ${postsData
                   .map((post) => {
                     const isOwnPost =
                       user && post.user && post.user.id === user._id;
                     let dateToShow = null;
                     const createdAt = post.createdAt;
                     if (createdAt) {
                       if (typeof createdAt === "number") {
                         dateToShow = new Date(createdAt);
                       } else if (typeof createdAt === "string") {
                         const parsedDate = parseISO(createdAt);
                         if (isValid(parsedDate)) {
                           dateToShow = parsedDate;
                         } else {
                           console.error(
                             "Некорректный формат даты:",
                             createdAt
                           );
                         }
                       } else {
                         console.error(
                           "Неподдерживаемый тип данных для createdAt:",
                           typeof createdAt,
                           createdAt
                         );
                       }
                     } else {
                       console.error(
                         "createdAt отсутствует или имеет значение null/undefined"
                       );
                     }

                     let dateElement;

                     if (dateToShow) {
                       dateElement =
                         dateFns.formatDistanceToNow(dateToShow, {
                           locale: ru,
                         }) + " назад";
                     } else {
                       dateElement = "Некорректная дата";
                     }

                     return `
                    <li class="post" data-user-id="${post.user.id}">
                        <div class="post-header"  data-user-id="${
                          post.user.id
                        }">
                            <img src="${
                              post.user.imageUrl
                            }" class="post-header__user-image">
                            <p class="post-header__user-namez">${escapeHtml(
                              post.user.name
                            )}</p>
                            ${
                              isOwnPost
                                ? `<button class="delete-button" data-post-id="${post.id}" >Удалить</button>`
                                : ""
                            }
                        </div>
                        <div class="post-image-container">
                            <img class="post-image" src="${post.imageUrl}">
                        </div>
                        <div class="post-likes">
                            <button data-post-id="${
                              post.id
                            }" class="like-button ${
                       post.isLiked ? "liked" : ""
                     }"></button>
                            <p class="post-likes-text">
                                Нравится: <strong>${post.likes.length}</strong>
                            </p>
                        </div>
                        <p class="post-text">
                            <span class="user-name">${escapeHtml(
                              post.user.name
                            )}</span>
                            ${post.description}
                        </p>
                        <p class="post-date">
                            ${dateElement}
                        </p>
                    </li>`;
                   })
                   .join("")}
                </ul>
              </div>`;

    appEl.innerHTML = appHtml;

    renderHeaderComponent({
      element: document.querySelector(".header-container"),
      user,
    });

    for (let userEl of document.querySelectorAll(".post-header")) {
      userEl.addEventListener("click", () => {
        const userId = userEl.dataset.userId; //  Получаем userId из data-user-id
        goToPage(USER_POSTS_PAGE, { userId: userId });
      });
    }

    for (let likeButton of document.querySelectorAll(".like-button")) {
      likeButton.addEventListener("click", (event) => {
        event.stopPropagation();
        const postId = likeButton.dataset.postId;
        const post = postsData.find((post) => post.id === postId);

        if (post) {
          if (post.isLiked) {
            dislikePost({ token: getToken(), postId })
              .then(() => {
                post.likes = post.likes.filter((like) => {
                  if (like && like.user) {
                    return like.user.id !== user.id;
                  } else {
                    return false;
                  }
                });
                post.isLiked = false;
                likeButton.classList.remove("liked");
                render();
              })
              .catch((error) => {
                console.error("Ошибка при дизлайке поста:", error);
                alert("Произошла ошибка при дизлайке поста.");
              });
          } else {
            likePost({ token: getToken(), postId })
              .then(() => {
                post.likes.push({ user: user });
                post.isLiked = true;
                likeButton.classList.add("liked");
                render();
              })
              .catch((error) => {
                console.error("Ошибка при лайке поста:", error);
                alert("Произошла ошибка при лайке поста.");
              });
          }
        }
      });
    }
    for (let deleteButton of document.querySelectorAll(".delete-button")) {
      deleteButton.addEventListener("click", (event) => {
        event.stopPropagation(); //  Предотвращаем всплытие события
        const postId = deleteButton.dataset.postId;

        //  Вызываем функцию для удаления поста
        deletePost({ token: getToken(), postId })
          .then(() => {
            //  Удаляем пост из массива postsData
            postsData = postsData.filter((post) => post.id !== postId);
            //  Перерисовываем страницу
            render();
          })
          .catch((error) => {
            console.error("Ошибка при удалении поста:", error);
            alert("Произошла ошибка при удалении поста.");
          });
      });
    }
  };

  if (userId) {
    getUserPosts({ token: getToken(), userId })
      .then((data) => {
        postsData = data;
        render();
      })
      .catch((error) => {
        console.error("Ошибка при загрузке постов пользователя:", error);
        alert("Произошла ошибка при загрузке постов пользователя.");
      });
  } else {
    getPosts({ token: getToken() })
      .then((data) => {
        postsData = data;
        render();
      })
      .catch((error) => {
        console.error("Ошибка при загрузке постов:", error);
        alert("Произошла ошибка при загрузке постов.");
      });
  }
}

const backToTopButton = document.createElement("button");
backToTopButton.id = "back-to-top-btn";
backToTopButton.title = "Наверх";
backToTopButton.innerHTML = "&#8679;";

backToTopButton.style.display = "none";
backToTopButton.style.position = "fixed";
backToTopButton.style.bottom = "20px";
backToTopButton.style.right = "20px";
backToTopButton.style.zIndex = "99";
backToTopButton.style.border = "none";
backToTopButton.style.outline = "none";
backToTopButton.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
backToTopButton.style.color = "white";
backToTopButton.style.cursor = "pointer";
backToTopButton.style.padding = "10px";
backToTopButton.style.borderRadius = "5px";
backToTopButton.style.fontSize = "20px";
backToTopButton.style.transition = "all 0.3s ease";

document.body.appendChild(backToTopButton);

function scrollFunction() {
  if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
    backToTopButton.style.display = "block";
  } else {
    backToTopButton.style.display = "none";
  }
}

function backToTop() {
  document.body.scrollTop = 0;
  document.documentElement.scrollTop = 0;
}

window.onscroll = function () {
  scrollFunction();
};

backToTopButton.addEventListener("click", backToTop);

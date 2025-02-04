import { getPosts, getUserPosts, likePost, dislikePost } from "../api.js";
import { USER_POSTS_PAGE } from "../routes.js";
import { renderHeaderComponent } from "./header-component.js";
import { goToPage, getToken, user } from "../index.js";
import * as dateFns from "date-fns";
import { ru } from "date-fns/locale";
import { parseISO, isValid } from "date-fns"; //  Импортируем parseISO и isValid

export function renderPostsPageComponent({ appEl, userId }) {
  let postsData = [];
  const render = () => {
    const appHtml = `
              <div class="page-container">
                <div class="header-container"></div>
                <ul class="posts">
                 ${postsData
                   .map((post) => {
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
                    <li class="post">
                        <div class="post-header" data-user-id="${post.user.id}">
                            <img src="" class="post-header__user-image">
                            <p class="post-header__user-name">${
                              post.user.name
                            }</p>
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
                            <span class="user-name">${post.user.name}</span>
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
        goToPage(USER_POSTS_PAGE, {
          userId: userEl.dataset.userId,
        });
      });
    }

    for (let likeButton of document.querySelectorAll(".like-button")) {
      likeButton.addEventListener("click", () => {
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
  render();
}

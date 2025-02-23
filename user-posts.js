import { USER_POSTS_PAGE } from "./routes";
import * as dateFns from "date-fns";
import { ru } from "date-fns/locale";
import { parseISO, isValid } from "date-fns"; // Импортируем parseISO и isValid
import { user, getToken } from "./index.js";
import { renderHeaderComponent } from "./components/header-component.js";
import { escapeHtml } from "./components/posts-page-component.js";
import { deletePost, likePost, dislikePost } from "./api.js";

export function renderUserPostsPageComponent({ appEl, posts, user }) {
  while (appEl.firstChild) {
    appEl.removeChild(appEl.firstChild);
  }

  const headerEl = document.createElement("div");
  appEl.appendChild(headerEl);
  renderHeaderComponent({ element: headerEl, user: user });

  const postsListEl = document.createElement("ul");
  postsListEl.classList.add("posts");
  appEl.appendChild(postsListEl);

  renderHeaderComponent({ element: headerEl, user: user });

  if (!posts || posts.length === 0) {
    const noPostsEl = document.createElement("p");
    noPostsEl.textContent = "У этого пользователя пока нет постов.";
    appEl.appendChild(noPostsEl);
  } else {
    const postsListEl = document.createElement("ul");
    postsListEl.classList.add("posts");
    appEl.appendChild(postsListEl);

    const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");

    posts.forEach((post) => {
      const isLiked = likedPosts.includes(post.id);
      const postHtml = renderPostComponent({
        post: {
          ...post,
          isLiked: isLiked,
        },
        user: user,
        onDelete: () => {
          posts = posts.filter((p) => p.id !== post.id);
          renderUserPostsPageComponent({ appEl, posts, user });
        },
      });
      postsListEl.innerHTML += postHtml;
    });

    const deleteButtons = document.querySelectorAll(".delete-button");
    deleteButtons.forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        const postId = button.dataset.postId;

        deletePost({ token: getToken(), postId })
          .then(() => {
            posts = posts.filter((post) => post.id !== postId);

            renderUserPostsPageComponent({ appEl, posts, user });
          })
          .catch((error) => {
            console.error("Ошибка при удалении поста:", error);
            alert("Произошла ошибка при удалении поста.");
          });
      });
    });
  }

  const likeButtons = document.querySelectorAll(".like-button");
  likeButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const postId = button.dataset.postId;
      const post = posts.find((post) => post.id === postId);
      const likeButton = button;

      if (post) {
        let likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
        const isLiked = likedPosts.includes(post.id);

        if (isLiked) {
          dislikePost({ token: getToken(), postId })
            .then(() => {
              post.likes = post.likes.filter(
                (like) => !(like && like.user && like.user.id === user.id)
              );

              likedPosts = likedPosts.filter((id) => id !== postId);
              localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
              likeButton.classList.remove("liked");

              const postLikesText = button
                .closest(".post")
                .querySelector(".post-likes-text");
              if (postLikesText) {
                postLikesText.innerHTML = `Нравится: <strong>${Math.max(
                  0,
                  post.likes.length - 1
                )}</strong>`;
              }
            })
            .catch((error) => {
              console.error("Ошибка при дизлайке поста:", error);
              alert("Произошла ошибка при дизлайке поста.");
            });
        } else {
          likePost({ token: getToken(), postId })
            .then(() => {
              post.likes.push({ user: user });

              likedPosts.push(postId);
              localStorage.setItem("likedPosts", JSON.stringify(likedPosts));
              likeButton.classList.add("liked");

              const postLikesText = button
                .closest(".post")
                .querySelector(".post-likes-text");
              if (postLikesText) {
                postLikesText.innerHTML = `Нравится: <strong>${Math.max(
                  0,
                  post.likes.length - 1
                )}</strong>`;
              }
            })
            .catch((error) => {
              console.error("Ошибка при лайке поста:", error);
              alert("Произошла ошибка при лайке поста.");
            });
        }
      }
    });
  });
}
export function renderPostComponent({ post }) {
  const isOwnPost = user && post.user && post.user.id === user._id;
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
        console.error("Некорректный формат даты:", createdAt);
      }
    } else {
      console.error(
        "Неподдерживаемый тип данных для createdAt:",
        typeof createdAt,
        createdAt
      );
    }
  } else {
    console.error("createdAt отсутствует или имеет значение null/undefined");
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
  const likedPosts = JSON.parse(localStorage.getItem("likedPosts") || "[]");
  const isLiked = likedPosts.includes(post.id);
  return `
   <div class="page-container">
     <div class="header-container"></div>
      <ul class="posts">
    <li class="post"  data-post-id="${post.id}">
      <div class="post-header" data-user-id="${post.user.id}">
        <img src="${post.user.imageUrl}" class="post-header__user-image">
        <p class="post-header__user-name">${escapeHtml(post.user.name)}</p>
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
      ${
        user
          ? `<button data-post-id="${post.id}" class="like-button ${
              isLiked ? "liked" : ""
            }"></button>`
          : `<p>Войдите, чтобы лайкнуть</p>`
      }
        <p class="post-likes-text">
          Нравится: <strong>${post.likes.length}</strong>
        </p>
      </div>
      <p class="post-text">
        <span class="user-name">${escapeHtml(post.user.name)}</span>
        ${escapeHtml(post.description)}
      </p>
      <p class="post-date">
        ${dateElement}
      </p>
    </li>
    </ul>
  </div>`;
}

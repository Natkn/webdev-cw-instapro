import { USER_POSTS_PAGE } from "./routes";
import * as dateFns from "date-fns";
import { ru } from "date-fns/locale";
import { parseISO, isValid } from "date-fns"; // Импортируем parseISO и isValid
import { user, getToken } from "./index.js";
import { renderHeaderComponent } from "./components/header-component.js";
import { deletePost } from "./api.js";

export function renderUserPostsPageComponent({ appEl, posts, user }) {
  while (appEl.firstChild) {
    appEl.removeChild(appEl.firstChild);
  }

  const headerEl = document.createElement("div");
  appEl.appendChild(headerEl);

  // 2. Рендерим шапку в созданный элемент
  renderHeaderComponent({ element: headerEl, user: user });

  // Если постов нет, выводим сообщение
  if (!posts || posts.length === 0) {
    const noPostsEl = document.createElement("p");
    noPostsEl.textContent = "У этого пользователя пока нет постов.";
    appEl.appendChild(noPostsEl);
  } else {
    // Создаем список для постов
    const postsListEl = document.createElement("p");
    appEl.appendChild(postsListEl);

    posts.forEach((post) => {
      console.log("Данные поста перед рендерингом:", post);
      const postHtml = renderPostComponent({
        post: post,
      });
      postsListEl.innerHTML += postHtml;
    });
  }
}

export function renderPostComponent({ post }) {
  // Функция onDelete будет вызвана при нажатии на кнопку "Удалить" (если пост принадлежит пользователю)

  const isOwnPost = user && post.user && post.user.id === user.id;
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

  return `
   <div class="page-container">
     <div class="header-container"></div>
      <ul class="posts">
    <li class="post"  data-post-id="${post.id}">
      <div class="post-header" data-user-id="${post.user.id}">
        <img src="${post.imageUrl}" class="post-header__user-image">
        <p class="post-header__user-name">${post.user.name}</p>
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
        <button data-post-id="${post.id}" class="like-button ${
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
    </li>
    </ul>
  </div>`;
}

import { USER_POSTS_PAGE } from "./routes";

export function renderUserPostsPageComponent({
  appEl,
  posts,
  goToPage,
  userId,
}) {
  while (appEl.firstChild) {
    appEl.removeChild(appEl.firstChild);
  }

  // Создаем заголовок страницы
  const titleEl = document.createElement("h1");
  titleEl.textContent = `Посты пользователя ${userId}`;
  appEl.appendChild(titleEl);

  // Если постов нет, выводим сообщение
  if (!posts || posts.length === 0) {
    const noPostsEl = document.createElement("p");
    noPostsEl.textContent = "У этого пользователя пока нет постов.";
    appEl.appendChild(noPostsEl);
  } else {
    // Создаем список для постов
    const postsListEl = document.createElement("ul");
    appEl.appendChild(postsListEl);

    // Для каждого поста создаем элемент списка
    posts.forEach((post) => {
      const postItemEl = document.createElement("li");
      postItemEl.textContent = post.description; // Или другое свойство поста, которое вы хотите отобразить
      postsListEl.appendChild(postItemEl);
    });
  }
  const backButtonEl = document.createElement("button");
  backButtonEl.textContent = "Назад";
  backButtonEl.addEventListener("click", () => {
    goToPage(USER_POSTS_PAGE, { userId: userId });
  });
  appEl.appendChild(backButtonEl);
}

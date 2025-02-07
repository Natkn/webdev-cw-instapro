// components/user-posts-page-component.js
export function renderUserPostsPageComponent({
  appEl,
  posts,
  goToPage,
  userId,
}) {
  // Очищаем содержимое appEl (это важно!)
  appEl.innerHTML = "";

  // Создаем заголовок страницы
  const titleEl = document.createElement("h1");
  titleEl.textContent = `Посты пользователя ${userId}`;
  appEl.appendChild(titleEl);

  // Если постов нет, выводим сообщение
  if (!posts || posts.length === 0) {
    const noPostsEl = document.createElement("p");
    noPostsEl.textContent = "У этого пользователя пока нет постов.";
    appEl.appendChild(noPostsEl);
    return; // Завершаем функцию, если нет постов
  }

  // Создаем список для постов
  const postsListEl = document.createElement("ul");
  appEl.appendChild(postsListEl);

  // Для каждого поста создаем элемент списка
  posts.forEach((post) => {
    const postItemEl = document.createElement("li");
    postItemEl.textContent = post.description; // Или другое свойство поста, которое вы хотите отобразить
    postsListEl.appendChild(postItemEl);

    // Добавьте здесь код для отображения изображения, лайков и т.д.
  });

  // (Опционально) Добавьте кнопку "Назад"
  const backButtonEl = document.createElement("button");
  backButtonEl.textContent = "Назад";
  backButtonEl.addEventListener("click", () => {
    //  Переход на предыдущую страницу (например, главную страницу)
    //  Вам нужно будет настроить этот переход в соответствии с вашей логикой
    goToPage(SOME_OTHER_PAGE); // Замените SOME_OTHER_PAGE на константу для нужной страницы
  });
  appEl.appendChild(backButtonEl);
}

// Замени на свой, чтобы получить независимый от других набор данных.
// "боевая" версия инстапро лежит в ключе prod

const personalKey = "prod";
const baseHost = "https://webdev-hw-api.vercel.app";
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  const headers = {};
  if (token) {
    headers["Authorization"] = token;
  }
  return fetch(postsHost, {
    method: "GET",
    headers: {
      headers,
    },
  })
    .then((response) => {
      if (!response.ok) {
        // Убираем проверку status === 401
        throw new Error("Ошибка при загрузке постов"); //Изменили сообщение ошибки, тк теперь 401 не ожидается
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function registerUser({ login, password, name, imageUrl, token }) {
  return fetch(baseHost + "/api/user", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
      token,
    }),
  }).then((response) => {
    if (response.status === 400) {
      alert("Такой логин уже существует");
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + "/api/user/login", {
    method: "POST",
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error("Неверный логин или пароль");
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append("file", file);

  return fetch(baseHost + "/api/upload/image", {
    method: "POST",
    body: data,
  }).then((response) => {
    return response.json();
  });
}

// Добавляет пост
export function addPost({ token, imageUrl, description }) {
  return fetch(postsHost, {
    method: "POST",
    headers: {
      Authorization: token,
    },
    body: JSON.stringify({
      imageUrl,
      description,
    }),
  }).then((response) => {
    if (!response.ok) {
      throw new Error("Не удалось добавить пост");
    }
    return response.json();
  });
}

export function getUserPosts({ token, userId }) {
  const headers = {};
  if (token) {
    headers["Authorization"] = token;
  }
  return fetch(
    `${baseHost}/api/v1/${personalKey}/instapro/user-posts/${userId}`,
    {
      method: "GET",
      headers: {
        headers,
      },
    }
  )
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }
      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function likePost({ token, postId }) {
  return fetch(`${postsHost}/${postId}/like`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}

export function dislikePost({ token, postId }) {
  return fetch(`${postsHost}/${postId}/dislike`, {
    method: "POST",
    headers: {
      Authorization: token,
    },
  }).then((response) => {
    if (response.status === 401) {
      throw new Error("Нет авторизации");
    }
    return response.json();
  });
}

export function deletePost({ token, postId }) {
  return fetch(`${baseHost}/api/v1/${personalKey}/instapro/${postId}`, {
    method: "DELETE",
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error("Нет авторизации");
      }

      return response.json();
    })
    .then((data) => {
      return data.post;
    });
}

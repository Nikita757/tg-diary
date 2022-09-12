import redis from '../utils/redisclient';
const tdUrl = process.env.TODO_API_URL;

const reqHeaders = {
  'Content-Type': 'application/json',
  'User-Agent': 'telegrambot',
};

exports.start = async (bot: any, msg: any) => {
  bot.sendMessage(msg.chat.id, 'Welcome to the TODO bot!');
};

exports.help = async (bot: any, msg: any) => {
  bot.sendMessage(
    msg.chat.id,
    'Available commands: /start, /register, /login, /logout'
  );
};

exports.register = async (bot: any, msg: any) => {
  const [_, username, password] = msg.text.split(' ');
  const response = await fetch(tdUrl + 'register'!, {
    method: 'POST',
    headers: {
      ...reqHeaders,
    },
    body: JSON.stringify({
      name: username,
      password: password,
    }),
  });

  if (response.status === 201) {
    bot.sendMessage(msg.chat.id, 'Registered successfully!');
  } else {
    bot.sendMessage(msg.chat.id, 'Registration failed!');
  }
};

exports.login = async (bot: any, msg: any) => {
  const [_, username, password] = msg.text.split(' ');
  const response = await fetch(tdUrl + 'login'!, {
    method: 'POST',
    headers: {
      ...reqHeaders,
    },
    body: JSON.stringify({
      name: username,
      password: password,
    }),
  });

  const res = await response.json();
  if (response.status === 200) {
    const sessStr = JSON.stringify(res.session);
    redis
      .set(msg.chat.id, sessStr)
      .then(bot.sendMessage(msg.chat.id, 'Logged in successfully!'))
      .catch((err: any) => bot.sendMessage(msg.chat.id, err));
  } else {
    bot.sendMessage(msg.chat.id, 'Login failed!');
  }
};

exports.logout = async (bot: any, msg: any) => {
  let session;
  try {
    session = await get64EncodedSession(msg.chat.id);
  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Please login first!');
    return;
  }

  const response = await fetch(tdUrl + 'logout'!, {
    method: 'GET',
    headers: {
      ...reqHeaders,
      Authorization: 'Bearer ' + session,
    },
  });

  if (response.status === 200) {
    redis
      .del(msg.chat.id)
      .then(bot.sendMessage(msg.chat.id, 'Logged out successfully!'))
      .catch((err: any) => bot.sendMessage(msg.chat.id, err));
  } else {
    bot.sendMessage(msg.chat.id, 'Logout failed!');
  }
};

exports.addTask = async (bot: any, msg: any) => {
  let session;
  try {
    session = await get64EncodedSession(msg.chat.id);
  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Please login first!');
    return;
  }

  const [_, title, description] = msg.text.split(' ');
  const response = await fetch(tdUrl + 'task'!, {
    method: 'POST',
    headers: {
      ...reqHeaders,
      Authorization: 'Bearer ' + session,
    },
    body: JSON.stringify({
      title: title,
      description: description,
    }),
  });

  if (response.status === 201) {
    bot.sendMessage(msg.chat.id, 'Task added successfully!');
  } else if (response.status === 401) {
    bot.sendMessage(msg.chat.id, 'Unauthorized!');
  } else {
    bot.sendMessage(msg.chat.id, 'Failed to add task!');
  }
};

exports.getTask = async (bot: any, msg: any) => {
  let session;
  try {
    session = await get64EncodedSession(msg.chat.id);
  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Please login first!');
    return;
  }

  const [_, id] = msg.text.split(' ');
  const response = await fetch(tdUrl + 'task/' + id, {
    method: 'GET',
    headers: {
      ...reqHeaders,
      Authorization: 'Bearer ' + session,
    },
  });

  const res = await response.json();
  if (response.status === 200) {
    bot.sendMessage(msg.chat.id, tasksToMsg([res.task]));
  } else if (response.status === 401) {
    bot.sendMessage(msg.chat.id, 'Unauthorized!');
  } else {
    bot.sendMessage(msg.chat.id, 'Failed to get task!');
  }
};

exports.delTask = async (bot: any, msg: any) => {
  let session;
  try {
    session = await get64EncodedSession(msg.chat.id);
  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Please login first!');
    return;
  }

  const [_, id] = msg.text.split(' ');
  const response = await fetch(tdUrl + 'task/' + id, {
    method: 'DELETE',
    headers: {
      ...reqHeaders,
      Authorization: 'Bearer ' + session,
    },
  });

  if (response.status === 200) {
    bot.sendMessage(msg.chat.id, 'Task deleted successfully!');
  } else if (response.status === 401) {
    bot.sendMessage(msg.chat.id, 'Unauthorized!');
  } else {
    bot.sendMessage(msg.chat.id, 'Failed to delete task!');
  }
};

exports.changeTitle = async (bot: any, msg: any) => {
  let session;
  try {
    session = await get64EncodedSession(msg.chat.id);
  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Please login first!');
    return;
  }

  const [_, id, title] = msg.text.split(' ');
  const response = await fetch(tdUrl + 'task/' + id, {
    method: 'PATCH',
    headers: {
      ...reqHeaders,
      Authorization: 'Bearer ' + session,
    },
    body: JSON.stringify({
      title: title,
    }),
  });

  if (response.status === 200) {
    bot.sendMessage(msg.chat.id, 'Title changed successfully!');
  } else if (response.status === 401) {
    bot.sendMessage(msg.chat.id, 'Unauthorized!');
  } else {
    bot.sendMessage(msg.chat.id, 'Failed to change title!');
  }
};

exports.changeDescription = async (bot: any, msg: any) => {
  let session;
  try {
    session = await get64EncodedSession(msg.chat.id);
  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Please login first!');
    return;
  }

  const [_, id, ...description] = msg.text.split(' ');
  const response = await fetch(tdUrl + 'task/' + id, {
    method: 'PATCH',
    headers: {
      ...reqHeaders,
      Authorization: 'Bearer ' + session,
    },
    body: JSON.stringify({
      description: description,
    }),
  });

  if (response.status === 200) {
    bot.sendMessage(msg.chat.id, 'Description changed successfully!');
  } else if (response.status === 401) {
    bot.sendMessage(msg.chat.id, 'Unauthorized!');
  } else {
    bot.sendMessage(msg.chat.id, 'Failed to change description!');
  }
};

exports.changeStatus = async (bot: any, msg: any) => {
  let session;
  try {
    session = await get64EncodedSession(msg.chat.id);
  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Please login first!');
    return;
  }

  const [_, id, status] = msg.text.split(' ');
  const response = await fetch(tdUrl + 'task/' + id, {
    method: 'PATCH',
    headers: {
      ...reqHeaders,
      Authorization: 'Bearer ' + session,
    },
    body: JSON.stringify({
      status: status,
    }),
  });

  if (response.status === 200) {
    bot.sendMessage(msg.chat.id, 'Status changed successfully!');
  } else if (response.status === 401) {
    bot.sendMessage(msg.chat.id, 'Unauthorized!');
  } else {
    bot.sendMessage(msg.chat.id, 'Failed to change status!');
  }
};

exports.getAllTasks = async (bot: any, msg: any) => {
  let session;
  try {
    session = await get64EncodedSession(msg.chat.id);
  } catch (error) {
    bot.sendMessage(msg.chat.id, 'Please login first!');
    return;
  }

  const response = await fetch(tdUrl + 'tasks'!, {
    method: 'GET',
    headers: {
      ...reqHeaders,
      Authorization: 'Bearer ' + session,
    },
  });

  const res = await response.json();
  if (response.status === 200) {
    if (res.tasks.length === 0) {
      bot.sendMessage(msg.chat.id, 'No tasks found!');
      return;
    }

    bot.sendMessage(msg.chat.id, tasksToMsg(res.tasks));
  } else if (response.status === 401) {
    bot.sendMessage(msg.chat.id, 'Unauthorized!');
  } else {
    bot.sendMessage(msg.chat.id, 'Failed to get tasks!');
  }
};

const get64EncodedSession = async (id: any) => {
  const session = await getSessionForChatID(id);
  const session64 = Buffer.from(session).toString('base64');
  return session64;
};

const getSessionForChatID = async (id: any) => {
  const session = await redis.get(id);
  return session;
};

const tasksToMsg = (tasks: Array<Object>) => {
  let readableTasks = '';
  tasks.forEach((task: any) => {
    readableTasks += `ID: ${task.id}\nTitle: ${task.title}\nDescription: ${
      task.description
    }\n${
      task.due
        ? 'Created At: ' + task.createdAt + '\nDue: ' + task.due
        : 'Created At: ' + task.createdAt
    }\n${task.done ? 'Status: Done' : 'Status: In Progress'}\n\n`;
  });

  return readableTasks;
};

export default exports;

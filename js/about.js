import { getUser, getRepository } from './tools/githubUser.js';

let userAvatar = document.getElementsByClassName('user-avatar')[0];
let repoLastUpdated = document.getElementsByClassName('repo-description')[0];

let user = await getUser('bluesbaker');
let repo = await getRepository('bluesbaker', 'js-game-of-life');

userAvatar.src = user.avatar_url;
repoLastUpdated.innerHTML = 'upd: ' + new Date(repo.updated_at).toLocaleDateString("ru-RU");
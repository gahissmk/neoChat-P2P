const usersKey = 'neochat_users';
const currentUserKey = 'neochat_user';

function users() { return JSON.parse(localStorage.getItem(usersKey) || '{}'); }

function register() {
  const u = regUser.value.trim();
  const p = regPass.value.trim();
  if (!u || !p) return alert("Veuillez remplir les champs");
  const us = users();
  if (us[u]) return alert("Utilisateur existe");
  us[u] = { pass: btoa(p) };
  localStorage.setItem(usersKey, JSON.stringify(us));
  localStorage.setItem(currentUserKey, u);
  alert("Compte créé !");
  location.href = 'salons.html';
}

function login() {
  const u = loginUser.value.trim();
  const p = loginPass.value;
  const us = users();
  if (!us[u] || us[u].pass !== btoa(p)) return alert("Erreur pseudo ou mot de passe");
  localStorage.setItem(currentUserKey, u);
  location.href = 'salons.html';
}

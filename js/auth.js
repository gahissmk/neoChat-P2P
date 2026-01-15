const usersKey='neochat_users';
const sessionKey='neochat_session';

function users(){return JSON.parse(localStorage.getItem(usersKey)||'{}');}

function register(){
  const u=regUser.value.trim(),p=regPass.value.trim();
  if(!u||!p) return alert("Remplis les champs !");
  const us=users();
  if(us[u]) return alert('Utilisateur existe');
  us[u]={pass:btoa(p)};
  localStorage.setItem(usersKey,JSON.stringify(us));
  location.href='login.html';
}

function login(){
  const u=loginUser.value,p=loginPass.value;
  const us=users();
  if(!us[u]||us[u].pass!==btoa(p)) return alert('Erreur pseudo ou mot de passe');
  localStorage.setItem(sessionKey,u);
  location.href='index.html';
}

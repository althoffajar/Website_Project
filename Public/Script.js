// public/script.js

// ---------- Login ----------
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  if (!usernameInput || !passwordInput) return;

  const username = usernameInput.value.trim();
  const password = passwordInput.value;

  const res = await fetch("/Login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  document.getElementById("loginMessage") && (document.getElementById("loginMessage").textContent = data.message);

  if (data.success && data.username) {
    // store canonical username from DB (fixes case mismatch)
    localStorage.setItem("username", data.username);
    // redirect to main page
    window.location.href = "MainPage.html";
  }
});

// ---------- Register ----------
document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("regUsername")?.value.trim();
  const password = document.getElementById("regPassword")?.value;
  if (!username || !password) return;

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await res.json();
  document.getElementById("registerMessage") && (document.getElementById("registerMessage").textContent = data.message);
  if (data.success) showLoginForm();
});

// ---------- Switch forms ----------
function showRegisterForm() {
  document.getElementById("loginContainer") && (document.getElementById("loginContainer").style.display = "none");
  document.getElementById("registerContainer") && (document.getElementById("registerContainer").style.display = "block");
}
function showLoginForm() {
  document.getElementById("registerContainer") && (document.getElementById("registerContainer").style.display = "none");
  document.getElementById("loginContainer") && (document.getElementById("loginContainer").style.display = "block");
}

// ---------- MainPage: show account links if logged in ----------
document.addEventListener("DOMContentLoaded", () => {
  const accountPlace = document.getElementById("accountLinks");
  if (!accountPlace) return;
  const username = localStorage.getItem("username");
  if (username) {
    accountPlace.innerHTML = `
      <a href="Account.html">My Account (${username})</a>
      <button id="mpLogoutBtn" style="margin-left:10px;">Logout</button>
    `;
    document.getElementById("mpLogoutBtn")?.addEventListener("click", () => {
      localStorage.removeItem("username");
      window.location.href = "Login.html";
    });
  } else {
    accountPlace.innerHTML = `<a href="Login.html">Login</a>`;
  }
});

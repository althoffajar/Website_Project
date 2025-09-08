// ------------------------------------------------FRONTEND-------------------------------------------------------------------
// Handle login form submission
document.getElementById("loginForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  // Send request to backend
  const res = await fetch("/Login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();

  // Show message
  document.getElementById("loginMessage").textContent = data.message;

  if (data.success) {
    // Redirect to home if login successful
    localStorage.setItem("username", username);  // ✅ save username
    window.location.href = "MainPage.html";
  }
});


document.getElementById("registerForm")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;

  const res = await fetch("/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const data = await res.json();
  document.getElementById("registerMessage").textContent = data.message;

  if (data.success) {
    // After successful registration, switch back to login form
    showLoginForm();   // <-- helper added
  }
});


// 🔹 Switch between forms
function showRegisterForm() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("registerContainer").style.display = "block";
}

function showLoginForm() {
  document.getElementById("registerContainer").style.display = "none";
  document.getElementById("loginContainer").style.display = "block";
}
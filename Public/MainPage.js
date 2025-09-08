const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "login.html"; // Redirect if not logged in
} else {
  fetch(`/profile/${username}`)
    .then(res => res.json())
    .then(data => {
      const userProfile = document.getElementById("userProfile");

      const img = document.createElement("img");
      img.src = data.profilePic || "default.png"; // fallback if no picture
      img.alt = "Profile";
      img.classList.add("profile-icon");

      const span = document.createElement("span");
      span.textContent = username;

      userProfile.appendChild(img);
      userProfile.appendChild(span);
    });
}

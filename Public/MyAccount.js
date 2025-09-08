// Load profile data when page loads
const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "Login.html"; // redirect if not logged in
} else {
  document.getElementById("welcomeMessage").textContent = `Welcome, ${username}!`;

  fetch(`/profile/${username}`)
    .then(res => res.json())
    .then(data => {
      // Fill details section
      document.getElementById("displayFullname").textContent = data.fullname || "Not set";
      document.getElementById("displayEmail").textContent = data.email || "Not set";
      document.getElementById("displayDescription").textContent = data.description || "Not set";
      if (data.profilePic) {
        document.getElementById("profileImage").src = data.profilePic;
        document.getElementById("profilePreview").src = data.profilePic;
      }

      // Prefill form fields
      if (data.fullname) document.getElementById("fullname").value = data.fullname;
      if (data.email) document.getElementById("email").value = data.email;
      if (data.description) document.getElementById("description").value = data.description;
    });
}

// Handle profile form submit
document.getElementById("profileForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const formData = new FormData(document.getElementById("profileForm"));

  const res = await fetch(`/profile/${username}`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  document.getElementById("profileMessage").textContent = data.message;

  if (data.success) {
    // Update details view
    document.getElementById("displayFullname").textContent = formData.get("fullname") || "Not set";
    document.getElementById("displayEmail").textContent = formData.get("email") || "Not set";
    document.getElementById("displayDescription").textContent = formData.get("description") || "Not set";

    if (formData.get("profilePic").name) {
      const imgUrl = URL.createObjectURL(formData.get("profilePic"));
      document.getElementById("profileImage").src = imgUrl;
      document.getElementById("profilePreview").src = imgUrl;
    }

    // Switch back to details view
    document.getElementById("profileForm").style.display = "none";
    document.getElementById("profileDetails").style.display = "block";
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // ✅ Logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("username");
    alert("You have been logged out.");
    window.location.href = "Login.html";
  });

  // ✅ Delete Account
  document.getElementById("deleteBtn").addEventListener("click", async () => {
    if (!confirm("⚠️ Are you sure you want to delete your account? This cannot be undone.")) return;

    const res = await fetch(`/delete/${username}`, { method: "DELETE" });
    const data = await res.json();

    if (data.success) {
      localStorage.removeItem("username");
      alert("Your account has been deleted.");
      window.location.href = "MainPage.html";
    } else {
      alert("❌ Error deleting account: " + data.message);
    }
  });

  // ✅ Toggle Edit / Cancel
  document.getElementById("editBtn").addEventListener("click", () => {
    document.getElementById("profileDetails").style.display = "none";
    document.getElementById("profileForm").style.display = "block";
  });

  document.getElementById("cancelBtn").addEventListener("click", () => {
    document.getElementById("profileForm").style.display = "none";
    document.getElementById("profileDetails").style.display = "block";
  });
});

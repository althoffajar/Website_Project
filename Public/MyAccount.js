// public/account.js
document.addEventListener("DOMContentLoaded", async () => {
  const username = localStorage.getItem("username");
  if (!username) {
    // not logged in -> go to login
    window.location.href = "Login.html";
    return;
  }

  // Helper getters (safe)
  const byId = id => document.getElementById(id);
  const welcomeEl = byId("welcomeMessage");
  const profileImage = byId("profileImage");
  const profilePreview = byId("profilePreview");
  const displayFullname = byId("displayFullname");
  const displayEmail = byId("displayEmail");
  const displayDescription = byId("displayDescription");
  const profileMsg = byId("profileMessage");

  welcomeEl && (welcomeEl.textContent = `Welcome, ${username}!`);

  // Fetch profile
  try {
    const resp = await fetch(`/profile/${encodeURIComponent(username)}`);
    if (!resp.ok) {
      // user missing or server error -> force logout
      localStorage.removeItem("username");
      window.location.href = "Login.html";
      return;
    }
    const data = await resp.json();

    // fill details safely
    displayFullname && (displayFullname.textContent = data.fullname || "Not set");
    displayEmail && (displayEmail.textContent = data.email || "Not set");
    displayDescription && (displayDescription.textContent = data.description || "Not set");
    if (data.profilePic) {
      profileImage && (profileImage.src = data.profilePic);
      profilePreview && (profilePreview.src = data.profilePic);
    }

    // Prefill form
    if (byId("fullname")) byId("fullname").value = data.fullname || "";
    if (byId("email")) byId("email").value = data.email || "";
    if (byId("description")) byId("description").value = data.description || "";
  } catch (err) {
    // network or unexpected error -> redirect to login
    localStorage.removeItem("username");
    window.location.href = "Login.html";
    return;
  }

  // Form submit (update)
  const profileForm = byId("profileForm");
  profileForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    profileMsg && (profileMsg.textContent = "Saving...");
    const formData = new FormData(profileForm);

    try {
      const res = await fetch(`/profile/${encodeURIComponent(username)}`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      profileMsg && (profileMsg.textContent = data.message || (res.ok ? "Saved." : "Error"));

      if (res.ok && data.success) {
        // update UI
        const fullname = formData.get("fullname");
        const email = formData.get("email");
        const description = formData.get("description");

        displayFullname && (displayFullname.textContent = fullname || "Not set");
        displayEmail && (displayEmail.textContent = email || "Not set");
        displayDescription && (displayDescription.textContent = description || "Not set");

        // update image preview from uploaded file
        const file = formData.get("profilePic");
        if (file && file.name) {
          const url = URL.createObjectURL(file);
          profileImage && (profileImage.src = url);
          profilePreview && (profilePreview.src = url);
        }

        // hide edit, show details
        byId("profileForm") && (byId("profileForm").style.display = "none");
        byId("profileDetails") && (byId("profileDetails").style.display = "block");
      }
    } catch (err) {
      profileMsg && (profileMsg.textContent = "Network error while saving.");
    }
  });

  // Edit / Cancel buttons
  byId("editBtn")?.addEventListener("click", () => {
    byId("profileDetails") && (byId("profileDetails").style.display = "none");
    byId("profileForm") && (byId("profileForm").style.display = "block");
  });
  byId("cancelBtn")?.addEventListener("click", () => {
    byId("profileForm") && (byId("profileForm").style.display = "none");
    byId("profileDetails") && (byId("profileDetails").style.display = "block");
  });

  // Logout button
  byId("logoutBtn")?.addEventListener("click", () => {
    localStorage.removeItem("username");
    window.location.href = "Login.html";
  });

  // Delete account
  byId("deleteBtn")?.addEventListener("click", async () => {
    if (!confirm("⚠️ Are you sure you want to delete your account? This cannot be undone.")) return;
    try {
      const res = await fetch(`/delete/${encodeURIComponent(username)}`, { method: "DELETE" });
      const data = await res.json();
      if (res.ok && data.success) {
        localStorage.removeItem("username");
        alert("Account deleted.");
        window.location.href = "MainPage.html";
      } else {
        alert("Error deleting account: " + (data.message || "Unknown error"));
      }
    } catch (err) {
      alert("Network error while deleting account.");
    }
  });
});

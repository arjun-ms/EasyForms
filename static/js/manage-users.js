document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("access_token");
  const errorMessage = document.getElementById("error-message");
  const tbody = document.querySelector("#user-table tbody");
  const userCountEl = document.getElementById("user-count");

  if (!token) {
    errorMessage.textContent = "Please log in.";
    return;
  }

  fetch("user/users", {
    headers: {
      Authorization: "Bearer " + token
    }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to load users");
      return res.json();
    })
    .then(users => {
      // console.log("Fetched users:", users);    
      users.forEach(user => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${user.id}</td>
          <td><strong>${user.username}</strong></td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${user.is_active ? "Active" : "Inactive"}</td>
        `;
        tbody.appendChild(tr);
      });

      // ✅ Set total users correctly
      if (userCountEl) {
        userCountEl.textContent = users.length;
      } else {
        console.warn("Could not find #user-count element in HTML.");
      }
    })
    .catch(err => {
      errorMessage.textContent = err.message;
      console.error(err);
    });
});

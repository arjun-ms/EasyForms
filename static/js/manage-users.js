// document.addEventListener("DOMContentLoaded", () => {
//     const token = localStorage.getItem("access_token");
//     if (!token) {
//       document.getElementById("error-message").textContent = "Please log in.";
//       return;
//     }
  
//     fetch("user/users", {
//       headers: {
//         Authorization: "Bearer " + token
//       }
//     })
//       .then(res => {
//         if (!res.ok) throw new Error("Failed to load users");
//         return res.json();
//       })
//       .then(users => {
//         const tbody = document.querySelector("#user-table tbody");
//         users.forEach(user => {
//           const row = document.createElement("tr");
//           row.innerHTML = `
//             <td>${user.id}</td>
//             <td>${user.username}</td>
//             <td>${user.email}</td>
//             <td>${user.role}</td>
//             <td>${user.is_active ? "Active" : "Inactive"}</td>
//           `;
//           tbody.appendChild(row);
//         });
//       })
//       .catch(err => {
//         document.getElementById("error-message").textContent = err.message;
//         console.error(err);
//       });
//   });
  
//----
//----
//----

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

      // Update user count
      userCountEl.textContent = users.length;
    })
    .catch(err => {
      errorMessage.textContent = err.message;
      console.error(err);
    });
});

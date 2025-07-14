// document.addEventListener("DOMContentLoaded", function () {
//     fetchForms();
//   });

//   function fetchForms() {
//     const token = localStorage.getItem("access_token");

//     if (!token) {
//       displayError("Access token not found. Please log in.");
//       return;
//     }

//     fetch("/forms", {
//       headers: {
//         Authorization: "Bearer " + token,
//       },
//     })
//       .then(async (response) => {
//         if (!response.ok) {
//           const error = await response.json();
//           throw new Error(error.detail || "Failed to fetch forms.");
//         }
//         return response.json();
//       })
//       .then((forms) => {
//         if (!Array.isArray(forms)) {
//           throw new Error("Unexpected response format.");
//         }

//         const list = document.getElementById("form-list");
//         list.innerHTML = "";

//         // forms.forEach((form) => {
//         //     const li = document.createElement("li");
//         //     li.innerHTML = `
//         //       <strong>${form.title}</strong> - ${form.description || ""}<br/>
//         //       <button onclick="editForm(${form.id})">Edit</button>
//         //       <button onclick="deleteForm(${form.id})">Delete</button>
//         //       <button onclick="reassignForm(${form.id})">Reassign</button>
//         //       <hr/>
//         //     `;
//         //     list.appendChild(li);
//         //   });
//         forms.forEach((form) => {
//           const li = document.createElement("li");

//           const assignedUser = form.assigned_user
//             ? `<span style="background-color:#4CAF50; color:white; padding:4px 8px; border-radius:5px; font-size: 0.9rem;">Assigned to ${form.assigned_user.username}</span>`
//             : `<span style="background-color:#f44336; color:white; padding:4px 8px; border-radius:5px; font-size: 0.9rem;">Not assigned</span>`;

//           li.innerHTML = `
//             <strong>${form.title}</strong> - ${form.description || ""}
//             <br/><br/>
//             <button onclick="editForm(${form.id})">Edit</button>
//             <button onclick="deleteForm(${form.id})">Delete</button>
//             <button onclick="viewSubmissions(${form.id})">View Submissions</button>
//             <br/><br/>
//             ${assignedUser}
//             <hr/>
//           `;

//           list.appendChild(li);
//         });

//       })
//       .catch((err) => {
//         displayError(err.message);
//         console.error("Failed to fetch forms:", err.message);
//       });
//   }

//   function editForm(formId) {
//     localStorage.setItem("edit_form_id", formId);
//     window.location.href = `/form-builder`; // we'll load form data there
//   }

//   async function deleteForm(formId) {
//     const token = localStorage.getItem("access_token");
//     if (!token) return displayError("Token not found");

//     if (!confirm("Are you sure you want to delete this form?")) return;

//     try {
//       const res = await fetch(`/forms/${formId}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: "Bearer " + token,
//         },
//       });

//       if (!res.ok) throw new Error("Failed to delete form");
//       alert("Form deleted");
//       fetchForms();
//     } catch (err) {
//       displayError(err.message);
//     }
//   }

//   async function reassignForm(formId) {
//     const token = localStorage.getItem("access_token");
//     if (!token) return displayError("Token not found");

//     const userId = prompt("Enter user ID to reassign form to:");
//     if (!userId) return;

//     try {
//       const res = await fetch(`/forms/${formId}/assign`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: "Bearer " + token,
//         },
//         body: JSON.stringify({ user_id: parseInt(userId) }),
//       });

//       if (!res.ok) throw new Error("Failed to reassign form");
//       alert("Form reassigned");
//       fetchForms(); //- Refresh the dashboard with updated assignment
//     } catch (err) {
//       displayError(err.message);
//     }
//   }

//   function displayError(message) {
//     const errorBox = document.getElementById("error-message");
//     if (errorBox) errorBox.textContent = message;
//   }

//   function viewSubmissions(formId) {
//     localStorage.setItem("view_submissions_form_id", formId);
//     window.location.href = "/submission-history";
//   }

//!========================================

document.addEventListener("DOMContentLoaded", function () {
  fetchForms();
});

function fetchForms() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    displayError("Access token not found. Please log in.");
    return;
  }

  fetch("/forms", {
    headers: {
      Authorization: "Bearer " + token,
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Failed to fetch forms.");
      }
      return response.json();
    })
    .then((forms) => {
      if (!Array.isArray(forms)) {
        throw new Error("Unexpected response format.");
      }

      const container = document.getElementById("form-list");
      container.innerHTML = "";

      if (forms.length === 0) {
        container.innerHTML =
          '<div class="empty-state">No forms found. Create your first form!</div>';
        return;
      }

      forms.forEach((form) => {
        const formCard = document.createElement("div");
        formCard.className = "form-card";

        const assignedUser = form.assigned_user
          ? `<span class="assignment-tag assigned">
               <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                 <path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd" />
               </svg>
               Assigned to ${form.assigned_user.username}
             </span>`
          : `<span class="assignment-tag unassigned">
               <svg class="icon" fill="currentColor" viewBox="0 0 20 20">
                 <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
               </svg>
               Not assigned
             </span>`;

        formCard.innerHTML = `
          <div class="form-info">
            <h3 class="form-title">${form.title}</h3>
            <p class="form-description">${
              form.description || "No description provided"
            }</p>
            ${assignedUser}
          </div>
          <div class="form-actions">
            <button class="btn btn-secondary btn-sm" onclick="editForm(${
              form.id
            })">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button class="btn btn-secondary btn-sm" onclick="deleteForm(${
              form.id
            })">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <button class="btn btn-primary btn-sm" onclick="viewSubmissions(${
              form.id
            })">
              <svg class="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Submissions
            </button>
          </div>
        `;

        container.appendChild(formCard);
      });
    })
    .catch((err) => {
      displayError(err.message);
      console.error("Failed to fetch forms:", err.message);
    });
}

function editForm(formId) {
  localStorage.setItem("edit_form_id", formId);
  window.location.href = `/form-builder`; // we'll load form data there
}

async function deleteForm(formId) {
  const token = localStorage.getItem("access_token");
  if (!token) return displayError("Token not found");

  if (!confirm("Are you sure you want to delete this form?")) return;

  try {
    const res = await fetch(`/forms/${formId}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer " + token,
      },
    });

    if (!res.ok) throw new Error("Failed to delete form");
    alert("Form deleted");
    fetchForms();
  } catch (err) {
    displayError(err.message);
  }
}

async function reassignForm(formId) {
  const token = localStorage.getItem("access_token");
  if (!token) return displayError("Token not found");

  const userId = prompt("Enter user ID to reassign form to:");
  if (!userId) return;

  try {
    const res = await fetch(`/forms/${formId}/assign`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + token,
      },
      body: JSON.stringify({ user_id: parseInt(userId) }),
    });

    if (!res.ok) throw new Error("Failed to reassign form");
    alert("Form reassigned");
    fetchForms(); //- Refresh the dashboard with updated assignment
  } catch (err) {
    displayError(err.message);
  }
}

function displayError(message) {
  const errorBox = document.getElementById("error-message");
  if (errorBox) {
    errorBox.textContent = message;
    errorBox.style.display = message ? "block" : "none";
  }
}

function viewSubmissions(formId) {
  localStorage.setItem("view_submissions_form_id", formId);
  window.location.href = "/submission-history";
}

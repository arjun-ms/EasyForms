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
  
        const list = document.getElementById("form-list");
        list.innerHTML = "";
  
        forms.forEach((form) => {
            const li = document.createElement("li");
            li.innerHTML = `
              <strong>${form.title}</strong> - ${form.description || ""}<br/>
              <button onclick="editForm(${form.id})">Edit</button>
              <button onclick="deleteForm(${form.id})">Delete</button>
              <button onclick="reassignForm(${form.id})">Reassign</button>
              <hr/>
            `;
            list.appendChild(li);
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
    } catch (err) {
      displayError(err.message);
    }
  }
  
  
  function displayError(message) {
    const errorBox = document.getElementById("error-message");
    if (errorBox) errorBox.textContent = message;
  }
  
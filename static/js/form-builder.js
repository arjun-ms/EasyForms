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
          li.textContent = form.title + " - " + (form.description || "");
          list.appendChild(li);
        });
      })
      .catch((err) => {
        displayError(err.message);
        console.error("Failed to fetch forms:", err.message);
      });
  }
  
  function displayError(message) {
    const errorBox = document.getElementById("error-message");
    errorBox.textContent = message;
  }
  
document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("access_token");
  const list = document.getElementById("submission-list");

  if (!token) {
    alert("Please log in.");
    window.location.href = "/login.html";
    return;
  }

  //- Decode token to get role
  const payload = JSON.parse(atob(token.split(".")[1]));
  const role = payload.role || payload.type;
  const isAdmin = role === "admin";

  console.log(`Decoded role from token: ${role}`);

  // Check user role or presence of token to decide whether to clear it
  //! const isAdmin = localStorage.getItem("user_role") === "admin";
  const formId = isAdmin
    ? localStorage.getItem("view_submissions_form_id")
    : null;

  // console.log(`is Admin: ${isAdmin}`)
  // console.log("Form ID:", formId);

  if (!isAdmin) {
    // Not admin -> remove this key
    localStorage.removeItem("view_submissions_form_id");
  }

  try {
    let submissions = [];

    // console.log(`form id ${formId}`);

    //- 👤 USER VIEW: If no formId present, it's the logged-in user's own submissions
    if (!formId) {
      // console.log("THIS IS INSIDE USER: SHOW SUBMISSIONS");

      const res = await fetch(apiBaseUrl + "/user/forms/", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch your submissions.");

      submissions = await res.json();
    }

    //- 👮‍♂️ ADMIN VIEW: Show submissions for a selected form
    else {
      console.log("THIS IS INSIDE ADMIN: SHOW SUBMISSIONS");
      console.log(localStorage.getItem("view_submissions_form_id"));

      const res = await fetch(`${apiBaseUrl}/forms/${formId}/submissions`, {
        headers: {
          Authorization: "Bearer " + token,
        },
      });

      if (!res.ok) throw new Error("Failed to fetch form submissions (admin).");

      submissions = await res.json();

      console.log("Admin Form ID:", formId);
      console.log("Fetched Submissions:", submissions);
    }

    if (!Array.isArray(submissions) || submissions.length === 0) {
      list.innerHTML = "<p>No submissions found.</p>";
      return;
    }

    // 🧾 Render each submission as a card
    submissions.forEach((sub) => {
      const card = document.createElement("div");
      card.className = "card mb-3 shadow-sm";

      const actualResponse =
        sub.response_data?.response_data || sub.response_data || {};

      const responseTableRows = Object.entries(actualResponse)
        .map(
          ([key, value]) => `
          <tr>
            <td>${key}</td>
            <td>${
              typeof value === "object" ? JSON.stringify(value) : value
            }</td>
          </tr>`
        )
        .join("");

      card.innerHTML = `
        <div class="card-body">
          <h5 class="card-title">
            <i class="bi bi-journal-text me-2"></i>${
              sub.form?.title || "Untitled Form"
            }
          </h5>
          <h6 class="card-subtitle mb-2 text-muted">
            <i class="bi bi-calendar-event me-2"></i>${new Date(
              sub.submitted_at
            ).toLocaleString()}
          </h6>

          ${
            sub.user?.username
              ? `<p class="text-info"><i class="bi bi-person-fill me-2"></i><strong>Submitted by:</strong> ${sub.user.username}</p>`
              : ""
          }

          <p class="mt-3 mb-1 fw-bold">
            <i class="bi bi-list-check me-2 text-success"></i>Response Data:
          </p>

          <div class="table-responsive">
            <table class="table table-bordered table-sm">
              <thead class="table-light">
                <tr><th>Key</th><th>Value</th></tr>
              </thead>
              <tbody>
                ${responseTableRows}
              </tbody>
            </table>
          </div>
        </div>
      `;

      list.appendChild(card);
    });
  } catch (err) {
    list.innerHTML = `<p class="text-danger">Error: ${err.message}</p>`;
  }
});

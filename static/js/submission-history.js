document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("access_token");
    const list = document.getElementById("submission-list");
  
    if (!token) {
      alert("Please log in.");
      window.location.href = "/login.html";
      return;
    }
  
    try {
      const res = await fetch("/user/forms", {
        headers: {
          Authorization: "Bearer " + token,
        },
      });
  
      if (!res.ok) {
        throw new Error("Failed to fetch submissions.");
      }
  
      const submissions = await res.json();
  
      if (submissions.length === 0) {
        list.innerHTML = "<li>No submissions found.</li>";
      } else {
        
        //- Formatting Submissions
        
        submissions.forEach((sub) => {
          const card = document.createElement("div");
          card.className = "card mb-3 shadow-sm";
        
          // ✅ Fix: dig into sub.response_data.response_data
          const actualResponse = sub.response_data.response_data || sub.response_data; // fallback if already flat
        
          const responseTableRows = Object.entries(actualResponse).map(
            ([key, value]) => `
              <tr>
                <td>${key}</td>
                <td>${typeof value === 'object' ? JSON.stringify(value) : value}</td>
              </tr>
            `
          ).join("");
        
          card.innerHTML = `
            <div class="card-body">
              <h5 class="card-title">
                <i class="bi bi-journal-text me-2"></i>${sub.form?.title || "Untitled Form"}
              </h5>
              <h6 class="card-subtitle mb-2 text-muted">
                <i class="bi bi-calendar-event me-2"></i>${new Date(sub.submitted_at).toLocaleString()}
              </h6>
        
              <p class="mt-3 mb-1 fw-bold">
                <i class="bi bi-list-check me-2 text-success"></i>Response Data:
              </p>
        
              <div class="table-responsive">
                <table class="table table-bordered table-sm">
                  <thead class="table-light">
                    <tr>
                      <th>Key</th>
                      <th>Value</th>
                    </tr>
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
 
      }
    } catch (err) {
      list.innerHTML = `<li>Error: ${err.message}</li>`;
    }
  });
  
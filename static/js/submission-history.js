document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("access_token");
    const list = document.getElementById("submission-list");
  
    if (!token) {
      alert("Please log in.");
      window.location.href = "/login.html";
      return;
    }
  
    try {
      const res = await fetch("/submissions", {
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
        submissions.forEach((sub) => {
          const li = document.createElement("li");
          li.innerHTML = `
            <strong>Form ID:</strong> ${sub.form_id}<br/>
            <strong>Date:</strong> ${new Date(sub.submitted_at).toLocaleString()}<br/>
            <strong>Data:</strong> <pre>${JSON.stringify(sub.response_data, null, 2)}</pre>
            <hr/>
          `;
          list.appendChild(li);
        });
      }
    } catch (err) {
      list.innerHTML = `<li>Error: ${err.message}</li>`;
    }
  });
  
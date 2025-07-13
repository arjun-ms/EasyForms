document
  .getElementById("login-form")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData();
    formData.append("username", document.getElementById("username").value);
    formData.append("password", document.getElementById("password").value);

    const res = await fetch("/user/login", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    if (res.ok) {
      const token = data.access_token;
      localStorage.setItem("access_token", token);
      // localStorage.setItem("user_role", data.role);
      
      // Decode token to extract role
      const payload = JSON.parse(atob(token.split(".")[1]));
      // console.log(`PAYLOAD: ${payload}`)

      const role = payload.role || payload.type;
      // console.log(`ROLE from payload: ${payload}`)

      // Redirect based on role
      if (role === "admin") {
        window.location.href = "/admin";
      } else if (role === "user") {
        window.location.href = "/user";
      } else {
        console.log("Role : ", role);
        alert("Unknown role. Access denied.");
      }
    } else {
      alert("Login failed: " + (data.detail || "Invalid credentials"));
    }
  });

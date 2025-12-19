// Smart Water Login JavaScript

// If already logged in, redirect to dashboard
if (localStorage.getItem("user")) {
    window.location.href = "index.html";
}

function login() {
    const name = document.getElementById("name").value.trim();
    const address = document.getElementById("address").value.trim();
    const block = document.getElementById("block").value.trim();
    const city = document.getElementById("city").value.trim();

    // Clear previous error
    document.getElementById("error").innerText = "";

    // Validation
    if (!name || !address || !block || !city) {
        document.getElementById("error").innerText = "All fields are required.";
        return;
    }

    // Create user object
    const user = {
        name,
        address,
        block,
        city
    };

    // Store in localStorage
    localStorage.setItem("user", JSON.stringify(user));

    // Redirect to dashboard
    window.location.href = "index.html";
}

// Add enter key support for form submission
document.addEventListener("DOMContentLoaded", function() {
    const inputs = document.querySelectorAll("input");
    inputs.forEach(input => {
        input.addEventListener("keypress", function(event) {
            if (event.key === "Enter") {
                login();
            }
        });
    });
});

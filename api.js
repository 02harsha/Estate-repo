function login(){
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const data = {
        email,
        password
    };
    fetch("http://localhost:3000/api/users/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

function register(){
    const full_name = document.getElementById("full_name").value;
    const email = document.getElementById("email").value;
    const phone_number = document.getElementById("phone_number").value;
    const password = document.getElementById("password").value;
    const referral_code = document.getElementById("referral_code").value;
    const data = {
        full_name,
        email,
        phone_number,
        password,
        referral_code
    };
    fetch("http://localhost:3000/api/users/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.error("Error:", error);
    });
}

let signupForm = document.getElementById("signupForm");
let loginForm = document.getElementById("loginForm");

let generateUserId = (name) => {
    let cleanName = name.trim().replace(/\s+/g, "").toUpperCase();
    let base = cleanName.substring(0, 6);
    let users = getUsers();
    let userId = base + "01";
    let number = 1;

    while (users.some(user => user.userId === userId)) {
        number++;
        userId = base + String(number).padStart(2, "0");
    }

    return userId;
};

if (signupForm) {
    signupForm.addEventListener("submit", (event) => {
        event.preventDefault();

        let name = document.getElementById("signupName").value.trim();
        let email = document.getElementById("signupEmail").value.trim().toLowerCase();
        let userIdInput = document.getElementById("signupUserId").value.trim().toUpperCase();
        let password = document.getElementById("signupPassword").value;

        let nameError = document.getElementById("nameError");
        let emailError = document.getElementById("emailError");
        let userIdError = document.getElementById("userIdError");
        let passwordError = document.getElementById("passwordError");
        let signupMessage = document.getElementById("signupMessage");

        nameError.textContent = "";
        emailError.textContent = "";
        userIdError.textContent = "";
        passwordError.textContent = "";
        signupMessage.textContent = "";
        signupMessage.className = "auth-message";

        let users = getUsers();
        let valid = true;

        if (name.length < 2) {
            nameError.textContent = "Enter a valid name.";
            valid = false;
        }

        if (!email.includes("@") || !email.includes(".")) {
            emailError.textContent = "Enter a valid email.";
            valid = false;
        }

        let existingEmail = users.some(user => user.email === email);

        if (existingEmail) {
            emailError.textContent = "This email is already registered.";
            valid = false;
        }

        let userId = userIdInput;

        if (userId.length < 4) {
    userIdError.textContent = "User ID must contain at least 4 characters.";
    valid = false;
}

        let userIdPattern = /^[A-Z0-9_]+$/;

        if (!userIdPattern.test(userId)) {
        userIdError.textContent = "Use only letters, numbers and underscore.";
        valid = false;
}

        let existingUserId = users.some(
        user => user.userId.toUpperCase() === userId
);

        if (existingUserId) {
    userIdError.textContent = "This User ID is already taken.";
    valid = false;
}

        let passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[_\W]).{6,}$/;

        if (!passwordPattern.test(password)) {
        passwordError.textContent = "Use 6+ characters with uppercase, lowercase, number and symbol/underscore.";
        valid = false;
        }

        if (!valid) {
            return;
        }

        let newUser = {
            userId: userId,
            name: name,
            email: email,
            password: password,
            groups: [],
            createdAt: new Date().toISOString()
        };

        users.push(newUser);
        saveUsers(users);

        signupMessage.textContent = "Account created successfully! Your User ID is " + userId;
        signupMessage.className = "auth-message success";

        signupForm.reset();

        setTimeout(() => {
            window.location.href = "login.html";
        }, 1800);
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", (event) => {
        event.preventDefault();

        let loginId = document.getElementById("loginId").value.trim().toLowerCase();
        let password = document.getElementById("loginPassword").value;

        let loginMessage = document.getElementById("loginMessage");

        loginMessage.textContent = "";
        loginMessage.className = "auth-message";

        let users = getUsers();

        let user = users.find(item =>
            item.email.toLowerCase() === loginId ||
            item.userId.toLowerCase() === loginId
        );

        if (!user) {
            loginMessage.textContent = "User ID or email not found.";
            loginMessage.className = "auth-message error";
            return;
        }

        if (user.password !== password) {
            loginMessage.textContent = "Incorrect password.";
            loginMessage.className = "auth-message error";
            return;
        }

        saveCurrentUser({
            userId: user.userId,
            name: user.name,
            email: user.email,
            groups: user.groups
        });

        loginMessage.textContent = "Login successful! Redirecting...";
        loginMessage.className = "auth-message success";

        setTimeout(() => {
            window.location.href = "dashboard.html";
        }, 1000);
    });
}

let togglePassword = (inputId, button) => {
    let input = document.getElementById(inputId);
    let icon = button.querySelector("i");

    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("fa-eye");
        icon.classList.add("fa-eye-slash");
    } else {
        input.type = "password";
        icon.classList.remove("fa-eye-slash");
        icon.classList.add("fa-eye");
    }
};
let currentUser = getCurrentUser();

if (!currentUser) {
    window.location.href = "login.html";
}

let users = getUsers();

let storedUser = users.find(
    user => user.userId === currentUser.userId
);

if (!storedUser) {
    window.location.href = "login.html";
}

let profileForm = document.getElementById("profileForm");
let passwordForm = document.getElementById("passwordForm");

let profileName = document.getElementById("profileName");
let profileUserId = document.getElementById("profileUserId");
let profileEmail = document.getElementById("profileEmail");
let profilePhone = document.getElementById("profilePhone");

let editProfile = document.getElementById("editProfile");
let saveProfile = document.getElementById("saveProfile");

let profileMessage = document.getElementById("profileMessage");

let currentPassword = document.getElementById("currentPassword");
let verifyPassword = document.getElementById("verifyPassword");

let verificationMessage = document.getElementById("verificationMessage");
let newPasswordSection = document.getElementById("newPasswordSection");
let newPassword = document.getElementById("newPassword");
let passwordMessage = document.getElementById("passwordMessage");

let lengthCheck = document.getElementById("lengthCheck");
let uppercaseCheck = document.getElementById("uppercaseCheck");
let lowercaseCheck = document.getElementById("lowercaseCheck");
let numberCheck = document.getElementById("numberCheck");
let symbolCheck = document.getElementById("symbolCheck");

profileName.value = currentUser.name || "";
profileUserId.value = currentUser.userId || "";
profileEmail.value = currentUser.email || "";
profilePhone.value = currentUser.phone || "";

editProfile.addEventListener("click", () => {

    profileName.disabled = false;
    profileEmail.disabled = false;
    profilePhone.disabled = false;

    editProfile.style.display = "none";
    saveProfile.style.display = "flex";

    profileMessage.textContent = "";
});

profileForm.addEventListener("submit", (event) => {

    event.preventDefault();

    let name = profileName.value.trim();
    let email = profileEmail.value.trim().toLowerCase();
    let phone = profilePhone.value.trim();

    if (name.length < 2) {
        profileMessage.textContent = "Please enter a valid name.";
        profileMessage.className = "profile-message error";
        return;
    }

    if (!email.includes("@") || !email.includes(".")) {
        profileMessage.textContent = "Please enter a valid email.";
        profileMessage.className = "profile-message error";
        return;
    }

    if (phone && !/^[0-9]{10}$/.test(phone)) {
        profileMessage.textContent = "Phone number must contain 10 digits.";
        profileMessage.className = "profile-message error";
        return;
    }

    let emailTaken = users.some(user =>
        user.email.toLowerCase() === email &&
        user.userId !== currentUser.userId
    );

    if (emailTaken) {
        profileMessage.textContent = "This email is already registered.";
        profileMessage.className = "profile-message error";
        return;
    }

    let userIndex = users.findIndex(
        user => user.userId === currentUser.userId
    );

    users[userIndex].name = name;
    users[userIndex].email = email;
    users[userIndex].phone = phone;

    currentUser.name = name;
    currentUser.email = email;
    currentUser.phone = phone;

    saveUsers(users);
    saveCurrentUser(currentUser);

    profileName.disabled = true;
    profileEmail.disabled = true;
    profilePhone.disabled = true;

    editProfile.style.display = "flex";
    saveProfile.style.display = "none";

    profileMessage.textContent = "Changes saved successfully.";
    profileMessage.className = "profile-message success";
});

verifyPassword.addEventListener("click", () => {

    let enteredPassword = currentPassword.value;

    if (enteredPassword === "") {

        verificationMessage.textContent =
            "Please enter your current password.";

        verificationMessage.className =
            "profile-message error";

        return;
    }

    if (enteredPassword !== storedUser.password) {

        verificationMessage.textContent =
            "Incorrect password. Please try again.";

        verificationMessage.className =
            "profile-message error";

        newPasswordSection.classList.remove("verified");

        return;
    }

    verificationMessage.textContent =
        "Password verified successfully.";

    verificationMessage.className =
        "profile-message success";

    newPasswordSection.classList.add("verified");

    currentPassword.disabled = true;
    verifyPassword.disabled = true;
});

newPassword.addEventListener("input", () => {

    let password = newPassword.value;

    let hasLength = password.length >= 6;
    let hasUppercase = /[A-Z]/.test(password);
    let hasLowercase = /[a-z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let hasSymbol = /[_\W]/.test(password);

    updatePasswordCheck(lengthCheck, hasLength);
    updatePasswordCheck(uppercaseCheck, hasUppercase);
    updatePasswordCheck(lowercaseCheck, hasLowercase);
    updatePasswordCheck(numberCheck, hasNumber);
    updatePasswordCheck(symbolCheck, hasSymbol);
});

let updatePasswordCheck = (element, valid) => {

    if (valid) {

        element.classList.add("valid");

        element.querySelector("i").className =
            "fa-solid fa-circle-check";

    } else {

        element.classList.remove("valid");

        element.querySelector("i").className =
            "fa-solid fa-circle";
    }
};

passwordForm.addEventListener("submit", (event) => {

    event.preventDefault();

    if (!newPasswordSection.classList.contains("verified")) {

        verificationMessage.textContent =
            "Please verify your current password first.";

        verificationMessage.className =
            "profile-message error";

        return;
    }

    let password = newPassword.value;

    let hasLength = password.length >= 6;
    let hasUppercase = /[A-Z]/.test(password);
    let hasLowercase = /[a-z]/.test(password);
    let hasNumber = /[0-9]/.test(password);
    let hasSymbol = /[_\W]/.test(password);

    if (
        !hasLength ||
        !hasUppercase ||
        !hasLowercase ||
        !hasNumber ||
        !hasSymbol
    ) {

        passwordMessage.textContent =
            "Please satisfy all password requirements.";

        passwordMessage.className =
            "profile-message error";

        return;
    }

    if (password === storedUser.password) {

        passwordMessage.textContent =
            "New password must be different from your current password.";

        passwordMessage.className =
            "profile-message error";

        return;
    }

    let userIndex = users.findIndex(
        user => user.userId === currentUser.userId
    );

    users[userIndex].password = password;

    storedUser.password = password;

    saveUsers(users);
    saveCurrentUser(currentUser);

    passwordMessage.textContent =
        "Password changed successfully.";

    passwordMessage.className =
        "profile-message success";

    currentPassword.value = "";
    newPassword.value = "";

    currentPassword.disabled = false;
    verifyPassword.disabled = false;

    newPasswordSection.classList.remove("verified");

    updatePasswordCheck(lengthCheck, false);
    updatePasswordCheck(uppercaseCheck, false);
    updatePasswordCheck(lowercaseCheck, false);
    updatePasswordCheck(numberCheck, false);
});
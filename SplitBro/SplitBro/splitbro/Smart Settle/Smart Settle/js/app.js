document.addEventListener("DOMContentLoaded", function () {

    const userMenuButton =
        document.getElementById("userMenuButton");

    const userDropdown =
        document.getElementById("userDropdown");

    const logoutButton =
        document.getElementById("logoutButton");

    const navUserName =
        document.getElementById("navUserName");

    const navUserAvatar =
        document.getElementById("navUserAvatar");

    const dropdownUserName =
        document.getElementById("dropdownUserName");

    const dropdownUserId =
        document.getElementById("dropdownUserId");


    /*
       USER DROPDOWN
    */

    if (userMenuButton && userDropdown) {

        userMenuButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                if (
                    userDropdown.classList.contains("show")
                ) {

                    userDropdown.classList.remove("show");

                } else {

                    userDropdown.classList.add("show");

                }

            }
        );


        userDropdown.addEventListener(
            "click",
            function (event) {

                event.stopPropagation();

            }
        );


        document.addEventListener(
            "click",
            function () {

                userDropdown.classList.remove("show");

            }
        );

    }


    /*
       USER INFORMATION
    */

    try {

        if (
            typeof getCurrentUser === "function"
        ) {

            const currentUser =
                getCurrentUser();

            if (currentUser) {

                if (navUserName) {

                    navUserName.textContent =
                        currentUser.name;

                }


                if (navUserAvatar) {

                    navUserAvatar.textContent =
                        currentUser.name
                            .charAt(0)
                            .toUpperCase();

                }


                if (dropdownUserName) {

                    dropdownUserName.textContent =
                        currentUser.name;

                }


                if (dropdownUserId) {

                    dropdownUserId.textContent =
                        currentUser.userId;

                }

            }

        }

    } catch (error) {

        console.log(
            "User information could not be loaded:",
            error
        );

    }


    if (logoutButton) {

        logoutButton.addEventListener(
            "click",
            function (event) {

                event.preventDefault();
                event.stopPropagation();

                const confirmLogout =
                    confirm(
                        "Are you sure you want to logout?"
                    );

                if (!confirmLogout) {
                    return;
                }


                localStorage.removeItem(
                    "currentUser"
                );

                localStorage.removeItem(
                    "selectedGroupId"
                );


                window.location.href =
                    "index.html";

            }
        );

    }

    const groups =
        JSON.parse(
            localStorage.getItem(
                "smartSettleGroups"
            )
        ) || [];

    const selectedGroupId =
        localStorage.getItem(
            "selectedGroupId"
        );

    const hasActiveGroup =
        groups.some(
            group =>
                group.groupId ===
                selectedGroupId
        );


    /*
       ADD EXPENSE
    */

    const addExpenseLinks =
        document.querySelectorAll(
            'a[href="addExpense.html"]'
        );


    addExpenseLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    if (!hasActiveGroup) {

                        event.preventDefault();

                        alert(
                            "Please create or select an active group first."
                        );

                        window.location.href =
                            "groups.html";

                    }

                }
            );

        }
    );


    /*
       SETTLEMENT
    */

    const settlementLinks =
        document.querySelectorAll(
            'a[href="settlement.html"]'
        );


    settlementLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    if (!hasActiveGroup) {

                        event.preventDefault();

                        alert(
                            "Please create or select an active group first."
                        );

                        window.location.href =
                            "groups.html";

                    }

                }
            );

        }
    );

});
const createGroupBtn = document.getElementById("createGroupBtn");

document.querySelectorAll(".protected-group-link").forEach(function (link) {
    link.addEventListener("click", function (event) {
        event.preventDefault();

        const currentUser = localStorage.getItem("currentUser");

        if (currentUser) {
            window.location.href = "groups.html";
        } else {
            window.location.href = "login.html";
        }  
    }) ;
});

document.addEventListener("DOMContentLoaded", function () {

    const currentUser =
        typeof getCurrentUser === "function"
            ? getCurrentUser()
            : JSON.parse(
                localStorage.getItem(
                    "currentUser"
                )
            );


    if (!currentUser) {

        window.location.href =
            "login.html";

        return;

    }


    const users =
        typeof getUsers === "function"
            ? getUsers()
            : JSON.parse(
                localStorage.getItem(
                    "users"
                )
            ) || [];


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


    function isGuest(member) {

        return (
            typeof member === "object" &&
            member !== null &&
            member.type === "guest"
        );

    }


    function getMemberId(member) {

        if (isGuest(member)) {

            return member.memberId;

        }

        return String(member);

    }


    function getMemberUserId(member) {

        if (isGuest(member)) {

            return member.userId || null;

        }

        return String(member);

    }


    function getMemberName(member) {

        if (isGuest(member)) {

            return member.name ||
                "Guest Member";

        }


        const user =
            users.find(
                item =>
                    String(
                        item.userId
                    ).toUpperCase() ===
                    String(
                        member
                    ).toUpperCase()
            );


        return user
            ? user.name
            : String(member);

    }


    function isCurrentUserMember(group) {

        if (
            !group ||
            !Array.isArray(
                group.members
            )
        ) {

            return false;

        }


        return group.members.some(
            member => {

                const userId =
                    getMemberUserId(
                        member
                    );


                return (
                    userId &&
                    String(
                        userId
                    ).toUpperCase() ===
                    String(
                        currentUser.userId
                    ).toUpperCase()
                );

            }
        );

    }


    let selectedGroup =
        groups.find(
            group =>
                String(
                    group.groupId
                ) ===
                String(
                    selectedGroupId
                ) &&
                isCurrentUserMember(
                    group
                )
        );


    if (!selectedGroup) {

        selectedGroup =
            groups.find(
                group =>
                    isCurrentUserMember(
                        group
                    )
            );

    }


    if (selectedGroup) {

        localStorage.setItem(
            "selectedGroupId",
            selectedGroup.groupId
        );

    } else {

        localStorage.removeItem(
            "selectedGroupId"
        );

    }


    const navUserName =
        document.getElementById(
            "navUserName"
        );

    const navUserAvatar =
        document.getElementById(
            "navUserAvatar"
        );

    const dropdownUserName =
        document.getElementById(
            "dropdownUserName"
        );

    const dropdownUserId =
        document.getElementById(
            "dropdownUserId"
        );

    const heroUserName =
        document.getElementById(
            "heroUserName"
        );


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


    if (heroUserName) {

        heroUserName.textContent =
            currentUser.name;

    }


    const dashboardGroupName =
        document.getElementById(
            "dashboardGroupName"
        );

    const dashboardMembersText =
        document.getElementById(
            "dashboardMembersText"
        );

    const dashboardMemberCount =
        document.getElementById(
            "dashboardMemberCount"
        );

    const totalExpenses =
        document.getElementById(
            "totalExpenses"
        );

    const expenseCount =
        document.getElementById(
            "expenseCount"
        );

    const dashboardMembers =
        document.getElementById(
            "dashboardMembers"
        );

    const recentExpenses =
        document.getElementById(
            "recentExpenses"
        );

    const overviewTotal =
        document.getElementById(
            "overviewTotal"
        );

    const overviewPaid =
        document.getElementById(
            "overviewPaid"
        );

    const overviewBalance =
        document.getElementById(
            "overviewBalance"
        );

    const overviewBalanceText =
        document.getElementById(
            "overviewBalanceText"
        );


    function showNoGroup() {

        if (dashboardGroupName) {

            dashboardGroupName.textContent =
                "No Active Group";

        }


        if (dashboardMembersText) {

            dashboardMembersText.textContent =
                "Create or select a group to get started.";

        }


        if (dashboardMemberCount) {

            dashboardMemberCount.textContent =
                "0";

        }


        if (totalExpenses) {

            totalExpenses.textContent =
                "₹0.00";

        }


        if (expenseCount) {

            expenseCount.textContent =
                "0";

        }


        if (overviewTotal) {

            overviewTotal.textContent =
                "₹0.00";

        }


        if (overviewPaid) {

            overviewPaid.textContent =
                "₹0.00";

        }


        if (overviewBalance) {

            overviewBalance.textContent =
                "₹0.00";

        }


        if (overviewBalanceText) {

            overviewBalanceText.textContent =
                "Create a group to start";

        }


        if (dashboardMembers) {

            dashboardMembers.innerHTML = `

                <div class="empty-dashboard">

                    <i class="fa-solid fa-users"></i>

                    <p>
                        No active group
                    </p>

                    <a href="groups.html">
                        Create or select a group
                    </a>

                </div>

            `;

        }


        if (recentExpenses) {

            recentExpenses.innerHTML = `

                <div class="empty-dashboard">

                    <i class="fa-solid fa-receipt"></i>

                    <p>
                        No expenses yet
                    </p>

                    <a href="addExpense.html">
                        Add your first expense
                    </a>

                </div>

            `;

        }

    }


    if (!selectedGroup) {

        showNoGroup();

        return;

    }


    const members =
        Array.isArray(
            selectedGroup.members
        )
            ? selectedGroup.members
            : [];


    const expenses =
        Array.isArray(
            selectedGroup.expenses
        )
            ? selectedGroup.expenses
            : [];


    if (dashboardGroupName) {

        dashboardGroupName.textContent =
            selectedGroup.groupName;

    }


    if (dashboardMembersText) {

        dashboardMembersText.textContent =
            `${members.length} ${
                members.length === 1
                    ? "member"
                    : "members"
            } in this group`;

    }


    if (dashboardMemberCount) {

        dashboardMemberCount.textContent =
            members.length;

    }


    const total =
        expenses.reduce(
            (
                sum,
                expense
            ) =>
                sum +
                Number(
                    expense.amount ||
                    0
                ),
            0
        );


    if (totalExpenses) {

        totalExpenses.textContent =
            `₹${total.toFixed(2)}`;

    }


    if (expenseCount) {

        expenseCount.textContent =
            expenses.length;

    }


    const myPaid =
        expenses.reduce(
            (
                sum,
                expense
            ) => {

                const payer =
                    String(
                        expense.payer ||
                        ""
                    ).toUpperCase();


                const me =
                    String(
                        currentUser.userId
                    ).toUpperCase();


                if (
                    payer === me
                ) {

                    return (
                        sum +
                        Number(
                            expense.amount ||
                            0
                        )
                    );

                }


                return sum;

            },
            0
        );


    if (overviewTotal) {

        overviewTotal.textContent =
            `₹${total.toFixed(2)}`;

    }


    if (overviewPaid) {

        overviewPaid.textContent =
            `₹${myPaid.toFixed(2)}`;

    }


    const balances = {};


    members.forEach(
        member => {

            balances[
                getMemberId(
                    member
                )
            ] = 0;

        }
    );


    expenses.forEach(
        expense => {

            const payer =
                String(
                    expense.payer ||
                    ""
                ).toUpperCase();


            const payerId =
                Object.keys(
                    balances
                ).find(
                    id =>
                        String(
                            id
                        ).toUpperCase() ===
                        payer
                );


            if (payerId) {

                balances[payerId] +=
                    Number(
                        expense.amount ||
                        0
                    );

            }


            if (
                expense.shares
            ) {

                Object.entries(
                    expense.shares
                ).forEach(
                    (
                        [
                            userId,
                            share
                        ]
                    ) => {

                        const memberId =
                            Object.keys(
                                balances
                            ).find(
                                id =>
                                    String(
                                        id
                                    ).toUpperCase() ===
                                    String(
                                        userId
                                    ).toUpperCase()
                            );


                        if (memberId) {

                            balances[
                                memberId
                            ] -=
                                Number(
                                    share ||
                                    0
                                );

                        }

                    }
                );

            }

        }
    );


    if (
        Array.isArray(
            selectedGroup.settledPayments
        )
    ) {

        selectedGroup.settledPayments.forEach(
            payment => {

                const fromId =
                    Object.keys(
                        balances
                    ).find(
                        id =>
                            String(
                                id
                            ).toUpperCase() ===
                            String(
                                payment.from
                            ).toUpperCase()
                    );


                const toId =
                    Object.keys(
                        balances
                    ).find(
                        id =>
                            String(
                                id
                            ).toUpperCase() ===
                            String(
                                payment.to
                            ).toUpperCase()
                    );


                if (fromId) {

                    balances[fromId] +=
                        Number(
                            payment.amount ||
                            0
                        );

                }


                if (toId) {

                    balances[toId] -=
                        Number(
                            payment.amount ||
                            0
                        );

                }

            }
        );

    }


    Object.keys(
        balances
    ).forEach(
        id => {

            balances[id] =
                Number(
                    balances[id]
                        .toFixed(2)
                );

        }
    );


    const myUserId =
        String(
            currentUser.userId
        ).toUpperCase();


    const myBalanceKey =
        Object.keys(
            balances
        ).find(
            id =>
                String(
                    id
                ).toUpperCase() ===
                myUserId
        );


    const myBalance =
        myBalanceKey
            ? balances[
                myBalanceKey
            ]
            : 0;


    if (overviewBalance) {

        overviewBalance.textContent =
            `₹${Math.abs(
                myBalance
            ).toFixed(2)}`;

    }


    if (overviewBalanceText) {

        if (
            myBalance > 0.01
        ) {

            overviewBalanceText.textContent =
                "You are owed this amount";

            overviewBalance.style.color =
                "#4ade80";

        } else if (
            myBalance < -0.01
        ) {

            overviewBalanceText.textContent =
                "You owe this amount";

            overviewBalance.style.color =
                "#f87171";

        } else {

            overviewBalanceText.textContent =
                "All settled";

            overviewBalance.style.color =
                "#f8fafc";

        }

    }


    function renderMembers() {

        if (!dashboardMembers) {
            return;
        }


        dashboardMembers.innerHTML = "";


        if (
            members.length === 0
        ) {

            dashboardMembers.innerHTML = `

                <div class="empty-dashboard">

                    <i class="fa-solid fa-user-group"></i>

                    <p>
                        No members in this group
                    </p>

                </div>

            `;

            return;

        }


        members.forEach(
            member => {

                const id =
                    getMemberId(
                        member
                    );

                const name =
                    getMemberName(
                        member
                    );

                const balance =
                    Number(
                        (
                            balances[id] ||
                            0
                        ).toFixed(2)
                    );


                const initial =
                    name
                        .charAt(0)
                        .toUpperCase();


                const balanceText =
                    balance > 0.01
                        ? `+₹${balance.toFixed(2)}`
                        : balance < -0.01
                            ? `-₹${Math.abs(balance).toFixed(2)}`
                            : "₹0.00";


                const balanceClass =
                    balance > 0.01
                        ? "positive-member-balance"
                        : balance < -0.01
                            ? "negative-member-balance"
                            : "";


                const isMe =
                    String(
                        getMemberUserId(
                            member
                        )
                    ).toUpperCase() ===
                    myUserId;


                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "dashboard-member";


                item.innerHTML = `

                    <div class="member-info">

                        <span class="member-avatar">
                            ${initial}
                        </span>

                        <div>

                            <strong>
                                ${name}
                            </strong>

                            <small>
                                ${
                                    isMe
                                        ? "You"
                                        : isGuest(member)
                                            ? "Guest Member"
                                            : "Group member"
                                }
                            </small>

                        </div>

                    </div>

                    <span class="member-balance ${balanceClass}">
                        ${balanceText}
                    </span>

                `;


                dashboardMembers.appendChild(
                    item
                );

            }
        );

    }


    function renderExpenses() {

        if (!recentExpenses) {
            return;
        }


        recentExpenses.innerHTML = "";


        if (
            expenses.length === 0
        ) {

            recentExpenses.innerHTML = `

                <div class="empty-dashboard">

                    <i class="fa-solid fa-receipt"></i>

                    <p>
                        No expenses yet
                    </p>

                    <a href="addExpense.html">
                        Add your first expense
                    </a>

                </div>

            `;

            return;

        }


        [
            ...expenses
        ]
            .reverse()
            .slice(
                0,
                5
            )
            .forEach(
                expense => {

                    const payer =
                        members.find(
                            member =>
                                String(
                                    getMemberUserId(
                                        member
                                    )
                                    || ""
                                ).toUpperCase() ===
                                String(
                                    expense.payer ||
                                    ""
                                ).toUpperCase()
                        );


                    const payerName =
                        expense.payerName ||
                        (
                            payer
                                ? getMemberName(
                                    payer
                                )
                                : "Unknown"
                        );


                    const item =
                        document.createElement(
                            "div"
                        );


                    item.className =
                        "expense-item";


                    item.innerHTML = `

                        <div class="expense-icon">

                            <i class="fa-solid fa-receipt"></i>

                        </div>

                        <div class="expense-details">

                            <strong>
                                ${
                                    expense.title ||
                                    "Expense"
                                }
                            </strong>

                            <small>
                                Paid by ${payerName}
                            </small>

                        </div>

                        <strong class="expense-amount">
                            ₹${Number(
                                expense.amount ||
                                0
                            ).toFixed(2)}
                        </strong>

                    `;


                    recentExpenses.appendChild(
                        item
                    );

                }
            );

    }


    renderMembers();

    renderExpenses();

});
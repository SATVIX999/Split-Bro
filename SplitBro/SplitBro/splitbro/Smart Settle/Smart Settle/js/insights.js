let currentUser = getCurrentUser();

if (!currentUser) {
    window.location.href = "login.html";
}

let users = getUsers();

let groups =
    JSON.parse(
        localStorage.getItem(
            "smartSettleGroups"
        )
    ) || [];

let selectedGroupId =
    localStorage.getItem(
        "selectedGroupId"
    );

let selectedGroup =
    groups.find(
        group =>
            String(
                group.groupId
            ) ===
            String(
                selectedGroupId
            ) &&
            Array.isArray(
                group.members
            ) &&
            group.members.some(
                member => {

                    if (
                        typeof member ===
                        "object"
                    ) {

                        return (
                            member.userId &&
                            String(
                                member.userId
                            ).toUpperCase() ===
                            String(
                                currentUser.userId
                            ).toUpperCase()
                        );

                    }

                    return (
                        String(
                            member
                        ).toUpperCase() ===
                        String(
                            currentUser.userId
                        ).toUpperCase()
                    );

                }
            )
    );

if (!selectedGroup) {
    window.location.href = "groups.html";
}

let expenses =
    Array.isArray(
        selectedGroup.expenses
    )
        ? selectedGroup.expenses
        : [];

let insightsGroupName =
    document.getElementById(
        "insightsGroupName"
    );

let insightTotal =
    document.getElementById(
        "insightTotal"
    );

let insightCount =
    document.getElementById(
        "insightCount"
    );

let insightAverage =
    document.getElementById(
        "insightAverage"
    );

let highestCategory =
    document.getElementById(
        "highestCategory"
    );

let categoryList =
    document.getElementById(
        "categoryList"
    );

let categoryChart =
    document.getElementById(
        "categoryChart"
    );

let topExpenses =
    document.getElementById(
        "topExpenses"
    );

let insightsEmpty =
    document.getElementById(
        "insightsEmpty"
    );

let fairnessScore =
    document.getElementById(
        "fairnessScore"
    );

let fairnessMessage =
    document.getElementById(
        "fairnessMessage"
    );

let fairnessMembers =
    document.getElementById(
        "fairnessMembers"
    );

let navUserName =
    document.getElementById(
        "navUserName"
    );

let navUserAvatar =
    document.getElementById(
        "navUserAvatar"
    );

let dropdownUserName =
    document.getElementById(
        "dropdownUserName"
    );

let dropdownUserId =
    document.getElementById(
        "dropdownUserId"
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

insightsGroupName.textContent =
    selectedGroup.groupName ||
    selectedGroup.name ||
    "Group";

function isGuest(
    member
) {

    return (
        typeof member ===
        "object" &&
        member !== null &&
        member.type ===
        "guest"
    );

}

function getMemberId(
    member
) {

    if (
        isGuest(
            member
        )
    ) {

        return member.memberId;

    }

    return String(
        member
    );

}

function getMemberName(
    member
) {

    if (
        isGuest(
            member
        )
    ) {

        return member.name;

    }

    let user =
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
        : String(
            member
        );

}

function getExpenseMemberId(
    memberId
) {

    let member =
        selectedGroup.members.find(
            member =>
                String(
                    getMemberId(
                        member
                    )
                ) ===
                String(
                    memberId
                )
        );

    if (member) {

        return getMemberId(
            member
        );

    }

    return String(
        memberId
    );

}

function calculateFairness() {

    let memberData = {};


    selectedGroup.members.forEach(
        member => {

            let id =
                getMemberId(
                    member
                );

            memberData[id] = {

                id:
                    id,

                name:
                    getMemberName(
                        member
                    ),

                paid:
                    0,

                share:
                    0

            };

        }
    );


    expenses.forEach(
        expense => {

            let payer =
                String(
                    expense.payer
                );

            let payerId =
                getExpenseMemberId(
                    payer
                );


            if (
                memberData[
                    payerId
                ]
            ) {

                memberData[
                    payerId
                ].paid +=
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
                            memberId,
                            amount
                        ]
                    ) => {

                        let id =
                            getExpenseMemberId(
                                memberId
                            );


                        if (
                            memberData[
                                id
                            ]
                        ) {

                            memberData[
                                id
                            ].share +=
                                Number(
                                    amount ||
                                    0
                                );

                        }

                    }
                );

            }

        }
    );


    let members =
        Object.values(
            memberData
        );


    if (
        members.length ===
        0
    ) {

        return {

            score:
                100,

            members:
                []

        };

    }


    let totalDifference =
        members.reduce(
            (
                sum,
                member
            ) =>
                sum +
                Math.abs(
                    member.paid -
                    member.share
                ),
            0
        );


    let totalSpent =
        members.reduce(
            (
                sum,
                member
            ) =>
                sum +
                member.share,
            0
        );


    let imbalanceRatio =
        totalSpent > 0
            ? totalDifference /
              totalSpent
            : 0;


    let score =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(
                    100 -
                    imbalanceRatio *
                    100
                )
            )
        );


    members.forEach(
        member => {

            member.difference =
                Number(
                    (
                        member.paid -
                        member.share
                    ).toFixed(
                        2
                    )
                );

        }
    );


    return {

        score:
            score,

        members:
            members

    };

}

function renderFairness() {

    if (
        !fairnessScore ||
        !fairnessMessage ||
        !fairnessMembers
    ) {

        return;

    }


    let fairness =
        calculateFairness();


    fairnessScore.textContent =
        `${fairness.score}/100`;


    if (
        expenses.length ===
        0
    ) {

        fairnessMessage.innerHTML = `

            <strong>
                Add expenses to analyze fairness.
            </strong>

            <span>
                The detector compares how much each member paid with their fair share.
            </span>

        `;

        fairnessMembers.innerHTML =
            "";

        return;

    }


    if (
        fairness.score >=
        80
    ) {

        fairnessMessage.innerHTML = `

            <strong>
                🟢 Very Fair
            </strong>

            <span>
                Expenses are distributed quite evenly among the group.
            </span>

        `;

    } else if (
        fairness.score >=
        60
    ) {

        fairnessMessage.innerHTML = `

            <strong>
                🟡 Mostly Fair
            </strong>

            <span>
                There are some differences in spending, but the group is reasonably balanced.
            </span>

        `;

    } else {

        fairnessMessage.innerHTML = `

            <strong>
                🔴 Uneven Spending
            </strong>

            <span>
                Some members have paid significantly more or less than their fair share.
            </span>

        `;

    }


    fairnessMembers.innerHTML =
        "";


    fairness.members.forEach(
        member => {

            let difference =
                member.difference;


            let differenceClass =
                difference >
                0.01
                    ? "fairness-positive"
                    : difference <
                      -0.01
                        ? "fairness-negative"
                        : "fairness-balanced";


            let differenceText =
                difference >
                0.01
                    ? `+₹${difference.toFixed(2)}`
                    : difference <
                      -0.01
                        ? `-₹${Math.abs(
                            difference
                        ).toFixed(2)}`
                        : "₹0.00";


            let status =
                difference >
                0.01
                    ? "Paid more than share"
                    : difference <
                      -0.01
                        ? "Paid less than share"
                        : "Balanced";


            let item =
                document.createElement(
                    "div"
                );


            item.className =
                "fairness-member";


            item.innerHTML = `

                <div class="fairness-member-info">

                    <span class="fairness-avatar">
                        ${member.name
                            .charAt(0)
                            .toUpperCase()}
                    </span>

                    <div>

                        <strong>
                            ${member.name}
                        </strong>

                        <small>
                            ${status}
                        </small>

                    </div>

                </div>


                <div class="fairness-member-values">

                    <div>

                        <span>
                            Paid
                        </span>

                        <strong>
                            ₹${member.paid.toFixed(2)}
                        </strong>

                    </div>


                    <div>

                        <span>
                            Fair Share
                        </span>

                        <strong>
                            ₹${member.share.toFixed(2)}
                        </strong>

                    </div>


                    <div
                        class="${differenceClass}"
                    >

                        <span>
                            Difference
                        </span>

                        <strong>
                            ${differenceText}
                        </strong>

                    </div>

                </div>

            `;


            fairnessMembers.appendChild(
                item
            );

        }
    );

}

if (expenses.length === 0) {

    insightsEmpty.style.display =
        "block";

    document.querySelector(
        ".insights-stats"
    ).style.display =
        "none";

    document.querySelector(
        ".insights-grid"
    ).style.display =
        "none";

    document.querySelector(
        ".top-expenses-card"
    ).style.display =
        "none";

    renderFairness();

} else {

    insightsEmpty.style.display =
        "none";

    let total =
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

    let count =
        expenses.length;

    let average =
        total /
        count;

    insightTotal.textContent =
        `₹${total.toFixed(2)}`;

    insightCount.textContent =
        count;

    insightAverage.textContent =
        `₹${average.toFixed(2)}`;

    let categories = {};

    expenses.forEach(
        expense => {

            let category =
                expense.category ||
                "Other";

            if (
                !categories[
                    category
                ]
            ) {

                categories[
                    category
                ] = 0;

            }

            categories[
                category
            ] +=
                Number(
                    expense.amount ||
                    0
                );

        }
    );

    let categoryEntries =
        Object.entries(
            categories
        ).sort(
            (
                a,
                b
            ) =>
                b[1] -
                a[1]
        );

    let topCategory =
        categoryEntries[0];

    if (topCategory) {

        highestCategory.textContent =
            topCategory[0];

    }

    let icons = {

        Food:
            "fa-utensils",

        Hotel:
            "fa-hotel",

        Transport:
            "fa-car",

        Activities:
            "fa-ticket",

        Shopping:
            "fa-bag-shopping",

        Other:
            "fa-layer-group"

    };

    categoryList.innerHTML =
        "";

    categoryEntries.forEach(
        (
            [
                category,
                amount
            ]
        ) => {

            let percentage =
                total > 0
                    ? (
                        amount /
                        total *
                        100
                    )
                    : 0;

            let item =
                document.createElement(
                    "div"
                );

            item.className =
                "category-item";

            item.innerHTML = `

                <div class="category-item-header">

                    <span class="category-name">

                        <i class="fa-solid ${
                            icons[
                                category
                            ] ||
                            icons.Other
                        }"></i>

                        ${category}

                    </span>

                    <span class="category-amount">
                        ₹${amount.toFixed(2)}
                    </span>

                </div>

                <div class="category-bar">

                    <div
                        class="category-bar-fill"
                        style="width:${percentage}%"
                    ></div>

                </div>

                <span class="category-percentage">
                    ${percentage.toFixed(1)}% of total spending
                </span>

            `;

            categoryList.appendChild(
                item
            );

        }
    );

    categoryChart.innerHTML =
        "";

    categoryEntries.forEach(
        (
            [
                category,
                amount
            ]
        ) => {

            let percentage =
                total > 0
                    ? (
                        amount /
                        total *
                        100
                    )
                    : 0;

            let row =
                document.createElement(
                    "div"
                );

            row.className =
                "chart-row";

            row.innerHTML = `

                <span class="chart-label">
                    ${category}
                </span>

                <div class="chart-track">

                    <div
                        class="chart-fill"
                        style="width:${percentage}%"
                    ></div>

                </div>

                <span class="chart-value">
                    ${percentage.toFixed(1)}%
                </span>

            `;

            categoryChart.appendChild(
                row
            );

        }
    );

    let sortedExpenses =
        [...expenses]
            .sort(
                (
                    a,
                    b
                ) =>
                    Number(
                        b.amount ||
                        0
                    ) -
                    Number(
                        a.amount ||
                        0
                    )
            )
            .slice(
                0,
                5
            );

    topExpenses.innerHTML =
        "";

    sortedExpenses.forEach(
        expense => {

            let category =
                expense.category ||
                "Other";

            let icon =
                icons[
                    category
                ] ||
                icons.Other;

            let item =
                document.createElement(
                    "div"
                );

            item.className =
                "top-expense-item";

            item.innerHTML = `

                <div class="top-expense-info">

                    <span class="top-expense-icon">

                        <i class="fa-solid ${icon}"></i>

                    </span>

                    <div>

                        <strong>
                            ${expense.title || "Expense"}
                        </strong>

                        <small>
                            ${category}
                        </small>

                    </div>

                </div>

                <span class="top-expense-amount">
                    ₹${Number(
                        expense.amount ||
                        0
                    ).toFixed(2)}
                </span>

            `;

            topExpenses.appendChild(
                item
            );

        }
    );

    renderFairness();

}
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

    alert(
        "Please create or select an active group first."
    );

    window.location.href =
        "groups.html";

}

let settlementGroupName =
    document.getElementById(
        "settlementGroupName"
    );

let settlementMembers =
    document.getElementById(
        "settlementMembers"
    );

let settlementTransactions =
    document.getElementById(
        "settlementTransactions"
    );

let totalOutstanding =
    document.getElementById(
        "totalOutstanding"
    );

let transactionCount =
    document.getElementById(
        "transactionCount"
    );

settlementGroupName.textContent =
    selectedGroup.groupName ||
    selectedGroup.name ||
    "Group";

function getUser(
    userId
) {

    return users.find(
        user =>
            String(
                user.userId
            ).toUpperCase() ===
            String(
                userId
            ).toUpperCase()
    );

}

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

function getMemberUserId(
    member
) {

    if (
        isGuest(
            member
        )
    ) {

        return member.userId ||
            null;

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
        getUser(
            member
        );

    return user
        ? user.name
        : String(
            member
        );

}

function getName(
    memberId
) {

    let member =
        selectedGroup.members.find(
            item =>
                String(
                    getMemberId(
                        item
                    )
                ) ===
                String(
                    memberId
                )
        );

    if (member) {

        return getMemberName(
            member
        );

    }

    let user =
        getUser(
            memberId
        );

    return user
        ? user.name
        : String(
            memberId
        );

}

function getSettledPayments() {

    if (
        !Array.isArray(
            selectedGroup.settledPayments
        )
    ) {

        selectedGroup.settledPayments =
            [];

    }

    return selectedGroup.settledPayments;

}

function calculateBalances() {

    let balances = {};


    selectedGroup.members.forEach(
        member => {

            balances[
                getMemberId(
                    member
                )
            ] = 0;

        }
    );


    if (
        Array.isArray(
            selectedGroup.expenses
        )
    ) {

        selectedGroup.expenses.forEach(
            expense => {

                let payer =
                    String(
                        expense.payer
                    );

                let amount =
                    Number(
                        expense.amount ||
                        0
                    );


                if (
                    balances[payer] !==
                    undefined
                ) {

                    balances[payer] +=
                        amount;

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
                                share
                            ]
                        ) => {

                            let id =
                                String(
                                    memberId
                                );


                            if (
                                balances[id] !==
                                undefined
                            ) {

                                balances[id] -=
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

    }


    getSettledPayments().forEach(
        payment => {

            let from =
                String(
                    payment.from
                );

            let to =
                String(
                    payment.to
                );


            if (
                balances[from] !==
                undefined
            ) {

                balances[from] +=
                    Number(
                        payment.amount ||
                        0
                    );

            }


            if (
                balances[to] !==
                undefined
            ) {

                balances[to] -=
                    Number(
                        payment.amount ||
                        0
                    );

            }

        }
    );


    Object.keys(
        balances
    ).forEach(
        memberId => {

            balances[memberId] =
                Number(
                    balances[
                        memberId
                    ].toFixed(
                        2
                    )
                );

        }
    );


    return balances;

}

function calculateTransactions(
    balances
) {

    let creditors = [];

    let debtors = [];


    Object.entries(
        balances
    ).forEach(
        (
            [
                memberId,
                balance
            ]
        ) => {

            if (
                balance >
                0.01
            ) {

                creditors.push({

                    memberId:
                        memberId,

                    amount:
                        balance

                });

            }


            if (
                balance <
                -0.01
            ) {

                debtors.push({

                    memberId:
                        memberId,

                    amount:
                        Math.abs(
                            balance
                        )

                });

            }

        }
    );


    creditors.sort(
        (
            a,
            b
        ) =>
            b.amount -
            a.amount
    );


    debtors.sort(
        (
            a,
            b
        ) =>
            b.amount -
            a.amount
    );


    let transactions = [];

    let creditorIndex = 0;

    let debtorIndex = 0;


    while (
        creditorIndex <
            creditors.length &&
        debtorIndex <
            debtors.length
    ) {

        let creditor =
            creditors[
                creditorIndex
            ];

        let debtor =
            debtors[
                debtorIndex
            ];


        let amount =
            Math.min(
                creditor.amount,
                debtor.amount
            );


        amount =
            Number(
                amount.toFixed(
                    2
                )
            );


        transactions.push({

            from:
                debtor.memberId,

            to:
                creditor.memberId,

            amount:
                amount

        });


        creditor.amount =
            Number(
                (
                    creditor.amount -
                    amount
                ).toFixed(
                    2
                )
            );


        debtor.amount =
            Number(
                (
                    debtor.amount -
                    amount
                ).toFixed(
                    2
                )
            );


        if (
            creditor.amount <=
            0.01
        ) {

            creditorIndex++;

        }


        if (
            debtor.amount <=
            0.01
        ) {

            debtorIndex++;

        }

    }


    return transactions;

}

function saveGroups() {

    localStorage.setItem(
        "smartSettleGroups",
        JSON.stringify(
            groups
        )
    );

}

function saveSettlementHistory(
    transaction
) {

    let history =
        JSON.parse(
            localStorage.getItem(
                "settlementHistory"
            )
        ) || [];


    history.push({

        id:
            "SETTLE" +
            Date.now(),

        groupId:
            selectedGroup.groupId,

        groupName:
            selectedGroup.groupName ||
            selectedGroup.name ||
            "Group",

        from:
            transaction.from,

        fromName:
            getName(
                transaction.from
            ),

        to:
            transaction.to,

        toName:
            getName(
                transaction.to
            ),

        amount:
            Number(
                transaction.amount
            ),

        date:
            new Date().toISOString(),

        status:
            "Paid"

    });


    localStorage.setItem(
        "settlementHistory",
        JSON.stringify(
            history
        )
    );

}

function markTransactionAsPaid(
    transaction
) {

    let confirmed =
        confirm(
            `${getName(
                transaction.from
            )} will pay ₹${transaction.amount.toFixed(
                2
            )} to ${getName(
                transaction.to
            )}.\n\nMark this payment as paid?`
        );


    if (!confirmed) {
        return;
    }


    let payments =
        getSettledPayments();


    payments.push({

        from:
            transaction.from,

        to:
            transaction.to,

        amount:
            Number(
                transaction.amount
            ),

        date:
            new Date().toISOString()

    });


    saveSettlementHistory(
        transaction
    );


    saveGroups();


    let updatedBalances =
        calculateBalances();


    let updatedTransactions =
        calculateTransactions(
            updatedBalances
        );


    if (
        updatedTransactions.length ===
        0
    ) {

        let groupName =
            selectedGroup.groupName ||
            selectedGroup.name ||
            "Group";


        let history =
            JSON.parse(
                localStorage.getItem(
                    "settlementHistory"
                )
            ) || [];


        history.push({

            id:
                "GROUP" +
                Date.now(),

            groupId:
                selectedGroup.groupId,

            groupName:
                groupName,

            type:
                "group-settled",

            date:
                new Date().toISOString(),

            status:
                "Settled",

            message:
                "All outstanding payments have been settled."

        });


        localStorage.setItem(
            "settlementHistory",
            JSON.stringify(
                history
            )
        );


        groups =
            groups.filter(
                group =>
                    String(
                        group.groupId
                    ) !==
                    String(
                        selectedGroup.groupId
                    )
            );


        localStorage.setItem(
            "smartSettleGroups",
            JSON.stringify(
                groups
            )
        );


        localStorage.removeItem(
            "selectedGroupId"
        );


        alert(
            `${groupName} has been completely settled. It has been moved to Settlement History.`
        );


        window.location.href =
            "history.html";

        return;

    }


    alert(
        "Payment marked as paid successfully."
    );


    location.reload();

}

function renderMembers(
    balances
) {

    settlementMembers.innerHTML =
        "";


    selectedGroup.members.forEach(
        member => {

            let memberId =
                getMemberId(
                    member
                );

            let name =
                getMemberName(
                    member
                );

            let balance =
                balances[
                    memberId
                ] || 0;


            let item =
                document.createElement(
                    "div"
                );


            item.className =
                "settlement-member";


            let initial =
                name
                    .charAt(0)
                    .toUpperCase();


            let status =
                balance >
                0.01
                    ? "Gets back"
                    : balance <
                      -0.01
                        ? "Needs to pay"
                        : "Settled";


            let balanceClass =
                balance >
                0.01
                    ? "positive-balance"
                    : balance <
                      -0.01
                        ? "negative-balance"
                        : "zero-balance";


            let displayAmount =
                Math.abs(
                    balance
                ).toFixed(
                    2
                );


            item.innerHTML = `

                <div class="settlement-member-info">

                    <span class="settlement-avatar">
                        ${initial}
                    </span>

                    <div>

                        <strong>
                            ${name}
                        </strong>

                        <small>
                            ${status}
                        </small>

                    </div>

                </div>

                <div class="${balanceClass}">
                    ${balance >= 0 ? "+" : "-"}₹${displayAmount}
                </div>

            `;


            settlementMembers.appendChild(
                item
            );

        }
    );

}

function renderTransactions(
    transactions
) {

    settlementTransactions.innerHTML =
        "";


    if (
        transactions.length ===
        0
    ) {

        settlementTransactions.innerHTML = `

            <div class="settlement-empty">

                <i class="fa-solid fa-circle-check"></i>

                <h3>
                    Everyone is settled
                </h3>

                <p>
                    There are no pending payments in this group.
                </p>

            </div>

        `;


        totalOutstanding.textContent =
            "₹0.00";


        transactionCount.textContent =
            "0";


        return;

    }


    let outstanding =
        transactions.reduce(
            (
                sum,
                transaction
            ) =>
                sum +
                transaction.amount,
            0
        );


    totalOutstanding.textContent =
        `₹${outstanding.toFixed(2)}`;


    transactionCount.textContent =
        transactions.length;


    transactions.forEach(
        transaction => {

            let item =
                document.createElement(
                    "div"
                );


            item.className =
                "settlement-transaction";


            let fromName =
                getName(
                    transaction.from
                );

            let toName =
                getName(
                    transaction.to
                );


            item.innerHTML = `

                <div class="transaction-person">

                    <span class="transaction-avatar debtor-avatar">
                        ${fromName
                            .charAt(0)
                            .toUpperCase()}
                    </span>

                    <div>

                        <strong>
                            ${fromName}
                        </strong>

                        <small>
                            Needs to pay
                        </small>

                    </div>

                </div>


                <div class="transaction-arrow">

                    <span>
                        ₹${transaction.amount.toFixed(2)}
                    </span>

                    <i class="fa-solid fa-arrow-right"></i>

                </div>


                <div class="transaction-person">

                    <span class="transaction-avatar creditor-avatar">
                        ${toName
                            .charAt(0)
                            .toUpperCase()}
                    </span>

                    <div>

                        <strong>
                            ${toName}
                        </strong>

                        <small>
                            Receives
                        </small>

                    </div>

                </div>


                <button
                    type="button"
                    class="mark-paid-button"
                >

                    <i class="fa-solid fa-check"></i>

                    Mark as Paid

                </button>

            `;


            let markPaidButton =
                item.querySelector(
                    ".mark-paid-button"
                );


            markPaidButton.addEventListener(
                "click",
                function () {

                    markTransactionAsPaid(
                        transaction
                    );

                }
            );


            settlementTransactions.appendChild(
                item
            );

        }
    );

}

let balances =
    calculateBalances();

let transactions =
    calculateTransactions(
        balances
    );

renderMembers(
    balances
);

renderTransactions(
    transactions
);
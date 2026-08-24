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

let expenseForm =
    document.getElementById(
        "expenseForm"
    );

let expenseTitle =
    document.getElementById(
        "expenseTitle"
    );

let expenseAmount =
    document.getElementById(
        "expenseAmount"
    );

let expenseCategory =
    document.getElementById(
        "expenseCategory"
    );

let expensePayer =
    document.getElementById(
        "expensePayer"
    );

let splitMembers =
    document.getElementById(
        "splitMembers"
    );

let splitValues =
    document.getElementById(
        "splitValues"
    );

let splitSummary =
    document.getElementById(
        "splitSummary"
    );

let selectAllMembers =
    document.getElementById(
        "selectAllMembers"
    );

let titleError =
    document.getElementById(
        "titleError"
    );

let amountError =
    document.getElementById(
        "amountError"
    );

let categoryError =
    document.getElementById(
        "categoryError"
    );

let payerError =
    document.getElementById(
        "payerError"
    );

let membersError =
    document.getElementById(
        "membersError"
    );

let formError =
    document.getElementById(
        "formError"
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

function getName(
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
        : memberId;

}

function populatePayers() {

    expensePayer.innerHTML =
        "";

    selectedGroup.members.forEach(
        member => {

            let id =
                getMemberId(
                    member
                );

            let name =
                getMemberName(
                    member
                );

            let option =
                document.createElement(
                    "option"
                );

            option.value =
                id;

            option.textContent =
                isGuest(
                    member
                )
                    ? `${name} (Guest)`
                    : name;

            if (
                !isGuest(
                    member
                ) &&
                String(
                    getMemberUserId(
                        member
                    )
                ).toUpperCase() ===
                String(
                    currentUser.userId
                ).toUpperCase()
            ) {

                option.selected =
                    true;

            }

            expensePayer.appendChild(
                option
            );

        }
    );

}

function renderSplitMembers() {

    splitMembers.innerHTML =
        "";

    selectedGroup.members.forEach(
        member => {

            let id =
                getMemberId(
                    member
                );

            let name =
                getMemberName(
                    member
                );

            let label =
                document.createElement(
                    "label"
                );

            label.className =
                "split-member";

            label.innerHTML = `

                <input
                    type="checkbox"
                    class="split-member-checkbox"
                    value="${id}"
                    checked
                >

                <span class="split-member-avatar">
                    ${name
                        .charAt(0)
                        .toUpperCase()}
                </span>

                <span class="split-member-info">

                    <strong>
                        ${name}
                    </strong>

                    <span>
                        ${
                            isGuest(member)
                                ? "Guest Member"
                                : getMemberUserId(
                                    member
                                )
                        }
                    </span>

                </span>

            `;

            splitMembers.appendChild(
                label
            );

        }
    );

    updateSplitValues();

}

function getSelectedMembers() {

    return [
        ...document.querySelectorAll(
            ".split-member-checkbox:checked"
        )
    ].map(
        checkbox =>
            checkbox.value
    );

}

function getSplitType() {

    let selected =
        document.querySelector(
            'input[name="splitType"]:checked'
        );

    return selected
        ? selected.value
        : "equal";

}

function updateSplitValues() {

    splitValues.innerHTML =
        "";

    let selectedMembers =
        getSelectedMembers();

    let splitType =
        getSplitType();

    if (
        selectedMembers.length ===
        0
    ) {

        splitSummary.innerHTML = `

            <span>
                Select members
            </span>

            <strong>
                ₹0.00
            </strong>

        `;

        return;

    }

    if (
        splitType ===
        "equal"
    ) {

        splitSummary.innerHTML = `

            <span>
                Each member pays
            </span>

            <strong>
                ₹0.00
            </strong>

        `;

        return;

    }

    selectedMembers.forEach(
        memberId => {

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

            if (!member) {
                return;
            }

            let name =
                getMemberName(
                    member
                );

            let row =
                document.createElement(
                    "div"
                );

            row.className =
                "split-value-row";

            let unit =
                splitType ===
                "percentage"
                    ? "%"
                    : "₹";

            row.innerHTML = `

                <div class="split-value-user">

                    <span>
                        ${name
                            .charAt(0)
                            .toUpperCase()}
                    </span>

                    <strong>
                        ${name}
                    </strong>

                </div>

                <div class="split-value-input">

                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        class="split-value"
                        data-user-id="${memberId}"
                        placeholder="0"
                    >

                    <span>
                        ${unit}
                    </span>

                </div>

            `;

            splitValues.appendChild(
                row
            );

        }
    );

    document
        .querySelectorAll(
            ".split-value"
        )
        .forEach(
            input => {

                input.addEventListener(
                    "input",
                    updateSplitSummary
                );

            }
        );

    updateSplitSummary();

}

function updateSplitSummary() {

    let amount =
        Number(
            expenseAmount.value ||
            0
        );

    let selectedMembers =
        getSelectedMembers();

    let splitType =
        getSplitType();

    if (
        amount <= 0 ||
        selectedMembers.length ===
        0
    ) {

        splitSummary.innerHTML = `

            <span>
                Split amount
            </span>

            <strong>
                ₹0.00
            </strong>

        `;

        return;

    }

    if (
        splitType ===
        "equal"
    ) {

        let each =
            amount /
            selectedMembers.length;

        splitSummary.innerHTML = `

            <span>
                Each member pays
            </span>

            <strong>
                ₹${each.toFixed(2)}
            </strong>

        `;

        return;

    }

    let values =
        [
            ...document.querySelectorAll(
                ".split-value"
            )
        ];

    let total =
        values.reduce(
            (
                sum,
                input
            ) =>
                sum +
                Number(
                    input.value ||
                    0
                ),
            0
        );

    let suffix =
        splitType ===
        "percentage"
            ? "%"
            : "₹";

    splitSummary.innerHTML = `

        <span>
            Total entered
        </span>

        <strong>
            ${
                splitType ===
                "percentage"
                    ? total.toFixed(2) +
                      suffix
                    : "₹" +
                      total.toFixed(2)
            }
        </strong>

    `;

}

function clearErrors() {

    titleError.textContent =
        "";

    amountError.textContent =
        "";

    categoryError.textContent =
        "";

    payerError.textContent =
        "";

    membersError.textContent =
        "";

    formError.textContent =
        "";

}

function validateExpense() {

    clearErrors();

    let valid =
        true;

    let title =
        expenseTitle.value.trim();

    let amount =
        Number(
            expenseAmount.value
        );

    let category =
        expenseCategory.value;

    let payer =
        expensePayer.value;

    let selectedMembers =
        getSelectedMembers();

    if (
        title.length <
        2
    ) {

        titleError.textContent =
            "Enter an expense name.";

        valid =
            false;

    }

    if (
        !Number.isFinite(
            amount
        ) ||
        amount <= 0
    ) {

        amountError.textContent =
            "Enter a valid amount greater than zero.";

        valid =
            false;

    }

    if (!category) {

        categoryError.textContent =
            "Select an expense category.";

        valid =
            false;

    }

    if (!payer) {

        payerError.textContent =
            "Select who paid.";

        valid =
            false;

    }

    if (
        selectedMembers.length ===
        0
    ) {

        membersError.textContent =
            "Select at least one member.";

        valid =
            false;

    }

    let splitType =
        getSplitType();

    if (
        valid &&
        splitType ===
        "percentage"
    ) {

        let values =
            [
                ...document.querySelectorAll(
                    ".split-value"
                )
            ];

        let percentageTotal =
            values.reduce(
                (
                    sum,
                    input
                ) =>
                    sum +
                    Number(
                        input.value ||
                        0
                    ),
                0
            );

        if (
            Math.abs(
                percentageTotal -
                100
            ) >
            0.01
        ) {

            formError.textContent =
                "Percentage split must total exactly 100%.";

            valid =
                false;

        }

    }

    if (
        valid &&
        splitType ===
        "custom"
    ) {

        let values =
            [
                ...document.querySelectorAll(
                    ".split-value"
                )
            ];

        let customTotal =
            values.reduce(
                (
                    sum,
                    input
                ) =>
                    sum +
                    Number(
                        input.value ||
                        0
                    ),
                0
            );

        if (
            Math.abs(
                customTotal -
                amount
            ) >
            0.01
        ) {

            formError.textContent =
                "Custom split must equal the total expense amount.";

            valid =
                false;

        }

    }

    return valid;

}

function calculateShares() {

    let amount =
        Number(
            expenseAmount.value
        );

    let selectedMembers =
        getSelectedMembers();

    let splitType =
        getSplitType();

    let shares =
        {};

    if (
        splitType ===
        "equal"
    ) {

        let each =
            amount /
            selectedMembers.length;

        selectedMembers.forEach(
            memberId => {

                shares[
                    memberId
                ] =
                    Number(
                        each.toFixed(
                            2
                        )
                    );

            }
        );

        let roundedTotal =
            Object.values(
                shares
            ).reduce(
                (
                    sum,
                    value
                ) =>
                    sum +
                    value,
                0
            );

        let difference =
            Number(
                (
                    amount -
                    roundedTotal
                ).toFixed(
                    2
                )
            );

        if (
            difference !==
            0
        ) {

            let firstMember =
                selectedMembers[0];

            shares[
                firstMember
            ] =
                Number(
                    (
                        shares[
                            firstMember
                        ] +
                        difference
                    ).toFixed(
                        2
                    )
                );

        }

    }

    if (
        splitType ===
        "percentage"
    ) {

        let values =
            [
                ...document.querySelectorAll(
                    ".split-value"
                )
            ];

        values.forEach(
            input => {

                let percentage =
                    Number(
                        input.value ||
                        0
                    );

                shares[
                    input.dataset.userId
                ] =
                    Number(
                        (
                            amount *
                            percentage /
                            100
                        ).toFixed(
                            2
                        )
                    );

            }
        );

    }

    if (
        splitType ===
        "custom"
    ) {

        let values =
            [
                ...document.querySelectorAll(
                    ".split-value"
                )
            ];

        values.forEach(
            input => {

                shares[
                    input.dataset.userId
                ] =
                    Number(
                        input.value ||
                        0
                    );

            }
        );

    }

    return shares;

}

function saveExpense() {

    let shares =
        calculateShares();

    let payerId =
        expensePayer.value;

    let payerMember =
        selectedGroup.members.find(
            member =>
                String(
                    getMemberId(
                        member
                    )
                ) ===
                String(
                    payerId
                )
        );

    let expense = {

        expenseId:
            "EXP" +
            Date.now(),

        title:
            expenseTitle.value.trim(),

        amount:
            Number(
                Number(
                    expenseAmount.value
                ).toFixed(
                    2
                )
            ),

        category:
            expenseCategory.value,

        payer:
            payerId,

        payerName:
            payerMember
                ? getMemberName(
                    payerMember
                )
                : payerId,

        payerType:
            payerMember &&
            isGuest(
                payerMember
            )
                ? "guest"
                : "registered",

        splitType:
            getSplitType(),

        participants:
            getSelectedMembers(),

        shares:
            shares,

        createdAt:
            new Date().toISOString()

    };

    if (
        !selectedGroup.expenses
    ) {

        selectedGroup.expenses =
            [];

    }

    selectedGroup.expenses.push(
        expense
    );

    localStorage.setItem(
        "smartSettleGroups",
        JSON.stringify(
            groups
        )
    );

    window.location.href =
        "dashboard.html";

}

document
    .querySelectorAll(
        'input[name="splitType"]'
    )
    .forEach(
        radio => {

            radio.addEventListener(
                "change",
                updateSplitValues
            );

        }
    );

splitMembers.addEventListener(
    "change",
    updateSplitValues
);

expenseAmount.addEventListener(
    "input",
    updateSplitSummary
);

selectAllMembers.addEventListener(
    "click",
    () => {

        let checkboxes =
            document.querySelectorAll(
                ".split-member-checkbox"
            );

        let allSelected =
            [
                ...checkboxes
            ].every(
                checkbox =>
                    checkbox.checked
            );

        checkboxes.forEach(
            checkbox => {

                checkbox.checked =
                    !allSelected;

            }
        );

        updateSplitValues();

    }
);

expenseForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();

        if (
            !validateExpense()
        ) {

            return;

        }

        saveExpense();

    }
);

populatePayers();

renderSplitMembers();
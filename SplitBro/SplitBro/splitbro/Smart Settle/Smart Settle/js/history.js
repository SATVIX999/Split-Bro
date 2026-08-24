let currentUser = getCurrentUser();

if (!currentUser) {
    window.location.href = "login.html";
}

let history =
    JSON.parse(
        localStorage.getItem(
            "settlementHistory"
        )
    ) || [];

let historyList =
    document.getElementById(
        "historyList"
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

function formatDate(dateValue) {

    if (!dateValue) {
        return "Unknown date";
    }

    return new Date(
        dateValue
    ).toLocaleDateString(
        "en-IN",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );
}

function deleteHistoryRecord(index) {

    let confirmed =
        confirm(
            "Are you sure you want to delete this history record?"
        );

    if (!confirmed) {
        return;
    }

    history.splice(index, 1);

    localStorage.setItem(
        "settlementHistory",
        JSON.stringify(history)
    );

    renderHistory();
}

function renderHistory() {

    historyList.innerHTML = "";

    if (history.length === 0) {

        historyList.innerHTML = `
            <div class="history-empty">

                <i class="fa-solid fa-clock-rotate-left"></i>

                <h2>
                    No settlement history yet
                </h2>

                <p>
                    Payments you mark as paid will appear here.
                </p>

            </div>
        `;

        return;
    }

    let sortedHistory =
        [...history]
            .map(
                (record, index) => ({
                    record,
                    index
                })
            )
            .reverse();

    sortedHistory.forEach(
        itemData => {

            let record =
                itemData.record;

            let originalIndex =
                itemData.index;

            let card =
                document.createElement(
                    "div"
                );

            card.className =
                "history-card";

            if (
                record.type ===
                "group-settled"
            ) {

                card.innerHTML = `
                    <div class="history-main">

                        <div class="history-icon">
                            <i class="fa-solid fa-circle-check"></i>
                        </div>

                        <div>

                            <h2>
                                ${record.groupName}
                            </h2>

                            <p>
                                All outstanding payments settled
                            </p>

                        </div>

                    </div>

                    <div class="history-meta">

                        <strong>
                            Group Settled
                        </strong>

                        <span>
                            ${formatDate(record.date)}
                        </span>

                        <button
                            type="button"
                            class="delete-history-button"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>
                `;

            } else {

                let method =
                    record.paymentMethod ||
                    "Not specified";

                let note =
                    record.note ||
                    "";

                card.innerHTML = `
                    <div class="history-main">

                        <div class="history-icon">

                            <i class="fa-solid fa-money-bill-transfer"></i>

                        </div>

                        <div>

                            <h2>
                                ${record.groupName || "Group"}
                            </h2>

                            <p>
                                ${record.fromName || record.from}
                                paid
                                ₹${Number(
                                    record.amount || 0
                                ).toFixed(2)}
                                to
                                ${record.toName || record.to}
                            </p>

                            <small>
                                <i class="fa-solid fa-wallet"></i>
                                ${method}
                            </small>

                            ${
                                note
                                    ? `
                                    <small>
                                        <i class="fa-solid fa-note-sticky"></i>
                                        ${note}
                                    </small>
                                    `
                                    : ""
                            }

                        </div>

                    </div>

                    <div class="history-meta">

                        <strong>
                            ${record.status || "Paid"}
                        </strong>

                        <span>
                            ${formatDate(record.date)}
                        </span>

                        <span>
                            ₹${Number(
                                record.amount || 0
                            ).toFixed(2)}
                        </span>

                        <button
                            type="button"
                            class="delete-history-button"
                        >
                            <i class="fa-solid fa-trash"></i>
                        </button>

                    </div>
                `;

            }

            let deleteButton =
                card.querySelector(
                    ".delete-history-button"
                );

            if (deleteButton) {

                deleteButton.addEventListener(
                    "click",
                    function () {

                        deleteHistoryRecord(
                            originalIndex
                        );

                    }
                );

            }

            historyList.appendChild(
                card
            );

        }
    );

}

renderHistory();
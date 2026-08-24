document.addEventListener("DOMContentLoaded", function () {

    const currentUser = getCurrentUser();

    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    let users = getUsers();

    let groups =
        JSON.parse(
            localStorage.getItem("smartSettleGroups")
        ) || [];

    const groupsContainer =
        document.getElementById("groupsContainer");

    const emptyGroups =
        document.getElementById("emptyGroups");

    const openGroupModal =
        document.getElementById("openGroupModal");

    const openJoinGroup =
        document.getElementById("openJoinGroup");

    const emptyCreateGroup =
        document.getElementById("emptyCreateGroup");

    const emptyJoinGroup =
        document.getElementById("emptyJoinGroup");

    const createGroupModal =
        document.getElementById("createGroupModal");

    const joinGroupModal =
        document.getElementById("joinGroupModal");

    const editGroupModal =
        document.getElementById("editGroupModal");

    const closeCreateModal =
        document.getElementById("closeCreateModal");

    const closeJoinModal =
        document.getElementById("closeJoinModal");

    const closeEditModal =
        document.getElementById("closeEditModal");

    const cancelCreateGroup =
        document.getElementById("cancelCreateGroup");

    const cancelJoinGroup =
        document.getElementById("cancelJoinGroup");

    const cancelEditGroup =
        document.getElementById("cancelEditGroup");

    const groupForm =
        document.getElementById("groupForm");

    const joinGroupForm =
        document.getElementById("joinGroupForm");

    const editGroupForm =
        document.getElementById("editGroupForm");

    const groupName =
        document.getElementById("groupName");

    const memberUserId =
        document.getElementById("memberUserId");

    const addMemberButton =
        document.getElementById("addMemberButton");

    const selectedMembers =
        document.getElementById("selectedMembers");

    const groupNameError =
        document.getElementById("groupNameError");

    const memberError =
        document.getElementById("memberError");

    const joinGroupCode =
        document.getElementById("joinGroupCode");

    const joinGroupError =
        document.getElementById("joinGroupError");

    const guestClaimBox =
        document.getElementById("guestClaimBox");

    const guestClaimSelect =
        document.getElementById("guestClaimSelect");

    const registeredMemberMode =
        document.getElementById("registeredMemberMode");

    const guestMemberMode =
        document.getElementById("guestMemberMode");

    const registeredMemberBox =
        document.getElementById("registeredMemberBox");

    const guestMemberBox =
        document.getElementById("guestMemberBox");

    const guestMemberName =
        document.getElementById("guestMemberName");

    const addGuestMemberButton =
        document.getElementById("addGuestMemberButton");

    const editGroupName =
        document.getElementById("editGroupName");

    const editSelectedMembers =
        document.getElementById("editSelectedMembers");

    const editMemberUserId =
        document.getElementById("editMemberUserId");

    const editAddMemberButton =
        document.getElementById("editAddMemberButton");

    const editMemberError =
        document.getElementById("editMemberError");

    const editRegisteredMemberMode =
        document.getElementById("editRegisteredMemberMode");

    const editGuestMemberMode =
        document.getElementById("editGuestMemberMode");

    const editRegisteredMemberBox =
        document.getElementById("editRegisteredMemberBox");

    const editGuestMemberBox =
        document.getElementById("editGuestMemberBox");

    const editGuestMemberName =
        document.getElementById("editGuestMemberName");

    const editAddGuestMemberButton =
        document.getElementById("editAddGuestMemberButton");

    const editGroupNameError =
        document.getElementById("editGroupNameError");

    let newMembers = [];

    let editingGroupId = null;

    function saveGroups() {
        localStorage.setItem(
            "smartSettleGroups",
            JSON.stringify(groups)
        );
    }

    function generateGroupId() {
        return (
            "GRP" +
            Date.now() +
            Math.random()
                .toString(36)
                .substring(2, 7)
                .toUpperCase()
        );
    }

    function generateGroupCode() {
        const characters =
            "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

        let code = "";

        for (let i = 0; i < 6; i++) {
            code += characters.charAt(
                Math.floor(
                    Math.random() *
                    characters.length
                )
            );
        }

        return code;
    }

    function getUniqueGroupCode() {
        let code;

        do {
            code = generateGroupCode();
        } while (
            groups.some(
                group =>
                    String(
                        group.groupCode
                    ).toUpperCase() === code
            )
        );

        return code;
    }

    function getUserById(userId) {
        return users.find(
            user =>
                String(user.userId)
                    .trim()
                    .toUpperCase() ===
                String(userId)
                    .trim()
                    .toUpperCase()
        );
    }

    function getUserName(userId) {
        const user = getUserById(userId);

        return user
            ? user.name
            : userId;
    }

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
            return member.name;
        }

        return getUserName(member);
    }

    function isCurrentUserMember(group) {

        if (
            !group ||
            !Array.isArray(group.members) ||
            !currentUser
        ) {
            return false;
        }

        const currentUserId =
            String(currentUser.userId)
                .trim()
                .toUpperCase();

        return group.members.some(
            member => {

                const memberUserId =
                    getMemberUserId(member);

                return (
                    memberUserId &&
                    String(memberUserId)
                        .trim()
                        .toUpperCase() ===
                    currentUserId
                );
            }
        );
    }

    function getVisibleGroups() {
        return groups.filter(
            group =>
                isCurrentUserMember(group)
        );
    }

    function openModal(modal) {
        if (modal) {
            modal.classList.add("show");
        }
    }

    function closeModal(modal) {
        if (modal) {
            modal.classList.remove("show");
        }
    }

    function clearCreateForm() {

        if (groupName) {
            groupName.value = "";
        }

        if (memberUserId) {
            memberUserId.value = "";
        }

        if (guestMemberName) {
            guestMemberName.value = "";
        }

        newMembers = [];

        if (groupNameError) {
            groupNameError.textContent = "";
        }

        if (memberError) {
            memberError.textContent = "";
        }

        if (
            registeredMemberMode &&
            guestMemberMode
        ) {
            registeredMemberMode.classList.add(
                "active"
            );

            guestMemberMode.classList.remove(
                "active"
            );
        }

        if (registeredMemberBox) {
            registeredMemberBox.style.display =
                "block";
        }

        if (guestMemberBox) {
            guestMemberBox.style.display =
                "none";
        }

        renderSelectedMembers();
    }

    function renderSelectedMembers() {

        if (!selectedMembers) {
            return;
        }

        selectedMembers.innerHTML = "";

        newMembers.forEach(
            member => {

                const name =
                    getMemberName(member);

                const id =
                    getMemberId(member);

                const label =
                    isGuest(member)
                        ? "Guest Member"
                        : getMemberUserId(member);

                const item =
                    document.createElement("div");

                item.className =
                    "selected-member";

                item.innerHTML = `
                    <span class="selected-member-avatar">
                        ${name.charAt(0).toUpperCase()}
                    </span>

                    <div class="selected-member-info">
                        <strong>${name}</strong>
                        <span>${label}</span>
                    </div>

                    <button
                        type="button"
                        class="remove-member-button"
                        data-member-id="${id}"
                    >
                        <i class="fa-solid fa-xmark"></i>
                    </button>
                `;

                selectedMembers.appendChild(item);
            }
        );

        document
            .querySelectorAll(
                ".remove-member-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const id =
                                this.dataset.memberId;

                            newMembers =
                                newMembers.filter(
                                    member =>
                                        String(
                                            getMemberId(
                                                member
                                            )
                                        ) !==
                                        String(id)
                                );

                            renderSelectedMembers();
                        }
                    );
                }
            );
    }

    function addMember() {

        memberError.textContent = "";

        const userId =
            memberUserId.value
                .trim()
                .toUpperCase();

        if (!userId) {
            memberError.textContent =
                "Enter a User ID.";
            return;
        }

        const user =
            getUserById(userId);

        if (!user) {
            memberError.textContent =
                "No registered user found with this User ID.";
            return;
        }

        if (
            String(user.userId).toUpperCase() ===
            String(currentUser.userId).toUpperCase()
        ) {
            memberError.textContent =
                "You are already added to the group.";
            return;
        }

        const exists =
            newMembers.some(
                member => {

                    const id =
                        getMemberUserId(member);

                    return (
                        id &&
                        String(id).toUpperCase() ===
                        String(user.userId).toUpperCase()
                    );
                }
            );

        if (exists) {
            memberError.textContent =
                "This member is already added.";
            return;
        }

        newMembers.push(user.userId);

        memberUserId.value = "";

        renderSelectedMembers();
    }

    function addGuestMember() {

        memberError.textContent = "";

        const name =
            guestMemberName.value.trim();

        if (name.length < 2) {
            memberError.textContent =
                "Enter a valid guest name.";
            return;
        }

        const exists =
            newMembers.some(
                member =>
                    isGuest(member) &&
                    String(member.name)
                        .toLowerCase() ===
                    name.toLowerCase()
            );

        if (exists) {
            memberError.textContent =
                "This guest is already added.";
            return;
        }

        newMembers.push({
            memberId:
                "GUEST_" +
                Date.now() +
                Math.random()
                    .toString(36)
                    .substring(2, 6),

            name: name,

            type: "guest",

            userId: null
        });

        guestMemberName.value = "";

        renderSelectedMembers();
    }

    function createGroup(event) {

        event.preventDefault();

        groupNameError.textContent = "";
        memberError.textContent = "";

        const name =
            groupName.value.trim();

        if (name.length < 2) {
            groupNameError.textContent =
                "Group name must contain at least 2 characters.";
            return;
        }

        if (newMembers.length === 0) {
            memberError.textContent =
                "Add at least one other member.";
            return;
        }

        const duplicate =
    groups.some(
        group =>
            String(group.groupName)
                .toLowerCase() ===
            name.toLowerCase() &&
            group.createdBy === currentUser.userId
    );

if (duplicate) {
    groupNameError.textContent =
        "A group with this name already exists.";
    return;
}

        const newGroup = {

            groupId:
                generateGroupId(),

            groupName:
                name,

            groupCode:
                getUniqueGroupCode(),

            createdBy:
                currentUser.userId,

            members: [
                currentUser.userId,
                ...newMembers
            ],

            expenses: [],

            settledPayments: [],

            createdAt:
                new Date().toISOString()
        };

        groups.push(newGroup);

        saveGroups();

        localStorage.setItem(
            "selectedGroupId",
            newGroup.groupId
        );

        closeModal(createGroupModal);

        clearCreateForm();

        renderGroups();

        alert(
            `Group "${name}" created successfully.\n\nGroup Code: ${newGroup.groupCode}`
        );
    }

    function prepareGuestClaims(group) {

        guestClaimSelect.innerHTML = `
            <option value="">
                Join as a new member
            </option>
        `;

        const guests =
            group.members.filter(
                member =>
                    isGuest(member)
            );

        if (guests.length === 0) {
            guestClaimBox.style.display =
                "none";
            return;
        }

        guests.forEach(
            guest => {

                const option =
                    document.createElement("option");

                option.value =
                    guest.memberId;

                option.textContent =
                    guest.name;

                guestClaimSelect.appendChild(
                    option
                );
            }
        );

        guestClaimBox.style.display =
            "block";
    }

    function checkJoinCode() {

        const code =
            joinGroupCode.value
                .trim()
                .toUpperCase();

        if (code.length < 6) {
            guestClaimBox.style.display =
                "none";
            return;
        }

        const group =
            groups.find(
                item =>
                    String(item.groupCode)
                        .toUpperCase() ===
                    code
            );

        if (
            !group ||
            isCurrentUserMember(group)
        ) {
            guestClaimBox.style.display =
                "none";
            return;
        }

        prepareGuestClaims(group);
    }

    function joinGroup(event) {

        event.preventDefault();

        joinGroupError.textContent = "";

        const code =
            joinGroupCode.value
                .trim()
                .toUpperCase();

        if (!code) {
            joinGroupError.textContent =
                "Enter a Group Code.";
            return;
        }

        const group =
            groups.find(
                item =>
                    String(item.groupCode)
                        .toUpperCase() ===
                    code
            );

        if (!group) {
            joinGroupError.textContent =
                "Invalid Group Code.";
            return;
        }

        if (isCurrentUserMember(group)) {
            joinGroupError.textContent =
                "You are already a member of this group.";
            return;
        }

        const claimId =
            guestClaimSelect.value;

        if (claimId) {

            const index =
                group.members.findIndex(
                    member =>
                        isGuest(member) &&
                        String(member.memberId) ===
                        String(claimId)
                );

            if (index === -1) {
                joinGroupError.textContent =
                    "Guest member could not be found.";
                return;
            }

            group.members[index] =
                currentUser.userId;

        } else {

            group.members.push(
                currentUser.userId
            );
        }

        saveGroups();

        localStorage.setItem(
            "selectedGroupId",
            group.groupId
        );

        closeModal(joinGroupModal);

        renderGroups();

        alert(
            claimId
                ? `You joined "${group.groupName}" and your guest profile has been connected to your account.`
                : `You joined "${group.groupName}".`
        );
    }

    function openEditGroup(groupId) {

        const group =
            groups.find(
                item =>
                    String(item.groupId) ===
                    String(groupId)
            );

        if (!group) {
            return;
        }

        if (
            String(group.createdBy).toUpperCase() !==
            String(currentUser.userId).toUpperCase()
        ) {
            alert(
                "Only the group creator can edit this group."
            );
            return;
        }

        editingGroupId =
            groupId;

        editGroupName.value =
            group.groupName;

        editGroupNameError.textContent = "";

        editMemberError.textContent = "";

        renderEditMembers(group);

        openModal(editGroupModal);
    }

    function renderEditMembers(group) {

        editSelectedMembers.innerHTML = "";

        group.members.forEach(
            member => {

                const name =
                    getMemberName(member);

                const id =
                    getMemberId(member);

                const isSelf =
                    String(
                        getMemberUserId(member)
                    ).toUpperCase() ===
                    String(
                        currentUser.userId
                    ).toUpperCase();

                const item =
                    document.createElement("div");

                item.className =
                    "selected-member";

                item.innerHTML = `
                    <span class="selected-member-avatar">
                        ${name.charAt(0).toUpperCase()}
                    </span>

                    <div class="selected-member-info">
                        <strong>${name}</strong>

                        <span>
                            ${
                                isGuest(member)
                                    ? "Guest Member"
                                    : getMemberUserId(member)
                            }
                        </span>
                    </div>

                    ${
                        !isSelf
                            ? `
                                <button
                                    type="button"
                                    class="remove-edit-member-button"
                                    data-member-id="${id}"
                                >
                                    <i class="fa-solid fa-xmark"></i>
                                </button>
                            `
                            : ""
                    }
                `;

                editSelectedMembers.appendChild(item);
            }
        );

        document
            .querySelectorAll(
                ".remove-edit-member-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            if (
                                group.members.length <= 2
                            ) {
                                editMemberError.textContent =
                                    "A group must have at least 2 members.";
                                return;
                            }

                            const id =
                                this.dataset.memberId;

                            group.members =
                                group.members.filter(
                                    member =>
                                        String(
                                            getMemberId(member)
                                        ) !==
                                        String(id)
                                );

                            saveGroups();

                            renderEditMembers(group);

                            renderGroups();
                        }
                    );
                }
            );
    }

    function addEditMember() {

        editMemberError.textContent = "";

        const userId =
            editMemberUserId.value
                .trim()
                .toUpperCase();

        if (!userId) {
            editMemberError.textContent =
                "Enter a User ID.";
            return;
        }

        const user =
            getUserById(userId);

        if (!user) {
            editMemberError.textContent =
                "No registered user found with this User ID.";
            return;
        }

        const group =
            groups.find(
                item =>
                    String(item.groupId) ===
                    String(editingGroupId)
            );

        if (!group) {
            return;
        }

        const exists =
            group.members.some(
                member => {

                    const id =
                        getMemberUserId(member);

                    return (
                        id &&
                        String(id).toUpperCase() ===
                        String(user.userId).toUpperCase()
                    );
                }
            );

        if (exists) {
            editMemberError.textContent =
                "This member is already in the group.";
            return;
        }

        group.members.push(
            user.userId
        );

        saveGroups();

        editMemberUserId.value = "";

        renderEditMembers(group);

        renderGroups();
    }

    function addEditGuestMember() {

        editMemberError.textContent = "";

        const name =
            editGuestMemberName.value.trim();

        if (name.length < 2) {
            editMemberError.textContent =
                "Enter a valid guest name.";
            return;
        }

        const group =
            groups.find(
                item =>
                    String(item.groupId) ===
                    String(editingGroupId)
            );

        if (!group) {
            return;
        }

        const exists =
            group.members.some(
                member =>
                    isGuest(member) &&
                    String(member.name)
                        .toLowerCase() ===
                    name.toLowerCase()
            );

        if (exists) {
            editMemberError.textContent =
                "This guest is already in the group.";
            return;
        }

        group.members.push({

            memberId:
                "GUEST_" +
                Date.now() +
                Math.random()
                    .toString(36)
                    .substring(2, 6),

            name: name,

            type: "guest",

            userId: null
        });

        saveGroups();

        editGuestMemberName.value = "";

        renderEditMembers(group);

        renderGroups();
    }

    function saveEditedGroup(event) {

        event.preventDefault();

        const group =
            groups.find(
                item =>
                    String(item.groupId) ===
                    String(editingGroupId)
            );

        if (!group) {
            return;
        }

        const name =
            editGroupName.value.trim();

        if (name.length < 2) {
            editGroupNameError.textContent =
                "Group name must contain at least 2 characters.";
            return;
        }

        group.groupName =
            name;

        saveGroups();

        closeModal(editGroupModal);

        renderGroups();
    }

    function deleteGroup(groupId) {

        const group =
            groups.find(
                item =>
                    String(item.groupId) ===
                    String(groupId)
            );

        if (!group) {
            return;
        }

        if (
            String(group.createdBy).toUpperCase() !==
            String(currentUser.userId).toUpperCase()
        ) {
            alert(
                "Only the group creator can delete this group."
            );
            return;
        }

        const confirmed =
            confirm(
                `Are you sure you want to delete "${group.groupName}"?`
            );

        if (!confirmed) {
            return;
        }

        groups =
            groups.filter(
                item =>
                    String(item.groupId) !==
                    String(groupId)
            );

        saveGroups();

        if (
            String(
                localStorage.getItem(
                    "selectedGroupId"
                )
            ) ===
            String(groupId)
        ) {
            localStorage.removeItem(
                "selectedGroupId"
            );
        }

        renderGroups();
    }

    function leaveGroup(groupId) {

        const group =
            groups.find(
                item =>
                    String(item.groupId) ===
                    String(groupId)
            );

        if (!group) {
            return;
        }

        if (
            String(group.createdBy).toUpperCase() ===
            String(currentUser.userId).toUpperCase()
        ) {
            alert(
                "The group creator cannot leave the group. Delete the group instead."
            );
            return;
        }

        const confirmed =
            confirm(
                `Are you sure you want to leave "${group.groupName}"?`
            );

        if (!confirmed) {
            return;
        }

        group.members =
            group.members.filter(
                member => {

                    if (isGuest(member)) {
                        return true;
                    }

                    return (
                        String(member)
                            .trim()
                            .toUpperCase() !==
                        String(
                            currentUser.userId
                        )
                            .trim()
                            .toUpperCase()
                    );
                }
            );

        saveGroups();

        if (
            String(
                localStorage.getItem(
                    "selectedGroupId"
                )
            ) ===
            String(groupId)
        ) {
            localStorage.removeItem(
                "selectedGroupId"
            );
        }

        renderGroups();
    }

    function renderGroups() {

        if (!groupsContainer) {
            return;
        }

        groupsContainer.innerHTML = "";

        const visibleGroups =
            getVisibleGroups();

        if (
            visibleGroups.length === 0
        ) {

            groupsContainer.style.display =
                "none";

            if (emptyGroups) {
                emptyGroups.style.display =
                    "flex";
            }

            return;
        }

        groupsContainer.style.display =
            "grid";

        if (emptyGroups) {
            emptyGroups.style.display =
                "none";
        }

        visibleGroups.forEach(
            group => {

                const total =
                    (
                        group.expenses ||
                        []
                    ).reduce(
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

                const isCreator =
                    String(
                        group.createdBy
                    ).trim().toUpperCase() ===
                    String(
                        currentUser.userId
                    ).trim().toUpperCase();

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "group-card";

                card.innerHTML = `

                    <div class="group-card-top">

                        <div class="group-icon">
                            <i class="fa-solid fa-users"></i>
                        </div>

                        <span class="group-member-count">

                            ${group.members.length}

                            ${
                                group.members.length === 1
                                    ? "member"
                                    : "members"
                            }

                        </span>

                    </div>

                    <h2>
                        ${group.groupName}
                    </h2>

                    <p class="group-card-created">

                        Created by
                        ${getUserName(
                            group.createdBy
                        )}

                    </p>

                    <div class="group-card-info">

                        <div class="group-stat">

                            <span>
                                Total Expenses
                            </span>

                            <strong>
                                ₹${total.toFixed(2)}
                            </strong>

                        </div>

                        <div class="group-stat">

                            <span>
                                Transactions
                            </span>

                            <strong>
                                ${
                                    (
                                        group.expenses ||
                                        []
                                    ).length
                                }
                            </strong>

                        </div>

                    </div>

                    <div class="group-code">

                        <span>
                            Group Code
                        </span>

                        <strong>
                            ${group.groupCode}
                        </strong>

                    </div>

                    <div class="group-card-actions">

                        <button
                            type="button"
                            class="view-group-button"
                            data-group-id="${group.groupId}"
                        >
                            <i class="fa-solid fa-arrow-right"></i>
                            Open Group
                        </button>

                        <button
                            type="button"
                            class="copy-code-button"
                            data-code="${group.groupCode}"
                        >
                            <i class="fa-solid fa-copy"></i>
                        </button>

                    </div>

                    ${
                        isCreator
                            ? `
                                <div class="group-manage-actions">

                                    <button
                                        type="button"
                                        class="edit-group-button"
                                        data-group-id="${group.groupId}"
                                    >
                                        <i class="fa-solid fa-pen"></i>
                                        Edit
                                    </button>

                                    <button
                                        type="button"
                                        class="delete-group-button"
                                        data-group-id="${group.groupId}"
                                    >
                                        <i class="fa-solid fa-trash"></i>
                                        Delete
                                    </button>

                                </div>
                            `
                            : `
                                <div class="group-manage-actions">

                                    <button
                                        type="button"
                                        class="leave-group-button"
                                        data-group-id="${group.groupId}"
                                    >
                                        <i class="fa-solid fa-right-from-bracket"></i>
                                        Leave Group
                                    </button>

                                </div>
                            `
                    }

                `;

                groupsContainer.appendChild(
                    card
                );
            }
        );

        document
            .querySelectorAll(
                ".view-group-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            const id =
                                this.dataset.groupId;

                            const group =
                                groups.find(
                                    item =>
                                        String(
                                            item.groupId
                                        ) ===
                                        String(id)
                                );

                            if (
                                !group ||
                                !isCurrentUserMember(
                                    group
                                )
                            ) {
                                alert(
                                    "You do not have access to this group."
                                );
                                return;
                            }

                            localStorage.setItem(
                                "selectedGroupId",
                                group.groupId
                            );

                            window.location.href =
                                "dashboard.html";
                        }
                    );
                }
            );

        document
            .querySelectorAll(
                ".copy-code-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        async function () {

                            const code =
                                this.dataset.code;

                            try {

                                await navigator
                                    .clipboard
                                    .writeText(code);

                                alert(
                                    "Group code copied: " +
                                    code
                                );

                            } catch (error) {

                                alert(
                                    "Group Code: " +
                                    code
                                );
                            }
                        }
                    );
                }
            );

        document
            .querySelectorAll(
                ".edit-group-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            openEditGroup(
                                this.dataset.groupId
                            );
                        }
                    );
                }
            );

        document
            .querySelectorAll(
                ".delete-group-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            deleteGroup(
                                this.dataset.groupId
                            );
                        }
                    );
                }
            );

        document
            .querySelectorAll(
                ".leave-group-button"
            )
            .forEach(
                button => {

                    button.addEventListener(
                        "click",
                        function () {

                            leaveGroup(
                                this.dataset.groupId
                            );
                        }
                    );
                }
            );
    }

    if (openGroupModal) {

        openGroupModal.addEventListener(
            "click",
            function () {

                clearCreateForm();

                openModal(
                    createGroupModal
                );
            }
        );
    }

    if (emptyCreateGroup) {

        emptyCreateGroup.addEventListener(
            "click",
            function () {

                clearCreateForm();

                openModal(
                    createGroupModal
                );
            }
        );
    }

    if (emptyJoinGroup) {

        emptyJoinGroup.addEventListener(
            "click",
            function () {

                joinGroupCode.value = "";

                joinGroupError.textContent = "";

                guestClaimBox.style.display =
                    "none";

                openModal(
                    joinGroupModal
                );
            }
        );
    }

    if (openJoinGroup) {

        openJoinGroup.addEventListener(
            "click",
            function () {

                joinGroupCode.value = "";

                joinGroupError.textContent = "";

                guestClaimBox.style.display =
                    "none";

                openModal(
                    joinGroupModal
                );
            }
        );
    }

    if (closeCreateModal) {

        closeCreateModal.addEventListener(
            "click",
            function () {

                closeModal(
                    createGroupModal
                );
            }
        );
    }

    if (closeJoinModal) {

        closeJoinModal.addEventListener(
            "click",
            function () {

                closeModal(
                    joinGroupModal
                );
            }
        );
    }

    if (closeEditModal) {

        closeEditModal.addEventListener(
            "click",
            function () {

                closeModal(
                    editGroupModal
                );
            }
        );
    }

    if (cancelCreateGroup) {

        cancelCreateGroup.addEventListener(
            "click",
            function () {

                closeModal(
                    createGroupModal
                );
            }
        );
    }

    if (cancelJoinGroup) {

        cancelJoinGroup.addEventListener(
            "click",
            function () {

                closeModal(
                    joinGroupModal
                );
            }
        );
    }

    if (cancelEditGroup) {

        cancelEditGroup.addEventListener(
            "click",
            function () {

                closeModal(
                    editGroupModal
                );
            }
        );
    }

    if (registeredMemberMode) {

        registeredMemberMode.addEventListener(
            "click",
            function () {

                registeredMemberMode.classList.add(
                    "active"
                );

                guestMemberMode.classList.remove(
                    "active"
                );

                registeredMemberBox.style.display =
                    "block";

                guestMemberBox.style.display =
                    "none";
            }
        );
    }

    if (guestMemberMode) {

        guestMemberMode.addEventListener(
            "click",
            function () {

                guestMemberMode.classList.add(
                    "active"
                );

                registeredMemberMode.classList.remove(
                    "active"
                );

                registeredMemberBox.style.display =
                    "none";

                guestMemberBox.style.display =
                    "block";
            }
        );
    }

    if (addMemberButton) {

        addMemberButton.addEventListener(
            "click",
            addMember
        );
    }

    if (addGuestMemberButton) {

        addGuestMemberButton.addEventListener(
            "click",
            addGuestMember
        );
    }

    if (memberUserId) {

        memberUserId.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    addMember();
                }
            }
        );
    }

    if (guestMemberName) {

        guestMemberName.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    addGuestMember();
                }
            }
        );
    }

    if (groupForm) {

        groupForm.addEventListener(
            "submit",
            createGroup
        );
    }

    if (joinGroupCode) {

        joinGroupCode.addEventListener(
            "input",
            checkJoinCode
        );
    }

    if (joinGroupForm) {

        joinGroupForm.addEventListener(
            "submit",
            joinGroup
        );
    }

    if (editAddMemberButton) {

        editAddMemberButton.addEventListener(
            "click",
            addEditMember
        );
    }

    if (editGroupForm) {

        editGroupForm.addEventListener(
            "submit",
            saveEditedGroup
        );
    }

    if (editRegisteredMemberMode) {

        editRegisteredMemberMode.addEventListener(
            "click",
            function () {

                editRegisteredMemberMode.classList.add(
                    "active"
                );

                editGuestMemberMode.classList.remove(
                    "active"
                );

                editRegisteredMemberBox.style.display =
                    "block";

                editGuestMemberBox.style.display =
                    "none";

                editMemberError.textContent = "";
            }
        );
    }

    if (editGuestMemberMode) {

        editGuestMemberMode.addEventListener(
            "click",
            function () {

                editGuestMemberMode.classList.add(
                    "active"
                );

                editRegisteredMemberMode.classList.remove(
                    "active"
                );

                editRegisteredMemberBox.style.display =
                    "none";

                editGuestMemberBox.style.display =
                    "block";

                editMemberError.textContent = "";
            }
        );
    }

    if (editAddGuestMemberButton) {

        editAddGuestMemberButton.addEventListener(
            "click",
            addEditGuestMember
        );
    }

    if (editGuestMemberName) {

        editGuestMemberName.addEventListener(
            "keydown",
            function (event) {

                if (event.key === "Enter") {

                    event.preventDefault();

                    addEditGuestMember();
                }
            }
        );
    }

    renderGroups();

});
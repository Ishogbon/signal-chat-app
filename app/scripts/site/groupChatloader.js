// Const groupSchema = {
//     groupTitle,
//     groupId, // Random 32 character alphanumeric string
//     admins: [],
//     members: []
// }
const groupChatModule = {
    groups: [],
    newGroup: {
        groupTItle: '',
        groupId: '',
        admins: new Set(),
        members: new Set(),
    },
    loadGroups() {
        try {
            if (!Object.is(localStorage.getItem('groups'), null)) {
                const stringfiedGroups = JSON.parse(localStorage.getItem('groups'));
                for (const stringfiedGroup of stringfiedGroups) {
                    this.groups.push(this.parseGroup(stringfiedGroup));
                }
            }
        } catch {
            this.groups = [];
        }
    },
    saveGroups() {
        const groupsToSave = [];
        for (const group of this.groups) {
            groupsToSave.push(this.stringifyGroup(group));
        }

        localStorage.setItem('groups', JSON.stringify(groupsToSave));
    },
    stringifyGroup(group) {
        const groupToSave = {};
        groupToSave.groupTitle = group.groupTitle;
        groupToSave.groupId = group.groupId;
        groupToSave.admins = JSON.stringify(Array.from(group.admins));
        groupToSave.members = JSON.stringify(Array.from(group.members));
        return groupToSave;
    },
    parseGroup(stringfiedGroup) {
        const group = {};
        group.groupTitle = stringfiedGroup.groupTitle;
        group.groupId = stringfiedGroup.groupId;
        group.admins = new Set(JSON.parse(stringfiedGroup.admins));
        group.members = new Set(JSON.parse(stringfiedGroup.members));
        return group;
    },
    randomString(length, chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ') {
        let result = '';
        for (let i = length; i > 0; --i) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }

        return result;
    },
    fetchGroup(groupId) {
        for (const group of this.groups) {
            if (groupId === group.groupId) {
                return group;
            }
        }

        return undefined;
    },
    createNewGroup() {
        this.newGroup = {
            groupTitle: '',
            groupId: this.randomString(32),
            admins: new Set(),
            members: new Set(),
        };

        this.addAdminToNewGroup(clientHandleTag);
    },
    addAdminToNewGroup(adminHandleTag) {
        if (typeof this.newGroup.admins === 'object') {
            this.newGroup.admins.add(adminHandleTag);
        }

        this.renderGroupObject();
    },
    addMemberToNewGroup(memberHandleTag) {
        if (typeof this.newGroup.members === 'object') {
            this.newGroup.members.add(memberHandleTag);
        }

        this.renderGroupObject();
    },
    removeAdminFromNewGroup(adminHandleTag) {
        if (typeof this.newGroup.admin === 'object') {
            this.newGroup.admins.delete(adminHandleTag);
        }

        this.renderGroupObject();
    },
    removeMemberFromNewGroup(memberHandleTag) {
        if (typeof this.newGroup.members === 'object') {
            this.newGroup.members.delete(memberHandleTag);
        }

        this.renderGroupObject();
    },
    offNewGroupBar() {
        document.getElementById('wrapper').style.display = 'none';
    },
    onNewGroupBar() {
        document.getElementById('wrapper').style.display = 'block';
    },
    publishGroup() {
        const groupTitle = document.getElementById('group-title-input').value;
        if (groupTitle.length >= 6 && this.newGroup.members.size >= 1) {
            this.newGroup.groupTitle = groupTitle;
            this.groups.push(this.newGroup);
            this.saveGroups();

            const message = JSON.stringify(this.stringifyGroup(this.newGroup));

            for (const recipientHandle of this.newGroup.members) {
                const createGroupMessage = {
                    sender: clientHandleTag || 'me',
                    messageType: 'group-create',
                    recipient: recipientHandle,
                    message,
                };

                console.log('Sent to ' + recipientHandle);
                chatModule.sendMessage(createGroupMessage);
            }

            this.createNewGroup();
            this.offNewGroupBar();
        }
    },
    receiveNewGroup(group) {
        group = JSON.parse(group);
        this.groups.push(this.parseGroup(group));
        this.saveGroups();
    },
    sendGroupMessage(groupId, message) {
        const createGroupMessage = {
            sender: clientHandleTag || 'me',
            messageType: 'group-message.' + groupId,
            recipient: '',
            message,
        };
        for (const member of this.fetchGroup(groupId).members) {
            if (clientHandleTag !== member) {
                createGroupMessage.recipient = member;
                chatModule.sendMessage(createGroupMessage);
            }
        }

        for (const admin of this.fetchGroup(groupId).admins) {
            if (clientHandleTag !== admin) {
                createGroupMessage.recipient = admin;
                chatModule.sendMessage(createGroupMessage);
            }
        }
    },
    renderGroupObject() {
        const adminsParentElement = document.getElementById('group-admins');
        const membersParentElement = document.getElementById('group-members');

        adminsParentElement.innerHTML = '';
        membersParentElement.innerHTML = '';

        for (const groupAdmin of this.newGroup.admins) {
            const adminELement = document.createElement('div');
            adminELement.setAttribute('class', 'new-group-members');
            adminELement.innerHTML = `
                <span class='new-group-member-user-handle'> @${groupAdmin}</span>
            `;
            adminsParentElement.append(adminELement);
        }

        for (const groupMember of this.newGroup.members) {
            const memberELement = document.createElement('div');
            memberELement.setAttribute('class', 'new-group-members');
            memberELement.innerHTML = `
                <img src='./images/white-cancel-30.png' class='remove-member-button' onclick="groupChatModule.removeMemberFromNewGroup('${groupMember}')"/> <span class='new-group-member-user-handle'> @${groupMember}</span>
            `;
            membersParentElement.append(memberELement);
        }
    },
};

groupChatModule.createNewGroup();
groupChatModule.loadGroups();

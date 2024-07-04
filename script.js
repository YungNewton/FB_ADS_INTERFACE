let previousForm = '';
const configKey = 'campaignConfig';

function showNewCampaignForm() {
    document.getElementById('mainForm').classList.add('hidden');
    document.getElementById('newCampaignForm').classList.remove('hidden');
    previousForm = 'newCampaignForm';
}

function showExistingCampaignForm() {
    document.getElementById('mainForm').classList.add('hidden');
    document.getElementById('existingCampaignForm').classList.remove('hidden');
    previousForm = 'existingCampaignForm';
}

function showMainForm() {
    document.getElementById('newCampaignForm').classList.add('hidden');
    document.getElementById('existingCampaignForm').classList.add('hidden');
    document.getElementById('successScreen').classList.add('hidden');
    document.getElementById('configEditor').classList.add('hidden');
    document.getElementById('mainForm').classList.remove('hidden');
}

function showPreviousForm() {
    document.getElementById('successScreen').classList.add('hidden');
    document.getElementById(previousForm).classList.remove('hidden');
}

document.getElementById('newCampaign').addEventListener('submit', function(event) {
    event.preventDefault();
    if (validateForm('newCampaign')) {
        showSuccessScreen();
    }
});

document.getElementById('existingCampaign').addEventListener('submit', function(event) {
    event.preventDefault();
    if (validateForm('existingCampaign')) {
        showSuccessScreen();
    }
});

function validateForm(formId) {
    const form = document.getElementById(formId);
    for (let element of form.elements) {
        if (element.type !== 'submit' && !element.checkValidity()) {
            alert(`Please fill out the ${element.name} field.`);
            return false;
        }
    }
    return true;
}

function showSuccessScreen() {
    document.getElementById('newCampaignForm').classList.add('hidden');
    document.getElementById('existingCampaignForm').classList.add('hidden');
    document.getElementById('successScreen').classList.remove('hidden');
}

function openConfigEditor(form) {
    previousForm = form === 'newCampaign' ? 'newCampaignForm' : 'existingCampaignForm';
    document.getElementById(previousForm).classList.add('hidden');
    document.getElementById('configEditor').classList.remove('hidden');

    const configContent = localStorage.getItem(configKey) || "configKey1=value1\nconfigKey2=value2\nconfigKey3=value3";
    document.getElementById('configTextArea').value = configContent;
}

function closeConfigEditor() {
    document.getElementById('configEditor').classList.add('hidden');
    document.getElementById(previousForm).classList.remove('hidden');
}

function saveConfig() {
    const updatedConfig = document.getElementById('configTextArea').value;
    localStorage.setItem(configKey, updatedConfig);

    alert('Config saved successfully!');
    closeConfigEditor();
}

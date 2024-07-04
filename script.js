let previousForm = '';

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
    document.getElementById('mainForm').classList.remove('hidden');
}

function submitForm(event, formId) {
    event.preventDefault();
    const form = document.getElementById(formId);
    const formData = new FormData(form);

    if (formId === 'newCampaign') {
        formData.append('campaign_name', form.campaignName.value);
    } else {
        formData.append('campaign_id', form.campaignId.value);
    }

    const configFile = form.configFile.files[0];
    if (configFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
            formData.append('config_text', e.target.result);
            sendFormData(formData, formId);
        };
        reader.readAsText(configFile);
    } else {
        sendFormData(formData, formId);
    }
}

function sendFormData(formData, formId) {
    const createAdButton = document.querySelector(`#${formId} .create-ad-button`);
    const goBackButton = document.querySelector(`#${formId} .go-back-button`);
    createAdButton.disabled = true;
    createAdButton.textContent = 'Processing...';
    createAdButton.style.backgroundColor = '#3e3e3e';
    goBackButton.disabled = true;
    goBackButton.style.backgroundColor = '#3e3e3e';

    fetch('https://fb-ads-backend.onrender.com/create_campaign', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        createAdButton.disabled = false;
        createAdButton.textContent = 'Create Ad';
        createAdButton.style.backgroundColor = '';
        goBackButton.disabled = false;
        goBackButton.style.backgroundColor = '';
        if (data.error) {
            console.error('Error:', data.error);
            alert(data.error);
        } else {
            showSuccessScreen();
        }
    })
    .catch(error => {
        createAdButton.disabled = false;
        createAdButton.textContent = 'Create Ad';
        createAdButton.style.backgroundColor = '';
        goBackButton.disabled = false;
        goBackButton.style.backgroundColor = '';
        console.error('Error:', error);
        alert('An error occurred while creating the campaign');
    });
}

function showSuccessScreen() {
    document.getElementById(previousForm).classList.add('hidden');
    document.getElementById('successScreen').classList.remove('hidden');
}

function showPreviousForm() {
    document.getElementById('successScreen').classList.add('hidden');
    document.getElementById(previousForm).classList.remove('hidden');
}

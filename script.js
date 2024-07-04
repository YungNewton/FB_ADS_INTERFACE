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
            sendFormData(formData);
        };
        reader.readAsText(configFile);
    } else {
        sendFormData(formData);
    }
}

function sendFormData(formData) {
    const createAdButton = document.querySelector('.create-ad-button');
    createAdButton.disabled = true;

    fetch('http://localhost:5000/create_campaign', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        createAdButton.disabled = false;
        if (data.error) {
            alert(data.error);
        } else {
            alert('Campaign and Ad Sets created successfully');
            showSuccessScreen();
        }
    })
    .catch(error => {
        createAdButton.disabled = false;
        console.error('Error:', error);
        alert('An error occurred while creating the campaign');
    });
}

function showSuccessScreen() {
    document.getElementById(previousForm).classList.add('hidden');
    document.getElementById('successScreen').classList.remove('hidden');
}

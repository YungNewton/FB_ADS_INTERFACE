let previousForm = '';
let currentTaskId;
let configData = {};
const socket = io('http://localhost:5000');  // Replace with your backend URL

function showForm(formId) {
    const forms = ['mainForm', 'newCampaignForm', 'existingCampaignForm', 'configForm', 'successScreen'];
    forms.forEach(form => {
        document.getElementById(form).classList.add('hidden');
    });
    document.getElementById(formId).classList.remove('hidden');

    // Make buttons visible again when showing the form
    if (formId !== 'successScreen' && formId !== 'configForm') {
        const createAdButton = document.querySelector(`#${formId} .create-ad-button`);
        const goBackButton = document.querySelector(`#${formId} .go-back-button`);
        const editConfigButton = document.querySelector(`#${formId} .edit-config-button`);
        if (createAdButton) createAdButton.classList.remove('hidden');
        if (goBackButton) goBackButton.classList.remove('hidden');
        if (editConfigButton) editConfigButton.classList.remove('hidden');
    }

    if (formId === previousForm && previousForm !== 'successScreen') {
        hideProgressBar(formId);
    }
    previousForm = formId !== 'successScreen' ? formId : previousForm;
}

function showConfigForm() {
    document.getElementById('configForm').classList.remove('hidden');
    const createAdButton = document.querySelector('.create-ad-button');
    const goBackButton = document.querySelector('.go-back-button');
    const editConfigButton = document.querySelector('.edit-config-button');
    if (createAdButton) createAdButton.classList.add('hidden');
    if (goBackButton) goBackButton.classList.add('hidden');
    if (editConfigButton) editConfigButton.classList.add('hidden');
}

function hideConfigForm() {
    document.getElementById('configForm').classList.add('hidden');
    showForm(previousForm);
}

function submitConfigForm(event) {
    event.preventDefault();
    const configForm = document.getElementById('config');
    configData = {
        facebook_page_id: configForm.facebook_page_id.value,
        headline: configForm.headline.value,
        link: configForm.link.value,
        utm_parameters: configForm.utm_parameters.value
    };
    hideConfigForm();
}

function submitForm(event, formId) {
    event.preventDefault();
    const form = document.getElementById(formId);
    const formData = new FormData(form);
    const taskId = generateTaskId();
    currentTaskId = taskId;
    formData.append('task_id', taskId);

    if (formId === 'newCampaign') {
        formData.append('campaign_name', form.campaignName.value);
    } else {
        formData.append('campaign_id', form.campaignId.value);
    }

    if (configData.facebook_page_id) {
        formData.append('facebook_page_id', configData.facebook_page_id);
        formData.append('headline', configData.headline);
        formData.append('link', configData.link);
        formData.append('utm_parameters', configData.utm_parameters);
    }

    startUpload(formData, formId, taskId);
}

function startUpload(formData, formId, taskId) {
    const progressContainerId = formId === 'newCampaign' ? 'newCampaignProgressContainer' : 'existingCampaignProgressContainer';
    const progressContainer = document.getElementById(progressContainerId);
    const progressBarFill = progressContainer.querySelector('.progress-bar-fill');
    const progressBarStep = progressContainer.querySelector('.progress-bar-step');
    const createAdButton = document.querySelector(`#${formId} .create-ad-button`);
    const goBackButton = document.querySelector(`#${formId} .go-back-button`);
    const editConfigButton = document.querySelector(`#${formId} .edit-config-button`);

    progressContainer.classList.remove('hidden');
    createAdButton.classList.add('hidden');
    goBackButton.classList.add('hidden');
    editConfigButton.classList.add('hidden');
    progressBarFill.style.width = '0%';
    progressBarFill.textContent = '0%';

    socket.on('progress', (data) => {
        if (data.task_id === taskId) {
            updateProgressBar(data.progress, data.step, progressContainerId);
        }
    });

    socket.on('task_complete', (data) => {
        if (data.task_id === taskId) {
            showForm('successScreen');
        }
    });

    socket.on('error', (data) => {
        if (data.task_id === taskId) {
            alert(`Error: ${data.message}`);
            hideProgressBar(formId);
        }
    });

    fetch('http://localhost:5000/create_campaign', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error);
            hideProgressBar(formId);
        }
    })
    .catch(error => {
        if (error.name === 'AbortError') {
            alert('Upload canceled');
        } else {
            alert('An error occurred while creating the campaign');
        }
        hideProgressBar(formId);
    });
}

function updateProgressBar(progress, step, progressContainerId) {
    const progressBarFill = document.querySelector(`#${progressContainerId} .progress-bar-fill`);
    const progressBarStep = document.querySelector(`#${progressContainerId} .progress-bar-step`);

    if (progressBarFill && progressBarStep) {
        progressBarFill.style.width = progress + '%';
        progressBarFill.textContent = progress.toFixed(2) + '%';  // Display percentage inside the bar
        progressBarStep.textContent = step;  // Display counter at the right end
    } else {
        console.error('Progress bar elements not found');
    }
}

function cancelUpload() {
    fetch('http://localhost:5000/cancel_task', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({task_id: currentTaskId})
    })
    .then(response => response.json())
    .then(data => {
        if (data.message) {
            alert('Upload canceled');
        } else {
            alert('Error canceling upload');
        }
        hideProgressBar(previousForm);
    });
}

function hideProgressBar(formId) {
    let progressContainer;

    if (formId === 'newCampaignForm') {
        progressContainer = document.getElementById('newCampaignProgressContainer');
    } else {
        progressContainer = document.getElementById('existingCampaignProgressContainer');
    }

    if (!progressContainer) {
        console.error(`Progress container not found for formId: ${formId}`);
        return;
    }

    const createAdButton = document.querySelector(`#${formId} .create-ad-button`);
    const goBackButton = document.querySelector(`#${formId} .go-back-button`);
    const editConfigButton = document.querySelector(`#${formId} .edit-config-button`);
    
    progressContainer.classList.add('hidden');
    if (createAdButton) createAdButton.classList.remove('hidden');
    if (goBackButton) goBackButton.classList.remove('hidden');
    if (editConfigButton) editConfigButton.classList.remove('hidden');
}

function generateTaskId() {
    return 'task-' + Math.random().toString(36).substr(2, 9);
}

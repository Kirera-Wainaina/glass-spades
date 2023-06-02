document.addEventListener('DOMContentLoaded', () => {
  const cloudUploadIcon = document.getElementById('cloud-upload-icon');
  cloudUploadIcon.addEventListener('click', toggleImageUploadModal);

  const closeUploadModal = document.getElementById('close-upload-modal');
  closeUploadModal.addEventListener('click', toggleImageUploadModal);

  const uploadButton = document.getElementById('upload-button');
  uploadButton.addEventListener('click', clickFileInput);

  const fileInput = document.querySelector('form input[type="file"]');
  fileInput.addEventListener('change', previewImagesToUpload);

  const uploadImagesForm = document.getElementById("upload-images-form")
  uploadImagesForm.addEventListener('submit', handleImageUpload);

  retrieveUploadedImages()
})

function toggleImageUploadModal() {
  const imageUploadModal = document.getElementById('image-upload-modal');
  imageUploadModal.classList.toggle('hide');
}

function clickFileInput() {
  const fileInput = document.querySelector("input[name='articleImages']");
  fileInput.click();
}

function previewImagesToUpload(event) {
  const files = event.target.files;
  const fragment = new DocumentFragment();
  const imagePreviewContainer = document.getElementById('image-preview-container');

  for (const file of files) {
    fragment.append(createImagePreview(file))
  }
  imagePreviewContainer.appendChild(fragment)
}

function createImagePreview(file) {
  const div = document.createElement('div');
  const url = URL.createObjectURL(file);
  
  const img = document.createElement('img');
  img.src = url;

  div.classList.add('preview');
  div.appendChild(createRemovePreviewIcon());
  div.appendChild(img);
  return div;
}

function createRemovePreviewIcon() {
  const closeIcon = document.createElement('input');
  closeIcon.type = 'image';
  closeIcon.src = '/frontend/images/white-close.svg';
  closeIcon.alt = 'remove image';
  closeIcon.classList.add('remove-preview');
  closeIcon.addEventListener('click', removePreviewImage);
  return closeIcon  
}

function removePreviewImage(event) {
  const preview = event.target.parentElement;
  const img = preview.querySelector('img');
  
  URL.revokeObjectURL(img.src);
  preview.remove();
}

async function handleImageUpload(event) {
  event.preventDefault();
  
  const loadingPage = document.getElementById('loading-page');
  loadingPage.style.display = 'flex';
  
  const formdata = await enterImagesIntoFormData();
  
  fetch('/api/admin/article-images/uploadImages', {
    method: 'POST',
    body: formdata
  }).then(response => response.text())
    .then(handleImageUploadResponse)
}

async function enterImagesIntoFormData() {
    const imageElements = Array.from(document.querySelectorAll('.preview img'));
    const formdata = new FormData();
  
    await Promise.all(imageElements.map(element => {
      const name = `${Date.now()}-${Math.trunc(Math.random() * 1e6)}`;
      return fetch(element.src)
        .then(response => response.blob())
        .then(blob => formdata.append(name, blob))
    }))
    formdata.append('fileNumber', imageElements.length)
    return formdata
}

function handleImageUploadResponse(text) {
  if (text == 'success') {
    location.reload()
  } else {
    const snackbar = document.getElementById("image-upload-error");
    snackbar.classList.toggle('slide');
    snackbar.classList.remove('hide');
    snackbar.addEventListener(
      "animationend", 
      () => {
        snackbar.classList.toggle('slide')
        snackbar.classList.add('hide');
      }
    )
  }
}

function retrieveUploadedImages() {
  fetch('/api/admin/article-images/retrieveUploadedImages')
    .then(response => response.json())
    .then(data => displayUploadedImages(data))
}

function displayUploadedImages(uploadedImages) {
  const imageContainer = document.getElementById("uploaded-images");
  const fragment = new DocumentFragment();

  uploadedImages.forEach(imageData => {
    fragment.append(createUploadedImageContainer(imageData));
  })

  imageContainer.appendChild(fragment);
}

function createUploadedImageContainer(imageData) {
  const div = document.createElement('div');

  const img = document.createElement('img');
  img.src = imageData.link;
  img.dataset.name = imageData.name;

  div.append(createDeleteIcon());
  div.append(img);
  div.append(createLinkButton(imageData.link))
  div.classList.add('uploaded-image')
  return div;
}

function createDeleteIcon() {
  const deleteIcon = document.createElement('input');
  deleteIcon.type = 'image';
  deleteIcon.src = '/frontend/images/delete.svg';
  deleteIcon.alt = 'set image for deletion'
  deleteIcon.classList.add('delete-uploaded-image');
  deleteIcon.addEventListener('click', handleSingleImageDelete)
  return deleteIcon
}

function createLinkButton(link) {
  const button = document.createElement('button');
  button.type = 'button';
  button.dataset.link = link;
  button.textContent = 'Copy Link';
  button.classList.add('link-button');
  button.addEventListener('click', copyLinkToClipboard);
  return button
}

function copyLinkToClipboard(event) {
  const link = event.target.dataset.link;
  navigator.clipboard.writeText(link);

  const snackbar = document.getElementById('link-copied-snackbar');
  snackbar.addEventListener('animationend', () => {
      snackbar.classList.remove('slide');
      snackbar.classList.add('hide')
  })
  snackbar.classList.add('slide');
  snackbar.classList.remove('hide');
}

function handleSingleImageDelete(event) {
  const parentElement = event.target.parentElement;
  parentElement.classList.toggle('selected-for-deletion')

  const selected = document.querySelectorAll('.selected-for-deletion');
  const deleteAllIcon = document.getElementById('delete-icon');
  if (selected.length) {
    deleteAllIcon.classList.remove('hide')
  } else {
    deleteAllIcon.classList.add('hide')
  }
}
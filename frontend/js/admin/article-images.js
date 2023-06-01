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
    snackbar.style.display = 'block';
    snackbar.addEventListener(
      "animationend", 
      () => {
        snackbar.classList.toggle('slide')
        snackbar.style.display = 'none';
      }
    )
  }
}
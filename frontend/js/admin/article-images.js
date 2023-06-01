document.addEventListener('DOMContentLoaded', () => {
  const cloudUploadIcon = document.getElementById('cloud-upload-icon');
  cloudUploadIcon.addEventListener('click', toggleImageUploadModal);

  const closeUploadModal = document.getElementById('close-upload-modal');
  closeUploadModal.addEventListener('click', toggleImageUploadModal);

  const uploadButton = document.getElementById('upload-button');
  uploadButton.addEventListener('click', clickFileInput);

  const fileInput = document.querySelector('form input[type="file"]');
  fileInput.addEventListener('change', previewImagesToUpload)
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
  return closeIcon  
}
document.addEventListener('DOMContentLoaded', () => {
  const cloudUploadIcon = document.getElementById('cloud-upload-icon');
  cloudUploadIcon.addEventListener('click', toggleImageUploadModal);

  const closeUploadModal = document.getElementById('close-upload-modal');
  closeUploadModal.addEventListener('click', toggleImageUploadModal);

  const uploadButton = document.getElementById('upload-button');
  uploadButton.addEventListener('click', clickFileInput);

  const fileInput = document.getElementById('form input[type="file"]');
  fileInput.addEventListener('change', previewImagesToUpload)
})

function toggleImageUploadModal() {
  const imageUploadModal = document.getElementById('image-upload-modal');
  imageUploadModal.classList.toggle('flex');
}

function clickFileInput() {
  const fileInput = document.querySelector("input[name='articleImages']");
  fileInput.click();
}

function previewImagesToUpload(event) {
  const files = event.target.files;
  const fragment = new DocumentFragment();

  for (const file of files) {
    fragment.append(createImagePreviewContainer(file))
  }
}

function createImagePreviewContainer(file) {
  const div = document.createElement('div');
  return div;
}
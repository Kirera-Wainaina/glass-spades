document.addEventListener('DOMContentLoaded', () => {
  const cloudUploadIcon = document.getElementById('cloud-upload-icon');
  cloudUploadIcon.addEventListener('click', toggleImageUploadModal);

  const closeUploadModal = document.getElementById('close-upload-modal');
  closeUploadModal.addEventListener('click', toggleImageUploadModal);

  const uploadButton = document.getElementById('upload-button');
  uploadButton.addEventListener('click', clickFileInput);
})

function toggleImageUploadModal() {
  const imageUploadModal = document.getElementById('image-upload-modal');
  imageUploadModal.classList.toggle('flex');
}

function clickFileInput() {
  const fileInput = document.querySelector("input[name='articleImages']");
  fileInput.click();
}
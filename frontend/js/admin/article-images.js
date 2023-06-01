document.addEventListener('DOMContentLoaded', () => {
  const cloudUploadIcon = document.getElementById('cloud-upload-icon');
  cloudUploadIcon.addEventListener('click', showImageUploadModal);
})

function showImageUploadModal() {
  const imageUploadModal = document.getElementById('image-upload-modal');
  imageUploadModal.classList.toggle('flex');
}
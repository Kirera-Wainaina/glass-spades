document.addEventListener('DOMContentLoaded', () => {
  const cloudUploadIcon = document.getElementById('cloud-upload-icon');
  cloudUploadIcon.addEventListener('click', toggleImageUploadModal);

  const closeUploadModal = document.getElementById('close-upload-modal');
  closeUploadModal.addEventListener('click', toggleImageUploadModal)
})

function toggleImageUploadModal() {
  const imageUploadModal = document.getElementById('image-upload-modal');
  imageUploadModal.classList.toggle('flex');
}
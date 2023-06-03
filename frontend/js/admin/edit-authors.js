document.addEventListener('DOMContentLoaded', async () => {
    const authorDetailsContainer = document.querySelector('#author-list');
    const data = await retrieveAuthorDetails();
    const fragment = createAuthorContainers(data);
    
    authorDetailsContainer.appendChild(fragment);
});

function retrieveAuthorDetails() {
    return fetch('/api/admin/edit-authors/getAuthors')
    .then(response => response.json())
}

function createAuthorContainers(data) {
    const fragment = new DocumentFragment();
    data.forEach(authorDetails => {
        fragment.append(createSingleAuthorContainer(authorDetails))
    });
    return fragment
}

function createSingleAuthorContainer(authorDetails) {
    const a = document.createElement('a');
    a.href = `/admin/edit-author?id=${authorDetails._id}`;

    const img = document.createElement('img');
    img.src = authorDetails.profileImageLink;
    img.height = "100";
    img.width = "100";

    const p = document.createElement('p');
    p.textContent = authorDetails.authorName;

    a.append(img);
    a.append(p)
    a.classList.add('author-details')
    return a
}


import { displaySnackbar } from "../general.js";
import { createPreviewData, handleSubmit     } from "./upload-article.js";

document.addEventListener('DOMContentLoaded', fetchArticleData);

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('edit-form');
    if (form) {
        form.addEventListener('submit', event => {
            event.preventDefault();
            handleSubmit(createDataToEdit(), submitArticleEdit)
        })
    }
})

document.addEventListener('authors-available', setAuthor);
document.addEventListener('article-available', setAuthor);

function fetchArticleData() {
    const params = new URLSearchParams(location.search);
    fetch(`/api/admin/edit-article/retrieveArticle?urlTitle=${params.get('urlTitle')}&id=${params.get('id')}`)
        .then(response => response.json())
        .then(data => inputDataIntoForm(data[0]));
}

function inputDataIntoForm(data) {
    inputDataIntoInputElements(data);
    inputContentIntoTextArea(data.content);
    setCategory(data.category);
    if (data.authorId) sessionStorage.setItem('authorId', data.authorId);

    const event = new Event('article-available');
    document.dispatchEvent(event);
}

function inputDataIntoInputElements(data) {
    const inputs = document.querySelectorAll('form input');
    inputs.forEach(input => {
        const value = data[input.name];
        if (value) input.value = data[input.name]
    });
}

function inputContentIntoTextArea(content) {
    const textArea = document.querySelector('form textarea');
    textArea.value = content;
}

function setCategory(category) {
    const select = document.querySelector('form select');
    select.value = category;
}

function submitArticleEdit(formdata) {
    fetch('/api/admin/edit-article', {
        method: 'POST',
        body: formdata
    }).then(handleEditResponse);
}

async function handleEditResponse(response) {
    if (response.status == 200) {
        location.href = '/admin/edit-articles';
    } else {
        displaySnackbar("article-edit-error")
    }
}

function createDataToEdit() {
    const previewData = createPreviewData();
    const params = new URLSearchParams(location.search);
    delete previewData.publishedDate

    return {
        ...previewData,
        id: params.get('id'),
        urlTitle: params.get('urlTitle')
    }
}

function setAuthor() {
    // function called on authors-available and article-available event
    // if both sources of data are available, then the author can be set
    // events are needed because, article and author data arrival is unpredictable
    const authorId = sessionStorage.getItem('authorId');
    const authorsAvailable = sessionStorage.getItem('authorsAvailable');
    if (authorId && authorsAvailable) {
        const option = document.querySelector(`option[value=${authorId}]`);
        option.setAttribute('selected', '');
        
        sessionStorage.removeItem('authorId');
        sessionStorage.removeItem('authorsAvailable');
        return;
    }
    return;
}
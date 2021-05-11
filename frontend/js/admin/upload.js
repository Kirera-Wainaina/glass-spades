window.addEventListener("load", () => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload/sendModelData");
    xhr.send();

    xhr.onreadystatechange = function() {
	if (this.readyState == 4) {
	    console.log(this.response)
	}
    }
});

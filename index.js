function getQuestions() {
    alert("GETTING");
    fetch("http://localhost:3000/get-questions", {
            method: 'GET'
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
            });
  }


window.onload = function() {
  fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: '{alltodos{title, description, date}, allids}',
    })
  })
    .then(r => r.json())
    .then(function(data){
      var todos = data.data.alltodos;
      var ids = data.data.allids;
      for(var i=0; i<todos.length; i++){
        var todo = todos[i];
        list.insertAdjacentHTML('beforeend', todoTemplate(todo.title, todo.description, todo.date, ids[i]));
      }
    });
};



var addmutate = 
`mutation MutateTodo($title: String!, $desc: String!, $date: String!) {
  mutateTodo(title: $title, description: $desc, date: $date) {
    todo {
      title
      description
      date
    }
    id
  }
}`;

var elem;

const todoTemplate = (title, desc, date, id) => 
`<div id=${id} class="border mb-5 bg-white shadow-lg rounded p-4 flex flex-col justify-between leading-normal">
<p class="block text-gray-700 font-bold">Title:</p>
<p class="pb-2">${title}</p>
<p class="block text-gray-700 font-bold">Description:</p>
<p class="pb-2">${desc}</p>
<p class="block text-gray-700 font-bold">Date:</p>
<p class="pb-2">${date}</p>
<div class="flex justify-center mt-3">
  <span class="px-5">
    <a href="#id">
    <button onclick="setTodo(this)" class="bg-teal-500 hover:bg-teal-600 text-white font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline" type="button">
      Edit
    </button>
    </a>
  </span>
  <span>
    <button onclick="deleteTodo(this)" class="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 px-5 rounded focus:outline-none focus:shadow-outline" type="button">
      Delete
    </button>
  </span>
</div>
</div>`


var list = document.getElementById('addtask');

function addItem(){
    var title = document.getElementById('title').value;
    var desc = document.getElementById('description').value;
    var date = document.getElementById('date').value;
    var state = document.getElementById('addsave').innerHTML;
    if(title == '' || desc == '' || date == ''){
        alert('Please fill all the fields');
    }
    else if(state=='Save'){
        editTodo(elem, title, desc, date);
        document.getElementById('addsave').innerHTML = "Add";
    }
    else{
        fetch('/graphql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            body: JSON.stringify({
              query: addmutate,
              variables: {title, desc, date},
            })
          })
            .then(r => r.json())
            .then(function(data){
              var todo = data.data.mutateTodo.todo;
              list.insertAdjacentHTML('beforeend', todoTemplate(todo.title, todo.description, todo.date, data.data.mutateTodo.id));
            
            });
    }
    document.getElementById('title').value = '';
    document.getElementById('description').value = '';
    document.getElementById('date').value = '';
}

var delmutate = 
`mutation DeleteTodo($ID: Int!) {
  deleteTodo(id: $ID) {
    todo {
      title
    }
  }
}`;

function deleteTodo(el) {  
  var ID = el.parentNode.parentNode.parentNode.id;
  fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: delmutate,
      variables: {ID},
    })
  })
    .then(r => r.json())
    .then(function(data){
      var todoContainer = document.getElementById(ID.toString());
      todoContainer.parentNode.removeChild(el.parentElement.parentNode.parentNode);
    });
}

var editmutate = `mutation EditTodo($ID: Int!, $title: String!, $desc: String!, $date: String!) {
  editTodo(id: $ID, title: $title, description: $desc, date: $date) {
    todo {
      title
      description
      date
    }
    id
  }
}`;

function editTodo(el, title, desc, date) {
  var ID = el.parentNode.parentNode.parentNode.parentNode.id;
  fetch('/graphql', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      query: editmutate,
      variables: {ID, title, desc, date},
    })
  })
    .then(r => r.json())
    .then(function(data){
      var todoContainer = document.getElementById(ID.toString());
      todoContainer.parentNode.removeChild(el.parentElement.parentNode.parentNode.parentNode);
      var todo = data.data.editTodo.todo;
      list.insertAdjacentHTML('beforeend', todoTemplate(todo.title, todo.description, todo.date, data.data.editTodo.id));
      elem = null;
    });
}

function setTodo(el) {
  var cont = el.parentElement.parentNode.parentNode.parentNode;
  document.getElementById('title').value = cont.childNodes[3].innerHTML;
  document.getElementById('description').value = cont.childNodes[7].innerHTML;
  document.getElementById('date').value = cont.childNodes[11].innerHTML;
  document.getElementById('addsave').innerHTML = "Save";
  elem = el;
}
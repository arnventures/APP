

  function getAddressUrl(relativeUrl = '') {
    return `addresses/${relativeUrl}`;
  }

  function setError(message) {
    setContent(
      "status",
      createText(message)
    );
  }

  function searchNames() {
    let input = document.getElementById('searchInput');
    let filter = input.value.toUpperCase();
    let ul = document.getElementById('list-panel');
    let li = ul.getElementsByTagName('li');
  
    for (let i = 0; i < li.length; i++) {
      let a = li[i].getElementsByTagName('a')[0];
      let txtValue = a.textContent || a.innerText;
      if (txtValue.toUpperCase().indexOf(filter) > -1) {
        li[i].style.display = "";
      } else {
        li[i].style.display = "none";
      }
    }
    document.getElementById('searchInput').value = '';
  }
  

  async function deleteAddress(id) {
    try {
      await deleteData(getAddressUrl(id));
  
      // Find the index of the address with the given id
      let index = addresses.findIndex(address => address.id === id);
  
      clearContent("detail-panel");
      removeListItem("list-panel", index);
    } catch (error) {
      setError(`Unable to delete gas [${id}]: ${error.message}`);
    }
  }

  async function updateAddress(address, index) {
    try {
      await putData(getAddressUrl(address.id), address);

      updateListItem("list-panel", index, createAddressListItem(address, index));
    } catch (error) {
      setError(`Unable to update gas [${address.id}]: ${error.message}`);
    }
  }

  let usedIds = [];

  async function createNewAddress(address, index) {
    try {
      address = await postData(getAddressUrl(), address);
      usedIds.push(address.id); // Add this line here
  
      index = getListItemCount("list-panel");
  
      addListItem("list-panel", index, createAddressListItem(address, index));
  
      setDetail(address, index);
    } catch (error) {
      setError(`Unable to create address: ${error.message}`);
    }
  }
  

  function saveAddress(address, index) {
    const inputs = document.getElementById('detail-panel').getElementsByTagName('input');

    for (const input of inputs) {
      address[input.id] = input.value
    }

    if (addressExists(address, index)) {
      updateAddress(address, index);
    } else {
      createNewAddress(address, index);
    }
  }

  function addressExists(address, index) {
    return index >= 0;
  }

  function* getDetailButtons(address, index) {
    if (addressExists(address, index)) {
      yield createButton("Delete", () => deleteAddress(address.id, index));
    }

    yield createButton("Save", () => saveAddress(address, index));
  }

  function setDetail(address, index) {
    setContent(
      "detail-panel",
      createDetailPanel(address, index)
    );
  }
  function createDetailPanel(address, index) {
    let detailPanel = document.createElement('div');
    detailPanel.id = 'detail-panel';
    detailPanel.className = 'detail-panel form-group';

    let fields = ['id', 'lastName', 'firstName', 'salary', 'birthDate'];
    let idInput;

    for (let field of fields) {
        let div = document.createElement('div');
        div.className = 'field';

        let label = document.createElement('label');
        label.textContent = field;
        div.appendChild(label);

        let input = document.createElement('input');
        input.id = field;
        input.className = 'form-control';
        input.value = address[field] || '';

        if (field === 'birthDate') {
            input.type = 'text';
            input.className += ' datepicker'; // Add datepicker class
        } else {
            input.type = 'text';
        }

        if (field === 'id') {
            input.required = true;
            idInput = input; // Save a reference to the 'id' input field
        }

        div.appendChild(input);
        detailPanel.appendChild(div);
    }

    let buttonsDiv = document.createElement('div');
    buttonsDiv.className = 'buttons mt-3';

    let deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'btn btn-danger';
    deleteButton.style.marginRight = '10px';
    deleteButton.addEventListener('click', function() {
        deleteAddress(address.id);
    });
    buttonsDiv.appendChild(deleteButton);

    let saveButton = document.createElement('button');
    saveButton.textContent = 'Save';
    saveButton.className = 'btn btn-primary';
    saveButton.disabled = true; // Disable the button initially
    saveButton.addEventListener('click', function() {
        saveAddress(address, index);
    });
    buttonsDiv.appendChild(saveButton);

    // Add the event listener to the 'id' input field
    // Add the event listener to the 'id' input field
    idInput.addEventListener('input', function() {
        let idValue = parseInt(idInput.value);
        let errorMessage = document.getElementById('error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.id = 'error-message';
            errorMessage.className = 'text-danger'; // Bootstrap class for red text
            idInput.parentNode.appendChild(errorMessage);
        }
        if (!idInput.value || idValue < 1 || idValue > 999) {
            idInput.classList.add('is-invalid'); // Make the input field red
            saveButton.disabled = true; // Disable the Save button
            errorMessage.textContent = 'Please enter an ID between 1 and 999.';
        } else if (usedIds.some(id => id === idValue)) {
            errorMessage.textContent = 'Id used';
            idInput.classList.add('is-invalid'); // Make the input field red
            saveButton.disabled = true; // Disable the Save button
            errorMessage.textContent = 'This ID is already in use.';    
        } else {
            idInput.classList.remove('is-invalid'); // Remove the red color
            saveButton.disabled = false; // Enable the Save button
            errorMessage.textContent = '';
        }
    });
    detailPanel.appendChild(buttonsDiv);

    // Initialize the datepicker
    $(function () {
        $('.datepicker').datepicker({
            language: "es",
            autoclose: true,
            format: "dd/mm/yyyy"
        });
    });

    return detailPanel;
}




  async function showAddress(id, index) {
    try {
      const address = await getData(getAddressUrl(id));

      setDetail(address, index);
    } catch (error) {
      setContent('detail-panel', createText('no gas'));
      setError(`Unable to retrieve gas [${id}]: ${error.message}`);
    }
  }

  function createAddressListItem(a, index) {
    return createLink(`${a.firstName} ${a.lastName}`, () => showAddress(a.id, index))
  }

  async function getAddresses() {
    try {
      const addresses = await getData(getAddressUrl());

      setList(
        "list-panel",
        addresses.map(createAddressListItem)
      );
    } catch (error) {
      setError(`Unable to retrieve addresses: ${error.message}`);
    }
  }


  function createAddress() {
    // TODO Figure out how to create a new object generically (add to schema?)
    const address = {
      firstName: '',
      lastName: '',
      birthDate: new Date(),
      salary: 0,
    }
    setDetail(address, -1);
  }

  window.onload = getAddresses;

import * as contact from './contacts.js';
import * as tableCreate from './tableCreate.js';

const tableHeader  = document.getElementById('table-header');
const tableContent = document.getElementById('table-content');
const footer       = document.getElementById('footer'); 

// When select an element on the table, we will save that row here.
let currentSelection;

const emptyJSON = {
    "firstName": "First Name",
    "lastName": "Last Name",
    "email": "Email",
    "phone": "Phone Number"
};

// Watches an element, although this should specifally be used for observing the 
// height of main to dynamically set the tableHeight based on window height.
const heightObserver = new ResizeObserver(selection => {
    for (let entry of selection) {
        const entryHeight = entry.contentRect.height;
        setTableHeight(entryHeight);
    }
});

// Set table height dynamically to the height of #main.
function setTableHeight(height) {
    const headerHeight = tableHeader.clientHeight;
    // The header is one element that is "pushing down" the table contnet.
    // To negate this, we subtract the headers height from the total (main height).
    tableContent.style.height = (height - headerHeight) + "px";
};

// Creates an input row and adds to the table from JSON object
function createInputRow(inputJSON) {
    const row = tableCreate.inputRow(inputJSON);
    row.setAttribute('id', 'rowInput');
    tableContent.appendChild(row);
    
    // NOTE: FIX LATER, button messes up table formatting.
    const submitContact = document.createElement('td');
    submitContact.setAttribute('class', 'submitBtn');
    const submitBtn = document.createElement('button');
    submitBtn.setAttribute('id', 'submitContact');
    submitBtn.textContent = "Submit";
    // Attach button to cell
    submitContact.appendChild(submitBtn);

    row.appendChild(submitContact);
    tableContent.getElementsByTagName('table')[0].prepend(row);
}

const dataSize = 4;
// Convert all cells in a given row to input fields.
function convertCells_toInputs(array) {
    // No magic numbers; we have 4 cells of data to convert into an input field.
    for (let i = 0; i < dataSize; i++) {
        const inputField = document.createElement('input');
        const value = array[i].textContent;
        // Remove text content from the cell.
        array[i].textContent = '';
        inputField.value = value;
        
        array[i].appendChild(inputField);
    }
}

// Takes in the array of the row we confirmed on, and then returns an object
// of the new data to update with.
function confirmInput(array) {
    const inputPackage = {
        firstName:  '',
        lastName:   '',
        email:      '',
        phone:      '',
        contactId:  ''
    };

    let i = 0;
    for (const property in inputPackage) 
    {
        console.log(array[i]);
        console.log(array[i].children[0]);

        if (property != 'contactId')
            inputPackage[property] = array[i].children[0].value;

        i++;
    }

    return inputPackage;
}

// When user confirms, it will change the input fields into text content for 
// the cells.
function inputs_toCells(array) {
    for (let i = 0; i < dataSize; i++) {
        const value = array[i].children[0].value;
        array[i].removeChild(array[i].children[0]);
        array[i].textContent = value;
    }
}

// Catalouge of event listeners, perform these sets of functions.
// We can watch the entire document, and have a "switch" to check which one
// was clicked.
(function eventListeners() {
    document.addEventListener('input', (e) => {   
        // Every time there is an event using the search bar
        if (e.target.id == 'searchBar') {
            // Send text in search bar to search
            contact.searchContacts();
        }
    });

    document.addEventListener('click', (e) => {
        // Add Contact is clicked.
        if (e.target.id == 'createContact') {
            // if rowInput doesnt exist create it. Else do nothing.
            const existingRow = tableContent.querySelector('#rowInput');
            if (existingRow == null) {        
                // Creates an input row using the sample object
                createInputRow(emptyJSON);
            }
        }
        // Submit user button is clicked add contact.
        else if (e.target.id == 'submitContact') {
            contact.registerContact();
        }
        // Edit is clicked.
        else if (e.target.className == 'editBtn' || e.target.className == 'editBtn disabled') {
            if (e.target.className == 'editBtn disabled')
                return false;
            // where that button is contained.
            const rowCells = Array.from(currentSelection.cells);
            convertCells_toInputs(rowCells);
            
            // Convert the edit button into a "confirm button".
            e.target.className = "confirmBtn";
            e.target.textContent = "Confirm";
        } 
        // Confirm is clicked.
        else if (e.target.className == 'confirmBtn') {
            const rowInputs = Array.from(currentSelection.cells);
            const packagedInput = confirmInput(rowInputs);
            console.log(packagedInput);
            
            inputs_toCells(rowInputs);

            // Send the edited contact to the database
            contact.updateContact(currentSelection);

            console.log("Convert confirm to edit");
            // Convert the confirm button into a "edit button".
            e.target.className = "editBtn";
            e.target.textContent = "Edit";
        }
        // Remove Contact is clicked.
        else if (e.target.className == 'removeBtn' || e.target.className == 'removeBtn disabled') {
            console.log('cliedadasd');
            if (e.target.className == 'removeBtn disabled') return false;
            const table = tableContent.getElementsByTagName('table')[0];
            const trashRow = currentSelection;

            // Delete the contact from the database then delete from table
            let confirm;
            if (window.confirm("Are you sure?"))
            {
                // Yes
                contact.deleteContact(trashRow);
                table.removeChild(trashRow);
            }
            else 
            {
                // No
            }
            for (i = 0; i < 2; i++)
            {
                actionButtonsList[i].className += ' disabled';
            }

        }
        // Mega spaghetti code.
        else if (e.target.nodeName == 'TD' && e.target.parentNode.parentNode.parentNode.id == 'table-content') {
            const table = e.target.parentNode.parentNode;
            // remove any previous selection
            for (let i = 0; i < table.childElementCount; i++) {
                if (table.childNodes[i].className = 'selected')
                    table.childNodes[i].className = '';
            }

            // apply newly selected element.
            const tr = e.target.parentNode;
            tr.className = 'selected';

            // make the action buttons active.
            for (let i = 0; i < actionButtonsList.length; i++) {
                let className = actionButtonsList[i].className;
                let newClass  = className.replace(" disabled", "");
                // Remove disabled.
                actionButtonsList[i].className = newClass;
            }

            currentSelection = e.target.parentNode;
        }
    });
})();

const actionButtonsList = document.querySelectorAll('.disabled');

// Object of variables or functions to package to be used across the application.
export { heightObserver, setTableHeight }

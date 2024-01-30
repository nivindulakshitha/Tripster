// Declarations
var collections = [];
const documents = {};
const dataRetrieverTime = 3000;
let collectionSelection = "";

// Trigger when user clicks on the sign-in button and checks credentials with the database via IpcRenderer
document.querySelector("body > section:first-child > div > div:nth-child(3) > button").addEventListener("click", async () => {
    // Display connecting status
    document.querySelector("#login-cover").classList.remove("hidden");
    document.querySelector("#connection-status").classList.remove("hidden");
    document.querySelector("#login-text").innerHTML = "Connecting...";
    document.querySelector("#login-area").style.filter = "blur(2px)";

    // Use object destructuring for cleaner code
    const { value: database } = document.querySelector("#database-name");
    const { value: username } = document.querySelector("#admin-username");
    const { value: password } = document.querySelector("#admin-password");

    try {
        const result = await performDatabaseConnect("WAD", "Admin", "wadproject24");

        if (result.connection) {
            document.querySelector("#login-cover").classList.add("hidden");
            document.querySelector("#connection-status").classList.add("hidden");
            document.querySelector("#login-text").innerHTML = "Connecting...";
            document.querySelector("#login-area").style.filter = "none";
            document.querySelector("#connection-status").setAttribute("status", "");
            document.querySelector("#admin-username").focus();
            document.querySelector("body > section:nth-child(1)").classList.add("hidden");
            sectionThreeUpdater(result);
        } else {
            document.querySelector("#connection-status").setAttribute("status", "error");
            document.querySelector("#login-text").innerHTML = "Database sign-in error occurred.<br>Try again with correct credentials.";
        }
    } catch (error) {
        console.log("Error in database operation:", error);
    }
});

// If user credentials are incorrect and try
document.querySelector("#connection-status > button").addEventListener("click", () => {
    document.querySelector("#login-cover").classList.add("hidden");
    document.querySelector("#connection-status").classList.add("hidden");
    document.querySelector("#login-text").innerHTML = "Connecting...";
    document.querySelector("#login-area").style.filter = "none";
    document.querySelector("#connection-status").setAttribute("status", "");
    document.querySelector("#admin-username").focus();
});

// Perform the database connection action on Enter key press event in the sign-in form
document.querySelector("body > section:first-child").addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
        event.preventDefault();
        document.querySelector("body > section:first-child > div > div:nth-child(3) > button").click();
    }
});

// Delete this
setTimeout(() => {
    document.querySelector("body > section:first-child > div > div:nth-child(3) > button").click();
}, 500);

document.addEventListener("DOMContentLoaded", () => {
    // Get focus every time when sign-in page landed
    document.querySelector("#admin-username").focus();

    // Check the online status every second
    setInterval(async () => {
        if (!navigator.onLine || !await checkInternetConnection()) {
            document.querySelector("body > section:nth-child(3)").classList.remove("hidden");
        } else {
            document.querySelector("body > section:nth-child(3)").classList.add("hidden");
        }
    }, 1000);
});

// Function to check the internet connection is available
async function checkInternetConnection() {
    try {
        await fetch('https://www.google.com', { method: 'HEAD', mode: 'no-cors' });
        return true;
    } catch (error) {
        return false;
    }
}

// HTML Section 3 update caller
const sectionThreeUpdater = (result) => {
    updateDatabaseStatus();
    document.querySelector("body > section:nth-child(2)").classList.remove("hidden");
};

// Call update UI every 15 seconds
const updateDatabaseStatus = () => {
    getDatabaseDetails().then((result, error) => {
        databaseStatusUpdater(result);
    });

    setInterval(async () => {
        getDatabaseDetails().then((result, error) => {
            databaseStatusUpdater(result);
        });
    }, dataRetrieverTime);
};

// UI update function
const databaseStatusUpdater = (result) => {
    if (result.connection) {
        dataRetriever();
        document.getElementById("database-storagesize").innerText = Math.round((result.storageSize + Number.EPSILON) * 100) / 100;
        document.getElementById("database-datasize").innerText = Math.round((result.dataSize + Number.EPSILON) * 100) / 100;
        document.getElementById("database-totaldocuments").innerText = result.objects < 10 ? "0" + result.objects : result.objects;
        document.getElementById("database-totalcollection").innerText = result.collections < 10 ? "0" + result.collections : result.collections;
        document.getElementById("database-indexsize").innerText = Math.round((result.indexSize + Number.EPSILON) * 100) / 100;
        const roleList = result.roles.map(role => role.role);

        if (roleList.includes("atlasAdmin")) {
            document.querySelector("#accordion-flush-heading-1").classList.remove("disabled");
            document.querySelector("#accordion-flush-heading-2").classList.remove("disabled");
            document.querySelector("#accordion-flush-heading-3").classList.remove("disabled");
            document.querySelector("#accordion-flush-heading-4").classList.remove("disabled");
        } else if (roleList.includes("readWrite")) {
            document.querySelector("#accordion-flush-heading-1").classList.remove("disabled");
            document.querySelector("#accordion-flush-heading-2").classList.remove("disabled");
            document.querySelector("#accordion-flush-heading-3").classList.remove("disabled");
            document.querySelector("#accordion-flush-heading-4").classList.add("disabled");
        } else if (roleList.includes("read")) {
            document.querySelector("#accordion-flush-heading-1").classList.add("disabled");
            document.querySelector("#accordion-flush-heading-2").classList.remove("disabled");
            document.querySelector("#accordion-flush-heading-3").classList.add("disabled");
            document.querySelector("#accordion-flush-heading-4").classList.add("disabled");
        } else {
            document.querySelector("#accordion-flush-heading-1").classList.add("disabled");
            document.querySelector("#accordion-flush-heading-2").classList.add("disabled");
            document.querySelector("#accordion-flush-heading-3").classList.add("disabled");
            document.querySelector("#accordion-flush-heading-4").classList.add("disabled");
        }
    } else {
        document.getElementById("database-storagesize").innerText = "00";
        document.getElementById("database-datasize").innerText = "00";
        document.getElementById("database-totaldocuments").innerText = "00";
        document.getElementById("database-totalcollection").innerText = "00";
        document.getElementById("database-indexsize").innerText = "00";
    }
};

// For the READ operation
document.querySelector("#accordion-flush-heading-2").addEventListener("click", crudRead);
document.querySelector("#read-collection").addEventListener("change", (event) => {
    collectionSelection = event.target.value;
    document.getElementById("read-search").value = "";
    document.getElementById("read-null").checked = false;
    crudRead();
});

// For the DELETE operation
document.querySelector("#accordion-flush-heading-4").addEventListener("click", crudDelete);
document.querySelector("#delete-collection").addEventListener("change", (event) => {
    collectionSelection = event.target.value;
    document.getElementById("delete-search").value = "";
    document.getElementById("delete-null").checked = false;
    crudDelete();
});

async function crudRead(event) {
    document.querySelector("#accordion-flush-body-2 > div > div > div").setAttribute("status", "");

    if (document.querySelector("#accordion-flush-heading-2 > div").getAttribute("aria-expanded") === "true") {
        try {
            while (collections.length === 0) {
                await new Promise(resolve => setTimeout(resolve, dataRetrieverTime));
            }

            const collectionSelect = document.querySelector("#read-collection");
            collectionSelect.innerHTML = "";
            for (const collection of collections) {
                const option = await createElement("option", collection, [], collectionSelect)
                option.setAttribute("value", collection);

                if (collectionSelection.length === 0 && collections.indexOf(collection) === 0) {
                    option.selected = true;
                    collectionSelection = collection;
                } else {
                    collectionSelect.value = collectionSelection;
                }
            }

            while (Object.keys(documents).length === 0) {
                await new Promise(resolve => setTimeout(resolve, dataRetrieverTime));
            }
            document.querySelector("#accordion-flush-body-2 > div > div > div").setAttribute("status", "done");

            const tableHeaderRow = document.querySelector("#read-table > thead > tr");
            const tableBody = document.querySelector("#read-table > tbody");
            tableHeaderRow.innerHTML = "";
            tableBody.innerHTML = "";

            const tableHeads = getMaxKeysObject(documents[collectionSelection]);

            // Function to create and append th elements
            const createAndAppendTHead = async (text) => {
                const thElement = document.createElement("th");
                thElement.setAttribute("scope", "col");
                thElement.textContent = text;
                thElement.classList.add("px-6", "py-3", "bg-gray-100", "font-bold", "whitespace-nowrap");

                // Append the th element to the table header row
                tableHeaderRow.appendChild(thElement);
            };

            // Use arrow function for clarity
            tableHeads.forEach(async element => {
                await createAndAppendTHead(element);
            });

            for (let index = 0; index < documents[collectionSelection].length; index++) {
                const tr = await createElement("tr", "", ["bg-white", "border-b", "text-sm", "odd:bg-white", "even:bg-gray-50"], tableBody);
                const document = documents[collectionSelection][index];

                // Iterate through table headers in the correct order
                for (const element of tableHeads) {
                    const classList = ["px-6", "py-2", "text-sm", "font-normal", "text-gray-900", "whitespace-nowrap"];
                    let value = document[element];

                    if (["_id", "createdAt", "updatedAt", "__v"].includes(element)) {
                        classList.push("disabled");

                        if (["createdAt", "updatedAt"].includes(element)) {
                            value = await formatDate(value);
                        }

                        await createElement("td", value, classList, tr);
                    } else {
                        await createElement("td", value, classList, tr);
                    }
                }
            }

            const searchInput = document.getElementById("read-search");
            const showNullCheckbox = document.getElementById("read-null");
            filterTableByKeywordAndNull(searchInput.value.toLowerCase(), showNullCheckbox.checked);
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        document.querySelector("#accordion-flush-body-2 > div > div > div").setAttribute("status", "");
    }
}

async function crudDelete(event) {
    document.querySelector("#accordion-flush-body-4 > div > div > div").setAttribute("status", "");

    if (document.querySelector("#accordion-flush-heading-4 > div").getAttribute("aria-expanded") === "true") {
        try {
            while (collections.length === 0) {
                await new Promise(resolve => setTimeout(resolve, dataRetrieverTime));
            }

            const collectionSelect = document.querySelector("#delete-collection");
            collectionSelect.innerHTML = "";
            for (const collection of collections) {
                const option = await createElement("option", collection, [], collectionSelect)
                option.setAttribute("value", collection);

                if (collectionSelection.length === 0 && collections.indexOf(collection) === 0) {
                    option.selected = true;
                    collectionSelection = collection;
                } else {
                    collectionSelect.value = collectionSelection;
                }
            }

            while (Object.keys(documents).length === 0) {
                await new Promise(resolve => setTimeout(resolve, dataRetrieverTime));
            }
            document.querySelector("#accordion-flush-body-4 > div > div > div").setAttribute("status", "done");

            const tableHeaderRow = document.querySelector("#delete-table > thead > tr");
            const tableBody = document.querySelector("#delete-table > tbody");
            tableHeaderRow.innerHTML = "";
            tableBody.innerHTML = "";

            const tableHeads = getMaxKeysObject(documents[collectionSelection]);

            // Function to create and append th elements
            const createAndAppendTHead = async (text) => {
                const thElement = document.createElement("th");
                thElement.setAttribute("scope", "col");
                thElement.textContent = text;
                thElement.classList.add("px-6", "py-3", "bg-gray-100", "font-bold", "whitespace-nowrap");

                // Append the th element to the table header row
                tableHeaderRow.appendChild(thElement);
            };

            // Use arrow function for clarity
            tableHeads.forEach(async element => {
                await createAndAppendTHead(element);
            });

            for (let index = 0; index < documents[collectionSelection].length; index++) {
                const tr = await createElement("tr", "", ["bg-white", "border-b", "text-sm", "odd:bg-white", "even:bg-gray-50"], tableBody);
                const document = documents[collectionSelection][index];

                // Iterate through table headers in the correct order
                for (const element of tableHeads) {
                    const classList = ["px-6", "py-2", "text-sm", "font-normal", "text-gray-900", "whitespace-nowrap"];
                    let value = document[element];

                    if (["_id", "createdAt", "updatedAt", "__v"].includes(element)) {
                        classList.push("disabled");

                        if (["createdAt", "updatedAt"].includes(element)) {
                            value = await formatDate(value);
                        }

                        await createElement("td", value, classList, tr);
                    } else {
                        await createElement("td", value, classList, tr);
                    }
                }
            }

            const searchInput = document.getElementById("delete-search");
            const showNullCheckbox = document.getElementById("delete-null");
            filterTableByKeywordAndNull(searchInput.value.toLowerCase(), showNullCheckbox.checked);
        } catch (error) {
            console.error('Error:', error);
        }
    } else {
        document.querySelector("#accordion-flush-body-4 > div > div > div").setAttribute("status", "");
    }
}

// Add an event listener for input changes in the search box
document.addEventListener("DOMContentLoaded", () => {
    const searchInput = document.getElementById("read-search");
    const showNullCheckbox = document.getElementById("read-null");

    searchInput.addEventListener("input", () => {
        filterTableByKeywordAndNull(searchInput.value.toLowerCase(), showNullCheckbox.checked);
    });

    // Add an event listener for changes in the "Show Null" checkbox
    showNullCheckbox.addEventListener("change", () => {
        filterTableByKeywordAndNull(searchInput.value.toLowerCase(), showNullCheckbox.checked);
    });
});

// Combined function to achieve the scenario
function filterTableByKeywordAndNull(query, showNull) {
    const tableBody = document.querySelector("#read-table > tbody");
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        let hasNull = false;
        let hasKeyword = false;

        cells.forEach((cell) => {
            // Check if cell content is null or an empty string
            if (cell.innerText.trim().toLowerCase() === "null" || cell.innerText.trim().length === 0) {
                hasNull = true;
            }

            // Check if the cell content includes the search query
            if (cell.innerText.toLowerCase().includes(query)) {
                hasKeyword = true;
            }
        });

        // Show the row only if both conditions are met
        row.style.display = showNull ? (hasNull && hasKeyword) ? "" : "none" : hasKeyword ? "" : "none";
    });
}




// Function to create HTML elements
async function createElement(tag, textContent, classes, parent) {
    return new Promise((resolve) => {
        const element = document.createElement(tag);
        element.textContent = textContent;

        if (Array.isArray(classes) && classes.length > 0) {
            element.classList.add(...classes);
        }

        if (parent) {
            parent.appendChild(element);
        }

        resolve(element);
    });
}

// Function to get keys with maximum occurrence from an array of objects
function getMaxKeysObject(arr) {
    if (arr.length === 0) {
        return null; // or handle the empty array case accordingly
    }

    // Find the object with the maximum number of keys
    const maxKeysObject = arr.reduce((maxObject, currentObject) => {
        return Object.keys(currentObject).length > Object.keys(maxObject).length ? currentObject : maxObject;
    }, arr[0]);

    // Get all keys from the object with the maximum keys
    const allKeys = Object.keys(maxKeysObject);

    return allKeys;
}

// Retrieve data from the database
async function dataRetriever() {
    try {
        const result = await getCollection();

        if (result.connection) {
            collections = result.collections;

            for (const collection of collections) {
                await getDocuments(collection).then((result, error) => {
                    if (result.connection) {
                        documents[collection] = result.documents;
                    } else {
                        console.log(`Error retrieving documents for ${collection} collection.`);
                    }
                });
            }
        } else {
            console.log(result);
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

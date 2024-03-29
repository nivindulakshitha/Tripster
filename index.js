// Declarations
var collections = [];
const documents = {};
const dataRetrieverTime = 3000;
let collectionSelection = "";

// Trigger when user clicks on the sign-in button and checks credentials with the database via IpcRenderer
document
    .querySelector("body > section:first-child > div > div:nth-child(3) > button")
    .addEventListener("click", async () => {
        // Display connecting status
        document.querySelector("#login-cover").classList.remove("hidden");
        document.querySelector("#connection-status").classList.remove("hidden");
        document.querySelector("#login-text").innerHTML = "Connecting...";
        document.querySelector("#login-area").style.filter = "blur(2px)";

        // Use object destructuring for cleaner code
        const connection = document.querySelector("#connection-string").value;
        const database = document.querySelector("#database-name").value;
        const username = document.querySelector("#login-username").value;
        const password = document.querySelector("#login-password").value;

        try {
            const result = await performDatabaseConnect(
                connection,
                database,
                username,
                password
            );

            if (result.connection) {
                // Saving data to the storage
                let connectionData = {
                    string: connection,
                    database: database,
                    username: username
                }

                Object.entries(connectionData).forEach(([key, value]) => {
                    saveLocalValue(key, value);
                });

                document.querySelector("#login-cover").classList.add("hidden");
                document.querySelector("#connection-status").classList.add("hidden");
                document.querySelector("#login-text").innerHTML = "Connecting...";
                document.querySelector("#login-area").style.filter = "none";
                document.querySelector("#connection-status").setAttribute("status", "");
                document.querySelector("#login-username").focus();
                document
                    .querySelector("body > section:nth-child(1)")
                    .classList.add("hidden");
                sectionThreeUpdater(result);
            } else {
                document
                    .querySelector("#connection-status")
                    .setAttribute("status", "error");
                document.querySelector("#login-text").innerHTML =
                    "Database sign-in error occurred.<br>Try again with correct credentials.";
            }
        } catch (error) {
            console.log("Error in database operation:", error);
        }
    });

// If user credentials are incorrect and try
document
    .querySelector("#connection-status > button")
    .addEventListener("click", () => {
        document.querySelector("#login-cover").classList.add("hidden");
        document.querySelector("#connection-status").classList.add("hidden");
        document.querySelector("#login-text").innerHTML = "Connecting...";
        document.querySelector("#login-area").style.filter = "none";
        document.querySelector("#connection-status").setAttribute("status", "");
        document.querySelector("#login-username").focus();
    });

// Perform the database connection action on Enter key press event in the sign-in form
document
    .querySelector("body > section:first-child")
    .addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
            event.preventDefault();
            document
                .querySelector(
                    "body > section:first-child > div > div:nth-child(3) > button"
                )
                .click();
        }
    });

document.addEventListener("DOMContentLoaded", () => {
    // Get focus every time when sign-in page landed
    document.querySelector("#login-username").focus();

    // Search for saved local storage data and place in inputs
    let connectionData = {
        string: "connection-string",
        database: "database-name",
        username: "login-username"
    }

    setTimeout(() => {
        Object.entries(connectionData).forEach(async ([key, use]) => {
            const data = await getLocalValue(key)

            if (data.success && data.result) {
                document.getElementById(use).value = data.result;
            }
        });
    }, 1000)

    // Check the online status every second
    setInterval(async () => {
        if (!navigator.onLine || !(await checkInternetConnection())) {
            document
                .querySelector("body > section:nth-child(3)")
                .classList.remove("hidden");
        } else {
            document
                .querySelector("body > section:nth-child(3)")
                .classList.add("hidden");
        }
    }, 1000);
});

// Function to check the internet connection is available
async function checkInternetConnection() {
    try {
        await fetch("https://www.google.com", {
            method: "HEAD",
            mode: "no-cors"
        });
        return true;
    } catch (error) {
        return false;
    }
}

// HTML Section 3 update caller
const sectionThreeUpdater = (result) => {
    updateDatabaseStatus();
    document
        .querySelector("body > section:nth-child(2)")
        .classList.remove("hidden");
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
        document.getElementById("database-storagesize").innerText =
            Math.round((result.storageSize + Number.EPSILON) * 100) / 100;
        document.getElementById("database-datasize").innerText =
            Math.round((result.dataSize + Number.EPSILON) * 100) / 100;
        document.getElementById("database-totaldocuments").innerText =
            result.objects < 10 ? "0" + result.objects : result.objects;
        document.getElementById("database-totalcollection").innerText =
            result.collections < 10 ? "0" + result.collections : result.collections;
        document.getElementById("database-indexsize").innerText =
            Math.round((result.indexSize + Number.EPSILON) * 100) / 100;
        const roleList = result.roles.map((role) => role.role);

        if (roleList.includes("atlasAdmin")) {
            document
                .querySelector("#accordion-flush-heading-1")
                .classList.remove("disabled");
            document
                .querySelector("#accordion-flush-heading-2")
                .classList.remove("disabled");
            document
                .querySelector("#accordion-flush-heading-3")
                .classList.remove("disabled");
            document
                .querySelector("#accordion-flush-heading-4")
                .classList.remove("disabled");
        } else if (roleList.includes("readWrite")) {
            document
                .querySelector("#accordion-flush-heading-1")
                .classList.remove("disabled");
            document
                .querySelector("#accordion-flush-heading-2")
                .classList.remove("disabled");
            document
                .querySelector("#accordion-flush-heading-3")
                .classList.remove("disabled");
            document
                .querySelector("#accordion-flush-heading-4")
                .classList.add("disabled");
        } else if (roleList.includes("read")) {
            document
                .querySelector("#accordion-flush-heading-1")
                .classList.add("disabled");
            document
                .querySelector("#accordion-flush-heading-2")
                .classList.remove("disabled");
            document
                .querySelector("#accordion-flush-heading-3")
                .classList.add("disabled");
            document
                .querySelector("#accordion-flush-heading-4")
                .classList.add("disabled");
        } else {
            document
                .querySelector("#accordion-flush-heading-1")
                .classList.add("disabled");
            document
                .querySelector("#accordion-flush-heading-2")
                .classList.add("disabled");
            document
                .querySelector("#accordion-flush-heading-3")
                .classList.add("disabled");
            document
                .querySelector("#accordion-flush-heading-4")
                .classList.add("disabled");
        }
    } else {
        document.getElementById("database-storagesize").innerText = "00";
        document.getElementById("database-datasize").innerText = "00";
        document.getElementById("database-totaldocuments").innerText = "00";
        document.getElementById("database-totalcollection").innerText = "00";
        document.getElementById("database-indexsize").innerText = "00";
    }
};

// For the CREATE operation
document.querySelector("#accordion-flush-body-1 > div > div > button").addEventListener("click", crudCreate);

// For the READ operation
document
    .querySelector("#accordion-flush-heading-2")
    .addEventListener("click", crudRead);
document
    .querySelector("#read-collection")
    .addEventListener("change", (event) => {
        collectionSelection = event.target.value;
        document.getElementById("read-search").value = "";
        document.getElementById("read-null").checked = false;
        crudRead();
    });

// For the UPDATE operation
document
    .querySelector("#accordion-flush-heading-3")
    .addEventListener("click", crudUpdate);
document
    .querySelector("#update-collection")
    .addEventListener("change", (event) => {
        collectionSelection = event.target.value;
        document.getElementById("update-search").value = "";
        document.getElementById("update-null").checked = false;
        crudUpdate();
    });

// For the DELETE operation
document
    .querySelector("#accordion-flush-heading-4")
    .addEventListener("click", crudDelete);
document
    .querySelector("#delete-collection")
    .addEventListener("change", (event) => {
        collectionSelection = event.target.value;
        document.getElementById("delete-search").value = "";
        crudDelete();
        document.getElementById("delete-button").innerText = `Delete`; // instead of handleDeleteCheckbox
    });

async function crudRead(event) {
    document
        .querySelector("#accordion-flush-body-2 > div > div > div")
        .setAttribute("status", "");

    if (
        document
            .querySelector("#accordion-flush-heading-2 > div")
            .getAttribute("aria-expanded") === "true"
    ) {
        try {
            while (collections.length === 0) {
                await new Promise((resolve) => setTimeout(resolve, dataRetrieverTime));
            }

            const collectionSelect = document.querySelector("#read-collection");
            collectionSelect.innerHTML = "";
            for (const collection of collections) {
                const option = await createElement(
                    "option",
                    collection,
                    [],
                    collectionSelect
                );
                option.setAttribute("value", collection);

                if (
                    collectionSelection.length === 0 &&
                    collections.indexOf(collection) === 0
                ) {
                    option.selected = true;
                    collectionSelection = collection;
                } else {
                    collectionSelect.value = collectionSelection;
                }
            }

            while (Object.keys(documents).length === 0) {
                await new Promise((resolve) => setTimeout(resolve, dataRetrieverTime));
            }
            document
                .querySelector("#accordion-flush-body-2 > div > div > div")
                .setAttribute("status", "done");

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
                thElement.classList.add(
                    "px-6",
                    "py-3",
                    "bg-gray-100",
                    "font-bold",
                    "whitespace-nowrap"
                );

                // Append the th element to the table header row
                tableHeaderRow.appendChild(thElement);
            };

            // Use arrow function for clarity
            tableHeads.forEach(async (element) => {
                await createAndAppendTHead(element);
            });

            for (
                let index = 0; index < documents[collectionSelection].length; index++
            ) {
                const tr = await createElement(
                    "tr",
                    "",
                    [
                        "bg-white",
                        "border-b",
                        "text-sm",
                        "odd:bg-white",
                        "even:bg-gray-50",
                    ],
                    tableBody
                );
                const document = documents[collectionSelection][index];

                // Iterate through table headers in the correct order
                for (const element of tableHeads) {
                    const classList = [
                        "px-6",
                        "py-2",
                        "text-sm",
                        "font-normal",
                        "text-gray-900",
                        "whitespace-nowrap",
                    ];
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
            filterTableByKeywordAndNull(
                "#read-table > tbody",
                searchInput.value.toLowerCase(),
                showNullCheckbox.checked
            );
        } catch (error) {
            console.error("Error:", error);
        }
    } else {
        document
            .querySelector("#accordion-flush-body-2 > div > div > div")
            .setAttribute("status", "");
    }
}

async function crudUpdate(event) {
    document.querySelector("#update-table > caption > div")
        .setAttribute("status", "");
    document.querySelector("#update-table > caption > form > div:nth-child(4) > div > button").innerText = `Update`;

    if (
        document
            .querySelector("#accordion-flush-heading-3 > div")
            .getAttribute("aria-expanded") === "true"
    ) {
        try {
            while (collections.length === 0) {
                await new Promise((resolve) => setTimeout(resolve, dataRetrieverTime));
            }

            const collectionSelect = document.querySelector("#update-collection");
            collectionSelect.innerHTML = "";
            for (const collection of collections) {
                const option = await createElement(
                    "option",
                    collection,
                    [],
                    collectionSelect
                );
                option.setAttribute("value", collection);

                if (
                    collectionSelection.length === 0 &&
                    collections.indexOf(collection) === 0
                ) {
                    option.selected = true;
                    collectionSelection = collection;
                } else {
                    collectionSelect.value = collectionSelection;
                }
            }

            while (Object.keys(documents).length === 0) {
                await new Promise((resolve) => setTimeout(resolve, dataRetrieverTime));
            }
            document.querySelector("#update-table > caption > div").setAttribute("status", "done");

            const tableHeaderRow = document.querySelector("#update-table > thead > tr");
            const tableBody = document.querySelector("#update-table > tbody");
            tableHeaderRow.innerHTML = "";
            tableBody.innerHTML = "";

            const tableHeads = getMaxKeysObject(documents[collectionSelection]);

            // Function to create and append th elements
            const createAndAppendTHead = async (text) => {
                const thElement = document.createElement("th");
                thElement.setAttribute("scope", "col");
                thElement.textContent = text;
                thElement.classList.add(
                    "px-6",
                    "py-3",
                    "bg-gray-100",
                    "font-bold",
                    "whitespace-nowrap"
                );

                // Append the th element to the table header row
                tableHeaderRow.appendChild(thElement);
            };

            // Use arrow function for clarity
            tableHeads.forEach(async (element) => {
                await createAndAppendTHead(element);
            });

            for (
                let index = 0; index < documents[collectionSelection].length; index++
            ) {
                const tr = await createElement(
                    "tr",
                    "",
                    [
                        "bg-white",
                        "border-b",
                        "text-sm",
                        "odd:bg-white",
                        "even:bg-gray-50",
                    ],
                    tableBody
                );
                const collectionDocument = documents[collectionSelection][index];

                // Iterate through table headers in the correct order
                for (const element of tableHeads) {
                    const classList = [
                        "px-6",
                        "py-2",
                        "text-sm",
                        "font-normal",
                        "text-gray-900",
                        "whitespace-nowrap",
                    ];
                    let value = collectionDocument[element];

                    if (["_id", "createdAt", "updatedAt", "__v"].includes(element)) {
                        classList.push("disabled");

                        if (["createdAt", "updatedAt"].includes(element)) {
                            value = await formatDate(value);
                        }

                        await createElement("td", value, classList, tr);
                    } else {
                        const tdElement = await createElement("td", value, classList, tr);
                        tdElement.contentEditable = true;
                        tdElement.setAttribute("spellcheck", "false");
                        tdElement.setAttribute("field", element);
                        tdElement.setAttribute("id", collectionDocument["_id"]);


                        tdElement.addEventListener("input", function () {
                            this.textContent = this.textContent.replace(/\n/g, ' ');
                            this.setAttribute("collection", collectionSelection);
                            this.setAttribute("edited", "true");

                            editedElements = document.querySelectorAll("#update-table tbody tr td[edited=true]").length;
                            document.querySelector("#update-table > caption > form > div:nth-child(4) > div > button").innerText = `Update (${editedElements})`;
                        });
                    }
                }
            }

            const searchInput = document.getElementById("update-search");
            const showNullCheckbox = document.getElementById("update-null");
            filterTableByKeywordAndNull(
                "#update-table > tbody",
                searchInput.value.toLowerCase(),
                showNullCheckbox.checked
            );
        } catch (error) {
            console.error("Error:", error);
        }
    } else {
        document
            .querySelector("#accordion-flush-body-3 > div > div > div")
            .setAttribute("status", "");
    }
}

async function crudDelete(event) {
    document
        .querySelector("#delete-table > caption > div")
        .setAttribute("status", "");
    document.querySelector("#delete-text").innerHTML = "Retrieving data...";

    if (
        document
            .querySelector("#accordion-flush-heading-4 > div")
            .getAttribute("aria-expanded") === "true"
    ) {
        try {
            while (collections.length === 0) {
                await new Promise((resolve) => setTimeout(resolve, dataRetrieverTime));
            }

            const collectionSelect = document.querySelector("#delete-collection");
            collectionSelect.innerHTML = "";
            for (const collection of collections) {
                const option = await createElement(
                    "option",
                    collection,
                    [],
                    collectionSelect
                );
                option.setAttribute("value", collection);

                if (
                    collectionSelection.length === 0 &&
                    collections.indexOf(collection) === 0
                ) {
                    option.selected = true;
                    collectionSelection = collection;
                } else {
                    collectionSelect.value = collectionSelection;
                }
            }

            while (Object.keys(documents).length === 0) {
                await new Promise((resolve) => setTimeout(resolve, dataRetrieverTime));
            }
            document
                .querySelector("#delete-table > caption > div")
                .setAttribute("status", "done");
            document.querySelector("#delete-text").innerHTML = "Retrieving data...";

            const tableHeaderRow = document.querySelector(
                "#delete-table > thead > tr"
            );
            const tableBody = document.querySelector("#delete-table > tbody");
            tableHeaderRow.innerHTML = "";
            tableBody.innerHTML = "";

            let tableHeads = getMaxKeysObject(documents[collectionSelection]);
            tableHeads.splice(0, 0, "select");

            // Function to create and append th elements
            const createAndAppendTHead = async (text) => {
                const thElement = document.createElement("th");
                thElement.setAttribute("scope", "col");
                thElement.textContent = text;
                thElement.classList.add(
                    "px-6",
                    "py-3",
                    "bg-gray-100",
                    "font-bold",
                    "whitespace-nowrap"
                );

                // Append the th element to the table header row
                tableHeaderRow.appendChild(thElement);
            };

            // Use arrow function for clarity
            tableHeads.forEach(async (element) => {
                await createAndAppendTHead(element);
            });

            for (
                let index = 0; index < documents[collectionSelection].length; index++
            ) {
                const tr = await createElement(
                    "tr",
                    "",
                    [
                        "bg-white",
                        "border-b",
                        "text-sm",
                        "odd:bg-white",
                        "even:bg-gray-50",
                    ],
                    tableBody
                );
                const document = documents[collectionSelection][index];
                tr.id = document["_id"];

                // Iterate through table headers in the correct order
                for (const element of tableHeads) {
                    const classList = [
                        "px-6",
                        "py-2",
                        "text-sm",
                        "font-normal",
                        "text-gray-900",
                        "whitespace-nowrap",
                    ];
                    let value = document[element];

                    if (["_id", "createdAt", "updatedAt", "__v"].includes(element)) {
                        classList.push("disabled");

                        if (["createdAt", "updatedAt"].includes(element)) {
                            value = await formatDate(value);
                        }

                        await createElement("td", value, classList, tr);
                    } else {
                        if ("select" == element) {
                            const td = await createElement("td", "", classList, tr);
                            let checkbox = await createElement(
                                "input",
                                "",
                                [
                                    "w-4",
                                    "h-4",
                                    "text-red-600",
                                    "bg-gray-100",
                                    "border-gray-300",
                                    "rounded",
                                ],
                                td
                            );
                            checkbox.id = document["_id"];
                            checkbox.onclick = handleDeleteCheckbox;
                            checkbox.setAttribute("type", "checkbox");
                        } else {
                            await createElement("td", value, classList, tr);
                        }
                    }
                }
            }

            const searchInput = document.getElementById("delete-search");
            filterTableByKeywordAndNull(
                "#delete-table > tbody",
                searchInput.value.toLowerCase(),
                false
            );
        } catch (error) {
            console.error("Error:", error);
        }
    } else {
        document
            .querySelector("#delete-table > caption > div")
            .setAttribute("status", "");
        document.querySelector("#delete-text").innerHTML = "Retrieving data...";
    }
}

async function crudCreate(event) {
    const loadingComponent = document.querySelector("#accordion-flush-body-1 > div > div > div");
    const loadingText = document.querySelector("#create-text");

    loadingComponent.setAttribute("status", "");
    loadingText.innerText = "Opening the data file";

    const file = await openDataFile();

    if (!file) {
        loadingComponent.setAttribute("status", "error");
        loadingText.innerHTML = `No any file was selected to be proceed`;
        return;
    }

    loadingText.innerText = "Reading the content of data file";

    let result = await readOpenedDataFile(file);

    if (result.success) {
        loadingText.innerText = "Uploading to the database";

        result = await uploadReadDataFile(result.data);

        if (result.success) {
            loadingText.innerText = `${result.data} documents uploaded to the database`;
            setTimeout(() => {
                loadingComponent.setAttribute("status", "done");
                loadingText.innerText = "";
            }, 2000);
        } else {
            loadingComponent.setAttribute("status", "error");
            loadingText.innerHTML = `Something went wrong when uploading. See log below.<br>${result.data}`;
        }
    } else {
        loadingComponent.setAttribute("status", "error");
        loadingText.innerHTML = `Something went wrong when uploading. See log below.<br>${result.data}`;
    }
}

async function templateDesigner() {
    try {
        while (collections.length === 0) {
            await new Promise((resolve) => setTimeout(resolve, dataRetrieverTime));
        }

    } catch (error) {
        console.error("Error:", error);
    }
}

function handleDeleteCheckbox() {
    const tableBody = document.querySelector("#delete-table > tbody");
    const rows = tableBody.querySelectorAll("tr");

    const checkedIds = [];

    rows.forEach((row) => {
        const checkbox = row.querySelector("input[type='checkbox']");

        if (checkbox && checkbox.checked) {
            checkedIds.push(checkbox.id);
        }
    });

    if (checkedIds.length > 0) {
        document.getElementById(
            "delete-button"
        ).innerText = `Delete (${checkedIds.length})`;
    } else {
        document.getElementById("delete-button").innerText = `Delete`;
    }

    return checkedIds;
}

// Add an event listener for input changes
document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("read-search").addEventListener("input", () => {
        filterTableByKeywordAndNull(
            "#read-table > tbody",
            document.getElementById("read-search").value.toLowerCase(),
            document.getElementById("read-null").checked
        );
    });
    document.getElementById("delete-search").addEventListener("input", () => {
        filterTableByKeywordAndNull(
            "#delete-table > tbody",
            document.getElementById("delete-search").value.toLowerCase(),
            false,
            document.getElementById("delete-selected").checked
        );
    });

    document.getElementById("update-search").addEventListener("input", () => {
        filterTableByKeywordAndNull(
            "#update-table > tbody",
            document.getElementById("update-search").value.toLowerCase(),
            document.getElementById("update-null").checked
        );
    });

    document.getElementById("update-null").addEventListener("change", () => {
        filterTableByKeywordAndNull(
            "#update-table > tbody",
            document.getElementById("update-search").value.toLowerCase(),
            document.getElementById("update-null").checked
        );
    });

    // Add an event listener for changes in the "Show Null" checkbox
    document.getElementById("read-null").addEventListener("change", () => {
        filterTableByKeywordAndNull(
            "#read-table > tbody",
            document.getElementById("read-search").value.toLowerCase(),
            document.getElementById("read-null").checked
        );
    });

    document.getElementById("delete-selected").addEventListener("change", () => {
        filterTableByKeywordAndNull(
            "#delete-table > tbody",
            document.getElementById("delete-search").value.toLowerCase(),
            false,
            document.getElementById("delete-selected").checked
        );
    });

    // Add an event listener for documents delete option
    document
        .getElementById("delete-button")
        .addEventListener("click", async () => {
            const checkedIds = handleDeleteCheckbox();
            if (checkedIds.length === 0) {
                return;
            }

            document
                .querySelector("#delete-table > caption > div")
                .setAttribute("status", "");
            document.querySelector("#delete-text").innerHTML =
                "Deleting requested documents...";

            const result = await deleteDocuments(collectionSelection, checkedIds);

            if (result.success) {
                document.querySelector(
                    "#delete-text"
                ).innerHTML = `${result.deletedCount} document(s) were deleted.`;
                setTimeout(() => {
                    crudDelete();
                    document
                        .querySelector("#delete-table > caption > div")
                        .setAttribute("status", "done");
                    document.querySelector("#delete-text").innerHTML =
                        "Retrieving data...";
                    document.getElementById("delete-button").innerText = `Delete`;
                    document.getElementById("delete-search").value = "";
                    document.getElementById("delete-selected").checked = false;
                }, 2000);
            } else {
                document
                    .querySelector("#delete-table > caption > div")
                    .setAttribute("status", "error");
                document.querySelector("#delete-text").innerHTML =
                    "Documents deletion error occurred.<br>Try again with re-connecting to the database.";
            }
        });

    document
        .querySelector("#delete-table > caption > div > button")
        .addEventListener("click", () => {
            document
                .querySelector("#delete-table > caption > div")
                .setAttribute("status", "done");
            document.querySelector("#delete-text").innerHTML = "Retrieving data...";
        });

    // Handle database structure download
    document.getElementById("structure-download").addEventListener("click", async () => {
        await downloadStructure(documents);
    })

    document.querySelector("#accordion-flush-body-1 > div > div > div > button").addEventListener("click", () => {
        document.querySelector("#accordion-flush-body-1 > div > div > div").setAttribute("status", "done");;
        document.querySelector("#create-text").innerHTML = "";
    })

    // Handle data update function
    document.querySelector("#update-table > caption > form > div:nth-child(4) > div > button").addEventListener("click", () => {
        const loadingComponent = document.querySelector("#update-table > caption > div");

        if (loadingComponent.getAttribute("status") !== "") {
            updateData();
        }
    })
    async function updateData() {
        const loadingComponent = document.querySelector("#update-table > caption > div");
        loadingComponent.setAttribute("status", "");
        const loadingText = document.querySelector("#update-text");
        loadingText.innerHTML = "Fetching changes.";

        const changes = document.querySelectorAll("#update-table tbody tr td[edited=true]");
        const copiedObject = { ...documents };

        for (const change of changes) {
            let collection = change.getAttribute("collection");
            let field = change.getAttribute("field");
            let id = change.getAttribute("id");
            let value = change.innerText;

            for (const [collectionKey, documentsKey] of Object.entries(documents)) {
                for (const document of documentsKey) {
                    // Extract the _id and other fields from the document
                    const { _id, ...updateFields } = document;

                    if (_id == id) {
                        copiedObject[collection][documentsKey.indexOf(document)][field] = value;
                        break;
                    }
                }
            }
        }

        loadingText.innerHTML = "Making changes to the database";

        const result = await setUpdations(copiedObject);

        if (result.success) {
            loadingText.innerHTML = `${result.data} value(s) were modified.`;
            setTimeout(() => {
                loadingComponent.setAttribute("status", "done");
                loadingText.innerText = "";
                crudUpdate();
            }, 2000);
        } else {
            loadingComponent.setAttribute("status", "error");
            loadingText.innerHTML = `Something went wrong when updating. See log below.<br>${result.data}`;
        }
    }

});

// Combined function to filter the data table
function filterTableByKeywordAndNull(
    table,
    query,
    showNull,
    selectedOnly = false
) {
    const tableBody = document.querySelector(table);
    const rows = tableBody.querySelectorAll("tr");

    rows.forEach((row) => {
        const cells = row.querySelectorAll("td");
        let hasNull = false;
        let hasKeyword = false;

        cells.forEach((cell) => {
            // Check if cell content is null or an empty string
            if (cell.innerText.trim().length === 0) {
                hasNull = true;
            }

            // Check if the cell content includes the search query
            if (cell.innerText.toLowerCase().includes(query)) {
                hasKeyword = true;
            }
        });

        // Check if the row has a checkbox
        const hasCheckbox = row.querySelector("input[type='checkbox']");

        if (hasCheckbox) {
            // Check if the row is selected
            const isSelected = hasCheckbox.checked;

            row.style.display = selectedOnly ?
                isSelected && (showNull ? hasNull && hasKeyword : hasKeyword) ?
                    "" :
                    "none" :
                (showNull ? hasNull && hasKeyword : hasKeyword) ?
                    "" :
                    "none";
        } else {
            // If there is no checkbox, show the row based on the null and keyword conditions
            row.style.display = (showNull ? hasNull && hasKeyword : hasKeyword) ?
                "" :
                "none";
        }
    });
}

// Function to create HTML elements
async function createElement(tag, textContent, classes, parent) {
    return new Promise((resolve) => {
        const element = document.createElement(tag);
        element.innerHTML = textContent;

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
        return Object.keys(currentObject).length > Object.keys(maxObject).length ?
            currentObject :
            maxObject;
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
                        console.log(
                            `Error retrieving documents for ${collection} collection.`
                        );
                    }
                });
            }
        } else {
            console.log(result);
        }
    } catch (error) {
        console.error("Error:", error);
    }
}
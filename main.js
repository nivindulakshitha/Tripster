const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const xlsx = require("xlsx")
const util = require('util');
const os = require('os');
const path = require('path');
const { MongoClient, ObjectId } = require('mongodb');
const mongoose = require('mongoose');
const excel = require("excel4node");

require("electron-reloader")(module);

let adminPro, database, username, password, mongoClient;

function createWindow() {
    adminPro = new BrowserWindow({
        height: 700,
        width: 1000,
        minHeight: 700,
        minWidth: 1000,
        backgroundColor: "#FFFFFF",
        minimizable: false,
        maximizable: false,
        resizable: false,
        disableAutoHideCursor: true,
        title: "MongoDB Atlas | AdminPro",
        icon: path.join(__dirname, 'favicon.ico'),
        webPreferences: {
            contextIsolation: true,
            nodeIntegration: true,
            preload: path.join(__dirname, 'preload.js'),
        },
    })

    adminPro.setMenuBarVisibility(false);
    adminPro.loadFile('index.html');
    adminPro.webContents.openDevTools();
}

app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

ipcMain.handle('database-connect', async (event, data) => {
    try {
        database = data.database;
        username = data.username;
        password = data.password;
        mongoClient = await connectToMongo();
        return getDatabaseDetails();
    } catch (error) {
        const details = {
            connection: false,
            error: error
        };
        return details;
    }
});

ipcMain.handle('database-details', async () => {
    return getDatabaseDetails();
});

ipcMain.handle('database-collections', async () => {
    return getCollection();
});

ipcMain.handle('collection-documents', async (event, data) => {
    return getDocuments(data.collection);
});

ipcMain.handle('delete-documents', async (event, data) => {
    return deleteDocuments(data.collection, data.documents);
});

ipcMain.handle('download-excel', async (event, data) => {
    return generateExcelFile(data.documents);
});

ipcMain.handle('upload-excel', async (event) => {
    return uploadExcelFile();
});

ipcMain.handle('read-excel', async (event, data) => {
    return readExcelFile(data.file);
})

ipcMain.handle('upload-data', async (event, data) => {
    return submitToMongoDB(data.documents);
})

async function connectToMongo() {
    try {
        return await MongoClient.connect(`mongodb+srv://${username}:${password}@cluster.jnlrnoz.mongodb.net/?retryWrites=true&w=majority`, {});
    } catch (error) {
        console.error('Error connecting to MongoDB:', error);
        throw error;
    }
}

async function getDatabaseDetails() {
    try {
        const Db = mongoClient.db(database);
        const currentUser = await Db.command({ connectionStatus: 1 });
        const userRoles = currentUser.authInfo.authenticatedUserRoles;

        await mongoose.connect(`mongodb+srv://${username}:${password}@cluster.jnlrnoz.mongodb.net/?retryWrites=true&w=majority`, {
            dbName: database,
        });

        const dbStats = await mongoose.connection.db.stats();

        const details = {
            objects: dbStats.objects,
            collections: dbStats.collections,
            avgObjSizeBytes: dbStats.avgObjSize,
            dataSize: dbStats.dataSize / 1024,
            storageSize: dbStats.storageSize / (1024 ** 2),
            indexSize: dbStats.indexSize / (1024 ** 2),
            connection: true,
            roles: userRoles
        };

        return details;
    } catch (error) {
        console.error('Error getting database details:', error);
        return { connection: false };
    }
}

async function getCollection() {
    try {
        const collections = await mongoose.connection.db.listCollections().toArray();
        const collectionNames = collections.map(collection => collection.name);
        return { connection: true, collections: collectionNames };
    } catch (error) {
        console.error('Error getting database details:', error);
        return { connection: false };
    }
}

async function getDocuments(collectionName) {
    try {
        const db = mongoClient.db(database);
        const collection = db.collection(collectionName);
        const query = {};
        const documents = await collection.find(query).toArray();

        const modifiedDocuments = documents.map(doc => {
            doc._id = doc._id.toString();
            return doc;
        });

        return { connection: true, documents: modifiedDocuments };
    } catch (error) {
        console.error('Error getting database details:', error);
        return { connection: false };
    }
}

async function deleteDocuments(collectionName, documentIds) {
    try {
        const db = mongoClient.db(database);
        const collection = db.collection(collectionName);

        // Convert string IDs to ObjectId
        const objectIds = documentIds.map(id => new ObjectId(id));

        // Delete documents by IDs
        let deletedCount = 0;
        let result = await collection.deleteMany({ _id: { $in: documentIds } });
        deletedCount += result.deletedCount

        result = await collection.deleteMany({ _id: { $in: objectIds } });
        deletedCount += result.deletedCount

        return { success: true, deletedCount: deletedCount };
    } catch (error) {
        console.error('Error deleting documents:', error);
        return { success: false, error: error.message };
    }
}

const writeWorkbookAsync = util.promisify((wb, outputPath, callback) => {
    wb.write(outputPath, callback);
});

async function generateExcelFile(data) {
    // Create a new workbook
    const wb = new excel.Workbook();

    const heads = Object.keys(data);
    heads.forEach(head => {
        let sheet = wb.addWorksheet(head);

        // Add headers to the sheet
        const rows = Object.keys(data[head]);
        for (const row of rows) {
            const columns = Object.keys(data[head][row]);
            columns.forEach(column => {
                sheet.cell(1, columns.indexOf(column) + 1).string(column);
            });
        }
    });

    // Save the workbook to the user's documents folder
    const outputPath = path.join(os.homedir(), 'Desktop', `${database}.xlsx`);

    try {
        await writeWorkbookAsync(wb, outputPath);
    } catch (err) {
        console.error(err);
    }
}

function uploadExcelFile() {
    adminPro.setIgnoreMouseEvents(true);
    const files = dialog.showOpenDialogSync({
        title: 'Select data inclueded Excel file',
        defaultPath: path.join(os.homedir(), 'Desktop'),
        buttonLabel: 'Load Excel File',
        properties: ['openFile'],
        filters: [
            { name: 'Excel Files', extensions: ['xlsx'] }
        ],
    });

    if (files) {
        const filePath = files[0];
        adminPro.setIgnoreMouseEvents(false);
        return filePath;
    } else {
        adminPro.setIgnoreMouseEvents(false);
        return [];
    }
}

function readExcelFile(filePath) {
    try {
        const workbook = xlsx.readFile(filePath);
        const sheetNames = workbook.SheetNames;

        const data = {};

        sheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const sheetData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

            // Exclude the header row from the data
            const [header, ...rows] = sheetData;

            // Map rows to objects using headers
            const formattedData = rows.map((row) => {
                const formattedRow = {};
                header.forEach((column, index) => {
                    switch (column) {
                        case "_id": {
                            formattedRow[column] = new ObjectId().toString();
                            break;
                        }

                        case "createdAt": {
                            const currentDate = new Date();

                            const options = {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZoneName: 'short',
                            };
                            formattedRow[column] = currentDate.toLocaleString('en-US', options);
                            break;

                        }

                        case "updatedAt": {
                            const currentDate = new Date();

                            const options = {
                                weekday: 'short',
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit',
                                timeZoneName: 'short',
                            };
                            formattedRow[column] = currentDate.toLocaleString('en-US', options);
                            break;

                        }

                        case "__v": {
                            formattedRow[column] = 0;
                            break;
                        }

                        default: {
                            formattedRow[column] = row[index];
                        }
                    }
                });
                return formattedRow;
            });

            data[sheetName.toLowerCase()] = formattedData;
        });

        return { success: true, data: data };
    } catch (error) {
        return { success: false, data: error };
    }
}

// ... (existing code)

async function submitToMongoDB(data) {
    try {
        await connectToMongo(); // Ensure the MongoDB connection is established

        let documentsCount = 0;
        let result;

        for (const collection of Object.keys(data)) {
            const result = await insertDocuments(collection, data[collection]);

            if (result.success) {
                documentsCount += result.data;
            } else {
                return { success: false, data: result.data };
            }
        }

        return { success: true, data: documentsCount };

    } catch (error) {
        console.error('Error submitting documents to MongoDB:', error);
        return { success: false, data: error }
    }
}

async function insertDocuments(collectionName, documents) {
    try {
        const db = mongoClient.db(database);
        const collection = db.collection(collectionName);
        const result = await collection.insertMany(documents);

        return { success: true, data: result.insertedCount }
    } catch (error) {
        return { success: false, data: error }
    }
}
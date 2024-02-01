const { app, BrowserWindow, ipcMain } = require('electron');
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
    mongoClient.close();
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
        const result = await collection.deleteMany({ _id: { $in: objectIds } });

        return { success: true, deletedCount: result.deletedCount };
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
        console.log(`Excel file saved to: ${outputPath}`);
    } catch (err) {
        console.error(err);
    }
}
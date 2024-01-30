const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { MongoClient } = require('mongodb');
const mongoose = require('mongoose');

require("electron-reloader")(module);

let adminPro, username, password, mongoClient;

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
        const Db = mongoClient.db('WAD_DB');
        const currentUser = await Db.command({ connectionStatus: 1 });
        const userRoles = currentUser.authInfo.authenticatedUserRoles;

        await mongoose.connect(`mongodb+srv://${username}:${password}@cluster.jnlrnoz.mongodb.net/?retryWrites=true&w=majority`, {
            dbName: 'WAD_DB',
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
        const database = mongoClient.db('WAD_DB');
        const collection = database.collection(collectionName);
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

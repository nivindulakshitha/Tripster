let performDatabaseConnect;
let getDatabaseDetails;
let getCollection;
let getDocuments;
let formatDate;
let deleteDocuments;
let downloadStructure;
let openDataFile;
let readOpenedDataFile;
let uploadReadDataFile;

setTimeout(() => {
    const { ipcRenderer, dateFns } = window.electronAPI;

    if (ipcRenderer) {
        performDatabaseConnect = async (database, username, password) => {
            try {
                return result = await ipcRenderer.invoke('database-connect', { database: database, username: username, password: password });
            } catch (error) {
                console.log("Error in database operation:", error);
            }
        };

        getDatabaseDetails = async () => {
            try {
                return result = await ipcRenderer.invoke('database-details', {});
            } catch (error) {
                console.log("Error in database operation:", error);
            }
        };

        getCollection = async () => {
            try {
                return result = await ipcRenderer.invoke('database-collections', {});
            } catch (error) {
                console.log("Error in database operation:", error);
            }
        }

        getDocuments = async (collection) => {
            try {
                if (collection.length < 1) {
                    return { connection: false, documents: {} }
                } else {
                    return result = await ipcRenderer.invoke('collection-documents', { collection: collection });
                }
            } catch (error) {
                console.log("Error in database operation:", error);
            }
        }

        deleteDocuments = async (collection, documents) => {
            try {
                return result = await ipcRenderer.invoke('delete-documents', { collection: collection, documents: documents });
            } catch (error) {
                console.log("Error in database operation:", error);
            }
        }

        downloadStructure = async (data) => {
            try {
                await ipcRenderer.invoke('download-excel', { documents: data });
            } catch (error) {
                console.log("Error in saving database structure file:", error);
            }
        }

        openDataFile = async () => {
            try {
                return result = await ipcRenderer.invoke('upload-excel', {});
            } catch (error) {
                console.log("Error in uploading database structure file:", error);
            }
        }

        readOpenedDataFile = async (filePath) => {
            try {
                return result = await ipcRenderer.invoke('read-excel', { file: filePath });
            } catch (error) {
                console.log("Error in reading database structure file:", error);
            }
        }

        uploadReadDataFile = async (data) => {
            try {
                return await ipcRenderer.invoke('upload-data', { documents: data });
            } catch (error) {
                console.log("Error in reading database structure file:", error);
            }
        }
    }

    if (dateFns) {
        formatDate = async (dateString) => {
            const dateObject = await new Date(dateString);
            const timeAgoString = await dateFns.formatDistanceToNow(dateObject, { addSuffix: true });

            return timeAgoString
        }
    }
}, 100);


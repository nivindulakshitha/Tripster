let performDatabaseConnect;
let getDatabaseDetails;
let getCollection;
let getDocuments;
let formatDate;

setTimeout(() => {
    const { ipcRenderer, dateFns } = window.electronAPI;

    if (ipcRenderer) {
        performDatabaseConnect = async (username, password) => {
            try {
                return result = await ipcRenderer.invoke('database-connect', { username: username, password: password });
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
    }

    if (dateFns) {
        formatDate = async (dateString) => {
            const dateObject = await new Date(dateString);
            const timeAgoString = await dateFns.formatDistanceToNow(dateObject, { addSuffix: true });

            return timeAgoString
        }
    }
}, 100);


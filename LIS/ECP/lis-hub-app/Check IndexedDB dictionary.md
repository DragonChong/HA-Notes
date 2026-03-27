# Create Function
```javascript
function findInIndexedDB(dbName, storeName, keyName, arrayPropName, searchCallback) {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName);

    // 1. Catch if the database is locked by DevTools
    request.onblocked = () => {
      reject("Database is blocked. Try closing the 'Application' tab or refreshing the page.");
    };

    request.onerror = (event) => {
      reject(`Database error: ${event.target.error}`);
    };

    request.onsuccess = (event) => {
      const db = event.target.result;
      
      try {
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const getRequest = objectStore.get(keyName);

        getRequest.onerror = (event) => {
          db.close(); // Always close connection
          reject(`Error fetching key: ${event.target.error}`);
        };

        getRequest.onsuccess = (event) => {
          db.close(); // Always close connection
          
          const data = event.target.result;
          if (data && data[arrayPropName] && Array.isArray(data[arrayPropName])) {
            const result = data[arrayPropName].filter(searchCallback);
            resolve(result);
          } else {
            reject(`Array '${arrayPropName}' not found in key '${keyName}'.`);
          }
        };
      } catch (err) {
         db.close();
         reject(`Transaction error: ${err.message}`);
      }
    };
  });
}
```

# Call Function
```javascript

```
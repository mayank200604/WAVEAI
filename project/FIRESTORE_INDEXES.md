# Firestore Indexes Required

The app requires the following Firestore indexes to work properly. You can create them by:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `wave-ad270`
3. Go to Firestore Database > Indexes
4. Create the following composite indexes:

## Required Indexes:

### 1. CHAT_HISTORY Collection
- **Collection ID**: `CHAT_HISTORY`
- **Fields to index**:
  - `userId` (Ascending)
  - `timestamp` (Descending)
- **Query scope**: Collection

### 2. GRAVEYARD Collection  
- **Collection ID**: `GRAVEYARD`
- **Fields to index**:
  - `userId` (Ascending)
  - `createdAt` (Descending)
- **Query scope**: Collection

### 3. PROJECTS Collection
- **Collection ID**: `PROJECTS`
- **Fields to index**:
  - `userId` (Ascending) 
  - `createdAt` (Descending)
- **Query scope**: Collection

## Alternative: Use the Firebase CLI

You can also create these indexes using the Firebase CLI:

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Create `firestore.indexes.json` in your project root with the content below
4. Deploy: `firebase deploy --only firestore:indexes`

```json
{
  "indexes": [
    {
      "collectionGroup": "CHAT_HISTORY",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "timestamp",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "GRAVEYARD",
      "queryScope": "COLLECTION", 
      "fields": [
        {
          "fieldPath": "userId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "PROJECTS",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "userId", 
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

## Note
Until these indexes are created, the app will work but user data (chat history, ideas, projects) won't load. The app will show empty data with appropriate placeholders.

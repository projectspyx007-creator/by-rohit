
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

const db = admin.firestore();

/**
 * Creates a notification in each opted-in user's subcollection when a new notice is created.
 * Handles batching for large user counts and ensures only users with notifications: true receive one.
 */
export const createNotificationOnNewNotice = functions.firestore
  .document("notices/{noticeId}")
  .onCreate(async (snap, context) => {
    const notice = snap.data();
    if (!notice) {
      functions.logger.log("No data associated with the notice creation event.");
      return;
    }

    const noticeTitle = notice.title || "New Announcement";
    const { noticeId } = context.params;

    try {
      // Query for users who have explicitly opted-in to notifications.
      const usersSnapshot = await db.collection("users").where("notifications", "==", true).get();
      
      if (usersSnapshot.empty) {
        functions.logger.log("No users with notifications enabled found.");
        return;
      }

      // Firestore batch writes are limited to 500 operations.
      // We process users in chunks to stay within this limit.
      const MAX_BATCH_SIZE = 499; 
      const userDocs = usersSnapshot.docs;
      const chunks = [];
      for (let i = 0; i < userDocs.length; i += MAX_BATCH_SIZE) {
        chunks.push(userDocs.slice(i, i + MAX_BATCH_SIZE));
      }

      let totalNotifications = 0;

      // Process each chunk as a separate batch
      for (const chunk of chunks) {
        const batch = db.batch();
        chunk.forEach((userDoc) => {
          const userId = userDoc.id;
          // Create a new document in the user's 'notifications' subcollection.
          const notificationRef = db
            .collection("users")
            .doc(userId)
            .collection("notifications")
            .doc(); // Auto-generate a unique ID for the notification.

          batch.set(notificationRef, {
            userId: userId,
            type: "new_notice",
            title: `New Notice: ${noticeTitle}`,
            read: false,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            relatedEntityId: noticeId, // Link notification back to the notice.
          });
        });
        await batch.commit();
        totalNotifications += chunk.length;
      }

      functions.logger.log(
        `Successfully created notifications for ${totalNotifications} users for notice ${noticeId}.`
      );

    } catch (error) {
      functions.logger.error(
        `Error creating notifications for new notice ${noticeId}:`,
        error
      );
    }
  });
